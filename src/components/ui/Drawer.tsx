import { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-stretch md:justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel — bottom sheet on mobile, full-height slide-over on desktop */}
      <div className="relative w-full md:w-[600px] max-w-full h-[90dvh] md:h-full bg-surface shadow-floating flex flex-col rounded-t-3xl md:rounded-none z-10 overflow-hidden">
        {/* Drag handle for mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0 bg-surface">
          <h2 className="text-[17px] font-semibold text-textPrimary tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-textSecondary hover:bg-light hover:text-textPrimary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content area: scrolls independently */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 bg-light/30">
          {children}
        </div>
      </div>
    </div>
  );
}
