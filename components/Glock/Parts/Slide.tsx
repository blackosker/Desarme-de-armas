import React, { useMemo } from 'react';
import * as THREE from 'three';
import { DIMENSIONS } from '../../../constants';
import { PartProps } from '../../../types';

export const Slide: React.FC<PartProps> = ({ materials }) => {
  const { SLIDE_LENGTH, SLIDE_WIDTH } = DIMENSIONS;

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const w = SLIDE_WIDTH;
    const h = 0.24; // Slide height approx relative to width
    const bevel = 0.04;

    // Start bottom left
    s.moveTo(-w / 2, 0);
    
    // Bottom right
    s.lineTo(w / 2, 0);
    
    // Right vertical wall up to bevel start
    s.lineTo(w / 2, h - bevel);
    
    // Right bevel
    s.lineTo(w / 2 - bevel, h);
    
    // Top flat
    s.lineTo(-(w / 2 - bevel), h);
    
    // Left bevel
    s.lineTo(-w / 2, h - bevel);
    
    // Close
    s.lineTo(-w / 2, 0);

    return s;
  }, [SLIDE_WIDTH]);

  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: SLIDE_LENGTH,
    bevelEnabled: false,
  }), [SLIDE_LENGTH]);

  return (
    <group>
      {/* Main Slide Body */}
      <mesh material={materials.ndlcSteel} rotation={[0, Math.PI, 0]} position={[0, 0, SLIDE_LENGTH]}> 
        {/* Rotate Y 180 because extrude goes +Z, but gun shoots -Z or +Z depending on convention. 
            Let's assume Gun shoots towards +Z. 
            Wait, usually +Z is towards camera. Let's aim gun towards -Z (standard webgl forward).
            Actually R3F standard: +Z is towards user. Let's make gun point to right (+X) or just follow a standard.
            Let's align Gun Muzzle to +Z for simplicity with report vectors.
            Report says Slide removal is [0,0,2.0]. This implies slide moves forward (+Z).
            So Muzzle is at +Z.
        */}
        <extrudeGeometry args={[shape, extrudeSettings]} />
      </mesh>

      {/* Rear Serrations (Bump maps or small boxes) - Simplified as added geometry for visual cue */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[SLIDE_WIDTH/2 + 0.001, 0.12, 0.2 + i * 0.08]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.01, 0.15, 0.04]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
      ))}
      
       {/* Front Serrations (Gen 5 specific) */}
       {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`front-${i}`} position={[SLIDE_WIDTH/2 + 0.001, 0.12, SLIDE_LENGTH - 0.5 + i * 0.08]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.01, 0.15, 0.04]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
      ))}

      {/* Sights */}
      {/* Rear Sight */}
      <mesh material={materials.polymer} position={[0, 0.26, 0.2]}>
        <boxGeometry args={[0.2, 0.06, 0.1]} />
      </mesh>
      {/* Front Sight */}
      <mesh material={materials.polymer} position={[0, 0.25, SLIDE_LENGTH - 0.1]}>
        <boxGeometry args={[0.04, 0.05, 0.1]} />
      </mesh>
    </group>
  );
};
