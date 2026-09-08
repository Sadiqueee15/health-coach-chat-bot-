import { Link } from 'react-router-dom'
import {
  Heart,
  Brain,
  Dumbbell,
  Apple,
  Moon,
  Droplets,
  CheckCircle2,
  Shield,
  Zap,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Sparkles,
  Camera,
  Check
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent } from '../components/ui/Card'

const CORE_CAPABILITIES = [
  {
    icon: MessageSquare,
    title: 'Adaptive AI Health Coaching',
    desc: 'Context-aware guidance powered by Google Gemini, aligned with your specific biometric targets, dietary goals, and training experience.'
  },
  {
    icon: Camera,
    title: 'Vision-Based Nutrition Logger',
    desc: 'Instant meal detection and macronutrient estimation from dish photographs, reducing logging friction to seconds.'
  },
  {
    icon: Dumbbell,
    title: 'Customized Training Routines',
    desc: 'Progression-focused workout routines generated based on your available equipment, split preference, and weekly schedule.'
  },
  {
    icon: Apple,
    title: 'Nutrient-Dense Meal Schedules',
    desc: 'Structured 7-day meal plans with macro breakdowns, ingredient lists, and strict allergy filtering.'
  },
  {
    icon: BarChart3,
    title: 'Long-Term Health Analytics',
    desc: 'Interactive visual tracking of weight fluctuations, habit compliance, sleep patterns, and weekly synthesis scores.'
  },
  {
    icon: Shield,
    title: 'Privacy-First Architecture',
    desc: 'Your health records and conversation memory are kept secure, private, and fully under your direct control.'
  },
]

const FAQS = [
  {
    q: 'What is HealthMate AI?',
    a: 'HealthMate AI is an intelligent wellness and health coaching platform. It integrates daily tracking, vision-based food logging, workout generation, and conversational guidance to help you maintain consistency.'
  },
  {
    q: 'Is HealthMate AI a replacement for a doctor or medical professional?',
    a: 'No. HealthMate AI is an informational wellness tool designed for habit building and exercise/meal planning. It does not provide medical diagnoses, treatment plans, or emergency services. Always consult a licensed medical provider for clinical decisions.'
  },
  {
    q: 'How does the AI personalize my training and meal plans?',
    a: 'During setup, you define your age, biometrics, fitness targets, dietary preferences, and allergies. The AI uses this context to construct targeted routines and recommendations.'
  },
  {
    q: 'Can I export or delete my data at any time?',
    a: 'Yes. You have complete control over your health profile, chat logs, and account data, with one-click export and deletion options in Settings.'
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              HealthMate <span className="text-emerald-600">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Wellness & Nutrition Engineering</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Evidence-based health habits, workout planning, and nutrition intelligence.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          HealthMate brings together multimodal food vision, personalized fitness programming, and intelligent coaching into a unified daily health operating system.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-6 font-semibold" icon={ArrowRight}>
              Start Your Free Account
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-6">
              Sign In to Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Pill Row */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Vision Meal Recognition</span>
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Adaptive Workout Generator</span>
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 7-Day Macro Nutrition Planning</span>
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Clinical Metric Calculators</span>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section className="py-16 px-4 bg-slate-50/70 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Engineered for sustained health consistency
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              A comprehensive toolset designed to remove guesswork from training, nutrition, and daily recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORE_CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon
              return (
                <Card key={i} className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {cap.desc}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Frequently Asked Questions
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Transparent answers about our technology and medical disclosures.
          </p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {FAQS.map((faq, i) => (
            <div key={i} className="py-4 space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {faq.q}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-8 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-600" />
            <span>© {new Date().getFullYear()} HealthMate AI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/login" className="hover:underline">Sign In</Link>
            <Link to="/register" className="hover:underline">Create Account</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
