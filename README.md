# ⚡ FitPulse Pro - Precision Fitness & Clinical Nutrition Dashboard

A comprehensive, zero-dependency modern web application engineered for calculating meal macros, tracking daily steps automatically with motion pedometers and live walking sessions, formulating personalized clinical diets based on medical and body conditions, recording personal records (PRs) with 1RM formulas, and generating tailored workout splits according to your weekly convenience.

---

## 🌟 Key Features & Capabilities

### 1. 🥗 Meal Macro Calculator & Food Diary
- **44+ Preloaded Whole Foods & Supplements**: High-protein meats, fish, eggs, dairy, vegetarian staples (paneer, tofu, lentils, chickpeas), complex carbs (oats, brown rice, sweet potatoes), healthy fats (avocado, nuts, seeds, olive oil), and greens.
- **Portion Scaler & Real-Time Preview**: Adjust portion sizes by grams or servings with instant live recalculation of calories, protein, carbs, and fat.
- **Custom Food Creator**: Easily save your own custom recipes or branded foods into your permanent local food library.
- **Visual Macronutrient Tracking**:
  - Calorie balance circular progress gauge (Consumed vs Daily Target vs Remaining).
  - Protein, Carbohydrate, and Fat linear progress meters.
  - Interactive **Chart.js** Donut Chart showing % caloric distribution across macronutrients.
- **Meal Slot Categorization**: Dedicated tracking sections for **Breakfast**, **Lunch**, **Dinner**, and **Snacks / Pre-workout**.

---

### 2. 📸 AI Vision Meal Scanner (Camera Integration)
- **Live Camera & Photo Upload**:
  - WebRTC live camera feed with snapshot capture and camera-flip support for mobile devices.
  - Direct file upload or drag-and-drop for meal photos.
- **Visual Food Recognition & Portion Estimation**:
  - Recognizes plate composition (lean proteins, complex carbs, healthy fats, mixed greens).
  - Itemized breakdown of ingredients with estimated weights in grams.
  - Interactive portion slider (50% to 200%) with real-time recalculation of total calories, protein, carbs, and fats.
- **1-Click Meal Logging**: Direct "Confirm & Add to Today's Diary" button sending detected foods into Breakfast, Lunch, Dinner, or Snacks.

---

### 3. 👟 Automatic Real-Time Step Tracker & Pedometer
- **Hardware Phone Accelerometer Sensor Pedometer**:
  - Automatically detects real physical steps using `DeviceMotionEvent` 3-axis magnitude acceleration vector: \(\text{magnitude} = \sqrt{x^2 + y^2 + z^2}\).
  - Implements dynamic heel-strike peak and swing-phase valley detection with debounced timing (260ms–2000ms).
  - Put your phone in your pocket or hold it in hand while walking to watch your steps count automatically.
- **Live Automatic Walk Session (Indoor/Treadmill/Outdoor)**:
  - Automatically records steps second-by-second while active.
  - Adjustable walking cadence slider (80 steps/min leisure stroll to 150 steps/min power jog).
  - Live stopwatch timer, session steps counter, live distance, and active calorie burn.
  - Screen WakeLock ensures the device screen remains on during walking sessions.
- **Automated Metric Calculations**:
  - **Distance**: Calculated in kilometers and miles using average stride kinematics (~0.76m).
  - **Active Energy Burn**: Estimated net calorie expenditure calculated from your specific body weight and step volume.
  - **Streak Tracker**: Automatically counts consecutive days where your step target was achieved or exceeded.
  - **7-Day Trend Chart**: Interactive **Chart.js** weekly bar graph color-coding successful days in emerald green.

---

### 4. 💬 PulseBot - AI Fitness & Nutrition Chatbot
- **Context-Aware Personal Coach**:
  - Dedicated full-screen chat tab (**💬 AI Coach**) plus floating popup widget.
  - Deep awareness of your live biometrics, active calories/macros, step count, medical condition, and PR lifts.
  - Answers questions on protein timing, calorie deficits, diabetic diets, blood pressure restrictions, creatine safety, workout splits, and breaking strength plateaus.
  - Works 100% offline with an integrated clinical knowledge base, with optional Google Gemini API key support for cloud LLM conversations.

