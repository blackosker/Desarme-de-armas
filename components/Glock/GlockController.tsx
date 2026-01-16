import React from 'react';
import { useSpring, animated, to } from '@react-spring/three';
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

  // Animaciones de Física
  const { explosion, slideCycle, magInsert, recoilAngle } = useSpring({
    explosion: isExploded ? 1 : 0,
    
    // Ciclo del slide: 0 = cerrado, 1 = abierto (atrás)
    slideCycle: isRacked ? 1 : 0, 
    
    // Inserción del cargador: 0 = dentro, 1 = fuera
    magInsert: isMagazineInserted ? 1 : 0,
    
    // Ángulo de retroceso (Muzzle Flip): Rota el arma hacia arriba al disparar
    recoilAngle: isRacked ? 0.20 : 0, // 0.20 radianes de levantamiento
    
    config: { 
      mass: 0.8, 
      tension: 280, // Tensión alta para un "snap" rápido (retroceso seco)
      friction: 24 
    },
  });

  return (
    // Grupo Maestro: Controla la rotación global del arma (incluyendo el retroceso)
    // El pivote de rotación está en el grip (0,0,0), lo que es anatómicamente correcto.
    <animated.group 
      dispose={null} 
      rotation={to([recoilAngle], (r) => [r, -Math.PI / 2, 0])} 
    >
      
      {/* --- GRUPO SUPERIOR (Slide Assembly) --- */}
      <animated.group
        position={to([explosion, slideCycle], (e, s) => {
            // Retroceso: El slide se mueve hacia atrás (eje -Z local) 0.45 unidades
            const recoilZ = s * 0.45; 
            
            // Desarme (Exploded View):
            const explodeZ = e * 2.5; // Avanza mucho hacia el frente
            const explodeY = e * 0.6; // Se eleva para separarse del frame
            
            return [0, 0.23 + explodeY, -recoilZ + explodeZ];
        })}
      >
        <Slide materials={materials} />
        
        {/* Cañón (Barrel) - Sistema Browning Short Recoil */}
        <animated.group
            position={to([explosion, slideCycle], (e, s) => [
                0, 
                // Unlocking: Al retroceder (s>0), la recámara baja para desbloquearse
                -0.05 + (s * -0.025) + (e * -0.8), 
                (e * 0.2) // En explode, se queda un poco atrás del slide
            ])}
            rotation={to([explosion, slideCycle], (e, s) => [
                // Tilting: La boca del cañón sube (recámara baja) al abrirse
                (s * -0.06) + (e * 0.05), 
                0,
                0
            ])}
        >
             <Barrel materials={materials} />
        </animated.group>

        {/* Resorte Recuperador */}
        <animated.group
            position={to([explosion], (e) => [
                0, 
                -0.12 + (e * -1.2), // Baja con el cañón en explode
                0.2 + (e * 0.5)
            ])}
        >
             {/* Pasamos 'compressed' si quisiéramos animar la compresión del muelle, 
                 pero por ahora movemos la pieza entera */}
             <RecoilSpring materials={materials} />
        </animated.group>
      </animated.group>


      {/* --- GRUPO INFERIOR (Frame Assembly) --- */}
      <group>
        <Frame materials={materials} slidePosition={slideCycle} />
        
        {/* Gatillo animado */}
        <animated.group>
           <Trigger materials={materials} pulledAmount={triggerPulled ? 1 : 0} />
        </animated.group>

        {/* Cargador (Magazine) */}
        {/* Se mueve en el eje local del grip (rotado 22 grados) */}
        <group rotation={[GRIP_ANGLE, 0, 0]} position={[0, -0.6, 0.0]}> 
             <animated.group position={magInsert.to(v => [0, (1 - v) * -2.0, 0])}>
                 <Magazine materials={materials} />
             </animated.group>
        </group>
      </group>

    </animated.group>
  );
};
