import * as THREE from 'three';
import type { GlazePreset } from '../store/usePotteryStore';

/**
 * Generates a dynamic, procedural normal map canvas to simulate rotating wheel grooves and hand finger ridges.
 * The finger ridges are spiral/helical, which breaks rotational symmetry and creates moving specular highlights
 * as the clay rotates on the wheel.
 */
export function createClayGrooveNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Fill neutral normal vector: (128, 128, 255) -> hex #8080ff
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 512, 512);

    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      // Horizontal grooves (concentric ring ridges)
      const frequency1 = 0.08;
      const frequency2 = 0.35;
      const amplitude1 = 10;
      const amplitude2 = 2.5;
      
      const slopeY = Math.cos(y * frequency1) * (amplitude1 * frequency1) + Math.cos(y * frequency2) * (amplitude2 * frequency2);
      const greenVal = Math.max(0, Math.min(255, 128 + Math.round(slopeY * 45)));

      // Add vertical/helical finger markings and noise
      for (let x = 0; x < 512; x++) {
        const offset = (y * 512 + x) * 4;
        
        // Helper angle wrapping around the Y-axis circumference
        const angle = (x / 512) * Math.PI * 2;
        // Spiral ridges that twist upwards
        const spiralFreq = 4.0; // 4 main hand pressure lines
        const spiralSlopeX = Math.cos(angle * spiralFreq + (y / 512) * Math.PI * 6.0) * 12.0;
        const spiralSlopeY = Math.sin(angle * spiralFreq + (y / 512) * Math.PI * 6.0) * 6.0;

        const noise = (Math.random() - 0.5) * 6; // subtle clay grain grit

        // Red (X) channel is normal tilt horizontally. This makes highlights spin!
        const redVal = Math.max(0, Math.min(255, 128 + Math.round(spiralSlopeX + noise)));
        // Green (Y) channel combines horizontal grooves and vertical spiral slopes
        const finalGreen = Math.max(0, Math.min(255, greenVal + Math.round(spiralSlopeY + noise)));

        data[offset] = redVal;
        data[offset + 1] = finalGreen;
        data[offset + 2] = 255;
        data[offset + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4); // Repeat vertically to tighten rings
  return texture;
}

/**
 * Generates organic color streaks on the wet clay (finger prints and dark/light clay veins)
 * so that when the clay spins, the user physically sees the colors revolving.
 */
export function createClayColorMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Base natural red terracotta clay color (Colorobbia SoftArt style)
    ctx.fillStyle = '#a56251';
    ctx.fillRect(0, 0, 512, 512);

    // Render soft, vertical hand smudges (lighter rose vs darker earthy clay veins)
    for (let i = 0; i < 8; i++) {
      const xStart = Math.random() * 512;
      const width = 50 + Math.random() * 90;
      
      const grad = ctx.createLinearGradient(xStart - width / 2, 0, xStart + width / 2, 0);
      const isDark = Math.random() > 0.45;
      const color = isDark ? '110, 54, 40' : '210, 160, 148'; // dark terracotta vein vs lighter rose-salmon dust
      const opacity = 0.08 + Math.random() * 0.12;

      grad.addColorStop(0, `rgba(${color}, 0)`);
      grad.addColorStop(0.5, `rgba(${color}, ${opacity})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);

      ctx.fillStyle = grad;
      
      // Draw wavy path to represent hand sliding vertically while clay is wet
      ctx.beginPath();
      ctx.moveTo(xStart - 50, 0);
      ctx.bezierCurveTo(xStart + 80, 150, xStart - 80, 350, xStart + 50, 512);
      ctx.lineTo(xStart + 50 + width, 512);
      ctx.bezierCurveTo(xStart - 80 + width, 350, xStart + 80 + width, 150, xStart - 50 + width, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Add very light overall noise texture to keep it organic
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    for (let i = 0; i < 1500; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates a light silver aluminum-finished rotating platter map
 * with concentric grooves and realistic clay details matching the banding wheel.
 */
export function createWheelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Light silver-gray base (aluminum)
    ctx.fillStyle = '#d8dbde';
    ctx.fillRect(0, 0, 512, 512);

    // Concentric lines matching the photo (thin dark circles)
    ctx.strokeStyle = '#a6aaae';
    const rings = [60, 64, 110, 114, 170, 174, 220, 224];
    rings.forEach(r => {
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Radial brushed aluminum details (light reflections)
    for (let i = 0; i < 180; i++) {
      const angle = (i / 180) * Math.PI * 2;
      const x1 = 256 + Math.cos(angle) * 20;
      const y1 = 256 + Math.sin(angle) * 20;
      const x2 = 256 + Math.cos(angle) * 250;
      const y2 = 256 + Math.sin(angle) * 250;
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 + Math.random() * 0.12})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    // Add darker metal brushing grain
    for (let i = 0; i < 90; i++) {
      const angle = (Math.random()) * Math.PI * 2;
      const x1 = 256 + Math.cos(angle) * 40;
      const y1 = 256 + Math.sin(angle) * 40;
      const x2 = 256 + Math.cos(angle) * 245;
      const y2 = 256 + Math.sin(angle) * 245;
      
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.02 + Math.random() * 0.03})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Subtle wet terracotta clay smudges (semi-transparent red-brown)
    ctx.fillStyle = 'rgba(165, 98, 81, 0.22)';
    
    // Splash 1
    ctx.beginPath();
    ctx.arc(170, 180, 12, 0, Math.PI * 2);
    ctx.fill();

    // Splash 2
    ctx.beginPath();
    ctx.arc(330, 310, 18, 0, Math.PI * 2);
    ctx.fill();

    // Droplets
    ctx.fillStyle = 'rgba(165, 98, 81, 0.38)';
    ctx.beginPath();
    ctx.arc(280, 140, 4, 0, Math.PI * 2);
    ctx.arc(120, 320, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates a tileable canvas texture representing the "speckled" iron spots in organic glazes
 */
export function createSpeckleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Draw random speckles of varying size and opacity
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = 0.5 + Math.random() * 1.5;
      const opacity = 0.15 + Math.random() * 0.45;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(30, 20, 10, ${opacity})`;
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  return texture;
}

/**
 * Creates a tileable canvas texture representing crackle glaze cavilli (Celadon style)
 */
export function createCrackleNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Fill neutral normal vector
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 512, 512);

    // Procedural cell-like crackle pattern (Voronoi/Cellular-esque simplified lines)
    ctx.strokeStyle = '#6060ff';
    ctx.lineWidth = 1.0;

    // Draw random cracks mimicking crackle glass shrinkage
    const points: [number, number][] = [];
    for (let i = 0; i < 30; i++) {
      points.push([Math.random() * 512, Math.random() * 512]);
    }

    // Connect points to form network of cracks
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      // Connect to nearest 2 points
      const distances = points
        .map((p, idx) => ({ idx, dist: Math.hypot(p[0] - p1[0], p[1] - p1[1]) }))
        .filter(d => d.idx !== i)
        .sort((a, b) => a.dist - b.dist);

      for (let k = 0; k < 2; k++) {
        if (distances[k]) {
          const p2 = points[distances[k].idx];
          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          // Slightly wobbly crack lines
          const midX = (p1[0] + p2[0]) / 2 + (Math.random() - 0.5) * 15;
          const midY = (p1[1] + p2[1]) / 2 + (Math.random() - 0.5) * 15;
          ctx.quadraticCurveTo(midX, midY, p2[0], p2[1]);
          ctx.stroke();
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 6);
  return texture;
}