---

### 5. 🩺 Clinical Diet & Body Condition Engine
- **Mifflin-St Jeor Metabolic Engine**: Calculates exact Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) based on age, biological gender, height, current weight, target weight, and physical activity multiplier.
- **Medical & Body Condition Directives**:
  - **Standard Optimal Fitness**: Balanced macronutrient distribution for body recomposition.
  - **Type 2 Diabetes / Pre-Diabetic**: Low-glycemic index protocol, complex carbs, high fiber (>40g), and zero refined sugars.
  - **Hypertension (High Blood Pressure)**: DASH diet guidelines, restricted sodium (<1500mg), high potassium, and magnesium.
  - **PCOD / PCOS**: Anti-inflammatory, low insulinemic index, omega-3 fatty acids, and hormonal equilibrium support.
  - **High Cholesterol / Cardiovascular**: Low saturated fat (<6%), soluble beta-glucans (oats), and phytosterols.
  - **Chronic Kidney Disease (Early Stage)**: Glomerular protection, controlled protein (strictly ~0.8g/kg), and regulated phosphorus.
  - **GERD / Acid Reflux**: Low-acid, non-citrus, gentle mucosal digestion, spaced meals.
  - **Hypothyroidism**: Slow metabolism support with bioavailable selenium, zinc, and tyrosine.
- **Dietary Preferences Supported**: Omnivore, Vegetarian, 100% Vegan (Plant-Based), Ketogenic, Gluten-Free, Lactose-Free.
- **Structured 5-Meal Daily Plan**: Generates exact meal compositions (Breakfast, Morning Snack, Lunch, Pre/Post Workout, Dinner) with clinical rationales explaining *why* each meal suits your condition.
- **1-Click Integration**: "Apply to Macro Tracker" button updates your daily macro goals; "Log This" button logs suggested meals straight into your food diary.

---

### 6. 🏆 PR Vault & 1-Rep Max (1RM) Progression
- **Comprehensive Record Vault**: Track Bench Press, Squat, Deadlift, Overhead Press, Weighted Pull-ups, Rows, or any custom exercise.
- **Log Parameters**: Weight lifted, reps performed, date, RPE (Rate of Perceived Exertion 1-10), and form cues/notes.
- **1-Rep Max (1RM) Engine**:
  - Evaluates both **Epley Formula** \(1RM = Weight \times (1 + \frac{Reps}{30})\) and **Brzycki Formula**.
  - Interactive training intensity percentages table (95%, 90%, 85%, 80%, 75%, 70%) to plan training sets.
- **Historical Line Chart**: Tracks your strength progression over time with actual lift and estimated 1RM curves.
- **Celebration Confetti**: Automated particle celebration upon setting new PRs or unlocking milestones!

---

### 7. 🏋️‍♂️ Smart Workout Split Suggester
- **Customized to Your Convenience**:
  - **Weekly Availability**: Choose 2, 3, 4, 5, or 6 training days per week.
  - **Equipment Access**: Full Commercial Gym, Home Gym (Dumbbells & Bench), or Calisthenics / Bodyweight Only.
  - **Experience Level**: Beginner, Intermediate, Advanced.
  - **Primary Focus**: Hypertrophy, Strength & Power, Fat Loss & Conditioning, or Time-Efficient.
  - **Session Duration**: 30-45 mins, 45-60 mins, or 60-75 mins.
- **Day-by-Day Routines**:
  - Target muscle group breakdowns.
  - Exercise tables with target Sets, Rep ranges, Rest intervals, and Coaching form tips.
  - **Exercise Swapper (⇄)**: 1-click alternative swap for occupied gym machines or home variations.
  - **Direct PR Logging**: 1-click "⚡ Log PR" button transfers any workout movement straight into the PR Vault.
  - **Suggested Weekly Schedule Matrix**: Visual Monday through Sunday calendar mapping workout vs recovery days.

---

## 🚀 How to Run the Website

Open your browser to:
👉 **[http://localhost:8080/](http://localhost:8080/)**
