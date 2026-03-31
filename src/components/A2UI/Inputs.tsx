import React, { useState, useEffect } from 'react';
import { useStateStore } from '@json-render/react';

export const TextField: React.FC<any> = ({ name, label, placeholder, value, onChange, className = '', isSecret = false }) => {
  const { state, set } = useStateStore();
  const storeValue = name ? state[name] : value;
  const initialValue = storeValue !== undefined && storeValue !== null ? storeValue : '';
  const [internalValue, setInternalValue] = useState(initialValue);

  useEffect(() => {
    const newValue = storeValue !== undefined && storeValue !== null ? storeValue : '';
    setInternalValue(newValue);
  }, [storeValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    if (name) set(name, val);
    if (onChange) onChange(val);
  };

  return (
    <div 
      className={`flex flex-col ${className}`}
      style={{ gap: '0.375rem' }}
    >
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        type={isSecret ? 'password' : 'text'}
        className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
      />
    </div>
  );
};

export const TextAreaField: React.FC<any> = ({ name, label, placeholder, value, onChange, className = '', rows = 4 }) => {
  const { state, set } = useStateStore();
  const storeValue = name ? state[name] : value;
  const initialValue = storeValue !== undefined && storeValue !== null ? storeValue : '';
  const [internalValue, setInternalValue] = useState(initialValue);

  useEffect(() => {
    const newValue = storeValue !== undefined && storeValue !== null ? storeValue : '';
    setInternalValue(newValue);
  }, [storeValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    if (name) set(name, val);
    if (onChange) onChange(val);
  };

  return (
    <div 
      className={`flex flex-col ${className}`}
      style={{ gap: '0.375rem' }}
    >
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        rows={rows}
        className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
      />
    </div>
  );
};

export const NumberField: React.FC<any> = ({ name, label, placeholder, value, onChange, className = '' }) => {
  const { state, set } = useStateStore();
  const storeValue = name ? state[name] : value;
  const initialValue = storeValue !== undefined && storeValue !== null ? storeValue : '';
  const [internalValue, setInternalValue] = useState(initialValue);

  useEffect(() => {
    const newValue = storeValue !== undefined && storeValue !== null ? storeValue : '';
    setInternalValue(newValue);
  }, [storeValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    if (name) set(name, Number(val));
    if (onChange) onChange(Number(val));
  };

  return (
    <div 
      className={`flex flex-col ${className}`}
      style={{ gap: '0.375rem' }}
    >
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        type="number"
        className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
      />
    </div>
  );
};

export const StringArrayField: React.FC<any> = ({ name, label, placeholder, value, onChange, className = '' }) => {
  const { state, set } = useStateStore();
  const storeValue = name ? state[name] : value;
  const [internalValue, setInternalValue] = useState<string[]>(storeValue || []);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setInternalValue(storeValue || []);
  }, [storeValue]);

  const handleAdd = () => {
    if (inputValue.trim() && !internalValue.includes(inputValue.trim())) {
      const newValue = [...internalValue, inputValue.trim()];
      setInternalValue(newValue);
      if (name) set(name, newValue);
      if (onChange) onChange(newValue);
      setInputValue('');
    }
  };

  const handleRemove = (itemToRemove: string) => {
    const newValue = internalValue.filter(item => item !== itemToRemove);
    setInternalValue(newValue);
    if (name) set(name, newValue);
    if (onChange) onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div 
      className={`flex flex-col ${className}`}
      style={{ gap: '0.375rem' }}
    >
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={placeholder || "Add item and press Enter"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm font-medium"
        >
          Add
        </button>
      </div>
      {internalValue.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {internalValue.map((item, idx) => (
            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
              {item}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 focus:outline-none"
              >
                <span className="sr-only">Remove item</span>
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const Select: React.FC<any> = ({ name, label, options = [], value, onChange, className = '' }) => {
  const { state, set } = useStateStore();
  const storeValue = name ? state[name] : value;
  const initialValue = storeValue !== undefined && storeValue !== null ? storeValue : '';
  const [internalValue, setInternalValue] = useState(initialValue);

  useEffect(() => {
    const newValue = storeValue !== undefined && storeValue !== null ? storeValue : '';
    setInternalValue(newValue);
  }, [storeValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    if (name) set(name, val);
    if (onChange) onChange(val);
  };

  return (
    <div 
      className={`flex flex-col ${className}`}
      style={{ gap: '0.375rem' }}
    >
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        value={internalValue}
        onChange={handleChange}
      >
        {options.map((opt: any, idx: number) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const Checkbox: React.FC<any> = ({ name, label, checked, onChange, className = '' }) => {
  const { state, set } = useStateStore();
  const storeValue = name ? state[name] : checked;
  const [internalChecked, setInternalChecked] = useState(storeValue || false);

  useEffect(() => {
    setInternalChecked(storeValue || false);
  }, [storeValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setInternalChecked(val);
    if (name) set(name, val);
    if (onChange) onChange(val);
  };

  return (
    <div 
      className={`flex items-center ${className}`}
      style={{ gap: '0.5rem' }}
    >
      <input
        type="checkbox"
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
        checked={internalChecked}
        onChange={handleChange}
      />
      {label && <label className="text-sm text-slate-700">{label}</label>}
    </div>
  );
};
