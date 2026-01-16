// All units in Decimeters (1 unit = 100mm)
export const DIMENSIONS = {
  // Glock 17 Gen 5 Specs
  OVERALL_LENGTH: 2.02,
  SLIDE_LENGTH: 1.86,
  FRAME_WIDTH: 0.34,
  SLIDE_WIDTH: 0.255,
  TOTAL_HEIGHT: 1.39,
  BARREL_LENGTH: 1.14,
  SIGHT_RADIUS: 1.65,
  TRIGGER_REACH: 0.70,
  
  // Ángulos
  GRIP_ANGLE: 22 * (Math.PI / 180),
};

// VECTORES DE ENSAMBLAJE (La clave para que todo encaje)
export const ASSEMBLY_OFFSETS = {
  // Alturas relativas al centro (Y=0)
  SLIDE_HEIGHT_OFFSET: 0.155,   // Bajado significativamente para tocar el frame
  BARREL_HEIGHT_OFFSET: 0.155,  // Alineado con el slide
  SPRING_HEIGHT_OFFSET: 0.09,   // Justo debajo del cañón
  FRAME_RAIL_HEIGHT: 0.13,      // Altura de los rieles del frame
};

export const ANIMATION_VECTORS = {
  MAGAZINE: [0, -1.8, 0] as [number, number, number], // Sale más abajo
  SLIDE: [0, 0.4, 2.5] as [number, number, number],   // Sube y avanza al explotar
  BARREL: [0, 0.5, 2.8] as [number, number, number],
  RECOIL_SPRING: [0, 0.3, 2.6] as [number, number, number],
  PINS: [0.6, 0, 0] as [number, number, number],
};