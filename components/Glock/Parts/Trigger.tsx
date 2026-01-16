import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PartProps } from '../../../types';

/**
 * ------------------------------------------------------------------
 * INGENIERÍA DE PRECISIÓN: SISTEMA DE CONTROL DE FUEGO GLOCK GEN 5
 * (FIRE CONTROL GROUP - FCG)
 * ------------------------------------------------------------------
 * Este componente masivo modela no solo el gatillo, sino todo el
 * tren de disparo mecánico que conecta el dedo con el percutor.
 *
 * COMPONENTES INCLUIDOS:
 * 1. Zapata del Gatillo (Trigger Shoe) - Polímero
 * 2. Seguro del Gatillo (Safety Blade) - Polímero
 * 3. Barra del Gatillo (Trigger Bar) - Acero estampado
 * 4. Alojamiento del Mecanismo (Mechanism Housing) - Polímero
 * 5. Conector (Connector) - Acero
 * 6. Muelle del Gatillo (Trigger Spring) - Gen 5 (Compresión/Estiramiento)
 * 7. Eyector (Ejector) - Acero
 *
 * CINEMÁTICA COMPLEJA:
 * - Etapa 1 (Pre-travel): El seguro se vence, la barra se desliza atrás.
 * - Etapa 2 (Wall): La barra contacta el conector.
 * - Etapa 3 (Break): La barra cae (simulado por rotación) liberando el percutor.
 */

const SPECS = {
  // Dimensiones del Gatillo
  SHOE_WIDTH: 0.10,
  SAFETY_WIDTH: 0.035,
  TRIGGER_BAR_LEN: 0.95, // Longitud hasta atrás
  
  // Dimensiones del Housing Trasero
  HOUSING_W: 0.12,
  HOUSING_H: 0.28,
  HOUSING_D: 0.22,
  
  // Ángulos Máximos
  SAFETY_ROT_MAX: 0.45,
  TRIGGER_ROT_MAX: 0.65,
};

