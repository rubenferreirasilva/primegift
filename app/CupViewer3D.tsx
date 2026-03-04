'use client';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CupViewer3DProps {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  logoUrl: string | null;
  logoScale: number;
  logoYOffset: number;
}

// Canvas texture that wraps the logo around the full cylinder UV
function useLogoTexture(logoUrl: string | null, logoScale: number, logoYOffset: number) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const prevRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!logoUrl) {
      if (prevRef.current) { prevRef.current.dispose(); prevRef.current = null; }
      setTexture(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;

      const canvas = document.createElement('canvas');
      const W = 2048; // full circumference unwrapped
      const H = 512;  // cup height
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, W, H);

      const s = logoScale / 100;
      // At 100% scale, logo covers ~35% of circumference; at 300% wraps fully
      const targetW = W * 0.35 * s;
      const targetH = H * 0.75 * s;
      const ratio = Math.min(targetW / img.width, targetH / img.height);
      const drawW = img.width * ratio;
      const drawH = img.height * ratio;

      // Center at x=W/2 (maps to front of cup with thetaStart=PI)
      const drawX = (W - drawW) / 2;
      const yOff = (logoYOffset / 100) * H * 0.35;
      const drawY = (H - drawH) / 2 + yOff;

      ctx.globalAlpha = 0.92;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      // Wrap overflow around the cylinder seamlessly
      if (drawX + drawW > W) ctx.drawImage(img, drawX - W, drawY, drawW, drawH);
      if (drawX < 0) ctx.drawImage(img, drawX + W, drawY, drawW, drawH);

      if (prevRef.current) prevRef.current.dispose();
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      prevRef.current = tex;
      setTexture(tex);
    };
    img.onerror = () => { if (!cancelled) setTexture(null); };
    img.src = logoUrl;

    return () => { cancelled = true; };
  }, [logoUrl, logoScale, logoYOffset]);

  useEffect(() => () => { if (prevRef.current) prevRef.current.dispose(); }, []);

  return texture;
}

function Cup({ rTop, rBot, h, logoUrl, logoScale, logoYOffset }: {
  rTop: number; rBot: number; h: number;
  logoUrl: string | null; logoScale: number; logoYOffset: number;
}) {
  const wall = Math.min(rBot, rTop) * 0.08;

  // Hollow cup via LatheGeometry (profile: outer wall → rim → inner wall → bottom)
  const cupGeometry = useMemo(() => {
    const pts: THREE.Vector2[] = [
      new THREE.Vector2(rBot, -h / 2),        // outer bottom
      new THREE.Vector2(rTop, h / 2),          // outer top
      new THREE.Vector2(rTop - wall, h / 2),   // inner top (rim)
      new THREE.Vector2(rBot - wall, -h / 2),  // inner bottom
      new THREE.Vector2(rBot, -h / 2),         // close bottom disc
    ];
    return new THREE.LatheGeometry(pts, 64);
  }, [rTop, rBot, h, wall]);

  // Logo overlay: open cylinder slightly outside the cup, seam at back
  const logoGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(
      rTop + 0.003, rBot + 0.003, h * 0.95,
      64, 1, true,
      Math.PI, Math.PI * 2  // thetaStart=PI → seam at back, u=0.5 = front
    );
  }, [rTop, rBot, h]);

  const logoTexture = useLogoTexture(logoUrl, logoScale, logoYOffset);

  return (
    <group>
      {/* Cup body — transparent hollow plastic */}
      <mesh geometry={cupGeometry}>
        <meshPhysicalMaterial
          color="#e8eef2"
          transparent
          opacity={0.32}
          roughness={0.12}
          metalness={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Logo wrapped on outer surface */}
      {logoTexture && (
        <mesh geometry={logoGeometry}>
          <meshBasicMaterial
            map={logoTexture}
            transparent
            side={THREE.DoubleSide}
            depthTest
          />
        </mesh>
      )}
    </group>
  );
}

export default function CupViewer3D({ radiusTop, radiusBottom, height, logoUrl, logoScale, logoYOffset }: CupViewer3DProps) {
  const s = 1 / height;
  return (
    <div id="cup-viewer-3d" style={{ width: 380, height: 494 }}>
      <Canvas
        camera={{ position: [0, 0.3, 3], fov: 35 }}
        gl={{ preserveDrawingBuffer: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.9} />
        <directionalLight position={[-3, 2, -2]} intensity={0.3} />
        <directionalLight position={[0, -3, 2]} intensity={0.2} />
        <Cup rTop={radiusTop * s} rBot={radiusBottom * s} h={1} logoUrl={logoUrl} logoScale={logoScale} logoYOffset={logoYOffset} />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={6} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}
