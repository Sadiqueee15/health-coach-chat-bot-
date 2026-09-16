/**
 * Intelligent Health & Nutrition Coach AI Engine
 * Provides dynamic, evidence-based, customized health guidance tailored to user questions and health profiles.
 */

export function generateCoachResponse(userMessage = '', persona = 'general', userProfile = {}) {
  const query = userMessage.toLowerCase().trim()
  const goal = userProfile?.fitness_goal?.replace(/_/g, ' ') || 'optimal fitness and vitality'
  const weight = userProfile?.weight_kg || 62
  const targetCals = userProfile?.target_calories || 2100

  // 1. Protein Intake & Muscle Recovery
  if (
    query.includes('protein') ||
    query.includes('muscle recovery') ||
    query.includes('muscle repair') ||
    query.includes('leucine') ||
    query.includes('amino') ||
    query.includes('whey')
  ) {
    const minProtein = Math.round(weight * 1.6)
    const maxProtein = Math.round(weight * 2.2)
    const perMeal = Math.round(minProtein / 4)

    return `### Evidence-Based Protein Protocol for Muscle Recovery

To maximize muscle protein synthesis (MPS) and accelerate tissue repair, here is your personalized intake and timing framework based on your profile:

#### 1. Daily Target Range
- **Optimal Intake:** **${minProtein}g – ${maxProtein}g protein daily** (1.6g to 2.2g per kg of bodyweight).
- For your current target of ~${weight}kg, this provides the optimal substrate to repair micro-tears in muscle fibers without unnecessary metabolic surplus.

#### 2. Meal Pacing & The Leucine Threshold
- **Even Distribution:** Divide your protein into **3 to 4 meals of ~${perMeal}g – ${perMeal + 10}g each**, spaced roughly 3 to 4 hours apart.
- **The Trigger:** Aim for at least **2.5g – 3.0g of leucine** per serving (found in eggs, Greek yogurt, poultry, salmon, tofu, or whey). Leucine acts as the molecular trigger that turns on the **mTOR pathway** for cellular regeneration.

#### 3. Post-Workout Recovery Window
- Consume **25g – 35g of bioavailable protein** within **60 to 90 minutes post-training**.
- Pair this with **30g – 50g of complex or simple carbohydrates** (e.g., a banana, oatmeal, or berries). Carbs stimulate an insulin response that promotes amino acid uptake and replenishes depleted intramuscular glycogen.

#### 4. Night-Time Recovery Support
- Consuming **20g – 30g of slow-digesting protein** (such as casein, Greek yogurt, or cottage cheese) 45 minutes before sleep delivers an amino acid trickle throughout the night, reducing nocturnal muscle breakdown.

*Would you like a sample high-protein daily meal plan or specific vegetarian/vegan food source recommendations?*`
  }

  // 2. Workout Planning & Exercise Routines
  if (
    query.includes('workout') ||
    query.includes('exercise') ||
    query.includes('routine') ||
    query.includes('training') ||
    query.includes('dumbbell') ||
    query.includes('split') ||
    query.includes('push pull') ||
    query.includes('full body')
  ) {
    return `### Custom Training Blueprint for ${goal.toUpperCase()}

Here is a structured, progressive workout framework tailored to build strength, muscular endurance, and functional mobility:

#### 🏋️ 45-Minute Full-Body Strength Routine

**Phase 1: Dynamic Warm-Up (5–7 Mins)**
- World's Greatest Stretch: 5 reps per side
- Arm Circles & Band Pull-Aparts: 15 reps
- Bodyweight Air Squats with pause: 12 reps
- Glute Bridges: 15 reps

**Phase 2: Core Compound Movements (30 Mins)**
1. **Goblet / Barbell Squats** — 4 sets × 8–10 reps *(rest 90s)*
   - *Cue:* Drive through mid-foot, brace core, keep chest tall.
2. **Dumbbell / Barbell Bench Press or Push-Ups** — 4 sets × 8–12 reps *(rest 75s)*
   - *Cue:* Control the eccentric descent for 2–3 seconds.
3. **Bent-Over Rows or Neutral-Grip Lat Pulldowns** — 4 sets × 10 reps *(rest 75s)*
   - *Cue:* Pull through your elbows to engage the lats, avoid shrugging.
4. **Romanian Deadlifts (RDLs)** — 3 sets × 10–12 reps *(rest 90s)*
   - *Cue:* Hips back, slight knee bend, maintain flat spinal alignment.
5. **Dumbbell Overhead Shoulder Press** — 3 sets × 10 reps *(rest 60s)*

**Phase 3: Core & Finisher (5 Mins)**
- Forearm Plank Hold: 3 sets × 45 seconds
- Hanging Knee Raises / Deadbugs: 3 sets × 12 reps

#### 💡 Progression Rule
Apply **Progressive Overload**: Every week, aim to add either 1 rep per set or increase weight by 2.5–5% once you can hit the top of the rep range with pristine form.

*Need modifications for home dumbbell workouts, gym machines, or specific joint considerations?*`
  }

  // 3. Weight Loss / Fat Loss / Calorie Deficit
  if (
    query.includes('lose weight') ||
    query.includes('fat loss') ||
    query.includes('deficit') ||
    query.includes('cutting') ||
    query.includes('burn fat') ||
    query.includes('calories')
  ) {
    const deficitCals = Math.max(1500, targetCals - 400)
    return `### Evidence-Based Fat Loss & Metabolic Pacing

Sustainable fat loss is achieved by preserving lean muscle mass while operating in a moderate, controlled energy deficit:

#### 1. Caloric Deficit Target
- **Recommended Intake:** **~${deficitCals} kcal/day** (a healthy 350–450 kcal deficit below your baseline of ${targetCals} kcal).
- This targets **0.4kg – 0.7kg of fat loss per week**, which protects your metabolic rate and thyroid function from downregulating.

#### 2. Macronutrient Distribution
- **High Protein (30–35%):** Keeps satiety hormones (PYY, GLP-1) elevated and shields muscle tissue from breakdown.
- **Complex Carbs (40–45%):** Prioritize oats, sweet potatoes, quinoa, and berries to fuel high-intensity training.
- **Essential Fats (20–25%):** Avocados, nuts, and olive oil for hormonal synthesis and fat-soluble vitamin absorption.

#### 3. High-Volume, High-Fiber Strategy
- Target **28g – 35g of dietary fiber daily**. Load half your plate with volumetric leafy vegetables (spinach, broccoli, zucchini, peppers) which take up physical room in the stomach.
- Drink **500ml of water 15 minutes before main meals** to regulate portion control.

#### 4. NEAT (Non-Exercise Activity Thermogenesis)
- Dedicated workouts burn ~10–15% of your daily energy. Non-exercise movement (walking, taking stairs, fidgeting) burns significantly more.
- Aim for **8,500 to 10,000 daily steps** as a consistent baseline.

*Would you like a full grocery shopping checklist or meal timing schedule?*`
  }

  // 4. Sleep Hygiene & Circadian Health
  if (
    query.includes('sleep') ||
    query.includes('tired') ||
    query.includes('insomnia') ||
    query.includes('rest') ||
    query.includes('circadian') ||
    query.includes('wake up')
  ) {
    return `### Sleep Architecture & Circadian Reset Protocol

High-quality deep and REM sleep is where 95% of human growth hormone (HGH) release, hormonal calibration, and cognitive restoration occur.

#### 1. Morning Circadian Anchor
- **Natural Light Exposure:** Step outside within 30 minutes of waking for **10 to 15 minutes of natural sunlight** without sunglasses. This activates the retinal ganglion cells, sets your suprachiasmatic nucleus (internal clock), and starts the 14-hour timer for natural melatonin release.

#### 2. Evening Wind-Down Routine (The 3-2-1 Rule)
- **3 Hours Before Bed:** Finish your last heavy meal to avoid core temperature elevation and nocturnal acid reflux.
- **2 Hours Before Bed:** Cut off intense exercise and excessive fluid intake to eliminate midnight awakenings.
- **1 Hour Before Bed:** Dim bright overhead LED lights. Shift screens to warm night-shift mode or swap screens for reading/journaling.

#### 3. Bedroom Environment
- **Temperature:** Keep ambient room temperature cool (**18°C – 20°C / 65°F – 68°F**). Body temperature must drop by ~1°C to initiate deep slow-wave sleep.
- **Total Darkness:** Use blackout blinds or an eye mask. Even dim ambient light disrupts melatonin synthesis.

#### 4. Caffeine Hygiene
- Caffeine has an average half-life of 5–7 hours and a quarter-life of 10–12 hours. Maintain a strict **cutoff 9–10 hours before your target bedtime**.

*Would you like supplement recommendations for sleep support (like magnesium glycinate or L-theanine)?*`
  }

  // 5. Hydration & Electrolyte Balance
  if (
    query.includes('water') ||
    query.includes('hydration') ||
    query.includes('drink') ||
    query.includes('electrolyte') ||
    query.includes('dehydrat')
  ) {
    const recommendedWater = Math.round((weight * 35) / 100) * 100
    return `### Personalized Hydration & Electrolyte Protocol

Proper cellular hydration powers mitochondrial energy production, joint lubrication, and cognitive clarity.

#### 1. Daily Water Target
- **Baseline Requirement:** **~${recommendedWater} ml (${(recommendedWater / 1000).toFixed(1)} Liters)** per day.
- **Workout Adjustment:** Add **500ml – 750ml** for every hour of moderate-to-vigorous exercise or heavy sweating.

#### 2. Strategic Daily Pacing
- **Morning Jumpstart:** Drink **500ml of room-temperature water** immediately upon waking with a pinch of mineral salt or lemon to rehydrate following 8 hours of respiratory moisture loss.
- **Pre-Meal Hydration:** Drink a glass of water 20 minutes before meals; avoid chugging large quantities during eating to preserve digestive enzyme concentration.
- **Evening Taper:** Taper your fluid intake 90 minutes before sleep to prevent sleep fragmentation.

#### 3. Electrolyte Optimization
- Water alone cannot hydrate cells without sodium, potassium, and magnesium.
- Include natural electrolyte sources daily: coconut water, bananas, avocados, spinach, and sea salt on whole meals.

*Check your urine color: Pale straw/light lemonade indicates optimal hydration.*`
  }

  // 6. Stress, Cortisol & Recovery
  if (
    query.includes('stress') ||
    query.includes('cortisol') ||
    query.includes('anxiety') ||
    query.includes('burnout') ||
    query.includes('relax')
  ) {
    return `### Autonomic Nervous System Regulation & Cortisol Management

Chronic psychological stress elevates cortisol and sympathetic tone, impairing digestion, muscle recovery, and deep sleep. Here are actionable downregulation tools:

#### 1. Real-Time Downregulation: The Physiological Sigh
- Inhale deeply through your nose until lungs are 80% full.
- Take a sharp second 'top-off' inhale to pop open collapsed alveoli.
- Perform a long, slow, unforced exhale through your mouth.
- *Repeat 3–5 times* to instantly slow your heart rate via the vagal brake.

#### 2. Low-Intensity Movement (Zone 2)
- 20–30 minutes of gentle walking outside in nature lowers circulating serum cortisol and blood pressure while maintaining joint mobility.

#### 3. Nutritional Shields
- Chronic stress depletes **Vitamin C, B-vitamins, and Magnesium**. Emphasize citrus fruits, leafy greens, pumpkin seeds, and wild-caught fish.
- Limit high doses of caffeine during periods of acute stress, as it compounds adrenal stimulation.

*Take 5 minutes right now for slow nasal diaphragmatic breathing to center your nervous system.*`
  }

  // 7. Habits, Discipline & Mindset
  if (
    query.includes('habit') ||
    query.includes('motivation') ||
    query.includes('discipline') ||
    query.includes('consistency') ||
    query.includes('lazy') ||
    query.includes('start')
  ) {
    return `### Behavioral Architecture: Building Unbreakable Health Habits

Motivation is an emotional state that fluctuates daily; **behavioral architecture** is what builds long-term results.

#### 1. The Two-Minute Rule
- Shrink any daunting health habit down to its 2-minute starter version:
  - *"Work out for 60 minutes"* → Put on gym shoes and do 10 push-ups.
  - *"Cook a healthy gourmet meal"* → Chop one bell pepper and pour water.
- Overcoming inertia is 90% of the battle. Once you start, momentum takes over.

#### 2. Habit Stacking
- Anchor your desired new habit directly onto an established, automatic daily routine:
  - *“After I pour my morning coffee, I will drink 500ml of water.”*
  - *“After I close my work laptop, I will immediately change into my walking clothes.”*

#### 3. Environmental Design
- Reduce friction for good habits: Set your workout gear out the night before; keep fresh fruit and prepped protein at eye level in the fridge.
- Increase friction for unwanted habits: Keep snacks in hard-to-reach cabinets; charge your phone across the room.

*What is one micro-habit you'd like to lock in this week?*`
  }

  // 8. Persona-Specific Modulated Default for General Questions
  const personaIntro = {
    nutrition: `### Clinical Nutritionist Assessment\n\nAnalyzing your question from a micronutrient density, glycemic balance, and metabolic health perspective:`,
    fitness: `### Strength & Conditioning Coach Analysis\n\nBreaking this down from a biomechanics, neuromuscular adaptation, and progressive training lens:`,
    sleep: `### Recovery & Sleep Specialist Perspective\n\nLooking at this through the lens of circadian rhythms, nervous system recovery, and hormonal optimization:`,
    general: `### HealthMate AI Coaching Guidance\n\nHere is personalized, evidence-informed guidance tailored to your health profile:`,
  }

  return `${personaIntro[persona] || personaIntro.general}

Regarding **"${userMessage.trim()}"**:

#### 1. Core Principles to Implement
- **Consistent Execution:** Small daily habits compounds exponentially over 30 to 90 days. Focus on sustainable 1% daily improvements rather than drastic, temporary overhauls.
- **Fuel & Nourishment:** Center your baseline on minimally processed whole foods, aiming for balanced macronutrients and proper hydration (${(weight * 0.035).toFixed(1)}L baseline).
- **Movement Variability:** Blend resistance training with cardiovascular conditioning and daily mobility work to maintain joint longevity.
- **Recovery Integration:** Treat sleep and mental downtime with the same priority as your workouts.

#### 2. Actionable Next Steps
1. Identify **one primary micro-action** you can execute today in under 5 minutes.
2. Track your consistency using the **Habits Tracker** in your HealthMate dashboard.
3. Log your meals or workouts so we can tailor future coaching recommendations.

*Feel free to ask for a specific workout breakdown, a customized meal idea, or how to overcome a particular health obstacle!*`
}
