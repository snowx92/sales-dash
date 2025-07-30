'use client';

import React, { createContext, useCallback, useState } from "react";

// Toast types
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export interface ToastContextType {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

// Create context
export const ToastContext = createContext<ToastContextType | null>(null);

// Get the current toast instance if available
const getToastInstance = (): ToastContextType | null => {
  if (typeof window === 'undefined') return null;
  
  // Try to get the toast instance from the global context
  let contextInstance: ToastContextType | null = null;
  try {
    // This is a hacky way to get the current context instance
    // In a real implementation, you'd want to use a more reliable method
    ToastContext.Consumer({
      children: (value: ToastContextType | null) => {
        contextInstance = value;
        return null;
      }
    });
  // eslint-disable-next-line no-empty
  } catch {
    console.warn('Toast context not available yet');
  }
  
  return contextInstance;
};

// Toast component for direct use
export const Toast = {
  success: (props: { title?: string; description?: string; message?: string }) => {
    const context = getToastInstance();
    if (context) {
      context.toast({
        title: props.title || props.message || 'Success',
        description: props.description,
        variant: 'default'
      });
    } else {
      console.warn('Toast context not found. Make sure ToastProvider is mounted.');
    }
    
    // Return for compatibility with previous implementation
    return { title: props.title || props.message, description: props.description, variant: 'default' };
  },
  
  error: (props: { title?: string; description?: string; message?: string }) => {
    const context = getToastInstance();
    if (context) {
      context.toast({
        title: props.title || props.message || 'Error',
        description: props.description,
        variant: 'destructive'
      });
    } else {
      console.warn('Toast context not found. Make sure ToastProvider is mounted.');
    }
    
    // Return for compatibility with previous implementation
    return { title: props.title || props.message, description: props.description, variant: 'destructive' };
  },
  
  info: (props: { title?: string; description?: string; message?: string }) => {
    const context = getToastInstance();
    if (context) {
      context.toast({
        title: props.title || props.message || 'Info',
        description: props.description,
        variant: 'default'
      });
    } else {
      console.warn('Toast context not found. Make sure ToastProvider is mounted.');
    }
    
    // Return for compatibility with previous implementation
    return { title: props.title || props.message, description: props.description, variant: 'default' };
  }
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, variant }]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      
      {/* Toast UI */}
      <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-md shadow-md min-w-[300px] max-w-md bg-white dark:bg-gray-800 
              ${t.variant === 'destructive' ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'}`}
          >
            {t.title && <div className="font-semibold">{t.title}</div>}
            {t.description && <div className="text-sm opacity-90 mt-1">{t.description}</div>}
            <button
              className="absolute top-2 right-2 opacity-70 hover:opacity-100"
              onClick={() => dismiss(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
