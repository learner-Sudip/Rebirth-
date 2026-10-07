import {
  Subject,
  FocusSession,
  AppRule,
  WebsiteRule,
  HabitItem,
  ShieldEvent,
  PlannedStudyBlock,
  UserSettings,
  SM2Revision,
  LiveFocusRoom,
} from '../types';

const STORAGE_KEYS = {
  SUBJECTS: 'mentis_subjects_v1',
  SESSIONS: 'mentis_sessions_v1',
  APP_RULES: 'mentis_app_rules_v1',
  WEBSITE_RULES: 'mentis_website_rules_v1',
  HABITS: 'mentis_habits_v1',
  SHIELD_EVENTS: 'mentis_shield_events_v1',
  PLANNER: 'mentis_planner_v1',
  SETTINGS: 'mentis_settings_v1',
  REVISIONS: 'mentis_revisions_v1',
};

// Seed Subjects
const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj_1',
    name: 'Mathematics & Quant Analysis',
    code: 'MA-301',
    color: '#FFA726', // Amber
    icon: 'Calculator',
    description: 'Advanced multivariate calculus, linear algebra decompositions, and optimization theory.',
    hoursStudied: 42.25, // 42h 15m
    todayStudyMinutes: 85, // 1h 25m
    targetHours: 60,
    dailyGoalMinutes: 90,
    weeklyGoalHours: 12,
    monthlyGoalHours: 50,
    dayStreak: 7,
    syllabusMasteredPercent: 68,
    units: [
      { id: 'u1', title: 'Multivariate Calculus & Gradients', mastered: true },
      { id: 'u2', title: 'Linear Algebra & Eigenvalue Decompositions', mastered: true },
      { id: 'u3', title: 'Discrete Markov Chains & Probability', mastered: true },
      { id: 'u4', title: 'Optimization: Karush-Kuhn-Tucker', mastered: false },
      { id: 'u5', title: 'Real Analysis: Cauchy Sequences', mastered: false },
    ],
    tasks: [
      { id: 't1', title: 'Solve 20 Lagrangian optimization drills', dueDate: 'Today', completed: false },
      { id: 't2', title: 'Derive proof for Spectral Theorem', dueDate: 'Tomorrow', completed: false },
    ],
    notes: [
      {
        id: 'n1',
        title: 'Feynman Technique: Eigenvectors as Spatial Axes',
        content: 'Explain to a 10-year-old: When you stretch or squash an entire rubber sheet, most arrows tilt. Eigenvectors are the special lucky arrows that do not tilt at all—they only grow longer or shrink.',
        type: 'feynman',
        updatedAt: '2026-10-06T19:30:00Z',
      },
    ],
  },
  {
    id: 'subj_2',
    name: 'Quantum Physics & Thermodynamics',
    code: 'QP-410',
    color: '#38BDF8', // Sky Blue
    icon: 'Atom',
    description: 'Quantum harmonic oscillators, Hilbert state spaces, wave functions, and statistical mechanics.',
    hoursStudied: 24.5,
    todayStudyMinutes: 50,
    targetHours: 40,
    dailyGoalMinutes: 60,
    weeklyGoalHours: 8,
    monthlyGoalHours: 35,
    dayStreak: 5,
    syllabusMasteredPercent: 55,
    units: [
      { id: 'u21', title: 'Schrödinger Wave Equation in 3D', mastered: true },
      { id: 'u22', title: 'Hermitian Operators & Observables', mastered: true },
      { id: 'u23', title: 'Quantum Harmonic Oscillators', mastered: false },
      { id: 'u24', title: 'Entanglement & Bell Inequalities', mastered: false },
    ],
    tasks: [
      { id: 't21', title: 'Review 3-dimensional infinite well boundary conditions', dueDate: 'Today', completed: false },
    ],
    notes: [
      {
        id: 'n21',
        title: 'Feynman: Wavefunction Collapse Intuition',
        content: 'Probability cloud narrows to a singular coordinate upon measurement because the measurement apparatus becomes physically entangled with the state.',
        type: 'feynman',
        updatedAt: '2026-10-05T14:10:00Z',
      },
    ],
  },
  {
    id: 'subj_3',
    name: 'Constitutional Law & Jurisprudence',
    code: 'CL-204',
    color: '#00E676', // Emerald
    icon: 'Scale',
    description: 'Judicial review precedents, constitutional doctrine, equal protection, and commerce clause limits.',
    hoursStudied: 18.0,
    todayStudyMinutes: 45,
    targetHours: 30,
    dailyGoalMinutes: 45,
    weeklyGoalHours: 6,
    monthlyGoalHours: 25,
    dayStreak: 6,
    syllabusMasteredPercent: 62,
    units: [
      { id: 'u31', title: 'Judicial Review & Marbury v. Madison', mastered: true },
      { id: 'u32', title: 'Separation of Powers & Executive Privilege', mastered: true },
      { id: 'u33', title: 'Fundamental Rights & Due Process Clause', mastered: true },
      { id: 'u34', title: 'Federalism & Commerce Clause Limits', mastered: false },
    ],
    tasks: [
      { id: 't31', title: 'Synthesize 4 landmark precedent briefs', dueDate: 'Today', completed: false },
    ],
    notes: [
      {
        id: 'n31',
        title: 'Precedent synthesis note',
        content: 'Distinguishing strict scrutiny from rational basis review standards in equal protection claims.',
        type: 'general',
        updatedAt: '2026-10-07T09:15:00Z',
      },
    ],
  },
  {
    id: 'subj_4',
    name: 'Machine Learning Systems & Kernels',
    code: 'CS-505',
    color: '#A855F7', // Violet
    icon: 'Code',
    description: 'Deep neural architectures, attention mechanics, CUDA GPU kernel memory tiling, and low-precision FP8.',
    hoursStudied: 31.2,
    todayStudyMinutes: 42,
    targetHours: 50,
    dailyGoalMinutes: 60,
    weeklyGoalHours: 10,
    monthlyGoalHours: 40,
    dayStreak: 9,
    syllabusMasteredPercent: 40,
    units: [
      { id: 'u41', title: 'Transformer Attention Mechanics (QKV)', mastered: true },
      { id: 'u42', title: 'FlashAttention Memory Tiling Kernels', mastered: false },
      { id: 'u43', title: 'KV Cache Quantization (FP8/INT4)', mastered: false },
      { id: 'u44', title: 'PPO & DPO Alignment Algorithms', mastered: false },
    ],
    tasks: [
      { id: 't41', title: 'Benchmark Triton kernel execution latency', dueDate: 'Tomorrow', completed: false },
    ],
    notes: [],
  },
  {
    id: 'subj_5',
    name: 'Organic Chemistry Mechanisms',
    code: 'OC-220',
    color: '#EC4899', // Pink
    icon: 'FlaskConical',
    description: 'Reaction mechanisms, stereochemistry, electrophilic aromatic substitution, and retrosynthesis.',
    hoursStudied: 14.5,
    todayStudyMinutes: 0,
    targetHours: 25,
    dailyGoalMinutes: 45,
    weeklyGoalHours: 5,
    monthlyGoalHours: 20,
    dayStreak: 3,
    syllabusMasteredPercent: 35,
    units: [
      { id: 'u51', title: 'Electrophilic Aromatic Substitution', mastered: true },
      { id: 'u52', title: 'Carbonyl Condensation & Enolate Alkylation', mastered: false },
      { id: 'u53', title: 'Pericyclic Reactions & Woodward-Hoffmann', mastered: false },
    ],
    tasks: [
      { id: 't51', title: 'Draw out retrosynthesis pathway for target molecule 4', dueDate: 'Friday', completed: false },
    ],
    notes: [],
  },
  {
    id: 'subj_6',
    name: 'Neurobiology & Synaptic Plasticity',
    code: 'NB-110',
    color: '#EAB308', // Gold
    icon: 'Brain',
    description: 'Cellular neuroscience, long-term potentiation, neurotransmitter receptor dynamics, and circadian pacemakers.',
    hoursStudied: 12.0,
    todayStudyMinutes: 0,
    targetHours: 20,
    dailyGoalMinutes: 30,
    weeklyGoalHours: 4,
    monthlyGoalHours: 18,
    dayStreak: 4,
    syllabusMasteredPercent: 50,
    units: [
      { id: 'u61', title: 'Long-Term Potentiation (LTP) & NMDA Receptors', mastered: true },
      { id: 'u62', title: 'Dopaminergic Mesolimbic Reward Loops', mastered: true },
      { id: 'u63', title: 'Circadian SCN Oscillators & Melatonin', mastered: false },
    ],
    tasks: [],
    notes: [],
  },
];

