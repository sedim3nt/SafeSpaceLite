import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', id, ...props }: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isDateInput = props.type === 'date';

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`block h-12 w-full rounded-md border bg-surface px-4 text-text shadow-sm placeholder:text-text-muted focus:outline-none focus:ring-2 sm:text-sm ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-border focus:border-sage-400 focus:ring-sage-400/20'
        } ${
          isDateInput
            ? 'py-0 leading-none [&::-webkit-date-and-time-value]:min-h-[48px] [&::-webkit-date-and-time-value]:flex [&::-webkit-date-and-time-value]:items-center [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:flex [&::-webkit-datetime-edit]:h-full [&::-webkit-datetime-edit]:items-center'
            : ''
        } ${className}`}
        {...props}
      />
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-danger' : 'text-text-muted'}`}>{error || helperText}</p>
      )}
    </div>
  );
}
