// src/components/ui/Badge.tsx
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'ghost' | 'dark';
  className?: string;
}

export default function Badge({ children, variant = 'ghost', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-light tracking-widest uppercase rounded-sm',
        variant === 'gold' &&
          'bg-gold-luxury/10 text-gold-luxury border border-gold-luxury/30',
        variant === 'ghost' &&
          'bg-white/5 text-white/40 border border-white/10',
        variant === 'dark' &&
          'bg-black/40 text-white/30 border border-white/5',
        className
      )}
    >
      {children}
    </span>
  );
}
