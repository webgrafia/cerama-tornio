import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { usePotteryStore, N_POINTS, VASE_HEIGHT, CLAY_TERRACOTTA } from '../../store/usePotteryStore';
import { updatePhysicalMaterial, getClayColorMap, getSpeckleMap } from '../../three/materials';

export const Vase: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geoRef = useRef<THREE.LatheGeometry>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const paintRingRef = useRef<THREE.Mesh>(null);

  const {
    step,
    radii,
    glazeColors,
    glazeIntensity,
    paintColor,
    brushSize,
    wheelSpeed,
    deformProfile,
    pushHistory,
    selectedGlaze,
    incrementInteraction
  } = usePotteryStore();

  const { raycaster, camera } = useThree();
  const isDragging = useRef(false);
  const activeYHit = useRef<number | null>(null);

  // 1. Double-back profile spline calculation to generate wall thickness
  const points = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const t = 0.07; // wall thickness of the clay vase
    
    // Bottom flat outer boundary
    pts.push(new THREE.Vector2(0, 0));
    pts.push(new THREE.Vector2(radii[0], 0));
    
    // Outer wall profile (going up)
    for (let i = 0; i < N_POINTS; i++) {
      const y = (i / (N_POINTS - 1)) * VASE_HEIGHT;
      pts.push(new THREE.Vector2(radii[i], y));
    }
    
    // Rim top rounding
    const rimRadius = radii[N_POINTS - 1];
    pts.push(new THREE.Vector2(rimRadius - t * 0.3, VASE_HEIGHT + t * 0.15));
    pts.push(new THREE.Vector2(rimRadius - t, VASE_HEIGHT));
    
    // Inner wall profile (going down)
    for (let i = N_POINTS - 1; i >= 0; i--) {
      const y = (i / (N_POINTS - 1)) * VASE_HEIGHT;
      
      // X coordinate is shifted inwards by thickness
      const innerX = Math.max(0.015, radii[i] - t);
      // Y coordinate is shifted slightly upwards to form the inner bottom floor
      const innerY = Math.max(t * 0.8, y + t * 0.2);
      
      pts.push(new THREE.Vector2(innerX, innerY));
    }
    
    // Bottom center inside floor boundary
    pts.push(new THREE.Vector2(0, t * 0.8));
    
    return pts;
  }, [radii]);

  // 2. Generate a custom flat float array for vertex colors corresponding to Lathe indices
  const vertexColorsBuffer = useMemo(() => {
    const K = points.length; // e.g. 85 profile points
    const segments = 64;
    const count = (segments + 1) * K;
    const colorsArray = new Float32Array(count * 3);

    // Parse clay terracotta base color
    const clayColor = new THREE.Color(CLAY_TERRACOTTA);
    const clayR = clayColor.r;
    const clayG = clayColor.g;
    const clayB = clayColor.b;

    // Cache R, G, B colors for our glazeColors
    const parsedColors = glazeColors.map(hex => {
      const col = new THREE.Color(hex);
      return [col.r, col.g, col.b];
    });

    for (let s = 0; s <= segments; s++) {
      for (let p = 0; p < K; p++) {
        const vertexIdx = s * K + p;
        const offset = vertexIdx * 3;

        let r = clayR;
        let g = clayG;
        let b = clayB;

        if (p === 0 || p === 1) {
          // outer base
          [r, g, b] = parsedColors[0];
        } else if (p >= 2 && p < 2 + N_POINTS) {
          // outer wall profile
          const idx = p - 2;
          [r, g, b] = parsedColors[idx];
        } else if (p === 2 + N_POINTS || p === 2 + N_POINTS + 1) {
          // top rim
          [r, g, b] = parsedColors[N_POINTS - 1];
        } else if (p >= 2 + N_POINTS + 2 && p < 2 + 2 * N_POINTS + 2) {
          // inner wall profile
          const idx = N_POINTS - 1 - (p - (2 + N_POINTS + 2));
          [r, g, b] = parsedColors[idx];
        } else if (p === 2 + 2 * N_POINTS + 2) {
          // center bottom inside
          [r, g, b] = parsedColors[0];
        }

        colorsArray[offset] = r;
        colorsArray[offset + 1] = g;
        colorsArray[offset + 2] = b;
      }
    }
    return colorsArray;
  }, [points, glazeColors]);

  // 3. Generate a custom flat float array for glaze intensity
  const glazeIntensityBuffer = useMemo(() => {
    const K = points.length;
    const segments = 64;
    const count = (segments + 1) * K;
    const intensityArray = new Float32Array(count);

    if (step === 'intro' || step === 'shape') {
      intensityArray.fill(0.0);
      return intensityArray;
    }

    for (let s = 0; s <= segments; s++) {
      for (let p = 0; p < K; p++) {
        const vertexIdx = s * K + p;
        let intensity = 0.0;

        if (p === 0 || p === 1) {
          intensity = glazeIntensity[0];
        } else if (p >= 2 && p < 2 + N_POINTS) {
          intensity = glazeIntensity[p - 2];
        } else if (p === 2 + N_POINTS || p === 2 + N_POINTS + 1) {
          intensity = glazeIntensity[N_POINTS - 1];
        } else if (p >= 2 + N_POINTS + 2 && p < 2 + 2 * N_POINTS + 2) {
          const idx = N_POINTS - 1 - (p - (2 + N_POINTS + 2));
          intensity = glazeIntensity[idx];
        } else if (p === 2 + 2 * N_POINTS + 2) {
          intensity = glazeIntensity[0];
        }

        intensityArray[vertexIdx] = intensity;
      }
    }
    return intensityArray;
  }, [points, glazeIntensity, step]);

  // Force GPU to update geometry buffers when colors or intensities modify
  useEffect(() => {
    if (geoRef.current) {
      const colorAttr = geoRef.current.attributes.color;
      if (colorAttr) {
        colorAttr.needsUpdate = true;
      }
      const intensityAttr = geoRef.current.attributes.aGlazeIntensity;
      if (intensityAttr) {
        intensityAttr.needsUpdate = true;
      }
    }
  }, [vertexColorsBuffer, glazeIntensityBuffer]);

  // 3. Continuous rotation of the wheel
  useFrame((state, delta) => {
    // Rotate the entire vase mesh
    if (meshRef.current) {
      meshRef.current.rotation.y += wheelSpeed * delta;
    }

    // Smoothly position and hide/show the painting brush guide ring
    if (paintRingRef.current) {
      if (activeYHit.current !== null && step === 'glaze') {
        paintRingRef.current.visible = true;
        paintRingRef.current.position.y = activeYHit.current;

        // Position corresponding outer radius to surround the vase nicely
        const index = Math.round((activeYHit.current / VASE_HEIGHT) * (N_POINTS - 1));
        const outerR = radii[index] || 0.4;
        const scaleVal = outerR + 0.015;
        paintRingRef.current.scale.set(scaleVal, 1.0, scaleVal);
        
        // Pulse size slightly
        const pulse = 1.0 + Math.sin(state.clock.getElapsedTime() * 10.0) * 0.04;
        paintRingRef.current.scale.multiplyScalar(pulse);
      } else {
        paintRingRef.current.visible = false;
      }
    }
  });

  // 4. Dynamic Material Binding based on current configuration step
  useEffect(() => {
    if (materialRef.current) {
      updatePhysicalMaterial(materialRef.current, selectedGlaze, step !== 'intro' && step !== 'shape');
      
      // Update custom shader uniforms dynamically when the selected glaze changes
      const uniforms = materialRef.current.userData.shaderUniforms;
      if (uniforms) {
        uniforms.uIsSpeckled.value = selectedGlaze.speckled ? 1.0 : 0.0;
      }
    }
  }, [step, selectedGlaze]);

  // Custom shader modifications to blend raw clay and glaze physical properties
  const handleBeforeCompile = (shader: any) => {
    // Inject uniforms
    shader.uniforms.uClayMap = { value: getClayColorMap() };
    shader.uniforms.uSpeckleMap = { value: getSpeckleMap() };
    shader.uniforms.uIsSpeckled = { value: selectedGlaze.speckled ? 1.0 : 0.0 };

    if (materialRef.current) {
      materialRef.current.userData.shaderUniforms = shader.uniforms;
    }

    // Inject declarations in vertex shader
    shader.vertexShader = `
      attribute float aGlazeIntensity;
      varying float vGlazeIntensity;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      'void main() {\n\tvGlazeIntensity = aGlazeIntensity;'
    );

    // Inject declarations in fragment shader
    shader.fragmentShader = `
      varying float vGlazeIntensity;
      uniform sampler2D uClayMap;
      uniform sampler2D uSpeckleMap;
      uniform float uIsSpeckled;
    ` + shader.fragmentShader;

    // Replace map_fragment to blend clay texture and paint colors
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      vec4 clayTexel = texture2D( uClayMap, vMapUv );
      vec3 glazeColor = vColor.rgb;
      if (uIsSpeckled > 0.5) {
        vec4 speckleTexel = texture2D( uSpeckleMap, vMapUv );
        glazeColor *= speckleTexel.rgb;
      }
      diffuseColor.rgb = mix(clayTexel.rgb, glazeColor, vGlazeIntensity);
      `
    );

    // Disable standard color_fragment to prevent double multiplication
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      '/* color_fragment disabled */'
    );

    // Replace roughnessmap_fragment to blend raw roughness and glaze roughness
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `
      float roughnessFactor = roughness;
      roughnessFactor = mix(0.45, roughnessFactor, vGlazeIntensity);
      `
    );

    // Replace clearcoat_fragment to blend raw clearcoat and glaze clearcoat
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <clearcoat_fragment>',
      `
      #ifdef USE_CLEARCOAT
        float clearcoatFactor = clearcoat;
        clearcoatFactor = mix(0.12, clearcoatFactor, vGlazeIntensity);
      #endif
      `
    );
  };

  // 5. Pointer math to perform deformation or painting raycasting
  const handlePointerDown = (e: React.PointerEvent<THREE.Mesh>) => {
    if (step !== 'shape' && step !== 'glaze') return;
    
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    incrementInteraction();

    processPointerEvent();
  };

  const handlePointerMove = (e: React.PointerEvent<THREE.Mesh>) => {
    e.stopPropagation();
    if (isDragging.current) {
      processPointerEvent();
    } else if (step === 'glaze') {
      // Just track height to show the hover paintbrush guide ring
      const planeNormal = new THREE.Vector3();
      camera.getWorldDirection(planeNormal);
      planeNormal.y = 0;
      planeNormal.normalize().negate();

      const plane = new THREE.Plane(planeNormal, 0);
      const hitPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, hitPoint);

      const yHit = Math.max(0.01, Math.min(VASE_HEIGHT - 0.02, hitPoint.y));
      activeYHit.current = yHit;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<THREE.Mesh>) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    isDragging.current = false;
    
    activeYHit.current = null;

    // Save state into Undo history
    pushHistory();
  };

  const handlePointerLeave = () => {
    if (step === 'glaze' && !isDragging.current) {
      activeYHit.current = null;
    }
  };

  /**
   * Projects screen space pointer to camera-facing raycasting plane
   */
  const processPointerEvent = () => {
    const planeNormal = new THREE.Vector3();
    camera.getWorldDirection(planeNormal);
    planeNormal.y = 0;
    planeNormal.normalize().negate();

    const plane = new THREE.Plane(planeNormal, 0);
    const hitPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, hitPoint);

    const yHit = Math.max(0.01, Math.min(VASE_HEIGHT - 0.02, hitPoint.y));
    activeYHit.current = yHit;

    if (step === 'shape') {
      // Shape deformation
      const targetRadius = Math.sqrt(hitPoint.x * hitPoint.x + hitPoint.z * hitPoint.z);
      deformProfile(yHit, targetRadius, 1.2, 0.016);
    } else if (step === 'glaze') {
      // Paintbrush glazing (mix selected glaze color on height)
      paintColor(yHit, selectedGlaze.color, brushSize, 0.85, 0.016);
    }
  };

  return (
    <group>
      {/* 3D Vase Mesh */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <latheGeometry ref={geoRef} args={[points, 64]}>
          <bufferAttribute
            attach="attributes-color"
            args={[vertexColorsBuffer, 3]}
          />
          <bufferAttribute
            attach="attributes-aGlazeIntensity"
            args={[glazeIntensityBuffer, 1]}
          />
        </latheGeometry>
        <meshPhysicalMaterial
          ref={materialRef}
          roughness={0.5}
          metalness={0.05}
          clearcoat={0.15}
          clearcoatRoughness={0.6}
          vertexColors={true} // Enable WebGL vertex color interpolation!
          side={THREE.DoubleSide}
          shadowSide={THREE.DoubleSide}
          onBeforeCompile={handleBeforeCompile}
        />
      </mesh>

      {/* Visual Paintbrush Indicator Ring (Glaze Phase) */}
      <mesh
        ref={paintRingRef}
        rotation={[Math.PI / 2, 0, 0]}
        visible={false}
      >
        <torusGeometry args={[1.0, 0.01, 8, 48]} />
        <meshBasicMaterial
          color={selectedGlaze.color}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
