import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Camera,
  Dumbbell,
  Salad,
  TrendingUp,
  CheckCircle2,
  Circle,
  Zap,
  Flame,
  Droplets,
  Moon,
  Scale,
  Sparkles,
  ArrowUpRight,
  Plus
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completingHabit, setCompletingHabit] = useState(null)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data: d } = await api.get('/api/health/dashboard')
      setData(d)
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteHabit = async (habitId, currentlyDone) => {
    setCompletingHabit(habitId)
    try {
      await api.post(`/api/habits/${habitId}/complete`, { uncomplete: currentlyDone })
      loadDashboard()
    } catch (err) {
      console.error('Failed to toggle habit:', err)
    } finally {
      setCompletingHabit(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  const habits = data?.habits?.list || []
  const habitsDone = data?.habits?.done || 0
  const habitsTotal = data?.habits?.total || 0
  const completionPct = habitsTotal > 0 ? Math.round((habitsDone / habitsTotal) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`${greeting}, ${user?.full_name?.split(' ')[0] || 'there'}`}
        description={
          data?.profile?.fitness_goal
            ? `Target Focus: ${data.profile.fitness_goal.replace('_', ' ')}`
            : 'Here is your daily health and wellness overview.'
        }
        badge={
          <Badge variant="emerald" className="font-mono text-xs">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            {data?.xp_points || 0} XP
          </Badge>
        }
        action={
          <Link to="/app/chat">
            <Button size="sm" icon={Sparkles}>
              Ask AI Coach
            </Button>
          </Link>
        }
      />

      {/* Key Metric Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Calories"
          value={data?.today_calories || 0}
          unit={`/ ${data?.profile?.target_calories || 2000} kcal`}
          icon={Flame}
          description="Logged meals & snacks today"
        />
        <StatCard
          title="Water Intake"
          value={data?.today_water_ml ? (data.today_water_ml / 1000).toFixed(1) : '0.0'}
          unit="/ 2.5 L"
          icon={Droplets}
          description="Target hydration status"
        />
        <StatCard
          title="Habit Completion"
          value={`${habitsDone}/${habitsTotal}`}
          unit={`(${completionPct}%)`}
          icon={CheckCircle2}
          description={`${habitsTotal - habitsDone} items remaining today`}
        />
        <StatCard
          title="Current Weight"
          value={data?.profile?.weight_kg || '—'}
          unit={data?.profile?.weight_kg ? 'kg' : ''}
          icon={Scale}
          description={data?.profile?.height_cm ? `${data.profile.height_cm} cm height` : 'Weight tracker'}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Habits & Action Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daily Habits & Action Items</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Track your consistency to build lasting healthy routines
                </p>
              </div>
              <Link to="/app/habits" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                Manage Habits <ArrowUpRight className="w-3 h-3" />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {habits.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No habits set for today.{' '}
                  <Link to="/app/habits" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                    Add your first habit
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {habits.map((habit) => {
                    const isCompleting = completingHabit === habit.id
                    return (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => handleCompleteHabit(habit.id, habit.completed_today)}
                            disabled={isCompleting}
                            className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
                            aria-label={`Mark ${habit.name} complete`}
                          >
                            {habit.completed_today ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950/60" />
                            ) : (
                              <Circle className="w-5 h-5 hover:text-slate-600 dark:hover:text-slate-200" />
                            )}
                          </button>
                          <span className="text-base shrink-0">{habit.icon || '🎯'}</span>
                          <div className="min-w-0">
                            <p
                              className={`text-xs sm:text-sm font-medium truncate ${
                                habit.completed_today
                                  ? 'text-slate-400 dark:text-slate-500 line-through'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {habit.name}
                            </p>
                            {habit.category && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                {habit.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {habit.streak > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/40">
                            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {habit.streak}d
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Log Toolbar */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Logging & Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  to="/app/food"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-center group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Scan Meal</span>
                </Link>

                <Link
                  to="/app/workout"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-center group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Workouts</span>
                </Link>

                <Link
                  to="/app/meals"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-center group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Salad className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Meal Plan</span>
                </Link>

                <Link
                  to="/app/progress"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-center group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Analytics</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Health Briefing & Recommendations */}
        <div className="space-y-6">
          <Card className="border-emerald-200/70 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-sm">Daily AI Briefing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                {data?.ai_tip ||
                  "Focus on hydration and balanced protein distribution today. Hitting your daily water target will optimize your energy levels and recovery."}
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  to="/app/chat"
                  className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Start coaching session
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Profile Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Health Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Activity Level</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                  {data?.profile?.activity_level?.replace('_', ' ') || 'Moderate'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Diet Type</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                  {data?.profile?.dietary_pref || 'Balanced'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Sleep Target</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {data?.profile?.target_sleep_hours || 8} hrs/night
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  to="/app/profile"
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-between"
                >
                  <span>Edit profile details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
