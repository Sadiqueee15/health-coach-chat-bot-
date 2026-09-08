import React from 'react'

export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="label flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? '!border-red-400 focus:!ring-red-400/20' : ''} ${className}`}
        required={required}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
      )}
    </div>
  )
}

export function Select({
  label,
  error,
  helperText,
  id,
  children,
  className = '',
  required = false,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="label flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
        </label>
      )}
      <select
        id={selectId}
        className={`input cursor-pointer ${error ? '!border-red-400 focus:!ring-red-400/20' : ''} ${className}`}
        required={required}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
      )}
    </div>
  )
}