export const Trigger: React.FC<PartProps & { pulledAmount: number }> = ({ materials, pulledAmount }) => {

  // ================================================================
  // 1. CÁLCULOS DE CINEMÁTICA MECÁNICA
  // ================================================================
  
  // A. Movimiento del Seguro (0% - 15% del pull)
  const safetyProgress = Math.min(pulledAmount * 6.6, 1);
  const safetyRot = safetyProgress * SPECS.SAFETY_ROT_MAX;

  // B. Movimiento del Gatillo (15% - 100% del pull)
  const triggerProgress = pulledAmount < 0.15 ? 0 : (pulledAmount - 0.15) * 1.17;
  const triggerRot = triggerProgress * SPECS.TRIGGER_ROT_MAX;

  // C. Desplazamiento de la Barra del Gatillo (Trigger Bar)
  // La barra se mueve hacia atrás (Z) y baja ligeramente (Y) al final (Break)
  // Usamos trigonometría simple basada en el radio de pivote del gatillo (~0.25dm)
  const barZ = Math.sin(triggerRot) * 0.25; 
  const barY = - (1 - Math.cos(triggerRot)) * 0.25;
  // Simulación de la caída de la barra (Drop safety / Break) al final del recorrido (>90%)
  const barDrop = triggerProgress > 0.9 ? (triggerProgress - 0.9) * 0.5 : 0;


  // ================================================================
  // 2. GEOMETRÍAS PROCEDURALES (MODELADO)
  // ================================================================

  // --- A. ZAPATA DEL GATILLO (SHOE) ---
  const shoeGeo = useMemo(() => {
    const shape = new THREE.Shape();
    // Perfil lateral ergonómico Gen 5
    shape.moveTo(0, 0); // Pivote
    shape.lineTo(0.06, -0.05);
    shape.bezierCurveTo(0.08, -0.15, 0.07, -0.30, 0.04, -0.45); // Curva superior
    shape.bezierCurveTo(0.02, -0.55, -0.05, -0.65, -0.10, -0.68); // Curva de contacto
    shape.lineTo(-0.15, -0.65); // Punta (Hook)
    shape.bezierCurveTo(-0.12, -0.50, -0.08, -0.30, -0.06, -0.10); // Parte trasera
    shape.lineTo(0, 0);

    // Creamos dos mitades para dejar espacio al seguro
    return new THREE.ExtrudeGeometry(shape, { 
        steps: 1, 
        depth: (SPECS.SHOE_WIDTH - SPECS.SAFETY_WIDTH) / 2, 
        bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 3 
    });
  }, []);

  // --- B. PALANCA DEL SEGURO (SAFETY LEVER) ---
  const safetyGeo = useMemo(() => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0.02, -0.05);
      shape.lineTo(0.035, -0.30); // Frente
      shape.lineTo(0.01, -0.32);  // Punta
      shape.lineTo(-0.03, -0.28); // Atrás (Bloqueo)
      shape.lineTo(-0.04, -0.10);
      shape.lineTo(0, 0);
      return new THREE.ExtrudeGeometry(shape, { depth: SPECS.SAFETY_WIDTH - 0.002, bevelEnabled: false });
  }, []);

  // --- C. BARRA DEL GATILLO (TRIGGER BAR) - GEN 5 ---
  const triggerBarGeo = useMemo(() => {
      const shape = new THREE.Shape();
      // Perfil lateral complejo de la barra estampada
      shape.moveTo(0, 0);
      shape.lineTo(0.03, 0.02); // Conexión zapata
      shape.lineTo(0.06, -0.05); // Codo bajada
      shape.lineTo(0.65, -0.05); // Tramo largo recto
      shape.lineTo(0.70, 0.02);  // Subida hacia el cruciforme (Bird's head)
      shape.lineTo(0.85, 0.02);  // Parte superior trasera
      shape.lineTo(0.85, -0.04); // Caída trasera
      shape.lineTo(0.70, -0.04);
      shape.lineTo(0.65, -0.08); // Vuelta inferior
      shape.lineTo(0.05, -0.08); // Retorno tramo largo
      shape.lineTo(0, 0);
      return new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: false });
  }, []);

  // --- D. CRUCIFORME (CRUCIFORM) ---
  // La parte trasera de la barra que interactúa con el percutor y el muelle
  const cruciformGeo = useMemo(() => {
      const shape = new THREE.Shape();
      // Forma de cruz vista desde arriba (simplificada para extrusión Y)
      // Hacemos una placa rectangular que luego posicionamos
      shape.moveTo(0, 0);
      shape.lineTo(0.12, 0);
      shape.lineTo(0.12, 0.14);
      shape.lineTo(0, 0.14);
      return new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
  }, []);

  // --- E. ALOJAMIENTO DEL MECANISMO (TRIGGER HOUSING) ---
  // La caja trasera que sostiene el eyector y conector
  const housingGeo = useMemo(() => {
      const shape = new THREE.Shape();
      const w = SPECS.HOUSING_D;
      const h = SPECS.HOUSING_H;
      // Perfil lateral del housing
      shape.moveTo(0, 0);
      shape.lineTo(w, 0);
      shape.lineTo(w, -h); // Base
      shape.lineTo(w - 0.05, -h); // Corte inferior
      shape.lineTo(0.05, -h + 0.05); // Ángulo frontal inferior
      shape.lineTo(0, -0.1); // Frente superior
      shape.lineTo(0, 0);
      
      // Hueco interno para el mecanismo
      const hole = new THREE.Path();
      hole.moveTo(0.02, -0.02);
      hole.lineTo(w-0.02, -0.02);
      hole.lineTo(w-0.02, -h+0.05);
      hole.lineTo(0.02, -h+0.05);
      shape.holes.push(hole);

      return new THREE.ExtrudeGeometry(shape, { 
          depth: SPECS.HOUSING_W, 
          bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 1 
      });
  }, []);

  // --- F. EYECTOR (EJECTOR) ---
  // Pieza de acero puntiaguda curvada hacia adentro
  const ejectorGeo = useMemo(() => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0.06, 0.02); // Punta
      shape.lineTo(0.02, 0.08); // Base
      shape.lineTo(0, 0.08);
      return new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: false });
  }, []);

  // --- G. CONECTOR (CONNECTOR) ---
  // La pieza "menos" (-) o "punto" (.) que controla el peso del gatillo
  const connectorGeo = useMemo(() => {
      const shape = new THREE.Shape();
      // Forma de L inclinada
      shape.moveTo(0, 0);
      shape.lineTo(0.01, 0.15); // Brazo vertical
      shape.lineTo(0.05, 0.20); // Labio superior (Lip)
      shape.lineTo(0.06, 0.19);
      shape.lineTo(0.02, 0.14);
      shape.lineTo(0.015, 0);
      return new THREE.ExtrudeGeometry(shape, { depth: 0.01, bevelEnabled: false });
  }, []);

  
  return (
    <group position={[0, -0.1, 0.65]}> {/* Posición Pivote Gatillo */}

      {/* ========================================================
          GRUPO 1: ZAPATA Y BARRA (MOVIMIENTO PRINCIPAL)
          Rota con el dedo.
         ======================================================== */}
      <group rotation={[-triggerRot, 0, 0]}>
          
          {/* 1.1 Zapata Izquierda */}
          <mesh material={materials.polymer} geometry={shoeGeo} position={[-SPECS.SHOE_WIDTH/2, 0, 0]} />

          {/* 1.2 Zapata Derecha */}
          <mesh material={materials.polymer} geometry={shoeGeo} position={[SPECS.SHOE_WIDTH/2 - (SPECS.SHOE_WIDTH - SPECS.SAFETY_WIDTH)/2, 0, 0]} />

          {/* 1.3 Barra del Gatillo (Trigger Bar) */}
          <group position={[SPECS.SHOE_WIDTH/2 + 0.01, 0.02, -0.05]}>
              {/* Cuerpo principal de la barra */}
              <mesh material={materials.ndlcSteel} geometry={triggerBarGeo} />
              
              {/* Cruciforme trasero (Soldado a la barra) */}
              <group position={[0.72, 0.02, -0.06]}>
                  <mesh material={materials.ndlcSteel} rotation={[Math.PI/2, 0, 0]} geometry={cruciformGeo} />
                  
                  {/* Pestaña del percutor (Sear Tab) - Vertical */}
                  <mesh material={materials.ndlcSteel} position={[0.06, 0.02, -0.07]}>
                      <boxGeometry args={[0.02, 0.06, 0.05]} />
                  </mesh>
                  
                  {/* Resorte del Gatillo (Trigger Spring) - Gen 5 Style */}
                  {/* En Gen 5 es un muelle de compresión dentro del housing, simplificado aquí como cilindro */}
                  <mesh position={[0.06, -0.15, -0.05]} rotation={[0, 0, 0.2]}>
                      <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
                      <meshStandardMaterial color="#888" />
                  </mesh>
              </group>
          </group>


          {/* ====================================================
              SUB-GRUPO: SEGURO (MOVIMIENTO INDEPENDIENTE)
             ==================================================== */}
          <group position={[0, -0.25, 0.02]} rotation={[SPECS.SAFETY_ROT_MAX - safetyRot, 0, 0]}>
              <mesh material={materials.polymer} geometry={safetyGeo} position={[-SPECS.SAFETY_WIDTH/2, 0, 0]} />
              <mesh rotation={[0, 0, Math.PI/2]}> {/* Pin del seguro */}
                  <cylinderGeometry args={[0.005, 0.005, SPECS.SAFETY_WIDTH, 8]} />
                  <meshStandardMaterial color="#333" />
              </mesh>
          </group>

      </group>


      {/* ========================================================
          GRUPO 2: MECANISMO TRASERO (HOUSING)
          Estático respecto al frame, pero contiene piezas clave.
         ======================================================== */}
      {/* Ubicado donde termina la barra del gatillo */}
      <group position={[0, 0.15, -SPECS.TRIGGER_BAR_LEN]}> 
          
          {/* 2.1 Housing de Polímero */}
          <mesh 
            material={materials.polymer} 
            geometry={housingGeo} 
            position={[-SPECS.HOUSING_W/2, 0, 0]} 
          />

          {/* 2.2 Eyector (Ejector) - Acero */}
          {/* Montado en el frente izquierdo del housing */}
          <group position={[-0.04, 0.01, 0.05]}>
              <mesh 
                material={materials.ndlcSteel} 
                geometry={ejectorGeo} 
                rotation={[0, -0.1, 0]} // Leve curva hacia adentro
              />
          </group>

          {/* 2.3 Conector (Connector) - Acero */}
          {/* Montado en el lado derecho interior */}
          <group position={[0.035, -0.15, 0.15]}>
              <mesh 
                material={materials.springSteel} 
                geometry={connectorGeo} 
                rotation={[0.1, 0, -0.1]} // Inclinado para actuar como muelle
              />
          </group>
          
          {/* Detalle del Housing: Tornillo de ajuste (Ejector stop) */}
          <mesh position={[0, -0.2, 0.1]} rotation={[0, 0, Math.PI/2]}>
               <cylinderGeometry args={[0.01, 0.01, SPECS.HOUSING_W + 0.01, 8]} />
               <meshStandardMaterial color="#111" />
          </mesh>

      </group>

      {/* ========================================================
          GRUPO 3: PINES Y EJES DEL SISTEMA
         ======================================================== */}
      
      {/* Trigger Axis Pin (Eje principal del gatillo) */}
      <mesh 
        material={materials.ndlcSteel} 
        rotation={[0, 0, Math.PI/2]} 
        position={[0, 0, 0]}
      >
          <cylinderGeometry args={[0.018, 0.018, SPECS.SHOE_WIDTH + 0.01, 16]} />
          {/* Cabezas del pin redondeadas */}
          <mesh position={[0, 0.06, 0]}><sphereGeometry args={[0.018, 8, 8]} /></mesh>
          <mesh position={[0, -0.06, 0]}><sphereGeometry args={[0.018, 8, 8]} /></mesh>
      </mesh>

    </group>
  );
};