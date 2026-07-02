"use client";

import * as React from "react";

type Particle = {
  x: number;
  y: number;
  z: number;
  speed: number;
  radius: number;
};

type ScientificBackgroundProps = {
  className?: string;
  density?: "low" | "medium" | "high";
};

const densityMap = {
  low: 34,
  medium: 58,
  high: 82,
};

export function ScientificBackground({ className, density = "medium" }: ScientificBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !context) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let time = 0;
    const pointer = { x: 0, y: 0, active: false };
    const quality = Math.min(window.devicePixelRatio || 1, navigator.hardwareConcurrency <= 4 ? 1.25 : 1.75);
    const particles: Particle[] = Array.from({ length: densityMap[density] }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      speed: 0.00012 + Math.random() * 0.00022,
      radius: 0.8 + Math.random() * 1.8,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * quality);
      canvas.height = Math.floor(height * quality);
      context.setTransform(quality, 0, 0, quality, 0, 0);
    };

    const drawNode = (x: number, y: number, radius: number, alpha: number) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius * 7);
      gradient.addColorStop(0, `rgba(118, 218, 226, ${alpha})`);
      gradient.addColorStop(0.45, `rgba(74, 190, 158, ${alpha * 0.38})`);
      gradient.addColorStop(1, "rgba(74, 190, 158, 0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius * 7, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = `rgba(235, 252, 251, ${alpha})`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };

    const draw = () => {
      time += reducedMotion ? 0.0008 : 0.006;
      context.clearRect(0, 0, width, height);

      const centerX = width * 0.5 + (pointer.active ? (pointer.x - width * 0.5) * 0.025 : 0);
      const centerY = height * 0.5 + (pointer.active ? (pointer.y - height * 0.5) * 0.018 : 0);
      const helixHeight = height * 0.8;
      const helixWidth = Math.min(width * 0.34, 280);
      const strandSteps = 34;

      context.globalCompositeOperation = "lighter";

      for (const particle of particles) {
        particle.y -= particle.speed;
        if (particle.y < -0.08) {
          particle.y = 1.08;
          particle.x = Math.random();
        }

        const follow = pointer.active ? 0.012 * particle.z : 0;
        const x = particle.x * width + (pointer.x - particle.x * width) * follow;
        const y = particle.y * height + (pointer.y - particle.y * height) * follow;
        drawNode(x, y, particle.radius * (0.8 + particle.z), 0.08 + particle.z * 0.18);
      }

      for (let index = 0; index < strandSteps; index += 1) {
        const progress = index / (strandSteps - 1);
        const y = centerY - helixHeight / 2 + progress * helixHeight;
        const angle = progress * Math.PI * 6 + time;
        const depthA = (Math.sin(angle) + 1) / 2;
        const depthB = 1 - depthA;
        const xA = centerX + Math.cos(angle) * helixWidth * 0.5;
        const xB = centerX + Math.cos(angle + Math.PI) * helixWidth * 0.5;

        context.strokeStyle = `rgba(118, 218, 226, ${0.08 + depthA * 0.2})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(xA, y);
        context.lineTo(xB, y);
        context.stroke();

        drawNode(xA, y, 1.3 + depthA * 1.5, 0.35 + depthA * 0.45);
        drawNode(xB, y, 1.3 + depthB * 1.5, 0.35 + depthB * 0.45);
      }

      context.globalCompositeOperation = "source-over";

      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
      } else if (!reducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? "pointer-events-auto absolute inset-0 h-full w-full"}
    />
  );
}
