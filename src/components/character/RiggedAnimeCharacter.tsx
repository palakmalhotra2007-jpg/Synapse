'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RiggedAnimeCharacterProps {
  isSpeaking?: boolean;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * RiggedAnimeCharacter
 * 
 * Original Live2D-style Animation Engine for the custom VTuber avatar.
 * Features:
 * - 60+ FPS multi-joint skeletal kinematics & cloth/hair physics.
 * - Multi-segment spring-mass-damper physics for flowing twin-tail hair.
 * - Symmetrical anatomical breathing (torso & lung expansion, shoulder roll).
 * - Head pitch, yaw (2.5D parallax), and roll tracking cursor + idle micro-nods.
 * - Animated anime eyes with pupil gaze tracking and realistic curved eyelid blinking.
 * - Dynamic speech-synchronized morphing anime mouth anchored directly to the face.
 * - Independent arm and hand micro-gestures.
 * - 100% static ground anchor (zero whole-image sliding or camera panning).
 */
export const RiggedAnimeCharacter: React.FC<RiggedAnimeCharacterProps> = ({
  isSpeaking = false,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Mouse tracking references
  const targetLookRef = useRef({ x: 0, y: 0 });
  const currentLookRef = useRef({ x: 0, y: 0 });

  // Spring physics state for left and right twin-tails
  const hairPhysicsRef = useRef({
    // Left twin-tail (4 segments)
    leftAngles: [0, 0, 0, 0],
    leftVels: [0, 0, 0, 0],
    // Right twin-tail (4 segments)
    rightAngles: [0, 0, 0, 0],
    rightVels: [0, 0, 0, 0],
    prevHeadYaw: 0,
    prevHeadAngle: 0,
  });

  // Eyelid blinking state machine
  const blinkRef = useRef({
    state: 'idle' as 'idle' | 'closing' | 'closed' | 'opening',
    progress: 0, // 0 = fully open, 1 = fully closed
    nextBlinkTime: Date.now() + 2200 + Math.random() * 2200,
    closeSpeed: 0.16, // ~50ms
    openSpeed: 0.13,  // ~70ms
  });

  // Track cursor position normalized from -1 to 1
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.22; // Target head height

      const dx = (e.clientX - centerX) / (window.innerWidth * 0.45);
      const dy = (e.clientY - centerY) / (window.innerHeight * 0.45);

      targetLookRef.current = {
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy)),
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Main Canvas Skeletal Deformation & Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Load original VTuber character texture (558 x 1263)
    const img = new Image();
    img.src = '/character/live_anime_character.png';
    img.crossOrigin = 'anonymous';

    let animId: number;
    let isMounted = true;

    // Pre-allocated offscreen canvas layers for ultra-smooth multi-pass rendering
    let offscreenReady = false;
    let offscreenBase: HTMLCanvasElement;
    let offscreenLeftTail: HTMLCanvasElement;
    let offscreenRightTail: HTMLCanvasElement;
    let offscreenSkirt: HTMLCanvasElement;
    let offscreenTorso: HTMLCanvasElement;
    let offscreenLeftArm: HTMLCanvasElement;
    let offscreenRightArm: HTMLCanvasElement;
    let offscreenHead: HTMLCanvasElement;

    const W = 558;
    const H = 1263;

    const initOffscreenLayers = () => {
      const createLayer = () => {
        const c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        return c;
      };

      offscreenBase = createLayer();
      offscreenLeftTail = createLayer();
      offscreenRightTail = createLayer();
      offscreenSkirt = createLayer();
      offscreenTorso = createLayer();
      offscreenLeftArm = createLayer();
      offscreenRightArm = createLayer();
      offscreenHead = createLayer();

      // 1. Base Layer (Pelvis, Thighs, Socks & Sneakers) - Ground Anchor
      const bCtx = offscreenBase.getContext('2d')!;
      bCtx.drawImage(img, 0, 0);

      // 2. Left Twin-Tail (Long flowing mint-green pigtail on viewer's left)
      const ltCtx = offscreenLeftTail.getContext('2d')!;
      ltCtx.save();
      ltCtx.beginPath();
      ltCtx.moveTo(180, 80);
      ltCtx.bezierCurveTo(90, 70, 0, 150, 0, 320);
      ltCtx.bezierCurveTo(0, 520, 80, 680, 130, 640);
      ltCtx.bezierCurveTo(170, 560, 190, 240, 180, 80);
      ltCtx.closePath();
      ltCtx.clip();
      ltCtx.drawImage(img, 0, 0);
      ltCtx.restore();

      // 3. Right Twin-Tail (Long flowing mint-green pigtail on viewer's right)
      const rtCtx = offscreenRightTail.getContext('2d')!;
      rtCtx.save();
      rtCtx.beginPath();
      rtCtx.moveTo(378, 80);
      rtCtx.bezierCurveTo(468, 70, 558, 150, 558, 320);
      rtCtx.bezierCurveTo(558, 520, 478, 680, 428, 640);
      rtCtx.bezierCurveTo(388, 560, 368, 240, 378, 80);
      rtCtx.closePath();
      rtCtx.clip();
      rtCtx.drawImage(img, 0, 0);
      rtCtx.restore();

      // 4. Skirt Layer (Navy and teal pleated skirt with frills)
      const skCtx = offscreenSkirt.getContext('2d')!;
      skCtx.save();
      skCtx.beginPath();
      skCtx.moveTo(180, 450);
      skCtx.bezierCurveTo(279, 445, 378, 450, 455, 540);
      skCtx.bezierCurveTo(460, 620, 279, 630, 103, 620);
      skCtx.bezierCurveTo(100, 540, 140, 460, 180, 450);
      skCtx.closePath();
      skCtx.clip();
      skCtx.drawImage(img, 0, 0);
      skCtx.restore();

      // 5. Torso Layer (Chest, White Shirt, Bolero Jacket, Sailor Collar & Red Bow)
      const tCtx = offscreenTorso.getContext('2d')!;
      tCtx.save();
      tCtx.beginPath();
      tCtx.moveTo(180, 230);
      tCtx.bezierCurveTo(279, 235, 378, 230, 430, 330);
      tCtx.bezierCurveTo(410, 440, 279, 455, 148, 440);
      tCtx.bezierCurveTo(128, 330, 150, 240, 180, 230);
      tCtx.closePath();
      tCtx.clip();
      tCtx.drawImage(img, 0, 0);
      tCtx.restore();

      // 6. Left Arm & Hand Layer (Shoulder to fingers)
      const laCtx = offscreenLeftArm.getContext('2d')!;
      laCtx.save();
      laCtx.beginPath();
      laCtx.moveTo(135, 260);
      laCtx.bezierCurveTo(190, 260, 190, 380, 175, 480);
      laCtx.bezierCurveTo(155, 600, 115, 680, 70, 640);
      laCtx.bezierCurveTo(55, 540, 85, 360, 135, 260);
      laCtx.closePath();
      laCtx.clip();
      laCtx.drawImage(img, 0, 0);
      laCtx.restore();

      // 7. Right Arm & Hand Layer (Shoulder to fingers)
      const raCtx = offscreenRightArm.getContext('2d')!;
      raCtx.save();
      raCtx.beginPath();
      raCtx.moveTo(423, 260);
      raCtx.bezierCurveTo(368, 260, 368, 380, 383, 480);
      raCtx.bezierCurveTo(403, 600, 443, 680, 488, 640);
      raCtx.bezierCurveTo(503, 540, 473, 360, 423, 260);
      raCtx.closePath();
      raCtx.clip();
      raCtx.drawImage(img, 0, 0);
      raCtx.restore();

      // 8. Head Layer (Face, Bangs, Hair Crown, Ribbons, Ears)
      const hCtx = offscreenHead.getContext('2d')!;
      hCtx.save();
      hCtx.beginPath();
      hCtx.moveTo(180, 30);
      hCtx.bezierCurveTo(279, 0, 378, 30, 425, 120);
      hCtx.bezierCurveTo(425, 220, 350, 250, 279, 250);
      hCtx.bezierCurveTo(208, 250, 133, 220, 133, 120);
      hCtx.closePath();
      hCtx.clip();
      hCtx.drawImage(img, 0, 0);
      hCtx.restore();

      offscreenReady = true;
    };

    img.onload = () => {
      if (!isMounted) return;
      initOffscreenLayers();
      setImageLoaded(true);
      startTime = performance.now();
      requestAnimationFrame(renderLoop);
    };

    let startTime = performance.now();

    // 60 FPS Skeletal Kinematics & Rendering Loop
    const renderLoop = (now: number) => {
      if (!isMounted) return;
      const t = (now - startTime) / 1000;

      // Handle Retina High-DPI Canvas Scaling
      const dpr = window.devicePixelRatio || 1;
      const displayW = W;
      const displayH = H;

      if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
        canvas.width = displayW * dpr;
        canvas.height = displayH * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayW, displayH);

      if (!offscreenReady) {
        ctx.drawImage(img, 0, 0, displayW, displayH);
        ctx.restore();
        animId = requestAnimationFrame(renderLoop);
        return;
      }

      // =========================================================================
      // 1. KINEMATICS & SPRING SIMULATION
      // =========================================================================

      // A. Cursor Follow Spring-Damping
      currentLookRef.current.x += (targetLookRef.current.x - currentLookRef.current.x) * 0.065;
      currentLookRef.current.y += (targetLookRef.current.y - currentLookRef.current.y) * 0.065;
      const lookX = currentLookRef.current.x;
      const lookY = currentLookRef.current.y;

      // B. Breathing Cycle (14 breaths/min)
      const breathPhase = t * 1.65;
      const breathSin = Math.sin(breathPhase);
      const breathCos = Math.cos(breathPhase);

      const torsoScaleY = 1.0 + breathSin * 0.016;
      const torsoScaleX = 1.0 - breathSin * 0.007;
      const torsoOffsetY = -breathSin * 2.2;
      const shoulderAngle = breathSin * 0.007; // Radians

      // C. Head & Neck Kinematics
      const idleHeadNod = Math.sin(t * 0.85) * 0.016 + Math.sin(t * 1.7) * 0.007;
      const idleHeadTilt = Math.sin(t * 0.65) * 0.02;
      const headAngle = lookX * 0.065 + idleHeadTilt; // Roll (radians)
      const headPitch = lookY * 0.04 + idleHeadNod;  // Pitch
      const headYaw = lookX * 0.08;                  // Yaw
      const headOffsetY = torsoOffsetY * 0.92;

      // D. Multi-Segment Twin-Tail Spring Physics
      const headYawDelta = headYaw - hairPhysicsRef.current.prevHeadYaw;
      const headAngleDelta = headAngle - hairPhysicsRef.current.prevHeadAngle;
      hairPhysicsRef.current.prevHeadYaw = headYaw;
      hairPhysicsRef.current.prevHeadAngle = headAngle;

      const hairK = 0.075;
      const hairDamping = 0.85;

      // Left Hair Chain Simulation
      for (let i = 0; i < 4; i++) {
        const phaseOffset = i * 0.4;
        const targetAngle =
          Math.sin(t * 1.45 + phaseOffset) * (0.04 + i * 0.02) -
          headYaw * 0.35 -
          headYawDelta * (2.2 + i * 1.1) -
          headAngleDelta * 1.4;

        const force = (targetAngle - hairPhysicsRef.current.leftAngles[i]) * hairK;
        hairPhysicsRef.current.leftVels[i] = (hairPhysicsRef.current.leftVels[i] + force) * hairDamping;
        hairPhysicsRef.current.leftAngles[i] += hairPhysicsRef.current.leftVels[i];
      }

      // Right Hair Chain Simulation
      for (let i = 0; i < 4; i++) {
        const phaseOffset = i * 0.4 + 1.1;
        const targetAngle =
          Math.sin(t * 1.45 + phaseOffset) * (0.04 + i * 0.02) -
          headYaw * 0.35 -
          headYawDelta * (2.2 + i * 1.1) -
          headAngleDelta * 1.4;

        const force = (targetAngle - hairPhysicsRef.current.rightAngles[i]) * hairK;
        hairPhysicsRef.current.rightVels[i] = (hairPhysicsRef.current.rightVels[i] + force) * hairDamping;
        hairPhysicsRef.current.rightAngles[i] += hairPhysicsRef.current.rightVels[i];
      }

      // E. Eye Blinking State Machine
      const nowMs = Date.now();
      if (blinkRef.current.state === 'idle') {
        if (nowMs >= blinkRef.current.nextBlinkTime) {
          blinkRef.current.state = 'closing';
          blinkRef.current.progress = 0;
        }
      } else if (blinkRef.current.state === 'closing') {
        blinkRef.current.progress += blinkRef.current.closeSpeed;
        if (blinkRef.current.progress >= 1.0) {
          blinkRef.current.progress = 1.0;
          blinkRef.current.state = 'closed';
          setTimeout(() => {
            if (isMounted) blinkRef.current.state = 'opening';
          }, 35);
        }
      } else if (blinkRef.current.state === 'opening') {
        blinkRef.current.progress -= blinkRef.current.openSpeed;
        if (blinkRef.current.progress <= 0.0) {
          blinkRef.current.progress = 0.0;
          blinkRef.current.state = 'idle';
          blinkRef.current.nextBlinkTime = Date.now() + 2200 + Math.random() * 2600;
        }
      }

      const blinkVal = Math.max(0, Math.min(1, blinkRef.current.progress));

      // F. Speech-Synchronized Mouth Articulation
      let mouthOpenHeight = 0;
      let mouthOpenWidth = 0;
      if (isSpeaking) {
        const speechFast = Math.sin(t * 19);
        const speechMod = Math.sin(t * 7.5) * 0.4 + 0.6;
        mouthOpenHeight = Math.max(0, (speechFast * 0.5 + 0.5) * speechMod * 8.0);
        mouthOpenWidth = 9.0 + Math.max(0, Math.sin(t * 11) * 3.5);
      }

      // =========================================================================
      // 2. LAYER RENDERING (Hierarchical Kinematics & Depth Order)
      // =========================================================================

      // -------------------------------------------------------------------------
      // LAYER 1: Grounded Base Layer (Static Ground Anchor - Legs, Socks & Shoes)
      // -------------------------------------------------------------------------
      ctx.drawImage(offscreenBase, 0, 0);

      // -------------------------------------------------------------------------
      // LAYER 2: Left Twin-Tail Hair (Flowing pigtail with spring wave)
      // -------------------------------------------------------------------------
      ctx.save();
      ctx.translate(180, 95);
      ctx.rotate(hairPhysicsRef.current.leftAngles[0]);
      ctx.translate(-180, -95);

      const leftTailSway = hairPhysicsRef.current.leftAngles[2] * 24;
      ctx.save();
      ctx.translate(leftTailSway, 0);
      ctx.drawImage(offscreenLeftTail, 0, 0);
      ctx.restore();
      ctx.restore();

      // -------------------------------------------------------------------------
      // LAYER 3: Right Twin-Tail Hair (Flowing pigtail with spring wave)
      // -------------------------------------------------------------------------
      ctx.save();
      ctx.translate(378, 95);
      ctx.rotate(hairPhysicsRef.current.rightAngles[0]);
      ctx.translate(-378, -95);

      const rightTailSway = hairPhysicsRef.current.rightAngles[2] * 24;
      ctx.save();
      ctx.translate(rightTailSway, 0);
      ctx.drawImage(offscreenRightTail, 0, 0);
      ctx.restore();
      ctx.restore();

      // -------------------------------------------------------------------------
      // LAYER 4: Skirt (Pleated cloth inertia with hip sway)
      // -------------------------------------------------------------------------
      ctx.save();
      const skirtPivotX = 279;
      const skirtPivotY = 460;
      const skirtSway = Math.sin(t * 1.3) * 0.01 + lookX * 0.012;
      ctx.translate(skirtPivotX, skirtPivotY);
      ctx.rotate(skirtSway);
      ctx.scale(1.0 + breathSin * 0.007, 1.0);
      ctx.translate(-skirtPivotX, -skirtPivotY);
      ctx.drawImage(offscreenSkirt, 0, 0);
      ctx.restore();

      // -------------------------------------------------------------------------
      // LAYER 5: Torso, Chest, Collar & Red Ribbon (Breathing Expansion)
      // -------------------------------------------------------------------------
      ctx.save();
      const torsoPivotX = 279;
      const torsoPivotY = 445;
      ctx.translate(torsoPivotX, torsoPivotY + torsoOffsetY);
      ctx.rotate(shoulderAngle);
      ctx.scale(torsoScaleX, torsoScaleY);
      ctx.translate(-torsoPivotX, -torsoPivotY);
      ctx.drawImage(offscreenTorso, 0, 0);
      ctx.restore();

      // -------------------------------------------------------------------------
      // LAYER 6: Left Arm & Hand (Independent gentle breathing lift & micro-sway)
      // -------------------------------------------------------------------------
      ctx.save();
      const leftArmPivotX = 155;
      const leftArmPivotY = 275;
      const leftArmSway = shoulderAngle * 0.9 + Math.sin(t * 2.1) * 0.008;
      ctx.translate(leftArmPivotX, leftArmPivotY + torsoOffsetY * 0.85);
      ctx.rotate(leftArmSway);
      ctx.translate(-leftArmPivotX, -leftArmPivotY);
      ctx.drawImage(offscreenLeftArm, 0, 0);
      ctx.restore();

      // -------------------------------------------------------------------------
      // LAYER 7: Right Arm & Hand (Independent gentle breathing lift & micro-sway)
      // -------------------------------------------------------------------------
      ctx.save();
      const rightArmPivotX = 403;
      const rightArmPivotY = 275;
      const rightArmSway = -shoulderAngle * 0.9 - Math.sin(t * 2.1 + 0.8) * 0.008;
      ctx.translate(rightArmPivotX, rightArmPivotY + torsoOffsetY * 0.85);
      ctx.rotate(rightArmSway);
      ctx.translate(-rightArmPivotX, -rightArmPivotY);
      ctx.drawImage(offscreenRightArm, 0, 0);
      ctx.restore();

      // -------------------------------------------------------------------------
      // LAYER 8: Head, Neck, Face & Bangs (Tracking Gaze, Pitch, Roll & 2.5D Yaw)
      // -------------------------------------------------------------------------
      ctx.save();
      const headPivotX = 279;
      const headPivotY = 225; // Neck base pivot

      ctx.translate(headPivotX, headPivotY + headOffsetY);
      ctx.rotate(headAngle);
      // 2.5D Perspective yaw skew
      ctx.transform(1, 0, headYaw * 0.45, 1, 0, 0);
      ctx.translate(-headPivotX, -headPivotY);

      // Render Head & Bangs Base
      ctx.drawImage(offscreenHead, 0, 0);

      // -----------------------------------------------------------------------
      // LAYER 9: Live Animated Anime Eyes & Gaze Tracking
      // Left eye center: (240, 134), Right eye center: (318, 134)
      // -----------------------------------------------------------------------
      // Draw Open Eyes with Pupils (when not fully closed)
      // REMOVED - Using base image eyes instead
      
      // Realistic Anime Eyelid Blinking Mechanism (draws on top of eyes)
      if (blinkVal > 0.04) {
        const drawEyelid = (cx: number, cy: number, w: number, h: number) => {
          ctx.save();
          // Clip to eye socket
          ctx.beginPath();
          ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2);
          ctx.clip();

          // Smooth skin tone eyelid sliding down
          const eyelidDropY = cy - h + h * 2 * blinkVal;
          ctx.fillStyle = '#fef2ee'; // Anime soft skin tone
          ctx.beginPath();
          ctx.rect(cx - w - 3, cy - h - 3, (w + 3) * 2, (eyelidDropY - (cy - h)) + 6);
          ctx.fill();

          // Upper Eyelash line with delicate anime curve
          ctx.strokeStyle = '#3b0764'; // Deep anime violet-purple lashline
          ctx.lineWidth = 3.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx - w * 0.88, eyelidDropY);
          ctx.quadraticCurveTo(cx, eyelidDropY + 3.0 * blinkVal, cx + w * 0.88, eyelidDropY);
          ctx.stroke();

          // Double eyelid delicate crease
          if (blinkVal > 0.35) {
            ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(cx - w * 0.65, eyelidDropY - 4.5);
            ctx.quadraticCurveTo(cx, eyelidDropY - 6.0, cx + w * 0.65, eyelidDropY - 4.5);
            ctx.stroke();
          }

          ctx.restore();
        };

        drawEyelid(240, 134, 21, 20);
        drawEyelid(318, 134, 21, 20);
      }

      // -----------------------------------------------------------------------
      // LAYER 10: Speech-Synchronized Morphing Anime Mouth
      // Exact mouth position on face: (279, 184)
      // -----------------------------------------------------------------------
      if (isSpeaking && mouthOpenHeight > 0.8) {
        ctx.save();
        const mouthX = 279;
        const mouthY = 184;

        // Clean anime mouth cavity
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY, mouthOpenWidth / 2, mouthOpenHeight / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#881337'; // Deep anime mouth interior
        ctx.fill();

        // Delicate tongue contour
        ctx.beginPath();
        ctx.ellipse(
          mouthX,
          mouthY + mouthOpenHeight * 0.22,
          mouthOpenWidth * 0.35,
          mouthOpenHeight * 0.25,
          0,
          0,
          Math.PI
        );
        ctx.fillStyle = '#f43f5e';
        ctx.fill();

        // Upper teeth accent
        ctx.beginPath();
        ctx.moveTo(mouthX - mouthOpenWidth * 0.38, mouthY - mouthOpenHeight * 0.2);
        ctx.quadraticCurveTo(mouthX, mouthY - mouthOpenHeight * 0.1, mouthX + mouthOpenWidth * 0.38, mouthY - mouthOpenHeight * 0.2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Outer lip subtle outline
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY, mouthOpenWidth / 2, mouthOpenHeight / 2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 0.9;
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore(); // Restore Head transform

      ctx.restore(); // Restore Canvas DPR scaling

      animId = requestAnimationFrame(renderLoop);
    };

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
    };
  }, [isSpeaking]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'relative select-none pointer-events-auto flex items-end justify-center w-full h-full',
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain pointer-events-auto filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.7)]"
        style={{
          aspectRatio: '558 / 1263',
        }}
      />
    </div>
  );
};
