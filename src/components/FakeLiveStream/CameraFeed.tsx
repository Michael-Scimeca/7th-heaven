'use client';

import React, { useRef, useEffect } from 'react';

export function CameraFeed({ crewColor = '#a855f7' }: { crewColor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };
    const accent = hexToRgb(crewColor.length === 7 ? crewColor : '#a855f7');

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = (ts: number) => {
      frameRef.current = requestAnimationFrame(draw);
      const t = ts / 1000;
      timeRef.current = t;
      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) return;

      ctx.fillStyle = '#040408';
      ctx.fillRect(0, 0, W, H);

      const ambH = H * 0.55;
      const amb = ctx.createLinearGradient(0, H - ambH, 0, H);
      amb.addColorStop(0, `rgba(${accent.r},${accent.g},${accent.b},0.0)`);
      amb.addColorStop(0.5, `rgba(${accent.r},${accent.g},${accent.b},0.06)`);
      amb.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = amb;
      ctx.fillRect(0, H - ambH, W, ambH);

      const beams = [
        { xFrac: 0.18, phase: 0, colorH: (t * 40) % 360 },
        { xFrac: 0.50, phase: Math.PI / 3, colorH: (t * 40 + 120) % 360 },
        { xFrac: 0.78, phase: Math.PI / 1.5, colorH: (t * 40 + 240) % 360 },
      ];
      beams.forEach((b) => {
        const swing = Math.sin(t * 0.7 + b.phase) * (W * 0.06);
        const bx = W * b.xFrac + swing;
        const topW = 8;
        const botW = 90 + Math.sin(t * 0.3 + b.phase) * 10;
        const beamH = H * 0.72;
        const grad = ctx.createLinearGradient(bx, 0, bx, beamH);
        grad.addColorStop(0, `hsla(${b.colorH},100%,75%,0.25)`);
        grad.addColorStop(0.7, `hsla(${b.colorH},100%,65%,0.08)`);
        grad.addColorStop(1, `hsla(${b.colorH},100%,55%,0)`);
        ctx.beginPath();
        ctx.moveTo(bx - topW / 2, 0);
        ctx.lineTo(bx + topW / 2, 0);
        ctx.lineTo(bx + botW / 2, beamH);
        ctx.lineTo(bx - botW / 2, beamH);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx, 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${b.colorH},100%,90%,0.6)`;
        ctx.fill();
      });

      const px = W / 2 + Math.sin(t * 0.4) * (W * 0.01);
      const py = H * 0.78;
      const scale = H * 0.0018;
      ctx.save();
      ctx.translate(px, py);
      const bodyGlow = ctx.createRadialGradient(0, -60 * scale, 0, 0, -60 * scale, 120 * scale);
      bodyGlow.addColorStop(0, `rgba(${accent.r},${accent.g},${accent.b},0.18)`);
      bodyGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bodyGlow;
      ctx.fillRect(-100 * scale, -200 * scale, 200 * scale, 220 * scale);
      ctx.fillStyle = 'rgba(0,0,0,0.92)';
      ctx.beginPath(); ctx.moveTo(-20 * scale, 0); ctx.lineTo(-28 * scale, -120 * scale); ctx.lineTo(-8 * scale, -120 * scale); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(20 * scale, 0); ctx.lineTo(28 * scale, -120 * scale); ctx.lineTo(8 * scale, -120 * scale); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-28 * scale, -120 * scale); ctx.lineTo(28 * scale, -120 * scale); ctx.lineTo(22 * scale, -210 * scale); ctx.lineTo(-22 * scale, -210 * scale); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -228 * scale, 22 * scale, 0, Math.PI * 2); ctx.fill();
      const armAngle = Math.sin(t * 2.1) * 0.15;
      ctx.save(); ctx.translate(-22 * scale, -180 * scale); ctx.rotate(armAngle - 0.3);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-55 * scale, 40 * scale);
      ctx.strokeStyle = 'rgba(0,0,0,0.95)'; ctx.lineWidth = 10 * scale; ctx.stroke();
      ctx.restore();
      ctx.restore();

      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.beginPath();
      ctx.moveTo(0, H);
      const crowdPts = 32;
      for (let i = 0; i <= crowdPts; i++) {
        const cx = (i / crowdPts) * W;
        const bobble = Math.sin(t * 1.8 + i * 0.9) * (H * 0.008);
        const baseH = H * (0.85 + 0.03 * Math.sin(i * 0.7));
        ctx.lineTo(cx, baseH + bobble);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      const floorGrad = ctx.createLinearGradient(0, H * 0.8, 0, H);
      floorGrad.addColorStop(0, 'rgba(0,0,0,0)');
      floorGrad.addColorStop(1, `rgba(${accent.r},${accent.g},${accent.b},0.12)`);
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, H * 0.8, W, H * 0.2);

      const shakeMag = 0.5;
      const shakeX = (Math.sin(t * 13.7) + Math.sin(t * 7.3)) * shakeMag;
      const shakeY = (Math.cos(t * 11.1) + Math.cos(t * 5.9)) * shakeMag;

      const imageData = ctx.getImageData(0, 0, W, H);
      const data = imageData.data;
      const grainAmt = 28;
      for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random() - 0.5) * grainAmt;
        data[i] = Math.min(255, Math.max(0, data[i] + grain));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
      }
      ctx.putImageData(imageData, shakeX, shakeY);

      for (let y = 0; y < H; y += 3) {
        ctx.fillStyle = 'rgba(0,0,0,0.07)';
        ctx.fillRect(0, y, W, 1);
      }

      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = 0.04 + Math.sin(t * 0.3) * 0.01;
      ctx.fillStyle = 'white';
      ctx.font = `bold ${W * 0.09}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('7TH HEAVEN', W / 2, H * 0.42);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = 'red';
      ctx.fillRect(-1, 0, W, H);
      ctx.fillStyle = 'cyan';
      ctx.fillRect(1, 0, W, H);
      ctx.restore();

      const now = new Date();
      const tc = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}:${String(Math.floor((ts % 1000) / 33)).padStart(2, '0')}`;
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = 'white';
      ctx.font = `${Math.max(10, W * 0.013)}px monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`TC ${tc}  CAM-1  1080i`, W * 0.02, H * 0.97);
      ctx.restore();
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, [crewColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
