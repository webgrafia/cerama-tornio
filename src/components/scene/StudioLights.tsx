import React from 'react';


export const StudioLights: React.FC = () => {
  return (
    <group>
      {/* 1. Ambient fill: soft warm light keeping shadows readable */}
      <ambientLight color="#fff7ed" intensity={0.6} />

      {/* 2. Key Light: Main spotlight casting soft shadows from front-right */}
      <directionalLight
        position={[4, 5, 3]}
        color="#ffecd9" // rich warm key
        intensity={1.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      >
        <object3D attach="target" position={[0, 0.8, 0]} />
      </directionalLight>

      {/* 3. Rim Light: Highlights the back edge of the vase, crucial for clearcoat glazes */}
      <pointLight
        position={[-3, 3, -4]}
        color="#f0f6ff" // slightly cool back edge light
        intensity={2.8}
        distance={15}
        decay={2}
      />

      {/* 4. Side Fill Light: Soft neutral light from the left to model the shape */}
      <directionalLight
        position={[-4, 1.5, 2]}
        color="#ffffff"
        intensity={0.4}
      />

      {/* 5. Floor Bounce: Soft upward-facing light mimicking clay room floor reflections */}
      <directionalLight
        position={[0, -5, 0]}
        color="#e3d5ca"
        intensity={0.35}
      />
    </group>
  );
};
