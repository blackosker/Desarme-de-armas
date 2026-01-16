import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PartProps } from '../../../types';

/**
 * ------------------------------------------------------------------
 * INGENIERÍA DE PRECISIÓN: GLOCK 17 GEN 5 RECOIL SPRING ASSEMBLY (RSA)
 * ------------------------------------------------------------------
 * La Gen 5 utiliza un sistema de doble resorte cautivo para reducir
 * el retroceso percibido y aumentar la vida útil del sistema.
 * * COMPONENTES DEL ENSAMBLAJE:
 * 1. Varilla Guía Interna (Inner Guide Rod) - Polímero/Acero
 * 2. Tubo Guía Exterior (Outer Guide Tube) - Acero
 * 3. Resorte Interno (Inner Spring) - Alambre redondo
 * 4. Resorte Externo (Outer Spring) - Alambre plano (Flat wire)
 * 5. Tapa Frontal (Front Cap) - Con orificio hexagonal
 * 6. Base Trasera (Rear Base) - Asiento para el cañón
 */

// Especificaciones Técnicas (Aprox Gen 5 en decímetros)
const SPECS = {
    TOTAL_LENGTH: 0.82,       // Longitud total relajada
    OUTER_SPRING_LEN: 0.58,   // Longitud resorte externo
    INNER_SPRING_LEN: 0.78,   // Longitud resorte interno
    
    OUTER_DIAMETER: 0.12,     // Diámetro total externo
    INNER_ROD_DIA: 0.045,     // Varilla interna
    OUTER_TUBE_DIA: 0.085,    // Tubo exterior
    
    OUTER_WIRE_W: 0.012,      // Ancho alambre plano
    OUTER_WIRE_H: 0.004,      // Alto alambre plano
    
    INNER_WIRE_R: 0.0035,     // Radio alambre interno
};

/**
 * Generador de Curva Helicoidal Avanzado
 * Permite definir radio variable (tapered springs) aunque Glock usa rectos.
 */
class HelixCurve extends THREE.Curve<THREE.Vector3> {
    radius: number;
    height: number;
    turns: number;

    constructor(radius: number, height: number, turns: number) {
        super();
        this.radius = radius;
        this.height = height;
        this.turns = turns;
    }

    getPoint(t: number, optionalTarget = new THREE.Vector3()) {
        const angle = 2 * Math.PI * this.turns * t;
        const x = this.radius * Math.cos(angle);
        const y = this.radius * Math.sin(angle);
        
        // Distribución lineal de altura (Resorte lineal)
        // En una simulación física real, esto cambiaría con la compresión (Hooke's Law)
        const z = this.height * t;

        return optionalTarget.set(x, y, z);
    }
}

