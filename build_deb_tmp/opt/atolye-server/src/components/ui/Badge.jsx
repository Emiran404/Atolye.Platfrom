import React from 'react';

const variants = {
  default: 'bg-slate-100 text-slate-700 border border-slate-200',
  primary: 'bg-blue-50 text-blue-700 border border-blue-200',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  error: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-cyan-50 text-cyan-700 border border-cyan-200'
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
};

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`
          w-1.5 h-1.5 rounded-full
          ${variant === 'success' ? 'bg-emerald-500' : ''}
          ${variant === 'warning' ? 'bg-amber-500' : ''}
          ${variant === 'error' ? 'bg-red-500' : ''}
          ${variant === 'primary' ? 'bg-blue-500' : ''}
          ${variant === 'info' ? 'bg-cyan-500' : ''}
          ${variant === 'default' ? 'bg-slate-500' : ''}
        `} />
      )}
      {children}
    </span>
  );
};

export { Badge };
