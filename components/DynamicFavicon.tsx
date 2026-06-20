'use client';

import { useEffect } from 'react';

export default function DynamicFavicon() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const day = new Date().getDate().toString();

    // Fundal alb cu colt rotunjite
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 0, 0, 64, 64, 10);
    ctx.fill();

    // Banda rosie sus
    ctx.fillStyle = '#4f46e5';
    roundRect(ctx, 0, 0, 64, 20, 10);
    ctx.fill();
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(0, 10, 64, 10);

    // Contur
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    roundRect(ctx, 1, 1, 62, 62, 10);
    ctx.stroke();

    // Numarul zilei
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(day, 32, 42);

    const link: HTMLLinkElement = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
  }, []);

  return null;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
