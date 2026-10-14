import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      error,
      hint,
      indeterminate = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox_${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        <div className="flex items-center gap-3">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={cn(
              'h-4 w-4 rounded border-2 border-secondary-300 appearance-none cursor-pointer transition-all duration-200',
              'checked:bg-primary-600 checked:border-primary-600',
              'focus:outline-none focus:ring-2 focus:ring-primary-200',
              disabled && 'cursor-not-allowed opacity-50',
              indeterminate && 'bg-primary-200 border-primary-200',
              className
            )}
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              'cursor-pointer text-sm',
              disabled && 'cursor-not-allowed opacity-50',
              error && 'text-red-600'
            )}
          >
            {label}
          </label>
        </div>
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

Checkbox.displayName = 'Checkbox';

export { Checkbox };
