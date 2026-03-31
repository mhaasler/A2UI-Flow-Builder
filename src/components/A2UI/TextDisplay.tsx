import React from 'react';

export const Text: React.FC<any> = ({ content, variant = 'body', className = '', children }) => {
  const classes = {
    h1: 'text-3xl font-bold text-slate-900',
    h2: 'text-2xl font-semibold text-slate-800',
    h3: 'text-xl font-medium text-slate-800',
    body: 'text-base text-slate-600',
    small: 'text-sm text-slate-500',
  }[variant as string] || 'text-base text-slate-600';

  return <div className={`${classes} ${className}`}>{content || children}</div>;
};

export const Code: React.FC<any> = ({ content, className = '' }) => (
  <pre className={`bg-slate-50 p-4 rounded-md border border-slate-200 overflow-x-auto font-mono text-sm text-slate-800 ${className}`}>
    <code>{content}</code>
  </pre>
);

export const Badge: React.FC<any> = ({ content, color = 'slate', className = '' }) => {
  const colorClasses: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  const classes = colorClasses[color] || colorClasses.slate;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes} ${className}`}>
      {content}
    </span>
  );
};
