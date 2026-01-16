import React from 'react';
import { DIMENSIONS } from '../../../constants';
import { PartProps } from '../../../types';

export const Frame: React.FC<PartProps> = ({ materials }) => {
  const { SLIDE_LENGTH, GRIP_ANGLE, FRAME_WIDTH } = DIMENSIONS;

  return (
    <group>
      {/* 1. Dust Cover & Rails (The straight part under slide) */}
      <mesh material={materials.polymer} position={[0, 0.05, SLIDE_LENGTH / 2]}>
        <boxGeometry args={[FRAME_WIDTH, 0.15, SLIDE_LENGTH]} />
      </mesh>

      {/* 2. Trigger Guard */}
      {/* Approximated with a torus segment or thin boxes */}
      <group position={[0, -0.2, 0.6]}>
        <mesh material={materials.polymer}>
             {/* Horizontal bottom of guard */}
             <boxGeometry args={[0.15, 0.04, 0.4]} />
        </mesh>
        <mesh material={materials.polymer} position={[0, 0.15, -0.2]} rotation={[Math.PI/4, 0, 0]}>
             {/* Angled front */}
             <boxGeometry args={[0.15, 0.04, 0.2]} />
        </mesh>
      </group>

      {/* 3. Grip (The handle) */}
      {/* Rotated by GRIP_ANGLE (22 deg). Pivot should be near the beavertail (back top) */}
      <group position={[0, 0, 0]} rotation={[GRIP_ANGLE, 0, 0]}> 
        <mesh material={materials.polymer} position={[0, -0.8, -0.2]}>
          <boxGeometry args={[0.32, 1.4, 0.55]} />
        </mesh>
        
        {/* Beavertail / Backstrap area */}
        <mesh material={materials.polymer} position={[0, -0.1, -0.4]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.2, 16]} />
        </mesh>
      </group>

      {/* 4. Slide Lock / Take down lever */}
      <mesh material={materials.ndlcSteel} position={[0.18, 0.05, 0.75]}>
          <boxGeometry args={[0.02, 0.05, 0.1]} />
      </mesh>
    </group>
  );
};