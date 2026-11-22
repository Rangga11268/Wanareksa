import React from 'react';
import { LucideIcon } from 'lucide-react';

export type IconBadgeVariant = 'rose' | 'emerald' | 'sky' | 'amber' | 'purple' | 'slate';
export type IconBadgeSize = 'sm' | 'md' | 'lg' | 'xl';

export interface IconBadgeProps {
  icon: LucideIcon;
  variant?: IconBadgeVariant;
  size?: IconBadgeSize;
  ping?: boolean;
  className?: string;
  ariaHidden?: boolean;
}

/**
 * Architectural Telemetry Glyph Frame
 * Replaces loud AI-slop candy wrappers with crisp, restrained aerospace instrument frames.
 * The frame is dark/graphite neutral while semantic colors are applied strictly to the vector stroke.
 */
const VARIANT_STYLES: Record<IconBadgeVariant, { iconColor: string; dot: string; glow: string }> = {
  rose: {
    iconColor: 'text-rose-500 dark:text-rose-400',
    dot: 'bg-rose-500',
    glow: 'group-hover:border-rose-500/30',
  },
  emerald: {
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    glow: 'group-hover:border-emerald-500/30',
  },
  sky: {
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    dot: 'bg-cyan-500',
    glow: 'group-hover:border-cyan-500/30',
  },
  amber: {
    iconColor: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    glow: 'group-hover:border-amber-500/30',
  },
  purple: {
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    dot: 'bg-indigo-500',
    glow: 'group-hover:border-indigo-500/30',
  },
  slate: {
    iconColor: 'text-slate-600 dark:text-zinc-400',
    dot: 'bg-slate-400',
    glow: 'group-hover:border-zinc-500/30',
  },
};

const SIZE_STYLES: Record<IconBadgeSize, { container: string; icon: string }> = {
  sm: {
    container: 'w-7 h-7 rounded-md',
    icon: 'w-3.5 h-3.5',
  },
  md: {
    container: 'w-8.5 h-8.5 rounded-lg',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'w-10 h-10 rounded-lg',
    icon: 'w-5 h-5',
  },
  xl: {
    container: 'w-12 h-12 rounded-xl',
    icon: 'w-6 h-6',
  },
};

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon: Icon,
  variant = 'slate',
  size = 'md',
  ping = false,
  className = '',
  ariaHidden = true,
}) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.slate;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 bg-slate-100/90 dark:bg-zinc-900/80 border border-slate-300/80 dark:border-white/10 shadow-2xs transition-all duration-150 ease-out active:scale-95 group ${sizeStyle.container} ${variantStyle.glow} ${className}`}
      aria-hidden={ariaHidden}
    >
      <Icon className={`${sizeStyle.icon} ${variantStyle.iconColor} stroke-[1.85] transition-colors`} />

      {ping && (
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${variantStyle.dot}`}
          />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${variantStyle.dot}`} />
        </span>
      )}
    </div>
  );
};

export default IconBadge;
