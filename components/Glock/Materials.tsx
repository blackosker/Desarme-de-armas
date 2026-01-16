import * as THREE from 'three';
import { useMemo } from 'react';

export const useGlockMaterials = () => {
  return useMemo(() => {
    // 1. Polymer (Frame) - Gen 5 Texture
    // El polímero de Glock es complejo: es rugoso pero tiene un brillo especular muy difuso.
    // Usamos clearcoatRoughness alto para ese efecto "plástico satinado".
    const polymer = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,      // Negro grafito, no negro puro (0x000000 es irreal)
      roughness: 0.85,      // Muy rugoso (textura de agarre)
      metalness: 0.1,       // No es metal, pero tiene cierta reflectividad dieléctrica
      clearcoat: 0.1,       // Un toque muy sutil de brillo
      clearcoatRoughness: 0.9, // Brillo muy disperso
      flatShading: false,
    });

    // 2. nDLC Steel (Slide & Barrel finish)
    // El acabado nDLC (Diamond-Like Carbon) es muy oscuro y duro.
    // A menudo tiene una fina capa de aceite de armas (CLP), que simulamos con clearcoat.
    const ndlcSteel = new THREE.MeshPhysicalMaterial({
      color: 0x222222,      // Gris oscuro / Negro cálido
      roughness: 0.5,       // El acabado base es mate
      metalness: 1.0,       // Es metal puro
      clearcoat: 0.4,       // Capa de aceite visible
      clearcoatRoughness: 0.25, // El aceite es más liso que el metal
      ior: 2.5,             // Índice de refracción metálico típico
    });

    // 3. Barrel Steel (Chamber area)
    // El cañón suele tener más fricción (desgaste) y ser un poco más brillante/gris.
    const barrelSteel = new THREE.MeshPhysicalMaterial({
      color: 0x303030,      // Un poco más claro que el slide
      roughness: 0.35,      // Más liso por el roce mecánico
      metalness: 1.0,
      clearcoat: 0.3,       // Menos aceite, se quema/seca más rápido
      clearcoatRoughness: 0.2,
    });

    // 4. Spring Steel (Internal parts)
    // Acero industrial sin acabado cosmético nDLC.
    const springSteel = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,      // Gris acero natural
      roughness: 0.3,
      metalness: 0.9,
    });

    // 5. Brass (Ammo casing - 9mm)
    // Latón pulido.
    const brass = new THREE.MeshPhysicalMaterial({
      color: 0xeebb55,      // Tono latón/oro
      roughness: 0.25,      // Bastante pulido pero no espejo
      metalness: 1.0,
      clearcoat: 0.5,       // Brillo adicional
      reflectivity: 1.0,
    });

    // 6. Copper (Bullet Jacket - FMJ)
    // La camisa de cobre de la bala.
    const copper = new THREE.MeshPhysicalMaterial({
      color: 0xb87333,      // Cobre rojizo
      roughness: 0.4,       // El cobre oxidado pierde brillo espejo
      metalness: 0.8,
      clearcoat: 0.1,
    });

    return { polymer, ndlcSteel, barrelSteel, springSteel, brass, copper };
  }, []);
};