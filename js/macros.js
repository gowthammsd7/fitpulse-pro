// FitPulse Pro - Meal & Macronutrient Calculator Module

const MacrosModule = {
  activeDate: StorageManager.getTodayString(),
  macroChartInstance: null,

  init() {
    this.activeDate = StorageManager.getTodayString();
    this.renderFoodSelectOptions();
    this.renderLoggedMeals();
    this.updateMacroSummary();
    this.bindEvents();
  },

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;
    // Food Selector change
    const foodSelect = document.getElementById('food-select');
    if (foodSelect) {
      foodSelect.addEventListener('change', (e) => this.onFoodSelected(e.target.value));
    }

    // Portion amount input
    const portionInput = document.getElementById('food-portion-input');
    if (portionInput) {
      portionInput.addEventListener('input', () => this.updateLivePortionPreview());
    }

    // Add Food to Meal Form
    const addMealForm = document.getElementById('add-meal-form');
    if (addMealForm) {
      addMealForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddMealSubmit();
      });
    }

    // Custom Food Form
    const customFoodForm = document.getElementById('custom-food-form');
    if (customFoodForm) {
      customFoodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveCustomFood();
      });
    }

    // Date selector for meals
    const datePicker = document.getElementById('macro-date-picker');
    if (datePicker) {
      datePicker.value = this.activeDate;
      datePicker.addEventListener('change', (e) => {
        this.activeDate = e.target.value || StorageManager.getTodayString();
        this.renderLoggedMeals();
        this.updateMacroSummary();
      });
    }

    // Macro target edit form
    const targetForm = document.getElementById('macro-targets-form');
    if (targetForm) {
      targetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveTargets();
      });
    }
  },

  getAllFoods() {
    const custom = StorageManager.getCustomFoods();
    return [...custom, ...FOOD_DATABASE];
  },

  renderFoodSelectOptions(filterQuery = '', categoryFilter = 'all') {
    const select = document.getElementById('food-select');
    if (!select) return;

    const allFoods = this.getAllFoods();
    let filtered = allFoods;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(f => f.category && f.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      filtered = filtered.filter(f => f.name.toLowerCase().includes(q) || (f.category && f.category.toLowerCase().includes(q)));
    }

    select.innerHTML = '<option value="">-- Choose a Food Item or Ingredient --</option>';

    // Group by category
    const groups = {};
    filtered.forEach(food => {
      const cat = food.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(food);
    });

    for (const [groupName, foods] of Object.entries(groups)) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = groupName;
      foods.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${item.name} (${item.serving} - ${item.calories} kcal | P:${item.protein}g C:${item.carbs}g F:${item.fat}g)`;
        optgroup.appendChild(opt);
      });
      select.appendChild(optgroup);
    }
  },

  onFoodSelected(foodId) {
    if (!foodId) {
      document.getElementById('portion-preview-box').classList.add('hidden');
      return;
    }
    const allFoods = this.getAllFoods();
    const food = allFoods.find(f => f.id === foodId);
    if (!food) return;

    // Default portion 100g if gram based, or 1 if unit
    const portionInput = document.getElementById('food-portion-input');
    const unitLabel = document.getElementById('portion-unit-label');

    if (food.serving.toLowerCase().includes('100g')) {
      portionInput.value = 100;
      unitLabel.textContent = 'Grams (g)';
    } else {
      portionInput.value = 1;
      unitLabel.textContent = 'Servings';
    }

    this.updateLivePortionPreview();
  },

  updateLivePortionPreview() {
    const foodId = document.getElementById('food-select').value;
    const portionVal = parseFloat(document.getElementById('food-portion-input').value) || 0;
    const previewBox = document.getElementById('portion-preview-box');

    if (!foodId || portionVal <= 0) {
      previewBox.classList.add('hidden');
      return;
    }

    const allFoods = this.getAllFoods();
    const food = allFoods.find(f => f.id === foodId);
    if (!food) return;

    let multiplier = 1;
    if (food.serving.toLowerCase().includes('100g')) {
      multiplier = portionVal / 100;
    } else {
      multiplier = portionVal;
    }

    const cal = Math.round(food.calories * multiplier);
    const p = Math.round(food.protein * multiplier * 10) / 10;
    const c = Math.round(food.carbs * multiplier * 10) / 10;
    const f = Math.round(food.fat * multiplier * 10) / 10;

    document.getElementById('preview-cal').textContent = cal + ' kcal';
    document.getElementById('preview-protein').textContent = p + 'g';
    document.getElementById('preview-carbs').textContent = c + 'g';
    document.getElementById('preview-fat').textContent = f + 'g';

    previewBox.classList.remove('hidden');
  },

  handleAddMealSubmit() {
    const mealType = document.getElementById('meal-type-select').value;
    const foodId = document.getElementById('food-select').value;
    const portionVal = parseFloat(document.getElementById('food-portion-input').value) || 0;

    if (!foodId) {
      App.showToast('Please select a food item', 'error');
      return;
    }
    if (portionVal <= 0) {
      App.showToast('Please enter a valid portion size', 'error');
      return;
    }

    const allFoods = this.getAllFoods();
    const food = allFoods.find(f => f.id === foodId);
    if (!food) return;

    let multiplier = 1;
    let servingDesc = '';
    if (food.serving.toLowerCase().includes('100g')) {
      multiplier = portionVal / 100;
      servingDesc = `${portionVal}g`;
    } else {
      multiplier = portionVal;
      servingDesc = `${portionVal} serving(s)`;
    }

    const mealItem = {
      mealType: mealType,
      foodId: food.id,
      name: food.name,
      servingDesc: servingDesc,
      servingGrams: food.serving.toLowerCase().includes('100g') ? portionVal : null,
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10
    };

    StorageManager.addMeal(mealItem, this.activeDate);
    App.showToast(`Added ${food.name} to ${mealType.toUpperCase()}!`, 'success');

    // Reset inputs
    document.getElementById('food-select').value = '';
    document.getElementById('food-portion-input').value = '100';
    document.getElementById('portion-preview-box').classList.add('hidden');

    this.renderLoggedMeals();
    this.updateMacroSummary();
    if (window.App && typeof App.updateDashboard === 'function') {
      App.updateDashboard();
    }
  },

  handleSaveCustomFood() {
    const name = document.getElementById('cf-name').value.trim();
    const serving = document.getElementById('cf-serving').value.trim() || '100g';
    const cal = parseFloat(document.getElementById('cf-calories').value) || 0;
    const p = parseFloat(document.getElementById('cf-protein').value) || 0;
    const c = parseFloat(document.getElementById('cf-carbs').value) || 0;
    const f = parseFloat(document.getElementById('cf-fat').value) || 0;

    if (!name || cal <= 0) {
      App.showToast('Please enter a food name and calories', 'error');
      return;
    }

    const customFood = {
      name: name,
      category: 'Custom Recipes',
      serving: serving,
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      fiber: 0
    };

    const saved = StorageManager.saveCustomFood(customFood);
    App.showToast(`Custom food "${name}" saved to library!`, 'success');

    // Reset & Close modal
    document.getElementById('custom-food-form').reset();
    document.getElementById('custom-food-modal').classList.add('hidden');

    this.renderFoodSelectOptions();
    document.getElementById('food-select').value = saved.id;
    this.onFoodSelected(saved.id);
  },

  renderLoggedMeals() {
    const meals = StorageManager.getMeals(this.activeDate);
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    mealTypes.forEach(type => {
      const container = document.getElementById(`meals-list-${type}`);
      const summaryHeader = document.getElementById(`meal-subtotal-${type}`);
      if (!container) return;

      const typeMeals = meals.filter(m => m.mealType === type);

      if (typeMeals.length === 0) {
        container.innerHTML = `
          <div class="text-sm text-slate-500 py-3 text-center italic border border-dashed border-slate-700/60 rounded-xl">
            No items logged for ${type}.
          </div>
        `;
        if (summaryHeader) summaryHeader.textContent = '0 kcal';
        return;
      }

      let subCal = 0;
      let subP = 0;
      let subC = 0;
      let subF = 0;

      container.innerHTML = typeMeals.map(item => {
        subCal += item.calories;
        subP += item.protein;
        subC += item.carbs;
        subF += item.fat;

        return `
          <div class="flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition duration-200 group">
            <div class="flex-1 pr-3">
              <div class="flex items-center gap-2">
                <span class="font-medium text-slate-200 text-sm">${item.name}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">${item.servingDesc || ''}</span>
              </div>
              <div class="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span class="text-emerald-400 font-medium">${item.calories} kcal</span>
                <span>P: <strong class="text-cyan-400">${item.protein}g</strong></span>
                <span>C: <strong class="text-amber-400">${item.carbs}g</strong></span>
                <span>F: <strong class="text-rose-400">${item.fat}g</strong></span>
                <span class="text-slate-500 text-[10px]">${item.timestamp || ''}</span>
              </div>
            </div>
            <button onclick="MacrosModule.deleteLoggedItem('${item.id}')" 
                    title="Remove item" 
                    class="opacity-60 group-hover:opacity-100 hover:text-rose-400 text-slate-500 p-1.5 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        `;
      }).join('');

      if (summaryHeader) {
        summaryHeader.textContent = `${Math.round(subCal)} kcal (P:${Math.round(subP)}g C:${Math.round(subC)}g F:${Math.round(subF)}g)`;
      }
    });
  },

  deleteLoggedItem(mealId) {
    StorageManager.deleteMeal(mealId, this.activeDate);
    App.showToast('Food item removed', 'info');
    this.renderLoggedMeals();
    this.updateMacroSummary();
    if (window.App && typeof App.updateDashboard === 'function') {
      App.updateDashboard();
    }
  },

  updateMacroSummary() {
    const targets = StorageManager.getMacroTargets();
    const meals = StorageManager.getMeals(this.activeDate);

    let totalCal = 0;
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    meals.forEach(m => {
      totalCal += m.calories;
      totalP += m.protein;
      totalC += m.carbs;
      totalF += m.fat;
    });

    totalP = Math.round(totalP * 10) / 10;
    totalC = Math.round(totalC * 10) / 10;
    totalF = Math.round(totalF * 10) / 10;

    const remainingCal = targets.calories - totalCal;

    // Summary texts
    document.getElementById('consumed-calories').textContent = totalCal;
    document.getElementById('target-calories').textContent = targets.calories;
    document.getElementById('remaining-calories').textContent = remainingCal >= 0 ? `${remainingCal} kcal remaining` : `${Math.abs(remainingCal)} kcal over target`;
    document.getElementById('remaining-calories').className = remainingCal >= 0 ? 'text-xs text-slate-400' : 'text-xs text-rose-400 font-semibold';

    // Protein
    document.getElementById('consumed-protein').textContent = `${totalP}g`;
    document.getElementById('target-protein').textContent = `/ ${targets.protein}g`;
    const pPercent = Math.min(100, Math.round((totalP / targets.protein) * 100));
    document.getElementById('progress-protein').style.width = `${pPercent}%`;

    // Carbs
    document.getElementById('consumed-carbs').textContent = `${totalC}g`;
    document.getElementById('target-carbs').textContent = `/ ${targets.carbs}g`;
    const cPercent = Math.min(100, Math.round((totalC / targets.carbs) * 100));
    document.getElementById('progress-carbs').style.width = `${cPercent}%`;

    // Fat
    document.getElementById('consumed-fat').textContent = `${totalF}g`;
    document.getElementById('target-fat').textContent = `/ ${targets.fat}g`;
    const fPercent = Math.min(100, Math.round((totalF / targets.fat) * 100));
    document.getElementById('progress-fat').style.width = `${fPercent}%`;

    // Calorie Ring SVG percentage
    const calPercent = Math.min(100, Math.round((totalCal / targets.calories) * 100));
    const circle = document.getElementById('calorie-circle-progress');
    if (circle) {
      // 2 * pi * r = 2 * 3.14159 * 42 = 263.89
      const circumference = 264;
      const offset = circumference - (calPercent / 100) * circumference;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
    }

    this.renderMacroDonutChart(totalP, totalC, totalF);
  },

  renderMacroDonutChart(proteinG, carbsG, fatG) {
    const canvas = document.getElementById('macro-donut-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const pKcal = proteinG * 4;
    const cKcal = carbsG * 4;
    const fKcal = fatG * 9;
    const totalMacroKcal = pKcal + cKcal + fKcal;

    if (this.macroChartInstance) {
      this.macroChartInstance.destroy();
    }

    if (totalMacroKcal === 0) {
      // Empty placeholder chart
      this.macroChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [1],
            backgroundColor: ['#1e293b'],
            borderWidth: 0
          }]
        },
        options: {
          cutout: '76%',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
      });
      return;
    }

    this.macroChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Protein', 'Carbohydrates', 'Fats'],
        datasets: [{
          data: [pKcal, cKcal, fKcal],
          backgroundColor: [
            '#06b6d4', // Cyan
            '#f59e0b', // Amber
            '#ec4899'  // Pink
          ],
          borderColor: '#0f172a',
          borderWidth: 3,
          hoverOffset: 4
        }]
      },
      options: {
        cutout: '74%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
              usePointStyle: true,
              padding: 14
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const kcal = Math.round(context.raw);
                const percent = Math.round((kcal / totalMacroKcal) * 100);
                return ` ${context.label}: ${kcal} kcal (${percent}%)`;
              }
            }
          }
        }
      }
    });
  },

  openTargetModal() {
    const targets = StorageManager.getMacroTargets();
    document.getElementById('target-cal-input').value = targets.calories;
    document.getElementById('target-p-input').value = targets.protein;
    document.getElementById('target-c-input').value = targets.carbs;
    document.getElementById('target-f-input').value = targets.fat;
    document.getElementById('macro-targets-modal').classList.remove('hidden');
  },

  handleSaveTargets() {
    const cal = parseInt(document.getElementById('target-cal-input').value) || 2000;
    const p = parseInt(document.getElementById('target-p-input').value) || 150;
    const c = parseInt(document.getElementById('target-c-input').value) || 200;
    const f = parseInt(document.getElementById('target-f-input').value) || 60;

    StorageManager.saveMacroTargets({
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      waterLiters: 3.5
    });

    App.showToast('Macro goals updated successfully!', 'success');
    document.getElementById('macro-targets-modal').classList.add('hidden');
    this.updateMacroSummary();
    if (window.App && typeof App.updateDashboard === 'function') {
      App.updateDashboard();
    }
  }
};
