import React from 'react'
import { Card, CardContent } from './Card'

export function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendLabel,
  description,
  variant = 'default',
  className = '',
}) {
  return (
    <Card className={`relative ${className}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {value}
              </span>
              {unit && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{unit}</span>}
            </div>
          </div>
          {Icon && (
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        {(trend !== undefined || description) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {trend !== undefined && (
              <span className={`inline-flex items-center font-medium ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {trend >= 0 ? `+${trend}` : trend} {trendLabel || ''}
              </span>
            )}
            {description && (
              <span className="text-slate-500 dark:text-slate-400 truncate">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
