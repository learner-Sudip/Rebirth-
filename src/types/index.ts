export type TabType = 'home' | 'study' | 'focus' | 'block' | 'insights' | 'profile';

export type FocusMode = 'pomodoro' | 'deep_focus' | 'study_mode' | 'work_mode';

export interface UnitMastery {
  id: string;
  title: string;
  mastered: boolean;
}

export interface SubjectTask {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface SubjectNote {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'feynman';
  updatedAt: string;
}

export interface SM2Revision {
  id: string;
  subjectId: string;
  subjectName: string;
  prompt: string;
  answer: string;
  intervalDays: number;
  repetitions: number;
  easinessFactor: number;
  nextReviewDate: string; // ISO date YYYY-MM-DD
  lastReviewedAt?: string;
  status: 'due' | 'learning' | 'mastered';
}

export type FocusCompletionStatus = 'COMPLETED' | 'ENDED_EARLY' | 'CANCELLED' | 'IN_PROGRESS';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  icon?: string;
  description?: string;
  hoursStudied: number;
  todayStudyMinutes?: number;
  targetHours: number;
  dailyGoalMinutes?: number;
  weeklyGoalHours?: number;
  monthlyGoalHours?: number;
  dayStreak: number;
  syllabusMasteredPercent: number;
  units: UnitMastery[];
  tasks: SubjectTask[];
  notes: SubjectNote[];
}

export interface FocusSession {
  id: string;
  subjectId: string;
  subjectName: string;
  mode: FocusMode;
  durationMinutes: number; // Planned duration
  completedMinutes: number; // Actual duration
  plannedDurationMinutes?: number;
  actualDurationMinutes?: number;
  startTime?: string;
  endTime?: string;
  completionPercentage?: number;
  completionStatus?: FocusCompletionStatus;
  earlyFinish?: boolean;
  focusGoal?: string;
  blockedAppDurationMinutes?: number;
  notes?: string;
  timestamp: string; // ISO string
  milestone?: string;
  xpEarned: number;
  urgesBlocked: number;
  method: string;
  completed: boolean;
}

export interface AppRule {
  id: string;
  name: string;
  category: string;
  iconName: string;
  packageName: string;
  isBlocked: boolean;
  granularity: 'full' | 'feed_only';
  dailyLimitMinutes: number;
  usageTodayMinutes: number;
}

export interface WebsiteRule {
  id: string;
  domain: string;
  isBlocked: boolean;
  dailyLimitMinutes: number;
  usageTodayMinutes: number;
}

export interface HabitItem {
  id: string;
  title: string;
  xp: number;
  streak: number;
  completedToday: boolean;
}

export interface ShieldEvent {
  id: string;
  timestamp: string;
  appName: string;
  type: 'urge_blocked' | 'friction_unlocked' | 'friction_aborted' | 'schedule_active';
  details?: string;
}

export interface PlannedStudyBlock {
  id: string;
  subjectId: string;
  subjectName: string;
  startTime: string; // "18:00"
  durationMinutes: number;
  method: string;
  intention: string; // "If 6 PM, then start Mathematics"
  completed: boolean;
}

export type EnforcementLevel = 'gentle' | 'balanced' | 'strict';
export type VisualTheme = 'dark' | 'amoled' | 'midnight' | 'forest' | 'light';

export interface UserSettings {
  theme: VisualTheme;
  enforcementLevel: EnforcementLevel;
  focusBankBalanceMinutes: number;
  allyEmail: string;
  shortFormShieldActive: boolean;
  studyScheduleActive: boolean;
  studyScheduleStart: string; // "18:00"
  studyScheduleEnd: string; // "22:00"
  permissions: {
    usageStats: boolean;
    accessibility: boolean;
    alertWindow: boolean;
    exactAlarm: boolean;
    batteryOpt: boolean;
  };
  cloudSyncEnabled: boolean;
  lastCloudBackup?: string;
  dailyTargetMinutes: number;
}

export interface LiveFocusRoom {
  id: string;
  name: string;
  category: string;
  activeMembers: number;
  topic: string;
  description: string;
  currentPace: string;
}

export type AmbientSoundType = 'brown' | 'rain' | 'gamma40' | 'ocean' | 'wind' | 'white';

export interface AmbientTrack {
  id: AmbientSoundType;
  name: string;
  frequencyLabel: string;
  desc: string;
}
