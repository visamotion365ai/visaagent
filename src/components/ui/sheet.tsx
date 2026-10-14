import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './button';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = 'right',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  overlayClassName,
  headerClassName,
  contentClassName,
}) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sides = {
    top: 'inset-x-0 top-0 border-b border-secondary-200',
    right: 'top-0 right-0 bottom-0 w-full max-w-md border-l border-secondary-200 md:max-w-lg lg:max-w-xl',
    bottom: 'inset-x-0 bottom-0 border-t border-secondary-200',
    left: 'top-0 left-0 bottom-0 w-full max-w-md border-r border-secondary-200 md:max-w-lg lg:max-w-xl',
  };

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'w-full',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm animate-fade-in',
        overlayClassName
      )}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sheet-title' : undefined}
      aria-describedby={description ? 'sheet-description' : undefined}
    >
      <div
        className={cn(
          'fixed bg-white rounded-xl shadow-xl animate-slide-in',
          sides[side],
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              'flex items-center justify-between p-6 border-b border-secondary-200',
              headerClassName
            )}
          >
            <div>
              {title && (
                <h2
                  id="sheet-title"
                  className="text-lg font-semibold text-secondary-900"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="sheet-description"
                  className="mt-1 text-sm text-secondary-500"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 -mr-1 -mt-1"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            'p-6 overflow-y-auto',
            side !== 'top' && side !== 'bottom' && 'h-full',
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Sheet Actions
export interface SheetActionsProps {
  children: React.ReactNode;
  className?: string;
}

const SheetActions: React.FC<SheetActionsProps> = ({ children, className }) => (
  <div
    className={cn(
      'flex items-center justify-end gap-3 p-6 border-t border-secondary-200',
      className
    )}
  >
    {children}
  </div>
);

// Sheet Footer
export interface SheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

const SheetFooter: React.FC<SheetFooterProps> = ({ children, className }) => (
  <div className={cn('p-6 border-t border-secondary-200', className)}>
    {children}
  </div>
);

// Sheet Trigger
export interface SheetTriggerProps {
  children: React.ReactNode;
  onClick: () => void;
}

const SheetTrigger: React.FC<SheetTriggerProps> = ({ children, onClick }) => (
  <div onClick={onClick}>{children}</div>
);

// Sheet Content
export interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
}

const SheetContent: React.FC<SheetContentProps> = ({ children, className }) => (
  <div className={cn('p-6', className)}>{children}</div>
);

export { Sheet, SheetActions, SheetFooter, SheetTrigger, SheetContent };
