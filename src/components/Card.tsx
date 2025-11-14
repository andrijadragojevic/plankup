import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-slate-800 shadow-md',
    bordered: 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700',
    elevated: 'bg-white dark:bg-slate-800 shadow-xl',
  };

  return (
    <div
      className={`rounded-2xl p-6 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
};
