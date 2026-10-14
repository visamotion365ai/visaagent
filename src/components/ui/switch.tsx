import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  thumbClassName?: string;
  trackClassName?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      label,
      error,
      hint,
      thumbClassName,
      trackClassName,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch_${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        <div className="flex items-center gap-3">
          <label
            htmlFor={switchId}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              id={switchId}
              ref={ref}
              type="checkbox"
              role="switch"
              disabled={disabled}
              className="sr-only"
              {...props}
            />
            <div
              className={cn(
                'relative inline-flex items-center',
                disabled && 'opacity-50 cursor-not-allowed',
                className
              )}
            >
              <div
                className={cn(
                  'h-6 w-11 rounded-full bg-secondary-200 transition-colors duration-200',
                  props.checked && 'bg-primary-600',
                  trackClassName
                )}
              />
              <div
                className={cn(
                  'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                  props.checked && 'translate-x-5',
                  thumbClassName
                )}
              />
            </div>
            {label && (
              <span
                className={cn(
                  'text-sm cursor-pointer',
                  disabled && 'cursor-not-allowed',
                  error && 'text-red-600'
                )}
              >
                {label}
              </span>
            )}
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

Switch.displayName = 'Switch';

export { Switch };
