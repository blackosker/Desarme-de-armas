import React, { useMemo } from 'react';
import * as THREE from 'three';
import { animated, SpringValue } from '@react-spring/three';
import { DIMENSIONS } from '../../../constants';
import { PartProps } from '../../../types';

/**
 * ------------------------------------------------------------------
 * INGENIERÍA DE PRECISIÓN: GLOCK 17 GEN 5 FRAME (POLYMER)
 * ------------------------------------------------------------------
 * Este componente reconstruye el armazón usando curvas de Bézier para
 * capturar la ergonomía orgánica que diferencia a la Gen 5.
 */

const SPECS = {
  RAIL_WIDTH: 0.21,   // Ancho del riel Picatinny
  RAIL_SLOT_W: 0.05,  // Ancho de la ranura transversal
  GRIP_WIDTH: 0.30,   // Ancho del grip sin paneles
  PANEL_DEPTH: 0.015, // Profundidad de la textura
};

export const Frame: React.FC<PartProps & { slidePosition?: SpringValue<number> }> = ({ materials, slidePosition }) => {
  const { SLIDE_LENGTH, GRIP_ANGLE, FRAME_WIDTH } = DIMENSIONS;

  // ----------------------------------------------------------------
  // 1. PERFIL MAESTRO DEL GRIP (SIDE PROFILE)
  // ----------------------------------------------------------------
  // Dibuja la silueta lateral completa del grip, incluyendo el
  // beavertail y el arco del guardamonte.
  const gripProfileGeo = useMemo(() => {
    const shape = new THREE.Shape();

    // Coordenadas relativas al punto de pivote superior (Cerca del Slide)
    // A. Beavertail (Cola de castor) - Parte superior trasera
    shape.moveTo(-0.15, 0.08); 
    shape.bezierCurveTo(-0.25, 0.05, -0.32, -0.15, -0.28, -0.30);
    
    // B. Backstrap (Lomo trasero) - La "joroba" ergonómica
    shape.bezierCurveTo(-0.24, -0.60, -0.32, -1.0, -0.26, -1.35);
    
    // C. Base del Magwell (Donde entra el cargador)
    shape.lineTo(0.22, -1.35); 
    
    // D. Front Strap (Frente del grip) - Recto en Gen 5
    // Pequeña curva hacia afuera en la base (Flare)
    shape.bezierCurveTo(0.24, -1.25, 0.20, -1.1, 0.20, -0.4); 
    
    // E. Undercut del Guardamonte (Corte bajo el gatillo)
    // Crítico para un agarre alto
    shape.bezierCurveTo(0.20, -0.15, 0.12, -0.05, 0.00, -0.02);

    // Cierre superior
    shape.lineTo(-0.15, 0.08);

    const extrudeSettings = {
      steps: 2,
      depth: SPECS.GRIP_WIDTH,
      bevelEnabled: true,
      bevelThickness: 0.04, // Bordes muy redondeados (polímero)
      bevelSize: 0.04,
      bevelSegments: 5 // Alta suavidad
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Centrar la geometría en el eje Z (que es el ancho del grip tras rotar)
    geometry.translate(0, 0, -SPECS.GRIP_WIDTH / 2);
    
    return geometry;
  }, []);

  // ----------------------------------------------------------------
  // 2. GUARDAMONTE (TRIGGER GUARD)
  // ----------------------------------------------------------------
  // Geometría separada para controlar mejor el hueco y el grosor.
  const triggerGuardGeo = useMemo(() => {
      const shape = new THREE.Shape();
      
      // Perfil Exterior
      shape.moveTo(0, 0); // Unión trasera con grip
      shape.lineTo(0.48, 0); // Unión delantera con Dust Cover
      shape.bezierCurveTo(0.58, 0, 0.62, -0.15, 0.55, -0.30); // Frente curvo
      shape.lineTo(0.15, -0.32); // Fondo plano
      shape.bezierCurveTo(0.05, -0.32, 0, -0.20, 0, 0); // Curva trasera

      // Perfil Interior (Hueco para el dedo)
      const hole = new THREE.Path();
      hole.moveTo(0.08, -0.06); // Margen superior
      hole.lineTo(0.42, -0.06);
      hole.bezierCurveTo(0.50, -0.06, 0.50, -0.22, 0.42, -0.24);
      hole.lineTo(0.15, -0.24);
      hole.bezierCurveTo(0.08, -0.24, 0.05, -0.15, 0.08, -0.06);
      shape.holes.push(hole);

      return new THREE.ExtrudeGeometry(shape, {
          depth: 0.14, // Más estrecho que el grip
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 3
      });
  }, []);

  // ----------------------------------------------------------------
  // 3. RIELES Y DUST COVER (PARTE DELANTERA)
  // ----------------------------------------------------------------
  const dustCoverGeo = useMemo(() => {
      const length = SLIDE_LENGTH - 0.5; // Longitud delantera
      const width = FRAME_WIDTH;
      const height = 0.18;
      
      // Usamos un perfil en U para que el slide corra por dentro/encima
      const shape = new THREE.Shape();
      const w = width / 2;
      
      shape.moveTo(-w, 0); // Top Left
      shape.lineTo(-w, -height); // Bottom Left
      shape.quadraticCurveTo(0, -height - 0.05, w, -height); // Fondo redondeado
      shape.lineTo(w, 0); // Top Right
      
      // Riel Picatinny (Corte en el perfil)
      // Simplemente extruimos el bloque, los cortes transversales los hacemos con meshes aparte.
      
      return new THREE.ExtrudeGeometry(shape, {
          depth: length,
          bevelEnabled: true,
          bevelThickness: 0.01,
          bevelSize: 0.01,
          bevelSegments: 2
      });
  }, [SLIDE_LENGTH, FRAME_WIDTH]);

  // ----------------------------------------------------------------
  // 4. PANELES DE TEXTURA (RTF - ROUGH TEXTURED FRAME)
  // ----------------------------------------------------------------
  // Estos paneles se renderizan con un material diferente (más rugoso/oscuro)
  // para simular el punteado láser o moldeado.
  const texturePanelGeo = useMemo(() => {
      const shape = new THREE.Shape();
      // Forma trapezoidal compleja que sigue el contorno del grip
      shape.moveTo(-0.16, -0.35);
      shape.lineTo(-0.20, -1.25); // Borde trasero
      shape.lineTo(0.14, -1.25);  // Base
      shape.lineTo(0.14, -0.35);  // Borde delantero
      
      return new THREE.ExtrudeGeometry(shape, {
          depth: SPECS.PANEL_DEPTH,
          bevelEnabled: true,
          bevelThickness: 0.005,
          bevelSize: 0.005,
          bevelSegments: 1
      });
  }, []);

  // ----------------------------------------------------------------
  // 5. BLOQUE DE BLOQUEO (LOCKING BLOCK) - ACERO
  // ----------------------------------------------------------------
  // Pieza interna crítica visible cuando el arma se desarma.
  const lockingBlockGeo = useMemo(() => {
      const shape = new THREE.Shape();
      // Perfil lateral del bloque
      shape.moveTo(0, 0);
      shape.lineTo(0.25, 0);
      shape.lineTo(0.25, -0.15);
      shape.lineTo(0.10, -0.15);
      shape.lineTo(0, -0.05); // Rampa para el cañón
      
      return new THREE.ExtrudeGeometry(shape, {
          depth: 0.12,
          bevelEnabled: false
      });
  }, []);

  return (
    <group>
      
      {/* ==========================================
          GRUPO 1: ESTRUCTURA SUPERIOR (DUST COVER)
          Alineado con el eje del cañón
         ========================================== */}
      <group position={[0, 0.06, 0.35]}> {/* Offset hacia adelante */}
          
          {/* Cuerpo Principal del Dust Cover */}
          <mesh material={materials.polymer} geometry={dustCoverGeo} position={[0, 0, 0]} />
          
          {/* Placa de Número de Serie (Debajo del riel) */}
          <mesh position={[0, -0.20, 0.8]} rotation={[Math.PI/2, 0, 0]}>
              <planeGeometry args={[0.15, 0.08]} />
              <meshStandardMaterial color="#b0b0b0" metalness={0.8} roughness={0.4} />
          </mesh>

          {/* Ranura Picatinny (Cross Slot) */}
          {/* Usamos geometría negativa visual (negro mate) o modelamos el corte */}
          <mesh material={materials.polymer} position={[0, -0.18, 1.1]}>
              <boxGeometry args={[SPECS.RAIL_WIDTH + 0.02, 0.04, 0.05]} /> 
          </mesh>
      </group>


      {/* ==========================================
          GRUPO 2: GRIP ASSEMBLY (EMPUÑADURA)
          Rotado según el ángulo de Glock (aprox 22 grados)
         ========================================== */}
      <group position={[0, 0, 0]} rotation={[GRIP_ANGLE, 0, 0]}>
        
        {/* Cuerpo Principal del Grip */}
        {/* Rotamos 90 en Y porque ExtrudeGeometry se hace en XY y extruye en Z */}
        <mesh 
            material={materials.polymer} 
            geometry={gripProfileGeo} 
            rotation={[0, Math.PI/2, 0]} 
            castShadow 
            receiveShadow
        />

        {/* Paneles de Textura (Izquierda y Derecha) */}
        <group>
            {/* Panel Derecho */}
            <mesh 
                geometry={texturePanelGeo} 
                position={[SPECS.GRIP_WIDTH/2, 0, 0]} 
                rotation={[0, Math.PI/2, 0]}
            >
                {/* Material Override: Más rugoso y oscuro */}
                <meshStandardMaterial color="#050505" roughness={1.0} metalness={0.0} />
            </mesh>
            
            {/* Panel Izquierdo */}
            <mesh 
                geometry={texturePanelGeo} 
                position={[-SPECS.GRIP_WIDTH/2 - SPECS.PANEL_DEPTH, 0, 0]} 
                rotation={[0, Math.PI/2, 0]}
            >
                <meshStandardMaterial color="#050505" roughness={1.0} metalness={0.0} />
            </mesh>
        </group>

        {/* Magwell Flare (Ensanche Gen 5) */}
        {/* Modelado como un anillo en la base */}
        <group position={[0, -1.35, 0]}>
             <mesh material={materials.polymer}>
                 <cylinderGeometry args={[0.22, 0.26, 0.08, 4, 1, false, Math.PI/4]} /> 
                 {/* Cylinder de 4 lados rotado hace un rectángulo suavizado */}
             </mesh>
             {/* Corte frontal para extracción manual del cargador */}
             <mesh material={materials.polymer} position={[0, 0, 0.16]} rotation={[0.5, 0, 0]}>
                 <boxGeometry args={[0.15, 0.1, 0.05]} />
             </mesh>
        </group>

        {/* Alojamiento del Mecanismo de Disparo (Trigger Housing) - Visible arriba atrás */}
        <mesh material={materials.polymer} position={[0, -0.2, -0.3]}>
             <boxGeometry args={[0.12, 0.3, 0.2]} />
        </mesh>
      </group>


      {/* ==========================================
          GRUPO 3: GUARDAMONTE (TRIGGER GUARD)
         ========================================== */}
      {/* Posicionado para conectar Dust Cover y Grip */}
      <group position={[-0.07, -0.17, 0.55]}>
         <mesh material={materials.polymer} geometry={triggerGuardGeo} />
         
         {/* Textura en el frente del guardamonte (para dedo de apoyo) */}
         <mesh position={[0.56, -0.15, 0]} rotation={[0, 0, -0.3]}>
             <boxGeometry args={[0.02, 0.15, 0.12]} />
             <meshStandardMaterial color="#080808" roughness={0.9} />
         </mesh>
      </group>


      {/* ==========================================
          GRUPO 4: COMPONENTES INTERNOS Y CONTROLES
          Acero nDLC y mecanismos
         ========================================== */}
      
      {/* Locking Block (Acero) - Donde golpea el cañón */}
      <group position={[-0.06, 0.04, 0.45]}>
          <mesh material={materials.springSteel} geometry={lockingBlockGeo} rotation={[0, Math.PI/2, 0]} />
          
          {/* Rails del Locking Block (Front Rails) */}
          <mesh material={materials.ndlcSteel} position={[0, 0.01, 0.1]}>
              <boxGeometry args={[0.22, 0.02, 0.06]} />
          </mesh>
      </group>

      {/* Rear Rails (Rieles Traseros) */}
      <group position={[0, 0.05, -0.1]}>
           <mesh material={materials.ndlcSteel}>
               <boxGeometry args={[0.22, 0.02, 0.06]} />
           </mesh>
      </group>

      {/* Slide Stop Lever (Ambidiestra Gen 5) - ANIMATED */}
      {/* Pivota en el Trigger Pin (aprox 0.45 z) y se extiende hacia atrás */}
      {/* Cuando Slide Racked (Pos > 0.8), la palanca sube para bloquear */}
      <animated.group 
        position={[0, 0.05, 0.45]} 
        rotation-x={slidePosition ? slidePosition.to(p => p > 0.8 ? -0.25 : 0) : 0}
      >
          {/* Geometría desplazada relativa al pivote */}
          {/* Original Y=0.08 (dif +0.03), Original Z=0.35 (dif -0.10) */}
          <group position={[0, 0.03, -0.1]}>
            {/* Izquierda - Ligeramente más claro para destacar */}
            <mesh material={materials.springSteel} position={[0.17, 0, 0]}>
                <boxGeometry args={[0.02, 0.06, 0.15]} />
            </mesh>
            {/* Derecha */}
            <mesh material={materials.springSteel} position={[-0.17, 0, 0]}>
                <boxGeometry args={[0.02, 0.06, 0.15]} />
            </mesh>
          </group>
      </animated.group>

      {/* Takedown Lever (Cierre de desarmado) */}
      <group position={[0, 0.03, 0.72]}>
          <mesh material={materials.ndlcSteel}>
              <boxGeometry args={[0.36, 0.015, 0.08]} />
          </mesh>
          {/* Pestañas de agarre */}
          <mesh material={materials.ndlcSteel} position={[0.18, 0, 0]}>
               <boxGeometry args={[0.02, 0.05, 0.08]} />
          </mesh>
           <mesh material={materials.ndlcSteel} position={[-0.18, 0, 0]}>
               <boxGeometry args={[0.02, 0.05, 0.08]} />
          </mesh>
      </group>

      {/* Magazine Catch (Liberador de cargador) - Reversible */}
      <group rotation={[GRIP_ANGLE, 0, 0]} position={[0, 0, 0]}>
          <mesh material={materials.polymer} position={[0.16, -0.15, -0.18]}>
              <boxGeometry args={[0.04, 0.14, 0.08]} /> 
          </mesh>
          {/* Textura estriada en el botón */}
          <mesh position={[0.181, -0.15, -0.18]}>
               <planeGeometry args={[0.01, 0.12]} />
               <meshStandardMaterial color="#000" />
          </mesh>
      </group>

      {/* ==========================================
          GRUPO 5: PINES (PASADORES)
          Gen 5 usa solo 2 pines principales (Trigger Pin y Housing Pin)
          a diferencia de los 3 de la Gen 3.
         ========================================== */}
      
      {/* Trigger Pin (Arriba del gatillo) */}
      <mesh material={materials.ndlcSteel} position={[0, 0.05, 0.45]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.31, 16]} />
          {/* Cabezas del pin */}
          <mesh position={[0, 0.155, 0]}>
               <circleGeometry args={[0.02, 16]} />
               <meshStandardMaterial color="#111" />
          </mesh>
           <mesh position={[0, -0.155, 0]} rotation={[Math.PI, 0, 0]}>
               <circleGeometry args={[0.02, 16]} />
               <meshStandardMaterial color="#111" />
          </mesh>
      </mesh>

      {/* Trigger Mechanism Housing Pin (Atrás en el grip) */}
      <group rotation={[GRIP_ANGLE, 0, 0]}>
          <mesh material={materials.polymer} position={[0, -0.1, -0.25]} rotation={[0, 0, Math.PI/2]}>
             <cylinderGeometry args={[0.015, 0.015, 0.31, 16]} />
             {/* Este pin suele ser de polímero o metal recubierto */}
          </mesh>
      </group>

    </group>
  );
};
