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

    // Fundal alb
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, 64, 64, 8);
    ctx.fill();

    // Banda indigo sus
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.roundRect(0, 0, 64, 22, [8, 8, 0, 0]);
    ctx.fill();

    // Contur subtire
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(1, 1, 62, 62, 8);
    ctx.stroke();

    // Numarul zilei
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 34px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(day, 32, 46);

    // Sterge TOATE favicon-urile existente si seteaza al nostru
    document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());

    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.sizes = '64x64';
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
  }, []);

  return null;
}
