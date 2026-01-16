import React, { useMemo } from 'react';
import * as THREE from 'three';
import { DIMENSIONS } from '../../../constants';
import { PartProps } from '../../../types';

/**
 * ------------------------------------------------------------------
 * INGENIERÍA DE PRECISIÓN: GLOCK 17 GEN 5 BARREL (MARKSMAÑ)
 * ------------------------------------------------------------------
 * Este componente no usa modelos externos. Genera geometría matemática
 * basada en las especificaciones técnicas del calibre 9x19mm y el
 * sistema de bloqueo Safe Action.
 */

// Constantes de Ingeniería (Escala 1u = 1dm según tu proyecto)
const SPECS = {
  CALIBER_DIAMETER: 0.0902, // 9.02mm (Land diameter)
  GROOVE_DIAMETER: 0.0925,  // Diámetro en los valles del estriado
  TWIST_RATE: 2.50,         // 1 vuelta en 250mm (aprox)
  CHAMBER_OUTER_W: 0.165,   // Ancho externo de la recámara
  CHAMBER_OUTER_H: 0.180,   // Alto externo
  LOCKING_LUG_ANGLE: 0.45,  // Ángulo de la rampa de desbloqueo (radianes)
  FEED_RAMP_ANGLE: 0.55,    // Ángulo de alimentación
};

/**
 * Generador de Perfil de Estriado Poligonal
 * Glock usa un perfil hexagonal con bordes redondeados, no el estriado
 * tradicional de "tierras y valles" cuadrados.
 */
const createPolygonalProfile = (radius: number, segments: number = 6): THREE.Shape => {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / segments;
  const smoothing = 0.008; // Factor de suavizado de las esquinas del hexágono

  for (let i = 0; i <= segments; i++) {
    const theta = i * step;
    // Usamos coordenadas polares básicas
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;

    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      // Interpolación cuadrática para suavizar el "hexágono" y hacerlo poligonal
      const prevTheta = (i - 1) * step;
      const cpX = Math.cos(prevTheta + step / 2) * (radius + smoothing);
      const cpY = Math.sin(prevTheta + step / 2) * (radius + smoothing);
      shape.quadraticCurveTo(cpX, cpY, x, y);
    }
  }
  return shape;
};

/**
 * Generador de la Corona del Cañón (Muzzle Crown)
 * Un hundimiento cónico en la punta para proteger el estriado de golpes.
 */
const createCrownGeometry = (outerR: number, innerR: number): THREE.BufferGeometry => {
    // Usamos LatheGeometry para revolucionar un perfil
    const points = [];
    // Perfil del corte transversal de la corona
    points.push(new THREE.Vector2(innerR, 0));       // Inicio en el ánima
    points.push(new THREE.Vector2(innerR + 0.005, -0.01)); // Profundidad del corte (hundido)
    points.push(new THREE.Vector2(outerR - 0.005, -0.01)); // Borde externo hundido
    points.push(new THREE.Vector2(outerR, 0));       // Borde externo final
    
    // Generar revolución
    return new THREE.LatheGeometry(points, 32);
};