// Seed SM-2 Revisions
const INITIAL_REVISIONS: SM2Revision[] = [
  {
    id: 'rev_1',
    subjectId: 'subj_1',
    subjectName: 'Mathematics & Quant Analysis',
    prompt: 'State the conditions under which a symmetric real matrix has an orthonormal basis of eigenvectors.',
    answer: 'Spectral Theorem: Any real symmetric matrix A is orthogonally diagonalizable (A = Q Λ Q^T with orthonormal Q and real eigenvalues Λ).',
    intervalDays: 3,
    repetitions: 2,
    easinessFactor: 2.5,
    nextReviewDate: new Date().toISOString().split('T')[0], // Due Today!
    status: 'due',
  },
  {
    id: 'rev_2',
    subjectId: 'subj_2',
    subjectName: 'Quantum Physics & Thermodynamics',
    prompt: 'What physical property does the commutator [x, p] = iħ represent?',
    answer: 'The observables position (x) and momentum (p) do not commute, mathematically establishing Heisenberg’s Uncertainty Principle ΔxΔp ≥ ħ/2.',
    intervalDays: 7,
    repetitions: 3,
    easinessFactor: 2.6,
    nextReviewDate: new Date().toISOString().split('T')[0], // Due Today!
    status: 'due',
  },
  {
    id: 'rev_3',
    subjectId: 'subj_4',
    subjectName: 'Machine Learning Systems & Kernels',
    prompt: 'Explain why FlashAttention reduces memory bandwidth bottlenecks from O(N²) to O(N).',
    answer: 'It computes softmax incrementally via online tiling directly inside GPU SRAM (fast cache), avoiding writing the full N×N attention matrix to High Bandwidth Memory (HBM).',
    intervalDays: 1,
    repetitions: 1,
    easinessFactor: 2.4,
    nextReviewDate: new Date().toISOString().split('T')[0], // Due Today!
    status: 'due',
  },
  {
    id: 'rev_4',
    subjectId: 'subj_3',
    subjectName: 'Constitutional Law & Jurisprudence',
    prompt: 'Which standard of review applies to classifications based on suspect classes like race or national origin?',
    answer: 'Strict Scrutiny: The government must prove the measure is narrowly tailored to achieve a compelling governmental interest.',
    intervalDays: 16,
    repetitions: 4,
    easinessFactor: 2.7,
    nextReviewDate: '2026-10-14',
    status: 'mastered',
  },
];

