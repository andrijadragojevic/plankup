import fs from 'fs';
import { createServer } from 'vite';

// SVG icons for PlankUP with arrow pointing up
const generateSVG = (size) => {
  const scale = size / 192;
  const centerX = size / 2;
  const centerY = size / 2 - 10 * scale;
  const strokeWidth = 8 * scale;

  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg)"/>

  <!-- Arrow pointing up -->
  <g fill="white">
    <!-- Arrow shaft -->
    <line x1="${centerX}" y1="${centerY - 35 * scale}"
          x2="${centerX}" y2="${centerY + 15 * scale}"
          stroke="white" stroke-width="${strokeWidth}"
          stroke-linecap="round"/>

    <!-- Arrow head (triangle) -->
    <polygon points="${centerX},${centerY - 50 * scale} ${centerX - 25 * scale},${centerY - 25 * scale} ${centerX + 25 * scale},${centerY - 25 * scale}"/>
  </g>

  <!-- Text "PlankUP" -->
  <text x="${centerX}" y="${centerY + 50 * scale}"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${32 * scale}" font-weight="bold" fill="white"
        text-anchor="middle" dominant-baseline="middle">PlankUP</text>
</svg>
`;
};

// Write SVG files
fs.writeFileSync('public/icon-192.svg', generateSVG(192));
fs.writeFileSync('public/icon-512.svg', generateSVG(512));

console.log('✅ SVG icons created!');
console.log('\nTo convert to PNG:');
console.log('1. Option 1: Open icon-generator.html in your browser and download the PNGs');
console.log('2. Option 2: Use an online converter like https://cloudconvert.com/svg-to-png');
console.log('3. Option 3: If you have ImageMagick: convert public/icon-192.svg public/icon-192.png');