export const Barrel: React.FC<PartProps> = ({ materials }) => {
  const { BARREL_LENGTH } = DIMENSIONS;

  // ----------------------------------------------------------------
  // 1. TUBO PRINCIPAL (BARREL TUBE)
  // ----------------------------------------------------------------
  const barrelTubeGeo = useMemo(() => {
    const length = BARREL_LENGTH - 0.46; // Restamos la recámara
    const outerRadius = 0.072; // Pared gruesa para soportar presión +P

    // A. Forma Exterior (Círculo perfecto)
    const outerShape = new THREE.Shape();
    outerShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // B. Forma Interior (Estriado Poligonal)
    // Generamos el perfil hexagonal suavizado
    const riflingShape = createPolygonalProfile(SPECS.CALIBER_DIAMETER / 2);
    
    // Restamos el estriado al círculo exterior
    outerShape.holes.push(riflingShape.getPoints().reduce((path, p, i) => {
        if (i===0) path.moveTo(p.x, p.y);
        else path.lineTo(p.x, p.y);
        return path;
    }, new THREE.Path()));

    // C. Extrusión con "Twist" (Simulación visual)
    // ThreeJS ExtrudeGeometry no soporta twist nativo en el hueco fácilmente sin pasos masivos.
    // Para mantener el rendimiento pero dar detalle, extruimos recto y usaremos 
    // una textura o normal map si fuera posible. 
    // Como esto es geometría pura, haremos una extrusión simple de alta calidad.
    
    const geometry = new THREE.ExtrudeGeometry(outerShape, {
      steps: 4, // Pasos de segmentación
      depth: length,
      bevelEnabled: true,
      bevelThickness: 0.002, // Pequeño bisel en la unión
      bevelSize: 0.001,
      bevelSegments: 2,
      curveSegments: 32 // Alta resolución circular
    });

    // Centramos el pivote
    geometry.translate(0, 0, 0);
    return geometry;
  }, [BARREL_LENGTH]);

  // ----------------------------------------------------------------
  // 2. RECÁMARA (CHAMBER BLOCK) - EXTERIOR
  // ----------------------------------------------------------------
  const chamberBlockGeo = useMemo(() => {
      const w = SPECS.CHAMBER_OUTER_W;
      const h = SPECS.CHAMBER_OUTER_H;
      const d = 0.46; // Longitud del bloque
      const r = 0.02; // Radio de suavizado (fillet)

      const shape = new THREE.Shape();
      
      // Dibujar perfil cuadrado redondeado (Squircle modificado para Glock)
      shape.moveTo(-w/2 + r, -h/2);
      shape.lineTo(w/2 - r, -h/2); // Base plana
      shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r); // Esquina inf der
      shape.lineTo(w/2, h/2 - r); // Pared der
      shape.quadraticCurveTo(w/2, h/2, w/2 - r, h/2); // Esquina sup der
      shape.lineTo(-w/2 + r, h/2); // Techo plano
      shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r); // Esquina sup izq
      shape.lineTo(-w/2, -h/2 + r); // Pared izq
      shape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2); // Esquina inf izq

      // Hueco de la recámara (Donde entra la bala, ligeramente cónico en realidad)
      // Lo hacemos cilíndrico para el sim
      const chamberHole = new THREE.Path();
      chamberHole.absarc(0, 0, SPECS.CALIBER_DIAMETER/2 + 0.005, 0, Math.PI * 2, true);
      shape.holes.push(chamberHole);

      return new THREE.ExtrudeGeometry(shape, {
          depth: d,
          bevelEnabled: true,
          bevelThickness: 0.015,
          bevelSize: 0.015,
          bevelSegments: 4 // Muy suave para reflejos PBR
      });
  }, []);

  // ----------------------------------------------------------------
  // 3. PESTAÑA SUPERIOR (HOOD EXTENSION)
  // ----------------------------------------------------------------
  // Esta parte encaja en el puerto de expulsión y bloquea el arma.
  const hoodGeo = useMemo(() => {
      const shape = new THREE.Shape();
      const w = 0.12; 
      const h = 0.015; // Altura de la pestaña sobre el bloque
      
      shape.moveTo(-w/2, 0);
      shape.lineTo(w/2, 0);
      shape.lineTo(w/2, h);
      shape.lineTo(-w/2, h);
      
      return new THREE.ExtrudeGeometry(shape, {
          depth: 0.15, // Longitud de la pestaña
          bevelEnabled: true,
          bevelThickness: 0.005,
          bevelSize: 0.005,
          bevelSegments: 2
      });
  }, []);

  // ----------------------------------------------------------------
  // 4. TETÓN DE BLOQUEO INFERIOR (LOCKING LUG / CAM)
  // ----------------------------------------------------------------
  // Esta es la pieza más compleja mecánicamente. Tiene la rampa que choca
  // con el bloque del frame para bajar el cañón.
  const lockingLugGeo = useMemo(() => {
      // Usamos una geometría personalizada construida por vértices o Shape Extrusion compleja
      // Optamos por Shape Extrusion lateral y luego rotada.
      
      const shape = new THREE.Shape();
      // Perfil lateral del Lug
      shape.moveTo(0, 0); // Inicio pegado al cañón
      shape.lineTo(0.12, 0); // Largo base superior
      shape.lineTo(0.12, -0.08); // Pared trasera vertical
      
      // La rampa de desbloqueo (Cam surface)
      // Ángulo crítico para el timing del desbloqueo
      const rampX = 0.12 - (Math.cos(SPECS.LOCKING_LUG_ANGLE) * 0.1); 
      const rampY = -0.08 - (Math.sin(SPECS.LOCKING_LUG_ANGLE) * 0.1);
      
      shape.lineTo(0.04, -0.15); // Punta inferior del lug
      shape.lineTo(0, -0.12); // Vuelta hacia arriba
      shape.lineTo(0, 0); // Cierre

      return new THREE.ExtrudeGeometry(shape, {
          depth: 0.10, // Ancho del lug
          bevelEnabled: true,
          bevelThickness: 0.005,
          bevelSize: 0.005,
          bevelSegments: 2
      });
  }, []);

  // ----------------------------------------------------------------
  // 5. RAMPA DE ALIMENTACIÓN (FEED RAMP)
  // ----------------------------------------------------------------
  // Superficie pulida que guía la punta hueca hacia la recámara.
  const feedRampGeo = useMemo(() => {
      const shape = new THREE.Shape();
      const w = 0.09; // Ancho de la rampa (estrecha para centrar la bala)
      const h = 0.02; // Grosor del material
      
      shape.moveTo(-w/2, 0);
      shape.lineTo(w/2, 0);
      shape.lineTo(w/2, h);
      shape.lineTo(-w/2, h);

      return new THREE.ExtrudeGeometry(shape, {
          depth: 0.12,
          bevelEnabled: false
      });
  }, []);

  // ----------------------------------------------------------------
  // 6. CORONA (CROWN) - DETALLE VISUAL FRONTAL
  // ----------------------------------------------------------------
  const crownGeo = useMemo(() => {
      // Generamos un toroide o un lathe para el borde
      return createCrownGeometry(0.072, SPECS.CALIBER_DIAMETER/2);
  }, []);


  return (
    <group>
      {/* A. TUBO DEL CAÑÓN 
          Posición: Delante de la recámara.
      */}
      <mesh 
        material={materials.barrelSteel} 
        geometry={barrelTubeGeo} 
        position={[0, 0.15, 0.46]} // 0.46 es el offset de la recámara
        castShadow
        receiveShadow
      />

      {/* B. CORONA DEL CAÑÓN (Muzzle Crown)
          Detalle en la punta para realismo.
          Rotación X: 90 grados para alinear el LatheGeometry con el eje Z
      */}
      <mesh
        material={materials.barrelSteel}
        geometry={crownGeo}
        position={[0, 0.15, BARREL_LENGTH]} 
        rotation={[Math.PI/2, 0, 0]}
      />

      {/* C. BLOQUE DE LA RECÁMARA (Chamber Block)
          El corazón del cañón.
      */}
      <group position={[0, 0.15, 0]}>
          <mesh 
            material={materials.barrelSteel} 
            geometry={chamberBlockGeo}
            castShadow
            receiveShadow 
          />
          
          {/* Pestaña superior (Hood) */}
          <mesh 
            material={materials.barrelSteel} 
            geometry={hoodGeo} 
            position={[0, SPECS.CHAMBER_OUTER_H/2, 0.15]} 
            castShadow
          />

          {/* Grabados de Calibre (Simulados con geometría muy fina flotante) */}
          <group position={[-0.05, SPECS.CHAMBER_OUTER_H/2 + 0.0155, 0.3]} rotation={[-Math.PI/2, 0, 0]}>
             {/* Texto "9x19" simulado con bloques si no usamos texturas */}
             <mesh material={materials.ndlcSteel}>
                 <boxGeometry args={[0.06, 0.02, 0.001]} />
             </mesh>
             <mesh material={materials.ndlcSteel} position={[0.08, 0, 0]}>
                 <boxGeometry args={[0.04, 0.02, 0.001]} /> {/* Logo Glock Fake */}
             </mesh>
          </group>
      </group>

      {/* D. SISTEMA DE BLOQUEO INFERIOR (Locking Lug)
      */}
      <group position={[-0.05, 0.065, 0.15]}> 
         {/* Centramos el lug (que tiene ancho 0.10) */}
         <mesh 
            material={materials.barrelSteel} 
            geometry={lockingLugGeo} 
            rotation={[0, Math.PI/2, 0]} // Rotar perfil lateral para alinear
         />
      </group>

      {/* E. RAMPA DE ALIMENTACIÓN (Feed Ramp)
          Debe brillar más que el resto (Pulido espejo).
      */}
      <group 
        position={[0, 0.07, -0.01]} 
        rotation={[-SPECS.FEED_RAMP_ANGLE, 0, 0]} // Inclinación crítica
      >
          <mesh castShadow>
              <boxGeometry args={[0.09, 0.02, 0.14]} />
              {/* Material Override: High Polish Steel */}
              <meshPhysicalMaterial 
                color="#e0e0e0"
                metalness={1.0}
                roughness={0.1} // Muy liso
                clearcoat={0.8}
                clearcoatRoughness={0.05}
              />
          </mesh>
      </group>

      {/* F. DETALLE DE DESGASTE (Wear Patterns)
          Anillos de desgaste en la parte superior del cañón (donde roza el slide).
          Añadimos un cilindro semitransparente o de diferente rugosidad.
      */}
      <mesh position={[0, 0.15, BARREL_LENGTH - 0.2]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.073, 0.073, 0.3, 32, 1, true]} />
          <meshPhysicalMaterial 
            color="#555" 
            metalness={1.0} 
            roughness={0.6} 
            transparent 
            opacity={0.3} 
            side={THREE.DoubleSide}
            depthWrite={false} // Solo efecto visual superficial
          />
      </mesh>

    </group>
  );
};

// ------------------------------------------------------------------
// DOCUMENTACIÓN DE INGENIERÍA ADICIONAL (Contexto para Devs)
// ------------------------------------------------------------------
/*
  SISTEMA BROWNING MODIFICADO:
  El cañón de la Glock 17 no se mueve en línea recta pura hacia atrás.
  1. Al disparar, el cañón y la corredera retroceden juntos unos milímetros (Locked Breech).
  2. El "Locking Lug" inferior golpea el bloque de bloqueo en el frame.
  3. Esto fuerza a la parte trasera del cañón a bajar (Tilt).
  4. La pestaña superior (Hood) se libera de la ventana de expulsión.
  5. La corredera continúa sola hacia atrás, extrayendo la vaina.
  
  ESTE COMPONENTE:
  Está diseñado con el pivote en [0,0,0] relativo al grupo de animación para facilitar
  la rotación de "Tilt" en el `GlockController.tsx`.
*/