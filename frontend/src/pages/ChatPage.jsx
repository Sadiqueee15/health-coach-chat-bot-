import { useState, useEffect, useRef } from 'react'
import {
  Send,
  Plus,
  RefreshCw,
  Copy,
  Trash2,
  Heart,
  Bot,
  User,
  Sparkles,
  Paperclip,
  Check,
  ChevronDown,
  AlertCircle
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

const COACH_PERSONAS = [
  { id: 'general', label: 'Holistic Health Coach', desc: 'General fitness, habits, and daily lifestyle' },
  { id: 'nutrition', label: 'Clinical Nutritionist', desc: 'Meal composition, macros, and diet planning' },
  { id: 'fitness', label: 'Strength & Conditioning', desc: 'Exercise programming, form, and recovery' },
  { id: 'sleep', label: 'Sleep & Recovery Specialist', desc: 'Sleep hygiene, circadian rhythm, and stress' },
]

const SUGGESTED_PROMPTS = [
  'Create a 30-minute full body dumbbell workout routine',
  'How should I structure my protein intake for muscle recovery?',
  'What are evidence-based habits for improving deep sleep?',
  'Suggest a quick 500-calorie high-protein vegetarian lunch',
]

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState('general')
  const [copiedIndex, setCopiedIndex] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadChatHistory()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const loadChatHistory = async () => {
    try {
      const { data } = await api.get('/api/chat/history')
      if (Array.isArray(data?.messages)) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.error('Chat history error:', err)
    }
  }

  const handleSend = async (e) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/api/chat', {
        message: trimmed,
        persona: selectedPersona
      })

      const aiReply = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.reply || data.message || "I've processed your request. How else can I assist with your health goals?",
        timestamp: new Date().toISOString()
      }
      setMessages((prev) => [...prev, aiReply])
    } catch (err) {
      console.error('Chat error:', err)
      toast.error('Failed to receive AI response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear your current conversation history?')) return
    try {
      await api.delete('/api/chat/history')
      setMessages([])
      toast.success('Chat history cleared')
    } catch (err) {
      toast.error('Failed to clear chat')
    }
  }

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col max-w-5xl mx-auto">
      {/* Top Coach Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                AI Health & Wellness Coach
              </h2>
              <Badge variant="emerald">Gemini AI</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized guidance aligned with your health profile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Persona selector */}
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value)}
            className="input !h-8 text-xs py-0 px-2.5 w-auto cursor-pointer"
          >
            {COACH_PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={handleClearChat}
              className="text-xs !h-8"
              title="Clear conversation"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              How can I help you today?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Ask any question about nutrition, exercise routines, habit building, or sleep recovery.
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(prompt)
                  }}
                  className="p-3 text-xs text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user'
            return (
              <div
                key={idx}
                className={`flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-semibold ${
                    isUser
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`px-4 py-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose-healthmate">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-1">
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {loading && (
          <div className="flex gap-3.5 max-w-3xl mr-auto">
            <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-xs flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse delay-75" />
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask your ${COACH_PERSONAS.find((p) => p.id === selectedPersona)?.label.toLowerCase()}...`}
            className="input !pr-20 !h-11 text-sm bg-white dark:bg-slate-900"
            disabled={loading}
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || loading}
              className="!h-8 !px-3"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
        <p className="text-[11px] text-slate-400 text-center mt-2">
          HealthMate provides wellness coaching and general health information. For medical diagnoses or emergencies, always consult a licensed doctor.
        </p>
      </div>
    </div>
  )
}
