"use client";

import * as React from "react";
import * as THREE from "three";

export function GlowingDnaBackground() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // --- Scene & Camera Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 26);
    camera.lookAt(0, 0, 0);

    // --- Dynamic Texture Generation ---
    const createGlowTexture = () => {
      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = 64;
      glowCanvas.height = 64;
      const ctx = glowCanvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.15, "rgba(255, 215, 0, 0.95)");  // Gold glow
        gradient.addColorStop(0.45, "rgba(230, 95, 0, 0.4)");     // Amber shadow
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      const texture = new THREE.CanvasTexture(glowCanvas);
      texture.needsUpdate = true;
      return texture;
    };

    const pointTexture = createGlowTexture();

    // --- Shaders for Points (Dynamic Glowing with Distance Attenuation) ---
    const vertexShader = `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (280.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform sampler2D pointTexture;
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
      }
    `;

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: pointTexture },
      },
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    // --- DNA Double Helix Generation ---
    const dnaGroup = new THREE.Group();
    // Position DNA slightly to the center-right to fit perfectly between left & right cards
    dnaGroup.position.set(1.5, 0, 0);
    scene.add(dnaGroup);

    const helixRadius = 4.4;
    const helixHeight = 38;
    const helixTurns = 4.0;
    const steps = 300; // More steps for high density
    const pointsPerRung = 18; // More nodes in between rungs
    const pointsPerStrand = 6; // Particles per helical segment to create a "thick/cloud" strand

    const dnaPositions: number[] = [];
    const dnaSizes: number[] = [];
    const dnaColors: number[] = [];

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const angle = t * helixTurns * Math.PI * 2;
      const y = t * helixHeight - helixHeight / 2;

      // Base coordinates
      const xA = Math.cos(angle) * helixRadius;
      const zA = Math.sin(angle) * helixRadius;

      const xB = Math.cos(angle + Math.PI) * helixRadius;
      const zB = Math.sin(angle + Math.PI) * helixRadius;

      // 1. Generate volumetric Strand A
      for (let s = 0; s < pointsPerStrand; s++) {
        const radOffset = Math.random() * 0.45;
        const angOffset = Math.random() * Math.PI * 2;
        const px = xA + Math.cos(angOffset) * radOffset;
        const py = y + (Math.random() - 0.5) * 0.15;
        const pz = zA + Math.sin(angOffset) * radOffset;

        dnaPositions.push(px, py, pz);
        // Vary sizes to make it look like a molecular cloud
        dnaSizes.push(s === 0 ? 0.9 : 0.25 + Math.random() * 0.4);
        
        // Colors: Gold to bright yellow-amber
        if (s === 0) {
          dnaColors.push(1.0, 0.95, 0.5); // Brighter node
        } else {
          dnaColors.push(1.0, 0.72 + Math.random() * 0.15, 0.1 + Math.random() * 0.15); // Golden ambient
        }
      }

      // 2. Generate volumetric Strand B
      for (let s = 0; s < pointsPerStrand; s++) {
        const radOffset = Math.random() * 0.45;
        const angOffset = Math.random() * Math.PI * 2;
        const px = xB + Math.cos(angOffset) * radOffset;
        const py = y + (Math.random() - 0.5) * 0.15;
        const pz = zB + Math.sin(angOffset) * radOffset;

        dnaPositions.push(px, py, pz);
        dnaSizes.push(s === 0 ? 0.9 : 0.25 + Math.random() * 0.4);
        
        if (s === 0) {
          dnaColors.push(1.0, 0.95, 0.5);
        } else {
          dnaColors.push(1.0, 0.72 + Math.random() * 0.15, 0.1 + Math.random() * 0.15);
        }
      }

      // 3. Generate volumetric connecting Rungs
      if (i % 4 === 0) {
        for (let j = 1; j < pointsPerRung - 1; j++) {
          const ratio = j / (pointsPerRung - 1);
          // Interpolate coordinate
          const rx = xA * (1 - ratio) + xB * ratio;
          const ry = y;
          const rz = zA * (1 - ratio) + zB * ratio;

          // Add minor noise to make rungs look energetic/fluid
          const rungNoiseX = (Math.random() - 0.5) * 0.2;
          const rungNoiseY = (Math.random() - 0.5) * 0.15;
          const rungNoiseZ = (Math.random() - 0.5) * 0.2;

          dnaPositions.push(rx + rungNoiseX, ry + rungNoiseY, rz + rungNoiseZ);
          dnaSizes.push(0.18 + Math.random() * 0.22);
          
          // Warm amber color for connection bar particles
          dnaColors.push(0.95, 0.58, 0.12);
        }
      }
    }

    const dnaGeometry = new THREE.BufferGeometry();
    dnaGeometry.setAttribute("position", new THREE.Float32BufferAttribute(dnaPositions, 3));
    dnaGeometry.setAttribute("size", new THREE.Float32BufferAttribute(dnaSizes, 1));
    dnaGeometry.setAttribute("customColor", new THREE.Float32BufferAttribute(dnaColors, 3));

    const dnaParticles = new THREE.Points(dnaGeometry, shaderMaterial);
    dnaGroup.add(dnaParticles);

    // --- Plexus Node Network (Constellation Effect) ---
    const plexusCount = prefersReducedMotion ? 60 : 120;
    const plexusPositions = new Float32Array(plexusCount * 3);
    const plexusSizes = new Float32Array(plexusCount);
    const plexusColors = new Float32Array(plexusCount * 3);
    const plexusVelocities: number[] = [];

    for (let i = 0; i < plexusCount; i++) {
      // Position nodes mainly on the sides and background
      const isLeft = Math.random() > 0.5;
      const x = isLeft 
        ? -12 - Math.random() * 18 
        : 12 + Math.random() * 18;
      const y = (Math.random() - 0.5) * 44;
      const z = (Math.random() - 0.5) * 22 - 6; // slightly behind DNA

      plexusPositions[i * 3] = x;
      plexusPositions[i * 3 + 1] = y;
      plexusPositions[i * 3 + 2] = z;

      plexusSizes[i] = 0.2 + Math.random() * 0.35;

      // Deep cyan/blue colors for the medical network nodes
      plexusColors[i * 3] = 0.45;
      plexusColors[i * 3 + 1] = 0.85;
      plexusColors[i * 3 + 2] = 0.95;

      // Slow drift velocity
      plexusVelocities.push(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.012,
        (Math.random() - 0.5) * 0.008
      );
    }

    const plexusPointsGeometry = new THREE.BufferGeometry();
    plexusPointsGeometry.setAttribute("position", new THREE.BufferAttribute(plexusPositions, 3));
    plexusPointsGeometry.setAttribute("size", new THREE.BufferAttribute(plexusSizes, 1));
    plexusPointsGeometry.setAttribute("customColor", new THREE.BufferAttribute(plexusColors, 3));

    const plexusParticles = new THREE.Points(plexusPointsGeometry, shaderMaterial);
    scene.add(plexusParticles);

    // Dynamic Connections Line Segments (Garbage-collection-free)
    const maxLines = prefersReducedMotion ? 120 : 350;
    const linePositions = new Float32Array(maxLines * 2 * 3);
    const lineGeometry = new THREE.BufferGeometry();
    const linePositionAttr = new THREE.BufferAttribute(linePositions, 3);
    lineGeometry.setAttribute("position", linePositionAttr);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4abefe, // Cyan
      transparent: true,
      opacity: 0.065,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // --- Background Ambient Drifting Particles ---
    const dustCount = prefersReducedMotion ? 80 : 250;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    const dustColors = new Float32Array(dustCount * 3);
    const dustSpeeds: number[] = [];
    const dustPhases: number[] = [];

    for (let i = 0; i < dustCount; i++) {
      const x = (Math.random() - 0.5) * 45;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 35 - 5;

      dustPositions[i * 3] = x;
      dustPositions[i * 3 + 1] = y;
      dustPositions[i * 3 + 2] = z;

      dustSizes[i] = 0.12 + Math.random() * 0.4;

      // Mix of amber/gold dust
      dustColors[i * 3] = 1.0;
      dustColors[i * 3 + 1] = 0.6 + Math.random() * 0.2;
      dustColors[i * 3 + 2] = 0.1 + Math.random() * 0.2;

      dustSpeeds.push(0.012 + Math.random() * 0.028);
      dustPhases.push(Math.random() * Math.PI * 2);
    }

    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("size", new THREE.BufferAttribute(dustSizes, 1));
    dustGeometry.setAttribute("customColor", new THREE.BufferAttribute(dustColors, 3));

    const dustParticles = new THREE.Points(dustGeometry, shaderMaterial);
    scene.add(dustParticles);

    // --- Mouse Move Variables ---
    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // --- Scroll Parallax ---
    let scrollY = 0;
    let targetScrollY = 0;

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // --- Render Loop ---
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Lerp mouse and scroll values
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.06;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.06;
      scrollY += (targetScrollY - scrollY) * 0.06;

      if (!prefersReducedMotion) {
        // Rotate DNA double helix (gentle rotation + scroll offset)
        dnaGroup.rotation.y = time * 0.07 + scrollY * 0.0005;
        dnaGroup.rotation.x = currentMouse.y * 0.08;
        dnaGroup.rotation.z = currentMouse.x * 0.05;

        // Vertically offset camera for parallax scroll
        camera.position.y = -scrollY * 0.016;
        camera.position.x = currentMouse.x * 1.8;
        camera.position.z = 26 + scrollY * 0.001;

        camera.lookAt(0, -scrollY * 0.016, 0);

        // 1. Update Plexus nodes drifting
        const plexAttr = plexusPointsGeometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < plexusCount; i++) {
          const px = plexAttr.getX(i) + plexusVelocities[i * 3] * 60 * delta;
          const py = plexAttr.getY(i) + plexusVelocities[i * 3 + 1] * 60 * delta;
          const pz = plexAttr.getZ(i) + plexusVelocities[i * 3 + 2] * 60 * delta;

          // Check boundaries & invert velocity
          if (px > 30 || px < -30) plexusVelocities[i * 3] *= -1;
          if (py > 25 || py < -25) plexusVelocities[i * 3 + 1] *= -1;
          if (pz > 10 || pz < -25) plexusVelocities[i * 3 + 2] *= -1;

          plexAttr.setXYZ(i, px, py, pz);
        }
        plexAttr.needsUpdate = true;

        // 2. Compute Plexus Connections (Lines)
        let lineIndex = 0;
        for (let i = 0; i < plexusCount; i++) {
          const x1 = plexAttr.getX(i);
          const y1 = plexAttr.getY(i);
          const z1 = plexAttr.getZ(i);

          for (let j = i + 1; j < plexusCount; j++) {
            const x2 = plexAttr.getX(j);
            const y2 = plexAttr.getY(j);
            const z2 = plexAttr.getZ(j);

            const dx = x1 - x2;
            const dy = y1 - y2;
            const dz = z1 - z2;
            const distSq = dx * dx + dy * dy + dz * dz;

            // Connect if distance < 8.0 units (64.0 sq)
            if (distSq < 64 && lineIndex < maxLines) {
              linePositions[lineIndex * 6] = x1;
              linePositions[lineIndex * 6 + 1] = y1;
              linePositions[lineIndex * 6 + 2] = z1;
              linePositions[lineIndex * 6 + 3] = x2;
              linePositions[lineIndex * 6 + 4] = y2;
              linePositions[lineIndex * 6 + 5] = z2;
              lineIndex++;
            }
          }
        }
        lineGeometry.setDrawRange(0, lineIndex * 2);
        linePositionAttr.needsUpdate = true;

        // 3. Update Ambient Dust Particles
        const dustAttr = dustGeometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < dustCount; i++) {
          let px = dustAttr.getX(i);
          let py = dustAttr.getY(i);
          let pz = dustAttr.getZ(i);

          // Drift upwards
          py += dustSpeeds[i] * 60 * delta;

          if (py > 25) {
            py = -25;
            px = (Math.random() - 0.5) * 45;
            pz = (Math.random() - 0.5) * 35 - 5;
          }

          // Wind wobble
          const phase = dustPhases[i] + time;
          px += Math.sin(phase * 0.6) * 0.015;
          pz += Math.cos(phase * 0.4) * 0.015;

          dustAttr.setXYZ(i, px, py, pz);
        }
        dustAttr.needsUpdate = true;
      } else {
        // Reduced motion positioning
        dnaGroup.rotation.y = scrollY * 0.0002;
        camera.position.y = -scrollY * 0.016;
        camera.lookAt(0, -scrollY * 0.016, 0);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    scrollY = window.scrollY;
    targetScrollY = window.scrollY;
    
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        clock.getDelta();
        animate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      
      dnaGeometry.dispose();
      plexusPointsGeometry.dispose();
      lineGeometry.dispose();
      dustGeometry.dispose();
      shaderMaterial.dispose();
      lineMaterial.dispose();
      pointTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-[#040406]"
      aria-hidden="true"
    >
      {/* Cinematic ambient background colors matching the genetic tech theme */}
      <div className="absolute inset-0 z-[-2] bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.085)_0%,rgba(4,4,6,0)_60%),radial-gradient(circle_at_15%_25%,rgba(74,190,254,0.03)_0%,rgba(4,4,6,0)_45%),radial-gradient(circle_at_80%_70%,rgba(212,175,55,0.045)_0%,rgba(4,4,6,0)_50%)]" />
      
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 h-full w-full opacity-90 block"
      />
    </div>
  );
}
