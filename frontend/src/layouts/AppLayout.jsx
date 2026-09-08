import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  Camera,
  Dumbbell,
  Salad,
  CheckSquare,
  TrendingUp,
  Calculator,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/app/chat', icon: MessageSquare, label: 'AI Health Coach', badge: 'AI' },
      { to: '/app/progress', icon: TrendingUp, label: 'Progress & Analytics' },
    ]
  },
  {
    title: 'Daily Tracking',
    items: [
      { to: '/app/food', icon: Camera, label: 'Food Vision & Logs' },
      { to: '/app/habits', icon: CheckSquare, label: 'Habits & Streaks' },
    ]
  },
  {
    title: 'Health Planning',
    items: [
      { to: '/app/workout', icon: Dumbbell, label: 'Workout Planner' },
      { to: '/app/meals', icon: Salad, label: 'Meal Planner' },
      { to: '/app/tools', icon: Calculator, label: 'Health Calculators' },
      { to: '/app/report', icon: FileText, label: 'Weekly Report' },
    ]
  }
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const getCurrentPageTitle = () => {
    const path = location.pathname
    for (const group of NAV_GROUPS) {
      const match = group.items.find(i => i.to === path)
      if (match) return match.label
    }
    if (path.includes('/app/profile')) return 'Health Profile'
    if (path.includes('/app/settings')) return 'Settings'
    return 'HealthMate AI'
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 backdrop-blur-md shrink-0 h-screen sticky top-0 z-30">
        {/* Brand header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <Link to="/app/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              HealthMate <span className="text-emerald-600 font-semibold text-xs px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 ml-0.5">PRO</span>
            </span>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h4 className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                {group.title}
              </h4>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 mb-2">
            <Link to="/app/profile" className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate leading-tight">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'Free Member'}
                </p>
              </div>
            </Link>
            <Link
              to="/app/settings"
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-14 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">HealthMate</span>
              <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{getCurrentPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme switcher */}
            <div className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <button
                onClick={() => setTheme('light')}
                className={`p-1 rounded-md text-xs transition-colors ${
                  theme === 'light' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Light theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1 rounded-md text-xs transition-colors ${
                  theme === 'dark' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Dark theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl flex flex-col z-10">
              <div className="h-14 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                  <span className="font-display font-bold text-sm text-slate-900 dark:text-white">HealthMate AI</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                {NAV_GROUPS.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <h4 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                      {group.title}
                    </h4>
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <Link
                  to="/app/profile"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/app/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
