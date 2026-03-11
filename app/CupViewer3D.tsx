'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CupViewer3DProps {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  logoUrl: string | null;
  logoScale: number;
  logoYOffset: number;
  printColor?: string;
  capacity?: string;
  rotating?: boolean;
}

export default function CupViewer3D({ radiusTop, radiusBottom, height, logoUrl, logoScale, logoYOffset, printColor = '#000000', capacity, rotating = false }: CupViewer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImg = useRef<HTMLImageElement | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const animFrameRef = useRef<number>(0);
  const rotationRef = useRef(0);

  // Load logo image
  useEffect(() => {
    if (!logoUrl) {
      logoImg.current = null;
      setLogoLoaded(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      logoImg.current = img;
      setLogoLoaded(true);
    };
    img.onerror = () => {
      logoImg.current = null;
      setLogoLoaded(false);
    };
    img.src = logoUrl;
    return () => { img.onload = null; img.onerror = null; };
  }, [logoUrl]);

  // Draw cup on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 380;
    const H = 494;
    canvas.width = W * 2; // retina
    canvas.height = H * 2;
    ctx.scale(2, 2);

    // Cup grows slightly with size — height drives a subtle scale (200ml→0.85, 500ml→1.0)
    const t = Math.min(1, Math.max(0, (height - 65) / (105 - 65))); // 0..1 from smallest to largest
    const scale = 0.85 + t * 0.15;
    const cupH = 280 * scale;
    const topR = 90 * scale;
    const botR = 60 * scale;
    const cx = W / 2;
    const topY = (H - cupH) / 2 - 10;
    const botY = topY + cupH;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#1a1a2e');
      bgGrad.addColorStop(0.5, '#16213e');
      bgGrad.addColorStop(1, '#0f3460');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Floor reflection
      ctx.save();
      ctx.globalAlpha = 0.08;
      const floorGrad = ctx.createRadialGradient(cx, botY + 30, 10, cx, botY + 30, topR * 1.5);
      floorGrad.addColorStop(0, '#ffffff');
      floorGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, botY + 10, W, 60);
      ctx.restore();

      // Shadow under cup
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(cx, botY + 8, botR * 0.8, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();

      // Cup body
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - topR, topY);
      ctx.lineTo(cx - botR, botY);
      ctx.lineTo(cx + botR, botY);
      ctx.lineTo(cx + topR, topY);
      ctx.closePath();

      // Glass gradient
      const bodyGrad = ctx.createLinearGradient(cx - topR, 0, cx + topR, 0);
      bodyGrad.addColorStop(0, 'rgba(140,170,200,0.35)');
      bodyGrad.addColorStop(0.15, 'rgba(180,210,235,0.5)');
      bodyGrad.addColorStop(0.35, 'rgba(220,240,255,0.65)');
      bodyGrad.addColorStop(0.5, 'rgba(200,225,245,0.55)');
      bodyGrad.addColorStop(0.7, 'rgba(170,200,225,0.45)');
      bodyGrad.addColorStop(0.85, 'rgba(150,180,210,0.4)');
      bodyGrad.addColorStop(1, 'rgba(120,155,190,0.3)');
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Cup outline
      ctx.strokeStyle = 'rgba(180,210,240,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Logo on cup (monochrome in selected print color) with cylindrical distortion
      const drawLogo = (rotation: number) => {
        if (!logoImg.current || !logoLoaded) return;
        ctx.save();
        // Clip to cup body
        ctx.beginPath();
        ctx.moveTo(cx - topR + 4, topY + 4);
        ctx.lineTo(cx - botR + 4, botY - 4);
        ctx.lineTo(cx + botR - 4, botY - 4);
        ctx.lineTo(cx + topR - 4, topY + 4);
        ctx.closePath();
        ctx.clip();

        const s = logoScale / 100;
        const logoAreaW = (topR + botR) * 0.7 * s;
        const logoAreaH = cupH * 0.5 * s;
        const img = logoImg.current;
        const imgRatio = Math.min(logoAreaW / img.width, logoAreaH / img.height);
        const baseDrawW = img.width * imgRatio;
        const drawH = img.height * imgRatio;
        const yOff = (logoYOffset / 100) * cupH * 0.25;
        const drawY = topY + (cupH - drawH) / 2 + yOff - cupH * 0.06;

        // Pre-render monochrome logo at full resolution to offscreen canvas
        const srcW = Math.max(1, Math.ceil(baseDrawW * 2));
        const srcH = Math.max(1, Math.ceil(drawH * 2));
        const offCanvas = document.createElement('canvas');
        offCanvas.width = srcW;
        offCanvas.height = srcH;
        const offCtx = offCanvas.getContext('2d')!;
        offCtx.drawImage(img, 0, 0, srcW, srcH);

        const imgData = offCtx.getImageData(0, 0, srcW, srcH);
        const px = imgData.data;
        const pR = parseInt(printColor.slice(1, 3), 16);
        const pG = parseInt(printColor.slice(3, 5), 16);
        const pB = parseInt(printColor.slice(5, 7), 16);
        for (let i = 0; i < px.length; i += 4) {
          const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
          const intensity = 1 - lum / 255;
          px[i] = pR;
          px[i + 1] = pG;
          px[i + 2] = pB;
          px[i + 3] = Math.round(px[i + 3] * intensity);
        }
        offCtx.putImageData(imgData, 0, 0);

        // Cylindrical mapping: render logo in vertical slices wrapped around cup
        const numSlices = Math.ceil(baseDrawW);
        // Angular span the logo covers on the cylinder (~120° for full-width logo)
        const angularSpan = (baseDrawW / topR) * 1.1;

        for (let i = 0; i < numSlices; i++) {
          const u = (i / numSlices) - 0.5; // -0.5 to 0.5 across logo width
          const angle = rotation + u * angularSpan;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);

          // Skip slices on the back of the cylinder
          if (cosA <= 0) continue;

          // X position on screen: sin maps angle to horizontal position
          const screenX = cx + sinA * topR * 0.85;
          // Width of this slice (foreshortened by cosine)
          const sliceScreenW = (angularSpan / numSlices) * topR * 0.85 * cosA;

          if (sliceScreenW < 0.1) continue;

          // Source slice from the pre-rendered logo
          const srcX = (i / numSlices) * srcW;
          const srcSliceW = srcW / numSlices;

          // Alpha: fade based on how much the surface faces the viewer
          ctx.globalAlpha = 0.92 * cosA;

          ctx.drawImage(
            offCanvas,
            srcX, 0, Math.max(1, srcSliceW), srcH,
            screenX - sliceScreenW / 2, drawY, Math.max(0.5, sliceScreenW), drawH
          );
        }

        ctx.restore();
      };

      drawLogo(rotationRef.current);

      // Shine highlight (left)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - topR + topR * 0.15, topY + 5);
      ctx.lineTo(cx - botR + botR * 0.15, botY - 5);
      ctx.lineTo(cx - botR + botR * 0.3, botY - 5);
      ctx.lineTo(cx - topR + topR * 0.3, topY + 5);
      ctx.closePath();
      const shineGrad = ctx.createLinearGradient(cx - topR, 0, cx - topR + topR * 0.4, 0);
      shineGrad.addColorStop(0, 'rgba(255,255,255,0)');
      shineGrad.addColorStop(0.5, 'rgba(255,255,255,0.35)');
      shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shineGrad;
      ctx.fill();
      ctx.restore();

      // Center shine
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - topR * 0.05, topY + 8);
      ctx.lineTo(cx - botR * 0.02, botY - 8);
      ctx.lineTo(cx + botR * 0.12, botY - 8);
      ctx.lineTo(cx + topR * 0.15, topY + 8);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
      ctx.restore();

      // Rim (top ellipse)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, topY, topR, 8, 0, 0, Math.PI * 2);
      const rimGrad = ctx.createLinearGradient(cx - topR, topY - 8, cx + topR, topY + 8);
      rimGrad.addColorStop(0, 'rgba(200,220,240,0.7)');
      rimGrad.addColorStop(0.3, 'rgba(240,248,255,0.9)');
      rimGrad.addColorStop(0.7, 'rgba(220,235,250,0.8)');
      rimGrad.addColorStop(1, 'rgba(180,205,230,0.6)');
      ctx.fillStyle = rimGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,210,240,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Inner rim
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, topY, topR - 3, 5.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(25,40,60,0.15)';
      ctx.fill();
      ctx.restore();

      // Bottom ellipse
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, botY, botR, 4, 0, 0, Math.PI * 2);
      const baseGrad = ctx.createLinearGradient(cx - botR, botY, cx + botR, botY);
      baseGrad.addColorStop(0, 'rgba(140,165,190,0.5)');
      baseGrad.addColorStop(0.5, 'rgba(180,200,220,0.6)');
      baseGrad.addColorStop(1, 'rgba(140,165,190,0.5)');
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.restore();

      // "O Seu Logo" placeholder when no logo
      if (!logoImg.current || !logoLoaded) {
        const cosR = Math.cos(rotationRef.current);
        const sinR = Math.sin(rotationRef.current);
        const placeholderAlpha = Math.max(0, cosR);
        if (placeholderAlpha > 0.05) {
          ctx.save();
          ctx.globalAlpha = 0.4 * placeholderAlpha;
          const placeholderY = topY + cupH * 0.25;
          const pw = topR * 0.9 * Math.abs(cosR);
          const ph = cupH * 0.25;
          const screenX = cx + sinR * topR * 0.85;
          ctx.setLineDash([4, 3]);
          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(screenX - pw / 2, placeholderY, pw, ph);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.font = '600 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('O SEU LOGO', screenX, placeholderY + ph / 2 + 4);
          ctx.restore();
        }
      }

      // Cup size label
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '600 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(capacity || '', cx, botY + 25);
      ctx.restore();
    };

    // Animation loop or single draw
    cancelAnimationFrame(animFrameRef.current);

    if (rotating) {
      const animate = () => {
        rotationRef.current += 0.015;
        draw();
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      rotationRef.current = 0;
      draw();
    }

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [height, logoScale, logoYOffset, logoLoaded, printColor, capacity, rotating]);

  return (
    <div id="cup-viewer-3d" style={{ width: 380, height: 494, borderRadius: 12, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ width: 380, height: 494 }}
      />
    </div>
  );
}
