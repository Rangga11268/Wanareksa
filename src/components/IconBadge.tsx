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

const VARIANT_STYLES: Record<IconBadgeVariant, { container: string; dot: string }> = {
  rose: {
    container: 'bg-rose-500/12 dark:bg-rose-950/40 border border-rose-500/25 dark:border-rose-500/35 text-rose-600 dark:text-rose-400 shadow-2xs',
    dot: 'bg-rose-500',
  },
  emerald: {
    container: 'bg-emerald-500/12 dark:bg-emerald-950/40 border border-emerald-500/25 dark:border-emerald-500/35 text-emerald-600 dark:text-emerald-400 shadow-2xs',
    dot: 'bg-emerald-500',
  },
  sky: {
    container: 'bg-sky-500/12 dark:bg-sky-950/40 border border-sky-500/25 dark:border-sky-500/35 text-sky-600 dark:text-sky-400 shadow-2xs',
    dot: 'bg-sky-500',
  },
  amber: {
    container: 'bg-amber-500/12 dark:bg-amber-950/40 border border-amber-500/25 dark:border-amber-500/35 text-amber-600 dark:text-amber-400 shadow-2xs',
    dot: 'bg-amber-500',
  },
  purple: {
    container: 'bg-purple-500/12 dark:bg-purple-950/40 border border-purple-500/25 dark:border-purple-500/35 text-purple-600 dark:text-purple-400 shadow-2xs',
    dot: 'bg-purple-500',
  },
  slate: {
    container: 'bg-slate-500/10 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 shadow-2xs',
    dot: 'bg-slate-400',
  },
};

const SIZE_STYLES: Record<IconBadgeSize, { container: string; icon: string }> = {
  sm: {
    container: 'w-7 h-7 rounded-lg',
    icon: 'w-3.5 h-3.5',
  },
  md: {
    container: 'w-9 h-9 rounded-xl',
    icon: 'w-4.5 h-4.5',
  },
  lg: {
    container: 'w-11 h-11 rounded-2xl',
    icon: 'w-5.5 h-5.5',
  },
  xl: {
    container: 'w-14 h-14 rounded-2xl',
    icon: 'w-7 h-7',
  },
};

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon: Icon,
  variant = 'emerald',
  size = 'md',
  ping = false,
  className = '',
  ariaHidden = true,
}) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.emerald;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 ${sizeStyle.container} ${variantStyle.container} ${className}`}
      aria-hidden={ariaHidden}
    >
      <Icon className={`${sizeStyle.icon} stroke-[1.8]`} />
      {ping && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${variantStyle.dot}`} />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${variantStyle.dot} ring-2 ring-white dark:ring-slate-900`} />
        </span>
      )}
    </div>
  );
};
