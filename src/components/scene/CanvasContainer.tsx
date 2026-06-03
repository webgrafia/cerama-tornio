import React, { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { usePotteryStore } from '../../store/usePotteryStore';
import { StudioLights } from './StudioLights';
import { PotteryWheel, PotteryWheelBase } from './PotteryWheel';
import { Vase } from '../pottery/Vase';

/**
 * Sub-component to capture screenshots directly within the WebGL render loop.
 * This avoids needing preserveDrawingBuffer: true and runs with 100% performance efficiency.
 */
const CanvasCapturer: React.FC = () => {
  const { step, setExportImage } = usePotteryStore();
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    // When entering the 'share' phase, capture the beautiful vase snapshot
    if (step === 'share') {
      // Wait 350ms to allow the OrbitControls camera to smoothly zoom in and stabilize
      const timer = setTimeout(() => {
        gl.render(scene, camera);
        try {
          const dataUrl = gl.domElement.toDataURL('image/png');
          setExportImage(dataUrl);
        } catch (err) {
          console.error('Errore durante la cattura dell\'immagine 3D:', err);
        }
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setExportImage(null);
    }
  }, [step, gl, scene, camera, setExportImage]);

  return null;
};

export const CanvasContainer: React.FC = () => {
  const { step } = usePotteryStore();

  return (
    <div className="canvas-wrapper">
      <Canvas
        shadows
        camera={{ position: [0, 1.4, 4.4], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Soft studio backdrop floor to catch soft shadows */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial
            color="#ebdcd0" // warm studio table/floor tone
            roughness={0.9}
          />
        </mesh>

        {/* Studio Lighting Rig */}
        <StudioLights />

        {/* Pottery meshes */}
        <group position={[0, -0.05, 0]}>
          <Vase />
          <PotteryWheel />
          <PotteryWheelBase />
        </group>

        {/* Elegant limited camera controls */}
        <OrbitControls
          target={[0, 0.9, 0]}
          enableZoom={false} // Prevent breaking scroll wheel page interactions
          enablePan={false}  // Lock camera to table origin
          // Restrict vertical orbit to keep focus on the clay body
          minPolarAngle={Math.PI / 3.2}   // Look slightly down from above
          maxPolarAngle={Math.PI / 1.85}  // Restrict looking under the table
          // Restrict horizontal orbit to keep controls and labels clearly accessible
          minAzimuthAngle={-Math.PI / 5}
          maxAzimuthAngle={Math.PI / 5}
          enableDamping
          dampingFactor={0.08}
          minDistance={step === 'share' ? 3.5 : 4.43}
          maxDistance={step === 'share' ? 3.5 : 4.43}
        />

        {/* Handles screenshot captures dynamically */}
        <CanvasCapturer />
      </Canvas>

      {/* Aesthetic shadow ring around the studio canvas container */}
      <div className="canvas-overlay-vignette" />
    </div>
  );
};
