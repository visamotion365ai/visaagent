import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'bordered' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  searchable?: boolean;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      className,
      options,
      value,
      onChange,
      label,
      error,
      hint,
      placeholder = 'Select an option',
      disabled = false,
      fullWidth = true,
      variant = 'default',
      size = 'md',
      leftIcon,
      searchable = false,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);

    const baseStyles = `
      w-full
      rounded-lg
      transition-all duration-200
      cursor-pointer
    `;

    const variants = {
      default: `
        bg-white border border-secondary-200
        hover:border-secondary-300
        focus:border-primary-500 focus:ring-2 focus:ring-primary-200
      `,
      bordered: `
        bg-transparent border-2 border-secondary-200
        hover:border-secondary-300
        focus:border-primary-500 focus:ring-2 focus:ring-primary-200
      `,
      ghost: `
        bg-transparent border-none
        hover:bg-secondary-100
        focus:ring-2 focus:ring-primary-200
      `,
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    // Find selected option
    useEffect(() => {
      const found = options.find(opt => opt.value === value);
      setSelectedOption(found || null);
    }, [value, options]);

    const toggleDropdown = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      if (!isOpen) setSearchQuery('');
    };

    const handleSelect = (option: SelectOption) => {
      if (option.disabled) return;
      setSelectedOption(option);
      onChange?.(option.value);
      setIsOpen(false);
      setSearchQuery('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const filteredOptions = searchable
      ? options.filter(opt => 
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    return (
      <div className="w-full" ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <div
            className={cn(
              baseStyles,
              variants[variant],
              sizes[size],
              error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            onClick={toggleDropdown}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            {...props}
          >
            <div className="flex items-center gap-2">
              {leftIcon && (
                <span className="text-secondary-400">{leftIcon}</span>
              )}
              <span className={cn(selectedOption ? 'text-secondary-900' : 'text-secondary-400')}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <span className="ml-auto text-secondary-400">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </div>
          </div>

          {/* Dropdown menu */}
          {isOpen && (
            <div
              className="absolute z-50 mt-1 w-full rounded-lg shadow-lg bg-white border border-secondary-200 py-1 animate-slide-down"
              role="listbox"
            >
              {searchable && filteredOptions.length > 10 && (
                <div className="px-3 py-2 border-b border-secondary-200">
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-secondary-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-200"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-secondary-500">
                  No options found
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        'px-3 py-2 text-sm cursor-pointer hover:bg-secondary-100',
                        option.disabled && 'opacity-50 cursor-not-allowed',
                        selectedOption?.value === option.value && 'bg-primary-50 text-primary-700'
                      )}
                      onClick={() => handleSelect(option)}
                      role="option"
                      aria-selected={selectedOption?.value === option.value}
                    >
                      <div className="flex items-center gap-2">
                        {selectedOption?.value === option.value && (
                          <Check className="h-4 w-4 text-primary-600" />
                        )}
                        <span>{option.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

Select.displayName = 'Select';

export { Select };
