import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../utils/classNames';

interface GlassCardProps extends ComponentPropsWithoutRef<'div'> {
  hover?: boolean;
  accent?: boolean;
}

export function GlassCard({
  hover = false,
  accent = false,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-[1.25rem] border bg-[rgba(13,27,47,0.72)] shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-[18px]',
        accent ? 'border-[rgba(0,212,170,0.28)]' : 'border-[rgba(0,212,170,0.12)]',
        hover &&
          'transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(0,212,170,0.34)] hover:shadow-[0_24px_80px_rgba(0,212,170,0.1)]',
        className,
      )}
      {...props}
    />
  );
}
