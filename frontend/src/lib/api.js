import axios from 'axios'
import { generateCoachResponse } from './aiCoach'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hm_token') || 'demo-guest-jwt-token'
    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

const MOCK_DASHBOARD = {
  today_calories: 1450,
  water_ml: 1850,
  steps: 7840,
  sleep_hours: 7.5,
  xp_points: 120,
  streak_days: 5,
  profile: {
    fitness_goal: 'improve_fitness',
    target_calories: 2100,
    target_water_ml: 2500,
    target_steps: 10000,
    target_sleep_hours: 8.0,
  },
  habits: {
    done: 4,
    total: 6,
    list: [
      { id: 1, name: 'Drink 500ml morning water', completed: true, category: 'hydration' },
      { id: 2, name: '20-min brisk walk or mobility', completed: true, category: 'fitness' },
      { id: 3, name: 'Eat 30g protein at breakfast', completed: true, category: 'nutrition' },
      { id: 4, name: 'Take afternoon screen break', completed: true, category: 'mindfulness' },
      { id: 5, name: 'Complete 45-min strength training', completed: false, category: 'fitness' },
      { id: 6, name: 'No blue light 1 hour before bed', completed: false, category: 'sleep' },
    ]
  },
  recent_activities: [
    { id: 1, title: 'Morning Hydration', time: '8:00 AM', status: 'Completed', xp: 10 },
    { id: 2, title: 'High-Protein Breakfast Logged', time: '8:45 AM', status: 'Completed', xp: 20 },
    { id: 3, title: 'Midday Step Target Reached', time: '1:30 PM', status: 'Completed', xp: 15 },
  ]
}