// Keep single instances of procedural textures to avoid GPU memory leaks
let cachedGrooveNormalMap: THREE.CanvasTexture | null = null;
let cachedClayColorMap: THREE.CanvasTexture | null = null;
let cachedWheelTexture: THREE.CanvasTexture | null = null;
let cachedSpeckleMap: THREE.CanvasTexture | null = null;
let cachedCrackleNormalMap: THREE.CanvasTexture | null = null;

export function getGrooveNormalMap() {
  if (!cachedGrooveNormalMap) cachedGrooveNormalMap = createClayGrooveNormalMap();
  return cachedGrooveNormalMap;
}

export function getClayColorMap() {
  if (!cachedClayColorMap) cachedClayColorMap = createClayColorMap();
  return cachedClayColorMap;
}

export function getWheelTexture() {
  if (!cachedWheelTexture) cachedWheelTexture = createWheelTexture();
  return cachedWheelTexture;
}

export function getSpeckleMap() {
  if (!cachedSpeckleMap) cachedSpeckleMap = createSpeckleTexture();
  return cachedSpeckleMap;
}

export function getCrackleNormalMap() {
  if (!cachedCrackleNormalMap) cachedCrackleNormalMap = createCrackleNormalMap();
  return cachedCrackleNormalMap;
}

/**
 * Configures a Three.js MeshPhysicalMaterial based on the selected glaze preset.
 * 
 * @param preset - The selected GlazePreset from the store
 * @param isGlazed - If false, renders wet unfinished clay
 */
export function updatePhysicalMaterial(
  material: THREE.MeshPhysicalMaterial,
  preset: GlazePreset,
  isGlazed: boolean
) {
  const grooveMap = getGrooveNormalMap();
  const clayColorMap = getClayColorMap();
  const crackleMap = getCrackleNormalMap();

  // Always keep color as white and map as clayColorMap so that the custom fragment shader has UVs and samples correctly
  material.color.set('#ffffff');
  material.map = clayColorMap;

  if (!isGlazed) {
    // Phase 1: Wet, uncolored gray/terracotta shaping clay with visible rotating lines and smudges
    material.roughness = 0.45;
    material.metalness = 0.05;
    material.clearcoat = 0.12;     // slight wetness sheen
    material.clearcoatRoughness = 0.5;
    material.normalMap = grooveMap;
    material.normalScale.set(0.45, 0.45);
    return;
  }

  // Phase 2: High-end Glaze Applied
  material.roughness = preset.roughness;
  material.metalness = preset.metalness;
  material.clearcoat = preset.clearcoat;
  material.clearcoatRoughness = preset.clearcoatRoughness;

  // Combined normal mapping (Wheel grooves + Celadon cracks if applicable)
  if (preset.crackle) {
    material.normalMap = crackleMap;
    material.normalScale.set(0.35, 0.35);
  } else {
    // Keep subtle wheel grooves under the glaze to maintain handmade clay feeling
    material.normalMap = grooveMap;
    material.normalScale.set(0.1, 0.1);
  }
}