// Seed Block Rules
const INITIAL_APP_RULES: AppRule[] = [
  {
    id: 'app_1',
    name: 'Instagram',
    category: 'Social Media',
    iconName: 'Instagram',
    packageName: 'com.instagram.android',
    isBlocked: true,
    granularity: 'feed_only',
    dailyLimitMinutes: 25,
    usageTodayMinutes: 38,
  },
  {
    id: 'app_2',
    name: 'YouTube',
    category: 'Video & Media',
    iconName: 'Youtube',
    packageName: 'com.google.android.youtube',
    isBlocked: true,
    granularity: 'feed_only',
    dailyLimitMinutes: 45,
    usageTodayMinutes: 22,
  },
  {
    id: 'app_3',
    name: 'TikTok',
    category: 'Short Video',
    iconName: 'Video',
    packageName: 'com.zhiliaoapp.musically',
    isBlocked: true,
    granularity: 'full',
    dailyLimitMinutes: 15,
    usageTodayMinutes: 18,
  },
  {
    id: 'app_4',
    name: 'Reddit',
    category: 'Forums & Discussion',
    iconName: 'MessageSquare',
    packageName: 'com.reddit.frontpage',
    isBlocked: true,
    granularity: 'full',
    dailyLimitMinutes: 30,
    usageTodayMinutes: 14,
  },
  {
    id: 'app_5',
    name: 'X (Twitter)',
    category: 'Microblogging',
    iconName: 'Twitter',
    packageName: 'com.twitter.android',
    isBlocked: true,
    granularity: 'feed_only',
    dailyLimitMinutes: 20,
    usageTodayMinutes: 19,
  },
  {
    id: 'app_6',
    name: 'Mobile Games',
    category: 'Gaming',
    iconName: 'Gamepad2',
    packageName: 'com.supercell.clashroyale',
    isBlocked: true,
    granularity: 'full',
    dailyLimitMinutes: 15,
    usageTodayMinutes: 0,
  },
  {
    id: 'app_7',
    name: 'Amazon & Shopping',
    category: 'E-Commerce',
    iconName: 'ShoppingBag',
    packageName: 'com.amazon.mShop.android.shopping',
    isBlocked: true,
    granularity: 'full',
    dailyLimitMinutes: 20,
    usageTodayMinutes: 6,
  },
  {
    id: 'app_8',
    name: 'Facebook & Threads',
    category: 'Social Media',
    iconName: 'Share2',
    packageName: 'com.facebook.katana',
    isBlocked: true,
    granularity: 'full',
    dailyLimitMinutes: 15,
    usageTodayMinutes: 0,
  },
];

