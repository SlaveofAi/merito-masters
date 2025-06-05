
import React from 'react';
import { Plus, MessageSquare, Phone } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  action: 'add' | 'message' | 'call';
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ action, onClick, className }: FloatingActionButtonProps) {
  const icons = {
    add: Plus,
    message: MessageSquare,
    call: Phone,
  };

  const Icon = icons[action];

  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-strong hover:shadow-medium transition-all duration-300 hover:scale-110 active:scale-95',
        'bg-primary hover:bg-primary/90 text-white',
        className
      )}
      size="icon"
    >
      <Icon className="h-6 w-6" />
    </Button>
  );
}
