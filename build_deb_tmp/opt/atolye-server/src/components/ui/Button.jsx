import React from 'react';
import { Loader2 } from 'lucide-react';

const variantStyles = {
  primary: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
  },
  secondary: {
    backgroundColor: '#475569',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgba(71, 85, 105, 0.3)'
  },
  success: {
    backgroundColor: '#059669',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)'
  },
  error: {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)'
  },
  warning: {
    backgroundColor: '#f59e0b',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)'
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#334155',
    border: 'none',
    boxShadow: 'none'
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#334155',
    border: '2px solid #cbd5e1',
    boxShadow: 'none'
  }
};

const sizeStyles = {
  sm: {
    padding: '8px 16px',
    fontSize: '14px'
  },
  md: {
    padding: '12px 24px',
    fontSize: '15px'
  },
  lg: {
    padding: '16px 32px',
    fontSize: '16px'
  }
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  fullWidth = false,
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '600',
    borderRadius: '10px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    outline: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : 'auto',
    ...variantStyles[variant],
    ...sizeStyles[size]
  };

  return (
    <button
      disabled={disabled || loading}
      style={baseStyle}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.opacity = '0.9';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.opacity = disabled || loading ? '0.6' : '1';
      }}
      {...props}
    >
      {loading && <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />}
      {!loading && Icon && iconPosition === 'left' && <Icon style={{ width: '18px', height: '18px' }} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon style={{ width: '18px', height: '18px' }} />}
    </button>
  );
};

export { Button };
