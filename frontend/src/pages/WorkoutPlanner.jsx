import { useState } from 'react'
import {
  RefreshCw,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Clock,
  Calendar,
  Sparkles,
  Check
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Input'

const GOALS = ['General fitness', 'Weight loss', 'Muscle gain', 'Endurance', 'Strength']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const EQUIPMENT_LIST = ['No equipment', 'Dumbbells', 'Barbell', 'Pull-up bar', 'Resistance bands', 'Gym access', 'Yoga mat']
const WORKOUT_TYPES = ['Mixed', 'Strength training', 'Cardio', 'HIIT', 'Calisthenics', 'Yoga']

function ExerciseItem({ exercise }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-900/40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {exercise.exercise}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {exercise.sets ? `${exercise.sets} sets` : ''} {exercise.reps ? `× ${exercise.reps}` : ''} {exercise.duration || ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {exercise.rest && (
            <span className="text-[11px] font-mono text-slate-400">Rest: {exercise.rest}</span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>
      {expanded && exercise.instructions && (
        <div className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
          {exercise.instructions}
        </div>
      )}
    </div>
  )
}

function DayCard({ day }) {
  const [open, setOpen] = useState(true)
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-colors text-left border-b border-slate-100 dark:border-slate-800"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
            {day.day}
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {day.focus}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <CardContent className="p-4 space-y-4">
          {Array.isArray(day.warm_up) && day.warm_up.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Warm-up
              </h4>
              <div className="space-y-1.5">
                {day.warm_up.map((ex, i) => (
                  <ExerciseItem key={i} exercise={ex} />
                ))}
              </div>
            </div>
          )}

          {Array.isArray(day.main_workout) && day.main_workout.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Main Routine
              </h4>
              <div className="space-y-1.5">
                {day.main_workout.map((ex, i) => (
                  <ExerciseItem key={i} exercise={ex} />
                ))}
              </div>
            </div>
          )}

          {Array.isArray(day.cool_down) && day.cool_down.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Cool-down & Stretch
              </h4>
              <div className="space-y-1.5">
                {day.cool_down.map((ex, i) => (
                  <ExerciseItem key={i} exercise={ex} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function WorkoutPlanner() {
  const [form, setForm] = useState({
    goal: 'General fitness',
    experience_level: 'Beginner',
    days_per_week: 3,
    duration_min: 45,
    equipment: ['No equipment'],
    workout_type: 'Mixed',
  })
  const [plan, setPlan] = useState(null)
  const [workoutId, setWorkoutId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleEquip = (eq) => {
    const curr = form.equipment
    if (curr.includes(eq)) {
      if (curr.length > 1) setForm((p) => ({ ...p, equipment: curr.filter((e) => e !== eq) }))
    } else {
      setForm((p) => ({ ...p, equipment: [...curr, eq] }))
    }
  }

  const generate = async () => {
    setLoading(true)
    setPlan(null)
    setSaved(false)
    try {
      const { data } = await api.post('/api/workout/generate', form)
      setPlan(data.plan)
      setWorkoutId(data.workout?.id)
      toast.success('Workout program generated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate workout plan.')
    } finally {
      setLoading(false)
    }
  }

  const savePlan = async () => {
    if (!workoutId) return
    try {
      await api.put(`/api/workout/save/${workoutId}`)
      setSaved(true)
      toast.success('Workout plan saved to profile!')
    } catch {
      toast.error('Failed to save workout')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Workout Program Planner"
        description="Generate evidence-based exercise regimens tailored to your fitness target, available equipment, and weekly schedule."
        badge={<Badge variant="neutral">Custom Routine</Badge>}
      />

      {/* Program Config Card */}
      <Card>
        <CardHeader>
          <CardTitle>Program Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Fitness Goal"
              value={form.goal}
              onChange={(e) => setForm((p) => ({ ...p, goal: e.target.value }))}
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>

            <Select
              label="Experience Level"
              value={form.experience_level}
              onChange={(e) => setForm((p) => ({ ...p, experience_level: e.target.value }))}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>

            <div>
              <label className="label flex justify-between">
                <span>Frequency</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {form.days_per_week} days/week
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={form.days_per_week}
                onChange={(e) => setForm((p) => ({ ...p, days_per_week: parseInt(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="label flex justify-between">
                <span>Session Duration</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {form.duration_min} minutes
                </span>
              </label>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={form.duration_min}
                onChange={(e) => setForm((p) => ({ ...p, duration_min: parseInt(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="label">Workout Focus / Style</label>
            <div className="flex flex-wrap gap-2">
              {WORKOUT_TYPES.map((wt) => (
                <button
                  key={wt}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, workout_type: wt }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.workout_type === wt
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {wt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Available Equipment</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_LIST.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => toggleEquip(eq)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.equipment.includes(eq)
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={generate}
            loading={loading}
            className="w-full"
            icon={Sparkles}
          >
            {loading ? 'Building Personalized Program...' : 'Generate Workout Program'}
          </Button>
        </CardContent>
      </Card>

      {/* Results View */}
      {plan && (
        <div className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{plan.title}</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{plan.overview}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={RefreshCw} onClick={generate}>
                  Regenerate
                </Button>
                {!saved && (
                  <Button size="sm" icon={Save} onClick={savePlan}>
                    Save Plan
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            {(plan.days || []).map((day, i) => (
              <DayCard key={i} day={day} />
            ))}
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p>
              {plan.safety_note ||
                'Ensure proper warm-up prior to high-load movements. If you experience unusual pain or dizziness, pause immediately and seek professional advice.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
