// FitPulse Pro - Core Fitness, Nutrition & Medical Data Repository

const FOOD_DATABASE = [
  // --- High Protein & Meats ---
  { id: 'f1', name: 'Chicken Breast (Cooked, Skinless)', category: 'Protein', serving: '100g', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0 },
  { id: 'f2', name: 'Egg (Whole, Large)', category: 'Protein', serving: '1 large (50g)', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0 },
  { id: 'f3', name: 'Egg Whites (Liquid)', category: 'Protein', serving: '100g', calories: 52, protein: 11.0, carbs: 0.7, fat: 0.2, fiber: 0 },
  { id: 'f4', name: 'Atlantic Salmon (Baked)', category: 'Protein', serving: '100g', calories: 206, protein: 22.0, carbs: 0.0, fat: 12.3, fiber: 0 },
  { id: 'f5', name: 'Canned Tuna (in Water, Drained)', category: 'Protein', serving: '100g', calories: 116, protein: 25.5, carbs: 0.0, fat: 1.0, fiber: 0 },
  { id: 'f6', name: 'Lean Beef Sirloin (90/10)', category: 'Protein', serving: '100g', calories: 176, protein: 26.0, carbs: 0.0, fat: 7.5, fiber: 0 },
  { id: 'f7', name: 'Turkey Breast (Roasted)', category: 'Protein', serving: '100g', calories: 135, protein: 30.0, carbs: 0.0, fat: 1.5, fiber: 0 },
  { id: 'f8', name: 'Shrimp (Cooked, Steamed)', category: 'Protein', serving: '100g', calories: 99, protein: 24.0, carbs: 0.2, fat: 0.3, fiber: 0 },
  { id: 'f9', name: 'Whey Protein Isolate Powder', category: 'Supplements', serving: '1 scoop (30g)', calories: 115, protein: 26.0, carbs: 1.0, fat: 0.5, fiber: 0 },
  { id: 'f10', name: 'Plant-Based Pea & Rice Protein', category: 'Supplements', serving: '1 scoop (32g)', calories: 120, protein: 24.0, carbs: 2.0, fat: 1.5, fiber: 1.0 },

  // --- Vegetarian & Vegan Proteins ---
  { id: 'f11', name: 'Paneer (Cottage Cheese, Indian)', category: 'Protein', serving: '100g', calories: 265, protein: 18.0, carbs: 3.5, fat: 20.0, fiber: 0 },
  { id: 'f12', name: 'Low-Fat Paneer', category: 'Protein', serving: '100g', calories: 180, protein: 24.0, carbs: 4.0, fat: 8.0, fiber: 0 },
  { id: 'f13', name: 'Firm Tofu (Organic)', category: 'Protein', serving: '100g', calories: 83, protein: 10.0, carbs: 1.9, fat: 5.3, fiber: 1.0 },
  { id: 'f14', name: 'Tempeh', category: 'Protein', serving: '100g', calories: 192, protein: 20.3, carbs: 7.6, fat: 10.8, fiber: 4.5 },
  { id: 'f15', name: 'Non-Fat Greek Yogurt (Plain)', category: 'Dairy', serving: '100g', calories: 59, protein: 10.0, carbs: 3.6, fat: 0.4, fiber: 0 },
  { id: 'f16', name: 'Cooked Lentils (Moong/Masoor Dal)', category: 'Legumes', serving: '100g', calories: 116, protein: 9.0, carbs: 20.1, fat: 0.4, fiber: 7.9 },
  { id: 'f17', name: 'Cooked Chickpeas (Chana/Garbanzo)', category: 'Legumes', serving: '100g', calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6 },
  { id: 'f18', name: 'Edamame (Steamed, Shelled)', category: 'Legumes', serving: '100g', calories: 122, protein: 11.9, carbs: 8.9, fat: 5.2, fiber: 5.2 },
  { id: 'f19', name: 'Black Beans (Cooked)', category: 'Legumes', serving: '100g', calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.7 },
  { id: 'f20', name: 'Cottage Cheese (Low-Fat 2%)', category: 'Dairy', serving: '100g', calories: 86, protein: 12.0, carbs: 3.4, fat: 2.0, fiber: 0 },

  // --- Carbohydrates & Whole Grains ---
  { id: 'f21', name: 'Rolled Oats (Dry)', category: 'Grains', serving: '100g', calories: 379, protein: 13.2, carbs: 67.7, fat: 6.5, fiber: 10.1 },
  { id: 'f22', name: 'White Basmati Rice (Cooked)', category: 'Grains', serving: '100g', calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
  { id: 'f23', name: 'Brown Rice (Cooked)', category: 'Grains', serving: '100g', calories: 123, protein: 2.7, carbs: 25.6, fat: 1.0, fiber: 1.6 },
  { id: 'f24', name: 'Sweet Potato (Baked, Flesh)', category: 'Carbs', serving: '100g', calories: 90, protein: 2.0, carbs: 20.7, fat: 0.2, fiber: 3.3 },
  { id: 'f25', name: 'White Potato (Boiled/Baked)', category: 'Carbs', serving: '100g', calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1, fiber: 1.8 },
  { id: 'f26', name: 'Quinoa (Cooked)', category: 'Grains', serving: '100g', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8 },
  { id: 'f27', name: 'Whole Wheat Roti / Chapati', category: 'Grains', serving: '1 piece (40g)', calories: 110, protein: 3.5, carbs: 22.0, fat: 1.0, fiber: 3.0 },
  { id: 'f28', name: '100% Whole Wheat Bread', category: 'Grains', serving: '1 slice (38g)', calories: 90, protein: 4.0, carbs: 16.0, fat: 1.2, fiber: 2.5 },
  { id: 'f29', name: 'Banana (Raw, Medium)', category: 'Fruits', serving: '1 medium (118g)', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.4, fiber: 3.1 },
  { id: 'f30', name: 'Apple (with skin, medium)', category: 'Fruits', serving: '1 medium (182g)', calories: 95, protein: 0.5, carbs: 25.1, fat: 0.3, fiber: 4.4 },
  { id: 'f31', name: 'Blueberries (Fresh)', category: 'Fruits', serving: '100g', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4 },

  // --- Healthy Fats & Nuts ---
  { id: 'f32', name: 'Avocado (Fresh Hass)', category: 'Fats', serving: '100g', calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7 },
  { id: 'f33', name: 'Natural Peanut Butter', category: 'Fats', serving: '2 tbsp (32g)', calories: 190, protein: 8.0, carbs: 7.0, fat: 16.0, fiber: 2.0 },
  { id: 'f34', name: 'Raw Almonds', category: 'Fats', serving: '30g (~23 nuts)', calories: 173, protein: 6.3, carbs: 6.1, fat: 15.0, fiber: 3.5 },
  { id: 'f35', name: 'Walnuts (Raw Halves)', category: 'Fats', serving: '30g (~14 halves)', calories: 196, protein: 4.6, carbs: 4.1, fat: 20.0, fiber: 2.0 },
  { id: 'f36', name: 'Extra Virgin Olive Oil', category: 'Fats', serving: '1 tbsp (14ml)', calories: 120, protein: 0.0, carbs: 0.0, fat: 14.0, fiber: 0 },
  { id: 'f37', name: 'Chia Seeds', category: 'Fats', serving: '2 tbsp (24g)', calories: 118, protein: 4.0, carbs: 10.0, fat: 7.5, fiber: 8.0 },
  { id: 'f38', name: 'Flaxseeds (Ground)', category: 'Fats', serving: '2 tbsp (14g)', calories: 75, protein: 2.6, carbs: 4.0, fat: 6.0, fiber: 3.8 },

  // --- Vegetables & Greens ---
  { id: 'f39', name: 'Broccoli (Steamed)', category: 'Vegetables', serving: '100g', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 },
  { id: 'f40', name: 'Baby Spinach (Raw)', category: 'Vegetables', serving: '100g', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { id: 'f41', name: 'Bell Peppers (Mixed, sliced)', category: 'Vegetables', serving: '100g', calories: 26, protein: 1.0, carbs: 6.0, fat: 0.3, fiber: 2.1 },
  { id: 'f42', name: 'Cucumber (Raw with peel)', category: 'Vegetables', serving: '100g', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  { id: 'f43', name: 'White Button Mushrooms', category: 'Vegetables', serving: '100g', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1.0 },
  { id: 'f44', name: 'Asparagus (Steamed)', category: 'Vegetables', serving: '100g', calories: 22, protein: 2.4, carbs: 4.1, fat: 0.2, fiber: 2.0 }
];

// Medical Conditions & Clinical Dietary Directives
const MEDICAL_CONDITIONS = {
  healthy: {
    name: 'General Fitness / Healthy',
    badge: 'Standard Optimal Balance',
    color: '#10b981',
    description: 'Balanced macronutrient distribution optimized for metabolic flexibility, energy preservation, and body composition.',
    carbRatio: 0.45,
    proteinRatio: 0.30,
    fatRatio: 0.25,
    sodiumLimitMg: 2300,
    fiberTargetG: 32,
    guidelines: [
      'Focus on whole, unprocessed foods with balanced macronutrient distributions.',
      'Maintain adequate hydration (at least 35ml per kg of body weight).',
      'Distribute protein evenly across 3 to 4 meals to optimize muscle protein synthesis.'
    ]
  },
  diabetes: {
    name: 'Type 2 Diabetes / Pre-Diabetic',
    badge: 'Glycemic Control & Insulin Sensitivity',
    color: '#06b6d4',
    description: 'Low-glycemic index protocol focused on stabilized postprandial glucose curves, high dietary fiber, and complex carbohydrates.',
    carbRatio: 0.35,
    proteinRatio: 0.35,
    fatRatio: 0.30,
    sodiumLimitMg: 2000,
    fiberTargetG: 40,
    guidelines: [
      'Keep glycemic load low; avoid refined sugars, syrups, and white flour.',
      'Prioritize high soluble fiber (oats, legumes, chia seeds) to slow down carbohydrate absorption.',
      'Pair all carbohydrate servings with lean proteins and healthy fats to blunt insulin spikes.',
      'Cinnamon and apple cider vinegar before meals can provide auxiliary glucose support.'
    ]
  },
  hypertension: {
    name: 'Hypertension (High Blood Pressure)',
    badge: 'DASH Protocol & Sodium Restriction',
    color: '#f59e0b',
    description: 'Dietary Approaches to Stop Hypertension (DASH) framework emphasizing potassium-rich vegetables, magnesium, and restricted sodium.',
    carbRatio: 0.45,
    proteinRatio: 0.30,
    fatRatio: 0.25,
    sodiumLimitMg: 1500,
    fiberTargetG: 35,
    guidelines: [
      'Strict sodium restriction under 1,500mg daily (minimize processed snacks, sauces, and cured meats).',
      'Amplify potassium-dense foods (spinach, avocado, sweet potatoes, bananas, and coconut water).',
      'Incorporate beetroot and dark berries rich in nitrates to promote nitric oxide vasodilation.'
    ]
  },
  pcos: {
    name: 'PCOD / PCOS (Hormonal Balance)',
    badge: 'Anti-Inflammatory & Endocrine Support',
    color: '#ec4899',
    description: 'Targeted endocrine nutrition designed to lower androgen production, optimize LH/FSH ratio, and improve insulin sensitivity.',
    carbRatio: 0.30,
    proteinRatio: 0.35,
    fatRatio: 0.35,
    sodiumLimitMg: 2000,
    fiberTargetG: 38,
    guidelines: [
      'Low glycemic, anti-inflammatory food matrix to regulate hyperinsulinemia-driven androgen synthesis.',
      'Rich in omega-3 fatty acids (salmon, walnuts, flaxseed) and zinc (pumpkin seeds, lentils).',
      'Incorporate spearmint tea and inositol-rich foods for ovarian endocrine equilibrium.'
    ]
  },
  cholesterol: {
    name: 'High Cholesterol / Cardiovascular',
    badge: 'Lipid Optimization & Arterial Health',
    color: '#ef4444',
    description: 'Cardioprotective lipid protocol designed to downregulate circulating LDL-C, reduce ApoB, and boost HDL with beta-glucans and phytosterols.',
    carbRatio: 0.45,
    proteinRatio: 0.30,
    fatRatio: 0.25,
    sodiumLimitMg: 1800,
    fiberTargetG: 40,
    guidelines: [
      'Limit saturated fat strictly under 6-7% of total daily calorie intake.',
      'High beta-glucan intake from steel-cut oats and barley to bind intestinal bile acids.',
      'Emphasize monounsaturated fats (extra virgin olive oil, almonds, avocado) and cold-water fish omega-3s.'
    ]
  },
  ckd_early: {
    name: 'Chronic Kidney Disease (Early Non-Dialysis)',
    badge: 'Glomerular Protection Protocol',
    color: '#8b5cf6',
    description: 'Regulated protein filtration load to prevent glomerular hyperfiltration, coupled with controlled phosphorus and regulated potassium.',
    carbRatio: 0.55,
    proteinRatio: 0.18, // 0.8g/kg bodyweight
    fatRatio: 0.27,
    sodiumLimitMg: 1500,
    fiberTargetG: 30,
    guidelines: [
      'Moderate protein intake (0.75 - 0.85g per kg) to minimize nitrogenous burden and BUN accumulation.',
      'Limit inorganic phosphate additives found in dark sodas, processed meats, and baked goods.',
      'Consult primary nephrologist for specific serum potassium and phosphorus ranges.'
    ]
  },
  gerd: {
    name: 'GERD / Acid Reflux',
    badge: 'Low-Acid & Mucosal Gentle',
    color: '#14b8a6',
    description: 'Nutritional strategy that protects lower esophageal sphincter (LES) integrity, avoids gastric mucosal irritation, and prevents reflux.',
    carbRatio: 0.45,
    proteinRatio: 0.30,
    fatRatio: 0.25,
    sodiumLimitMg: 2000,
    fiberTargetG: 30,
    guidelines: [
      'Eliminate high acid triggers: citrus fruits, tomato sauce, raw onions, garlic, peppermint, and dark chocolate.',
      'Eat 4 to 5 smaller meals rather than heavy feasts to reduce intragastric pressure.',
      'Avoid high-grease fried foods; finish dinner at least 3 hours prior to sleep.'
    ]
  },
  thyroid_hypo: {
    name: 'Hypothyroidism (Slow Metabolism)',
    badge: 'Thyroid Hormonal & Metabolic Support',
    color: '#6366f1',
    description: 'Nutrient-rich profile delivering bioavailable selenium, zinc, and tyrosine to optimize deiodinase conversion of T4 to active T3.',
    carbRatio: 0.40,
    proteinRatio: 0.35,
    fatRatio: 0.25,
    sodiumLimitMg: 2000,
    fiberTargetG: 35,
    guidelines: [
      'Ensure dietary selenium (1-2 Brazil nuts daily) and zinc for peripheral T4 to T3 conversion.',
      'Steam cruciferous vegetables (broccoli, cabbage) to deactivate goitrogenic glucosinolates.',
      'High clean protein to support basal metabolic expenditure and thermogenesis.'
    ]
  }
};

// Preset Workout Splits by Days Available and Equipment
const WORKOUT_SPLITS = {
  // --- 2 DAYS PER WEEK ---
  '2-days': {
    name: 'Full Body A & B (Maximum Frequency 2-Day Split)',
    description: 'Ideal for busy professionals, students, or athletes with limited weekly time. Hits every major muscle group twice weekly for optimal protein synthesis.',
    days: [
      {
        day: 'Day 1: Full Body Power & Press',
        target: 'Chest, Quads, Back Width, Hamstrings, Triceps',
        exercises: [
          { name: 'Barbell Back Squat (or Goblet Squat)', sets: '4', reps: '6-8', rest: '2-3 min', notes: 'Drive through mid-foot, hit parallel depth.', swap: 'Leg Press or Bulgarian Split Squat' },
          { name: 'Flat Barbell Bench Press', sets: '4', reps: '6-8', rest: '2 min', notes: 'Retract scapulae, touch lower sternum.', swap: 'Dumbbell Flat Press or Push-ups' },
          { name: 'Bent-Over Barbell Row', sets: '3', reps: '8-10', rest: '2 min', notes: 'Keep torso at 45 degrees, pull to navel.', swap: 'Chest-Supported Row or Seated Cable Row' },
          { name: 'Romanian Deadlift (RDL)', sets: '3', reps: '8-10', rest: '2 min', notes: 'Hinge back at the hips, feel hamstring stretch.', swap: 'Dumbbell RDL or Hamstring Leg Curl' },
          { name: 'Standing Overhead Barbell Press', sets: '3', reps: '8-10', rest: '90 sec', notes: 'Lock core, press vertical trajectory.', swap: 'Dumbbell Shoulder Press' },
          { name: 'Triceps Rope Pushdowns', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Spread rope at the bottom, full lockout.', swap: 'Overhead Dumbbell Triceps Extension' }
        ]
      },
      {
        day: 'Day 2: Full Body Hypertrophy & Pull',
        target: 'Back Thickness, Glutes, Shoulders, Calves, Biceps',
        exercises: [
          { name: 'Conventional Deadlift (or Trap Bar)', sets: '3', reps: '5', rest: '3 min', notes: 'Brace abdomen, pack lats before pulling.', swap: 'Sumo Deadlift or Romanian Deadlift' },
          { name: 'Incline Dumbbell Chest Press', sets: '4', reps: '8-10', rest: '2 min', notes: 'Bench set to 30 degrees, deep stretch.', swap: 'Incline Smith Press' },
          { name: 'Lat Pulldowns (or Weighted Pull-ups)', sets: '4', reps: '8-12', rest: '90 sec', notes: 'Drive elbows down into pockets.', swap: 'Assisted Pull-ups or Banded Pull-downs' },
          { name: 'Walking Dumbbell Lunges', sets: '3', reps: '10-12 / leg', rest: '90 sec', notes: 'Chest tall, 90-degree knee bend.', swap: 'Bulgarian Split Squats' },
          { name: 'Dumbbell Lateral Raises', sets: '4', reps: '12-15', rest: '60 sec', notes: 'Lead with elbows, slight forward lean.', swap: 'Cable Lateral Raise' },
          { name: 'Incline Dumbbell Biceps Curls', sets: '3', reps: '10-12', rest: '60 sec', notes: 'Full elbow extension at bottom.', swap: 'Barbell EZ-Bar Curl' }
        ]
      }
    ]
  },

  // --- 3 DAYS PER WEEK ---
  '3-days': {
    name: 'Push / Pull / Legs (Classic 3-Day Foundation)',
    description: 'The timeless bodybuilding and strength classic. Categorizes movements by functional kinematic chains, ensuring maximum recovery between muscle groups.',
    days: [
      {
        day: 'Day 1: Push (Chest, Anterior Delts, Triceps)',
        target: 'Pectorals, Front/Side Shoulders, Triceps',
        exercises: [
          { name: 'Flat Barbell Bench Press', sets: '4', reps: '6-8', rest: '2.5 min', notes: 'Main strength builder. Keep tight arch.', swap: 'Flat Dumbbell Press' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '8-10', rest: '2 min', notes: 'Focus on clavicular chest head.', swap: 'Incline Machine Press' },
          { name: 'Seated Dumbbell Shoulder Press', sets: '3', reps: '8-10', rest: '90 sec', notes: 'Press overhead without excessive flaring.', swap: 'Barbell Military Press' },
          { name: 'Cable Chest Flyes (or Pec Deck)', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Squeeze chest at peak contraction.', swap: 'Dumbbell Flyes' },
          { name: 'Dumbbell Lateral Raises', sets: '4', reps: '12-15', rest: '60 sec', notes: 'Isolate medial deltoid.', swap: 'Cable Lateral Raises' },
          { name: 'Lying Skullcrushers / EZ Bar Extension', sets: '3', reps: '10-12', rest: '60 sec', notes: 'Keep elbows fixed in place.', swap: 'Cable Rope Tricep Extension' }
        ]
      },
      {
        day: 'Day 2: Pull (Lats, Upper Back, Rear Delts, Biceps)',
        target: 'Latissimus Dorsi, Traps, Rhomboids, Biceps',
        exercises: [
          { name: 'Conventional Deadlift', sets: '3', reps: '5', rest: '3 min', notes: 'Posterior chain recruitment.', swap: 'Trap Bar Deadlift or Rack Pull' },
          { name: 'Barbell Bent-Over Row', sets: '4', reps: '8-10', rest: '2 min', notes: 'Pull bar toward lower abdomen.', swap: 'T-Bar Row or Seated Cable Row' },
          { name: 'Wide-Grip Lat Pulldown', sets: '3', reps: '8-12', rest: '90 sec', notes: 'Squeeze shoulder blades together.', swap: 'Pull-ups' },
          { name: 'Face Pulls (with Rope)', sets: '4', reps: '15-20', rest: '60 sec', notes: 'Crucial for shoulder health and rear delts.', swap: 'Reverse Dumbbell Flyes' },
          { name: 'Standing Barbell Bicep Curl', sets: '3', reps: '8-10', rest: '75 sec', notes: 'Strict form, no swinging back.', swap: 'Dumbbell Hammer Curls' },
          { name: 'Dumbbell Hammer Curls', sets: '3', reps: '10-12', rest: '60 sec', notes: 'Builds brachialis and forearm thickness.', swap: 'Cable Rope Hammer Curls' }
        ]
      },
      {
        day: 'Day 3: Legs & Core (Quads, Hamstrings, Glutes, Abs)',
        target: 'Quadriceps, Hamstrings, Gluteus, Calves, Core',
        exercises: [
          { name: 'Barbell Back Squat', sets: '4', reps: '6-8', rest: '3 min', notes: 'Hit depth with vertical chest.', swap: 'Hack Squat or Leg Press' },
          { name: 'Romanian Deadlift (RDL)', sets: '3', reps: '8-10', rest: '2 min', notes: 'Full stretch on hamstrings.', swap: 'Lying Hamstring Leg Curl' },
          { name: 'Leg Press (45 Degree)', sets: '3', reps: '10-12', rest: '90 sec', notes: 'Feet shoulder-width on platform.', swap: 'Bulgarian Split Squats' },
          { name: 'Leg Extensions', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Lock out and pause 1 sec at top.', swap: 'Sissy Squats' },
          { name: 'Standing Calf Raises', sets: '4', reps: '15-20', rest: '60 sec', notes: 'Full 2-second stretch at bottom.', swap: 'Seated Calf Raise' },
          { name: 'Hanging Knee/Leg Raises', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Curl pelvis up, don\'t swing.', swap: 'Cable Woodchoppers or Planks' }
        ]
      }
    ]
  },

  // --- 4 DAYS PER WEEK ---
  '4-days': {
    name: 'Upper / Lower Split (The Science-Backed 2x Frequency)',
    description: 'Considered by sports scientists to be the gold standard 4-day regimen. Trains every muscle group twice a week with adequate rest for maximum muscle hypertrophy.',
    days: [
      {
        day: 'Day 1: Upper Body A (Strength Focus)',
        target: 'Chest, Lats, Shoulders, Arms',
        exercises: [
          { name: 'Flat Barbell Bench Press', sets: '4', reps: '5-6', rest: '2.5 min', notes: 'Heavy compound pushing.', swap: 'Heavy Dumbbell Flat Press' },
          { name: 'Bent-Over Barbell Row', sets: '4', reps: '6-8', rest: '2 min', notes: 'Solid base, strict pull.', swap: 'Chest-Supported Row' },
          { name: 'Standing Overhead Barbell Press', sets: '3', reps: '6-8', rest: '2 min', notes: 'Core braced tightly.', swap: 'Seated Dumbbell Shoulder Press' },
          { name: 'Weighted Pull-ups (or Lat Pulldowns)', sets: '3', reps: '6-8', rest: '90 sec', notes: 'Controlled descent.', swap: 'Neutral-Grip Lat Pulldowns' },
          { name: 'Incline Dumbbell Bicep Curls', sets: '3', reps: '10-12', rest: '60 sec', notes: 'Peak biceps stretch.', swap: 'Preacher Curl' },
          { name: 'Dips (or Tricep Cable Pushdown)', sets: '3', reps: '8-10', rest: '75 sec', notes: 'Forward lean for chest, upright for triceps.', swap: 'Overhead Rope Extension' }
        ]
      },
      {
        day: 'Day 2: Lower Body A (Quad & Squat Dominant)',
        target: 'Quads, Glutes, Calves, Abs',
        exercises: [
          { name: 'Barbell Back Squat', sets: '4', reps: '5-6', rest: '3 min', notes: 'Heavy strength driver.', swap: 'Leg Press' },
          { name: 'Romanian Deadlifts (RDL)', sets: '3', reps: '8-10', rest: '2 min', notes: 'Hips back, neutral spine.', swap: 'Seated Leg Curl' },
          { name: 'Walking Dumbbell Lunges', sets: '3', reps: '10 / leg', rest: '90 sec', notes: 'Unilateral leg strength.', swap: 'Bulgarian Split Squat' },
          { name: 'Leg Extensions', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Quad pump and burn.', swap: 'Goblet Squats' },
          { name: 'Standing Calf Raises', sets: '4', reps: '12-15', rest: '60 sec', notes: 'Pause at bottom stretch.', swap: 'Leg Press Calf Raise' },
          { name: 'Plank Hold', sets: '3', reps: '60 sec', rest: '60 sec', notes: 'Anti-extension core stability.', swap: 'Ab Wheel Rollout' }
        ]
      },
      {
        day: 'Day 3: Upper Body B (Hypertrophy Focus)',
        target: 'Chest, Upper Back, Lateral Delts, Arms',
        exercises: [
          { name: 'Incline Dumbbell Press', sets: '4', reps: '8-10', rest: '2 min', notes: 'Upper chest development.', swap: 'Incline Smith Press' },
          { name: 'Seated Cable Row (Close Grip)', sets: '4', reps: '10-12', rest: '90 sec', notes: 'Pull handle into lower ribs.', swap: 'Single-Arm Dumbbell Row' },
          { name: 'Dumbbell Lateral Raises', sets: '4', reps: '12-15', rest: '60 sec', notes: 'Shoulder width enhancer.', swap: 'Cable Lateral Raise' },
          { name: 'Chest Cable Flyes', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Deep stretch on pecs.', swap: 'Pec Deck Machine' },
          { name: 'Face Pulls', sets: '3', reps: '15-20', rest: '60 sec', notes: 'Rear delts and rotator cuffs.', swap: 'Reverse Cable Flyes' },
          { name: 'EZ-Bar Skullcrushers superset with EZ Bar Curls', sets: '3', reps: '10-12 each', rest: '90 sec', notes: 'Intense arm pump finisher.', swap: 'Dumbbell Hammer Curls & Pushdowns' }
        ]
      },
      {
        day: 'Day 4: Lower Body B (Posterior Chain & Deadlift)',
        target: 'Hamstrings, Glutes, Quads, Lower Back',
        exercises: [
          { name: 'Conventional or Trap Bar Deadlift', sets: '3', reps: '5', rest: '3 min', notes: 'Maximal pull power.', swap: 'Sumo Deadlift' },
          { name: 'Bulgarian Split Squats (Dumbbell)', sets: '3', reps: '8-10 / leg', rest: '90 sec', notes: 'Rear foot elevated on bench.', swap: 'Reverse Lunges' },
          { name: 'Lying Hamstring Leg Curls', sets: '4', reps: '10-12', rest: '75 sec', notes: 'Squeeze hamstrings at contraction.', swap: 'Swiss Ball Leg Curls' },
          { name: 'Leg Press', sets: '3', reps: '12-15', rest: '90 sec', notes: 'High volume pump.', swap: 'Front Squats' },
          { name: 'Seated Calf Raises', sets: '4', reps: '15-20', rest: '60 sec', notes: 'Targets soleus muscle.', swap: 'Donkey Calf Raises' },
          { name: 'Hanging Leg Raises', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Target lower abdominals.', swap: 'Cable Crunch' }
        ]
      }
    ]
  },

  // --- 5 DAYS PER WEEK ---
  '5-days': {
    name: 'Upper / Lower + Push / Pull / Legs (UL-PPL Hybrid)',
    description: 'The premier modern bodybuilding split. Delivers heavy compound strength training on the first 2 days, followed by high-volume targeted hypertrophy on Push, Pull, and Legs.',
    days: [
      {
        day: 'Day 1: Upper Power',
        target: 'Upper Body Compounds & Strength',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: '4', reps: '5', rest: '3 min', notes: 'Strength overload.', swap: 'Heavy DB Press' },
          { name: 'Barbell Pendlay Row', sets: '4', reps: '5', rest: '2.5 min', notes: 'Explosive pull from floor.', swap: 'Barbell Bent Row' },
          { name: 'Overhead Barbell Military Press', sets: '3', reps: '6', rest: '2 min', notes: 'Strict overhead power.', swap: 'Seated DB Press' },
          { name: 'Weighted Pull-ups', sets: '3', reps: '6-8', rest: '2 min', notes: 'Controlled tempo.', swap: 'Lat Pulldown' },
          { name: 'Heavy Barbell Shrugs', sets: '3', reps: '8-10', rest: '90 sec', notes: 'Hold top for 1 second.', swap: 'Dumbbell Shrugs' }
        ]
      },
      {
        day: 'Day 2: Lower Power',
        target: 'Quads, Posterior Chain & Calves',
        exercises: [
          { name: 'Barbell Back Squat', sets: '4', reps: '5', rest: '3 min', notes: 'Primary lower compound.', swap: 'Hack Squat' },
          { name: 'Romanian Deadlift (RDL)', sets: '3', reps: '6-8', rest: '2.5 min', notes: 'Slow negative descent.', swap: 'Barbell Good Mornings' },
          { name: 'Leg Press (Heavy)', sets: '3', reps: '8-10', rest: '2 min', notes: 'Deep knee flexion.', swap: 'Belt Squat' },
          { name: 'Standing Calf Raises', sets: '4', reps: '10-12', rest: '60 sec', notes: 'Full extension.', swap: 'Seated Calf Raise' },
          { name: 'Cable Woodchoppers', sets: '3', reps: '12 / side', rest: '60 sec', notes: 'Rotational core power.', swap: 'Pallof Press' }
        ]
      },
      {
        day: 'Day 3: Push Hypertrophy',
        target: 'Chest, Shoulders, Triceps Pump',
        exercises: [
          { name: 'Incline Dumbbell Press', sets: '4', reps: '8-12', rest: '90 sec', notes: 'Clavicular pec overload.', swap: 'Incline Barbell Press' },
          { name: 'Dumbbell Flat Press', sets: '3', reps: '10-12', rest: '90 sec', notes: 'Full chest stretch.', swap: 'Pec Deck Machine' },
          { name: 'Cable Lateral Raises', sets: '4', reps: '12-15', rest: '60 sec', notes: 'Constant cable tension.', swap: 'DB Lateral Raise' },
          { name: 'Cable Triceps Pushdowns', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Spread attachments at base.', swap: 'Overhead DB Extension' },
          { name: 'Dips', sets: '3', reps: '10-15', rest: '75 sec', notes: 'Finish triceps and lower chest.', swap: 'Close-Grip Bench Press' }
        ]
      },
      {
        day: 'Day 4: Pull Hypertrophy',
        target: 'Lats, Rhomboids, Rear Delts, Biceps',
        exercises: [
          { name: 'Wide Grip Lat Pulldown', sets: '4', reps: '10-12', rest: '90 sec', notes: 'Engage lats first.', swap: 'Neutral Pull-ups' },
          { name: 'Single-Arm Dumbbell Row', sets: '3', reps: '10-12 / side', rest: '90 sec', notes: 'Pull dumbbell to hip crease.', swap: 'Chest Supported Row' },
          { name: 'Face Pulls', sets: '4', reps: '15-20', rest: '60 sec', notes: 'External shoulder rotation.', swap: 'Rear Delt Flyes' },
          { name: 'Incline Dumbbell Biceps Curls', sets: '3', reps: '10-12', rest: '60 sec', notes: 'Stretch long head of bicep.', swap: 'Barbell Curl' },
          { name: 'Cable Hammer Curls (Rope)', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Forearm & brachialis.', swap: 'Reverse Barbell Curls' }
        ]
      },
      {
        day: 'Day 5: Legs Hypertrophy',
        target: 'Quads, Hamstrings, Glutes & Abs',
        exercises: [
          { name: 'Front Squat or Hack Squat', sets: '4', reps: '8-10', rest: '2 min', notes: 'Upright torso quad emphasis.', swap: 'Goblet Squat' },
          { name: 'Lying Hamstring Leg Curls', sets: '4', reps: '10-12', rest: '75 sec', notes: 'Controlled slow eccentric.', swap: 'Seated Leg Curl' },
          { name: 'Bulgarian Split Squats', sets: '3', reps: '10-12 / leg', rest: '90 sec', notes: 'Glute & quad unilateral builder.', swap: 'Walking Lunges' },
          { name: 'Leg Extensions', sets: '3', reps: '15-20', rest: '60 sec', notes: 'Burnout set.', swap: 'Sissy Squats' },
          { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '60 sec', notes: 'Tuck pelvis at top.', swap: 'Ab Crunch Machine' }
        ]
      }
    ]
  },

  // --- 6 DAYS PER WEEK ---
  '6-days': {
    name: 'Push / Pull / Legs (PPL x 2 High Frequency)',
    description: 'The pinnacle high-frequency training system utilized by competitive bodybuilders. Trains every muscle group twice every 7 days with dedicated volume days.',
    days: [
      {
        day: 'Day 1: Push A (Chest Dominant)',
        target: 'Pectorals, Anterior Delts, Triceps',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: '4', reps: '6-8', rest: '2 min', notes: 'Heavy primary push.', swap: 'Dumbbell Flat Press' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '8-10', rest: '90 sec', notes: 'Squeeze at top.', swap: 'Incline Smith Machine' },
          { name: 'Seated Overhead Dumbbell Press', sets: '3', reps: '8-10', rest: '90 sec', notes: 'Full overhead range.', swap: 'Machine Shoulder Press' },
          { name: 'Cable Lateral Raise', sets: '4', reps: '12-15', rest: '60 sec', notes: 'Constant tension on side delt.', swap: 'DB Lateral Raise' },
          { name: 'Dips', sets: '3', reps: '10-12', rest: '75 sec', notes: 'Chest-oriented lean.', swap: 'Cable Crossover' },
          { name: 'Triceps Rope Pushdowns', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Peak extension lock.', swap: 'Overhead Rope Extension' }
        ]
      },
      {
        day: 'Day 2: Pull A (Lat Dominant)',
        target: 'Lats, Upper Back, Biceps',
        exercises: [
          { name: 'Barbell Bent-Over Row', sets: '4', reps: '6-8', rest: '2 min', notes: 'Power pull to hips.', swap: 'T-Bar Row' },
          { name: 'Neutral-Grip Lat Pulldown', sets: '4', reps: '8-10', rest: '90 sec', notes: 'Focus on lat sweep.', swap: 'Weighted Pull-ups' },
          { name: 'Chest-Supported Machine Row', sets: '3', reps: '10-12', rest: '90 sec', notes: 'Eliminate lower back momentum.', swap: 'Dumbbell Incline Row' },
          { name: 'Face Pulls', sets: '4', reps: '15-20', rest: '60 sec', notes: 'Rotator cuff and rear delt.', swap: 'Reverse Pec Deck' },
          { name: 'Incline Dumbbell Curl', sets: '3', reps: '10-12', rest: '60 sec', notes: 'Stretch bicep long head.', swap: 'Spider Curls' },
          { name: 'Dumbbell Hammer Curls', sets: '3', reps: '10-12', rest: '60 sec', notes: 'Brachialis development.', swap: 'Cable Rope Hammer Curl' }
        ]
      },
      {
        day: 'Day 3: Legs A (Quad Dominant)',
        target: 'Quadriceps, Calves, Abs',
        exercises: [
          { name: 'Barbell Back Squat', sets: '4', reps: '6-8', rest: '3 min', notes: 'Deep quad recruitment.', swap: 'Hack Squat' },
          { name: 'Leg Press', sets: '3', reps: '10-12', rest: '2 min', notes: 'Shoulder width stance.', swap: 'Goblet Squat' },
          { name: 'Bulgarian Split Squats', sets: '3', reps: '10 / leg', rest: '90 sec', notes: 'Torso upright for quads.', swap: 'Walking Lunges' },
          { name: 'Leg Extensions', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Peak contraction 1s hold.', swap: 'Sissy Squat' },
          { name: 'Standing Calf Raises', sets: '4', reps: '15-20', rest: '60 sec', notes: 'Gastrocnemius focus.', swap: 'Donkey Calf Raise' },
          { name: 'Hanging Leg Raises', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Abs and hip flexor control.', swap: 'Cable Crunch' }
        ]
      },
      {
        day: 'Day 4: Push B (Shoulder Dominant)',
        target: 'Shoulders, Upper Chest, Triceps',
        exercises: [
          { name: 'Standing Overhead Military Press', sets: '4', reps: '6-8', rest: '2 min', notes: 'Core rigid, press vertically.', swap: 'Seated DB Shoulder Press' },
          { name: 'Incline Barbell Bench Press', sets: '3', reps: '8-10', rest: '90 sec', notes: 'Target upper pectorals.', swap: 'Incline DB Press' },
          { name: 'Flat Dumbbell Press', sets: '3', reps: '10-12', rest: '90 sec', notes: 'Smooth controlled tempo.', swap: 'Chest Dip' },
          { name: 'Dumbbell Lateral Raises (Drop Set)', sets: '4', reps: '12-15', rest: '60 sec', notes: 'Perform drop on final set.', swap: 'Cable Lateral Raise' },
          { name: 'Pec Deck Flyes', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Focus on peak squeeze.', swap: 'Cable Flyes' },
          { name: 'Lying EZ-Bar Skullcrushers', sets: '3', reps: '10-12', rest: '60 sec', notes: 'Triceps long head overload.', swap: 'Close Grip Bench Press' }
        ]
      },
      {
        day: 'Day 5: Pull B (Deadlift & Thickness)',
        target: 'Lower Back, Traps, Rhomboids, Biceps',
        exercises: [
          { name: 'Conventional Deadlift', sets: '3', reps: '5', rest: '3 min', notes: 'Total body posterior power.', swap: 'Trap Bar Deadlift' },
          { name: 'Wide-Grip Pull-ups (or Pulldowns)', sets: '4', reps: '8-10', rest: '90 sec', notes: 'Drive elbows down.', swap: 'Lat Pulldown' },
          { name: 'Seated Cable Row (Wide Grip)', sets: '3', reps: '10-12', rest: '90 sec', notes: 'Upper back and rear delts.', swap: 'T-Bar Row' },
          { name: 'Dumbbell Shrugs', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Upward elevation only, no rolling.', swap: 'Barbell Shrugs' },
          { name: 'Preacher Bicep Curl', sets: '3', reps: '10-12', rest: '60 sec', notes: 'Strict isolation, no body swing.', swap: 'Incline Dumbbell Curl' },
          { name: 'Reverse Grip EZ-Bar Curls', sets: '3', reps: '12-15', rest: '60 sec', notes: 'Forearms and brachioradialis.', swap: 'Hammer Curls' }
        ]
      },
      {
        day: 'Day 6: Legs B (Posterior Chain & Hamstrings)',
        target: 'Hamstrings, Glutes, Calves, Core',
        exercises: [
          { name: 'Romanian Deadlift (RDL)', sets: '4', reps: '6-8', rest: '2.5 min', notes: 'Deep stretch on hamstrings.', swap: 'Barbell Good Mornings' },
          { name: 'Lying Hamstring Leg Curls', sets: '4', reps: '10-12', rest: '75 sec', notes: 'Full knee flexion.', swap: 'Seated Leg Curl' },
          { name: 'Barbell Hip Thrusts', sets: '3', reps: '8-10', rest: '2 min', notes: 'Maximal glute contraction at top.', swap: 'Glute Cable Kickbacks' },
          { name: 'Goblet Squats or Hack Squat', sets: '3', reps: '12-15', rest: '90 sec', notes: 'Constant leg tension.', swap: 'Leg Press' },
          { name: 'Seated Calf Raises', sets: '4', reps: '15-20', rest: '60 sec', notes: 'Soleus muscle pump.', swap: 'Standing Calf Raise' },
          { name: 'Ab Wheel Rollouts', sets: '3', reps: '10-12', rest: '60 sec', notes: 'Core anti-extension.', swap: 'Planks' }
        ]
      }
    ]
  }
};

// Home Dumbbells & Calisthenics Variations for Split Generator
const EQUIPMENT_MODIFIERS = {
  gym: 'Full Commercial Gym (Barbells, Cables, Dumbbells, Machines)',
  home_dumbbells: 'Home Gym (Dumbbells, Adjustable Bench, Pull-Up Bar)',
  calisthenics: 'Bodyweight / Calisthenics (Pull-up Bar, Parallel Dip Bars, Rings)'
};

// Achievement Badges & Milestones
const PR_ACHIEVEMENTS = [
  { id: 'first_pr', name: 'First Milestone', desc: 'Logged your very first PR in the vault!', icon: '🎯' },
  { id: 'plate_bench', name: '1-Plate Bench Club', desc: 'Benched 60 kg (135 lbs) or more.', icon: '🥉' },
  { id: 'two_plate_bench', name: '2-Plate Bench Club', desc: 'Benched 100 kg (225 lbs) or more.', icon: '🥈' },
  { id: 'two_plate_squat', name: '2-Plate Squat Club', desc: 'Squatted 100 kg (225 lbs) or more.', icon: '🥉' },
  { id: 'three_plate_squat', name: '3-Plate Squat Club', desc: 'Squatted 140 kg (315 lbs) or more.', icon: '🥈' },
  { id: 'three_plate_deadlift', name: '3-Plate Deadlift Club', desc: 'Deadlifted 140 kg (315 lbs) or more.', icon: '🥉' },
  { id: 'four_plate_deadlift', name: '4-Plate Deadlift Club', desc: 'Deadlifted 180 kg (405 lbs) or more.', icon: '🥇' },
  { id: 'thousand_pound_club', name: '1000-lb Club', desc: 'Combined 1RM of Bench + Squat + Deadlift >= 454 kg (1000 lbs)!', icon: '👑' },
  { id: 'step_master_10k', name: '10K Daily Stride', desc: 'Hit or exceeded 10,000 steps in a day!', icon: '👟' },
  { id: 'step_streak_7', name: 'Week of Iron Stride', desc: 'Maintained a 7-day streak hitting your step target!', icon: '🔥' }
];
