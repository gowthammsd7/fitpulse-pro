// FitPulse Pro - Clinical Diet & Body Condition Engine

const DietModule = {
  init() {
    this.populateFormFromProfile();
    this.bindEvents();
    // If user already has a saved plan, render it; otherwise hide result panel
    const savedPlan = StorageManager.getDietPlan();
    if (savedPlan) {
      this.renderDietPlan(savedPlan);
    } else {
      const resultContainer = document.getElementById('diet-plan-result');
      if (resultContainer) resultContainer.classList.add('hidden');
    }
  },

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;
    const dietForm = document.getElementById('diet-assessment-form');
    if (dietForm) {
      dietForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.generateDietPlan();
      });
    }

    // Condition select change listener to show clinical hint
    const conditionSelect = document.getElementById('diet-condition-select');
    if (conditionSelect) {
      conditionSelect.addEventListener('change', (e) => {
        this.updateConditionInfo(e.target.value);
      });
    }
  },

  populateFormFromProfile() {
    const profile = StorageManager.getProfile();
    if (!profile) return;

    if (document.getElementById('diet-age')) document.getElementById('diet-age').value = profile.age || 26;
    if (document.getElementById('diet-gender')) document.getElementById('diet-gender').value = profile.gender || 'male';
    if (document.getElementById('diet-height')) document.getElementById('diet-height').value = profile.height || 178;
    if (document.getElementById('diet-weight')) document.getElementById('diet-weight').value = profile.weight || 75;
    if (document.getElementById('diet-target-weight')) document.getElementById('diet-target-weight').value = profile.targetWeight || 72;
    if (document.getElementById('diet-activity')) document.getElementById('diet-activity').value = profile.activityLevel || 1.55;
    if (document.getElementById('diet-goal')) document.getElementById('diet-goal').value = profile.goal || 'fat_loss';
    if (document.getElementById('diet-condition-select')) {
      document.getElementById('diet-condition-select').value = profile.condition || 'healthy';
      this.updateConditionInfo(profile.condition || 'healthy');
    }
    if (document.getElementById('diet-pref-select')) document.getElementById('diet-pref-select').value = profile.dietPref || 'omnivore';
  },

  updateConditionInfo(conditionKey) {
    const infoBox = document.getElementById('condition-clinical-preview');
    const condition = MEDICAL_CONDITIONS[conditionKey] || MEDICAL_CONDITIONS.healthy;
    if (!infoBox) return;

    infoBox.innerHTML = `
      <div class="p-4 rounded-xl border border-slate-700/80 bg-slate-900/60">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-3 h-3 rounded-full" style="background-color: ${condition.color}"></span>
          <span class="font-semibold text-slate-200 text-sm">${condition.name}</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">${condition.badge}</span>
        </div>
        <p class="text-xs text-slate-400 mb-2">${condition.description}</p>
        <ul class="text-xs text-slate-300 space-y-1 list-disc list-inside">
          ${condition.guidelines.map(g => `<li>${g}</li>`).join('')}
        </ul>
      </div>
    `;
  },

  calculateMetabolism(age, gender, heightCm, weightKg, activityMultiplier, goal, conditionKey) {
    // Mifflin-St Jeor Equation
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = Math.round(bmr * activityMultiplier);

    // Goal adjustments
    let goalCalorieDelta = 0;
    if (goal === 'fat_loss_aggressive') goalCalorieDelta = -500;
    else if (goal === 'fat_loss') goalCalorieDelta = -350;
    else if (goal === 'maintenance') goalCalorieDelta = 0;
    else if (goal === 'lean_bulk') goalCalorieDelta = +250;
    else if (goal === 'heavy_bulk') goalCalorieDelta = +500;

    let targetCalories = Math.max(1200, tdee + goalCalorieDelta);

    const condition = MEDICAL_CONDITIONS[conditionKey] || MEDICAL_CONDITIONS.healthy;

    // Macro computation based on clinical parameters
    let proteinGrams, fatGrams, carbsGrams;

    if (conditionKey === 'ckd_early') {
      // CKD requires controlled protein of ~0.8g/kg
      proteinGrams = Math.round(weightKg * 0.8);
      const proteinKcal = proteinGrams * 4;
      const fatKcal = targetCalories * condition.fatRatio;
      fatGrams = Math.round(fatKcal / 9);
      const carbKcal = targetCalories - proteinKcal - fatKcal;
      carbsGrams = Math.round(carbKcal / 4);
    } else {
      // General & clinical percentage allocations
      let cRatio = condition.carbRatio;
      let pRatio = condition.proteinRatio;
      let fRatio = condition.fatRatio;

      proteinGrams = Math.round((targetCalories * pRatio) / 4);
      fatGrams = Math.round((targetCalories * fRatio) / 9);
      carbsGrams = Math.round((targetCalories * cRatio) / 4);
    }

    // Hydration: 35ml per kg of bodyweight
    const waterLiters = (weightKg * 0.035).toFixed(1);

    return {
      bmr: Math.round(bmr),
      tdee: tdee,
      targetCalories: targetCalories,
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams,
      waterLiters: parseFloat(waterLiters),
      condition: condition
    };
  },

  generateDietPlan() {
    const age = parseInt(document.getElementById('diet-age').value) || 26;
    const gender = document.getElementById('diet-gender').value || 'male';
    const height = parseFloat(document.getElementById('diet-height').value) || 178;
    const weight = parseFloat(document.getElementById('diet-weight').value) || 75;
    const targetWeight = parseFloat(document.getElementById('diet-target-weight').value) || weight;
    const activity = parseFloat(document.getElementById('diet-activity').value) || 1.55;
    const goal = document.getElementById('diet-goal').value || 'fat_loss';
    const conditionKey = document.getElementById('diet-condition-select').value || 'healthy';
    const dietPref = document.getElementById('diet-pref-select').value || 'omnivore';

    // Save profile state
    StorageManager.saveProfile({
      age, gender, height, weight, targetWeight,
      activityLevel: activity, goal, condition: conditionKey, dietPref
    });

    const meta = this.calculateMetabolism(age, gender, height, weight, activity, goal, conditionKey);

    // Build personalized meals tailored to preferences & condition
    const meals = this.buildCuratedMeals(meta.targetCalories, dietPref, conditionKey);

    const fullPlan = {
      createdAt: new Date().toLocaleDateString(),
      meta: meta,
      dietPref: dietPref,
      conditionKey: conditionKey,
      meals: meals
    };

    StorageManager.saveDietPlan(fullPlan);
    this.renderDietPlan(fullPlan);

    App.showToast('Clinical Diet Plan generated successfully!', 'success');
  },

  buildCuratedMeals(totalCalories, dietPref, conditionKey) {
    const condition = MEDICAL_CONDITIONS[conditionKey] || MEDICAL_CONDITIONS.healthy;

    // Distribute calories across 5 meals:
    // Breakfast: 25%, Snack 1: 10%, Lunch: 35%, Snack 2: 10%, Dinner: 20%
    const cBreakfast = Math.round(totalCalories * 0.25);
    const cSnack1 = Math.round(totalCalories * 0.10);
    const cLunch = Math.round(totalCalories * 0.35);
    const cSnack2 = Math.round(totalCalories * 0.10);
    const cDinner = Math.round(totalCalories * 0.20);

    const isVeg = dietPref === 'vegetarian';
    const isVegan = dietPref === 'vegan';
    const isKeto = dietPref === 'keto';

    // Tailored meal descriptions based on condition & preference
    let breakfastItem, lunchItem, dinnerItem, snack1Item, snack2Item;
    let bRationale, lRationale, dRationale;

    if (conditionKey === 'diabetes') {
      bRationale = 'Low-GI steel cut oats and chia seeds deliver soluble beta-glucans to flatten glucose spikes and support GLP-1 secretion.';
      lRationale = 'High-fiber legumes and lean protein slow carbohydrate absorption; zero refined starches.';
      dRationale = 'Light dinner with non-starchy leafy greens prevents dawn phenomenon morning hyperglycemia.';

      breakfastItem = isVegan 
        ? 'Steel-Cut Oats Bowl with Chia Seeds, Unsweetened Almond Milk, Plant Protein & Ceylon Cinnamon' 
        : '3-Egg Omelet (2 whites, 1 whole) with Spinach, Mushrooms, Avocado & 1 slice Sprouted Grain Bread';

      snack1Item = 'Raw Walnuts (25g) with Green Apple slices sprinkled with cinnamon';

      lunchItem = isVegan 
        ? 'Brown Rice with Moong Dal, Steamed Tofu, Stir-Fried Broccoli and Flaxseed drizzle'
        : (isVeg ? 'Grilled Low-Fat Paneer Salad with Black Beans, Quinoa, Cucumber and Lemon-Olive Dressing' 
                : 'Grilled Herb Chicken Breast with Quinoa, Roasted Asparagus and Olive Oil');

      snack2Item = 'Cucumber & Bell Pepper slices with 2 tbsp Roasted Chickpea Hummus';

      dinnerItem = isVegan 
        ? 'Tempeh Stir-Fry with Bok Choy, Bell Peppers, Sesame Seeds and Cauliflower Rice'
        : (isVeg ? 'Palak Paneer (Low-Fat) with 1 Multigrain Roti and Tomato-Cucumber Salad' 
                : 'Baked Wild Salmon with Steamed Broccoli, Green Beans and Small Sweet Potato');
    } 
    else if (conditionKey === 'hypertension') {
      bRationale = 'DASH-compliant, naturally sodium-free, rich in potassium and magnesium to promote nitric oxide vasodilation.';
      lRationale = 'Heart-healthy leafy greens and beetroot rich in dietary nitrates to lower arterial vascular resistance.';
      dRationale = 'Low sodium (<350mg), rich in calcium and omega-3 fatty acids for arterial compliance.';

      breakfastItem = isVegan 
        ? 'Potassium-Rich Oatmeal with Sliced Banana, Blueberries, Flaxseed & Soy Milk' 
        : 'Greek Yogurt Parfait with Fresh Blueberries, Crushed Walnuts and Pumpkin Seeds';

      snack1Item = '1 Medium Banana with 10 Raw Unsalted Almonds';

      lunchItem = isVegan 
        ? 'Lentil & Sweet Potato Mash with Steamed Beetroot and Kale Salad' 
        : (isVeg ? 'Chickpea Curry (Low Sodium) with Brown Rice and Beetroot Salad' 
                : 'Lemon Herb Grilled Chicken with Roasted Sweet Potato and Spinach Salad');

      snack2Item = 'Fresh Watermelon slices with Chia Seed Pudding';

      dinnerItem = isVegan 
        ? 'Steamed Edamame & Tofu Buddha Bowl with Avocado, Carrots and Sesame Lime' 
        : (isVeg ? 'Paneer Tikka (Unsalted marinade) with Quinoa and Sauteed Zucchini' 
                : 'Baked Cod or Salmon with Steamed Asparagus, Garlic-Infused Olive Oil and Steamed Rice');
    }
    else if (conditionKey === 'pcos') {
      bRationale = 'High protein and anti-inflammatory healthy fats to suppress LH surges and improve cellular insulin signaling.';
      lRationale = 'Rich in zinc, magnesium, and slow-burning carbs to maintain hormonal balance and combat fatigue.';
      dRationale = 'Spearmint tea pairing with omega-3 rich dinner supports androgen reduction and restful sleep.';

      breakfastItem = isVegan 
        ? 'Tofu Scramble with Turmeric, Baby Spinach, Avocado slices and Pumpkin Seeds' 
        : 'Poached Eggs over Avocado Toast on Sprouted Sourdough with Microgreens';

      snack1Item = 'Cup of Spearmint Tea with 2 Brazil Nuts & 10 Almonds';

      lunchItem = isVegan 
        ? 'Tempeh & Edamame Bowl with Brown Rice, Roasted Broccoli, and Tahini dressing' 
        : (isVeg ? 'Quinoa & Paneer Bowl with Sliced Avocado, Pumpkin Seeds, and Mixed Greens' 
                : 'Grilled Salmon with Wild Rice, Steamed Asparagus and Olive Oil');

      snack2Item = 'Coconut Yogurt with Ground Flaxseeds and Berries';

      dinnerItem = isVegan 
        ? 'Moong Dal Khichdi with lots of veggies, ginger and cumin' 
        : (isVeg ? 'Sautéed Tofu & Vegetable Curry with 1 Millet Roti' 
                : 'Herb-Roasted Chicken Breast with Zucchini Noodles and Roasted Sweet Potato');
    }
    else if (conditionKey === 'cholesterol') {
      bRationale = 'Rich in beta-glucans from whole oats to sequester intestinal bile acids and lower circulating LDL-C.';
      lRationale = 'Loaded with monounsaturated fatty acids (MUFA) and phytosterols to optimize ApoB and HDL levels.';
      dRationale = 'EPA & DHA omega-3 fatty acids lower serum triglycerides and protect endothelial lining.';

      breakfastItem = 'Heart-Check Rolled Oats with 1 tbsp Ground Flaxseed, Walnuts & Fresh Blueberries';
      snack1Item = '1 Crisp Green Apple with 15 Raw Unsalted Almonds';
      lunchItem = isVegan 
        ? 'Warm Quinoa & Black Bean Salad with Sliced Avocado, Diced Tomatoes & Extra Virgin Olive Oil' 
        : (isVeg ? 'Lentil Soup with Brown Rice, Sautéed Spinach, and Olive Oil Dressing' 
                : 'Grilled Salmon Fillet with Quinoa, Steamed Broccoli and Sliced Avocado');
      snack2Item = 'Carrot & Celery sticks with 2 tbsp Homemade Hummus';
      dinnerItem = isVegan 
        ? 'Grilled Tofu & Mushroom Skewers with Brown Rice and Asparagus' 
        : (isVeg ? 'Low-Fat Cottage Cheese / Paneer with Steamed Vegetables and 1 Roti' 
                : 'Baked White Fish (Cod/Halibut) with Sweet Potato Wedges and Steamed Green Beans');
    }
    else {
      // General Fitness / Healthy
      bRationale = 'Balanced macronutrient ignition providing sustained amino acid delivery and complex glycogen replenishment.';
      lRationale = 'High thermic effect of food (TEF) from lean protein paired with sustained complex carbohydrates.';
      dRationale = 'Easily digestible restorative dinner with adequate micronutrients for overnight muscular recovery.';

      breakfastItem = isVegan 
        ? 'Plant Protein Smoothie Bowl with Rolled Oats, Banana, Peanut Butter & Chia Seeds' 
        : (isVeg ? 'Oatmeal cooked with Low-Fat Milk, Whey Protein Scoop, Almonds & Banana' 
                : '3 Scrambled Eggs with 2 Slices Whole Wheat Toast and Avocado');

      snack1Item = 'Non-Fat Greek Yogurt (or Plant Yogurt) with Mixed Berries & 15g Almonds';

      lunchItem = isVegan 
        ? 'Tofu & Chickpea Quinoa Bowl with Sautéed Bell Peppers and Tahini' 
        : (isVeg ? 'Paneer Bhurji / Curry with 2 Whole Wheat Rotis and Mixed Salad' 
                : 'Grilled Chicken Breast (180g) with 1 cup Brown Rice & Steamed Broccoli');

      snack2Item = 'Whole Wheat Toast with 1 tbsp Natural Peanut Butter & Sliced Banana';

      dinnerItem = isVegan 
        ? 'Spiced Lentil Dal with Brown Basmati Rice and Roasted Asparagus' 
        : (isVeg ? 'Sautéed Tofu with Stir-Fried Veggies, Sweet Potato and Sesame Seeds' 
                : 'Baked Salmon or Lean Turkey with Roasted Sweet Potatoes and Green Salad');
    }

    return [
      {
        slot: 'Breakfast (07:30 - 08:30)',
        name: breakfastItem,
        calories: cBreakfast,
        protein: Math.round((cBreakfast * condition.proteinRatio) / 4),
        carbs: Math.round((cBreakfast * condition.carbRatio) / 4),
        fat: Math.round((cBreakfast * condition.fatRatio) / 9),
        rationale: bRationale
      },
      {
        slot: 'Mid-Morning Fuel (11:00 AM)',
        name: snack1Item,
        calories: cSnack1,
        protein: Math.round((cSnack1 * condition.proteinRatio) / 4),
        carbs: Math.round((cSnack1 * condition.carbRatio) / 4),
        fat: Math.round((cSnack1 * condition.fatRatio) / 9),
        rationale: 'Maintains steady blood glucose and prevents midday cortisol-induced cravings.'
      },
      {
        slot: 'Power Lunch (01:00 - 02:00 PM)',
        name: lunchItem,
        calories: cLunch,
        protein: Math.round((cLunch * condition.proteinRatio) / 4),
        carbs: Math.round((cLunch * condition.carbRatio) / 4),
        fat: Math.round((cLunch * condition.fatRatio) / 9),
        rationale: lRationale
      },
      {
        slot: 'Pre/Post-Workout Snack (05:00 PM)',
        name: snack2Item,
        calories: cSnack2,
        protein: Math.round((cSnack2 * condition.proteinRatio) / 4),
        carbs: Math.round((cSnack2 * condition.carbRatio) / 4),
        fat: Math.round((cSnack2 * condition.fatRatio) / 9),
        rationale: 'Readily available glycogen and branch-chain amino acids for exercise performance.'
      },
      {
        slot: 'Restorative Dinner (08:00 - 08:45 PM)',
        name: dinnerItem,
        calories: cDinner,
        protein: Math.round((cDinner * condition.proteinRatio) / 4),
        carbs: Math.round((cDinner * condition.carbRatio) / 4),
        fat: Math.round((cDinner * condition.fatRatio) / 9),
        rationale: dRationale
      }
    ];
  },

  renderDietPlan(plan) {
    const container = document.getElementById('diet-plan-result');
    if (!container) return;

    const meta = plan.meta;
    const cond = meta.condition;

    container.innerHTML = `
      <!-- Diet Header Card -->
      <div class="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl mb-6 shadow-xl relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 w-40 h-40 rounded-full blur-3xl opacity-20" style="background-color: ${cond.color}"></div>
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-3 h-3 rounded-full" style="background-color: ${cond.color}"></span>
              <h3 class="text-xl font-bold text-white">${cond.name} Plan</h3>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">${cond.badge}</span>
            </div>
            <p class="text-xs text-slate-400">Dietary Style: <span class="text-emerald-400 capitalize font-medium">${plan.dietPref}</span> • Generated on ${plan.createdAt}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="DietModule.applyToMacroTracker()" 
                    class="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
              Apply to Macro Tracker
            </button>
            <button onclick="window.print()" 
                    class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1.5 border border-slate-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
              Print / PDF
            </button>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-700/60">
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div class="text-[11px] text-slate-400 uppercase tracking-wider">Daily Target</div>
            <div class="text-lg font-extrabold text-emerald-400 mt-0.5">${meta.targetCalories} <span class="text-xs font-normal text-slate-400">kcal</span></div>
            <div class="text-[10px] text-slate-500">TDEE: ${meta.tdee} kcal</div>
          </div>
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div class="text-[11px] text-slate-400 uppercase tracking-wider">Protein</div>
            <div class="text-lg font-extrabold text-cyan-400 mt-0.5">${meta.protein}g</div>
            <div class="text-[10px] text-slate-500">${Math.round((meta.protein * 4 / meta.targetCalories) * 100)}% of total</div>
          </div>
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div class="text-[11px] text-slate-400 uppercase tracking-wider">Carbohydrates</div>
            <div class="text-lg font-extrabold text-amber-400 mt-0.5">${meta.carbs}g</div>
            <div class="text-[10px] text-slate-500">${Math.round((meta.carbs * 4 / meta.targetCalories) * 100)}% of total</div>
          </div>
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div class="text-[11px] text-slate-400 uppercase tracking-wider">Healthy Fats</div>
            <div class="text-lg font-extrabold text-rose-400 mt-0.5">${meta.fat}g</div>
            <div class="text-[10px] text-slate-500">${Math.round((meta.fat * 9 / meta.targetCalories) * 100)}% of total</div>
          </div>
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div class="text-[11px] text-slate-400 uppercase tracking-wider">Daily Water</div>
            <div class="text-lg font-extrabold text-sky-400 mt-0.5">${meta.waterLiters}L</div>
            <div class="text-[10px] text-slate-500">~${Math.round(meta.waterLiters * 4)} glasses</div>
          </div>
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div class="text-[11px] text-slate-400 uppercase tracking-wider">Fiber Target</div>
            <div class="text-lg font-extrabold text-emerald-300 mt-0.5">${cond.fiberTargetG}g</div>
            <div class="text-[10px] text-slate-500">Sodium: &lt;${cond.sodiumLimitMg}mg</div>
          </div>
        </div>
      </div>

      <!-- Meal Schedule Cards -->
      <div class="space-y-4">
        <h4 class="text-md font-bold text-slate-200 flex items-center gap-2">
          <span>🥗 Structured Daily Meal Schedule</span>
          <span class="text-xs text-slate-400 font-normal">(Engineered for your body condition)</span>
        </h4>

        ${plan.meals.map((m, idx) => `
          <div class="p-4 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl transition duration-200">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">${idx + 1}</span>
                <span class="font-semibold text-white text-sm">${m.slot}</span>
              </div>
              <div class="flex items-center gap-3 text-xs">
                <span class="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-semibold">${m.calories} kcal</span>
                <span class="text-slate-400">P: <strong class="text-cyan-400">${m.protein}g</strong></span>
                <span class="text-slate-400">C: <strong class="text-amber-400">${m.carbs}g</strong></span>
                <span class="text-slate-400">F: <strong class="text-rose-400">${m.fat}g</strong></span>
                <button onclick="DietModule.logSuggestedMeal(${idx})" 
                        title="Add to today's macro tracker" 
                        class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium flex items-center gap-1 text-[11px]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                  Log This
                </button>
              </div>
            </div>

            <p class="text-sm font-medium text-slate-200 mb-2 pl-8">${m.name}</p>

            <div class="ml-8 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
              <span class="text-emerald-400 text-sm">💡</span>
              <div>
                <strong class="text-slate-300">Why this fits your condition:</strong> ${m.rationale}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  applyToMacroTracker() {
    const plan = StorageManager.getDietPlan();
    if (!plan || !plan.meta) return;

    StorageManager.saveMacroTargets({
      calories: plan.meta.targetCalories,
      protein: plan.meta.protein,
      carbs: plan.meta.carbs,
      fat: plan.meta.fat,
      waterLiters: plan.meta.waterLiters
    });

    App.showToast(`Macro targets updated: ${plan.meta.targetCalories} kcal (P:${plan.meta.protein}g C:${plan.meta.carbs}g F:${plan.meta.fat}g)`, 'success');
    if (window.MacrosModule && typeof MacrosModule.updateMacroSummary === 'function') {
      MacrosModule.updateMacroSummary();
    }
    if (window.App && typeof App.updateDashboard === 'function') {
      App.updateDashboard();
    }
  },

  logSuggestedMeal(mealIndex) {
    const plan = StorageManager.getDietPlan();
    if (!plan || !plan.meals || !plan.meals[mealIndex]) return;

    const m = plan.meals[mealIndex];
    let mealType = 'snack';
    if (mealIndex === 0) mealType = 'breakfast';
    else if (mealIndex === 2) mealType = 'lunch';
    else if (mealIndex === 4) mealType = 'dinner';

    const logItem = {
      mealType: mealType,
      name: m.name,
      servingDesc: '1 curated meal',
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat
    };

    StorageManager.addMeal(logItem);
    App.showToast(`Added ${m.slot} directly to today's Macro Log!`, 'success');

    if (window.MacrosModule && typeof MacrosModule.renderLoggedMeals === 'function') {
      MacrosModule.renderLoggedMeals();
      MacrosModule.updateMacroSummary();
    }
    if (window.App && typeof App.updateDashboard === 'function') {
      App.updateDashboard();
    }
  }
};
