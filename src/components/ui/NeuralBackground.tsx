'use client';

import React from 'react';

export const NeuralBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dark Base Grid */}
      <div className="absolute inset-0 neural-grid opacity-30" />
      
      {/* Cyan Glowing Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-synapse-cyan/10 rounded-full blur-3xl animate-pulse-glow" />
      
      {/* Purple Glowing Orbs */}
      <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-synapse-purple/15 rounded-full blur-3xl animate-float" />
      
      {/* Pink Accent Glow */}
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-synapse-pink/10 rounded-full blur-3xl animate-pulse-glow" />
    </div>
  );
};
