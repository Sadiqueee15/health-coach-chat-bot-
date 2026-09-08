import React from 'react'

export function Badge({ children, variant = 'neutral', className = '', ...props }) {
  const variantClasses = {
    neutral: 'badge-neutral',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30',
  }[variant] || 'badge-neutral'

  return (
    <span className={`badge ${variantClasses} ${className}`} {...props}>
      {children}
    </span>
  )
}
