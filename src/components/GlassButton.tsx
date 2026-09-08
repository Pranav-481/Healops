import React from 'react';

export type GlassButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: GlassButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  pill?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  disabled,
  pill = true,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 px-3.5 text-xs gap-1.5',
    md: 'h-9 px-4 text-xs sm:text-sm gap-2',
    lg: 'h-11 px-5 text-sm sm:text-base gap-2.5',
  }[size];

  const roundedClasses = pill ? 'rounded-full' : 'rounded-2xl';

  // iOS 18 Control Center Glass Bubble Styling
  const variantClasses = {
    primary:
      'bg-gradient-to-b from-[#1b84ff] via-[#0066f5] to-[#0052d4] hover:from-[#3894ff] hover:via-[#1a75ff] hover:to-[#005ae6] active:from-[#004dc0] active:to-[#003da0] text-white font-bold border border-white/35 border-t-white/95 border-b-blue-900/50 shadow-[0_8px_24px_-4px_rgba(0,102,245,0.45),0_2px_6px_rgba(0,102,245,0.20),inset_0_2px_2px_rgba(255,255,255,0.85),inset_0_-1.5px_2px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.20)] backdrop-blur-[36px] backdrop-saturate-[200%]',
    secondary:
      'bg-gradient-to-b from-white/95 via-white/75 to-white/85 hover:from-white hover:via-white/85 hover:to-white/95 active:from-white/70 active:to-white/80 text-slate-800 font-bold border border-white/80 border-t-white border-b-white/40 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.02),inset_0_2px_2px_rgba(255,255,255,1),inset_0_-1.5px_2px_rgba(15,23,42,0.06),inset_0_0_0_1px_rgba(255,255,255,0.70)] backdrop-blur-[36px] backdrop-saturate-[200%] hover:text-blue-600',
    danger:
      'bg-gradient-to-b from-[#ff3b30] via-[#e02620] to-[#c71818] hover:from-[#ff554c] hover:via-[#f0302a] hover:to-[#d61e1e] active:from-[#b51414] active:to-[#990f0f] text-white font-bold border border-white/35 border-t-white/95 border-b-rose-950/50 shadow-[0_8px_24px_-4px_rgba(235,35,35,0.45),0_2px_6px_rgba(235,35,35,0.20),inset_0_2px_2px_rgba(255,255,255,0.85),inset_0_-1.5px_2px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.20)] backdrop-blur-[36px] backdrop-saturate-[200%]',
    outline:
      'bg-gradient-to-b from-white/65 via-white/40 to-white/55 hover:from-white/90 hover:via-white/70 hover:to-white/80 active:from-white/50 text-slate-700 hover:text-blue-600 font-bold border border-white/75 border-t-white border-b-white/40 shadow-[0_4px_16px_rgba(15,23,42,0.04),inset_0_1.5px_1.5px_rgba(255,255,255,1),inset_0_-1px_1px_rgba(15,23,42,0.04),inset_0_0_0_1px_rgba(255,255,255,0.45)] backdrop-blur-[36px] backdrop-saturate-[190%]',
    ghost:
      'bg-transparent hover:bg-gradient-to-b hover:from-white/80 hover:via-white/55 hover:to-white/70 active:bg-white/85 text-slate-600 hover:text-blue-600 font-semibold border border-transparent hover:border-white/75 hover:border-t-white hover:border-b-white/40 hover:shadow-[0_4px_16px_rgba(15,23,42,0.04),inset_0_1.5px_1px_rgba(255,255,255,0.95),inset_0_0_0_1px_rgba(255,255,255,0.45)] backdrop-blur-[28px]',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        btn-apple-glass
        inline-flex items-center justify-center font-broad tracking-wide font-bold
        cursor-pointer
        select-none relative overflow-hidden group
        disabled:opacity-50 disabled:pointer-events-none disabled:transform-none disabled:shadow-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-1
        ${roundedClasses}
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {/* iOS 18 3D Glass Dome Convex Curved Specular Lens Highlight */}
      <span className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/45 via-white/12 to-transparent rounded-t-[inherit] pointer-events-none" />

      {/* iOS 18 Edge Light Chamfer Rim */}
      <span className="absolute inset-x-1 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none opacity-95" />

      {/* iOS 18 Ambient Circular Glare Sweep on Hover */}
      <span className="absolute inset-0 bg-radial-[at_50%_0%] from-white/30 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {isLoading ? (
        <svg
          className="animate-spin h-3.5 w-3.5 text-current relative z-10"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        icon && <span className="shrink-0 relative z-10">{icon}</span>
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};



