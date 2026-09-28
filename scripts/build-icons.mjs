import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgBuffer = fs.readFileSync('public/icon.svg');

async function run() {
  await sharp(svgBuffer).resize(192, 192).png().toFile('public/pwa-192x192.png');
  await sharp(svgBuffer).resize(512, 512).png().toFile('public/pwa-512x512.png');
  // Maskable icon with 15% padding
  await sharp(svgBuffer)
    .resize(400, 400)
    .extend({
      top: 56,
      bottom: 56,
      left: 56,
      right: 56,
      background: { r: 9, g: 13, b: 22, alpha: 1 }
    })
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(svgBuffer).resize(64, 64).png().toFile('public/favicon.ico');
  console.log('Icons generated successfully!');
}

run().catch(console.error);