const INITIAL_WEBSITE_RULES: WebsiteRule[] = [
  { id: 'web_1', domain: 'x.com', isBlocked: true, dailyLimitMinutes: 15, usageTodayMinutes: 12 },
  { id: 'web_2', domain: 'instagram.com', isBlocked: true, dailyLimitMinutes: 20, usageTodayMinutes: 18 },
  { id: 'web_3', domain: 'reddit.com', isBlocked: true, dailyLimitMinutes: 25, usageTodayMinutes: 10 },
  { id: 'web_4', domain: 'tiktok.com', isBlocked: true, dailyLimitMinutes: 10, usageTodayMinutes: 8 },
  { id: 'web_5', domain: 'news.ycombinator.com', isBlocked: true, dailyLimitMinutes: 20, usageTodayMinutes: 15 },
];

const INITIAL_HABITS: HabitItem[] = [
  { id: 'h1', title: 'Study/Deep Work 3h+', xp: 50, streak: 7, completedToday: true },
  { id: 'h2', title: 'Zero Short-Form Feeds (Reels/Shorts)', xp: 40, streak: 12, completedToday: true },
  { id: 'h3', title: 'Social Media Under 35 min Total', xp: 35, streak: 5, completedToday: false },
  { id: 'h4', title: 'Phone Out of Bedroom by 10:30 PM', xp: 45, streak: 19, completedToday: true },
  { id: 'h5', title: '60-Second Mindful Breathing Reset', xp: 25, streak: 8, completedToday: true },
];

