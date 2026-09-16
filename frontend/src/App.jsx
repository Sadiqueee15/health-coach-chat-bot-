import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Pages
import LandingPage from './pages/LandingPage'
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
            {/* Public Landing & Policy */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Bypassed Auth Routes: Immediately redirect straight to Dashboard */}
            <Route path="/login" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/reset-password" element={<Navigate to="/app/dashboard" replace />} />

            {/* Profile Setup */}
            <Route path="/profile-setup" element={<ProfileSetupPage />} />

            {/* Application Routes - Directly Accessible Without Login Wall */}
            <Route path="/app" element={<AppLayout />}>
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

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
