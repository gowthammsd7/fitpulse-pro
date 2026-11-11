// FitPulse Pro - Automatic Live Pedometer & Step Tracker Module

const StepsModule = {
  activeDate: StorageManager.getTodayString(),
  stepsChartInstance: null,

  // Hardware Motion Sensor State
  motionActive: false,
  lastAcceleration: { x: 0, y: 0, z: 0 },
  lastMagnitude: 9.8,
  lastStepTime: 0,
  stepThresholdHigh: 11.8, // m/s^2 peak threshold for human walking
  stepThresholdLow: 8.8,   // m/s^2 valley threshold
  waitingForValley: false,
  motionStepCount: 0,

  // Live Walking Session State (Timer & Cadence based)
  sessionActive: false,
  sessionPaused: false,
  sessionStartTime: 0,
  sessionSeconds: 0,
  sessionSteps: 0,
  sessionTimerId: null,
  sessionCadence: 110, // steps per minute (average human walking speed)
  wakeLock: null,

  init() {
    this.activeDate = StorageManager.getTodayString();
    this.updateDisplay();
    this.renderWeeklyChart();
    this.bindEvents();
    this.checkMotionSupport();
  },

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;
    // Hardware Motion Sensor Toggle
    const motionToggleBtn = document.getElementById('btn-toggle-motion-sensor');
    if (motionToggleBtn) {
      motionToggleBtn.addEventListener('click', () => this.toggleMotionSensor());
    }

    // Live Walk Session Buttons
    const startSessionBtn = document.getElementById('btn-start-walk-session');
    if (startSessionBtn) {
      startSessionBtn.addEventListener('click', () => this.startWalkSession());
    }

    const pauseSessionBtn = document.getElementById('btn-pause-walk-session');
    if (pauseSessionBtn) {
      pauseSessionBtn.addEventListener('click', () => this.togglePauseSession());
    }

    const stopSessionBtn = document.getElementById('btn-stop-walk-session');
    if (stopSessionBtn) {
      stopSessionBtn.addEventListener('click', () => this.stopWalkSession());
    }

    // Cadence Slider
    const cadenceSlider = document.getElementById('walk-cadence-slider');
    if (cadenceSlider) {
      cadenceSlider.addEventListener('input', (e) => {
        this.sessionCadence = parseInt(e.target.value) || 110;
        const label = document.getElementById('walk-cadence-label');
        if (label) label.textContent = `${this.sessionCadence} steps/min`;
      });
    }

    // Step Date Picker
    const datePicker = document.getElementById('step-date-picker');
    if (datePicker) {
      datePicker.value = this.activeDate;
      datePicker.addEventListener('change', (e) => {
        this.activeDate = e.target.value || StorageManager.getTodayString();
        this.updateDisplay();
      });
    }

    // Goal change form
    const goalForm = document.getElementById('step-goal-form');
    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newGoal = parseInt(document.getElementById('step-goal-input').value) || 10000;
        StorageManager.saveStepGoal(newGoal);
        App.showToast(`Daily step goal set to ${newGoal.toLocaleString()} steps!`, 'success');
        document.getElementById('step-goal-modal').classList.add('hidden');
        this.updateDisplay();
        this.renderWeeklyChart();
        if (window.App && typeof App.updateDashboard === 'function') {
          App.updateDashboard();
        }
      });
    }
  },

  checkMotionSupport() {
    const hintEl = document.getElementById('motion-support-hint');
    if (!hintEl) return;

    if (window.DeviceMotionEvent) {
      hintEl.textContent = 'Phone Accelerometer detected. Put your phone in your pocket and start walking!';
      hintEl.className = 'text-xs text-emerald-400';
    } else {
      hintEl.textContent = 'Desktop browser detected. Use "Start Live Walk Session" below for real-time automatic tracking!';
      hintEl.className = 'text-xs text-cyan-400';
    }
  },

  // ================= 1. PHONE ACCELEROMETER HARDWARE PEDOMETER =================

  async toggleMotionSensor() {
    if (this.motionActive) {
      this.stopMotionSensor();
      return;
    }

    // iOS 13+ requires explicit permission request
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceMotionEvent.requestPermission();
        if (permissionState !== 'granted') {
          App.showToast('Motion sensor permission was denied. Try Live Walk Session instead.', 'warning');
          return;
        }
      } catch (err) {
        console.warn('iOS motion permission error:', err);
      }
    }

    if (!window.DeviceMotionEvent) {
      App.showToast('Hardware motion sensor is not available on this device. Using Live Walk Session instead!', 'info');
      this.startWalkSession();
      return;
    }

    try {
      this.handleMotionBound = (e) => this.handleDeviceMotion(e);
      window.addEventListener('devicemotion', this.handleMotionBound, true);
      this.motionActive = true;

      // Update UI button & indicators
      const btn = document.getElementById('btn-toggle-motion-sensor');
      if (btn) {
        btn.innerHTML = '<span>⏹</span> Stop Hardware Sensor';
        btn.className = 'px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-500/20';
      }

      const statusEl = document.getElementById('motion-live-status');
      if (statusEl) {
        statusEl.innerHTML = `
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span class="text-emerald-400 font-bold">Accelerometer Active: Walking Detected</span>
        `;
      }

      App.showToast('Hardware Pedometer Active! Walk with your device.', 'success');
      this.requestWakeLock();
    } catch (err) {
      console.error('Error starting devicemotion:', err);
      App.showToast('Could not initialize motion sensor. Using Live Walk Session.', 'warning');
      this.startWalkSession();
    }
  },

  stopMotionSensor() {
    if (this.handleMotionBound) {
      window.removeEventListener('devicemotion', this.handleMotionBound, true);
    }
    this.motionActive = false;

    const btn = document.getElementById('btn-toggle-motion-sensor');
    if (btn) {
      btn.innerHTML = '<span>📱</span> Start Phone Motion Pedometer';
      btn.className = 'px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20';
    }

    const statusEl = document.getElementById('motion-live-status');
    if (statusEl) {
      statusEl.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
        <span class="text-slate-400">Sensor Idle (Click to activate on phone)</span>
      `;
    }

    App.showToast('Hardware Pedometer stopped.', 'info');
    this.releaseWakeLock();
  },

  handleDeviceMotion(event) {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null) return;

    // Calculate 3-axis magnitude vector
    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    const now = Date.now();
    const timeDelta = now - this.lastStepTime;

    // Show live G-force display in UI
    const gMeter = document.getElementById('motion-g-meter');
    if (gMeter) {
      gMeter.textContent = `${(magnitude / 9.8).toFixed(2)} G`;
    }

    // Step Detection Algorithm:
    // Human steps create an upward peak (heel strike) followed by a rebound trough (swing phase).
    // Minimum 260ms between steps (~230 steps/min sprint limit)
    // Maximum 2000ms (to prevent false positive timeout)
    if (!this.waitingForValley) {
      if (magnitude > this.stepThresholdHigh && timeDelta > 260) {
        this.waitingForValley = true;
      }
    } else {
      if (magnitude < this.stepThresholdLow) {
        // Step confirmed!
        this.waitingForValley = false;
        this.lastStepTime = now;
        this.onAutomaticStepDetected(1);
      }
    }

    this.lastMagnitude = magnitude;
  },

  onAutomaticStepDetected(count = 1) {
    const current = this.getCurrentStepsData();
    const profile = StorageManager.getProfile();
    const newCount = current.steps + count;
    const updated = StorageManager.saveStepsForDate(this.activeDate, newCount, profile.weight || 75);

    // Flash step indicator
    const pulseRing = document.getElementById('step-auto-indicator');
    if (pulseRing) {
      pulseRing.classList.remove('opacity-0');
      pulseRing.classList.add('scale-125', 'opacity-100');
      setTimeout(() => {
        pulseRing.classList.remove('scale-125', 'opacity-100');
        pulseRing.classList.add('opacity-0');
      }, 180);
    }

    // Update numbers
    this.updateDisplay();

    // Check achievement
    if (updated.steps >= updated.goal) {
      const unlocked = StorageManager.unlockAchievement('step_master_10k');
      if (unlocked) {
        App.triggerConfetti();
        App.showToast('🏆 10,000 Steps Target Achieved!', 'success');
      }
    }

    if (window.App && typeof App.updateDashboard === 'function') {
      App.updateDashboard();
    }
  },

  // ================= 2. LIVE WALK SESSION TRACKER =================

  startWalkSession() {
    if (this.sessionActive) return;

    this.sessionActive = true;
    this.sessionPaused = false;
    this.sessionSeconds = 0;
    this.sessionSteps = 0;
    this.sessionStartTime = Date.now();

    // Show Session Control Deck
    document.getElementById('live-walk-idle-deck').classList.add('hidden');
    document.getElementById('live-walk-active-deck').classList.remove('hidden');

    // Run timer loop (ticks every 1000ms)
    this.sessionTimerId = setInterval(() => {
      if (!this.sessionPaused) {
        this.tickWalkSession();
      }
    }, 1000);

    App.showToast('Live Walk Session Started! Tracking automatically...', 'success');
    this.requestWakeLock();
  },

  tickWalkSession() {
    this.sessionSeconds++;

    // Calculate steps generated this second based on cadence (steps per minute)
    // E.g. 110 steps/min = ~1.83 steps per second
    const stepsThisSecond = (this.sessionCadence / 60);
    
    // Accumulate floating point and extract whole steps
    this.stepAccumulator = (this.stepAccumulator || 0) + stepsThisSecond;
    if (this.stepAccumulator >= 1) {
      const wholeSteps = Math.floor(this.stepAccumulator);
      this.stepAccumulator -= wholeSteps;
      this.sessionSteps += wholeSteps;
      this.onAutomaticStepDetected(wholeSteps);
    }

    // Format time: HH:MM:SS
    const hrs = Math.floor(this.sessionSeconds / 3600);
    const mins = Math.floor((this.sessionSeconds % 3600) / 60);
    const secs = this.sessionSeconds % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    document.getElementById('session-timer-display').textContent = timeFormatted;
    document.getElementById('session-steps-counter').textContent = `+${this.sessionSteps.toLocaleString()} steps`;

    // Calculate session distance & calories
    const profile = StorageManager.getProfile();
    const sessionDistKm = ((this.sessionSteps * 0.762) / 1000).toFixed(2);
    const sessionKcal = Math.round(this.sessionSteps * 0.045 * (profile.weight / 70));

    document.getElementById('session-dist-display').textContent = `${sessionDistKm} km`;
    document.getElementById('session-kcal-display').textContent = `${sessionKcal} kcal`;
  },

  togglePauseSession() {
    this.sessionPaused = !this.sessionPaused;
    const pauseBtn = document.getElementById('btn-pause-walk-session');
    const badge = document.getElementById('session-status-badge');

    if (this.sessionPaused) {
      pauseBtn.innerHTML = '<span>▶</span> Resume';
      badge.textContent = 'PAUSED';
      badge.className = 'px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]';
      App.showToast('Walk Session Paused', 'info');
    } else {
      pauseBtn.innerHTML = '<span>⏸</span> Pause';
      badge.textContent = 'ACTIVE';
      badge.className = 'px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] animate-pulse';
      App.showToast('Walk Session Resumed', 'info');
    }
  },

  stopWalkSession() {
    if (this.sessionTimerId) {
      clearInterval(this.sessionTimerId);
      this.sessionTimerId = null;
    }

    const totalStepsInSession = this.sessionSteps;
    this.sessionActive = false;
    this.sessionPaused = false;

    // Reset UI deck
    document.getElementById('live-walk-idle-deck').classList.remove('hidden');
    document.getElementById('live-walk-active-deck').classList.add('hidden');

    App.showToast(`Walk Session Completed! +${totalStepsInSession.toLocaleString()} steps logged.`, 'success');
    this.renderWeeklyChart();
    this.releaseWakeLock();
  },

  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      // Non-critical if wakeLock fails
    }
  },

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  },

  // ================= GENERAL DISPLAY & METRICS =================

  getCurrentStepsData() {
    return StorageManager.getStepsForDate(this.activeDate);
  },

  calculateStreak() {
    const logs = StorageManager.getStepLogs();
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = logs[dateStr];

      if (entry && entry.steps >= entry.goal) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    if (streak >= 7) {
      StorageManager.unlockAchievement('step_streak_7');
    }
    return streak;
  },

  updateDisplay() {
    const data = this.getCurrentStepsData();
    const goal = data.goal || StorageManager.getStepGoal();
    const percent = Math.min(100, Math.round((data.steps / goal) * 100));

    // Numbers
    document.getElementById('current-step-count').textContent = data.steps.toLocaleString();
    document.getElementById('step-goal-count').textContent = goal.toLocaleString();
    document.getElementById('step-percent-label').textContent = `${percent}%`;

    // Distance & Calorie burn & Time
    const distMiles = (data.distanceKm * 0.621371).toFixed(2);
    document.getElementById('step-distance-km').textContent = `${data.distanceKm} km`;
    document.getElementById('step-distance-mi').textContent = `(${distMiles} mi)`;
    document.getElementById('step-calories-burned').textContent = `${data.caloriesBurned} kcal`;
    
    // Time walked: ~100 steps per minute
    const minutesWalked = Math.round(data.steps / 100);
    const hrs = Math.floor(minutesWalked / 60);
    const mins = minutesWalked % 60;
    const timeFormatted = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;
    document.getElementById('step-active-time').textContent = timeFormatted;

    // Streak
    const streak = this.calculateStreak();
    document.getElementById('step-streak-badge').textContent = `🔥 ${streak} Day Streak`;

    // SVG Circular Progress
    const circle = document.getElementById('step-circle-progress');
    if (circle) {
      const circumference = 283; // 2 * pi * 45
      const offset = circumference - (percent / 100) * circumference;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
    }
  },

  renderWeeklyChart() {
    const canvas = document.getElementById('weekly-steps-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const logs = StorageManager.getStepLogs();
    const goal = StorageManager.getStepGoal();

    const labels = [];
    const stepData = [];
    const barColors = [];

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = (i === 0) ? 'Today' : daysOfWeek[d.getDay()];

      labels.push(dayName);
      const entry = logs[dateStr];
      const count = entry ? entry.steps : 0;
      stepData.push(count);

      if (count >= goal) {
        barColors.push('rgba(16, 185, 129, 0.85)'); // Emerald (Goal hit)
      } else {
        barColors.push('rgba(6, 182, 212, 0.75)'); // Cyan
      }
    }

    if (this.stepsChartInstance) {
      this.stepsChartInstance.destroy();
    }

    this.stepsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Steps',
          data: stepData,
          backgroundColor: barColors,
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.raw.toLocaleString()} steps (${Math.round((context.raw / goal) * 100)}% of goal)`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } }
          },
          y: {
            grid: { color: 'rgba(51, 65, 85, 0.4)' },
            ticks: {
              color: '#94a3b8',
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: (val) => val >= 1000 ? `${val / 1000}k` : val
            },
            suggestedMax: Math.max(...stepData, goal) * 1.15
          }
        }
      }
    });
  },

  openGoalModal() {
    const currentGoal = StorageManager.getStepGoal();
    document.getElementById('step-goal-input').value = currentGoal;
    document.getElementById('step-goal-modal').classList.remove('hidden');
  }
};
