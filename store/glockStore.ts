import { create } from 'zustand';
import { GlockState } from '../types';

export const useGlockStore = create<GlockState>((set, get) => ({
  isExploded: false,
  isRacked: false,
  isMagazineInserted: true,
  triggerPulled: false,

  setExploded: (v) => set({ isExploded: v }),
  
  setRacked: (v) => set({ isRacked: v }),
  
  toggleRack: () => set((state) => ({ isRacked: !state.isRacked })),
  
  toggleMagazine: () => set((state) => ({ isMagazineInserted: !state.isMagazineInserted })),
  
  fire: () => {
    const { isRacked, isExploded } = get();
    if (isExploded || isRacked) return;

    // Simulate firing cycle: Trigger pull -> Bang -> Slide cycle
    set({ triggerPulled: true });
    
    // Reset trigger
    setTimeout(() => {
      set({ triggerPulled: false });
    }, 200);

    // Auto-rack slide (recoil)
    setTimeout(() => {
      set({ isRacked: true });
    }, 100);

    // Return slide
    setTimeout(() => {
      set({ isRacked: false });
    }, 250);
  }
}));
