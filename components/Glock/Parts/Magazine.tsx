import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PartProps } from '../../../types';

/**
 * ------------------------------------------------------------------
 * INGENIERÍA DE PRECISIÓN: GLOCK 17 GEN 5 MAGAZINE (17 ROUNDS)
 * ------------------------------------------------------------------
 * Reconstrucción detallada del cargador de doble columna a simple.
 * Incluye el cuerpo híbrido (metal-lined polymer), elevador y munición.
 */

const SPECS = {
  WIDTH: 0.23,       // Ancho del cuerpo
  DEPTH: 0.33,       // Profundidad (Front-to-back)
  LENGTH: 1.28,      // Longitud del tubo
  LIP_THICKNESS: 0.008, // Grosor del acero en los labios
};

export const Magazine: React.FC<PartProps> = ({ materials }) => {
  
  // ----------------------------------------------------------------
  // 1. CUERPO DE POLÍMERO (POLYMER SHEATH)
  // ----------------------------------------------------------------
  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = SPECS.WIDTH;
    const d = SPECS.DEPTH;
    const r = 0.04; // Radio de esquinas del polímero

    // Perfil del cargador (Rounded Rectangle con frente más curvo)
    shape.moveTo(-w/2 + r, -d/2);
    shape.lineTo(w/2 - r, -d/2); // Espalda plana
    shape.quadraticCurveTo(w/2, -d/2, w/2, -d/2 + r);
    shape.lineTo(w/2, d/2 - r);
    shape.quadraticCurveTo(w/2, d/2, w/2 - r, d/2); // Frente
    shape.lineTo(-w/2 + r, d/2);
    shape.quadraticCurveTo(-w/2, d/2, -w/2, d/2 - r);
    shape.lineTo(-w/2, -d/2 + r);
    shape.quadraticCurveTo(-w/2, -d/2, -w/2 + r, -d/2);

    // Hueco Interior
    const hole = new THREE.Path();
    const t = 0.025; // Grosor pared polímero
    hole.moveTo(-w/2 + t, -d/2 + t);
    hole.lineTo(w/2 - t, -d/2 + t);
    hole.lineTo(w/2 - t, d/2 - t);
    hole.lineTo(-w/2 + t, d/2 - t);
    hole.lineTo(-w/2 + t, -d/2 + t);
    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, { 
      steps: 1, 
      depth: SPECS.LENGTH, 
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2
    });
  }, []);

  // ----------------------------------------------------------------
  // 2. LINER DE ACERO (METAL LINER / FEED LIPS)
  // ----------------------------------------------------------------
  // La parte metálica interna que asoma por arriba y sujeta las balas.
  const feedLipsGeometry = useMemo(() => {
     const shape = new THREE.Shape();
     const w = SPECS.WIDTH - 0.01; // Ligeramente más pequeño que el polímero
     const d = SPECS.DEPTH - 0.01;
     
     // Perfil exterior del metal
     shape.moveTo(-w/2, -d/2);
     shape.lineTo(w/2, -d/2);
     shape.lineTo(w/2, d/2);
     shape.lineTo(-w/2, d/2);
     shape.lineTo(-w/2, -d/2);

     // Hueco funcional (Feed Lips cut)
     // Los labios se estrechan atrás para retener la bala, y se abren adelante.
     const hole = new THREE.Path();
     hole.moveTo(-0.08, -d/2 + 0.05); // Labio Izq (atrás)
     hole.lineTo(0.08, -d/2 + 0.05);  // Labio Der (atrás)
     hole.lineTo(0.095, d/2 - 0.02);  // Labio Der (frente) - más abierto
     hole.lineTo(-0.095, d/2 - 0.02); // Labio Izq (frente)
     hole.lineTo(-0.08, -d/2 + 0.05);
     shape.holes.push(hole);

     return new THREE.ExtrudeGeometry(shape, { 
         depth: 0.15, // Altura visible del metal
         bevelEnabled: false 
     });
  }, []);

  // ----------------------------------------------------------------
  // 3. BASE PLATE (TAPA INFERIOR) & LOCKING INSERT
  // ----------------------------------------------------------------
  const basePlateGeo = useMemo(() => {
      const shape = new THREE.Shape();
      const w = 0.28;
      const d = 0.44;
      const r = 0.03;

      // Forma trapezoidal redondeada
      shape.moveTo(-w/2 + r, -d/2);
      shape.lineTo(w/2 - r, -d/2);
      shape.quadraticCurveTo(w/2, -d/2, w/2, -d/2 + r);
      shape.lineTo(w/2 - 0.02, d/2 - r); // Tapered front
      shape.quadraticCurveTo(w/2 - 0.02, d/2, w/2 - r - 0.02, d/2);
      shape.lineTo(-w/2 + r + 0.02, d/2);
      shape.quadraticCurveTo(-w/2 + 0.02, d/2, -w/2 + 0.02, d/2 - r);
      shape.lineTo(-w/2, -d/2 + r);
      shape.quadraticCurveTo(-w/2, -d/2, -w/2 + r, -d/2);

      return new THREE.ExtrudeGeometry(shape, {
          depth: 0.1,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 3
      });
  }, []);

  // ----------------------------------------------------------------
  // 4. MUNICIÓN 9x19mm (PARABELLUM) - GEOMETRÍA COMPLETA
  // ----------------------------------------------------------------
  const ammoGeo = useMemo(() => {
      // Usaremos un grupo, pero aquí definimos geometrías reutilizables
      // Vaina (Casing)
      const casing = new THREE.CylinderGeometry(0.049, 0.049, 0.191, 16);
      // Ranura (Groove)
      const groove = new THREE.CylinderGeometry(0.042, 0.042, 0.03, 16);
      // Reborde (Rim)
      const rim = new THREE.CylinderGeometry(0.049, 0.049, 0.02, 16);
      // Proyectil (Bullet) - Ojiva
      const bullet = new THREE.SphereGeometry(0.0485, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
      
      return { casing, groove, rim, bullet };
  }, []);

  // Posiciones precalculadas para los "Witness Holes"
  const witnessHoles = Array.from({ length: 17 }).map((_, i) => ({
      id: i,
      y: 0.2 + (i * 0.055) // Espaciado vertical
  }));

  return (
    <group>
        
        {/* ==========================================
            CUERPO PRINCIPAL DEL CARGADOR
           ========================================== */}
        <group rotation={[Math.PI/2, 0, 0]}>
            
            {/* 1. Cuerpo de Polímero */}
            <mesh material={materials.polymer} geometry={bodyGeometry} position={[0, 0, -SPECS.LENGTH]} />
            
            {/* 2. Liner de Acero Superior (Feed Lips) */}
            <mesh material={materials.ndlcSteel} geometry={feedLipsGeometry} position={[0, 0, -0.12]} />

            {/* 3. Muescas de Retención (Mag Catch Cuts) */}
            {/* Simuladas con geometría negra mate incrustada */}
            <mesh position={[0.116, 0.08, -0.28]} material={materials.polymer}>
                <boxGeometry args={[0.01, 0.06, 0.04]} /> {/* Corte Der */}
            </mesh>
            <mesh position={[-0.116, 0.08, -0.28]} material={materials.polymer}>
                <boxGeometry args={[0.01, 0.06, 0.04]} /> {/* Corte Izq */}
            </mesh>

            {/* 4. Agujeros de Testigo (Witness Holes) - Parte Trasera */}
            {/* Usamos cilindros negros pequeños para simular los agujeros numerados */}
            <group position={[0, -SPECS.DEPTH/2 - 0.005, -SPECS.LENGTH]} rotation={[Math.PI/2, 0, 0]}>
                {witnessHoles.map((hole) => (
                    <group key={hole.id} position={[0, hole.y, 0]}>
                        <mesh rotation={[Math.PI/2, 0, 0]}>
                            <circleGeometry args={[0.012, 8]} />
                            <meshStandardMaterial color="#000" roughness={1} />
                        </mesh>
                        {/* El latón visible dentro del agujero (detalle sutil) */}
                        <mesh position={[0, 0, -0.01]} rotation={[Math.PI/2, 0, 0]}>
                             <circleGeometry args={[0.008, 8]} />
                             <meshStandardMaterial color="#cd7f32" metalness={0.8} roughness={0.4} />
                        </mesh>
                    </group>
                ))}
            </group>
        </group>

        {/* ==========================================
            BASE PLATE (PAD)
           ========================================== */}
        <group position={[0, -SPECS.LENGTH - 0.05, 0.05]} rotation={[0.15, 0, 0]}>
            <mesh material={materials.polymer} geometry={basePlateGeo} />
            
            {/* Pin de bloqueo (Locking Insert Pin) */}
            <mesh material={materials.polymer} position={[0, -0.051, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
                <meshStandardMaterial color="#000" />
            </mesh>
        </group>

        {/* ==========================================
            ELEVADOR (FOLLOWER)
           ========================================== */}
        <group position={[0, 0.02, 0]}>
             <mesh material={materials.polymer}>
                 {/* Cuerpo principal escalonado */}
                 <boxGeometry args={[0.18, 0.04, 0.28]} />
             </mesh>
             {/* Escalón del Slide Stop (Shelf) */}
             <mesh material={materials.polymer} position={[-0.06, 0.03, 0.06]}>
                 <boxGeometry args={[0.05, 0.04, 0.08]} />
             </mesh>
        </group>

        {/* ==========================================
            MUNICIÓN (ROUND IN CHAMBER POSITION)
           ========================================== */}
        <group position={[0, 0.10, 0]} rotation={[0.08, 0, 0]}>
             
             {/* Vaina (Casing) */}
             <mesh material={materials.brass} geometry={ammoGeo.casing} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.04]} />
             
             {/* Ranura de Extracción */}
             <mesh material={materials.brass} geometry={ammoGeo.groove} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.14]} />
             
             {/* Reborde (Rim) */}
             <mesh material={materials.brass} geometry={ammoGeo.rim} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.165]} />
             
             {/* Fulminante (Primer) */}
             <mesh position={[0, 0, -0.176]} rotation={[Math.PI/2, 0, 0]}>
                 <circleGeometry args={[0.02, 16]} />
                 <meshStandardMaterial color="#c0c0c0" metalness={1.0} roughness={0.3} />
             </mesh>

             {/* Proyectil (Bullet) - Cobre */}
             <group position={[0, 0, 0.056]}>
                {/* Cuerpo cilíndrico */}
                <mesh material={materials.copper} rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0.02]}>
                     <cylinderGeometry args={[0.049, 0.049, 0.04, 16]} />
                </mesh>
                {/* Punta ojival */}
                <mesh material={materials.copper} geometry={ammoGeo.bullet} position={[0, 0, 0.04]} rotation={[Math.PI/2, 0, 0]} />
             </group>
        </group>

    </group>
  );
};