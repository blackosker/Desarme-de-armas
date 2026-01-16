import React from 'react';
import { PartProps } from '../../../types';

export const Trigger: React.FC<PartProps & { pulledAmount: number }> = ({ materials, pulledAmount }) => {
  return (
    <group position={[0, -0.1, 0.65]} rotation={[-pulledAmount * 0.8, 0, 0]}>
      {/* Trigger Shoe */}
      <mesh material={materials.polymer}>
        {/* Simple curved shape approx */}
        <path /> 
        {/* Using simple primitives for procedural speed */}
        <boxGeometry args={[0.1, 0.25, 0.05]} />
      </mesh>
      
      {/* Trigger Safety Lever (The little thing inside the trigger) */}
      <mesh material={materials.polymer} position={[0, 0.02, 0.05]} rotation={[pulledAmount > 0.1 ? 0.5 : 0, 0, 0]}>
        <boxGeometry args={[0.04, 0.15, 0.02]} />
      </mesh>
    </group>
  );
};
