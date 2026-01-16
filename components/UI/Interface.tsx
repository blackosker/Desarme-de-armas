import React from 'react';
import { useGlockStore } from '../../store/glockStore';

export const Interface: React.FC = () => {
  const { isExploded, setExploded, fire, toggleMagazine, isMagazineInserted, toggleRack, isRacked } = useGlockStore();

  return (
    <div className="absolute bottom-0 left-0 w-full p-8 pointer-events-none flex flex-col items-center">
      <div className="bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-2xl pointer-events-auto flex gap-4">
        
        <button 
          onClick={() => setExploded(!isExploded)}
          className={`px-6 py-3 rounded-xl font-mono text-sm uppercase tracking-widest transition-all ${
            isExploded 
            ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
            : 'bg-white/10 text-gray-300 border border-white/10 hover:bg-white/20'
          }`}
        >
          {isExploded ? 'Reassemble' : 'Explode View'}
        </button>

        <div className="w-px bg-gray-700 mx-2" />

        <button 
          onClick={fire}
          disabled={isExploded || !isMagazineInserted || isRacked}
          className="px-6 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-xl font-mono text-sm uppercase tracking-widest hover:bg-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          Fire Cycle
        </button>

        <button 
          onClick={toggleRack}
          disabled={isExploded}
          className={`px-6 py-3 rounded-xl font-mono text-sm uppercase tracking-widest transition-all ${
            isRacked
            ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
            : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600'
          }`}
        >
          {isRacked ? 'Release Slide' : 'Lock Slide'}
        </button>

        <button 
          onClick={toggleMagazine}
          disabled={isExploded}
          className="px-6 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-xl font-mono text-sm uppercase tracking-widest hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {isMagazineInserted ? 'Eject Mag' : 'Insert Mag'}
        </button>

      </div>
      
      <div className="mt-4 text-xs text-gray-500 font-mono">
        Glock 17 Gen 5 Procedural Sim • React Three Fiber
      </div>
    </div>
  );
};
