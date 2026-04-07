import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  ...props
}) => {
  const paddings = {
    none: 0,
    sm: '12px',
    md: '16px',
    lg: '24px'
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    padding: paddings[padding],
    transition: hover ? 'all 0.2s ease' : 'none',
    cursor: hover ? 'pointer' : 'default'
  };

  return (
    <div
      style={cardStyle}
      className={className}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#cbd5e1';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div style={{ paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }} className={className}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }} className={className}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }} className={className}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0' }} className={className}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { Card };
