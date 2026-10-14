import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  variant = 'info',
  duration = 3000,
  onClose,
  action,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      onClose?.(id);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [id, duration, onClose]);

  const handleClose = useCallback(() => {
    setIsMounted(false);
    setTimeout(() => onClose?.(id), 200);
  }, [id, onClose]);

  const variants = {
    info: {
      icon: <Info className="h-5 w-5 text-blue-500" />,
      container: 'bg-blue-50 border-blue-200 text-blue-800',
    },
    success: {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      container: 'bg-green-50 border-green-200 text-green-800',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    },
    error: {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      container: 'bg-red-50 border-red-200 text-red-800',
    },
  };

  const config = variants[variant];

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border p-4 shadow-lg animate-slide-up',
        config.container,
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="flex-1">
        {title && <h5 className="font-medium mb-1">{title}</h5>}
        <p className="text-sm">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium hover:underline"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={handleClose}
          className="p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container
export interface ToastContainerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  children,
}) => {
  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        positions[position]
      )}
    >
      {children}
    </div>
  );
};

// Toast Provider
export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: Omit<ToastMessage, 'id'>): string => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, ...message }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const contextValue = {
    toasts,
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <ToastContainer>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              title={toast.title}
              message={toast.message}
              variant={toast.variant}
              duration={toast.duration}
              onClose={removeToast}
              action={toast.action}
            />
          ))}
        </ToastContainer>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// Hook to use toast
const useToast = (): ToastContextType => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience functions
const createToast = (context: ToastContextType) => ({
  info: (message: string, options?: Omit<ToastMessage, 'id' | 'message' | 'variant'>) =>
    context.addToast({ message, variant: 'info' as const, ...options }),
  success: (message: string, options?: Omit<ToastMessage, 'id' | 'message' | 'variant'>) =>
    context.addToast({ message, variant: 'success' as const, ...options }),
  warning: (message: string, options?: Omit<ToastMessage, 'id' | 'message' | 'variant'>) =>
    context.addToast({ message, variant: 'warning' as const, ...options }),
  error: (message: string, options?: Omit<ToastMessage, 'id' | 'message' | 'variant'>) =>
    context.addToast({ message, variant: 'error' as const, ...options }),
});

export { Toast, ToastContainer, ToastProvider, useToast, createToast, type ToastMessage };
