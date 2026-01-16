import React from 'react';
import { DIMENSIONS } from '../../../constants';
import { PartProps } from '../../../types';

export const Barrel: React.FC<PartProps> = ({ materials }) => {
  const { BARREL_LENGTH } = DIMENSIONS;

  return (
    <group>
      {/* Cylinder Part */}
      <mesh material={materials.barrelSteel} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.15, BARREL_LENGTH / 2 + 0.2]}>
        {/* Rotate X 90 to align cylinder Y to World Z */}
        <cylinderGeometry args={[0.07, 0.07, BARREL_LENGTH, 32]} />
      </mesh>
      
      {/* Chamber Block */}
      <mesh material={materials.barrelSteel} position={[0, 0.15, 0.35]}>
        <boxGeometry args={[0.16, 0.16, 0.4]} />
      </mesh>
    </group>
  );
};
