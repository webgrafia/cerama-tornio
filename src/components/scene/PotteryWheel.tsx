import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { usePotteryStore } from '../../store/usePotteryStore';
import { getWheelTexture } from '../../three/materials';

export const PotteryWheel: React.FC = () => {
  const wheelRef = useRef<THREE.Group>(null);
  const { wheelSpeed } = usePotteryStore();

  useFrame((_, delta) => {
    if (wheelRef.current) {
      // Rotate the wheel platter in sync with the clay
      wheelRef.current.rotation.y += wheelSpeed * delta;
    }
  });

  return (
    <group ref={wheelRef} position={[0, -0.005, 0]}>
      {/* 1. Main Rotating Platter (light aluminum face with concentric grooves) */}
      <mesh castShadow receiveShadow position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.05, 48]} />
        <meshStandardMaterial
          color="#ffffff" // preserves texture color maps cleanly
          map={getWheelTexture()}
          roughness={0.18}
          metalness={0.9} // Shiny polished aluminum metal
        />
      </mesh>

      {/* 2. Concentric grooves details (outer platter metallic shading) */}
      <mesh position={[0, -0.045, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.01, 48]} />
        <meshStandardMaterial
          color="#b0b4b8"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* 3. Center platter core cap */}
      <mesh position={[0, -0.048, 0]}>
        <cylinderGeometry args={[0.93, 0.93, 0.015, 48]} />
        <meshStandardMaterial
          color="#1c2124" // dark metal base rim
          roughness={0.7}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
};

// Static base column that sits beneath the wheel (replaces the heavy pedestal with a beautiful turquoise banding wheel base)
export const PotteryWheelBase: React.FC = () => {
  // Turquoise Glossy Cast Iron Material details matching the photo
  const turquoiseColor = "#31828f"; // beautiful painted cast iron turquoise
  const baseMaterial = (
    <meshStandardMaterial
      color={turquoiseColor}
      roughness={0.16}
      metalness={0.1} // glossy lacquered cast stand
    />
  );

  return (
    <group position={[0, -0.05, 0]}>
      {/* 1. Flared Top Collar (supporting the platter) */}
      <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.42, 0.22, 0.12, 32]} />
        {baseMaterial}
      </mesh>

      {/* 2. Narrow Neck (the curvy hour-glass middle section) */}
      <mesh castShadow receiveShadow position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 32]} />
        {baseMaterial}
      </mesh>

      {/* 3. Flared Bottom Base Stand */}
      <mesh castShadow receiveShadow position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.22, 0.44, 0.12, 32]} />
        {baseMaterial}
      </mesh>

      {/* 4. Bottom flared pedestal base lip */}
      <mesh castShadow receiveShadow position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.44, 0.46, 0.05, 32]} />
        {baseMaterial}
      </mesh>

      {/* 5. Dark Bottom Pad (black rubber bottom rim seen in the photo) */}
      <mesh position={[0, -0.46, 0]}>
        <cylinderGeometry args={[0.46, 0.47, 0.03, 32]} />
        <meshStandardMaterial
          color="#121517" // dark black rubber pad
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
};
