import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import ProfileSetupPage from './pages/ProfileSetupPage'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/ChatPage'
import FoodAnalyzer from './pages/FoodAnalyzer'
import WorkoutPlanner from './pages/WorkoutPlanner'
import MealPlanner from './pages/MealPlanner'
import HabitsPage from './pages/HabitsPage'
import ProgressPage from './pages/ProgressPage'
import HealthTools from './pages/HealthTools'
import WeeklyReport from './pages/WeeklyReport'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import PrivacyPage from './pages/PrivacyPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading HealthMate AI...</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/app/dashboard" replace /> : children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Profile Setup */}
            <Route path="/profile-setup" element={<PrivateRoute><ProfileSetupPage /></PrivateRoute>} />

            {/* Protected App Routes */}
            <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="chat/:id" element={<ChatPage />} />
              <Route path="food" element={<FoodAnalyzer />} />
              <Route path="workout" element={<WorkoutPlanner />} />
              <Route path="meals" element={<MealPlanner />} />
              <Route path="habits" element={<HabitsPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="tools" element={<HealthTools />} />
              <Route path="report" element={<WeeklyReport />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
