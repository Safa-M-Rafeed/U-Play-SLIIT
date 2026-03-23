import React from 'react';
export function InputField({
  label,
  error,
  icon,
  rightIcon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label &&
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-300">
        
          {label}
        </label>
      }
      <div className="relative">
        {icon &&
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {icon}
          </div>
        }
        <input
          id={inputId}
          className={`
            w-full bg-white/5 border rounded-xl text-white text-sm
            placeholder-slate-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/[0.07]
            ${icon ? 'pl-11' : 'pl-4'}
            ${rightIcon ? 'pr-11' : 'pr-4'}
            py-3
            ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : 'border-white/10'}
          `}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props} />
        
        {rightIcon &&
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            {rightIcon}
          </div>
        }
      </div>
      {error &&
      <p
        id={`${inputId}-error`}
        className="text-xs text-red-400 mt-1"
        role="alert">
        
          {error}
        </p>
      }
    </div>
  );
}
