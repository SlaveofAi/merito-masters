
import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const styles = {
    success: 'bg-success-50 border-success-200 text-success-800',
    error: 'bg-destructive/10 border-destructive/20 text-destructive',
    info: 'bg-primary/10 border-primary/20 text-primary',
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-strong animate-slide-in-right',
      styles[type]
    )}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
