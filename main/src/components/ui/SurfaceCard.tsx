import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

type SurfaceTone = 'light' | 'dark' | 'accentSoft';

interface SurfaceCardProps extends ComponentPropsWithoutRef<'div'> {
  tone?: SurfaceTone;
  interactive?: boolean;
}

const toneClasses: Record<SurfaceTone, string> = {
  light:
    'border-[var(--border-neutral)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_18px_50px_rgba(31,29,25,0.08)]',
  dark:
    'border-white/10 bg-[var(--sidebar-bg)] text-[var(--text-inverse)] shadow-[0_18px_50px_rgba(31,29,25,0.18)]',
  accentSoft:
    'border-[rgba(168,101,53,0.22)] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[0_14px_34px_rgba(31,29,25,0.06)]',
};

export function SurfaceCard({
  tone = 'light',
  interactive = false,
  className,
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        'rounded-[20px] border',
        toneClasses[tone],
        interactive && 'transition duration-200 hover:-translate-y-px hover:border-[var(--border-strong)]',
        className,
      )}
      {...props}
    />
  );
}
