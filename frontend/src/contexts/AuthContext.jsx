import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

export const DEFAULT_USER = {
  id: 1,
  full_name: 'Alex Morgan',
  email: 'alex.morgan@healthmate.ai',
  created_at: new Date().toISOString(),
  profile: {
    age: 28,
    gender: 'female',
    height_cm: 168,
    weight_kg: 62,
    target_weight_kg: 58,
    activity_level: 'moderately_active',
    fitness_goal: 'improve_fitness',
    dietary_preference: 'balanced',
    allergies: [],
    medical_conditions: [],
    target_calories: 2100,
    target_water_ml: 2500,
    target_steps: 10000,
    target_sleep_hours: 8.0,
  },
  preferences: {
    theme: 'light',
    measurement_system: 'metric',
    notifications_enabled: true,
  },
  has_profile: true,
  xp_points: 120,
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('hm_user')
      if (savedUser) return JSON.parse(savedUser)
    } catch {}
    return DEFAULT_USER
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('hm_token')) {
      localStorage.setItem('hm_token', 'demo-guest-jwt-token')
    }
    if (!localStorage.getItem('hm_user')) {
      localStorage.setItem('hm_user', JSON.stringify(DEFAULT_USER))
    }

    // Attempt to sync with backend /api/auth/me if available
    api.get('/api/auth/me')
      .then(({ data }) => {
        if (data?.user) {
          setUser((prev) => ({ ...prev, ...data.user, has_profile: true }))
          localStorage.setItem('hm_user', JSON.stringify({ ...data.user, has_profile: true }))
          if (data?.token) {
            localStorage.setItem('hm_token', data.token)
          }
        }
      })
      .catch(() => {
        // Safe fallback - keep rich default user
      })
  }, [])

  const login = (userData, token) => {
    const active = { ...DEFAULT_USER, ...userData, has_profile: true }
    localStorage.setItem('hm_token', token || 'demo-guest-jwt-token')
    localStorage.setItem('hm_user', JSON.stringify(active))
    setUser(active)
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {}
    localStorage.setItem('hm_token', 'demo-guest-jwt-token')
    localStorage.setItem('hm_user', JSON.stringify(DEFAULT_USER))
    setUser(DEFAULT_USER)
  }

  const updateUser = (userData) => {
    const updated = { ...user, ...userData }
    localStorage.setItem('hm_user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
