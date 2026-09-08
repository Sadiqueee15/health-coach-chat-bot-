import { useState } from 'react'
import { Calculator, Droplets, Flame, Scale, Apple, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input, Select } from '../components/ui/Input'

const TOOLS = [
  { id: 'bmi', label: 'BMI Index', icon: Scale },
  { id: 'bmr', label: 'Basal Metabolic Rate', icon: Flame },
  { id: 'tdee', label: 'TDEE Expenditure', icon: Calculator },
  { id: 'water', label: 'Hydration Target', icon: Droplets },
  { id: 'macros', label: 'Macronutrient Split', icon: Apple },
]

const GENDERS = ['Male', 'Female', 'Other']
const ACTIVITY_LEVELS = ['Sedentary', 'Lightly active', 'Moderately active', 'Very active']
const GOALS = ['Maintain weight', 'Weight loss', 'Muscle gain', 'General fitness']

export default function HealthTools() {
  const { user } = useAuth()
  const [activeTool, setActiveTool] = useState('bmi')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const [form, setForm] = useState({
    weight_kg: '',
    height_cm: '',
    age: '',
    gender: 'Male',
    activity_level: 'Moderately active',
    goal: 'General fitness',
  })

  const calculate = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const endpoint = `/api/tools/${activeTool}`
      const { data } = await api.post(endpoint, form)
      setResult(data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Please fill in all required inputs.')
    } finally {
      setLoading(false)
    }
  }

  const needsAge = ['bmr', 'tdee', 'macros'].includes(activeTool)
  const needsGender = ['bmr', 'tdee', 'macros'].includes(activeTool)
  const needsActivity = ['tdee', 'water', 'macros'].includes(activeTool)
  const needsGoal = activeTool === 'macros'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Clinical & Metabolic Calculators"
        description="Calculate metabolic parameters, daily expenditure baselines, and customized hydration requirements."
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {TOOLS.map((t) => {
          const Icon = t.icon
          const isActive = activeTool === t.id
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id)
                setResult(null)
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Input Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={calculate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 70"
                  value={form.weight_kg}
                  onChange={(e) => setForm((p) => ({ ...p, weight_kg: e.target.value }))}
                  required
                />
                <Input
                  label="Height (cm)"
                  type="number"
                  placeholder="e.g., 175"
                  value={form.height_cm}
                  onChange={(e) => setForm((p) => ({ ...p, height_cm: e.target.value }))}
                  required
                />
              </div>

              {needsAge && (
                <Input
                  label="Age"
                  type="number"
                  placeholder="e.g., 28"
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                  required
                />
              )}

              {needsGender && (
                <Select
                  label="Biological Sex"
                  value={form.gender}
                  onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              )}

              {needsActivity && (
                <Select
                  label="Activity Level"
                  value={form.activity_level}
                  onChange={(e) => setForm((p) => ({ ...p, activity_level: e.target.value }))}
                >
                  {ACTIVITY_LEVELS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </Select>
              )}

              {needsGoal && (
                <Select
                  label="Target Fitness Goal"
                  value={form.goal}
                  onChange={(e) => setForm((p) => ({ ...p, goal: e.target.value }))}
                >
                  {GOALS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Calculate {TOOLS.find((t) => t.id === activeTool)?.label}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Box */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm">Computation Output</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {!result ? (
              <div className="text-center py-12 text-slate-400">
                <Calculator className="w-8 h-8 opacity-40 mx-auto mb-2" />
                <p className="text-xs font-medium">Enter values on the left and calculate</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {activeTool === 'bmi' && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Body Mass Index</p>
                    <p className="text-4xl font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1">
                      {result.bmi}
                    </p>
                    <Badge variant="emerald" className="mt-2">
                      {result.category}
                    </Badge>
                  </div>
                )}

                {activeTool === 'bmr' && (
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-center">
                    <p className="text-xs text-orange-800 dark:text-orange-300 font-medium">Basal Metabolic Rate</p>
                    <p className="text-4xl font-bold font-mono text-orange-700 dark:text-orange-300 mt-1">
                      {result.bmr} <span className="text-base font-normal">kcal/day</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2">Energy burned at complete rest</p>
                  </div>
                )}

                {activeTool === 'tdee' && (
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center">
                    <p className="text-xs text-purple-800 dark:text-purple-300 font-medium">Total Daily Energy Expenditure</p>
                    <p className="text-4xl font-bold font-mono text-purple-700 dark:text-purple-300 mt-1">
                      {result.tdee} <span className="text-base font-normal">kcal/day</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2">Maintenance caloric threshold</p>
                  </div>
                )}

                {activeTool === 'water' && (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">Daily Water Target</p>
                    <p className="text-4xl font-bold font-mono text-blue-700 dark:text-blue-300 mt-1">
                      {result.water_l || result.daily_water_liters} <span className="text-base font-normal">Liters</span>
                    </p>
                  </div>
                )}

                {activeTool === 'macros' && (
                  <div className="space-y-3">
                    <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400">Target Calories</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {result.calories} kcal
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/30">
                        <p className="text-blue-700 dark:text-blue-400 font-medium">Protein</p>
                        <p className="font-bold text-sm">{result.protein_g}g</p>
                      </div>
                      <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30">
                        <p className="text-amber-700 dark:text-amber-400 font-medium">Carbs</p>
                        <p className="font-bold text-sm">{result.carbs_g}g</p>
                      </div>
                      <div className="p-2 rounded bg-purple-50 dark:bg-purple-950/30">
                        <p className="text-purple-700 dark:text-purple-400 font-medium">Fats</p>
                        <p className="font-bold text-sm">{result.fat_g}g</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
