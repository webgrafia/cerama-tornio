/**
 * Math and profile deformation utilities for the 3D Pottery Wheel.
 */

/**
 * Calculates Gaussian influence (bell-curve multiplier) based on vertical distance.
 * This determines how much neighboring points deform based on the user's touch.
 * 
 * @param y - Height of the point being calculated
 * @param yHit - Height where the user is touching/deforming the clay
 * @param sigma - The brush size or range of influence
 */
export function gaussianInfluence(y: number, yHit: number, sigma: number): number {
  const diff = y - yHit;
  return Math.exp(-(diff * diff) / (2 * sigma * sigma));
}

/**
 * Applies Laplacian-style smoothing to the profile radii to avoid jagged ridges
 * and ensure that hand-shaped curves look organic and satisfying.
 * 
 * @param radii - Current array of profile radii
 * @param factor - Smoothing weight (0 = no smoothing, 1 = complete blend)
 * @param preserveEnds - If true, keeps the top and bottom radii unchanged
 */
export function smoothProfile(radii: number[], factor = 0.2, preserveEnds = true): number[] {
  const n = radii.length;
  if (n < 3) return [...radii];

  const smoothed = [...radii];
  
  // Apply smoothing pass
  for (let i = 1; i < n - 1; i++) {
    const averageNeighbor = (radii[i - 1] + radii[i + 1]) / 2;
    smoothed[i] = radii[i] + (averageNeighbor - radii[i]) * factor;
  }

  if (!preserveEnds) {
    // Softly smooth the base and rim points towards their immediate neighbor
    smoothed[0] = radii[0] + (radii[1] - radii[0]) * (factor * 0.5);
    smoothed[n - 1] = radii[n - 1] + (radii[n - 2] - radii[n - 1]) * (factor * 0.5);
  }

  return smoothed;
}

/**
 * Generates an initial profile shape based on a type.
 * Returns an array of N radii values.
 * 
 * @param type - 'cylinder' | 'sphere' | 'cone' | 'urn'
 * @param N - Number of vertical slices
 * @param baseRadius - Default starting radius
 */
export function generateInitialProfile(
  type: 'cylinder' | 'sphere' | 'cone' | 'urn',
  N: number,
  baseRadius = 0.4
): number[] {
  const radii: number[] = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1); // vertical percentage from 0 to 1
    
    switch (type) {
      case 'sphere':
        // Rounded pancia (belly) in the middle
        const angle = t * Math.PI;
        radii.push(baseRadius * (0.65 + Math.sin(angle) * 0.65));
        break;
      case 'cone':
        // Flare outwards towards the bottom (wide bottom, narrow top to match the icon)
        radii.push(baseRadius * (1.3 - t * 0.6));
        break;
      case 'urn':
        // Classic urn shape matching the icon:
        // - Base: medium
        // - Belly (lower-middle): wide
        // - Neck (upper-middle): narrow
        // - Rim (top): flared
        const neckHeight = 0.72;
        if (t < neckHeight) {
          const t2 = t / neckHeight;
          // Belly curve
          const factor = 0.75 + Math.sin(t2 * Math.PI) * 0.65;
          radii.push(baseRadius * factor);
        } else {
          const t2 = (t - neckHeight) / (1.0 - neckHeight);
          // Rim flare curve
          const factor = 0.75 + t2 * 0.35;
          radii.push(baseRadius * factor);
        }
        break;
      case 'cylinder':
      default:
        // A direct, neat cylinder block of clay
        radii.push(baseRadius);
        break;
    }
  }
  return radii;
}
