// All units in Decimeters (1 unit = 100mm) to avoid float precision issues at small scales in ThreeJS
// Source: Technical Report

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
  
  // Angles
  GRIP_ANGLE: 22 * (Math.PI / 180), // 22 degrees in radians
};

export const ANIMATION_VECTORS = {
  // Exploded View Offsets (Relative)
  MAGAZINE: [0, -1.5, 0] as [number, number, number],
  SLIDE: [0, 0, 2.0] as [number, number, number],
  BARREL: [0, 0.2, 2.2] as [number, number, number],
  RECOIL_SPRING: [0, -0.1, 2.1] as [number, number, number],
  PINS: [0.5, 0, 0] as [number, number, number],
};
