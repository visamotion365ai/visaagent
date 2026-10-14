import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'card';
  size?: 'sm' | 'md' | 'lg';
  alignment?: 'start' | 'center' | 'end';
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode | ((tabId: string) => React.ReactNode);
}

const Tabs: React.FC<TabsProps> = ({
  items,
  defaultValue = items[0]?.id,
  value: controlledValue,
  onChange,
  variant = 'default',
  size = 'md',
  alignment = 'start',
  className,
  tabClassName,
  contentClassName,
  children,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : internalValue;

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (!isControlled) {
        setInternalValue(tabId);
      }
      onChange?.(tabId);
    },
    [isControlled, onChange]
  );

  const variants = {
    default: {
      tab: (isActive: boolean) =>
        cn(
          'px-4 py-2 rounded-lg font-medium transition-all duration-200',
          isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700'
        ),
      indicator: 'bg-primary-600 h-0.5 rounded-full absolute bottom-0',
    },
    pills: {
      tab: (isActive: boolean) =>
        cn(
          'px-4 py-2 rounded-full font-medium transition-all duration-200',
          isActive
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-white text-secondary-600 border border-secondary-200 hover:border-secondary-300'
        ),
      indicator: 'hidden',
    },
    underline: {
      tab: (isActive: boolean) =>
        cn(
          'px-4 py-3 font-medium transition-all duration-200',
          isActive
            ? 'text-primary-600 border-b-2 border-primary-600'
            : 'text-secondary-500 hover:text-secondary-700'
        ),
      indicator: 'hidden',
    },
    card: {
      tab: (isActive: boolean) =>
        cn(
          'px-4 py-2 font-medium transition-all duration-200 border border-secondary-200',
          isActive
            ? 'bg-white text-primary-600 border-b-2 border-primary-600 -mb-px'
            : 'text-secondary-500 hover:bg-secondary-50'
        ),
      indicator: 'hidden',
    },
  };

  const sizes = {
    sm: 'text-sm gap-1',
    md: 'text-sm gap-2',
    lg: 'text-base gap-3',
  };

  const alignments = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  const config = variants[variant];

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex overflow-x-auto pb-2',
          alignments[alignment],
          sizes[size],
          variant === 'underline' && 'border-b border-secondary-200'
        )}
      >
        {items.map((item) => {
          const isActive = activeValue === item.id;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => !isDisabled && handleTabChange(item.id)}
              disabled={isDisabled}
              className={cn(
                config.tab(isActive),
                isDisabled && 'opacity-50 cursor-not-allowed',
                tabClassName
              )}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
            >
              <span className="flex items-center gap-2">
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs rounded-full',
                      isActive
                        ? 'bg-primary-200 text-primary-800'
                        : 'bg-secondary-200 text-secondary-800'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
        <div
          className={cn(
            config.indicator,
            'transition-all duration-300',
            variant === 'default' || variant === 'pills' ? 'w-8' : 'w-full'
          )}
          style={
            left: variant === 'default' || variant === 'pills'
              ? `${items.findIndex(item => item.id === activeValue) * 100 / items.length}%`
              : '0',
          }}
        />
      </div>
      <div className={contentClassName}>
        {typeof children === 'function' ? children(activeValue) : children}
      </div>
    </div>
  );
};

// Tab Panel (for accessibility)
export interface TabPanelProps {
  value: string;
  activeValue: string;
  children: React.ReactNode;
  className?: string;
}

const TabPanel: React.FC<TabPanelProps> = ({
  value,
  activeValue,
  children,
  className,
}) => (
  <div
    role="tabpanel"
    aria-labelledby={value}
    hidden={value !== activeValue}
    className={cn(
      value === activeValue ? 'block' : 'hidden',
      className
    )}
  >
    {children}
  </div>
);

export { Tabs, TabPanel };
