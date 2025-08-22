import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Toast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 text-green-800',
    iconClassName: 'text-green-600',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-800',
    iconClassName: 'text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    iconClassName: 'text-yellow-600',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-800',
    iconClassName: 'text-blue-600',
  },
};

export const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const variant = toastVariants[toast.type];
  const Icon = variant.icon;

  return (
    <Card 
      className={cn(
        "mb-2 shadow-lg transition-all duration-300 ease-in-out animate-in slide-in-from-right-5",
        variant.className
      )}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <Icon className={cn("h-5 w-5 mt-0.5", variant.iconClassName)} />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm opacity-90 mt-1">{toast.description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(toast.id)}
          className="h-6 w-6 p-0 hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-sm">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
