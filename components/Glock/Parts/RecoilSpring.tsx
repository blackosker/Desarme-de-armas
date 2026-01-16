import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PartProps } from '../../../types';

export const RecoilSpring: React.FC<PartProps & { compressed?: boolean }> = ({ materials, compressed }) => {
  // Procedural Spring using TubeGeometry
  const geometry = useMemo(() => {
    // Helix curve
    class HelixCurve extends THREE.Curve<THREE.Vector3> {
        scale: number;
        constructor(scale = 1) {
            super();
            this.scale = scale;
        }
        getPoint(t: number) {
            const a = 0.05; // Radius
            const height = 0.8 * this.scale; // Length
            const revolutions = 15;
            
            const angle = 2 * Math.PI * revolutions * t;
            const x = a * Math.cos(angle);
            const y = a * Math.sin(angle);
            const z = height * t;
            
            return new THREE.Vector3(x, y, z);
        }
    }

    const path = new HelixCurve(1.0); // Default scale
    // We create a tube. In a real app we'd update geometry frame-by-frame for compression, 
    // but here we might just scale the mesh group for performance.
    return new THREE.TubeGeometry(path, 64, 0.008, 8, false);
  }, []);

  return (
    <group rotation={[0, 0, -Math.PI / 2]}> 
        {/* Align to Z axis if curve is Z based. Wait, curve is Z based. 
            We need to place it under the barrel. 
        */}
      <mesh geometry={geometry} material={materials.springSteel} position={[0, 0, 0]} />
      
      {/* Guide Rod Head */}
      <mesh material={materials.polymer} position={[0, 0, 0.8]} rotation={[Math.PI/2, 0, 0]}>
         <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
      </mesh>
    </group>
  );
};