export const RecoilSpring: React.FC<PartProps> = ({ materials }) => {

  // ----------------------------------------------------------------
  // 1. VARILLA GUÍA INTERNA (INNER GUIDE ROD)
  // ----------------------------------------------------------------
  // El núcleo del sistema.
  const innerRodGeo = useMemo(() => {
      const radius = SPECS.INNER_ROD_DIA / 2;
      const length = SPECS.TOTAL_LENGTH - 0.05; // Un poco más corta que el total
      
      // Cilindro simple de alta resolución
      return new THREE.CylinderGeometry(radius, radius, length, 16);
  }, []);

  // ----------------------------------------------------------------
  // 2. TUBOS Y TOPES (OUTER TUBE & CUPS)
  // ----------------------------------------------------------------
  const outerTubeGeo = useMemo(() => {
      // El tubo que separa los dos resortes
      const outerR = SPECS.OUTER_TUBE_DIA / 2;
      const innerR = SPECS.OUTER_TUBE_DIA / 2 - 0.005; // Pared fina
      const length = 0.45; // Longitud del tubo deslizante
      
      const shape = new THREE.Shape();
      shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
      shape.holes.push(hole);

      return new THREE.ExtrudeGeometry(shape, {
          depth: length,
          bevelEnabled: true,
          bevelThickness: 0.002,
          bevelSize: 0.002,
          bevelSegments: 2
      });
  }, []);

  // ----------------------------------------------------------------
  // 3. RESORTE EXTERNO (FLAT WIRE OUTER SPRING)
  // ----------------------------------------------------------------
  // Glock usa resortes de alambre plano para reducir espacio sólido comprimido.
  const outerSpringGeo = useMemo(() => {
      const radius = SPECS.OUTER_DIAMETER / 2 - SPECS.OUTER_WIRE_W;
      const height = SPECS.OUTER_SPRING_LEN;
      const turns = 12;

      const path = new HelixCurve(radius, height, turns);
      
      // Para simular alambre plano, usamos TubeGeometry pero lo escalamos
      // en el renderizado (scale={[1, 0.4, 1]} por ejemplo) o usamos una forma personalizada.
      // Aquí usaremos TubeGeometry con radio ajustado y "radialSegments" bajos (4) rotados
      // para parecer rectangular, o simplemente un tubo delgado.
      
      // Opción visual: Tubo normal ligeramente más grueso
      return new THREE.TubeGeometry(path, 128, SPECS.OUTER_WIRE_W, 8, false);
  }, []);

  // ----------------------------------------------------------------
  // 4. RESORTE INTERNO (ROUND WIRE INNER SPRING)
  // ----------------------------------------------------------------
  const innerSpringGeo = useMemo(() => {
      const radius = SPECS.OUTER_TUBE_DIA / 2 - 0.01; // Dentro del tubo
      const height = SPECS.INNER_SPRING_LEN;
      const turns = 18; // Más vueltas, alambre más fino

      const path = new HelixCurve(radius, height, turns);
      return new THREE.TubeGeometry(path, 150, SPECS.INNER_WIRE_R, 8, false);
  }, []);

  // ----------------------------------------------------------------
  // 5. TAPA FRONTAL CON HEXÁGONO (FRONT CAP)
  // ----------------------------------------------------------------
  // El detalle icónico en el frente de la pistola.
  const frontCapGeo = useMemo(() => {
      const outerR = SPECS.OUTER_DIAMETER / 2 + 0.01; // Un poco más ancho que el resorte
      const thickness = 0.03;

      const shape = new THREE.Shape();
      // Círculo exterior
      shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);

      // Hueco Hexagonal (Allen Key Hole)
      const hexSize = 0.025;
      const hole = new THREE.Path();
      for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * hexSize;
          const y = Math.sin(angle) * hexSize;
          if (i === 0) hole.moveTo(x, y);
          else hole.lineTo(x, y);
      }
      hole.closePath();
      shape.holes.push(hole);

      return new THREE.ExtrudeGeometry(shape, {
          depth: thickness,
          bevelEnabled: true,
          bevelThickness: 0.005,
          bevelSize: 0.005,
          bevelSegments: 3
      });
  }, []);

  // ----------------------------------------------------------------
  // 6. BASE TRASERA (REAR BASE PLATE)
  // ----------------------------------------------------------------
  // La pieza de polímero semicircular que apoya contra el "Locking Lug" del cañón.
  const basePlateGeo = useMemo(() => {
      const r = 0.085; // Radio grande
      const w = 0.16;  // Ancho total
      const h = 0.04;  // Grosor

      const shape = new THREE.Shape();
      
      // Dibuja una "D" redondeada o semicírculo achatado
      shape.moveTo(-w/2, -r/2);
      shape.lineTo(w/2, -r/2); // Base plana superior (donde toca el cañón)
      
      // Curva inferior
      shape.bezierCurveTo(w/2, r, -w/2, r, -w/2, -r/2);

      // Agujero para la varilla
      const hole = new THREE.Path();
      hole.absarc(0, 0, SPECS.INNER_ROD_DIA/2, 0, Math.PI * 2, true);
      shape.holes.push(hole);

      return new THREE.ExtrudeGeometry(shape, {
          depth: h,
          bevelEnabled: false
      });
  }, []);

  // ----------------------------------------------------------------
  // 7. RETENEDOR DE ALAMBRE (WIRE CLIP)
  // ----------------------------------------------------------------
  // Pequeño clip en la punta que evita que el resorte salga volando.
  const wireClipGeo = useMemo(() => {
      return new THREE.TorusGeometry(SPECS.INNER_ROD_DIA/2 + 0.002, 0.002, 8, 16);
  }, []);

  return (
    // Grupo Maestro Rotado para alinear con el eje Z del arma
    // Asumimos que el Z+ es hacia el frente del arma en el ensamblaje global
    <group rotation={[0, 0, 0]}> 
      
      {/* ========================================================
          ZONA A: VARILLA GUÍA INTERNA (EJE CENTRAL)
         ======================================================== */}
      <mesh 
        material={materials.polymer} // A veces es metal, en Gen 5 suele ser polímero reforzado
        geometry={innerRodGeo} 
        rotation={[Math.PI/2, 0, 0]} 
        position={[0, 0, 0]} // Centro del conjunto
      />

      {/* ========================================================
          ZONA B: TAPA FRONTAL (FRONT CAP)
         ======================================================== */}
      {/* Se sitúa en el extremo positivo Z (frente del arma) */}
      <mesh 
        material={materials.ndlcSteel} 
        geometry={frontCapGeo} 
        position={[0, 0, SPECS.TOTAL_LENGTH / 2]} 
      />

      {/* ========================================================
          ZONA C: RESORTE EXTERNO (OUTER SPRING)
         ======================================================== */}
      {/* Ubicado en la mitad delantera del ensamblaje */}
      <group position={[0, 0, 0.1]}>
          <mesh 
             material={materials.springSteel} 
             geometry={outerSpringGeo} 
             // Escala en Y (que es el espesor del tubo) para simular alambre plano
             scale={[1, 1, 0.5]} // Aplastamos el resorte un poco visualmente
          />
      </group>

      {/* ========================================================
          ZONA D: TUBO SEPARADOR (SLIDING TUBE)
         ======================================================== */}
      {/* Tubo metálico que separa los dos muelles y se desliza */}
      <mesh 
         material={materials.barrelSteel} // Acero crudo o tratado
         geometry={outerTubeGeo} 
         position={[0, 0, -0.1]} // Más atrás
      />

      {/* ========================================================
          ZONA E: RESORTE INTERNO (INNER SPRING)
         ======================================================== */}
      {/* Corre dentro del tubo separador y sobre la varilla */}
      <group position={[0, 0, -0.35]}>
          <mesh 
             material={materials.springSteel} 
             geometry={innerSpringGeo} 
          />
      </group>

      {/* ========================================================
          ZONA F: BASE TRASERA (REAR PLATE)
         ======================================================== */}
      {/* La parte que se apoya contra el bloque del cañón */}
      <group position={[0, 0, -SPECS.TOTAL_LENGTH / 2 + 0.02]}>
          <mesh 
             material={materials.polymer} 
             geometry={basePlateGeo} 
          />
      </group>

      {/* ========================================================
          ZONA G: DETALLES FINOS (CLIPS & WASHERS)
         ======================================================== */}
      {/* Clip frontal */}
      <mesh 
         material={materials.springSteel} 
         geometry={wireClipGeo} 
         position={[0, 0, SPECS.TOTAL_LENGTH / 2 - 0.05]} 
      />

      {/* Arandela de apoyo intermedia (entre resortes) */}
      <mesh 
         material={materials.ndlcSteel} 
         rotation={[Math.PI/2, 0, 0]} 
         position={[0, 0, 0]}
      >
          <cylinderGeometry args={[0.065, 0.065, 0.005, 16]} />
      </mesh>

    </group>
  );
};

// ------------------------------------------------------------------
// NOTAS DE INGENIERÍA PARA EL SISTEMA RSA GEN 5
// ------------------------------------------------------------------
/*
  1. FUNCIONAMIENTO DE DOBLE ETAPA:
     El sistema RSA de Gen 4/5 utiliza dos resortes con diferentes
     constantes elásticas (K).
     - Etapa 1 (Resorte Externo): Absorbe la energía inicial del disparo
       y el movimiento de desbloqueo (unlocking).
     - Etapa 2 (Resorte Interno): Entra en juego al final del recorrido
       para evitar que la corredera golpee el frame (buffering) y 
       asegurar el retorno a batería con fuerza.

  2. GEOMETRÍA DE ALAMBRE PLANO:
     El resorte externo usa alambre de sección rectangular. Esto permite
     que el resorte se comprima a una altura sólida menor (solid height)
     que un alambre redondo equivalente, permitiendo más recorrido en
     el mismo espacio.

  3. CONSTRUCCIÓN TELESCÓPICA:
     El tubo separador (Outer Tube) actúa como guía para el resorte externo
     y como carcasa para el interno, evitando que los resortes se doblen
     (kinking) durante la compresión rápida.
*/