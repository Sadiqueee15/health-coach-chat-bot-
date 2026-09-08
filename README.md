# HealthMate AI — Personal AI Health & Wellness Coach

> A complete, production-style AI-powered health and wellness coaching web application built with React + Flask + Google Gemini AI.

---

## 🌟 Features

### Core AI Features
- **AI Health Coach Chat** — Natural language conversations with Google Gemini AI, personalized to your health profile
- **Food Image Analyzer** — Upload food photos for AI-powered nutritional analysis (Gemini Vision)
- **Workout Generator** — AI-generated personalized workout plans based on your goals, equipment, and fitness level
- **Meal Planner** — AI-generated daily meal plans with allergy and dietary preference handling
- **7-Day Health Plan** — Complete weekly plans combining workout, nutrition, hydration, sleep, and habits
- **Weekly Report** — AI-generated weekly wellness insights with PDF export
- **Daily Insights** — Contextual AI tips based on your actual tracked data

### Health Tools
- **BMI Calculator** — Body Mass Index with category
- **BMR Calculator** — Basal Metabolic Rate (Mifflin-St Jeor)
- **TDEE Calculator** — Total Daily Energy Expenditure
- **Water Intake Estimator** — Based on weight and activity level
- **Macro Calculator** — Protein/carb/fat targets by goal

### Tracking & Gamification
- **Daily Habit Tracker** — Default + custom habits with streaks
- **Progress Analytics** — Interactive Recharts line/bar charts
- **XP Points** — Earned for completing habits, logging workouts, etc.
- **Achievement Badges** — First habit, 7-day streak, 30-day streak, etc.
- **Health Journal** — Mood, energy, sleep, and wellness rating

### App Features
- **Authentication** — JWT + bcrypt, register/login/forgot password
- **Dark Mode** — Light/dark/system theme with persistence
- **Responsive Design** — Mobile-first with bottom nav, desktop sidebar
- **Conversation Memory** — Full chat history with search and delete
- **Safety System** — Emergency detection layer before AI responses
- **Privacy** — Per-user data isolation, account deletion

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router DOM |
| UI Icons | Lucide React |
| Charts | Recharts |
| Markdown | react-markdown + remark-gfm |
| HTTP Client | Axios |
| Backend | Python 3.12+, Flask |
| ORM | SQLAlchemy |
| Database | SQLite (dev) / PostgreSQL-ready |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT (PyJWT) + bcrypt |
| PDF | ReportLab |
| Rate Limiting | Flask-Limiter |
| CORS | Flask-CORS |

---

## 📁 Project Structure

```
healthmate-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py         # Flask app factory
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── auth.py             # JWT utilities, bcrypt
│   │   ├── ai_service.py       # Gemini AI integration + safety layer
│   │   └── routes/
│   │       ├── auth.py         # /api/auth/*
│   │       ├── profile.py      # /api/profile
│   │       ├── chat.py         # /api/conversations, /api/chat
│   │       ├── food.py         # /api/food/*
│   │       ├── workout.py      # /api/workout/*
│   │       ├── meal.py         # /api/meal/*
│   │       ├── habits.py       # /api/habits/*
│   │       ├── health.py       # /api/health/*
│   │       ├── reports.py      # /api/reports/*
│   │       ├── tools.py        # /api/tools/*
│   │       ├── journal.py      # /api/journal/*
│   │       └── memory.py       # /api/memory/*, preferences, settings
│   ├── run.py                  # Flask entry point
│   ├── requirements.txt
│   ├── .env                    # Your environment variables
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx   # Sidebar, mobile nav, header
│   │   ├── lib/
│   │   │   └── api.js          # Axios client with JWT interceptor
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   ├── ForgotPasswordPage.jsx
│   │   │   │   └── ResetPasswordPage.jsx
│   │   │   ├── ProfileSetupPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── FoodAnalyzer.jsx
│   │   │   ├── WorkoutPlanner.jsx
│   │   │   ├── MealPlanner.jsx
│   │   │   ├── HabitsPage.jsx
│   │   │   ├── ProgressPage.jsx
│   │   │   ├── HealthTools.jsx
│   │   │   ├── WeeklyReport.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── PrivacyPage.jsx
│   │   ├── App.jsx             # Routing
│   │   ├── main.jsx
│   │   └── index.css           # Design system + Tailwind
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_very_secret_key_change_this
DATABASE_URL=sqlite:///healthmate.db
FLASK_ENV=development
FLASK_DEBUG=1
FRONTEND_URL=http://localhost:5173
JWT_EXPIRY_HOURS=24
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** installed
- **Google Gemini API Key** — Get one free at [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Navigate

```bash
git clone https://github.com/yourusername/healthmate-ai.git
cd healthmate-ai
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment (recommended)
py -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
py -m pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start backend
py run.py
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔑 Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API Key"**
4. Copy the key
5. Paste it in `backend/.env` as `GEMINI_API_KEY=your_key_here`

> **Note:** The Gemini free tier is generous and sufficient for development and testing.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Request reset link |
| POST | `/api/auth/reset-password` | Reset password with token |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get health profile |
| PUT | `/api/profile` | Update health profile |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/:id` | Get conversation + messages |
| PUT | `/api/conversations/:id` | Rename/favorite |
| DELETE | `/api/conversations/:id` | Delete |
| POST | `/api/chat` | Send message |
| POST | `/api/chat/regenerate` | Regenerate response |
| DELETE | `/api/messages/:id` | Delete message |

### Food, Workout, Meal, Habits, Health, Reports, Tools
All protected routes returning user-specific data.

---

## 🗄️ Database Schema

Models: `User`, `HealthProfile`, `Conversation`, `Message`, `FoodLog`, `Workout`, `WorkoutSession`, `MealPlan`, `Habit`, `HabitCompletion`, `JournalEntry`, `HealthMetric`, `WeeklyReport`, `Memory`, `UserPreference`, `UserBadge`

SQLite database auto-created on first run at `backend/instance/healthmate.db`

---

## 🔒 Security

- Passwords hashed with **bcrypt** (never stored in plain text)
- Authentication via **JWT** with configurable expiry
- All API routes protected — users only access their own data
- Gemini API key stored **server-side only** (never exposed to frontend)
- Rate limiting: auth routes limited to 10-20 req/hour
- Input validation on all forms and API endpoints
- SQL injection protection via SQLAlchemy ORM
- Configurable CORS — frontend URL only

---

## ⚕️ Medical Safety Disclaimer

**HealthMate AI is NOT a medical device.** It is a wellness coaching assistant for general health information and guidance only. It cannot:
- Diagnose diseases or medical conditions
- Prescribe medication or recommend dosage changes
- Replace consultation with qualified healthcare professionals

For medical emergencies, contact emergency services (911 or local equivalent) immediately.

Always consult a qualified healthcare professional before making significant changes to your diet, exercise, or health regimen.

---

## 🔮 Future Improvements

- [ ] Google Fit / Apple Health integration
- [ ] Push notifications (PWA)
- [ ] Real-time streaming AI responses (SSE)
- [ ] Image uploads to Cloudinary
- [ ] Fitbit / wearable device sync
- [ ] Social features (share progress)
- [ ] Nutrition database integration (OpenFoodFacts)
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ using React, Flask, and Google Gemini AI
