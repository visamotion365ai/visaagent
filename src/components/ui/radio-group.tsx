import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      options,
      value,
      onChange,
      label,
      error,
      hint,
      orientation = 'vertical',
      size = 'md',
      ...props
    },
    ref
  ) => {
    const handleChange = (optionValue: string) => {
      onChange?.(optionValue);
    };

    const sizes = {
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-3',
    };

    return (
      <div className="w-full" ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex',
            orientation === 'horizontal' ? 'flex-row' : 'flex-col',
            sizes[size],
            className
          )}
          role="radiogroup"
          {...props}
        >
          {options.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={() => !option.disabled && handleChange(option.value)}
                disabled={option.disabled}
                className="h-4 w-4 rounded-full border-2 border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-200 appearance-none"
                role="radio"
                aria-checked={value === option.value}
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
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

RadioGroup.displayName = 'RadioGroup';

export { RadioGroup };
