import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const STEPS = ['Basic Info', 'Fitness Goals', 'Diet & Health', 'Targets']

const FITNESS_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss', emoji: '⚡' },
  { value: 'muscle_gain', label: 'Muscle Gain', emoji: '💪' },
  { value: 'general_fitness', label: 'General Fitness', emoji: '🏃' },
  { value: 'endurance', label: 'Improve Endurance', emoji: '🚴' },
  { value: 'healthy_lifestyle', label: 'Healthy Lifestyle', emoji: '🌱' },
  { value: 'maintain_weight', label: 'Maintain Weight', emoji: '⚖️' },
]

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', desc: '1-3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', desc: '3-5 days/week' },
  { value: 'very_active', label: 'Very Active', desc: '6-7 days/week' },
]

const DIET_PREFS = [
  { value: 'no_preference', label: 'No Preference' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
]

const EQUIPMENT = ['No equipment', 'Dumbbells', 'Barbell', 'Pull-up bar', 'Resistance bands', 'Treadmill', 'Gym access', 'Yoga mat']

const WORKOUT_TYPES = ['Strength training', 'Cardio', 'HIIT', 'Yoga', 'Mixed', 'Calisthenics', 'Swimming']

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    fitness_goal: '',
    activity_level: '',
    dietary_preference: '',
    allergies: [],
    sleep_target_hours: 8,
    water_target_liters: 2.5,
    workout_duration_min: 45,
    available_equipment: [],
    preferred_workout_type: '',
  })

  const [allergyInput, setAllergyInput] = useState('')

  const update = (key, val) => setProfile(p => ({ ...p, [key]: val }))

  const toggleEquipment = (eq) => {
    const current = profile.available_equipment
    if (current.includes(eq)) {
      update('available_equipment', current.filter(e => e !== eq))
    } else {
      update('available_equipment', [...current, eq])
    }
  }

  const addAllergy = () => {
    if (allergyInput.trim() && !profile.allergies.includes(allergyInput.trim())) {
      update('allergies', [...profile.allergies, allergyInput.trim()])
      setAllergyInput('')
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.put('/api/profile', profile)
      toast.success('Profile saved! Welcome to HealthMate AI! 🎉')
      navigate('/app/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    if (step === 0) return profile.age && profile.height_cm && profile.weight_kg
    if (step === 1) return profile.fitness_goal && profile.activity_level
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-health rounded-xl flex items-center justify-center">
              <Heart size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 dark:text-white">HealthMate AI</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Set up your health profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">This helps us personalize your AI coaching experience</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                i < step ? 'bg-primary-600 text-white' :
                i === step ? 'bg-primary-600 text-white shadow-green' :
                'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 sm:w-16 mx-1 transition-all ${i < step ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-6 sm:p-8 shadow-soft">
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-6">{STEPS[step]}</h2>

          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Age *</label>
                  <input className="input" type="number" min="10" max="120" placeholder="e.g. 25"
                    value={profile.age} onChange={e => update('age', e.target.value)} />
                </div>
                <div>
                  <label className="label">Gender (optional)</label>
                  <select className="select" value={profile.gender} onChange={e => update('gender', e.target.value)}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Height (cm) *</label>
                  <input className="input" type="number" min="50" max="300" placeholder="e.g. 175"
                    value={profile.height_cm} onChange={e => update('height_cm', e.target.value)} />
                </div>
                <div>
                  <label className="label">Weight (kg) *</label>
                  <input className="input" type="number" min="20" max="500" step="0.1" placeholder="e.g. 70"
                    value={profile.weight_kg} onChange={e => update('weight_kg', e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">* Required. Used only to personalize your coaching.</p>
            </div>
          )}

          {/* Step 1: Fitness Goals */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="label mb-3">What's your primary fitness goal? *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FITNESS_GOALS.map(({ value, label, emoji }) => (
                    <button key={value} type="button"
                      onClick={() => update('fitness_goal', value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        profile.fitness_goal === value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{emoji}</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label mb-3">Activity level *</label>
                <div className="space-y-2">
                  {ACTIVITY_LEVELS.map(({ value, label, desc }) => (
                    <button key={value} type="button"
                      onClick={() => update('activity_level', value)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                        profile.activity_level === value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white">{label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                      </div>
                      {profile.activity_level === value && <Check size={16} className="text-primary-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Diet & Health */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="label mb-3">Dietary preference</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DIET_PREFS.map(({ value, label }) => (
                    <button key={value} type="button"
                      onClick={() => update('dietary_preference', value)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        profile.dietary_preference === value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Food allergies / intolerances</label>
                <div className="flex gap-2 mb-2">
                  <input className="input flex-1" placeholder="e.g. nuts, dairy, gluten" value={allergyInput}
                    onChange={e => setAllergyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAllergy())} />
                  <button type="button" onClick={addAllergy} className="btn btn-secondary btn-md">Add</button>
                </div>
                {profile.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map(a => (
                      <span key={a} className="badge badge-green gap-1">
                        {a}
                        <button type="button" onClick={() => update('allergies', profile.allergies.filter(x => x !== a))} className="ml-1 text-primary-500 hover:text-primary-700">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="label mb-3">Available equipment</label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT.map(eq => (
                    <button key={eq} type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        profile.available_equipment.includes(eq)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-300'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label mb-3">Preferred workout type</label>
                <div className="flex flex-wrap gap-2">
                  {WORKOUT_TYPES.map(wt => (
                    <button key={wt} type="button"
                      onClick={() => update('preferred_workout_type', wt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        profile.preferred_workout_type === wt
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-300'
                      }`}
                    >
                      {wt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Targets */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="label">Daily sleep target: <span className="text-primary-600 font-bold">{profile.sleep_target_hours} hours</span></label>
                <input type="range" min="4" max="12" step="0.5" value={profile.sleep_target_hours}
                  onChange={e => update('sleep_target_hours', parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full accent-primary-600 cursor-pointer" />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>4h</span><span>12h</span></div>
              </div>

              <div>
                <label className="label">Daily water target: <span className="text-primary-600 font-bold">{profile.water_target_liters} L</span></label>
                <input type="range" min="1" max="5" step="0.25" value={profile.water_target_liters}
                  onChange={e => update('water_target_liters', parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full accent-primary-600 cursor-pointer" />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1L</span><span>5L</span></div>
              </div>

              <div>
                <label className="label">Preferred workout duration: <span className="text-primary-600 font-bold">{profile.workout_duration_min} min</span></label>
                <input type="range" min="10" max="120" step="5" value={profile.workout_duration_min}
                  onChange={e => update('workout_duration_min', parseInt(e.target.value))}
                  className="w-full h-2 rounded-full accent-primary-600 cursor-pointer" />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>10 min</span><span>120 min</span></div>
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4">
                <p className="text-sm text-primary-700 dark:text-primary-300 font-medium mb-1">You're all set!</p>
                <p className="text-xs text-primary-600 dark:text-primary-400">Your AI health coach will use this profile to provide personalized guidance. You can update these settings anytime.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className={`btn btn-ghost btn-md gap-2 ${step === 0 ? 'invisible' : ''}`}
            >
              <ChevronLeft size={16} /> Back
            </button>

            <div className="flex items-center gap-2">
              {step < STEPS.length - 1 && (
                <button type="button" onClick={() => setStep(s => s + 1)}
                  disabled={!isStepValid()}
                  className="btn btn-ghost btn-md text-slate-500">
                  Skip
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={() => setStep(s => s + 1)}
                  disabled={!isStepValid()}
                  className="btn btn-primary btn-md">
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading}
                  className="btn btn-primary btn-md">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save & Start'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
