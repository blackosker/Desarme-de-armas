import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Float } from '@react-three/drei';
import { GlockController } from './Glock/GlockController';

export const Scene: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#111]">
      <Canvas
        camera={{ position: [5, 2, 5], fov: 35 }}
        dpr={[1, 2]}
        shadows
      >
        <Suspense fallback={null}>
          <Environment preset="studio" />
          
          <Float 
            speed={2} 
            rotationIntensity={0.2} 
            floatIntensity={0.2} 
            floatingRange={[-0.05, 0.05]}
          >
            <group position={[0, 0, 0]}>
               <GlockController />
            </group>
          </Float>

          <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.6} 
            scale={10} 
            blur={2.5} 
            far={4} 
            color="#000"
          />
        </Suspense>

        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={3}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
};
