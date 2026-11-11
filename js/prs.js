// FitPulse Pro - Personal Records (PR) Vault & 1RM Progression Engine

const PRModule = {
  prChartInstance: null,
  activeExerciseFilter: 'all',

  init() {
    this.renderPRTable();
    this.renderAchievements();
    this.renderPRProgressionChart();
    this.bindEvents();
  },

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;
    // Add PR form submit
    const prForm = document.getElementById('add-pr-form');
    if (prForm) {
      prForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddPRSubmit();
      });
    }

    // Exercise filter for PR table & chart
    const filterSelect = document.getElementById('pr-filter-exercise');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.activeExerciseFilter = e.target.value;
        this.renderPRTable();
        this.renderPRProgressionChart();
      });
    }

    // 1RM Quick Calculator Form
    const rmForm = document.getElementById('one-rm-calc-form');
    if (rmForm) {
      rmForm.addEventListener('input', () => this.calculateOneRMPreview());
    }
  },

  handleAddPRSubmit() {
    const exerciseSelect = document.getElementById('pr-exercise-select');
    const customExerciseInput = document.getElementById('pr-custom-exercise');
    let exercise = exerciseSelect.value;

    if (exercise === 'custom') {
      exercise = customExerciseInput.value.trim();
      if (!exercise) {
        App.showToast('Please specify the custom exercise name', 'error');
        return;
      }
    }

    const weight = parseFloat(document.getElementById('pr-weight-input').value) || 0;
    const reps = parseInt(document.getElementById('pr-reps-input').value) || 1;
    const date = document.getElementById('pr-date-input').value || StorageManager.getTodayString();
    const rpe = parseFloat(document.getElementById('pr-rpe-input').value) || 9;
    const notes = document.getElementById('pr-notes-input').value.trim();

    if (weight <= 0) {
      App.showToast('Please enter a valid weight lifted', 'error');
      return;
    }

    const newPR = StorageManager.savePR({
      exercise,
      weight,
      reps,
      date,
      rpe,
      notes
    });

    // Confetti celebration!
    App.triggerConfetti();
    App.showToast(`🔥 New PR Recorded: ${exercise} ${weight}kg x ${reps} reps! (Est. 1RM: ${newPR.estimated1RM}kg)`, 'success');

    // Check achievement milestones
    this.checkAchievements(newPR);

    // Reset Form & Close Modal
    document.getElementById('add-pr-form').reset();
    document.getElementById('pr-modal').classList.add('hidden');
    document.getElementById('pr-custom-box').classList.add('hidden');

    this.renderPRTable();
    this.renderAchievements();
    this.renderPRProgressionChart();
    if (window.App && typeof App.updateDashboard === 'function') {
      App.updateDashboard();
    }
  },

  checkAchievements(latestPR) {
    StorageManager.unlockAchievement('first_pr');

    const prs = StorageManager.getPRs();
    let maxBench = 0;
    let maxSquat = 0;
    let maxDeadlift = 0;

    prs.forEach(pr => {
      const name = pr.exercise.toLowerCase();
      if (name.includes('bench')) {
        if (pr.estimated1RM > maxBench) maxBench = pr.estimated1RM;
      } else if (name.includes('squat')) {
        if (pr.estimated1RM > maxSquat) maxSquat = pr.estimated1RM;
      } else if (name.includes('deadlift')) {
        if (pr.estimated1RM > maxDeadlift) maxDeadlift = pr.estimated1RM;
      }
    });

    if (maxBench >= 60) StorageManager.unlockAchievement('plate_bench');
    if (maxBench >= 100) StorageManager.unlockAchievement('two_plate_bench');
    if (maxSquat >= 100) StorageManager.unlockAchievement('two_plate_squat');
    if (maxSquat >= 140) StorageManager.unlockAchievement('three_plate_squat');
    if (maxDeadlift >= 140) StorageManager.unlockAchievement('three_plate_deadlift');
    if (maxDeadlift >= 180) StorageManager.unlockAchievement('four_plate_deadlift');

    const bigThreeTotal = maxBench + maxSquat + maxDeadlift;
    if (bigThreeTotal >= 454) { // 1000 lbs ~ 453.6 kg
      const unlocked = StorageManager.unlockAchievement('thousand_pound_club');
      if (unlocked) {
        App.triggerConfetti();
        App.showToast('👑 LEGENDARY: You have entered the 1000-lb Club!', 'success');
      }
    }
  },

  renderPRTable() {
    const container = document.getElementById('pr-table-body');
    if (!container) return;

    let prs = StorageManager.getPRs();

    if (this.activeExerciseFilter !== 'all') {
      prs = prs.filter(p => p.exercise.toLowerCase().includes(this.activeExerciseFilter.toLowerCase()));
    }

    if (prs.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-slate-500 italic">
            No PR records found in this category. Click "Record New PR" to log your first record!
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = prs.map(pr => `
      <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 transition">
        <td class="py-3 px-4 font-semibold text-white flex items-center gap-2">
          <span class="text-emerald-400">⚡</span>
          <span>${pr.exercise}</span>
        </td>
        <td class="py-3 px-4 text-emerald-400 font-bold font-mono">${pr.weightKg} kg</td>
        <td class="py-3 px-4 text-slate-300 font-mono">${pr.reps}</td>
        <td class="py-3 px-4 text-cyan-400 font-bold font-mono">${pr.estimated1RM} kg</td>
        <td class="py-3 px-4 text-slate-400 text-xs">${pr.date}</td>
        <td class="py-3 px-4 text-slate-400 text-xs">
          ${pr.rpe ? `<span class="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">RPE ${pr.rpe}</span>` : '-'}
          ${pr.notes ? `<div class="text-[11px] text-slate-500 mt-0.5 italic truncate max-w-xs">${pr.notes}</div>` : ''}
        </td>
        <td class="py-3 px-4 text-right">
          <button onclick="PRModule.deletePR('${pr.id}')" 
                  title="Delete record" 
                  class="text-slate-500 hover:text-rose-400 p-1 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `).join('');
  },

  deletePR(id) {
    StorageManager.deletePR(id);
    App.showToast('PR record removed', 'info');
    this.renderPRTable();
    this.renderPRProgressionChart();
    if (window.App && typeof App.updateDashboard === 'function') {
      App.updateDashboard();
    }
  },

  renderAchievements() {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    const unlocked = StorageManager.getAchievements();

    container.innerHTML = PR_ACHIEVEMENTS.map(badge => {
      const isUnlocked = unlocked.includes(badge.id);
      return `
        <div class="p-3.5 rounded-xl border transition ${
          isUnlocked 
            ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
            : 'bg-slate-950/40 border-slate-800/80 opacity-50 grayscale'
        }">
          <div class="flex items-center gap-3">
            <div class="text-2xl">${badge.icon}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs ${isUnlocked ? 'text-white' : 'text-slate-400'}">${badge.name}</span>
                ${isUnlocked ? '<span class="text-[10px] text-emerald-400 font-semibold uppercase">Unlocked</span>' : '<span class="text-[10px] text-slate-600 uppercase">Locked</span>'}
              </div>
              <p class="text-[11px] text-slate-400 truncate mt-0.5">${badge.desc}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderPRProgressionChart() {
    const canvas = document.getElementById('pr-progression-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let prs = StorageManager.getPRs();

    if (this.activeExerciseFilter !== 'all') {
      prs = prs.filter(p => p.exercise.toLowerCase().includes(this.activeExerciseFilter.toLowerCase()));
    }

    // Sort chronologically ascending
    prs = [...prs].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (prs.length === 0) {
      if (this.prChartInstance) this.prChartInstance.destroy();
      return;
    }

    const labels = prs.map(p => `${p.exercise} (${p.date.slice(5)})`);
    const weightData = prs.map(p => p.weightKg);
    const est1RMData = prs.map(p => p.estimated1RM);

    if (this.prChartInstance) {
      this.prChartInstance.destroy();
    }

    this.prChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Actual Lift (kg)',
            data: weightData,
            borderColor: '#10b981', // Emerald
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            borderWidth: 3,
            fill: true,
            pointBackgroundColor: '#10b981',
            pointRadius: 5
          },
          {
            label: 'Estimated 1RM (kg)',
            data: est1RMData,
            borderColor: '#06b6d4', // Cyan
            borderDash: [5, 5],
            tension: 0.3,
            borderWidth: 2,
            pointBackgroundColor: '#06b6d4',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8', font: { family: "'Plus Jakarta Sans', sans-serif" } }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.dataset.label}: ${context.raw} kg`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', maxRotation: 45 }
          },
          y: {
            grid: { color: 'rgba(51, 65, 85, 0.4)' },
            ticks: {
              color: '#94a3b8',
              callback: (val) => `${val} kg`
            }
          }
        }
      }
    });
  },

  calculateOneRMPreview() {
    const weight = parseFloat(document.getElementById('calc-weight-input').value) || 0;
    const reps = parseInt(document.getElementById('calc-reps-input').value) || 1;

    if (weight <= 0 || reps <= 0) return;

    // Epley: weight * (1 + reps / 30)
    // Brzycki: weight * (36 / (37 - reps))
    const epley1RM = reps === 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10;
    const brzycki1RM = (reps < 37 && reps > 1) ? Math.round(weight * (36 / (37 - reps)) * 10) / 10 : epley1RM;

    document.getElementById('calc-epley-result').textContent = `${epley1RM} kg`;
    document.getElementById('calc-brzycki-result').textContent = `${brzycki1RM} kg`;

    // Percentage Breakdown
    const percentages = [95, 90, 85, 80, 75, 70];
    const tableBody = document.getElementById('calc-percentages-body');
    if (tableBody) {
      tableBody.innerHTML = percentages.map(pct => {
        const load = Math.round(epley1RM * (pct / 100) * 10) / 10;
        let repRange = '1-2';
        if (pct === 90) repRange = '3-4';
        else if (pct === 85) repRange = '5-6';
        else if (pct === 80) repRange = '7-8';
        else if (pct === 75) repRange = '9-10';
        else if (pct === 70) repRange = '11-12';

        return `
          <tr class="border-b border-slate-800 text-xs">
            <td class="py-1.5 px-3 font-semibold text-slate-300">${pct}%</td>
            <td class="py-1.5 px-3 font-mono font-bold text-emerald-400">${load} kg</td>
            <td class="py-1.5 px-3 text-slate-400 font-mono">${repRange} reps</td>
          </tr>
        `;
      }).join('');
    }
  },

  openPRModal() {
    document.getElementById('pr-date-input').value = StorageManager.getTodayString();
    document.getElementById('pr-modal').classList.remove('hidden');
  }
};
