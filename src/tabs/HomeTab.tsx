import React, { useState } from 'react';
import {
  Shield,
  Flame,
  Play,
  Zap,
  Wind,
  Bookmark,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Clock,
  Target,
  Sliders,
} from 'lucide-react';
import { Subject, TabType, FocusMode } from '../types';
import { SubjectIcon } from '../components/SubjectIcon';
import { formatTimeHoursMinutes, formatMinutesDisplay } from './StudyTab';

export interface StartFocusOptions {
  quickStart?: boolean;
  subject?: Subject;
  durationMinutes?: number;
  mode?: FocusMode;
  goal?: string;
}

interface HomeTabProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenReclaimScoreModal: () => void;
  onOpenMindfulResetModal: () => void;
  onOpenFrictionGate: () => void;
  onOpenSubjectModal: (subject: Subject) => void;
  onStartFocus: (options?: StartFocusOptions) => void;
  subjects: Subject[];
  reclaimScore: number;
  reclaimDescription: string;
  urgesBlockedCount: number;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onNavigateTab,
  onOpenReclaimScoreModal,
  onOpenMindfulResetModal,
  onOpenFrictionGate,
  onOpenSubjectModal,
  onStartFocus,
  subjects,
  reclaimScore,
  reclaimDescription,
  urgesBlockedCount,
}) => {
  // Home Focus Card pre-selections
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [focusGoal, setFocusGoal] = useState<string>('');

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0] || {
    id: 'subj_1',
    name: 'Mathematics',
    code: 'MA-301',
    color: '#FFA726',
    hoursStudied: 42.25,
    todayStudyMinutes: 85,
    targetHours: 60,
    dayStreak: 7,
    syllabusMasteredPercent: 68,
    units: [],
    tasks: [],
    notes: [],
  };

  // Compute Today's Total study time across subjects
  const todayTotalStudyMinutes = subjects.reduce((acc, s) => acc + (s.todayStudyMinutes || 0), 0);

  // Total studied hours across all subjects
  const totalAllSubjectsHours = subjects.reduce((acc, s) => acc + s.hoursStudied, 0);

  const handleStartFocusPrimary = () => {
    onStartFocus({
      quickStart: false,
      subject: currentSubject,
      durationMinutes: selectedDuration,
      mode: selectedDuration >= 90 ? 'deep_focus' : selectedDuration === 50 ? 'study_mode' : 'pomodoro',
      goal: focusGoal.trim() || undefined,
    });
  };

  const handleQuickStartAction = () => {
    onStartFocus({
      quickStart: true,
      subject: currentSubject,
      durationMinutes: selectedDuration,
      mode: selectedDuration >= 90 ? 'deep_focus' : selectedDuration === 50 ? 'study_mode' : 'pomodoro',
      goal: focusGoal.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12">
      {/* 1. GREETING HIERARCHY (Requirement 15) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#FFA726] font-bold block">
            SOVEREIGN SYSTEM ACTIVE
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FFFFFF] mt-0.5">
            Welcome Back, Scholar.
          </h1>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#13131C] border border-white/[0.14] shadow-sm shrink-0">
          <Flame className="w-4 h-4 text-[#FFA726] fill-[#FFA726]/20" />
          <span className="text-xs font-mono font-bold text-[#FFFFFF]">
            {currentSubject.dayStreak}d Streak
          </span>
        </div>
      </div>

      {/* 2. TODAY'S PROGRESS OVERVIEW (Requirement 15): RECLAIM SCORE™ Card */}
      <div
        onClick={onOpenReclaimScoreModal}
        className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#181824] to-[#13131C] border border-white/[0.14] hover:border-[#FFA726]/60 cursor-pointer transition-all duration-300 group shadow-xl shadow-black/50"
      >
        <div className="absolute top-0 right-0 w-60 h-60 bg-[#FFA726]/12 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FFA726]/25 transition-all" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#0A0A10] border border-white/[0.12] text-[#FFA726] shadow-inner">
              <Shield className="w-5 h-5 fill-[#FFA726]/20 text-[#FFA726]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#FFA726] font-bold block">
                RECLAIM SCORE™
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-[#FFFFFF] leading-none mt-1">
                {reclaimScore}
                <span className="text-sm font-mono text-[#B0B0C4] font-normal ml-1">/ 100</span>
              </div>
            </div>
          </div>

          {/* Delta badge */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#00E676]/15 border border-[#00E676]/40 text-[#00E676] text-[11px] font-mono font-bold shadow-sm shadow-[#00E676]/20">
            <span>+5 pts vs yesterday</span>
          </div>
        </div>

        <p className="text-xs text-[#D0D0E2] mt-3.5 leading-relaxed font-normal">
          {reclaimDescription}
        </p>

        <div className="mt-4 pt-3.5 border-t border-white/[0.1] flex items-center justify-between text-[11px]">
          <span className="text-[#FFA726] font-semibold group-hover:underline underline-offset-4 flex items-center gap-1">
            Tap for deterministic scoring formula
            <ChevronRight className="w-3.5 h-3.5 inline group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="font-mono text-[#B0B0C4] font-medium">Attention Sovereignty</span>
        </div>
      </div>

      {/* 3 Overview Stat Tiles with Elevated Contrast */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Tile 1: Today's Focus */}
        <div className="p-3.5 rounded-2xl bg-[#13131C] border border-white/[0.12] space-y-1 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold tracking-wider block">
            TODAY'S FOCUS
          </span>
          <div className="text-base sm:text-lg font-mono font-bold text-[#FFA726]">
            {formatMinutesDisplay(todayTotalStudyMinutes)}
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <div className="flex-1 h-1.5 bg-[#0A0A10] rounded-full overflow-hidden border border-white/[0.08]">
              <div
                className="h-full bg-gradient-to-r from-[#FF9800] to-[#FFB74D] rounded-full shadow-sm shadow-[#FFA726]/40"
                style={{ width: `${Math.min(100, Math.round((todayTotalStudyMinutes / 240) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[#FFA726] font-bold">
              {Math.min(100, Math.round((todayTotalStudyMinutes / 240) * 100))}%
            </span>
          </div>
        </div>

        {/* Tile 2: Screen Time */}
        <div className="p-3.5 rounded-2xl bg-[#13131C] border border-white/[0.12] space-y-1 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold tracking-wider block">
            SCREEN TIME
          </span>
          <div className="text-base sm:text-lg font-mono font-bold text-[#FFFFFF]">
            1h 07m
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#00E676] font-bold pt-1">
            <TrendingDown className="w-3 h-3" />
            <span>↓34% vs avg</span>
          </div>
        </div>

        {/* Tile 3: Urges Blocked */}
        <div className="p-3.5 rounded-2xl bg-[#13131C] border border-white/[0.12] space-y-1 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold tracking-wider block">
            BLOCKED
          </span>
          <div className="text-base sm:text-lg font-mono font-bold text-[#FF3366]">
            {urgesBlockedCount}
          </div>
          <div className="text-[10px] font-mono text-[#B0B0C4] pt-1 truncate">
            Urges halted
          </div>
        </div>
      </div>

      {/* 3. PRIMARY FOCUS CARD (Requirement 2 & 15: START FOCUS DIRECTLY FROM HOME) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#1E1912] via-[#16141F] to-[#12121A] border border-[#FFA726]/45 space-y-4 shadow-xl shadow-black/60 relative overflow-hidden group">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFA726]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FFA726]/20 transition-all" />

        {/* Header: Current Focus Goal & Subject indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#FFA726]" />
            <span className="text-[11px] font-mono uppercase text-[#FFA726] font-bold tracking-wider">
              CURRENT FOCUS GOAL
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#00E676] font-bold">
            ● Shield Auto-Ready
          </span>
        </div>

        {/* Subject Pre-selection Chips */}
        <div>
          <label className="text-[10px] font-mono uppercase text-[#B0B0C4] block mb-1.5 font-bold">
            Target Subject
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {subjects.map(subj => {
              const isSelected = subj.id === currentSubject.id;
              return (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`flex items-center gap-2 p-2 px-3 rounded-2xl border text-left shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2A1F10] border-[#FFA726] text-[#FFFFFF] shadow-sm shadow-[#FFA726]/30'
                      : 'bg-[#0A0A10] border-white/[0.08] text-[#B0B0C4] hover:text-[#FFFFFF] hover:border-white/20'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-black shrink-0"
                    style={{ backgroundColor: subj.color }}
                  >
                    <SubjectIcon name={subj.icon} fallbackText={subj.code} className="w-3.5 h-3.5 text-black" />
                  </div>
                  <span className="text-xs font-bold truncate max-w-[110px]">
                    {subj.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Selection Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold">
              Duration
            </label>
            <span className="text-[10px] font-mono text-[#FFA726] font-bold">
              {selectedDuration} Minutes
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[15, 25, 45, 50, 60, 90].map(mins => (
              <button
                key={mins}
                onClick={() => setSelectedDuration(mins)}
                className={`py-1.5 px-3 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                  selectedDuration === mins
                    ? 'bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black shadow-md shadow-[#FFA726]/30'
                    : 'bg-[#0A0A10] border border-white/[0.1] text-[#B0B0C4] hover:text-[#FFFFFF]'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Optional Focus Goal Task input */}
        <div>
          <input
            type="text"
            value={focusGoal}
            onChange={e => setFocusGoal(e.target.value)}
            placeholder="Focus goal: e.g. Complete chapter 4 problem set..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A10] border border-white/[0.12] text-xs text-[#FFFFFF] placeholder:text-[#9E9EB6]/50 focus:outline-none focus:border-[#FFA726] transition-colors"
          />
        </div>

        {/* BUTTON REFINEMENT (Requirement 2 & 13): Prominent START FOCUS & Quick Start */}
        <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
          {/* PRIMARY ACTION: START FOCUS */}
          <button
            onClick={handleStartFocusPrimary}
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#FFA726]/30 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-black ml-0.5" />
            <span className="tracking-wide">START FOCUS</span>
          </button>

          {/* SECONDARY ACTION: QUICK START */}
          <button
            onClick={handleQuickStartAction}
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-[#1E1925] hover:bg-[#282235] border border-[#FFA726]/35 text-[#FFA726] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:border-[#FFA726]"
            title="1-Tap Instant Launch with defaults"
          >
            <Zap className="w-4 h-4 text-[#FFA726] fill-[#FFA726]" />
            <span>Quick Start</span>
          </button>

          {/* Mindful Reset (I'm Distracted) */}
          <button
            onClick={onOpenMindfulResetModal}
            className="w-full sm:w-auto py-3.5 px-3 rounded-2xl bg-[#13131C] hover:bg-[#1A1A26] border border-white/[0.1] text-[#38BDF8] hover:text-[#56CAFF] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="60s Mindful Reset"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 4. PERSONAL STUDY OS / SUBJECTS CAROUSEL (Requirement 15) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#FFA726]" />
            <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
              CURRICULUM OS & ACTIVE SUBJECTS
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('study')}
            className="flex items-center gap-1 text-[11px] text-[#FFA726] font-semibold hover:underline cursor-pointer"
          >
            All Subjects
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 pr-1">
          {subjects.map(subj => (
            <button
              key={subj.id}
              onClick={() => onOpenSubjectModal(subj)}
              className="flex items-center gap-3 p-3 px-3.5 rounded-2xl bg-[#0A0A10] border border-white/[0.1] hover:border-[#FFA726]/50 shrink-0 text-left transition-all cursor-pointer group"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-black shrink-0 shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: subj.color }}
              >
                <SubjectIcon name={subj.icon} fallbackText={subj.code} className="w-4 h-4 text-black" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#FFFFFF] block truncate max-w-[130px] group-hover:text-[#FFA726] transition-colors">
                  {subj.name}
                </span>
                <span className="text-[10px] font-mono text-[#B0B0C4] block">
                  {subj.syllabusMasteredPercent}% · {formatTimeHoursMinutes(subj.hoursStudied)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. ACTIVE PROTECTION SHIELDS CARD */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3 shadow-md shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00E676]" />
            <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
              DISTRACTION SHIELDS ACTIVE
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#00E676] font-bold">
            ● 8 Apps Filtered
          </span>
        </div>

        <p className="text-xs text-[#D0D0E2] leading-relaxed">
          Kinesis Intercept is actively monitoring doom-scroll triggers across social media, algorithmic video feeds, and short-form loops.
        </p>

        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
          <button
            onClick={onOpenFrictionGate}
            className="text-[#38BDF8] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Test Friction Barrier</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTab('block')}
            className="text-[#FFA726] hover:underline font-semibold cursor-pointer"
          >
            Configure Rules
          </button>
        </div>
      </div>

      {/* 6. NOVA COGNITIVE COACH INSIGHT */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-2.5 shadow-md shadow-black/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFA726]" />
          <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
            NEUROPLASTICITY INSIGHT
          </span>
        </div>
        <p className="text-xs text-[#D0D0E2] leading-relaxed">
          Every time you halt an unconscious phone pickup, your prefrontal cortex strengthens dopaminergic self-regulation by up to 14%. Focus sessions compound exponentially over 21-day cycles.
        </p>
      </div>
    </div>
  );
};
