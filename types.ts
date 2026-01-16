import * as THREE from 'three';

export interface GlockState {
  isExploded: boolean;
  isRacked: boolean; // Slide is back
  isMagazineInserted: boolean;
  triggerPulled: boolean;
  setExploded: (v: boolean) => void;
  setRacked: (v: boolean) => void;
  toggleMagazine: () => void;
  fire: () => void;
}

export interface PartProps {
  materials: {
    polymer: THREE.Material;
    ndlcSteel: THREE.Material;
    barrelSteel: THREE.Material;
    springSteel: THREE.Material;
    brass: THREE.Material;
    copper: THREE.Material;
  };
  nodes?: Record<string, THREE.Mesh>; // For GLTF if we were using it, unused here
}

export interface MechanicalProps extends PartProps {
  explosionFactor: number; // 0 to 1
  slidePosition: number; // 0 (closed) to 1 (open)
  triggerPosition: number; // 0 to 1
}
