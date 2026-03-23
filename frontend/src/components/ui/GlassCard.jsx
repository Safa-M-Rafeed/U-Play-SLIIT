import React from 'react';
export function GlassCard({
  children,
  className = '',
  hover = false
}) {
  return (
    <div
      className={`
        backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6
        shadow-xl shadow-black/10
        ${hover ? 'transition-all duration-300 hover:bg-white/[0.08] hover:border-white/15 hover:shadow-blue-500/10 hover:shadow-2xl cursor-pointer' : ''}
        ${className}
      `}>
      
      {children}
    </div>
  );
}
