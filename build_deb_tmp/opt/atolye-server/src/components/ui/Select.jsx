import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Seçiniz...',
  className = '',
  required = false,
  icon: Icon,
  children,
  ...props
}, ref) => {
  const containerStyle = {
    width: '100%'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '6px'
  };

  const selectWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    color: '#94a3b8',
    pointerEvents: 'none',
    zIndex: 1
  };

  const selectStyle = {
    width: '100%',
    padding: '12px 44px 12px 16px',
    paddingLeft: Icon ? '48px' : '16px',
    paddingRight: '44px',
    backgroundColor: '#fff',
    border: error ? '2px solid #ef4444' : '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#334155',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  };

  const chevronStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    color: '#94a3b8',
    pointerEvents: 'none'
  };

  const errorStyle = {
    marginTop: '6px',
    fontSize: '13px',
    color: '#ef4444'
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <div style={selectWrapperStyle}>
        {Icon && (
          <Icon style={iconStyle} />
        )}
        <select
          ref={ref}
          onFocus={(e) => {
            e.target.style.borderColor = error ? '#ef4444' : '#3b82f6';
            e.target.style.boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
          style={{ ...selectStyle, ...props.style }}
        >
          {!props.value && placeholder && <option value="" disabled>{placeholder}</option>}
          {children || options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown style={chevronStyle} />
      </div>
      {error && (
        <p style={errorStyle}>{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
