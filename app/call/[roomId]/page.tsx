import { VideoCallRoom } from "@/components/video-call/video-call-room";

type CallPageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function CallPage({ params }: CallPageProps) {
  const { roomId } = await params;

  return <VideoCallRoom roomId={roomId} />;
}

