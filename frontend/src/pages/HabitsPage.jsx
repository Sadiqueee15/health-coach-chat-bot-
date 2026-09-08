import { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Flame,
  Trophy,
  Zap,
  Target,
  Award,
  Sparkles
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'

const BADGE_ICONS = {
  first_habit: '🌱',
  streak_7: '🔥',
  streak_30: '🏆',
  hydration_hero: '💧',
  workout_10: '💪',
}

const DEFAULT_EMOJIS = ['🎯', '💧', '🏃', '🥗', '🧘', '📖', '💤', '💊', '🍎', '💪']

export default function HabitsPage() {
  const [habits, setHabits] = useState([])
  const [summary, setSummary] = useState(null)
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', icon: '🎯', target: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    try {
      const [habitsRes, summaryRes, badgesRes] = await Promise.all([
        api.get('/api/habits'),
        api.get('/api/habits/summary'),
        api.get('/api/habits/badges'),
      ])
      setHabits(habitsRes.data?.habits || [])
      setSummary(summaryRes.data || null)
      setBadges(badgesRes.data?.badges || [])
    } catch {
      toast.error('Failed to load habits')
    } finally {
      setLoading(false)
    }
  }

  const completeHabit = async (habitId, currentlyDone) => {
    try {
      const { data } = await api.post(`/api/habits/${habitId}/complete`, { uncomplete: currentlyDone })
      if (data.badges_earned?.length > 0) {
        toast.success(`Achievement Unlocked: ${data.badges_earned[0]}!`, { duration: 4000 })
      }
      loadHabits()
    } catch {
      toast.error('Failed to update habit')
    }
  }

  const addHabit = async (e) => {
    e?.preventDefault()
    if (!newHabit.name.trim()) return toast.error('Habit title is required')
    setSubmitting(true)
    try {
      await api.post('/api/habits', newHabit)
      toast.success('Habit created!')
      setNewHabit({ name: '', icon: '🎯', target: '' })
      setShowAdd(false)
      loadHabits()
    } catch {
      toast.error('Failed to create habit')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteHabit = async (habitId) => {
    if (!window.confirm('Delete this habit?')) return
    try {
      await api.delete(`/api/habits/${habitId}`)
      toast.success('Habit deleted')
      loadHabits()
    } catch {
      toast.error('Failed to delete habit')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Habit Tracker & Consistency"
        description="Build daily discipline through consistency tracking, progressive streaks, and performance milestones."
        action={
          <Button size="sm" icon={Plus} onClick={() => setShowAdd(true)}>
            Add New Habit
          </Button>
        }
      />

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {summary?.completion_rate ? `${Math.round(summary.completion_rate)}%` : '0%'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Longest Active Streak
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {summary?.best_streak || 0} <span className="text-xs font-normal">days</span>
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Earned Badges
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {badges.length} <span className="text-xs font-normal">unlocked</span>
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Habits List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Habits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {habits.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No habits created yet. Click "Add New Habit" to begin.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => completeHabit(habit.id, habit.completed_today)}
                      className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {habit.completed_today ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950/60" />
                      ) : (
                        <Circle className="w-5 h-5 hover:text-slate-600 dark:hover:text-slate-200" />
                      )}
                    </button>
                    <span className="text-lg shrink-0">{habit.icon || '🎯'}</span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          habit.completed_today
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {habit.name}
                      </p>
                      {habit.target && (
                        <p className="text-[11px] text-slate-400">{habit.target}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {habit.streak > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/40">
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {habit.streak}d streak
                      </span>
                    )}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges and Milestones */}
      {badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unlocked Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map((b, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-2.5"
                >
                  <span className="text-xl">{BADGE_ICONS[b.badge_key] || '🏆'}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {b.title || b.badge_key}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {new Date(b.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Habit Modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Create New Habit"
        description="Define a daily habit or routine you want to track."
      >
        <form onSubmit={addHabit} className="space-y-4">
          <Input
            label="Habit Name"
            placeholder="e.g., 20 min morning walk, drink 2L water"
            value={newHabit.name}
            onChange={(e) => setNewHabit((p) => ({ ...p, name: e.target.value }))}
            required
            autoFocus
          />

          <div>
            <label className="label">Icon / Emoji</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {DEFAULT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewHabit((p) => ({ ...p, icon: emoji }))}
                  className={`w-9 h-9 rounded-lg text-base flex items-center justify-center border transition-colors ${
                    newHabit.icon === emoji
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:border-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Daily Target (Optional)"
            placeholder="e.g., 8 glasses, 10,000 steps"
            value={newHabit.target}
            onChange={(e) => setNewHabit((p) => ({ ...p, target: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Habit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
