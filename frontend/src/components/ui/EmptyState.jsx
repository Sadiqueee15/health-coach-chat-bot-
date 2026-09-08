import React from 'react'
import { Button } from './Button'

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`text-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl ${className}`}>
      {Icon && (
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
