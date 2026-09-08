import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp, Plus, Calendar, Scale, Droplets, Moon, Footprints } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input, Select } from '../components/ui/Input'

const METRIC_CONFIG = {
  weight: { label: 'Weight', unit: 'kg', color: '#059669', icon: Scale },
  water: { label: 'Water', unit: 'L', color: '#0284c7', icon: Droplets },
  sleep: { label: 'Sleep', unit: 'hrs', color: '#7c3aed', icon: Moon },
  steps: { label: 'Steps', unit: 'steps', color: '#d97706', icon: Footprints },
}

const TIME_RANGES = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
]

export default function ProgressPage() {
  const [selectedMetric, setSelectedMetric] = useState('weight')
  const [selectedRange, setSelectedRange] = useState(30)
  const [metricData, setMetricData] = useState([])
  const [habitSummary, setHabitSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [logValue, setLogValue] = useState('')
  const [logging, setLogging] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedMetric, selectedRange])

  const loadData = async () => {
    setLoading(true)
    try {
      const [metricRes, habitRes] = await Promise.all([
        api.get(`/api/health/metrics?type=${selectedMetric}&days=${selectedRange}`),
        api.get('/api/habits/summary')
      ])
      setMetricData(metricRes.data?.metrics || [])
      setHabitSummary(habitRes.data || null)
    } catch (err) {
      console.error('Progress load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLog = async (e) => {
    e.preventDefault()
    if (!logValue) return
    setLogging(true)
    try {
      await api.post('/api/health/metric', {
        metric_type: selectedMetric,
        value: parseFloat(logValue)
      })
      toast.success('Measurement logged!')
      setLogValue('')
      loadData()
    } catch {
      toast.error('Failed to log metric')
    } finally {
      setLogging(false)
    }
  }

  const chartData = metricData.map((d) => ({
    date: new Date(d.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.value,
  }))

  const activeConfig = METRIC_CONFIG[selectedMetric] || METRIC_CONFIG.weight

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Health Progress & Historical Analytics"
        description="Track biological and behavioral markers over time to observe long-term trends and milestones."
      />

      {/* Log Form & Filters */}
      <Card>
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleLog} className="flex items-end gap-3 flex-wrap">
            <div className="w-36">
              <Select
                label="Metric"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                {Object.entries(METRIC_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-32">
              <Input
                label={`Value (${activeConfig.unit})`}
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={logValue}
                onChange={(e) => setLogValue(e.target.value)}
                required
              />
            </div>

            <Button type="submit" loading={logging} size="md" icon={Plus}>
              Log Entry
            </Button>
          </form>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 self-start md:self-end">
            {TIME_RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setSelectedRange(r.days)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedRange === r.days
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{activeConfig.label} Trend</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical recordings for the last {selectedRange} days
            </p>
          </div>
          <Badge variant="emerald">{chartData.length} records</Badge>
        </CardHeader>

        <CardContent className="pt-4">
          {chartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
              <TrendingUp className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-xs font-medium">No recorded data for this timeframe</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Use the logger above to record your first measurement.</p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(v) => [`${v} ${activeConfig.unit}`, activeConfig.label]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={activeConfig.color}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: activeConfig.color }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
