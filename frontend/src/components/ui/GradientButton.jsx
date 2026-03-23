import React from 'react';
import { LoaderIcon } from 'lucide-react';
export function GradientButton({
  children,
  className = '',
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled = false,
  ...props
}) {
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2
    px-6 py-3 rounded-xl font-semibold text-sm
    transition-all duration-300 ease-out
    focus-ring
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-600 to-purple-600 text-white
      hover:from-blue-500 hover:to-purple-500
      hover:shadow-lg hover:shadow-blue-500/25
      active:scale-[0.98]
    `,
    secondary: `
      bg-green-600 text-white
      hover:bg-green-500
      hover:shadow-lg hover:shadow-green-500/25
      active:scale-[0.98]
    `,
    outline: `
      bg-transparent text-white border border-white/20
      hover:bg-white/5 hover:border-white/30
      active:scale-[0.98]
    `
  };
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}>
      
      {loading &&
      <LoaderIcon className="w-4 h-4 animate-spin" aria-hidden="true" />
      }
      {children}
    </button>
  );
}
