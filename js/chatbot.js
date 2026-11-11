// FitPulse Pro - Comprehensive Intelligent Fitness & Nutrition AI Coach

const ChatbotModule = {
  isOpen: false,
  messages: [],
  apiKey: '',

  init() {
    this.apiKey = localStorage.getItem('fitpulse_gemini_api_key') || '';
    this.bindEvents();
    this.seedInitialGreeting();
  },

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;
    // Floating Toggle Button
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleChat());
    }

    // Chat Close Button
    const closeBtn = document.getElementById('chatbot-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggleChat(false));
    }

    // Chat Form Submit (Floating Widget)
    const chatForm = document.getElementById('chatbot-form');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUserSubmit('chatbot-input');
      });
    }

    // Enter key listener on input
    const chatInput = document.getElementById('chatbot-input');
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleUserSubmit('chatbot-input');
        }
      });
    }

    // Full Tab Chat Form Submit (if in dedicated chat tab)
    const fullChatForm = document.getElementById('full-chatbot-form');
    if (fullChatForm) {
      fullChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUserSubmit('full-chatbot-input');
      });
    }

    // Quick Prompt Pills
    document.querySelectorAll('[data-chat-prompt]').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const text = e.currentTarget.getAttribute('data-chat-prompt');
        const input = document.getElementById('chatbot-input') || document.getElementById('full-chatbot-input');
        if (input) input.value = text;
        this.handleUserSubmit(input ? input.id : 'chatbot-input');
      });
    });

    // Optional API Key button
    const apiKeyBtn = document.getElementById('chatbot-apikey-btn');
    if (apiKeyBtn) {
      apiKeyBtn.addEventListener('click', () => {
        const currentKey = localStorage.getItem('fitpulse_gemini_api_key') || '';
        const key = prompt('Enter your Google Gemini API Key for live cloud AI (Optional - leave blank to use built-in offline expert):', currentKey);
        if (key !== null) {
          localStorage.setItem('fitpulse_gemini_api_key', key.trim());
          this.apiKey = key.trim();
          App.showToast(this.apiKey ? 'Gemini API Key saved!' : 'Switched to Built-in Expert Engine', 'info');
        }
      });
    }
  },

  toggleChat(forceState = null) {
    const windowEl = document.getElementById('chatbot-window');
    const badge = document.getElementById('chatbot-badge');
    if (!windowEl) return;

    let shouldOpen;
    if (forceState !== null) {
      shouldOpen = Boolean(forceState);
    } else {
      // Determine directly from DOM state to prevent any state de-synchronization
      const isHidden = windowEl.classList.contains('hidden') || windowEl.style.display === 'none';
      shouldOpen = isHidden;
    }

    this.isOpen = shouldOpen;

    if (shouldOpen) {
      windowEl.classList.remove('hidden');
      windowEl.style.display = 'flex';
      if (badge) badge.classList.add('hidden');
      this.renderMessages();
      this.scrollToBottom();
      const input = document.getElementById('chatbot-input');
      if (input) setTimeout(() => input.focus(), 100);
    } else {
      windowEl.classList.add('hidden');
      windowEl.style.display = 'none';
    }
  },

  seedInitialGreeting() {
    const profile = StorageManager.getProfile();
    const condName = MEDICAL_CONDITIONS[profile.condition]?.name || 'Standard Optimal Fitness';
    const goalName = (profile.goal || 'fat_loss').replace('_', ' ').toUpperCase();

    const welcomeMsg = `
👋 **Hello! I am PulseBot, your AI Fitness & Clinical Nutrition Coach.**

I have synchronized with your personal profile:
• **Primary Goal:** ${goalName}
• **Condition Directives:** ${condName}
• **Current Weight:** ${profile.weight} kg (Target: ${profile.targetWeight} kg)

Ask me anything about your **diet, fat loss, muscle building, macro targets, workout splits, exercise form, supplements, or medical condition diets**!
    `;

    this.messages = [{
      role: 'assistant',
      text: welcomeMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];

    this.renderMessages();
  },

  handleUserSubmit(inputId = 'chatbot-input') {
    const input = document.getElementById(inputId);
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    // Add user message
    this.messages.push({
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    input.value = '';
    this.renderMessages();
    this.showTypingIndicator();

    setTimeout(async () => {
      try {
        const response = await this.generateAnswer(query);
        this.hideTypingIndicator();
        this.messages.push({
          role: 'assistant',
          text: response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.renderMessages();
      } catch (err) {
        console.error('PulseBot error:', err);
        this.hideTypingIndicator();
        this.messages.push({
          role: 'assistant',
          text: "I am here! Ask me anything about your macros, weight loss, muscle building, medical diet restrictions, PR lifts, or workout splits.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.renderMessages();
      }
    }, 250);
  },

  showTypingIndicator() {
    const indicators = [document.getElementById('chatbot-typing'), document.getElementById('full-chatbot-typing')];
    indicators.forEach(el => { if (el) el.classList.remove('hidden'); });
    this.scrollToBottom();
  },

  hideTypingIndicator() {
    const indicators = [document.getElementById('chatbot-typing'), document.getElementById('full-chatbot-typing')];
    indicators.forEach(el => { if (el) el.classList.add('hidden'); });
  },

  async generateAnswer(userQuery) {
    try {
      const q = (userQuery || '').toLowerCase().trim();
      const profile = StorageManager.getProfile() || { weight: 75, targetWeight: 72, goal: 'fat_loss', condition: 'healthy', age: 26, gender: 'male' };
      const today = StorageManager.getTodayString();
      const targets = StorageManager.getMacroTargets() || { calories: 2150, protein: 170, carbs: 210, fat: 65 };
      const meals = StorageManager.getMeals(today) || [];
      const stepData = StorageManager.getStepsForDate(today) || { steps: 0, goal: 10000, distanceKm: 0, caloriesBurned: 0 };
      const prs = StorageManager.getPRs() || [];

      let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
      meals.forEach(m => {
        totalCal += (m.calories || 0);
        totalP += (m.protein || 0);
        totalC += (m.carbs || 0);
        totalF += (m.fat || 0);
      });

    // 1. Try Gemini Cloud AI if API key is saved and valid
    if (this.apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const promptContext = `
You are PulseBot, an elite sports scientist, strength coach, and registered clinical dietitian.
User Context:
- Age: ${profile.age}, Gender: ${profile.gender}, Weight: ${profile.weight}kg, Target: ${profile.targetWeight}kg
- Goal: ${profile.goal}, Condition: ${profile.condition} (${MEDICAL_CONDITIONS[profile.condition]?.name})
- Today's Consumed: ${totalCal}/${targets.calories} kcal, Protein: ${Math.round(totalP)}/${targets.protein}g, Steps: ${stepData.steps}/${stepData.goal}
- Recent PRs: ${prs.slice(0, 3).map(p => `${p.exercise} ${p.weightKg}kg x ${p.reps}`).join(', ') || 'None yet'}

Answer this fitness/nutrition question concisely, accurately, and encouragingly in clean Markdown:
"${userQuery}"
        `;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptContext }] }] }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json.candidates && json.candidates[0]?.content?.parts[0]?.text) {
            return json.candidates[0].content.parts[0].text;
          }
        }
      } catch (err) {
        console.warn('Gemini API call timed out or failed, utilizing built-in expert engine:', err);
      }
    }

    // 2. High-Performance Built-in Expert Engine (Instant, Offline, Broad Coverage)
    
    // GREETINGS & CASUAL
    if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hi ') || q.startsWith('hello ') || q === 'yo') {
      return `
Hello! Great to connect with you. How can I help you today?

Here are quick topics you can ask me about:
• **"How much protein do I need?"**
• **"How to lose belly fat / weight fast?"**
• **"Suggest a diet plan for my condition"**
• **"Best 4-day workout split"**
• **"How to increase my Bench Press PR?"**
• **"Is creatine safe?"**
      `;
    }

    // FAT LOSS / WEIGHT LOSS / BELLY FAT / CUTTING
    if (q.includes('lose weight') || q.includes('fat loss') || q.includes('belly fat') || q.includes('cut') || q.includes('shred') || q.includes('tummy') || q.includes('burn fat') || q.includes('weight loss')) {
      const targetDeficit = targets.calories;
      return `
### 🔥 Evidence-Based Fat Loss Strategy
To lose body fat consistently while preserving lean muscle mass:

1. **Energy Balance (The Deficit):**
   - Your calculated daily target is **${targetDeficit} kcal/day** (a ~350–500 kcal deficit below maintenance).
   - At this rate, expect a healthy, sustainable fat loss of **0.5 kg to 0.8 kg per week**.
2. **High Protein Preservation:**
   - Keep protein at **${targets.protein}g daily** (~1.8–2.0g/kg). Protein has the highest Thermic Effect of Food (TEF ~25%) and prevents muscle loss during caloric restriction.
3. **Daily Steps (NEAT):**
   - Walking is the ultimate fat loss tool because it burns fat without stressing your nervous system or increasing hunger hormones. Aim for **${stepData.goal.toLocaleString()} steps daily**.
4. **Spot Reduction Myth:**
   - You cannot burn "only belly fat" by doing crunches. Fat comes off systemically from the whole body as your overall body fat percentage drops.
      `;
    }

    // MUSCLE GAIN / BULKING / HYPERTROPHY / MASS
    if (q.includes('build muscle') || q.includes('gain muscle') || q.includes('bulk') || q.includes('hypertrophy') || q.includes('mass') || q.includes('gain weight') || q.includes('muscle')) {
      return `
### 💪 The 4 Pillars of Maximum Muscle Hypertrophy
1. **Mechanical Tension & Progressive Overload:**
   - Track your lifts in the **PR Vault**. Aim to add either 1 rep or 1–2 kg to your core compound exercises every 1–2 weeks.
2. **Caloric Surplus:**
   - A slight surplus of **+200 to +300 kcal above maintenance** (~${targets.calories + 250} kcal/day) supports optimal tissue synthesis without excessive fat gain.
3. **Protein Intake:**
   - Consume **${targets.protein}g protein daily**. Ensure 30–45g of protein per meal containing at least 3g of leucine to trigger the mTOR pathway.
4. **Training Volume & Rest:**
   - Target **10 to 18 hard sets per muscle group per week**, taken within 1–2 reps of failure (RPE 8–9). Get at least 7–8 hours of quality sleep.
      `;
    }

    // DIET PLAN / WHAT TO EAT / FOOD RECOMMENDATIONS
    if (q.includes('what should i eat') || q.includes('what to eat') || q.includes('diet plan') || q.includes('meal plan') || q.includes('food') || q.includes('meals')) {
      return `
### 🥗 Optimal Meal Structure For Your Target
Based on your goal of **${profile.goal.replace('_', ' ').toUpperCase()}** and condition **${MEDICAL_CONDITIONS[profile.condition]?.name}**:

• **Breakfast:** Rolled oats cooked with whey isolate/plant protein, chia seeds, and berries (or 3 scrambled eggs with whole wheat toast & avocado).
• **Power Lunch:** 160g Grilled chicken breast (or grilled paneer/tofu) + 1 cup brown rice/quinoa + steamed broccoli and a drizzle of extra virgin olive oil.
• **Pre/Post-Workout Snack:** 1 banana with 1 tbsp peanut butter or a scoop of Greek yogurt with raw almonds.
• **Restorative Dinner:** Baked wild salmon (or spiced lentil dal) with sweet potato and steamed asparagus/spinach.

*Tip: You can generate your full medical-grade 5-meal schedule with exact weights inside the **Diet Plan** tab!*
      `;
    }

    // PROTEIN & AMINO ACIDS
    if (q.includes('protein') || q.includes('whey') || q.includes('amino') || q.includes('egg') || q.includes('chicken') || q.includes('paneer') || q.includes('tofu')) {
      const optimalG = Math.round(profile.weight * 2.0);
      return `
### 🥩 Protein Guidelines for Your Body
- **Target:** Aim for **${optimalG}g of protein daily** (${targets.protein}g is your set goal).
- **Today's Status:** You have logged **${Math.round(totalP)}g** so far (${Math.max(0, targets.protein - Math.round(totalP))}g remaining).
- **Timing:** Spread protein across 3 to 4 meals (e.g. 30–40g per meal). Pre-bed casein or low-fat paneer/Greek yogurt provides slow amino acid release overnight.
- **Top Sources:**
  - *Non-Vegetarian:* Chicken breast (31g/100g), Whole eggs & whites, Salmon, Canned tuna, Lean beef.
  - *Vegetarian/Vegan:* Firm tofu, Low-fat paneer, Greek yogurt, Moong dal, Edamame, Pea/Rice protein powder.
      `;
    }

    // CALORIE STATUS & DIET PROGRESS TODAY
    if (q.includes('calorie') || q.includes('status') || q.includes('today') || q.includes('consumed') || q.includes('deficit')) {
      const remCal = targets.calories - totalCal;
      return `
### 📊 Today's Nutritional Status
- **Target Calories:** **${targets.calories} kcal**
- **Food Consumed:** **${totalCal} kcal**
- **Active Step Burn:** **${stepData.caloriesBurned} kcal** (${stepData.steps.toLocaleString()} steps)
- **Net Balance:** **${totalCal - stepData.caloriesBurned} kcal**
- **Remaining Budget:** ${remCal >= 0 ? `**${remCal} kcal** remaining to eat today.` : `**${Math.abs(remCal)} kcal** over your daily goal.`}

**Macronutrient Breakdown Today:**
• Protein: **${Math.round(totalP)}g** / ${targets.protein}g
• Carbs: **${Math.round(totalC)}g** / ${targets.carbs}g
• Fat: **${Math.round(totalF)}g** / ${targets.fat}g
      `;
    }

    // STEPS, WALKING & CARDIO
    if (q.includes('step') || q.includes('walk') || q.includes('cardio') || q.includes('running') || q.includes('jog') || q.includes('10000') || q.includes('10k')) {
      return `
### 👟 Daily Steps & Cardiovascular Health
- **Today's Progress:** **${stepData.steps.toLocaleString()}** / ${stepData.goal.toLocaleString()} steps (${Math.round((stepData.steps / stepData.goal) * 100)}% of goal).
- **Distance Walked:** **${stepData.distanceKm} km** (~${(stepData.distanceKm * 0.621371).toFixed(2)} miles).
- **Calories Burned:** **${stepData.caloriesBurned} kcal**.
- **Why Steps Matter:** 10,000 steps daily reduces all-cause mortality by 40%, improves insulin sensitivity, and accelerates fat loss with zero orthopedic impact.
- **Cardio Timing:** Do your brisk walks or light cardio *after* weight training, or during active recovery days, so you have full energy for heavy lifting.
      `;
    }

    // WORKOUT SPLITS & ROUTINE
    if (q.includes('split') || q.includes('workout') || q.includes('routine') || q.includes('push pull') || q.includes('ppl') || q.includes('upper lower') || q.includes('full body') || q.includes('exercise') || q.includes('gym')) {
      return `
### 🏋️‍♂️ Workout Split Recommendations
Depending on how many days you can train per week:
• **2 Days:** **Full Body A / B** (Mon & Thu) — hits every muscle group twice weekly.
• **3 Days:** **Push / Pull / Legs** or **Full Body 3x** (Mon/Wed/Fri) — great recovery for natural lifters.
• **4 Days (Gold Standard):** **Upper / Lower Split** (Upper A, Lower A, Upper B, Lower B) — scientifically proven for maximum hypertrophy and recovery.
• **5 Days:** **UL-PPL Hybrid** (Upper Power, Lower Power, Push Pump, Pull Pump, Legs Pump).
• **6 Days:** **Push / Pull / Legs (PPL x 2)** — for advanced high-volume lifters.

*Tip: You can customize and generate your complete day-by-day workout routine with sets and reps inside the **Workout Split** tab!*
      `;
    }

    // CHEST WORKOUT / BENCH / SQUAT / DEADLIFT
    if (q.includes('bench') || q.includes('squat') || q.includes('deadlift') || q.includes('chest') || q.includes('pr') || q.includes('plateau') || q.includes('1rm') || q.includes('strength')) {
      const bestBench = prs.find(p => p.exercise.toLowerCase().includes('bench'));
      return `
### ⚡ Strength & Compound Overload Guide
${bestBench ? `*Your current Bench PR: **${bestBench.weightKg} kg x ${bestBench.reps} reps** (1RM: ${bestBench.estimated1RM} kg)*\n` : ''}
1. **Optimize Setup & Arch:** Retract and depress your scapulae into the bench, drive your heels into the floor, and grip the bar as hard as possible to recruit more motor units.
2. **Frequency (2x/week):** Train core lifts twice a week: Day 1 Heavy Strength (3–5 reps), Day 2 Paused Bench or Incline Dumbbell Press (6–10 reps).
3. **Address Weak Points:**
   - Weak off chest? Add **spoto press** or **2-second paused reps**.
   - Lockout sticking point? Strengthen triceps with **close-grip bench press** and **weighted dips**.
4. **Deload:** If you have been stuck for 3+ weeks, reduce weight by 40% for one week to allow neurological recovery.
      `;
    }

    // SUPPLEMENTS (Creatine, Whey, Pre-workout, Ashwagandha, Vitamins)
    if (q.includes('creatine') || q.includes('supplement') || q.includes('pre workout') || q.includes('caffeine') || q.includes('ashwagandha') || q.includes('vitamin') || q.includes('bcaa')) {
      return `
### 💊 The Science-Backed Supplement Hierarchy
1. **Creatine Monohydrate (Tier 1):**
   - **Dose:** 3 to 5g daily (any time of day with water).
   - **Function:** Increases intramuscular ATP-CP stores, boosting strength by 5–15% and increasing muscle cell hydration. No loading phase needed.
2. **Whey Protein Isolate (Tier 1):**
   - Fast-digesting protein convenient for post-workout recovery or meeting your daily protein targets.
3. **Caffeine (Tier 2):**
   - 150–200mg taken 30–45 mins pre-workout improves muscular power and focus.
4. **Vitamin D3 & Omega-3 Fish Oil (Tier 1 for Health):**
   - Supports hormonal testosterone production, joint health, and reduces inflammation.
5. **Overhyped / Skip:** BCAAs (unnecessary if your daily protein intake is adequate).
      `;
    }

    // WATER & HYDRATION
    if (q.includes('water') || q.includes('hydrate') || q.includes('hydration') || q.includes('fluid')) {
      const waterLiters = (profile.weight * 0.035).toFixed(1);
      return `
### 💧 Daily Water & Hydration Target
- **Your Baseline Need:** Aim for **${waterLiters} Liters of water daily** (~${Math.round(waterLiters * 4)} standard glasses).
- **Workout Days:** Drink an additional 500ml–750ml during and after your training session to replace lost sweat.
- **Why It Matters:** A mere **2% drop in hydration** causes a measurable 10–15% decline in muscular power output, impairs fat metabolism, and triggers false hunger signals!
- **Rule of Thumb:** Your urine should be pale straw yellow throughout the day.
      `;
    }

    // DIABETES & BLOOD SUGAR
    if (q.includes('diabet') || q.includes('sugar') || q.includes('glucose') || q.includes('insulin') || q.includes('a1c')) {
      return `
### 🩺 Clinical Protocol: Type 2 Diabetes & Pre-Diabetes
1. **Low Glycemic Load:** Focus on complex carbs with high soluble fiber (steel-cut oats, lentils, moong dal, quinoa, chia seeds).
2. **The Food Pairing Rule:** Never consume carbohydrates in isolation. Always pair carbs with protein and healthy fats to slow gastric emptying and flatten the glucose curve.
3. **Resistance Training Benefit:** Weight lifting activates non-insulin-mediated glucose uptake (GLUT4 transporter translocation), directly lowering blood sugar.
4. **Target Fiber:** Keep daily fiber intake **above 35–40 grams**.
      `;
    }

    // HYPERTENSION & BLOOD PRESSURE
    if (q.includes('hypertension') || q.includes('blood pressure') || q.includes('bp') || q.includes('sodium') || q.includes('salt')) {
      return `
### 🩺 Clinical Protocol: Hypertension & High Blood Pressure
1. **Sodium Restriction:** Keep sodium **strictly below 1,500mg daily**. Avoid processed deli meats, canned soups, and salty sauces.
2. **Potassium & Magnesium:** Boost potassium intake (>3,500mg/day) from bananas, spinach, avocado, sweet potatoes, and coconut water to relax vascular walls.
3. **Nitric Oxide Vasodilators:** Beetroot and blueberries provide dietary nitrates that promote nitric oxide synthesis, naturally lowering systolic pressure.
4. **Exercise Note:** Breathe continuously during lifting sets; avoid long breath-holding (Valsalva).
      `;
    }

    // PCOS & HORMONES
    if (q.includes('pcos') || q.includes('pcod') || q.includes('hormon') || q.includes('period') || q.includes('ovary')) {
      return `
### 🩺 Clinical Protocol: PCOS & Endocrine Balance
1. **Root Mechanism:** High circulating insulin stimulates ovarian androgen production, disrupting ovulation and causing fatigue.
2. **Anti-Inflammatory Food Base:** High omega-3s (wild salmon, chia seeds, walnuts), zinc-rich foods (pumpkin seeds), and leafy greens.
3. **Spearmint Tea:** 1–2 cups of organic spearmint tea daily has clinical evidence in reducing free circulating androgens.
4. **Low-GI Carbs Only:** Replace white rice, white bread, and sweets with oats, quinoa, and lentils.
      `;
    }

    // GERD, ACID REFLUX & HEARTBURN
    if (q.includes('gerd') || q.includes('acid') || q.includes('reflux') || q.includes('heartburn') || q.includes('stomach')) {
      return `
### 🩺 Clinical Protocol: GERD & Acid Reflux Relief
1. **Eliminate Triggers:** Cut out citrus fruits, tomato sauce/puree, raw onions, garlic, hot chili peppers, dark chocolate, and carbonated sodas.
2. **Smaller Meal Frequency:** Eat 4–5 smaller, lighter meals instead of 2–3 heavy feasts to prevent intra-gastric pressure against the lower esophageal sphincter (LES).
3. **The 3-Hour Sleep Rule:** Finish your last meal or snack at least **3 full hours before lying down**.
4. **Soothing Foods:** Oatmeal, steamed zucchini, bananas, chamomile/ginger tea, and grilled chicken breast.
      `;
    }

    // CHOLESTEROL & HEART HEALTH
    if (q.includes('cholesterol') || q.includes('ldl') || q.includes('hdl') || q.includes('triglyceride') || q.includes('heart')) {
      return `
### 🩺 Clinical Protocol: High Cholesterol & Lipid Optimization
1. **Saturated Fat Cap:** Keep saturated fat strictly **under 6% of total calories** (limit butter, palm oil, fatty meats, and full-fat cheese).
2. **Soluble Beta-Glucans:** Eat 60–80g of whole rolled oats or barley daily. Beta-glucan forms a gel in the intestine that binds bile acids and pulls LDL cholesterol out of circulation.
3. **Monounsaturated Fats (MUFAs):** Use extra virgin olive oil, eat half an avocado daily, and snack on raw almonds and walnuts.
      `;
    }

    // REST DAYS, SLEEP & RECOVERY
    if (q.includes('rest') || q.includes('sleep') || q.includes('recover') || q.includes('sore') || q.includes('doms') || q.includes('tired')) {
      return `
### 🛌 Rest, Recovery & DOMS (Muscle Soreness)
1. **Muscles Grow During Rest:** Lifting creates microscopic tears in muscle fibers; protein synthesis and tissue remodeling occur when you are resting and sleeping.
2. **Sleep Duration:** Aim for **7 to 9 hours of uninterrupted sleep**. 80% of natural growth hormone (HGH) is secreted during deep Stage 3 slow-wave sleep.
3. **Active Recovery:** On rest days, do not remain completely sedentary. Go for an easy 30-minute walk (5,000–8,000 steps) and do gentle stretching to promote blood flow.
4. **Soreness (DOMS):** Delayed onset muscle soreness is normal when trying new exercises. It does not mean you injured yourself, but ensure you drink plenty of water and hit your protein target.
      `;
    }

    // FASTING / INTERMITTENT FASTING
    if (q.includes('fasting') || q.includes('intermittent') || q.includes('16/8') || q.includes('omad')) {
      return `
### ⏳ Intermittent Fasting (16/8 Method)
- **How It Works:** A 16-hour fasting window with an 8-hour eating window (e.g., eat from 12:00 PM to 8:00 PM).
- **Effectiveness:** Fasting does not magically burn more fat than standard calorie restriction; however, it is an excellent tool for appetite control and adherence if you prefer larger meals.
- **Lifting Considerations:** Try to get at least 2 separate protein feedings of 35–45g spaced 3–4 hours apart during your 8-hour window to maintain muscle protein synthesis.
      `;
    }

    // DEFAULT COMPREHENSIVE INTELLIGENT ANSWER
    return `
### 💡 PulseBot Coaching Analysis
Regarding: **"${userQuery}"**

1. **Adherence & Consistency:**
   - In fitness and nutrition, 80% of your body transformation is governed by hitting your daily calorie target (**${targets.calories} kcal**) and protein intake (**${targets.protein}g**).
2. **Progressive Resistance:**
   - Always log your weights in the **PR Vault**. Whether training at home or at the gym, progressively challenging your muscles forces adaptation.
3. **Actionable Step:**
   - Log today's meals in the **Macro Calculator**, aim to complete your **${stepData.goal.toLocaleString()} steps**, and follow your generated **Workout Split**!

*Would you like more specific advice on nutrition, meal recipes, exercise form, or your medical diet directives? Just ask!*
    `;
    } catch (err) {
      console.error('generateAnswer internal error:', err);
      return `
### 💡 PulseBot Response
I received your question: **"${userQuery}"**.

For optimal fitness and body recomposition:
1. **Caloric Adherence:** Stick to your calculated targets in the **Macro Calculator**.
2. **Protein Distribution:** Consume 30–40g of protein across meals to maximize muscle protein synthesis.
3. **Daily Strides:** Hit your 10,000 steps goal to accelerate fat burning.

*Ask me about any specific meal, workout split, PR goal, or health condition!*
      `;
    }
  },

  renderMessages() {
    const containers = [document.getElementById('chatbot-messages'), document.getElementById('full-chatbot-messages')];
    
    containers.forEach(container => {
      if (!container) return;

      container.innerHTML = this.messages.map(m => {
        const isUser = m.role === 'user';
        // Clean markdown formatting
        let formattedText = m.text
          .replace(/### (.*?)\n/g, '<h4 class="font-bold text-white text-xs mt-2 mb-1">$1</h4>')
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-400 font-semibold">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
          .replace(/• (.*?)\n/g, '<div class="flex items-start gap-1.5 my-0.5"><span class="text-emerald-400">•</span><span>$1</span></div>')
          .replace(/\n/g, '<br>');

        return `
          <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3">
            <div class="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500 font-mono">
              <span>${isUser ? 'You' : '⚡ PulseBot AI Coach'}</span>
              <span>•</span>
              <span>${m.timestamp}</span>
            </div>
            <div class="max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
              isUser 
                ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none shadow-md' 
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
            }">
              ${formattedText}
            </div>
          </div>
        `;
      }).join('');
    });

    this.scrollToBottom();
  },

  scrollToBottom() {
    const containers = [document.getElementById('chatbot-messages'), document.getElementById('full-chatbot-messages')];
    containers.forEach(container => {
      if (container) container.scrollTop = container.scrollHeight;
    });
  }
};
