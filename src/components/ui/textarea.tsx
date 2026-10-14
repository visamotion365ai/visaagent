import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'bordered' | 'ghost';
  rows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      fullWidth = true,
      variant = 'default',
      rows = 4,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea_${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = `
      w-full
      rounded-lg
      transition-all duration-200
      placeholder:text-secondary-400
      focus:outline-none focus:ring-2
      disabled:cursor-not-allowed disabled:opacity-50
      resize-none
    `;

    const variants = {
      default: `
        bg-white border border-secondary-200
        focus:border-primary-500 focus:ring-primary-200
        hover:border-secondary-300
      `,
      bordered: `
        bg-transparent border-2 border-secondary-200
        focus:border-primary-500 focus:ring-primary-200
        hover:border-secondary-300
      `,
      ghost: `
        bg-transparent border-none
        focus:ring-primary-200
        hover:bg-secondary-100
      `,
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-secondary-700 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            baseStyles,
            variants[variant],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-secondary-500">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