const INITIAL_SESSIONS: FocusSession[] = [
  {
    id: 'sess_1',
    subjectId: 'subj_1',
    subjectName: 'Mathematics & Quant Analysis',
    mode: 'pomodoro',
    durationMinutes: 50,
    completedMinutes: 50,
    plannedDurationMinutes: 50,
    actualDurationMinutes: 50,
    startTime: '2026-10-07T08:15:00Z',
    endTime: '2026-10-07T09:05:00Z',
    completionPercentage: 100,
    completionStatus: 'COMPLETED',
    earlyFinish: false,
    focusGoal: 'Solve 10 Lagrangian optimization proofs',
    blockedAppDurationMinutes: 50,
    notes: 'High flow state maintained throughout entire 50-minute block.',
    timestamp: '2026-10-07T08:15:00Z',
    milestone: 'Solve 10 Lagrangian optimization proofs',
    xpEarned: 110,
    urgesBlocked: 4,
    method: 'Pomodoro (50/10)',
    completed: true,
  },
  {
    id: 'sess_2',
    subjectId: 'subj_2',
    subjectName: 'Quantum Physics & Thermodynamics',
    mode: 'deep_focus',
    durationMinutes: 90,
    completedMinutes: 90,
    plannedDurationMinutes: 90,
    actualDurationMinutes: 90,
    startTime: '2026-10-07T10:00:00Z',
    endTime: '2026-10-07T11:30:00Z',
    completionPercentage: 100,
    completionStatus: 'COMPLETED',
    earlyFinish: false,
    focusGoal: 'Master 3D wave equation boundary calculations',
    blockedAppDurationMinutes: 90,
    notes: 'Completed all boundary condition derivations for infinite well.',
    timestamp: '2026-10-07T10:00:00Z',
    milestone: 'Master 3D wave equation boundary calculations',
    xpEarned: 195,
    urgesBlocked: 9,
    method: 'Ultradian 90m Peak',
    completed: true,
  },
  {
    id: 'sess_3',
    subjectId: 'subj_4',
    subjectName: 'Machine Learning Systems & Kernels',
    mode: 'study_mode',
    durationMinutes: 82,
    completedMinutes: 82,
    plannedDurationMinutes: 82,
    actualDurationMinutes: 82,
    startTime: '2026-10-07T14:30:00Z',
    endTime: '2026-10-07T15:52:00Z',
    completionPercentage: 100,
    completionStatus: 'COMPLETED',
    earlyFinish: false,
    focusGoal: 'Understand FlashAttention online softmax SRAM tiling',
    blockedAppDurationMinutes: 82,
    notes: 'Online softmax accumulator equations fully internalized.',
    timestamp: '2026-10-07T14:30:00Z',
    milestone: 'Understand FlashAttention online softmax SRAM tiling',
    xpEarned: 175,
    urgesBlocked: 14,
    method: 'Feynman Technique & Retrieval',
    completed: true,
  },
];

const INITIAL_SETTINGS: UserSettings = {
  theme: 'dark',
  enforcementLevel: 'balanced',
  focusBankBalanceMinutes: 45,
  allyEmail: 'mentor.focus@sovereignty.org',
  shortFormShieldActive: true,
  studyScheduleActive: true,
  studyScheduleStart: '18:00',
  studyScheduleEnd: '22:00',
  permissions: {
    usageStats: true,
    accessibility: true,
    alertWindow: true,
    exactAlarm: true,
    batteryOpt: true,
  },
  cloudSyncEnabled: false,
  dailyTargetMinutes: 240, // 4 hours
};

const INITIAL_PLANNER: PlannedStudyBlock[] = [
  {
    id: 'pb_1',
    subjectId: 'subj_1',
    subjectName: 'Mathematics & Quant Analysis',
    startTime: '18:00',
    durationMinutes: 50,
    method: 'Pomodoro',
    intention: 'If 6:00 PM, then sit at desk and open Linear Algebra Unit 3',
    completed: false,
  },
  {
    id: 'pb_2',
    subjectId: 'subj_3',
    subjectName: 'Constitutional Law & Jurisprudence',
    startTime: '19:15',
    durationMinutes: 45,
    method: 'Active Recall',
    intention: 'If 7:15 PM, then drill 4 landmark case synthesis briefs',
    completed: false,
  },
  {
    id: 'pb_3',
    subjectId: 'subj_2',
    subjectName: 'Quantum Physics & Thermodynamics',
    startTime: '20:30',
    durationMinutes: 60,
    method: 'Ultradian Peak',
    intention: 'If 8:30 PM, then solve Schrödinger 3D box boundary drills',
    completed: false,
  },
];

