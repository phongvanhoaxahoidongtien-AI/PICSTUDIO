/**
 * Generate clean offline demo sample photos using HTML5 Canvas
 * so users can immediately test all editing tools without uploading files.
 */
export function generateSampleImage(theme: 'landscape' | 'portrait' | 'neon'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (theme === 'landscape') {
    // Beautiful sunset landscape with mountains, sun and river
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 600);
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(0.3, '#312e81');
    skyGrad.addColorStop(0.6, '#db2777');
    skyGrad.addColorStop(0.85, '#f97316');
    skyGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1200, 600);

    // Glowing Sun
    const sunGrad = ctx.createRadialGradient(600, 480, 20, 600, 480, 180);
    sunGrad.addColorStop(0, '#fffbeb');
    sunGrad.addColorStop(0.4, '#fde047');
    sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(600, 480, 180, 0, Math.PI * 2);
    ctx.fill();

    // Mountains layer 1 (distant)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, 600);
    ctx.lineTo(200, 380);
    ctx.lineTo(450, 520);
    ctx.lineTo(750, 360);
    ctx.lineTo(1050, 490);
    ctx.lineTo(1200, 420);
    ctx.lineTo(1200, 600);
    ctx.closePath();
    ctx.fill();

    // Mountains layer 2 (darker foreground)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, 600);
    ctx.lineTo(150, 480);
    ctx.lineTo(380, 560);
    ctx.lineTo(600, 460);
    ctx.lineTo(900, 570);
    ctx.lineTo(1200, 490);
    ctx.lineTo(1200, 600);
    ctx.closePath();
    ctx.fill();

    // Water reflection
    const waterGrad = ctx.createLinearGradient(0, 600, 0, 900);
    waterGrad.addColorStop(0, '#e11d48');
    waterGrad.addColorStop(0.3, '#7c3aed');
    waterGrad.addColorStop(0.7, '#1e1b4b');
    waterGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 600, 1200, 300);

    // Sun reflection streaks
    ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    for (let y = 610; y < 860; y += 12) {
      const spread = (y - 600) * 1.8;
      ctx.fillRect(600 - spread / 2, y, spread, 4);
    }
  } else if (theme === 'portrait') {
    // Studio portrait lighting scene
    const bgGrad = ctx.createRadialGradient(600, 450, 50, 600, 450, 650);
    bgGrad.addColorStop(0, '#334155');
    bgGrad.addColorStop(0.7, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 900);

    // Stylized artistic portrait silhouette with warm rim light
    ctx.fillStyle = '#1e293b';
    // Body / Shoulders
    ctx.beginPath();
    ctx.ellipse(600, 850, 320, 220, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillRect(540, 520, 120, 180);

    // Head
    ctx.beginPath();
    ctx.ellipse(600, 400, 170, 210, 0, 0, Math.PI * 2);
    ctx.fill();

    // Warm key light on left edge
    const rimGrad = ctx.createLinearGradient(420, 200, 520, 500);
    rimGrad.addColorStop(0, '#f59e0b');
    rimGrad.addColorStop(0.5, '#ef4444');
    rimGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(600, 400, 170, Math.PI * 0.7, Math.PI * 1.3);
    ctx.stroke();

    // Cool rim light on right edge
    const coolGrad = ctx.createLinearGradient(700, 200, 800, 500);
    coolGrad.addColorStop(0, '#38bdf8');
    coolGrad.addColorStop(0.6, '#6366f1');
    coolGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = coolGrad;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(600, 400, 170, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.stroke();
  } else {
    // Cyberpunk Neon City
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, 1200, 900);

    // Neon skyline buildings
    const colors = ['#ec4899', '#38bdf8', '#a855f7', '#06b6d4'];
    for (let i = 0; i < 16; i++) {
      const bx = i * 75 + 10;
      const bw = 60;
      const bh = 300 + Math.sin(i * 1.5) * 200;
      const by = 900 - bh;

      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(bx, by, bw, bh);

      // Building lights
      const col = colors[i % colors.length];
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.6;
      for (let wy = by + 20; wy < 880; wy += 35) {
        ctx.fillRect(bx + 12, wy, 12, 18);
        ctx.fillRect(bx + 34, wy, 12, 18);
      }
      ctx.globalAlpha = 1.0;
    }

    // Neon sign
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 25;
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 8;
    ctx.strokeRect(380, 180, 440, 140);

    ctx.font = 'bold 54px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('LUMIX STUDIO', 600, 270);
    ctx.shadowBlur = 0;
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}
