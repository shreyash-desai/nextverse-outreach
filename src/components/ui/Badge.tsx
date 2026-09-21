import React from 'react';
import { cn } from '../../utils/cn';
import type { Status, Interest, Reaction } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
  type?: Status | Interest | Reaction; // Infer color from domain type if provided
}

export function Badge({ children, variant = 'neutral', type, className, ...props }: BadgeProps) {
  let activeVariant = variant;
  
  if (type) {
    if (['Converted', 'Positive', 'Very Interested'].includes(type)) activeVariant = 'success';
    if (['Interested', 'Asked for Pricing', 'Demo Scheduled'].includes(type)) activeVariant = 'info';
    if (['Follow Up', 'Maybe', 'Contacted', 'Replied'].includes(type)) activeVariant = 'warning';
    if (['Not Interested', 'Lost', 'Wrong Contact'].includes(type)) activeVariant = 'error';
  }

  const variants = {
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[activeVariant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
