import { useState } from 'react'
import {
  Sparkles,
  RefreshCw,
  Save,
  Clock,
  Utensils,
  Plus,
  X,
  AlertCircle,
  Flame
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Input'

const GOALS = ['Healthy eating', 'Weight loss', 'Muscle gain', 'Balanced diet', 'High energy']
const DIET_PREFS = ['No preference', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Eggetarian']
const BUDGETS = ['Budget-friendly', 'Moderate', 'Premium']
const CUISINES = ['Any', 'Indian', 'Mediterranean', 'Asian', 'Western', 'Middle Eastern']

function MealCard({ meal }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" className="uppercase font-semibold text-[10px]">
            {meal.meal_type || 'Meal'}
          </Badge>
          <CardTitle className="text-sm font-semibold">{meal.name}</CardTitle>
        </div>
        {meal.time && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Clock className="w-3 h-3" /> {meal.time}
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-3">
        {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Ingredients
            </p>
            <div className="flex flex-wrap gap-1.5">
              {meal.ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {meal.instructions && (
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            {meal.instructions}
          </p>
        )}

        {meal.nutrition && (
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <div>
              <p className="text-[10px] text-slate-400">Calories</p>
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                {meal.nutrition.calories} <span className="text-[10px] font-normal">kcal</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Protein</p>
              <p className="font-semibold text-xs text-blue-600 dark:text-blue-400">
                {meal.nutrition.protein_g}g
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Carbs</p>
              <p className="font-semibold text-xs text-amber-600 dark:text-amber-400">
                {meal.nutrition.carbs_g}g
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Fat</p>
              <p className="font-semibold text-xs text-purple-600 dark:text-purple-400">
                {meal.nutrition.fat_g}g
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function MealPlanner() {
  const [form, setForm] = useState({
    goal: 'Healthy eating',
    dietary_preference: 'No preference',
    allergies: [],
    num_meals: 3,
    budget: 'Moderate',
    cuisine: 'Any',
  })
  const [allergyInput, setAllergyInput] = useState('')
  const [plan, setPlan] = useState(null)
  const [planId, setPlanId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const addAllergy = (e) => {
    e?.preventDefault()
    const val = allergyInput.trim()
    if (val && !form.allergies.includes(val)) {
      setForm((p) => ({ ...p, allergies: [...p.allergies, val] }))
      setAllergyInput('')
    }
  }

  const removeAllergy = (a) => {
    setForm((p) => ({ ...p, allergies: p.allergies.filter((x) => x !== a) }))
  }

  const generate = async () => {
    setLoading(true)
    setPlan(null)
    setSaved(false)
    try {
      const { data } = await api.post('/api/meal/generate', form)
      setPlan(data.plan)
      setPlanId(data.meal_plan?.id)
      toast.success('Nutritional meal plan created!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate meal plan.')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    try {
      await api.put(`/api/meal/plans/${planId}/save`)
      setSaved(true)
      toast.success('Meal plan saved to profile!')
    } catch {
      toast.error('Failed to save meal plan')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Personalized Meal & Nutrition Planner"
        description="Craft nutrient-balanced meal schedules tailored to dietary restrictions, calorie targets, and taste preferences."
        badge={<Badge variant="neutral">Weekly Schedule</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Nutrition & Dietary Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Nutritional Focus"
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
              label="Dietary Pattern"
              value={form.dietary_preference}
              onChange={(e) => setForm((p) => ({ ...p, dietary_preference: e.target.value }))}
            >
              {DIET_PREFS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>

            <Select
              label="Cuisine Preference"
              value={form.cuisine}
              onChange={(e) => setForm((p) => ({ ...p, cuisine: e.target.value }))}
            >
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <Select
              label="Budget Scope"
              value={form.budget}
              onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
            >
              {BUDGETS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="label">Allergies & Dietary Exclusions</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAllergy(e)}
                placeholder="e.g., Peanuts, Dairy, Shellfish, Gluten"
                className="input text-xs"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addAllergy}>
                Add
              </Button>
            </div>
            {form.allergies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.allergies.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40"
                  >
                    {a}
                    <button type="button" onClick={() => removeAllergy(a)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button onClick={generate} loading={loading} className="w-full" icon={Sparkles}>
            {loading ? 'Synthesizing Nutrient Plan...' : 'Generate Daily Meal Plan'}
          </Button>
        </CardContent>
      </Card>

      {/* Plan Results */}
      {plan && (
        <div className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{plan.title || 'Personalized Meal Schedule'}</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{plan.overview}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={RefreshCw} onClick={generate}>
                  Regenerate
                </Button>
                {!saved && planId && (
                  <Button size="sm" icon={Save} onClick={save}>
                    Save Plan
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(plan.meals || []).map((meal, i) => (
              <MealCard key={i} meal={meal} />
            ))}
          </div>

          {plan.grocery_list?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recommended Grocery Staples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {plan.grocery_list.map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
