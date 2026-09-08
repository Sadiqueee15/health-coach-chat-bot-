import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Heart, ArrowRight, CheckCircle } from 'lucide-react'
import api from '../../lib/api'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [form, setForm] = useState({ new_password: '', confirm_password: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/reset-password', { token, ...form })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-gradient-health rounded-2xl flex items-center justify-center shadow-green mx-auto mb-4">
            <Heart size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Set new password</h1>
        </div>

        <div className="card p-8 shadow-soft">
          {success ? (
            <div className="text-center">
              <CheckCircle size={48} className="text-primary-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Password reset!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>}
              {!token && <p className="text-sm text-amber-600 dark:text-amber-400">Invalid or missing reset token.</p>}
              <div>
                <label className="label">New Password</label>
                <input className="input" type="password" value={form.new_password}
                  onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input className="input" type="password" value={form.confirm_password}
                  onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))} required />
              </div>
              <button type="submit" disabled={loading || !token} className="btn btn-primary btn-lg w-full">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
