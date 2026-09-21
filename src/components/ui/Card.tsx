import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl md:rounded-3xl shadow-soft border border-border p-5 md:p-6 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
