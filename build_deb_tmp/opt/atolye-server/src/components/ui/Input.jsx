import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  helper,
  icon: Icon,
  type = 'text',
  className = '',
  inputClassName = '',
  required = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

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

  const inputWrapperStyle = {
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

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    paddingLeft: Icon ? '44px' : '16px',
    paddingRight: isPassword ? '44px' : '16px',
    backgroundColor: '#fff',
    border: error ? '2px solid #ef4444' : '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  };

  const passwordBtnStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const errorStyle = {
    marginTop: '6px',
    fontSize: '13px',
    color: '#ef4444'
  };

  const helperStyle = {
    marginTop: '6px',
    fontSize: '13px',
    color: '#64748b'
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <div style={inputWrapperStyle}>
        {Icon && (
          <Icon style={iconStyle} />
        )}
        <input
          ref={ref}
          type={isPassword && showPassword ? 'text' : type}
          onFocus={(e) => {
            e.target.style.borderColor = error ? '#ef4444' : '#3b82f6';
            e.target.style.boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
          style={{ ...inputStyle, ...props.style }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={passwordBtnStyle}
          >
            {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
          </button>
        )}
      </div>
      {error && (
        <p style={errorStyle}>{error}</p>
      )}
      {helper && !error && (
        <p style={helperStyle}>{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
