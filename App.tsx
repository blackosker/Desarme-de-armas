import React from 'react';
import { Scene } from './components/Scene';
import { Interface } from './components/UI/Interface';

function App() {
  return (
    <div className="w-full h-screen relative">
      <Scene />
      <Interface />
      
      {/* Title Overlay */}
      <div className="absolute top-8 left-8 pointer-events-none">
        <h1 className="text-4xl font-bold text-white tracking-tighter mb-1">GLOCK 17 <span className="text-amber-500">GEN 5</span></h1>
        <p className="text-gray-400 font-mono text-sm max-w-xs">
          Interactive Procedural Digital Twin
          <br/>
          <span className="text-xs opacity-50">Dimensions: Metric (1u = 1dm)</span>
        </p>
      </div>

      {/* Tech Specs Overlay */}
      <div className="absolute top-8 right-8 text-right pointer-events-none hidden md:block">
        <div className="space-y-1 font-mono text-xs text-gray-500">
           <p>SYSTEM: SAFE ACTION®</p>
           <p>CALIBER: 9x19mm</p>
           <p>LENGTH: 202mm</p>
           <p>BARREL: Marksman</p>
           <p>FINISH: nDLC / Polymer</p>
        </div>
      </div>
    </div>
  );
}

export default App;
