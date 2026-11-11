// FitPulse Pro - Dynamic Workout Split Suggestion Engine

const WorkoutModule = {
  currentSplit: null,

  init() {
    this.bindEvents();
    const saved = StorageManager.getWorkoutSplit();
    if (saved) {
      this.currentSplit = saved;
      this.renderSplit(saved);
    } else {
      // Default to 4-day Upper/Lower
      this.currentSplit = WORKOUT_SPLITS['4-days'];
      this.renderSplit(this.currentSplit);
    }
  },

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;
    const splitForm = document.getElementById('workout-split-form');
    if (splitForm) {
      splitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.generateWorkoutSplit();
      });
    }
  },

  generateWorkoutSplit() {
    const daysAvailable = document.getElementById('split-days').value; // '2-days', '3-days', '4-days', '5-days', '6-days'
    const equipment = document.getElementById('split-equipment').value; // 'gym', 'home_dumbbells', 'calisthenics'
    const experience = document.getElementById('split-experience').value; // 'beginner', 'intermediate', 'advanced'
    const focus = document.getElementById('split-focus').value; // 'hypertrophy', 'strength', 'fat_loss', 'time_efficient'
    const sessionTime = document.getElementById('split-duration').value; // '30_45', '45_60', '60_75'

    let baseSplit = WORKOUT_SPLITS[daysAvailable];
    if (!baseSplit) baseSplit = WORKOUT_SPLITS['4-days'];

    // Deep clone base split so we can customize exercises based on equipment & duration
    const customSplit = JSON.parse(JSON.stringify(baseSplit));
    customSplit.equipment = equipment;
    customSplit.experience = experience;
    customSplit.focus = focus;
    customSplit.sessionTime = sessionTime;

    // Adapt exercises if user selected Home Dumbbells or Calisthenics
    if (equipment === 'home_dumbbells') {
      customSplit.days.forEach(day => {
        day.exercises.forEach(ex => {
          if (ex.name.toLowerCase().includes('barbell bench')) ex.name = 'Flat Dumbbell Press';
          if (ex.name.toLowerCase().includes('barbell back squat')) ex.name = 'Dumbbell Goblet Squat';
          if (ex.name.toLowerCase().includes('deadlift')) ex.name = 'Dumbbell Romanian Deadlift';
          if (ex.name.toLowerCase().includes('lat pulldown') || ex.name.toLowerCase().includes('cable')) {
            ex.name = ex.swap || 'Single-Arm Dumbbell Row';
          }
          if (ex.name.toLowerCase().includes('leg press') || ex.name.toLowerCase().includes('leg extension')) {
            ex.name = 'Bulgarian Split Squats (Dumbbell)';
          }
        });
      });
    } else if (equipment === 'calisthenics') {
      customSplit.days.forEach(day => {
        day.exercises.forEach(ex => {
          if (ex.name.toLowerCase().includes('bench')) ex.name = 'Decline Push-ups / Weighted Push-ups';
          if (ex.name.toLowerCase().includes('squat')) ex.name = 'Pistol Squats (Assisted or Unassisted)';
          if (ex.name.toLowerCase().includes('deadlift')) ex.name = 'Single-Leg Bodyweight RDL & Glute Bridges';
          if (ex.name.toLowerCase().includes('row') || ex.name.toLowerCase().includes('pulldown')) ex.name = 'Inverted Bodyweight Rows / Pull-ups';
          if (ex.name.toLowerCase().includes('shoulder press')) ex.name = 'Pike Push-ups / Handstand Push-ups';
          if (ex.name.toLowerCase().includes('tricep') || ex.name.toLowerCase().includes('pushdown')) ex.name = 'Parallel Bar Dips / Bench Dips';
          if (ex.name.toLowerCase().includes('curl')) ex.name = 'Chin-ups (Underhand Grip)';
        });
      });
    }

    // Adapt volume if time-efficient
    if (sessionTime === '30_45') {
      customSplit.days.forEach(day => {
        // Trim to 4 high-yield compound exercises
        day.exercises = day.exercises.slice(0, 4);
        day.exercises.forEach(ex => {
          ex.sets = '3';
          ex.rest = '60-75 sec';
        });
      });
    }

    this.currentSplit = customSplit;
    StorageManager.saveWorkoutSplit(customSplit);
    this.renderSplit(customSplit);

    App.showToast(`Custom ${customSplit.name} created!`, 'success');
  },

  renderSplit(split) {
    const container = document.getElementById('workout-split-result');
    if (!container) return;

    const daysCount = split.days.length;
    const eqLabel = EQUIPMENT_MODIFIERS[split.equipment] || 'Full Commercial Gym';

    // Generate weekly schedule matrix
    const scheduleMatrix = this.generateWeeklyCalendar(daysCount);

    container.innerHTML = `
      <!-- Program Banner -->
      <div class="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl mb-6 shadow-xl relative overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
              <h3 class="text-xl font-bold text-white">${split.name}</h3>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed max-w-2xl">${split.description}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" 
                    class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 border border-slate-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
              Print Routine
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-700/60 text-xs">
          <span class="px-2.5 py-1 rounded-lg bg-slate-950/80 text-emerald-400 border border-slate-800 font-medium">⚡ ${daysCount} Days / Week</span>
          <span class="px-2.5 py-1 rounded-lg bg-slate-950/80 text-cyan-400 border border-slate-800 font-medium">🏋️ ${eqLabel}</span>
          <span class="px-2.5 py-1 rounded-lg bg-slate-950/80 text-amber-400 border border-slate-800 font-medium">⏱️ ${split.sessionTime ? split.sessionTime.replace('_', '-') + ' mins' : '45-60 mins'}</span>
          <span class="px-2.5 py-1 rounded-lg bg-slate-950/80 text-purple-400 border border-slate-800 font-medium">🎯 ${split.focus ? split.focus.toUpperCase() : 'HYPERTROPHY'}</span>
        </div>
      </div>

      <!-- Weekly Schedule Matrix -->
      <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-xl mb-6">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <span>📅 Weekly Suggested Calendar</span>
        </h4>
        <div class="grid grid-cols-7 gap-2 text-center">
          ${scheduleMatrix.map(item => `
            <div class="p-2.5 rounded-lg border ${
              item.isRest 
                ? 'bg-slate-950/40 border-slate-800/60 text-slate-500' 
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            }">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">${item.day}</div>
              <div class="text-xs font-semibold truncate ${item.isRest ? 'text-slate-500' : 'text-emerald-400'}">${item.activity}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Day by Day Routine Tables -->
      <div class="space-y-6">
        ${split.days.map((d, dIdx) => `
          <div class="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
              <div>
                <h4 class="text-base font-bold text-white flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">${dIdx + 1}</span>
                  <span>${d.day}</span>
                </h4>
                <p class="text-xs text-slate-400 mt-0.5">Primary Target: <span class="text-cyan-400 font-medium">${d.target}</span></p>
              </div>
              <span class="text-xs text-slate-400 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 font-mono">${d.exercises.length} Movements</span>
            </div>

            <!-- Exercises Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-slate-300">
                <thead class="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/50">
                  <tr>
                    <th class="py-2.5 px-3 rounded-l-lg">Exercise</th>
                    <th class="py-2.5 px-3">Sets</th>
                    <th class="py-2.5 px-3">Reps</th>
                    <th class="py-2.5 px-3">Rest</th>
                    <th class="py-2.5 px-3">Form & Coaching Cue</th>
                    <th class="py-2.5 px-3">Alternative Swap</th>
                    <th class="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 text-xs">
                  ${d.exercises.map((ex, exIdx) => `
                    <tr class="hover:bg-slate-800/40 transition">
                      <td class="py-3 px-3 font-semibold text-white">
                        <div class="flex items-center gap-1.5">
                          <span class="text-emerald-400">•</span>
                          <span id="ex-name-${dIdx}-${exIdx}">${ex.name}</span>
                        </div>
                      </td>
                      <td class="py-3 px-3 font-mono font-bold text-emerald-400">${ex.sets}</td>
                      <td class="py-3 px-3 font-mono text-cyan-400">${ex.reps}</td>
                      <td class="py-3 px-3 font-mono text-amber-400">${ex.rest}</td>
                      <td class="py-3 px-3 text-slate-400 text-[11px] max-w-xs">${ex.notes}</td>
                      <td class="py-3 px-3 text-slate-400 text-[11px]">
                        ${ex.swap ? `
                          <button onclick="WorkoutModule.swapExercise(${dIdx}, ${exIdx})" 
                                  title="Click to swap with ${ex.swap}" 
                                  class="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer">
                            ⇄ ${ex.swap}
                          </button>
                        ` : '-'}
                      </td>
                      <td class="py-3 px-3 text-right">
                        <button onclick="WorkoutModule.sendExerciseToPR('${ex.name.replace(/'/g, "\\'")}')" 
                                title="Log a PR for this exercise" 
                                class="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-[11px] font-medium transition inline-flex items-center gap-1">
                          <span>⚡ Log PR</span>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Dynamic Warmup Note -->
            <div class="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span class="text-amber-400">🔥</span>
                <span><strong>Warm-up:</strong> 5-8 mins dynamic mobility (band pull-aparts, hip openers, 2 acclimation warm-up sets).</span>
              </span>
              <span class="text-slate-500 italic">Progressive Overload: Add 1-2kg or 1 rep when top reps are achieved.</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  generateWeeklyCalendar(daysCount) {
    if (daysCount === 2) {
      return [
        { day: 'Mon', activity: 'Workout A', isRest: false },
        { day: 'Tue', activity: 'Rest / Active Walk', isRest: true },
        { day: 'Wed', activity: 'Rest / Mobility', isRest: true },
        { day: 'Thu', activity: 'Workout B', isRest: false },
        { day: 'Fri', activity: 'Rest / Active Walk', isRest: true },
        { day: 'Sat', activity: 'Light Cardio', isRest: true },
        { day: 'Sun', activity: 'Full Recovery', isRest: true }
      ];
    } else if (daysCount === 3) {
      return [
        { day: 'Mon', activity: 'Push Day', isRest: false },
        { day: 'Tue', activity: 'Active Rest', isRest: true },
        { day: 'Wed', activity: 'Pull Day', isRest: false },
        { day: 'Thu', activity: 'Active Rest', isRest: true },
        { day: 'Fri', activity: 'Legs & Core', isRest: false },
        { day: 'Sat', activity: 'Cardio / Stretch', isRest: true },
        { day: 'Sun', activity: 'Full Recovery', isRest: true }
      ];
    } else if (daysCount === 4) {
      return [
        { day: 'Mon', activity: 'Upper Power', isRest: false },
        { day: 'Tue', activity: 'Lower Power', isRest: false },
        { day: 'Wed', activity: 'Active Recovery', isRest: true },
        { day: 'Thu', activity: 'Upper Hypertrophy', isRest: false },
        { day: 'Fri', activity: 'Lower Hypertrophy', isRest: false },
        { day: 'Sat', activity: '10K Steps / Stretch', isRest: true },
        { day: 'Sun', activity: 'Full Recovery', isRest: true }
      ];
    } else if (daysCount === 5) {
      return [
        { day: 'Mon', activity: 'Upper Power', isRest: false },
        { day: 'Tue', activity: 'Lower Power', isRest: false },
        { day: 'Wed', activity: 'Active Rest', isRest: true },
        { day: 'Thu', activity: 'Push Pump', isRest: false },
        { day: 'Fri', activity: 'Pull Pump', isRest: false },
        { day: 'Sat', activity: 'Legs Pump', isRest: false },
        { day: 'Sun', activity: 'Rest & Meal Prep', isRest: true }
      ];
    } else {
      // 6 days
      return [
        { day: 'Mon', activity: 'Push A', isRest: false },
        { day: 'Tue', activity: 'Pull A', isRest: false },
        { day: 'Wed', activity: 'Legs A', isRest: false },
        { day: 'Thu', activity: 'Push B', isRest: false },
        { day: 'Fri', activity: 'Pull B', isRest: false },
        { day: 'Sat', activity: 'Legs B', isRest: false },
        { day: 'Sun', activity: 'Full Recovery', isRest: true }
      ];
    }
  },

  swapExercise(dayIdx, exIdx) {
    if (!this.currentSplit || !this.currentSplit.days[dayIdx]) return;
    const ex = this.currentSplit.days[dayIdx].exercises[exIdx];
    if (!ex || !ex.swap) return;

    const temp = ex.name;
    ex.name = ex.swap;
    ex.swap = temp;

    StorageManager.saveWorkoutSplit(this.currentSplit);
    this.renderSplit(this.currentSplit);
    App.showToast(`Swapped to: ${ex.name}`, 'info');
  },

  sendExerciseToPR(exerciseName) {
    App.switchTab('prs');
    PRModule.openPRModal();

    const select = document.getElementById('pr-exercise-select');
    const customBox = document.getElementById('pr-custom-box');
    const customInput = document.getElementById('pr-custom-exercise');

    let matched = false;
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].text.toLowerCase().includes(exerciseName.toLowerCase()) || 
          exerciseName.toLowerCase().includes(select.options[i].text.toLowerCase())) {
        select.selectedIndex = i;
        matched = true;
        break;
      }
    }

    if (!matched) {
      select.value = 'custom';
      customBox.classList.remove('hidden');
      customInput.value = exerciseName;
    } else {
      customBox.classList.add('hidden');
    }

    App.showToast(`Ready to record PR for ${exerciseName}!`, 'info');
  }
};
