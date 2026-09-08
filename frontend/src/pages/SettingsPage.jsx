import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Moon,
  Sun,
  Trash2,
  Download,
  LogOut,
  Save,
  AlertTriangle,
  Lock,
  User,
  ShieldAlert,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const [nameForm, setNameForm] = useState({ full_name: user?.full_name || '' })
  const [passForm, setPassForm] = useState({ old_password: '', password: '', confirm: '' })
  const [prefs, setPrefs] = useState({ ai_response_style: 'balanced', notifications_enabled: true })
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [loading, setLoading] = useState({ name: false, pass: false, prefs: false, delete: false })

  useEffect(() => {
    loadPrefs()
  }, [])

  const loadPrefs = async () => {
    try {
      const { data } = await api.get('/api/memory/preferences')
      if (data?.preferences) setPrefs(data.preferences)
    } catch {}
  }

  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }))

  const saveName = async (e) => {
    e.preventDefault()
    setLoad('name', true)
    try {
      const { data } = await api.put('/api/memory/account/update', nameForm)
      updateUser(data.user)
      toast.success('Account profile updated')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update name')
    } finally {
      setLoad('name', false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (passForm.password !== passForm.confirm) {
      return toast.error('Passwords do not match')
    }
    setLoad('pass', true)
    try {
      await api.put('/api/auth/password', {
        old_password: passForm.old_password,
        password: passForm.password,
      })
      toast.success('Password updated successfully')
      setPassForm({ old_password: '', password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setLoad('pass', false)
    }
  }

  const savePrefs = async () => {
    setLoad('prefs', true)
    try {
      await api.put('/api/memory/preferences', prefs)
      toast.success('Preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setLoad('prefs', false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      return toast.error('Please type DELETE to confirm')
    }
    setLoad('delete', true)
    try {
      await api.delete('/api/memory/account')
      logout()
      navigate('/register')
      toast.success('Account deleted successfully')
    } catch {
      toast.error('Failed to delete account')
    } finally {
      setLoad('delete', false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Account & System Settings"
        description="Manage your account credentials, coaching preferences, and data privacy options."
      />

      <div className="space-y-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveName} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={nameForm.full_name}
                  onChange={(e) => setNameForm({ full_name: e.target.value })}
                  required
                />
                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  helperText="Email cannot be changed directly."
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" loading={loading.name}>
                  Save Details
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* AI Coaching Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">AI Coach Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Response Tone & Detail"
              value={prefs.ai_response_style}
              onChange={(e) => setPrefs((p) => ({ ...p, ai_response_style: e.target.value }))}
              helperText="Determines how detailed and analytical the coach's replies will be."
            >
              <option value="concise">Concise & Direct (Quick Action Items)</option>
              <option value="balanced">Balanced (Explanations + Key Steps)</option>
              <option value="detailed">Detailed & Educational (Deep Scientific Context)</option>
            </Select>

            <div className="flex justify-end">
              <Button size="sm" loading={loading.prefs} onClick={savePrefs}>
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security / Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Security & Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passForm.old_password}
                onChange={(e) => setPassForm((p) => ({ ...p, old_password: e.target.value }))}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={passForm.password}
                  onChange={(e) => setPassForm((p) => ({ ...p, password: e.target.value }))}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passForm.confirm}
                  onChange={(e) => setPassForm((p) => ({ ...p, confirm: e.target.value }))}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" variant="secondary" loading={loading.pass}>
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-950 bg-red-50/20 dark:bg-red-950/10">
          <CardHeader className="border-red-100 dark:border-red-950">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <CardTitle className="text-sm text-red-700 dark:text-red-400">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Permanently delete your user profile, workout routines, meal plans, chat history, and biometric records. This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder='Type "DELETE" to confirm'
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="input text-xs max-w-xs"
              />
              <Button
                variant="danger"
                size="sm"
                disabled={deleteConfirm !== 'DELETE'}
                loading={loading.delete}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
