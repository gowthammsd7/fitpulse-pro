// FitPulse Pro - Authentication, Modal Popup & Account Isolation Engine

const AUTH_KEYS = {
  USERS: 'fitpulse_registered_users',
  SESSION: 'fitpulse_auth_session'
};

const AuthManager = {
  currentUser: null,
  activeMode: 'signin', // 'signin' or 'signup'

  init() {
    this.purgeOldAndDuplicateAccounts();
    this.restoreSession();
    this.bindEvents();
    this.updateHeaderUI();

    // The user requested: "as i click on the link sign in / signup should be popped up" & "no account should be signed in"
    // Pop up the Sign In / Sign Up modal dialog immediately on page visit if not logged in
    if (!this.currentUser) {
      setTimeout(() => {
        this.openAuthModal('signin');
      }, 50);
    }
  },

  // Completely wipe Jordan Hayes, Priya Sharma, test accounts, and deduplicate all records
  purgeOldAndDuplicateAccounts() {
    try {
      // 1. Force clear any remembered sessions so NO account is signed in on initial load
      const hasExplicitActiveLogin = sessionStorage.getItem('fitpulse_session_active');
      if (!hasExplicitActiveLogin) {
        localStorage.removeItem(AUTH_KEYS.SESSION);
        sessionStorage.removeItem(AUTH_KEYS.SESSION);
        this.currentUser = null;
      }

      // 2. Load existing registered users
      const raw = localStorage.getItem(AUTH_KEYS.USERS);
      let users = raw ? JSON.parse(raw) : [];

      // 3. Purge Jordan Hayes, Priya Sharma, and temporary test accounts
      users = users.filter(u => {
        if (!u) return false;
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const username = (u.username || '').toLowerCase();

        // Remove Jordan Hayes
        if (name.includes('jordan') || email.includes('jordan') || username.includes('jordan')) {
          return false;
        }
        // Remove Priya Sharma
        if (name.includes('priya') || email.includes('priya') || username.includes('priya')) {
          return false;
        }
        // Remove dummy test accounts
        if (username.includes('test') || email.includes('test') || username === 'newuser') {
          return false;
        }
        return true;
      });

      // 4. Strictly deduplicate users by unique email and unique username
      const uniqueUsers = [];
      const seenEmails = new Set();
      const seenUsernames = new Set();

      for (const u of users) {
        const em = (u.email || '').toLowerCase().trim();
        const un = (u.username || '').toLowerCase().trim();
        if (em && un && !seenEmails.has(em) && !seenUsernames.has(un)) {
          seenEmails.add(em);
          seenUsernames.add(un);
          uniqueUsers.push(u);
        }
      }

      // If empty or after purge, keep only single clean baseline template for testing (Alex Rivera)
      if (uniqueUsers.length === 0) {
        uniqueUsers.push({
          id: 'user_alex',
          name: 'Alex Rivera',
          email: 'alex@fitpulse.demo',
          username: 'alexfit',
          password: 'password123',
          goal: 'fat_loss',
          condition: 'healthy',
          gender: 'male',
          age: 27,
          weight: 78,
          height: 180,
          avatarInitials: 'AR',
          avatarColor: '#059669',
          createdAt: '2026-10-15T08:00:00.000Z'
        });

        this.seedUserAccountData('user_alex', {
          profile: {
            age: 27,
            gender: 'male',
            height: 180,
            weight: 78,
            targetWeight: 75,
            activityLevel: 1.55,
            goal: 'fat_loss',
            condition: 'healthy',
            dietPref: 'omnivore'
          },
          targets: {
            calories: 2150,
            protein: 170,
            carbs: 210,
            fat: 65,
            waterLiters: 3.5
          },
          stepGoal: 10000,
          todaySteps: 8760
        });
      }

      localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(uniqueUsers));

      // 5. Purge any orphan scoped localStorage keys associated with deleted accounts
      Object.keys(localStorage).forEach(k => {
        const kl = k.toLowerCase();
        if (kl.includes('jordan') || kl.includes('priya') || kl.includes('test')) {
          localStorage.removeItem(k);
        }
      });
    } catch (err) {
      console.warn('Account purge notice:', err);
    }
  },

  // Seed sample data for an account in isolated keys
  seedUserAccountData(userId, config) {
    const today = new Date().toISOString().split('T')[0];

    localStorage.setItem(`fitpulse_u_${userId}_fitpulse_profile`, JSON.stringify(config.profile));
    localStorage.setItem(`fitpulse_u_${userId}_fitpulse_macro_targets`, JSON.stringify(config.targets));
    localStorage.setItem(`fitpulse_u_${userId}_fitpulse_step_goal`, JSON.stringify(config.stepGoal));

    const stepsLog = {};
    stepsLog[today] = {
      steps: config.todaySteps,
      goal: config.stepGoal,
      distanceKm: parseFloat(((config.todaySteps * 0.762) / 1000).toFixed(2)),
      caloriesBurned: Math.round(config.todaySteps * 0.045 * (config.profile.weight / 70)),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`fitpulse_u_${userId}_fitpulse_steps_log`, JSON.stringify(stepsLog));

    if (userId === 'user_alex') {
      const alexPRs = [
        { id: 'pr_a1', exercise: 'Flat Barbell Bench Press', weightKg: 102.5, reps: 3, estimated1RM: 112.8, date: today, rpe: 9.5, notes: 'Paused at chest' },
        { id: 'pr_a2', exercise: 'Barbell Back Squat', weightKg: 140, reps: 4, estimated1RM: 158.7, date: '2026-11-04', rpe: 9, notes: 'Below parallel' },
        { id: 'pr_a3', exercise: 'Conventional Deadlift', weightKg: 180, reps: 2, estimated1RM: 192.0, date: '2026-10-28', rpe: 9.5, notes: 'Hook grip lockout' }
      ];
      localStorage.setItem(`fitpulse_u_${userId}_fitpulse_prs`, JSON.stringify(alexPRs));
    }
  },

  // Get all registered users from storage
  getRegisteredUsers() {
    try {
      const users = localStorage.getItem(AUTH_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch (e) {
      console.error('Error reading registered users:', e);
      return [];
    }
  },

  // Save registered users list
  saveRegisteredUsers(users) {
    try {
      localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
      return true;
    } catch (e) {
      console.error('Error saving users:', e);
      return false;
    }
  },

  // Look up user by email or username (case-insensitive)
  findUser(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const users = this.getRegisteredUsers();
    return users.find(u => 
      u.email.toLowerCase() === clean || 
      u.username.toLowerCase() === clean
    ) || null;
  },

  // Restore active user session only if explicitly logged in
  restoreSession() {
    try {
      let sessionData = sessionStorage.getItem(AUTH_KEYS.SESSION);
      if (!sessionData) {
        sessionData = localStorage.getItem(AUTH_KEYS.SESSION);
      }

      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session && session.userId) {
          const user = this.getRegisteredUsers().find(u => u.id === session.userId);
          if (user) {
            this.currentUser = user;
            console.log(`[Auth] Restored active session for @${user.username} (${user.name})`);
            return user;
          }
        }
      }
    } catch (err) {
      console.error('Error restoring auth session:', err);
    }
    this.currentUser = null;
    return null;
  },

  // Current logged in user object
  getCurrentUser() {
    return this.currentUser;
  },

  // Open the Sign In / Sign Up Modal Popup
  openAuthModal(mode = 'signin') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    this.switchMode(mode);
    setTimeout(() => {
      const idInput = document.getElementById('signin-identifier');
      if (idInput && mode === 'signin') idInput.focus();
    }, 100);
  },

  // Close the popup modal (only if authenticated)
  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    if (!this.currentUser) {
      if (window.Toast) {
        Toast.show('Please sign in or create an account to enter FitPulse Pro.', 'warning');
      }
      return;
    }
    modal.classList.add('hidden');
  },

  // Register a new user with duplicate validation
  register(formData) {
    const { name, email, username, password, goal, condition, gender, age, weight, height, rememberMe } = formData;

    if (!name || !name.trim()) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!username || !username.trim()) {
      return { success: false, message: 'Please choose a username.' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (cleanUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters (letters, numbers, underscores).' };
    }

    const users = this.getRegisteredUsers();

    // 1. DUPLICATE CHECK: Email
    const emailExists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { 
        success: false, 
        field: 'email',
        message: 'An account with this email address already exists. Please sign in instead.' 
      };
    }

    // 2. DUPLICATE CHECK: Username
    const usernameExists = users.some(u => u.username.toLowerCase() === cleanUsername);
    if (usernameExists) {
      return { 
        success: false, 
        field: 'username',
        message: `The username "@${cleanUsername}" is already taken. Please choose another.` 
      };
    }

    const initials = name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'FP';
    const avatarPalette = ['#059669', '#0284c7', '#7c3aed', '#d97706', '#e11d48', '#0891b2'];
    const avatarColor = avatarPalette[Math.floor(Math.random() * avatarPalette.length)];

    const newUser = {
      id: 'u_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: name.trim(),
      email: cleanEmail,
      username: cleanUsername,
      password: password,
      goal: goal || 'fat_loss',
      condition: condition || 'healthy',
      gender: gender || 'male',
      age: parseInt(age) || 26,
      weight: parseFloat(weight) || 75,
      height: parseFloat(height) || 175,
      avatarInitials: initials,
      avatarColor: avatarColor,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveRegisteredUsers(users);

    // Initialize personal account data
    this.initNewAccountData(newUser);

    // Establish session & mark as active
    sessionStorage.setItem('fitpulse_session_active', 'true');
    this.establishSession(newUser, rememberMe !== false);

    return { 
      success: true, 
      user: newUser, 
      message: `Account created! Welcome, ${newUser.name}.` 
    };
  },

  // Initialize fresh, isolated personal data for a new user
  initNewAccountData(user) {
    const today = new Date().toISOString().split('T')[0];

    let bmr;
    if (user.gender === 'female') {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
    } else {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
    }
    const tdee = Math.round(bmr * 1.4);
    let targetCalories = tdee;
    if (user.goal === 'fat_loss') targetCalories = Math.round(tdee - 450);
    else if (user.goal === 'muscle_gain') targetCalories = Math.round(tdee + 300);

    const proteinGrams = Math.round(user.weight * 2.0);
    const fatGrams = Math.round((targetCalories * 0.25) / 9);
    const carbsGrams = Math.max(50, Math.round((targetCalories - (proteinGrams * 4 + fatGrams * 9)) / 4));

    const initialProfile = {
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      targetWeight: user.goal === 'fat_loss' ? user.weight - 5 : (user.goal === 'muscle_gain' ? user.weight + 4 : user.weight),
      activityLevel: 1.4,
      goal: user.goal,
      condition: user.condition,
      dietPref: 'omnivore'
    };

    const initialTargets = {
      calories: targetCalories,
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams,
      waterLiters: 3.2
    };

    localStorage.setItem(`fitpulse_u_${user.id}_fitpulse_profile`, JSON.stringify(initialProfile));
    localStorage.setItem(`fitpulse_u_${user.id}_fitpulse_macro_targets`, JSON.stringify(initialTargets));
    localStorage.setItem(`fitpulse_u_${user.id}_fitpulse_step_goal`, JSON.stringify(10000));
    localStorage.setItem(`fitpulse_u_${user.id}_fitpulse_prs`, JSON.stringify([]));
    localStorage.setItem(`fitpulse_u_${user.id}_fitpulse_meals_log`, JSON.stringify({}));
    localStorage.setItem(`fitpulse_u_${user.id}_fitpulse_achievements`, JSON.stringify(['account_created']));

    const initialSteps = {};
    initialSteps[today] = {
      steps: 0,
      goal: 10000,
      distanceKm: 0,
      caloriesBurned: 0,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`fitpulse_u_${user.id}_fitpulse_steps_log`, JSON.stringify(initialSteps));
  },

  // Sign in existing user
  login(identifier, password, rememberMe = true) {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: 'Please enter your email or username.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your password.' };
    }

    const user = this.findUser(identifier);
    if (!user) {
      return { 
        success: false, 
        message: 'No account found with this email or username. Please check spelling or create an account.' 
      };
    }

    if (user.password !== password) {
      return { 
        success: false, 
        message: 'Incorrect password. Please try again.' 
      };
    }

    sessionStorage.setItem('fitpulse_session_active', 'true');
    this.establishSession(user, rememberMe);
    return { 
      success: true, 
      user, 
      message: `Welcome back, ${user.name}!` 
    };
  },

  // Save session record
  establishSession(user, rememberMe) {
    this.currentUser = user;

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      rememberMe: !!rememberMe,
      loggedInAt: Date.now()
    };

    if (rememberMe) {
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(sessionPayload));
    } else {
      sessionStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(sessionPayload));
      localStorage.removeItem(AUTH_KEYS.SESSION);
    }

    this.updateHeaderUI();
  },

  // Sign out user
  logout() {
    const prevUser = this.currentUser ? this.currentUser.name : 'User';
    this.currentUser = null;
    localStorage.removeItem(AUTH_KEYS.SESSION);
    sessionStorage.removeItem(AUTH_KEYS.SESSION);
    sessionStorage.removeItem('fitpulse_session_active');

    this.updateHeaderUI();
    this.openAuthModal('signin');

    if (window.Toast) {
      Toast.show(`Signed out of ${prevUser}'s account.`, 'info');
    }

    return { success: true };
  },

  // Switch between Sign In and Sign Up tabs
  switchMode(mode) {
    this.activeMode = mode;
    const signinForm = document.getElementById('auth-signin-form');
    const signupForm = document.getElementById('auth-signup-form');
    const tabSigninBtn = document.getElementById('tab-btn-signin');
    const tabSignupBtn = document.getElementById('tab-btn-signup');
    const errorBox = document.getElementById('auth-error-msg');

    if (errorBox) {
      errorBox.classList.add('hidden');
      errorBox.textContent = '';
    }

    if (mode === 'signup') {
      if (signinForm) signinForm.classList.add('hidden');
      if (signupForm) signupForm.classList.remove('hidden');
      if (tabSigninBtn) {
        tabSigninBtn.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm');
        tabSigninBtn.classList.add('text-slate-600', 'hover:text-slate-900');
      }
      if (tabSignupBtn) {
        tabSignupBtn.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
        tabSignupBtn.classList.remove('text-slate-600', 'hover:text-slate-900');
      }
    } else {
      if (signupForm) signupForm.classList.add('hidden');
      if (signinForm) signinForm.classList.remove('hidden');
      if (tabSignupBtn) {
        tabSignupBtn.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm');
        tabSignupBtn.classList.add('text-slate-600', 'hover:text-slate-900');
      }
      if (tabSigninBtn) {
        tabSigninBtn.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
        tabSigninBtn.classList.remove('text-slate-600', 'hover:text-slate-900');
      }
    }
  },

  // Update header and mobile navigation user badges
  updateHeaderUI() {
    const userContainer = document.getElementById('header-user-badge');
    const mobileUserContainer = document.getElementById('mobile-header-user');

    const user = this.currentUser;

    if (!user) {
      const guestHtml = `
        <button onclick="AuthManager.openAuthModal('signin')" 
                class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer">
          <span>🔐</span> Sign In / Register
        </button>
      `;
      if (userContainer) userContainer.innerHTML = guestHtml;
      if (mobileUserContainer) mobileUserContainer.innerHTML = guestHtml;
      return;
    }

    const goalLabels = {
      fat_loss: 'Fat Loss',
      muscle_gain: 'Muscle Gain',
      maintenance: 'Maintenance',
      endurance: 'Endurance',
      recomp: 'Recomposition'
    };
    const goalText = goalLabels[user.goal] || 'Fitness';

    const userHtml = `
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-400 transition" 
             onclick="App.switchTab('auth')" title="Click to view account info or switch users">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
               style="background-color: ${user.avatarColor || '#059669'};">
            ${user.avatarInitials || 'FP'}
          </div>
          <div class="hidden sm:block text-left leading-tight">
            <div class="text-xs font-bold text-slate-800 flex items-center gap-1">
              <span>${user.name}</span>
              <span class="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase">${goalText}</span>
            </div>
            <div class="text-[10px] text-slate-500 font-mono">@${user.username}</div>
          </div>
        </div>

        <button onclick="AuthManager.handleLogout()" 
                title="Sign out of current account"
                class="px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition font-medium flex items-center gap-1 cursor-pointer">
          <span>🚪</span><span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    `;

    if (userContainer) userContainer.innerHTML = userHtml;
    if (mobileUserContainer) mobileUserContainer.innerHTML = userHtml;
  },

  handleLogout() {
    if (confirm('Are you sure you want to log out? Your personal data remains saved on this browser.')) {
      this.logout();
    }
  },

  // 1-Click Demo Account Quick Login
  quickLogin(userId) {
    const user = this.getRegisteredUsers().find(u => u.id === userId);
    if (!user) return;

    const res = this.login(user.email, user.password, true);
    if (res.success) {
      if (window.Toast) Toast.show(`Logged in as ${user.name}!`, 'success');
      this.closeAuthModal();
      if (window.App) {
        App.reloadAllModules();
        App.switchTab('dashboard');
      }
    }
  },

  // Bind Form Submit & Button Listeners
  bindEvents() {
    const signinForm = document.getElementById('auth-signin-form');
    if (signinForm) {
      signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignInSubmit();
        return false;
      });
    }

    const signupForm = document.getElementById('auth-signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignUpSubmit();
        return false;
      });
    }
  },

  // Handle Sign In submission
  handleSignInSubmit() {
    const identifier = document.getElementById('signin-identifier')?.value;
    const password = document.getElementById('signin-password')?.value;
    const rememberMe = document.getElementById('signin-remember')?.checked;
    const errorBox = document.getElementById('auth-error-msg');

    if (errorBox) errorBox.classList.add('hidden');

    const res = this.login(identifier, password, rememberMe);
    if (!res.success) {
      if (errorBox) {
        errorBox.textContent = `⚠️ ${res.message}`;
        errorBox.classList.remove('hidden');
      }
      if (window.Toast) Toast.show(res.message, 'error');
      return;
    }

    if (window.Toast) Toast.show(res.message, 'success');
    this.closeAuthModal();
    if (window.App) {
      App.reloadAllModules();
      App.switchTab('dashboard');
    }
  },

  // Handle Sign Up submission
  handleSignUpSubmit() {
    const name = document.getElementById('signup-name')?.value;
    const email = document.getElementById('signup-email')?.value;
    const username = document.getElementById('signup-username')?.value;
    const password = document.getElementById('signup-password')?.value;
    const goal = document.getElementById('signup-goal')?.value;
    const condition = document.getElementById('signup-condition')?.value;
    const gender = document.getElementById('signup-gender')?.value;
    const age = document.getElementById('signup-age')?.value;
    const weight = document.getElementById('signup-weight')?.value;
    const height = document.getElementById('signup-height')?.value;
    const rememberMe = document.getElementById('signup-remember')?.checked;
    const errorBox = document.getElementById('auth-error-msg');

    if (errorBox) errorBox.classList.add('hidden');

    const res = this.register({
      name,
      email,
      username,
      password,
      goal,
      condition,
      gender,
      age,
      weight,
      height,
      rememberMe
    });

    if (!res.success) {
      if (errorBox) {
        errorBox.textContent = `⚠️ ${res.message}`;
        errorBox.classList.remove('hidden');
      }
      if (window.Toast) Toast.show(res.message, 'error');
      return;
    }

    if (window.Toast) Toast.show(res.message, 'success');
    this.closeAuthModal();
    if (window.App) {
      App.reloadAllModules();
      App.switchTab('dashboard');
    }
  },

  // Render the dedicated Account tab view
  renderAuthPage() {
    const activeAccountPanel = document.getElementById('active-account-panel');
    const user = this.currentUser;

    if (user && activeAccountPanel) {
      activeAccountPanel.classList.remove('hidden');

      const nameEl = document.getElementById('auth-user-name');
      const userMetaEl = document.getElementById('auth-user-meta');
      const avatarEl = document.getElementById('auth-user-avatar');
      const statsEl = document.getElementById('auth-user-stats');

      if (nameEl) nameEl.textContent = user.name;
      if (userMetaEl) {
        userMetaEl.innerHTML = `
          <span class="font-mono text-slate-600 font-bold">@${user.username}</span> • 
          <span>${user.email}</span> • 
          <span class="capitalize text-emerald-700 font-bold">${user.goal ? user.goal.replace('_', ' ') : 'Fitness'}</span> • 
          <span class="capitalize text-cyan-700 font-bold">${user.condition ? user.condition.replace('_', ' ') : 'Healthy'}</span>
        `;
      }
      if (avatarEl) {
        avatarEl.textContent = user.avatarInitials || 'FP';
        avatarEl.style.backgroundColor = user.avatarColor || '#059669';
      }

      if (statsEl) {
        const prs = window.StorageManager ? StorageManager.getPRs() : [];
        const todayMeals = window.StorageManager ? StorageManager.getMeals() : [];
        const todaySteps = window.StorageManager ? StorageManager.getStepsForDate() : { steps: 0 };
        const targets = window.StorageManager ? StorageManager.getMacroTargets() : { calories: 2000 };

        statsEl.innerHTML = `
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Daily Budget</div>
            <div class="text-base font-black text-slate-800 font-mono">${targets.calories || 2000} kcal</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Meals Logged</div>
            <div class="text-base font-black text-slate-800 font-mono">${todayMeals.length}</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Today's Steps</div>
            <div class="text-base font-black text-slate-800 font-mono">${(todaySteps.steps || 0).toLocaleString()}</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">PRs Recorded</div>
            <div class="text-base font-black text-slate-800 font-mono">${prs.length}</div>
          </div>
        `;
      }
    } else if (!user) {
      this.openAuthModal('signin');
    }
  },

  togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btnEl) btnEl.textContent = '🙈';
    } else {
      input.type = 'password';
      if (btnEl) btnEl.textContent = '👁️';
    }
  }
};

window.AuthManager = AuthManager;
