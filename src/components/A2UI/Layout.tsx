import React from 'react';

export const Column: React.FC<any> = ({ children, gap = 4, className = '' }) => (
  <div 
    className={`flex flex-col ${className}`}
    style={{ gap: typeof gap === 'number' ? `${gap * 0.25}rem` : gap }}
  >
    {children}
  </div>
);

export const Row: React.FC<any> = ({ children, gap = 4, className = '', align = 'start', justify = 'start', wrap = false }) => {
  const alignClass = { start: 'items-start', center: 'items-center', end: 'items-end' }[align as string] || 'items-start';
  const justifyClass = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between' }[justify as string] || 'justify-start';
  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';
  return (
    <div 
      className={`flex flex-row ${alignClass} ${justifyClass} ${wrapClass} ${className}`}
      style={{ gap: typeof gap === 'number' ? `${gap * 0.25}rem` : gap }}
    >
      {children}
    </div>
  );
};

export const Card: React.FC<any> = ({ children, padding = 6, className = '' }) => (
  <div 
    className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}
    style={{ padding: typeof padding === 'number' ? `${padding * 0.25}rem` : padding }}
  >
    {children}
  </div>
);

export const Divider: React.FC<any> = ({ className = '' }) => (
  <hr className={`border-t border-slate-200 my-4 ${className}`} />
);

export const Spacer: React.FC<any> = ({ size = 4, horizontal = false }) => (
  <div style={{ 
    width: horizontal ? (typeof size === 'number' ? `${size * 0.25}rem` : size) : undefined,
    height: !horizontal ? (typeof size === 'number' ? `${size * 0.25}rem` : size) : undefined
  }} />
);
