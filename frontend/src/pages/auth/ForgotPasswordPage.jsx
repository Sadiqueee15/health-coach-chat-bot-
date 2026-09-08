import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, ArrowRight, CheckCircle } from 'lucide-react'
import api from '../../lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [demoToken, setDemoToken] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email })
      setSent(true)
      if (data.demo_token) {
        setDemoToken(data.demo_token)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-health rounded-2xl flex items-center justify-center shadow-green">
              <Heart size={20} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Reset your password</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter your email and we'll send a reset link</p>
        </div>

        <div className="card p-8 shadow-soft">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Check your email</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                If an account exists for {email}, a password reset link has been sent.
              </p>
              {demoToken && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Demo Mode: Reset Token</p>
                  <Link to={`/reset-password?token=${demoToken}`} className="text-xs text-primary-600 hover:underline break-all">
                    Click here to reset password (demo only — remove in production)
                  </Link>
                </div>
              )}
              <Link to="/login" className="btn btn-primary btn-md w-full">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="you@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Reset Link <ArrowRight size={18} /></>}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          <Link to="/login" className="text-primary-600 hover:underline">← Back to login</Link>
        </p>
      </div>
    </div>
  )
}
