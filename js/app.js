// FitPulse Pro - Master Application Controller

const App = {
  activeTab: 'dashboard',

  init() {
    console.log('Initializing FitPulse Pro Application...');

    // Initialize Auth first so current user is known
    if (window.AuthManager) {
      AuthManager.init();
    }

    // Initialize individual modules
    this.reloadAllModules();

    this.bindGlobalEvents();

    // Check if user is logged in
    const currentUser = window.AuthManager ? AuthManager.getCurrentUser() : null;
    if (currentUser) {
      this.switchTab('dashboard');
    } else {
      if (window.AuthManager) AuthManager.openAuthModal('signin');
    }

    console.log('FitPulse Pro initialized successfully.');
  },

  reloadAllModules() {
    try {
      if (window.MacrosModule) MacrosModule.init();
      if (window.StepsModule) StepsModule.init();
      if (window.DietModule) DietModule.init();
      if (window.PRModule) PRModule.init();
      if (window.WorkoutModule) WorkoutModule.init();
      if (window.CameraVisionModule) CameraVisionModule.init();
      if (window.ChatbotModule) ChatbotModule.init();
      this.updateDashboard();
      if (window.AuthManager) AuthManager.updateHeaderUI();
    } catch (e) {
      console.warn('Module reload notice:', e);
    }
  },

  bindGlobalEvents() {
    // Tab switching
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-tab-target');
        this.switchTab(target);
      });
    });

    // Modal close buttons
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.getAttribute('data-modal-close');
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('hidden');
      });
    });

    // Close modals on clicking backdrop
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });

    // PR Exercise select change (show custom input if 'custom')
    const prExerciseSelect = document.getElementById('pr-exercise-select');
    if (prExerciseSelect) {
      prExerciseSelect.addEventListener('change', (e) => {
        const customBox = document.getElementById('pr-custom-box');
        if (e.target.value === 'custom') {
          customBox.classList.remove('hidden');
        } else {
          customBox.classList.add('hidden');
        }
      });
    }

    // Reset Data button
    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data and re-seed sample defaults?')) {
          StorageManager.clearAll();
          StorageManager.loadSampleData();
          location.reload();
        }
      });
    }
  },

  switchTab(tabId) {
    // Authentication Guard: When not logged in, immediately pop up Sign In / Sign Up modal
    const user = window.AuthManager ? AuthManager.getCurrentUser() : null;
    if (!user) {
      if (window.AuthManager) AuthManager.openAuthModal('signin');
      return;
    }

    this.activeTab = tabId;

    // Update nav links styling
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      const isTarget = btn.getAttribute('data-tab-target') === tabId;
      if (isTarget) {
        btn.classList.add('active-nav-tab');
        btn.classList.remove('inactive-nav-tab');
      } else {
        btn.classList.remove('active-nav-tab');
        btn.classList.add('inactive-nav-tab');
      }
    });

    // Hide all tab views, show target
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.add('hidden');
    });

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
      targetView.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Stop camera stream if navigating away from camera tab
    if (tabId !== 'camera' && window.CameraVisionModule && CameraVisionModule.stream) {
      CameraVisionModule.stopCamera();
    }

    // Trigger tab-specific refresh if needed
    if (tabId === 'dashboard') {
      this.updateDashboard();
    } else if (tabId === 'macros') {
      MacrosModule.updateMacroSummary();
    } else if (tabId === 'steps') {
      StepsModule.updateDisplay();
      StepsModule.renderWeeklyChart();
    } else if (tabId === 'prs') {
      PRModule.renderPRTable();
      PRModule.renderPRProgressionChart();
    } else if (tabId === 'chat' && window.ChatbotModule) {
      ChatbotModule.renderMessages();
      const fullInput = document.getElementById('full-chatbot-input');
      if (fullInput) setTimeout(() => fullInput.focus(), 150);
    } else if (tabId === 'auth' && window.AuthManager) {
      AuthManager.renderAuthPage();
    }
  },

  updateDashboard() {
    const today = StorageManager.getTodayString();
    const targets = StorageManager.getMacroTargets();
    const meals = StorageManager.getMeals(today);
    const stepData = StorageManager.getStepsForDate(today);
    const prs = StorageManager.getPRs();
    const profile = StorageManager.getProfile();

    // Personalized greeting banner
    const greetingEl = document.getElementById('dash-user-greeting');
    if (greetingEl) {
      const user = window.AuthManager ? AuthManager.getCurrentUser() : null;
      const userName = user ? user.name : 'Athlete';
      const goalStr = (profile.goal || 'fat_loss').replace('_', ' ').toUpperCase();
      const conditionStr = (profile.condition || 'healthy').replace('_', ' ').toUpperCase();
      greetingEl.innerHTML = `<span class="text-emerald-700 font-bold">Welcome back, ${userName}!</span> • Goal: <span class="font-semibold text-slate-700">${goalStr}</span> • Clinical Protocol: <span class="font-semibold text-slate-700">${conditionStr}</span>`;
    }

    // 1. Calories Calculation
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

    const netCalories = totalCal - stepData.caloriesBurned;

    document.getElementById('dash-cal-consumed').textContent = totalCal;
    document.getElementById('dash-cal-target').textContent = targets.calories;
    document.getElementById('dash-cal-burned').textContent = stepData.caloriesBurned;
    document.getElementById('dash-cal-net').textContent = netCalories;

    // Progress bar for calories
    const calPct = Math.min(100, Math.round((totalCal / targets.calories) * 100));
    document.getElementById('dash-cal-bar').style.width = `${calPct}%`;

    // 2. Protein Status
    document.getElementById('dash-protein-consumed').textContent = `${Math.round(totalP)}g`;
    document.getElementById('dash-protein-target').textContent = `/ ${targets.protein}g`;
    const pPct = Math.min(100, Math.round((totalP / targets.protein) * 100));
    document.getElementById('dash-protein-bar').style.width = `${pPct}%`;

    // 3. Steps Status
    const stepGoal = stepData.goal || 10000;
    document.getElementById('dash-step-count').textContent = stepData.steps.toLocaleString();
    document.getElementById('dash-step-goal').textContent = `/ ${stepGoal.toLocaleString()}`;
    const stepPct = Math.min(100, Math.round((stepData.steps / stepGoal) * 100));
    document.getElementById('dash-step-bar').style.width = `${stepPct}%`;
    document.getElementById('dash-step-dist').textContent = `${stepData.distanceKm} km walked`;

    // 4. PR Spotlight
    const spotlightEl = document.getElementById('dash-pr-spotlight');
    if (prs.length > 0) {
      const bestPR = prs[0];
      spotlightEl.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Latest PR</span>
          <span class="text-[10px] text-slate-500 font-mono">${bestPR.date}</span>
        </div>
        <div class="text-base font-bold text-white truncate mt-1">${bestPR.exercise}</div>
        <div class="flex items-baseline gap-2 mt-0.5">
          <span class="text-xl font-extrabold text-emerald-400 font-mono">${bestPR.weightKg} kg</span>
          <span class="text-xs text-slate-400 font-mono">x ${bestPR.reps} reps</span>
          <span class="text-xs text-cyan-400 font-mono ml-auto">1RM: ${bestPR.estimated1RM} kg</span>
        </div>
      `;
    } else {
      spotlightEl.innerHTML = `
        <div class="text-xs text-slate-500 italic py-2">
          No PR recorded yet. Record your bench, squat, or deadlift to spotlight it here!
        </div>
      `;
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200',
      error: 'bg-rose-950/90 border-rose-500/60 text-rose-200',
      warning: 'bg-amber-950/90 border-amber-500/60 text-amber-200',
      info: 'bg-slate-900/90 border-cyan-500/60 text-cyan-200'
    };

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-medium transform transition-all duration-300 translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
      <span class="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[11px]">${icons[type] || '•'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#ec4899']
      });
    }
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
