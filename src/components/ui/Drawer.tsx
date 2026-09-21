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
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel — bottom sheet on mobile, side panel on desktop */}
      <div className="relative w-full md:w-[580px] max-w-full max-h-[92dvh] md:max-h-full md:h-full bg-surface shadow-floating flex flex-col rounded-t-3xl md:rounded-t-none">
        {/* Drag handle for mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[17px] font-semibold text-textPrimary">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-textSecondary hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-light/30">
          {children}
        </div>
      </div>
    </div>
  );
}
