import React from 'react';

export const Button: React.FC<any> = ({ label, action, payload, onAction, variant = 'primary', className = '', justify = 'center' }) => {
  const handleClick = () => {
    if (onAction && action) {
      onAction(action, payload);
    }
  };

  const variants: Record<string, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 border-transparent shadow-sm',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm',
    ghost: 'bg-transparent text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border-transparent',
  };

  const variantClasses = variants[variant] || variants.primary;
  const justifyClass = justify === 'start' ? 'justify-start' : justify === 'end' ? 'justify-end' : 'justify-center';

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${justifyClass} ${variantClasses} ${className}`}
    >
      {label}
    </button>
  );
};

export const Form: React.FC<any> = ({ children, onSubmitAction, onAction, className = '' }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAction && onSubmitAction) {
      onAction(onSubmitAction);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`flex flex-col ${className}`}
      style={{ gap: '1rem' }}
    >
      {children}
    </form>
  );
};

export const Toast: React.FC<any> = ({ message, type = 'info', className = '' }) => {
  const types: Record<string, string> = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  const typeClasses = types[type] || types.info;

  return (
    <div className={`p-4 rounded-md border text-sm font-medium ${typeClasses} ${className}`}>
      {message}
    </div>
  );
};
