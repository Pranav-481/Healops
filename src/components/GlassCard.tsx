import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'none';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  interactive = false,
  ...props
}) => {
  // Ultra-glassmorphic pristine white frosted crystal glass with specular sheen and soft neutral depth
  const glowStyles = {
    none: 'border-white/90 border-t-white border-b-white/50 bg-gradient-to-br from-white/90 via-white/70 to-white/80 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.04)] hover:border-white hover:from-white hover:to-white/90',
    blue: 'border-white/90 border-t-white border-b-white/50 bg-gradient-to-br from-white/90 via-white/70 to-white/80 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.04)] hover:border-white hover:from-white hover:to-white/90',
    purple: 'border-white/90 border-t-white border-b-white/50 bg-gradient-to-br from-white/90 via-white/70 to-white/80 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.04)] hover:border-white hover:from-white hover:to-white/90',
    emerald: 'border-white/90 border-t-white border-b-white/50 bg-gradient-to-br from-white/90 via-white/70 to-white/80 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.04)] hover:border-white hover:from-white hover:to-white/90',
    amber: 'border-white/90 border-t-white border-b-white/50 bg-gradient-to-br from-white/90 via-white/70 to-white/80 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.04)] hover:border-white hover:from-white hover:to-white/90',
    rose: 'border-white/90 border-t-white border-b-white/50 bg-gradient-to-br from-white/90 via-white/70 to-white/80 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.04)] hover:border-white hover:from-white hover:to-white/90',
  }[glow];

  return (
    <div
      className={`
        relative rounded-2xl
        border
        backdrop-blur-3xl backdrop-saturate-[180%]
        text-slate-800
        overflow-hidden
        transition-all duration-200
        shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,1),inset_0_-1px_1px_0_rgba(255,255,255,0.45)]
        before:absolute before:inset-x-0 before:top-0 before:h-[1.5px] before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent before:pointer-events-none before:z-10
        after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/50 after:via-transparent after:to-transparent after:pointer-events-none after:z-0
        ${glowStyles}
        ${interactive ? 'hover:shadow-[0_16px_40px_-6px_rgba(15,23,42,0.08)] hover:-translate-y-1 cursor-pointer select-none' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};






