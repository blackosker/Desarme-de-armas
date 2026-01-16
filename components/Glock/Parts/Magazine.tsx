import React from 'react';
import { DIMENSIONS } from '../../../constants';
import { PartProps } from '../../../types';

export const Magazine: React.FC<PartProps> = ({ materials }) => {
  const { GRIP_ANGLE } = DIMENSIONS;

  return (
    <group>
        {/* Main Body */}
        <mesh material={materials.ndlcSteel}> 
            {/* Box approximating standard mag */}
            <boxGeometry args={[0.22, 1.3, 0.35]} />
        </mesh>
        
        {/* Base plate */}
        <mesh material={materials.polymer} position={[0, -0.7, 0.05]}>
            <boxGeometry args={[0.28, 0.1, 0.45]} />
        </mesh>

        {/* Top Follower */}
        <mesh material={materials.polymer} position={[0, 0.66, 0]}>
             <boxGeometry args={[0.2, 0.05, 0.3]} />
        </mesh>

        {/* Visible Ammo (Just one on top for visual) */}
        <group position={[0, 0.68, 0]} rotation={[0.1, 0, 0]}>
             {/* Casing */}
             <mesh material={materials.brass} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.05]}>
                <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
             </mesh>
             {/* Bullet */}
             <mesh material={materials.copper} rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0.12]}>
                 <sphereGeometry args={[0.049, 16, 16]} />
             </mesh>
        </group>
    </group>
  );
};
