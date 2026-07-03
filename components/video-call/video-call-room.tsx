"use client";

import * as React from "react";
import Link from "next/link";
import { Camera, CameraOff, LogOut, Mic, MicOff, MonitorUp, RotateCcw, SendHorizonal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SignalMessage =
  | { type: "offer"; sdp: RTCSessionDescriptionInit; senderId: string; sentAt: string }
  | { type: "answer"; sdp: RTCSessionDescriptionInit; senderId: string; sentAt: string }
  | { type: "ice"; candidate: RTCIceCandidateInit; senderId: string; sentAt: string }
  | { type: "chat"; text: string; senderId: string; sentAt: string }
  | { type: "presence"; status: "waiting" | "active" | "ended"; senderId: string; sentAt: string };

type ChatMessage = {
  id: string;
  text: string;
  mine: boolean;
  sentAt: string;
};

export function VideoCallRoom({ roomId }: { roomId: string }) {
  const localVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const localStreamRef = React.useRef<MediaStream | null>(null);
  const peerRef = React.useRef<RTCPeerConnection | null>(null);
  const channelRef = React.useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const isInitiatorRef = React.useRef(false);
  const senderId = React.useMemo(() => crypto.randomUUID(), []);

  const [status, setStatus] = React.useState<"prejoin" | "waiting" | "active" | "reconnecting" | "failed" | "ended">("prejoin");
  const [error, setError] = React.useState<string | null>(null);
  const [micEnabled, setMicEnabled] = React.useState(true);
  const [cameraEnabled, setCameraEnabled] = React.useState(true);
  const [chatInput, setChatInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  const broadcast = React.useCallback((payload: SignalMessage) => {
    void channelRef.current?.send({ type: "broadcast", event: "signal", payload });
  }, []);

  const attachLocalStream = React.useCallback((stream: MediaStream) => {
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  }, []);

  const createPeer = React.useCallback(() => {
    const peer = new RTCPeerConnection({
      iceServers: process.env.NEXT_PUBLIC_TURN_SERVER_URL
        ? [{ urls: process.env.NEXT_PUBLIC_TURN_SERVER_URL }]
        : [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = ({ candidate }) => {
      if (candidate) {
        broadcast({ type: "ice", candidate: candidate.toJSON(), senderId, sentAt: new Date().toISOString() });
      }
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (remoteVideoRef.current && stream) remoteVideoRef.current.srcObject = stream;
      setStatus("active");
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "disconnected") setStatus("reconnecting");
      if (peer.connectionState === "failed") setStatus("failed");
      if (peer.connectionState === "connected") setStatus("active");
    };

    peerRef.current = peer;
    return peer;
  }, [broadcast, senderId]);

  const startCall = React.useCallback(async (peer: RTCPeerConnection) => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    broadcast({ type: "offer", sdp: offer, senderId, sentAt: new Date().toISOString() });
  }, [broadcast, senderId]);

  const startDeviceCheck = React.useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      attachLocalStream(stream);
      setStatus("waiting");

      // If peer already exists (reconnect scenario), add tracks
      if (peerRef.current) {
        stream.getTracks().forEach((track) => peerRef.current!.addTrack(track, stream));
      }
    } catch {
      setError("Camera or microphone permission was blocked. Enable permissions to join the consultation.");
      setStatus("failed");
    }
  }, [attachLocalStream]);

  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`call-room:${roomId}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "signal" }, async ({ payload }: { payload: SignalMessage }) => {
        if (payload.senderId === senderId) return;
        const peer = peerRef.current;

        if (payload.type === "presence") {
          if (payload.status === "waiting" && localStreamRef.current) {
            // Remote peer joined — we become initiator and send offer
            isInitiatorRef.current = true;
            const p = createPeer();
            await startCall(p);
          }
          if (payload.status === "active") {
            setStatus((current) => (current === "waiting" ? "active" : current));
          }
          if (payload.status === "ended") {
            setStatus("ended");
          }
        }

        if (payload.type === "offer" && peer) {
          await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const stream = localStreamRef.current;
          if (stream) stream.getTracks().forEach((track) => peer.addTrack(track, stream));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          broadcast({ type: "answer", sdp: answer, senderId, sentAt: new Date().toISOString() });
        }

        if (payload.type === "answer" && peer) {
          await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }

        if (payload.type === "ice" && peer) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch {
            // ignore stale candidates
          }
        }

        if (payload.type === "chat") {
          setMessages((prev) => [
            ...prev,
            { id: `${payload.senderId}-${payload.sentAt}`, text: payload.text, mine: false, sentAt: payload.sentAt },
          ]);
        }
      })
      .subscribe((event: string) => {
        if (event === "SUBSCRIBED") {
          createPeer();
          broadcast({ type: "presence", status: "waiting", senderId, sentAt: new Date().toISOString() });
        }
      });

    return () => {
      broadcast({ type: "presence", status: "ended", senderId, sentAt: new Date().toISOString() });
      void supabase.removeChannel(channel);
      peerRef.current?.close();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, senderId, broadcast, createPeer, startCall]);

  React.useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = micEnabled; });
  }, [micEnabled]);

  React.useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach((track) => { track.enabled = cameraEnabled; });
  }, [cameraEnabled]);

  const shareScreen = async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screen.getVideoTracks()[0];
      const sender = peerRef.current?.getSenders().find((item) => item.track?.kind === "video");
      if (sender && screenTrack) await sender.replaceTrack(screenTrack);
    } catch {
      setError("Screen sharing could not start.");
    }
  };

  const reconnect = async () => {
    setStatus("reconnecting");
    try {
      peerRef.current?.restartIce();
      setStatus("waiting");
    } catch {
      setStatus("failed");
    }
  };

  const endCall = () => {
    broadcast({ type: "presence", status: "ended", senderId, sentAt: new Date().toISOString() });
    setStatus("ended");
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
  };

  const sendChat = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    const sentAt = new Date().toISOString();
    setMessages((prev) => [...prev, { id: `${senderId}-${sentAt}`, text, mine: true, sentAt }]);
    setChatInput("");
    broadcast({ type: "chat", text, senderId, sentAt });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen flex-col">
        <header className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">HealPoint Call</p>
            <h1 className="mt-1 text-2xl font-semibold">Consultation room</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status === "active" ? "emerald" : status === "failed" ? "danger" : "cyan"}>{status}</Badge>
            <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Dashboard
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-4 p-4 lg:grid-cols-[1fr_22rem]">
          <div className="grid min-h-[32rem] gap-4 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-900">
              <video ref={remoteVideoRef} className="size-full min-h-[20rem] object-cover" autoPlay playsInline />
              <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-sm">Doctor / Patient</div>
              {status !== "active" ? (
                <div className="absolute inset-0 grid place-items-center bg-slate-950/70 p-6 text-center">
                  <p className="max-w-xs text-sm text-slate-200">
                    {status === "prejoin" ? "Run the device check before joining." : "Waiting for the other participant to join."}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-900">
              <video ref={localVideoRef} className="size-full min-h-[20rem] object-cover" autoPlay muted playsInline />
              <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-sm">You</div>
            </div>
          </div>

          <aside className="flex min-h-[28rem] flex-col rounded-lg border border-white/10 bg-white/5">
            <div className="border-b border-white/10 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">Session chat</h2>
              <p className="mt-1 text-sm text-slate-300">Ephemeral room messages over Supabase Realtime.</p>
            </div>
            <div className="flex-1 space-y-3 overflow-auto p-4">
              {messages.length === 0 ? <p className="text-sm text-slate-400">No chat messages yet.</p> : null}
              {messages.map((message) => (
                <div key={message.id} className={cn("rounded-lg px-3 py-2 text-sm", message.mine ? "ml-auto bg-cyan-500 text-slate-950" : "mr-auto bg-white/10")}>
                  {message.text}
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} className="flex gap-2 border-t border-white/10 p-3">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-300"
                placeholder="Message"
              />
              <button type="submit" className={buttonVariants({ variant: "default", size: "icon-sm" })} aria-label="Send message">
                <SendHorizonal className="size-4" />
              </button>
            </form>
          </aside>
        </section>

        {error ? <p className="mx-4 mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}

        <footer className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 p-4">
          {status === "prejoin" || status === "failed" ? (
            <button type="button" onClick={startDeviceCheck} className={buttonVariants({ variant: "default", size: "sm" })}>
              <Camera className="size-4" />
              Device check
            </button>
          ) : null}
          <button type="button" onClick={() => setMicEnabled((value) => !value)} className={buttonVariants({ variant: "outline", size: "icon-sm" })} aria-label="Toggle microphone">
            {micEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
          </button>
          <button type="button" onClick={() => setCameraEnabled((value) => !value)} className={buttonVariants({ variant: "outline", size: "icon-sm" })} aria-label="Toggle camera">
            {cameraEnabled ? <Camera className="size-4" /> : <CameraOff className="size-4" />}
          </button>
          <button type="button" onClick={shareScreen} className={buttonVariants({ variant: "outline", size: "icon-sm" })} aria-label="Share screen">
            <MonitorUp className="size-4" />
          </button>
          <button type="button" onClick={reconnect} className={buttonVariants({ variant: "outline", size: "icon-sm" })} aria-label="Reconnect">
            <RotateCcw className="size-4" />
          </button>
          <button type="button" onClick={endCall} className={buttonVariants({ variant: "destructive", size: "sm" })}>
            <LogOut className="size-4" />
            End call
          </button>
        </footer>
      </div>
    </main>
  );
}
