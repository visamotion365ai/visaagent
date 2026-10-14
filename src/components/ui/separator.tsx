import React from 'react';
import { cn } from '@/lib/utils';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'dashed' | 'dotted' | 'solid';
  size?: 'sm' | 'md' | 'lg';
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      className,
      orientation = 'horizontal',
      variant = 'default',
      size = 'md',
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-secondary-200',
      dashed: 'border-t-2 border-secondary-200 border-dashed',
      dotted: 'border-t-2 border-secondary-200 border-dotted',
      solid: 'bg-secondary-200',
    };

    const sizes = {
      sm: orientation === 'horizontal' ? 'h-px' : 'w-px',
      md: orientation === 'horizontal' ? 'h-0.5' : 'w-0.5',
      lg: orientation === 'horizontal' ? 'h-1' : 'w-1',
    };

    return (
      <div
        ref={ref}
        className={cn(
          orientation === 'horizontal' ? 'w-full' : 'h-full',
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

export { Separator };
