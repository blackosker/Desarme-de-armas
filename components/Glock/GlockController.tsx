import React, { useRef } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { useGlockStore } from '../../store/glockStore';
import { useGlockMaterials } from './Materials';
import { Slide } from './Parts/Slide';
import { Frame } from './Parts/Frame';
import { Barrel } from './Parts/Barrel';
import { RecoilSpring } from './Parts/RecoilSpring';
import { Magazine } from './Parts/Magazine';
import { Trigger } from './Parts/Trigger';
import { ANIMATION_VECTORS, DIMENSIONS } from '../../constants';

export const GlockController: React.FC = () => {
  const materials = useGlockMaterials();
  const { isExploded, isRacked, triggerPulled, isMagazineInserted } = useGlockStore();
  const { GRIP_ANGLE } = DIMENSIONS;

  // Animation Springs
  const { explosionFactor, slidePos, magPos } = useSpring({
    explosionFactor: isExploded ? 1 : 0,
    slidePos: isRacked ? 0.45 : 0, // 0.45 units (45mm) is approx slide travel
    magPos: isMagazineInserted ? 0 : 1, // 0 is inserted, 1 is removed (down)
    config: { mass: 1, tension: 170, friction: 26 },
  });

  // Calculate dynamic vectors based on explosion factor
  // We use `animated` groups to handle the interpolation.

  return (
    <group dispose={null} rotation={[0, -Math.PI / 2, 0]}> {/* Rotate to face side by default */}
      
      {/* --- SLIDE GROUP --- */}
      <animated.group
        position={slidePos.to(pos => {
            // Normal operation recoil: Move backward (negative Z in our model, or positive depending on orient)
            // Model orientation: Slide builds +Z. Recoil means moving towards -Z? 
            // Let's assume Muzzle is +Z. Recoil moves slide -Z.
            // Wait, previous file Slide.tsx built from 0 to +Z. 
            // If Muzzle is +Z, recoil is -Z.
            // Let's verify explosion vector. SLIDE explosion is [0,0,2.0]. Moving forward.
            // So Recoil is opposite of explosion direction roughly.
            const recoilZ = -pos;
            
            // Explosion offset
            const explodeZ = isExploded ? ANIMATION_VECTORS.SLIDE[2] : 0;
            const explodeY = isExploded ? ANIMATION_VECTORS.SLIDE[1] : 0;
            
            return [0, explodeY, recoilZ + explodeZ];
        })}
      >
        <Slide materials={materials} />
        
        {/* Barrel moves with slide initially, then tilts */}
        <animated.group
            position-y={explosionFactor.to(e => e * ANIMATION_VECTORS.BARREL[1])}
            position-z={explosionFactor.to(e => e * ANIMATION_VECTORS.BARREL[2])}
            rotation-x={slidePos.to(pos => {
                // Tilting logic: As slide goes back, barrel tilts up slightly at breech
                // Simple approximation:
                return pos > 0.05 ? -0.05 : 0; 
            })}
        >
             <Barrel materials={materials} />
        </animated.group>

        {/* Recoil Spring */}
        <animated.group
            position-y={-0.12}
            position-z={explosionFactor.to(e => 0.2 + (e * ANIMATION_VECTORS.RECOIL_SPRING[2]))}
        >
             <RecoilSpring materials={materials} />
        </animated.group>
      </animated.group>


      {/* --- FRAME GROUP --- */}
      <group>
        <Frame materials={materials} />
        
        {/* Trigger */}
        <animated.group>
           <Trigger materials={materials} pulledAmount={triggerPulled ? 1 : 0} />
        </animated.group>

        {/* Magazine */}
        {/* Mag moves along local Y axis of the grip (Rotated 22 deg) */}
        <group rotation={[GRIP_ANGLE, 0, 0]} position={[0, -0.6, -0.2]}> 
             <animated.group position-y={magPos.to(p => p * -1.5)}>
                 <Magazine materials={materials} />
             </animated.group>
        </group>
      </group>

    </group>
  );
};
