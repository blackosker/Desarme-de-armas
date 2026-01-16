import * as THREE from 'three';
import { useMemo } from 'react';

export const useGlockMaterials = () => {
  return useMemo(() => {
    // 1. Polymer (Frame) - Rough, Subsurface feel, very dark grey
    const polymer = new THREE.MeshPhysicalMaterial({
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.1,
      clearcoat: 0.1,
      clearcoatRoughness: 0.8,
      flatShading: false,
    });

    // 2. nDLC Steel (Slide) - Anisotropic-ish, darker, smoother than polymer
    const ndlcSteel = new THREE.MeshStandardMaterial({
      color: 0x1c1c1c,
      roughness: 0.4,
      metalness: 0.9,
    });

    // 3. Barrel Steel - Slightly more metallic/raw than the slide
    const barrelSteel = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.3,
      metalness: 1.0,
    });

    // 4. Spring Steel
    const springSteel = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.4,
      metalness: 1.0,
    });

    // 5. Brass (Ammo casing)
    const brass = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 1.0,
    });

    // 6. Copper (Bullet tip)
    const copper = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      roughness: 0.4,
      metalness: 0.8,
    });

    return { polymer, ndlcSteel, barrelSteel, springSteel, brass, copper };
  }, []);
};