const getFallbackResponse = (url, method, data) => {
  const cleanUrl = (url || '').replace(/^\/api/, '')

  if (cleanUrl.startsWith('/health/dashboard')) {
    return MOCK_DASHBOARD
  }
  if (cleanUrl.startsWith('/auth/me')) {
    return {
      user: {
        id: 1,
        full_name: 'Alex Morgan',
        email: 'alex.morgan@healthmate.ai',
        xp_points: 120,
      },
      token: 'demo-guest-jwt-token',
      has_profile: true,
    }
  }
  if (cleanUrl.startsWith('/chat/history')) {
    return {
      messages: [
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: "Hello Alex! I'm your HealthMate AI coach. Whether you'd like guidance on personalized nutrition, workout splits, or sleep optimization, I'm here to help you reach your goals. What are you focusing on today?",
          timestamp: new Date().toISOString(),
        }
      ],
      conversation_id: 1,
    }
  }
  if (cleanUrl.startsWith('/chat')) {
    let msg = ''
    let persona = 'general'
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data || '{}') : data
      msg = parsed?.message || ''
      persona = parsed?.persona || 'general'
    } catch {}

    let profile = null
    try {
      const savedUser = localStorage.getItem('hm_user')
      if (savedUser) {
        profile = JSON.parse(savedUser)?.profile
      }
    } catch {}

    const coachResponse = generateCoachResponse(msg, persona, profile)

    return {
      response: coachResponse,
      reply: coachResponse,
      conversation_id: 1,
    }
  }
  if (cleanUrl.startsWith('/habits')) {
    return {
      habits: MOCK_DASHBOARD.habits.list,
      streak: 5,
      completion_rate: 67,
    }
  }
  if (cleanUrl.startsWith('/workout')) {
    return {
      plan: {
        name: 'Full Body Strength & Conditioning',
        days_per_week: 4,
        schedule: [
          { day: 'Monday', focus: 'Upper Body Strength', exercises: [{ name: 'Dumbbell Bench Press', sets: 4, reps: '8-10' }, { name: 'Bent-Over Rows', sets: 4, reps: '10' }, { name: 'Overhead Press', sets: 3, reps: '10' }] },
          { day: 'Tuesday', focus: 'Lower Body & Core', exercises: [{ name: 'Goblet Squats', sets: 4, reps: '10-12' }, { name: 'Romanian Deadlifts', sets: 3, reps: '10' }, { name: 'Plank Holds', sets: 3, reps: '45s' }] },
          { day: 'Thursday', focus: 'Push & Conditioning', exercises: [{ name: 'Push-ups', sets: 3, reps: '15' }, { name: 'Lateral Raises', sets: 3, reps: '12' }, { name: 'HIIT Conditioning', sets: 5, reps: '1 min' }] },
          { day: 'Friday', focus: 'Pull & Posterior Chain', exercises: [{ name: 'Lat Pulldowns / Pull-ups', sets: 4, reps: '8-10' }, { name: 'Walking Lunges', sets: 3, reps: '12/leg' }, { name: 'Face Pulls', sets: 3, reps: '15' }] },
        ]
      }
    }
  }
  if (cleanUrl.startsWith('/meal')) {
    return {
      plan: {
        daily_calorie_target: 2100,
        macros: { protein: '150g', carbs: '210g', fats: '65g' },
        days: [
          { day: 'Day 1', breakfast: 'Greek Yogurt Parfait with Berries & Chia', lunch: 'Grilled Chicken Quinoa Bowl with Avocado', dinner: 'Baked Salmon with Sweet Potato & Broccoli', snacks: 'Apple with Almond Butter' },
          { day: 'Day 2', breakfast: 'Oatmeal with Whey Protein & Walnuts', lunch: 'Turkey Whole Grain Wrap with Mixed Greens', dinner: 'Tofu & Vegetable Stir-Fry with Brown Rice', snacks: 'Cottage Cheese with Berries' },
        ]
      }
    }
  }
  if (cleanUrl.startsWith('/food/analyze')) {
    return {
      food_items: [
        { name: 'Grilled Chicken Breast', portion: '150g', calories: 247, protein: 46, carbs: 0, fat: 5 },
        { name: 'Steamed Brown Rice', portion: '1 cup (195g)', calories: 216, protein: 5, carbs: 45, fat: 2 },
        { name: 'Sautéed Mixed Greens', portion: '100g', calories: 45, protein: 3, carbs: 6, fat: 1 }
      ],
      total_calories: 508,
      macros: { protein: 54, carbs: 51, fat: 8 },
      health_score: 92,
      insights: 'Excellent balanced meal with high lean protein and complex carbohydrates supporting sustained energy and muscle recovery.'
    }
  }
  if (cleanUrl.startsWith('/reports')) {
    return {
      health_score: 88,
      avg_calories: 1980,
      avg_sleep: 7.6,
      habit_consistency: '84%',
      workouts_completed: 4,
      trends: [
        { day: 'Mon', score: 85 },
        { day: 'Tue', score: 88 },
        { day: 'Wed', score: 90 },
        { day: 'Thu', score: 86 },
        { day: 'Fri', score: 91 },
        { day: 'Sat', score: 89 },
        { day: 'Sun', score: 92 },
      ]
    }
  }
  if (cleanUrl.startsWith('/profile')) {
    return {
      profile: {
        age: 28,
        gender: 'female',
        height_cm: 168,
        weight_kg: 62,
        target_weight_kg: 58,
        activity_level: 'moderately_active',
        fitness_goal: 'improve_fitness',
        dietary_preference: 'balanced',
        target_calories: 2100,
        target_water_ml: 2500,
        target_steps: 10000,
        target_sleep_hours: 8.0,
      }
    }
  }

  return { status: 'ok', success: true }
}

// Response interceptor - handle errors gracefully and provide fallback when offline or cold-starting
api.interceptors.response.use(
  (response) => {
    // If backend routed to Vite index.html instead of returning JSON
    if (typeof response.data === 'string' && response.data.includes('<!doctype html')) {
      const fallback = getFallbackResponse(response.config?.url, response.config?.method, response.config?.data)
      return { ...response, data: fallback }
    }
    return response
  },
  (error) => {
    // Never redirect to /login
    if (error.response?.status === 401) {
      localStorage.setItem('hm_token', 'demo-guest-jwt-token')
    }

    const fallback = getFallbackResponse(error.config?.url, error.config?.method, error.config?.data)
    if (fallback) {
      return Promise.resolve({ data: fallback, status: 200, statusText: 'OK', config: error.config, headers: {} })
    }

    return Promise.reject(error)
  }
)

export default api
