import { useState, useEffect } from 'react'
import { User, Edit3, Save, X, Sparkles, Activity, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input, Select } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'

const GOALS = ['General fitness', 'Weight loss', 'Muscle gain', 'Endurance', 'Flexibility']
const ACTIVITIES = ['Sedentary', 'Lightly active', 'Moderately active', 'Very active']
const DIETS = ['No preference', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Eggetarian']

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/api/profile')
      setProfile(data.profile)
      if (data.profile) {
        setForm({
          age: data.profile.age || '',
          gender: data.profile.gender || 'Male',
          height_cm: data.profile.height_cm || '',
          weight_kg: data.profile.weight_kg || '',
          fitness_goal: data.profile.fitness_goal || 'General fitness',
          activity_level: data.profile.activity_level || 'Moderately active',
          dietary_preference: data.profile.dietary_preference || 'No preference',
          sleep_target_hours: data.profile.sleep_target_hours || 8,
          water_target_liters: data.profile.water_target_liters || 2.5,
          workout_duration_min: data.profile.workout_duration_min || 45,
        })
      }
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    setSaving(true)
    try {
      await api.put('/api/profile', form)
      toast.success('Health profile updated')
      setEditing(false)
      loadProfile()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Personal Health Profile"
        description="Your biometric baseline and goals used by the AI coach to customize training, recovery, and meal programs."
        action={
          !editing ? (
            <Button size="sm" variant="secondary" icon={Edit3} onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" icon={Save} loading={saving} onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-bold text-xl flex items-center justify-center mx-auto border border-emerald-500/20">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {user?.full_name || 'Member'}
              </h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <Badge variant="emerald">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AI Personalization</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">Enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biometrics and Goals Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Biometrics & Lifestyle Targets</CardTitle>
          </CardHeader>
          <CardContent>
            {!editing ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Age & Sex</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profile?.age ? `${profile.age} years` : '—'}, {profile?.gender || '—'}
                  </span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Height & Weight</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profile?.height_cm ? `${profile.height_cm} cm` : '—'} · {profile?.weight_kg ? `${profile.weight_kg} kg` : '—'}
                  </span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Primary Goal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {profile?.fitness_goal?.replace('_', ' ') || 'General fitness'}
                  </span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Activity Level</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {profile?.activity_level?.replace('_', ' ') || 'Moderately active'}
                  </span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Dietary Preference</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {profile?.dietary_preference || 'Balanced'}
                  </span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-500">Nightly Sleep Target</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profile?.sleep_target_hours || 8} hours
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Age"
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                  />
                  <Select
                    label="Sex"
                    value={form.gender}
                    onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Height (cm)"
                    type="number"
                    value={form.height_cm}
                    onChange={(e) => setForm((p) => ({ ...p, height_cm: e.target.value }))}
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={(e) => setForm((p) => ({ ...p, weight_kg: e.target.value }))}
                  />
                </div>

                <Select
                  label="Fitness Goal"
                  value={form.fitness_goal}
                  onChange={(e) => setForm((p) => ({ ...p, fitness_goal: e.target.value }))}
                >
                  {GOALS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Activity Level"
                  value={form.activity_level}
                  onChange={(e) => setForm((p) => ({ ...p, activity_level: e.target.value }))}
                >
                  {ACTIVITIES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </Select>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={saving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
