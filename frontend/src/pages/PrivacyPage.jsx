import { Link } from 'react-router-dom'
import { Shield, Lock, Eye, Trash2, Heart, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-health rounded-xl flex items-center justify-center">
            <Heart size={18} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-8 text-slate-700 dark:text-slate-300">
          {[
            {
              icon: Eye,
              title: 'What Information We Collect',
              content: [
                'Account information: your full name and email address for authentication.',
                'Health profile: age, gender, height, weight, fitness goals, dietary preferences, and activity level that you voluntarily provide to personalize coaching.',
                'Conversation history: messages between you and the AI coach for context and continuity.',
                'Usage data: habit completions, journal entries, food logs, and health metrics you choose to log.',
                'We do not collect payment information, government IDs, or sensitive medical records.',
              ]
            },
            {
              icon: Lock,
              title: 'How We Use Your Data',
              content: [
                'Personalize AI health coaching responses based on your profile.',
                'Maintain conversation history so your AI coach remembers context.',
                'Generate weekly health reports and progress analytics.',
                'Track habit streaks and award achievements.',
                'We do NOT sell your data to third parties.',
                'We do NOT share your health data with advertisers.',
                'AI conversations may be processed by Google\'s Gemini API to generate responses.',
              ]
            },
            {
              icon: Shield,
              title: 'How We Protect Your Data',
              content: [
                'Passwords are hashed using bcrypt — we never store plain text passwords.',
                'Authentication uses JSON Web Tokens (JWT) with expiry.',
                'All API requests require authentication — users cannot access other users\' data.',
                'Health profile data is associated only with your account.',
                'The Gemini API key is stored securely on the server and never exposed to clients.',
              ]
            },
            {
              icon: Trash2,
              title: 'Your Data Rights',
              content: [
                'Delete conversations: Settings → Clear Conversations.',
                'Delete your health profile: Profile → Edit Profile.',
                'Delete your account and all associated data: Settings → Delete Account.',
                'All deletions are permanent and cannot be reversed.',
                'You can edit your health profile at any time from the Profile page.',
              ]
            },
          ].map(({ icon: Icon, title, content }) => (
            <div key={title}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">{title}</h2>
              </div>
              <ul className="space-y-2 ml-11">
                {content.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <h2 className="font-display font-bold text-amber-800 dark:text-amber-400 mb-3">⚕️ Medical Disclaimer</h2>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              HealthMate AI is a wellness coaching assistant and is NOT a medical device, clinical tool, or substitute for professional healthcare. It cannot diagnose diseases, prescribe medications, or replace consultation with qualified healthcare professionals. For medical emergencies, contact emergency services immediately. Always consult a qualified healthcare professional before making significant changes to your diet, exercise routine, or health regimen.
            </p>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Questions about your privacy? Contact us through the app. This privacy policy applies to the HealthMate AI web application.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
