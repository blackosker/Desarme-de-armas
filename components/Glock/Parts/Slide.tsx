import React, { useMemo } from 'react';
import * as THREE from 'three';
import { DIMENSIONS } from '../../../constants';
import { PartProps } from '../../../types';

/**
 * ------------------------------------------------------------------
 * INGENIERÍA DE PRECISIÓN: GLOCK 17 GEN 5 SLIDE (CORREDERA)
 * ------------------------------------------------------------------
 * La corredera se construye en tres secciones longitudinales para
 * crear el puerto de expulsión (Ejection Port) sin operaciones booleanas
 * costosas en tiempo real.
 * * SECCIONES:
 * 1. Nose (Frente): Sólido con agujero para cañón y resorte.
 * 2. Port Wall (Medio): Solo pared izquierda (el puerto está a la derecha/arriba).
 * 3. Breech (Atrás): Bloque macizo que contiene el mecanismo del percutor.
 */

const SPECS = {
    HEIGHT: 0.255,      // Altura del slide
    BEVEL: 0.035,       // Biselado superior lateral
    WALL_THICKNESS: 0.04,
    PORT_LENGTH: 0.32,  // Longitud de apertura del puerto
    NOSE_LENGTH: 0.55,  // Longitud de la sección frontal
};

export const Slide: React.FC<PartProps> = ({ materials }) => {
  const { SLIDE_LENGTH, SLIDE_WIDTH } = DIMENSIONS;

  // ----------------------------------------------------------------
  // 1. PERFIL TRANSVERSAL COMÚN (CROSS SECTION)
  // ----------------------------------------------------------------
  // Define la forma de "U" invertida del slide.
  const commonShape = useMemo(() => {
    const s = new THREE.Shape();
    const w = SLIDE_WIDTH;
    const h = SPECS.HEIGHT;
    const b = SPECS.BEVEL;

    // Exterior (Clockwise)
    s.moveTo(-w/2, 0);          // Bottom Left
    s.lineTo(-w/2, h - b);      // Wall Left
    s.lineTo(-(w/2 - b), h);    // Bevel Left
    s.lineTo((w/2 - b), h);     // Top Flat
    s.lineTo(w/2, h - b);       // Bevel Right
    s.lineTo(w/2, 0);           // Wall Right
    s.lineTo(-w/2, 0);          // Close bottom

    // Interior (Hollow channel)
    const hole = new THREE.Path();
    const t = SPECS.WALL_THICKNESS;
    // El hueco interior deja espacio para el cañón
    hole.moveTo(-(w/2 - t), 0);
    hole.lineTo(-(w/2 - t), h - t - 0.04); // Techo interior
    hole.lineTo((w/2 - t), h - t - 0.04);
    hole.lineTo((w/2 - t), 0);
    s.holes.push(hole);

    return s;
  }, [SLIDE_WIDTH]);

  // ----------------------------------------------------------------
  // 2. SECCIÓN FRONTAL (NOSE PIECE)
  // ----------------------------------------------------------------
  const noseGeo = useMemo(() => {
      // Extrusión simple del perfil
      return new THREE.ExtrudeGeometry(commonShape, {
          depth: SPECS.NOSE_LENGTH,
          bevelEnabled: false
      });
  }, [commonShape]);

  // "Bull Nose" Bevel (Gen 5 Feature)
  // Un corte redondeado en el frente del slide.
  const bullNoseGeo = useMemo(() => {
      // Usamos un cilindro aplanado para "tapar" el frente visualmente
      // y suavizar los bordes duros.
      return new THREE.CylinderGeometry(SLIDE_WIDTH/2 - 0.01, SLIDE_WIDTH/2 - 0.03, 0.02, 4, 1, false, Math.PI/4);
  }, [SLIDE_WIDTH]);


  // ----------------------------------------------------------------
  // 3. SECCIÓN TRASERA (BREECH BLOCK)
  // ----------------------------------------------------------------
  const breechGeo = useMemo(() => {
      const rearLength = SLIDE_LENGTH - SPECS.NOSE_LENGTH - SPECS.PORT_LENGTH;
      return new THREE.ExtrudeGeometry(commonShape, {
          depth: rearLength,
          bevelEnabled: false
      });
  }, [commonShape, SLIDE_LENGTH]);

  // ----------------------------------------------------------------
  // 4. PARED DEL PUERTO (PORT WALL) - LADO IZQUIERDO
  // ----------------------------------------------------------------
  // Esta sección conecta el frente y atrás solo por el lado izquierdo.
  const portWallGeo = useMemo(() => {
      const shape = new THREE.Shape();
      const w = SLIDE_WIDTH;
      const h = SPECS.HEIGHT;
      const b = SPECS.BEVEL;
      const t = SPECS.WALL_THICKNESS;

      // Dibujar solo la pared izquierda y un poco del techo
      shape.moveTo(-w/2, 0);
      shape.lineTo(-w/2, h - b);
      shape.lineTo(-(w/2 - b), h);
      shape.lineTo(-(w/2 - b - 0.05), h); // Un poco de techo
      shape.lineTo(-(w/2 - b - 0.05), h - t); // Grosor hacia abajo
      shape.lineTo(-(w/2 - t), h - t - 0.02); // Conexión interna
      shape.lineTo(-(w/2 - t), 0);
      
      return new THREE.ExtrudeGeometry(shape, {
          depth: SPECS.PORT_LENGTH,
          bevelEnabled: false
      });
  }, [SLIDE_WIDTH]);

  // ----------------------------------------------------------------
  // 5. EXTRACTOR (LADO DERECHO)
  // ----------------------------------------------------------------
  const extractorGeo = useMemo(() => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0.04, 0);
      shape.lineTo(0.05, 0.25); // Largo
      shape.lineTo(0.01, 0.23); // Punta garra
      shape.lineTo(-0.01, 0.23);
      
      return new THREE.ExtrudeGeometry(shape, {
          depth: 0.08, // Grosor vertical (es una pieza lateral)
          bevelEnabled: true,
          bevelThickness: 0.005,
          bevelSize: 0.005,
          bevelSegments: 2
      });
  }, []);

  // ----------------------------------------------------------------
  // 6. MIRAS (SIGHTS)
  // ----------------------------------------------------------------
  const rearSightGeo = useMemo(() => {
      // Forma trapezoidal clásica de Glock ("U" notch)
      const shape = new THREE.Shape();
      const wTop = 0.16;
      const wBot = 0.20;
      const h = 0.07;
      
      shape.moveTo(-wBot/2, 0);
      shape.lineTo(wBot/2, 0);
      shape.lineTo(wTop/2, h);
      shape.lineTo(-wTop/2, h);
      shape.lineTo(-wBot/2, 0);

      // Notch (la "U" cortada)
      const notch = new THREE.Path();
      const nw = 0.05;
      const nh = 0.04;
      notch.moveTo(-nw/2, h);
      notch.lineTo(-nw/2, h - nh);
      notch.lineTo(nw/2, h - nh);
      notch.lineTo(nw/2, h);
      shape.holes.push(notch);

      return new THREE.ExtrudeGeometry(shape, {
          depth: 0.06, // Grosor Z
          bevelEnabled: false
      });
  }, []);

  const frontSightGeo = useMemo(() => {
      // Poste simple
      return new THREE.BoxGeometry(0.045, 0.055, 0.08);
  }, []);

  // ----------------------------------------------------------------
  // 7. PLACA TRASERA (BACK PLATE)
  // ----------------------------------------------------------------
  const backPlateGeo = useMemo(() => {
      const shape = new THREE.Shape();
      const w = SLIDE_WIDTH - 0.02;
      const h = 0.18; 
      
      // Rectángulo redondeado inferior
      shape.moveTo(-w/2, 0);
      shape.lineTo(w/2, 0);
      shape.lineTo(w/2, h - 0.02);
      shape.lineTo(w/2 - 0.02, h);
      shape.lineTo(-(w/2 - 0.02), h);
      shape.lineTo(-w/2, h - 0.02);
      
      return new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005 });
  }, [SLIDE_WIDTH]);


  return (
    <group>
      
      {/* ==========================================
          ENSAMBLAJE PRINCIPAL DEL SLIDE
          (Dividido en 3 partes para el hueco del puerto)
          El eje Z+ apunta hacia el frente (Muzzle)
         ========================================== */}

      {/* 1. SECCIÓN FRONTAL (NOSE) */}
      <group position={[0, 0, SLIDE_LENGTH - SPECS.NOSE_LENGTH]}>
          <mesh 
            material={materials.ndlcSteel} 
            geometry={noseGeo} 
            rotation={[0, 0, 0]} // Extrude va en +Z por defecto
            castShadow receiveShadow
          />
          {/* Tapa "Bull Nose" visual */}
          <mesh 
            material={materials.ndlcSteel} 
            geometry={bullNoseGeo} 
            position={[0, SPECS.HEIGHT/2, SPECS.NOSE_LENGTH]} 
            rotation={[Math.PI/2, Math.PI/4, 0]} // Rotar cilindro
          />
      </group>

      {/* 2. SECCIÓN MEDIA (PUERTO DE EXPULSIÓN) */}
      <group position={[0, 0, SLIDE_LENGTH - SPECS.NOSE_LENGTH - SPECS.PORT_LENGTH]}>
          {/* Pared Izquierda */}
          <mesh 
             material={materials.ndlcSteel} 
             geometry={portWallGeo} 
             castShadow receiveShadow
          />
      </group>

      {/* 3. SECCIÓN TRASERA (BREECH) */}
      <group position={[0, 0, 0]}>
          <mesh 
             material={materials.ndlcSteel} 
             geometry={breechGeo} 
             castShadow receiveShadow
          />
          
          {/* Breech Face (Cara del cierre donde apoya la vaina) */}
          <mesh 
             material={materials.ndlcSteel} 
             position={[0, SPECS.HEIGHT/2, SLIDE_LENGTH - SPECS.NOSE_LENGTH - SPECS.PORT_LENGTH]}
          >
             <boxGeometry args={[SLIDE_WIDTH - 0.06, SPECS.HEIGHT - 0.06, 0.01]} />
          </mesh>
      </group>


      {/* ==========================================
          COMPONENTES Y DETALLES
         ========================================== */}

      {/* EXTRACTOR (Lado Derecho) */}
      <group position={[SLIDE_WIDTH/2 - 0.01, SPECS.HEIGHT/2 + 0.02, SLIDE_LENGTH - SPECS.NOSE_LENGTH - 0.02]}>
          <mesh 
             material={materials.ndlcSteel} 
             geometry={extractorGeo} 
             rotation={[Math.PI/2, -0.1, 0]} // Inclinado ligeramente
          />
          {/* Émbolo del extractor (Plunger) */}
          <mesh material={materials.ndlcSteel} position={[-0.03, 0, -0.1]} rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />
          </mesh>
      </group>

      {/* BACK PLATE (TAPA TRASERA) */}
      <group position={[0, 0.02, -0.01]}> 
          <mesh material={materials.polymer} geometry={backPlateGeo} rotation={[0, Math.PI, 0]} /> {/* Mirando atrás */}
          {/* Estrías de agarre en el backplate */}
          {[0.04, 0.08, 0.12].map((y, i) => (
             <mesh key={i} position={[0, y, -0.021]} material={materials.polymer}>
                 <boxGeometry args={[SLIDE_WIDTH - 0.06, 0.01, 0.005]} />
             </mesh>
          ))}
      </group>

      {/* SERRACIONES TRASERAS (REAR SERRATIONS) */}
      {/* Usamos "Shadow Meshes": Cajas negras muy finas pegadas a la superficie */}
      {Array.from({ length: 7 }).map((_, i) => (
        <group key={`rear-${i}`} position={[0, SPECS.HEIGHT/2 - 0.02, 0.15 + i * 0.075]}>
            {/* Lado Izquierdo */}
            <mesh position={[-SLIDE_WIDTH/2 - 0.001, 0, 0]}>
               <boxGeometry args={[0.01, 0.16, 0.035]} />
               <meshStandardMaterial color="#050505" roughness={1} />
            </mesh>
            {/* Lado Derecho */}
            <mesh position={[SLIDE_WIDTH/2 + 0.001, 0, 0]}>
               <boxGeometry args={[0.01, 0.16, 0.035]} />
               <meshStandardMaterial color="#050505" roughness={1} />
            </mesh>
        </group>
      ))}

      {/* SERRACIONES DELANTERAS (FRONT SERRATIONS - GEN 5) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`front-${i}`} position={[0, SPECS.HEIGHT/2 - 0.02, SLIDE_LENGTH - 0.6 + i * 0.075]}>
            <mesh position={[-SLIDE_WIDTH/2 - 0.001, 0, 0]}>
               <boxGeometry args={[0.01, 0.16, 0.035]} />
               <meshStandardMaterial color="#050505" roughness={1} />
            </mesh>
            <mesh position={[SLIDE_WIDTH/2 + 0.001, 0, 0]}>
               <boxGeometry args={[0.01, 0.16, 0.035]} />
               <meshStandardMaterial color="#050505" roughness={1} />
            </mesh>
        </group>
      ))}

      {/* ==========================================
          SISTEMA DE MIRAS
         ========================================== */}
      
      {/* MIRA TRASERA (REAR SIGHT) */}
      <group position={[0, SPECS.HEIGHT, 0.15]}>
          <mesh material={materials.polymer} geometry={rearSightGeo} />
          {/* Inserto Blanco ("U" o caja) */}
          <mesh position={[0, 0.035, 0.061]}>
              <planeGeometry args={[0.14, 0.008]} /> {/* Base U */}
              <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.066, 0.05, 0.061]}>
              <planeGeometry args={[0.008, 0.04]} /> {/* Lado Izq U */}
              <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.066, 0.05, 0.061]}>
              <planeGeometry args={[0.008, 0.04]} /> {/* Lado Der U */}
              <meshBasicMaterial color="#ffffff" />
          </mesh>
      </group>

      {/* MIRA DELANTERA (FRONT SIGHT) */}
      <group position={[0, SPECS.HEIGHT + 0.025, SLIDE_LENGTH - 0.12]}>
          <mesh material={materials.polymer} geometry={frontSightGeo} />
          
          {/* Punto Blanco (White Dot) */}
          <mesh position={[0, 0.005, -0.041]} rotation={[0, 0, 0]}>
             <circleGeometry args={[0.014, 16]} />
             <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* Tornillo Hexagonal (Visible por debajo en vista explosiva) */}
          <mesh material={materials.ndlcSteel} position={[0, -0.045, 0]}>
             <cylinderGeometry args={[0.02, 0.02, 0.02, 6]} />
          </mesh>
      </group>

    </group>
  );
};