export const LIVE_ROOMS: LiveFocusRoom[] = [
  {
    id: 'room_1',
    name: 'Silent Research Sanctuary',
    category: 'Intensive Reading & Law',
    activeMembers: 0,
    topic: 'Deep Reading & Precedent Synthesis',
    description: 'Solitary, distraction-free environment calibrated for deep legal, philosophical, and analytical texts.',
    currentPace: '50m Deep Block · 10m Quiet Rest',
  },
  {
    id: 'room_2',
    name: 'STEM & Mathematical Chamber',
    category: 'Mathematics & Computer Science',
    activeMembers: 0,
    topic: 'Differential Equations & GPU Kernel Tiling',
    description: 'Structured for prolonged cognitive stamina, mathematical derivations, and algorithm design.',
    currentPace: '90m Ultradian Rhythm Flow',
  },
  {
    id: 'room_3',
    name: 'Clinical Retrieval & Spaced Recall Vault',
    category: 'Medicine & Biological Sciences',
    activeMembers: 0,
    topic: 'Pharmacology Mechanisms & Rapid Retrieval',
    description: 'High-speed active recall cycles and high-yield conceptual flashcards.',
    currentPace: '25m Pomodoro Retrieval Cycles',
  },
  {
    id: 'room_4',
    name: 'Deep Systems & Compiler Laboratory',
    category: 'Software Architecture',
    activeMembers: 0,
    topic: 'Local-first architecture & clean code',
    description: 'Zero context switching. Dedicated to uninterrupted execution and deep flow.',
    currentPace: '60m Pure Flow Focus',
  },
];

// Helper to safely read and write to localStorage
export function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Storage read error for key:', key, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error for key:', key, e);
  }
}

