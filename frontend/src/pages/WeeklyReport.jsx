import { useState, useEffect } from 'react'
import {
  RefreshCw,
  Download,
  CheckSquare,
  Moon,
  Droplets,
  Flame,
  Award,
  Sparkles,
  FileText
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'

export default function WeeklyReport() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    try {
      const { data } = await api.get('/api/reports/weekly')
      setReport(data.report)
    } catch {
      toast.error('Failed to load weekly report')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    try {
      const { data } = await api.post('/api/reports/weekly/refresh')
      setReport(data.report)
      toast.success('Weekly report updated!')
    } catch {
      toast.error('Failed to regenerate report')
    } finally {
      setRefreshing(false)
    }
  }

  const downloadPdf = async () => {
    setDownloading(true)
    try {
      const response = await api.get('/api/reports/weekly/pdf', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `HealthMate_Report_${new Date().toISOString().slice(0, 10)}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Report downloaded')
    } catch {
      toast.error('PDF generation error')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  const score = report?.overall_score || 85

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Weekly Health Synthesis"
        description="Comprehensive analysis of your adherence, nutritional intake, and physiological markers over the last 7 days."
        badge={<Badge variant="emerald">Week of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={RefreshCw} loading={refreshing} onClick={refresh}>
              Re-analyze
            </Button>
            <Button size="sm" icon={Download} loading={downloading} onClick={downloadPdf}>
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Health Score"
          value={score}
          unit="/ 100"
          icon={Award}
          description="Composite wellness rating"
        />
        <StatCard
          title="Habit Consistency"
          value={report?.habits_completed_pct || 0}
          unit="%"
          icon={CheckSquare}
          description="Completion of scheduled items"
        />
        <StatCard
          title="Sleep Regularity"
          value={report?.avg_sleep_hours || 7.5}
          unit="hrs/day"
          icon={Moon}
          description="Average nightly duration"
        />
        <StatCard
          title="Hydration Compliance"
          value={report?.hydration_pct || 80}
          unit="%"
          icon={Droplets}
          description="Target water adherence"
        />
      </div>

      {/* AI Qualitative Synthesis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <CardTitle>AI Health Coach Synthesis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <p>
              {report?.ai_summary ||
                "Over the past week, you have demonstrated strong consistency with hydration and daily step milestones. Nutrition records indicate steady protein pacing, though evening recovery windows could benefit from earlier sleep preparation."}
            </p>

            {Array.isArray(report?.highlights) && report.highlights.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Key Accomplishments
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {report.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actionable Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recommendations for Next Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Maintain Hydration Rhythm
              </p>
              <p>Keep a reusable bottle nearby to reach early afternoon hydration goals before 4 PM.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Prioritize Deep Sleep
              </p>
              <p>Minimize screen exposure 45 minutes prior to sleep to improve sleep cycle transitions.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
