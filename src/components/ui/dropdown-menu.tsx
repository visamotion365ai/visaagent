import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MoreVertical, Check } from 'lucide-react';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  triggerClassName?: string;
  itemClassName?: string;
  disabled?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  trigger = <MoreVertical className="h-4 w-4" />,
  align = 'end',
  side = 'bottom',
  size = 'md',
  className,
  triggerClassName,
  itemClassName,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      triggerRef.current &&
      triggerRef.current.contains(e.target as Node)
    ) {
      return;
    }
    if (menuRef.current && menuRef.current.contains(e.target as Node)) {
      return;
    }
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const toggleMenu = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    item.onClick?.();
    setIsOpen(false);
  };

  const aligns = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  const sides = {
    top: 'bottom-full mb-1',
    right: 'left-full ml-1 top-0',
    bottom: 'top-full mt-1',
    left: 'right-full mr-1 top-0',
  };

  const sizes = {
    sm: 'min-w-[120px]',
    md: 'min-w-[180px]',
    lg: 'min-w-[240px]',
  };

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <button
        type="button"
        onClick={toggleMenu}
        disabled={disabled}
        className={cn(
          'p-1 rounded hover:bg-secondary-100 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          triggerClassName
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            'absolute z-50 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 animate-scale-in',
            aligns[align],
            sides[side],
            sizes[size],
            className
          )}
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary-100 transition-colors',
                item.disabled && 'opacity-50 cursor-not-allowed',
                itemClassName
              )}
              role="menuitem"
            >
              {item.icon && (
                <span className="text-secondary-400">{item.icon}</span>
              )}
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'selected' && (
                <Check className="h-4 w-4 text-primary-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// DropdownMenu with separator
export interface DropdownMenuSeparatorProps {
  className?: string;
}

const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({
  className,
}) => (
  <div
    className={cn(
      'h-px bg-secondary-200 my-1 mx-3',
      className
    )}
  />
);

// DropdownMenu with label
export interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      'px-3 py-2 text-xs font-medium text-secondary-500 uppercase tracking-wider',
      className
    )}
  >
    {children}
  </div>
);

// DropdownMenu with checkbox
export interface DropdownMenuCheckboxItemProps extends DropdownMenuItem {
  checked?: boolean;
}

const DropdownMenuCheckboxItem: React.FC<DropdownMenuCheckboxItemProps> = ({
  id,
  label,
  icon,
  disabled = false,
  checked = false,
  onClick,
  className,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary-100 transition-colors',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    role="menuitemcheckbox"
    aria-checked={checked}
  >
    <div
      className={cn(
        'h-4 w-4 rounded border-2 border-secondary-300 flex items-center justify-center',
        checked && 'bg-primary-500 border-primary-500'
      )}
    >
      {checked && <Check className="h-3 w-3 text-white" />}
    </div>
    {icon && <span className="text-secondary-400">{icon}</span>}
    <span className="flex-1 text-left">{label}</span>
  </button>
);

// DropdownMenu with radio
export interface DropdownMenuRadioItemProps extends DropdownMenuItem {
  checked?: boolean;
}

const DropdownMenuRadioItem: React.FC<DropdownMenuRadioItemProps> = ({
  id,
  label,
  icon,
  disabled = false,
  checked = false,
  onClick,
  className,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary-100 transition-colors',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    role="menuitemradio"
    aria-checked={checked}
  >
    <div
      className={cn(
        'h-4 w-4 rounded-full border-2 border-secondary-300 flex items-center justify-center',
        checked && 'bg-primary-500 border-primary-500'
      )}
    >
      {checked && <div className="h-2 w-2 rounded-full bg-white" />}
    </div>
    {icon && <span className="text-secondary-400">{icon}</span>}
    <span className="flex-1 text-left">{label}</span>
  </button>
);

export {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  type DropdownMenuItem,
};
