// FitPulse Pro - LocalStorage Reactive State Management & Persistence

const STORAGE_KEYS = {
  PROFILE: 'fitpulse_profile',
  MACRO_TARGETS: 'fitpulse_macro_targets',
  MEALS: 'fitpulse_meals_log',
  CUSTOM_FOODS: 'fitpulse_custom_foods',
  STEPS: 'fitpulse_steps_log',
  STEP_GOAL: 'fitpulse_step_goal',
  PRS: 'fitpulse_prs',
  WORKOUT_SPLIT: 'fitpulse_workout_split',
  DIET_PLAN: 'fitpulse_diet_plan',
  ACHIEVEMENTS: 'fitpulse_achievements'
};

const StorageManager = {
  // Scopes storage keys to the currently logged in user account for full multi-tenant data isolation
  getScopedKey(key) {
    if (window.AuthManager && typeof AuthManager.getCurrentUser === 'function') {
      const user = AuthManager.getCurrentUser();
      if (user && user.id) {
        return `fitpulse_u_${user.id}_${key}`;
      }
    }
    return key;
  },

  get(key, defaultValue = null) {
    try {
      const scopedKey = this.getScopedKey(key);
      const item = localStorage.getItem(scopedKey);
      if (item !== null) {
        return JSON.parse(item);
      }
      // Check legacy unscoped fallback only if user is default/legacy
      const legacyItem = localStorage.getItem(key);
      if (legacyItem !== null) {
        return JSON.parse(legacyItem);
      }
      return defaultValue;
    } catch (err) {
      console.error(`Error reading ${key} from localStorage:`, err);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      const scopedKey = this.getScopedKey(key);
      localStorage.setItem(scopedKey, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Error writing ${key} to localStorage:`, err);
      return false;
    }
  },

  getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Get user profile or fallback defaults
  getProfile() {
    const user = window.AuthManager ? AuthManager.getCurrentUser() : null;
    const defaultProfile = user ? {
      age: user.age || 26,
      gender: user.gender || 'male',
      height: user.height || 178,
      weight: user.weight || 75,
      targetWeight: user.goal === 'fat_loss' ? (user.weight || 75) - 4 : (user.weight || 75),
      activityLevel: 1.5,
      goal: user.goal || 'fat_loss',
      condition: user.condition || 'healthy',
      dietPref: 'omnivore'
    } : {
      age: 26,
      gender: 'male',
      height: 178,
      weight: 75,
      targetWeight: 72,
      activityLevel: 1.55,
      goal: 'fat_loss',
      condition: 'healthy',
      dietPref: 'omnivore'
    };
    return this.get(STORAGE_KEYS.PROFILE, defaultProfile);
  },

  saveProfile(profile) {
    return this.set(STORAGE_KEYS.PROFILE, profile);
  },

  // Macro Targets
  getMacroTargets() {
    return this.get(STORAGE_KEYS.MACRO_TARGETS, {
      calories: 2200,
      protein: 165,
      carbs: 220,
      fat: 65,
      waterLiters: 3.5
    });
  },

  saveMacroTargets(targets) {
    return this.set(STORAGE_KEYS.MACRO_TARGETS, targets);
  },

  // Meals for a specific date (default today)
  getMeals(dateStr = this.getTodayString()) {
    const allLogs = this.get(STORAGE_KEYS.MEALS, {});
    return allLogs[dateStr] || [];
  },

  saveMealsForDate(dateStr, mealsArray) {
    const allLogs = this.get(STORAGE_KEYS.MEALS, {});
    allLogs[dateStr] = mealsArray;
    return this.set(STORAGE_KEYS.MEALS, allLogs);
  },

  addMeal(mealItem, dateStr = this.getTodayString()) {
    const currentMeals = this.getMeals(dateStr);
    const newItem = {
      id: 'm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...mealItem
    };
    currentMeals.push(newItem);
    this.saveMealsForDate(dateStr, currentMeals);
    return newItem;
  },

  deleteMeal(mealId, dateStr = this.getTodayString()) {
    let currentMeals = this.getMeals(dateStr);
    currentMeals = currentMeals.filter(m => m.id !== mealId);
    return this.saveMealsForDate(dateStr, currentMeals);
  },

  // Custom user-defined foods
  getCustomFoods() {
    return this.get(STORAGE_KEYS.CUSTOM_FOODS, []);
  },

  saveCustomFood(foodItem) {
    const list = this.getCustomFoods();
    const newFood = {
      id: 'cf_' + Date.now(),
      ...foodItem
    };
    list.unshift(newFood);
    this.set(STORAGE_KEYS.CUSTOM_FOODS, list);
    return newFood;
  },

  // Step Tracker
  getStepGoal() {
    return this.get(STORAGE_KEYS.STEP_GOAL, 10000);
  },

  saveStepGoal(goal) {
    return this.set(STORAGE_KEYS.STEP_GOAL, Number(goal));
  },

  getStepLogs() {
    return this.get(STORAGE_KEYS.STEPS, {});
  },

  getStepsForDate(dateStr = this.getTodayString()) {
    const logs = this.getStepLogs();
    if (logs[dateStr]) {
      return logs[dateStr];
    }
    return {
      steps: 0,
      goal: this.getStepGoal(),
      distanceKm: 0,
      caloriesBurned: 0
    };
  },

  saveStepsForDate(dateStr, stepCount, userWeightKg = 75) {
    const logs = this.getStepLogs();
    const count = Math.max(0, parseInt(stepCount) || 0);
    const goal = this.getStepGoal();

    // Stride length ~ 0.762 meters, 1 step = 0.000762 km
    const distanceKm = parseFloat(((count * 0.762) / 1000).toFixed(2));
    // Calorie burn approx: ~0.04 to 0.05 kcal per step based on body weight
    // Formula: (MET * 3.5 * weightKg / 200) * minutes
    // Walking average ~ 0.04 kcal/kg/1000 steps * weight
    const caloriesBurned = Math.round(count * 0.045 * (userWeightKg / 70));

    logs[dateStr] = {
      steps: count,
      goal: goal,
      distanceKm: distanceKm,
      caloriesBurned: caloriesBurned,
      updatedAt: new Date().toISOString()
    };

    this.set(STORAGE_KEYS.STEPS, logs);
    return logs[dateStr];
  },

  // Personal Records (PRs)
  getPRs() {
    return this.get(STORAGE_KEYS.PRS, []);
  },

  savePR(prData) {
    const prs = this.getPRs();
    const weight = parseFloat(prData.weight) || 0;
    const reps = parseInt(prData.reps) || 1;
    // Epley Formula for 1RM: Weight * (1 + Reps / 30)
    const estimated1RM = reps === 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10;

    const newPR = {
      id: 'pr_' + Date.now(),
      exercise: prData.exercise,
      weightKg: weight,
      reps: reps,
      estimated1RM: estimated1RM,
      date: prData.date || this.getTodayString(),
      rpe: prData.rpe || 9,
      notes: prData.notes || ''
    };

    prs.unshift(newPR);
    this.set(STORAGE_KEYS.PRS, prs);
    return newPR;
  },

  deletePR(prId) {
    let prs = this.getPRs();
    prs = prs.filter(p => p.id !== prId);
    return this.set(STORAGE_KEYS.PRS, prs);
  },

  // Workout Split
  getWorkoutSplit() {
    return this.get(STORAGE_KEYS.WORKOUT_SPLIT, null);
  },

  saveWorkoutSplit(split) {
    return this.set(STORAGE_KEYS.WORKOUT_SPLIT, split);
  },

  // Diet Plan
  getDietPlan() {
    return this.get(STORAGE_KEYS.DIET_PLAN, null);
  },

  saveDietPlan(plan) {
    return this.set(STORAGE_KEYS.DIET_PLAN, plan);
  },

  // Achievements
  getAchievements() {
    return this.get(STORAGE_KEYS.ACHIEVEMENTS, ['first_pr']);
  },

  unlockAchievement(badgeId) {
    const list = this.getAchievements();
    if (!list.includes(badgeId)) {
      list.push(badgeId);
      this.set(STORAGE_KEYS.ACHIEVEMENTS, list);
      return true;
    }
    return false;
  },

  // Populate rich interactive initial sample data so first-time users have vibrant charts & content
  loadSampleData() {
    const today = this.getTodayString();

    // Sample Profile
    const profile = {
      age: 27,
      gender: 'male',
      height: 180,
      weight: 78,
      targetWeight: 75,
      activityLevel: 1.55,
      goal: 'fat_loss',
      condition: 'healthy',
      dietPref: 'omnivore'
    };
    this.saveProfile(profile);

    // Sample Macro Target
    this.saveMacroTargets({
      calories: 2150,
      protein: 170,
      carbs: 210,
      fat: 65,
      waterLiters: 3.5
    });

    // Sample Today's Meals
    const sampleMeals = [
      {
        id: 'm_demo_1',
        mealType: 'breakfast',
        name: 'Rolled Oats with Whey Protein & Blueberries',
        servingGrams: 80,
        calories: 380,
        protein: 34,
        carbs: 48,
        fat: 6,
        timestamp: '08:30 AM'
      },
      {
        id: 'm_demo_2',
        mealType: 'lunch',
        name: 'Grilled Chicken Breast with Brown Rice & Broccoli',
        servingGrams: 200,
        calories: 520,
        protein: 48,
        carbs: 55,
        fat: 10,
        timestamp: '01:15 PM'
      },
      {
        id: 'm_demo_3',
        mealType: 'snack',
        name: 'Non-Fat Greek Yogurt with Raw Almonds & Banana',
        servingGrams: 180,
        calories: 290,
        protein: 18,
        carbs: 34,
        fat: 9,
        timestamp: '05:00 PM'
      }
    ];
    this.saveMealsForDate(today, sampleMeals);

    // Sample 7-day Step History
    const logs = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const stepCounts = [8420, 10540, 9200, 11350, 12400, 10120, 8760];
      const count = (i === 0) ? 8760 : stepCounts[6 - i];
      const distanceKm = parseFloat(((count * 0.762) / 1000).toFixed(2));
      const caloriesBurned = Math.round(count * 0.045 * (78 / 70));

      logs[dateStr] = {
        steps: count,
        goal: 10000,
        distanceKm: distanceKm,
        caloriesBurned: caloriesBurned,
        updatedAt: d.toISOString()
      };
    }
    this.set(STORAGE_KEYS.STEPS, logs);

    // Sample PRs
    const samplePRs = [
      {
        id: 'pr_1',
        exercise: 'Flat Barbell Bench Press',
        weightKg: 102.5,
        reps: 3,
        estimated1RM: 112.8,
        date: today,
        rpe: 9.5,
        notes: 'Smooth paused reps on chest. Felt strong!'
      },
      {
        id: 'pr_2',
        exercise: 'Barbell Back Squat',
        weightKg: 140,
        reps: 4,
        estimated1RM: 158.7,
        date: '2026-11-04',
        rpe: 9,
        notes: 'Hit below parallel cleanly with knee sleeves.'
      },
      {
        id: 'pr_3',
        exercise: 'Conventional Deadlift',
        weightKg: 180,
        reps: 2,
        estimated1RM: 192.0,
        date: '2026-10-28',
        rpe: 9.5,
        notes: 'Hook grip lockout with chalk.'
      },
      {
        id: 'pr_4',
        exercise: 'Standing Overhead Barbell Press',
        weightKg: 65,
        reps: 5,
        estimated1RM: 75.8,
        date: '2026-10-15',
        rpe: 8.5,
        notes: 'Strict military posture, no leg drive.'
      },
      {
        id: 'pr_5',
        exercise: 'Weighted Pull-ups',
        weightKg: 25,
        reps: 5,
        estimated1RM: 29.2,
        date: '2026-10-20',
        rpe: 9,
        notes: 'Weight belt with 25kg plate, chin fully over bar.'
      }
    ];
    this.set(STORAGE_KEYS.PRS, samplePRs);

    // Set default achievements
    this.set(STORAGE_KEYS.ACHIEVEMENTS, [
      'first_pr',
      'plate_bench',
      'two_plate_bench',
      'two_plate_squat',
      'three_plate_squat',
      'three_plate_deadlift',
      'step_master_10k'
    ]);

    // Sample default split
    this.saveWorkoutSplit(WORKOUT_SPLITS['4-days']);
  },

  // Clear data for the current user (or all if unauthenticated)
  clearAll() {
    const user = window.AuthManager ? AuthManager.getCurrentUser() : null;
    if (user && user.id) {
      Object.values(STORAGE_KEYS).forEach(k => {
        localStorage.removeItem(`fitpulse_u_${user.id}_${k}`);
      });
    } else {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
  }
};
