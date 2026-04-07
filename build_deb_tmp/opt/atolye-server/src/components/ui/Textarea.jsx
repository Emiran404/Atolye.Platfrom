import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  helper,
  className = '',
  textareaClassName = '',
  required = false,
  rows = 4,
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

  const textareaStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#fff',
    border: error ? '2px solid #ef4444' : '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '100px'
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
      <textarea
        ref={ref}
        rows={rows}
        style={textareaStyle}
        onFocus={(e) => {
          e.target.style.borderColor = error ? '#ef4444' : '#3b82f6';
          e.target.style.boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 0 0 3px rgba(59,130,246,0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && (
        <p style={errorStyle}>{error}</p>
      )}
      {helper && !error && (
        <p style={helperStyle}>{helper}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