// Storage API
export const storageService = {
  getSubjects(): Subject[] {
    return getFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  },
  saveSubjects(subjects: Subject[]): void {
    saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
  },
  updateSubject(updatedSubject: Subject): void {
    const subjects = this.getSubjects().map(s => (s.id === updatedSubject.id ? updatedSubject : s));
    this.saveSubjects(subjects);

    // Cascade name update throughout planner, revisions, and sessions if name changed
    const planner = this.getPlanner().map(p =>
      p.subjectId === updatedSubject.id ? { ...p, subjectName: updatedSubject.name } : p
    );
    this.savePlanner(planner);

    const revisions = this.getRevisions().map(r =>
      r.subjectId === updatedSubject.id ? { ...r, subjectName: updatedSubject.name } : r
    );
    this.saveRevisions(revisions);

    const sessions = this.getSessions().map(sess =>
      sess.subjectId === updatedSubject.id ? { ...sess, subjectName: updatedSubject.name } : sess
    );
    this.saveSessions(sessions);
  },
  deleteSubject(subjectId: string): void {
    const subjects = this.getSubjects().filter(s => s.id !== subjectId);
    this.saveSubjects(subjects);

    // Remove associated planner intentions
    const planner = this.getPlanner().filter(p => p.subjectId !== subjectId);
    this.savePlanner(planner);

    // Remove associated revisions
    const revisions = this.getRevisions().filter(r => r.subjectId !== subjectId);
    this.saveRevisions(revisions);
  },
  getSessions(): FocusSession[] {
    return getFromStorage<FocusSession[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  },
  saveSessions(sessions: FocusSession[]): void {
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
  },
  addSession(session: FocusSession): void {
    const sessions = this.getSessions();
    sessions.unshift(session);
    this.saveSessions(sessions);
  },
  getAppRules(): AppRule[] {
    return getFromStorage<AppRule[]>(STORAGE_KEYS.APP_RULES, INITIAL_APP_RULES);
  },
  saveAppRules(rules: AppRule[]): void {
    saveToStorage(STORAGE_KEYS.APP_RULES, rules);
  },
  getWebsiteRules(): WebsiteRule[] {
    return getFromStorage<WebsiteRule[]>(STORAGE_KEYS.WEBSITE_RULES, INITIAL_WEBSITE_RULES);
  },
  saveWebsiteRules(rules: WebsiteRule[]): void {
    saveToStorage(STORAGE_KEYS.WEBSITE_RULES, rules);
  },
  getHabits(): HabitItem[] {
    return getFromStorage<HabitItem[]>(STORAGE_KEYS.HABITS, INITIAL_HABITS);
  },
  saveHabits(habits: HabitItem[]): void {
    saveToStorage(STORAGE_KEYS.HABITS, habits);
  },
  getShieldEvents(): ShieldEvent[] {
    return getFromStorage<ShieldEvent[]>(STORAGE_KEYS.SHIELD_EVENTS, [
      { id: 'se_1', timestamp: new Date(Date.now() - 3600000).toISOString(), appName: 'Instagram', type: 'urge_blocked', details: 'Short-form feed intercept triggered' },
      { id: 'se_2', timestamp: new Date(Date.now() - 7200000).toISOString(), appName: 'TikTok', type: 'urge_blocked', details: 'Full app shield active' },
      { id: 'se_3', timestamp: new Date(Date.now() - 10800000).toISOString(), appName: 'X (Twitter)', type: 'urge_blocked', details: 'Feed barrier held' },
    ]);
  },
  addShieldEvent(event: ShieldEvent): void {
    const events = this.getShieldEvents();
    events.unshift(event);
    saveToStorage(STORAGE_KEYS.SHIELD_EVENTS, events);
  },
  getPlanner(): PlannedStudyBlock[] {
    return getFromStorage<PlannedStudyBlock[]>(STORAGE_KEYS.PLANNER, INITIAL_PLANNER);
  },
  savePlanner(planner: PlannedStudyBlock[]): void {
    saveToStorage(STORAGE_KEYS.PLANNER, planner);
  },
  getSettings(): UserSettings {
    return getFromStorage<UserSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  saveSettings(settings: UserSettings): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  },
  getRevisions(): SM2Revision[] {
    return getFromStorage<SM2Revision[]>(STORAGE_KEYS.REVISIONS, INITIAL_REVISIONS);
  },
  saveRevisions(revisions: SM2Revision[]): void {
    saveToStorage(STORAGE_KEYS.REVISIONS, revisions);
  },

  // Calculate Deterministic Reclaim Score™ (0-100)
  calculateReclaimScore(
    todayFocusMinutes: number = 222,
    screenTimeMinutes: number = 67,
    urgesBlocked: number = 27,
    habitsCompleted: number = 4,
    totalHabits: number = 5
  ): {
    score: number;
    breakdown: {
      focusVolumePoints: number;
      attentionRatioPoints: number;
      urgeInvariancePoints: number;
      habitPoints: number;
      total: number;
    };
    description: string;
    deltaVsYesterday: number;
  } {
    // 1. Focus Volume (Max 40 points, based on 240m daily target)
    const targetMin = 240;
    const focusRatio = Math.min(1.2, todayFocusMinutes / targetMin);
    const focusVolumePoints = Math.round(focusRatio * 35); // up to 35-40 pts

    // 2. Attention Sovereignty (Max 25 points, Focus vs Distraction)
    const totalDigitalTime = todayFocusMinutes + screenTimeMinutes;
    const sovereignRatio = totalDigitalTime > 0 ? todayFocusMinutes / totalDigitalTime : 1.0;
    const attentionRatioPoints = Math.round(sovereignRatio * 25);

    // 3. Urge Invariance (Max 15 points, urges halted)
    const urgeInvariancePoints = Math.min(15, Math.round(urgesBlocked * 0.55));

    // 4. Habit Discipline (Max 20 points)
    const habitPoints = Math.round((habitsCompleted / Math.max(1, totalHabits)) * 20);

    const total = Math.min(100, Math.max(0, focusVolumePoints + attentionRatioPoints + urgeInvariancePoints + habitPoints));

    let description = '87 — Excellent control today. 3h 42m logged into deep cognitive sessions.';
    if (total >= 85) {
      const h = Math.floor(todayFocusMinutes / 60);
      const m = todayFocusMinutes % 60;
      description = `${total} — Sovereign control achieved today. ${h}h ${m}m logged into deep cognitive flow.`;
    } else if (total >= 65) {
      description = `${total} — Disciplined pacing. High attention protection maintained.`;
    } else {
      description = `${total} — Attention vulnerable. Recommended: engage mindful reset and active shield.`;
    }

    return {
      score: total,
      breakdown: {
        focusVolumePoints,
        attentionRatioPoints,
        urgeInvariancePoints,
        habitPoints,
        total,
      },
      description,
      deltaVsYesterday: 5,
    };
  },

  // Export all data as JSON
  exportDataJSON(): string {
    const bundle = {
      exportedAt: new Date().toISOString(),
      appName: 'Mentis',
      version: '1.0.0-sovereign',
      subjects: this.getSubjects(),
      sessions: this.getSessions(),
      appRules: this.getAppRules(),
      websiteRules: this.getWebsiteRules(),
      habits: this.getHabits(),
      shieldEvents: this.getShieldEvents(),
      planner: this.getPlanner(),
      revisions: this.getRevisions(),
      settings: this.getSettings(),
    };
    return JSON.stringify(bundle, null, 2);
  },

  // Export sessions as CSV
  exportSessionsCSV(): string {
    const sessions = this.getSessions();
    const headers = [
      'SessionID',
      'SubjectID',
      'Subject',
      'Mode',
      'PlannedMinutes',
      'ActualMinutes',
      'CompletionPercentage',
      'CompletionStatus',
      'EarlyFinish',
      'FocusGoal',
      'Timestamp',
      'XPEarned',
      'UrgesBlocked',
      'Method',
    ];
    const rows = sessions.map(s => [
      `"${s.id}"`,
      `"${s.subjectId}"`,
      `"${s.subjectName.replace(/"/g, '""')}"`,
      `"${s.mode}"`,
      s.plannedDurationMinutes ?? s.durationMinutes,
      s.actualDurationMinutes ?? s.completedMinutes,
      s.completionPercentage ?? Math.round(((s.completedMinutes) / Math.max(1, s.durationMinutes)) * 100),
      `"${s.completionStatus ?? (s.completed ? 'COMPLETED' : 'ENDED_EARLY')}"`,
      s.earlyFinish ? 'TRUE' : 'FALSE',
      `"${(s.focusGoal || s.milestone || '').replace(/"/g, '""')}"`,
      `"${s.timestamp}"`,
      s.xpEarned,
      s.urgesBlocked,
      `"${s.method}"`,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  // Import all data from JSON backup
  importDataJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.subjects)) this.saveSubjects(data.subjects);
      if (Array.isArray(data.sessions)) this.saveSessions(data.sessions);
      if (Array.isArray(data.appRules)) this.saveAppRules(data.appRules);
      if (Array.isArray(data.websiteRules)) this.saveWebsiteRules(data.websiteRules);
      if (Array.isArray(data.habits)) this.saveHabits(data.habits);
      if (Array.isArray(data.planner)) this.savePlanner(data.planner);
      if (Array.isArray(data.revisions)) this.saveRevisions(data.revisions);
      if (data.settings && typeof data.settings === 'object') this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  },

  // Purge all data and restore clean slate
  purgeAll(): void {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  },
};
