import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Float, PerspectiveCamera } from '@react-three/drei';
import { GlockController } from './Glock/GlockController';

export const Scene: React.FC = () => {
  return (
    // Fondo con gradiente sutil para dar profundidad
    <div className="w-full h-full bg-gradient-to-b from-[#111] to-[#050505]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMappingExposure: 1.1 }}>
        {/* Cámara con FOV bajo (30) para un look más "producto" y menos "ojo de pez" */}
        <PerspectiveCamera makeDefault position={[4, 2, 5]} fov={30} />
        
        <Suspense fallback={null}>
          {/* HDRI Environment: Provee los reflejos realistas sobre el metal (nDLC y Cañón) */}
          <Environment preset="city" blur={1} background={false} />

          {/* 1. Key Light (Principal): Luz definida que proyecta sombras */}
          <spotLight 
            position={[10, 10, 5]} 
            angle={0.15} 
            penumbra={1} 
            intensity={20} 
            castShadow 
            shadow-bias={-0.0001}
            shadow-mapSize={[2048, 2048]} // Sombras nítidas
          />

          {/* 2. Rim Light (Contraluz): Luz fría potente desde atrás/izquierda para perfilar los bordes negros */}
          <spotLight 
            position={[-5, 5, -5]} 
            angle={0.5} 
            penumbra={1} 
            intensity={40} 
            color="#4a9eff" // Tono azulado cinemático
          />

          {/* 3. Fill Light (Relleno): Luz suave inferior para que las sombras no sean negro puro */}
          <pointLight position={[0, -5, 2]} intensity={5} color="#ffffff" />

          {/* Animación de flotación suave */}
          <Float 
            speed={1.5} 
            rotationIntensity={0.15} 
            floatIntensity={0.2} 
            floatingRange={[-0.05, 0.05]}
          >
            <group position={[0, 0, 0]}>
               <GlockController />
            </group>
          </Float>

          {/* Sombras de contacto en el suelo (fake floor) */}
          <ContactShadows 
            position={[0, -1.8, 0]} 
            opacity={0.6} 
            scale={15} 
            blur={2.5} 
            far={4.5} 
            color="#000"
          />
        </Suspense>

        <OrbitControls 
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.7} // Evita mirar desde muy abajo
          minDistance={2}
          maxDistance={12}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};