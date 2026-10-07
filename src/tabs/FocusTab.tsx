import React, { useState, useEffect, useRef } from 'react';
import {
  Subject,
  FocusMode,
  AmbientSoundType,
  AmbientTrack,
  LiveFocusRoom,
  FocusSession,
  TabType,
} from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Shield,
  Volume2,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  AlertTriangle,
  Sparkles,
  Compass,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { notificationService } from '../services/notifications';
import { storageService, LIVE_ROOMS } from '../services/storage';
import { SessionSummaryModal } from '../components/SessionSummaryModal';

interface FocusTabProps {
  subjects: Subject[];
  selectedSubject: Subject;
  onSelectSubject: (s: Subject) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenLiveRoomModal: (room: LiveFocusRoom) => void;
  onOpenActiveRecallModal: (subjectName: string, subjectId: string) => void;
  onSessionComplete: (session: FocusSession) => void;
  onTimerStateChange?: (isActive: boolean, secondsRemaining: number, isPaused: boolean) => void;
  initialAutoStart?: boolean;
}

const AMBIENT_TRACKS: AmbientTrack[] = [
  { id: 'brown', name: 'Brown Noise', frequencyLabel: 'Deep Spectral', desc: 'Restores working memory & blocks ambient voices' },
  { id: 'rain', name: 'Gentle Rain', frequencyLabel: 'Organic Body', desc: 'Soothes autonomic nervous system' },
  { id: 'gamma40', name: '40Hz Gamma Focus', frequencyLabel: '40Hz Binaural', desc: 'Synchronizes cortical oscillations for high flow' },
  { id: 'ocean', name: 'Ocean Tides', frequencyLabel: '0.12Hz Swell', desc: 'Rhythmic parasympathetic breathing pacing' },
  { id: 'wind', name: 'Forest Wind', frequencyLabel: 'Canopy Bandpass', desc: 'Diffuses internal rumination and tension' },
  { id: 'white', name: 'White Noise', frequencyLabel: 'Flat Spectrum', desc: 'Total acoustic isolation in noisy settings' },
];

export const FocusTab: React.FC<FocusTabProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  onNavigateTab,
  onOpenLiveRoomModal,
  onOpenActiveRecallModal,
  onSessionComplete,
  onTimerStateChange,
  initialAutoStart = false,
}) => {
  // Mode selection
  const [mode, setMode] = useState<FocusMode>('pomodoro');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [milestone, setMilestone] = useState('');
  const [shieldActive, setShieldActive] = useState(true);
  const [expandAppList, setExpandAppList] = useState(false);

  // Early finish warning state & dialog
  const [showEarlyFinishWarningDialog, setShowEarlyFinishWarningDialog] = useState(false);

  // Completed session summary modal
  const [summarySession, setSummarySession] = useState<FocusSession | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Session start time tracking
  const sessionStartTimeRef = useRef<string | null>(null);

  // Audio state
  const [currentAmbient, setCurrentAmbient] = useState<AmbientSoundType | null>(null);
  const [audioVolume, setAudioVolume] = useState(0.65);

  // Timer interval ref
  const lastTickRef = useRef<number>(Date.now());

  // Auto-start support from Home screen Quick Start
  useEffect(() => {
    if (initialAutoStart && !isActive) {
      handleStartSession();
    }
  }, [initialAutoStart]);

  // Sync state to parent for Floating Island & BottomNav
  useEffect(() => {
    onTimerStateChange?.(isActive, secondsRemaining, isPaused);
  }, [isActive, secondsRemaining, isPaused, onTimerStateChange]);

  // Handle countdown interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused) {
      lastTickRef.current = Date.now();

      interval = setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - lastTickRef.current) / 1000);

        if (delta >= 1) {
          lastTickRef.current = now;
          setSecondsRemaining(prev => {
            if (prev <= delta) {
              return 0;
            }
            return prev - delta;
          });
        }
      }, 500);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  // Clean trigger on natural timer reaching 00:00
  useEffect(() => {
    if (isActive && !isPaused && secondsRemaining === 0) {
      handleNaturalCompletion();
    }
  }, [secondsRemaining, isActive, isPaused]);

  const handleStartSession = () => {
    setIsActive(true);
    setIsPaused(false);
    sessionStartTimeRef.current = new Date().toISOString();
    audioEngine.playBell('start');

    notificationService.notify({
      channel: 'session_start',
      title: `Focus Session Begun: ${durationMinutes}m`,
      body: `Subject: ${selectedSubject.name}. Distraction shield locked on 8 apps.`,
      actionPrimaryText: 'Open Focus',
      actionSecondaryText: 'Snooze 5m',
      onSecondary: () => handleNudgeDuration(5),
    });
  };

  const handlePauseSession = () => {
    setIsPaused(true);
  };

  const handleResumeSession = () => {
    setIsPaused(false);
  };

  const handleResetSession = () => {
    setIsActive(false);
    setIsPaused(false);
    sessionStartTimeRef.current = null;
    setShowEarlyFinishWarningDialog(false);
    setSecondsRemaining(durationMinutes * 60);
    audioEngine.playBell('reset');
  };

  // Called when user clicks "Finish" button
  const handleFinishButtonClick = () => {
    if (!isActive) return;

    if (secondsRemaining > 0) {
      // Early Finish triggered before timer reaches 00:00:
      // DO NOT immediately end the session.
      // 1. Play short, noticeable but non-aggressive warning tone
      audioEngine.playEarlyFinishWarning();
      // 2. Pause timer while user reviews dialog
      setIsPaused(true);
      // 3. Show confirmation dialog
      setShowEarlyFinishWarningDialog(true);
    } else {
      // Reached 0: natural completion
      handleNaturalCompletion();
    }
  };

  // User chooses "Continue Session" in confirmation dialog
  const handleContinueSession = () => {
    setShowEarlyFinishWarningDialog(false);
    // Resume timer & keep app blocking active
    setIsPaused(false);
  };

  // User chooses "Finish Anyway" (Destructive treatment confirmed)
  const handleFinishAnyway = () => {
    setShowEarlyFinishWarningDialog(false);

    // Stop timer
    setIsActive(false);
    setIsPaused(false);

    const plannedSeconds = durationMinutes * 60;
    const elapsedSeconds = Math.max(0, plannedSeconds - secondsRemaining);
    const actualMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const completionPct = Math.min(100, Math.round((actualMinutes / durationMinutes) * 100));

    const startTime = sessionStartTimeRef.current || new Date(Date.now() - elapsedSeconds * 1000).toISOString();
    const endTime = new Date().toISOString();

    const xpEarned = Math.round((actualMinutes / durationMinutes) * (durationMinutes >= 50 ? 110 : 60));

    const earlySession: FocusSession = {
      id: 'sess_' + Date.now(),
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      mode,
      durationMinutes,
      completedMinutes: actualMinutes,
      plannedDurationMinutes: durationMinutes,
      actualDurationMinutes: actualMinutes,
      startTime,
      endTime,
      completionPercentage: completionPct,
      completionStatus: 'ENDED_EARLY',
      earlyFinish: true,
      focusGoal: milestone.trim() || undefined,
      blockedAppDurationMinutes: shieldActive ? actualMinutes : 0,
      timestamp: startTime,
      milestone: milestone.trim() || undefined,
      notes: `Ended early: ${actualMinutes}m of planned ${durationMinutes}m completed (${completionPct}%).`,
      xpEarned,
      urgesBlocked: Math.max(1, Math.round(actualMinutes * 0.15)),
      method: mode === 'pomodoro' ? 'Pomodoro' : mode === 'deep_focus' ? 'Deep Flow' : 'Study Mode',
      completed: false,
    };

    // Update subject hours studied with actual duration
    const addedHours = Number((actualMinutes / 60).toFixed(2));
    const updatedSubjects = subjects.map(s => {
      if (s.id === selectedSubject.id) {
        return {
          ...s,
          hoursStudied: Number((s.hoursStudied + addedHours).toFixed(2)),
          todayStudyMinutes: (s.todayStudyMinutes || 0) + actualMinutes,
        };
      }
      return s;
    });
    storageService.saveSubjects(updatedSubjects);
    storageService.addSession(earlySession);

    onSessionComplete(earlySession);

    // Reset timer
    setSecondsRemaining(durationMinutes * 60);
    sessionStartTimeRef.current = null;

    // Display session summary
    setSummarySession(earlySession);
    setShowSummaryModal(true);
  };

  // Natural completion when timer reaches 00:00
  const handleNaturalCompletion = () => {
    setIsActive(false);
    setIsPaused(false);
    setShowEarlyFinishWarningDialog(false);
    setSecondsRemaining(durationMinutes * 60);

    // Uplifting ceremonial bell, no warning tone
    audioEngine.playBell('complete');

    const xpEarned = durationMinutes >= 50 ? 110 : 60;
    const startTime = sessionStartTimeRef.current || new Date(Date.now() - durationMinutes * 60000).toISOString();
    const endTime = new Date().toISOString();

    const session: FocusSession = {
      id: 'sess_' + Date.now(),
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      mode,
      durationMinutes,
      completedMinutes: durationMinutes,
      plannedDurationMinutes: durationMinutes,
      actualDurationMinutes: durationMinutes,
      startTime,
      endTime,
      completionPercentage: 100,
      completionStatus: 'COMPLETED',
      earlyFinish: false,
      focusGoal: milestone.trim() || undefined,
      blockedAppDurationMinutes: shieldActive ? durationMinutes : 0,
      timestamp: startTime,
      milestone: milestone.trim() || undefined,
      notes: `Fully completed session: ${durationMinutes} minutes uninterrupted flow.`,
      xpEarned,
      urgesBlocked: 4,
      method: mode === 'pomodoro' ? 'Pomodoro (25/5)' : mode === 'deep_focus' ? 'Ultradian 90m Peak' : 'Deep Study Flow',
      completed: true,
    };

    // Update subject studied hours
    const addedHours = Number((durationMinutes / 60).toFixed(2));
    const updatedSubjects = subjects.map(s => {
      if (s.id === selectedSubject.id) {
        return {
          ...s,
          hoursStudied: Number((s.hoursStudied + addedHours).toFixed(2)),
          todayStudyMinutes: (s.todayStudyMinutes || 0) + durationMinutes,
        };
      }
      return s;
    });
    storageService.saveSubjects(updatedSubjects);
    storageService.addSession(session);

    notificationService.notify({
      channel: 'session_end',
      title: `Cognitive Session Completed! (+${xpEarned} XP)`,
      body: `${durationMinutes}m logged for ${selectedSubject.name}. Ready for Active Recall quiz.`,
      actionPrimaryText: 'Take Active Recall Quiz',
      actionSecondaryText: 'Start Break',
      onPrimary: () => onOpenActiveRecallModal(selectedSubject.name, selectedSubject.id),
    });

    onSessionComplete(session);
    sessionStartTimeRef.current = null;

    // Display summary modal
    setSummarySession(session);
    setShowSummaryModal(true);
  };

  // Toggle ambient track
  const handleToggleAmbient = (trackId: AmbientSoundType) => {
    if (currentAmbient === trackId) {
      audioEngine.stopAmbient();
      setCurrentAmbient(null);
    } else {
      audioEngine.playAmbient(trackId);
      setCurrentAmbient(trackId);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setAudioVolume(newVol);
    audioEngine.setVolume(newVol);
  };

  // Format timer
  const minutesDisplay = Math.floor(secondsRemaining / 60);
  const secondsDisplay = secondsRemaining % 60;
  const timeFormatted = `${minutesDisplay.toString().padStart(2, '0')}:${secondsDisplay
    .toString()
    .padStart(2, '0')}`;

  const remainingMinutes = Math.floor(secondsRemaining / 60);
  const remainingSeconds = secondsRemaining % 60;
  const remainingTimeText =
    remainingMinutes > 0
      ? `${remainingMinutes}m ${remainingSeconds > 0 ? `${remainingSeconds}s` : ''}`
      : `${remainingSeconds}s`;

  const handleSelectMode = (newMode: FocusMode) => {
    if (isActive) return;
    setMode(newMode);
    let defaultMins = 25;
    if (newMode === 'deep_focus') defaultMins = 90;
    if (newMode === 'study_mode') defaultMins = 50;
    if (newMode === 'work_mode') defaultMins = 45;
    setDurationMinutes(defaultMins);
    setSecondsRemaining(defaultMins * 60);
  };

  const handleSelectDuration = (mins: number) => {
    if (isActive) return;
    setDurationMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const handleNudgeDuration = (deltaMins: number) => {
    if (isActive) return;
    const next = Math.max(5, Math.min(240, durationMinutes + deltaMins));
    setDurationMinutes(next);
    setSecondsRemaining(next * 60);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#FFA726] font-bold block">
            DEEP WORK CONSOLE
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FFFFFF]">
            Focus Chamber
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Flame Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A150E] border border-[#FFA726]/30 text-[#FFA726] text-xs font-mono font-bold shadow-sm shadow-[#FFA726]/10">
            <Flame className="w-3.5 h-3.5 fill-[#FFA726]" />
            <span>{selectedSubject.dayStreak}d streak</span>
          </div>
        </div>
      </div>

      {/* Target Subject Selector & Mode Selector */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase text-[#B0B0C4] tracking-[0.14em] font-bold">
            SUBJECT & CURRICULUM
          </label>
          <button
            onClick={() => onNavigateTab('study')}
            className="text-[11px] font-mono text-[#FFA726] hover:underline font-semibold"
          >
            Manage Subjects →
          </button>
        </div>

        {/* Horizontal Subject Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {subjects.map(subj => {
            const isSelected = subj.id === selectedSubject.id;
            return (
              <button
                key={subj.id}
                onClick={() => {
                  if (!isActive) onSelectSubject(subj);
                }}
                disabled={isActive}
                className={`flex items-center gap-2.5 p-2 px-3 rounded-2xl border text-left shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#1C1812] border-[#FFA726] shadow-sm shadow-[#FFA726]/20'
                    : 'bg-[#0A0A10] border-white/[0.08] hover:border-white/20 opacity-80 hover:opacity-100'
                } disabled:opacity-60 cursor-pointer`}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-black shrink-0"
                  style={{ backgroundColor: subj.color }}
                >
                  {subj.code.slice(0, 2)}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#FFFFFF] block leading-tight truncate max-w-[120px]">
                    {subj.name}
                  </span>
                  <span className="text-[9px] font-mono text-[#B0B0C4]">
                    {subj.syllabusMasteredPercent}% mastered
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Focus Mode Segments */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#0A0A10] rounded-2xl border border-white/[0.08]">
          {(
            [
              { id: 'pomodoro', label: 'Pomodoro', sub: '25/5m' },
              { id: 'deep_focus', label: 'Ultradian', sub: '90m' },
              { id: 'study_mode', label: 'Flow', sub: '50m' },
              { id: 'work_mode', label: 'Sprint', sub: '45m' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => handleSelectMode(tab.id)}
              disabled={isActive}
              className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                mode === tab.id
                  ? 'bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold shadow-sm shadow-[#FFA726]/30'
                  : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
              } disabled:opacity-50`}
            >
              <span className="text-xs font-bold block">{tab.label}</span>
              <span className="text-[9px] font-mono opacity-85 block">{tab.sub}</span>
            </button>
          ))}
        </div>

        {/* Duration chips & Nudge Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#B0B0C4] tracking-[0.14em] font-bold">
              DURATION PRESET
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleNudgeDuration(-15)}
                disabled={isActive}
                className="px-2 py-0.5 rounded-lg bg-[#0A0A10] border border-white/[0.08] text-[10px] font-mono text-[#B0B0C4] hover:text-[#FFFFFF] hover:border-white/20 disabled:opacity-40 transition-colors"
              >
                −15m
              </button>
              <button
                onClick={() => handleNudgeDuration(-5)}
                disabled={isActive}
                className="px-2 py-0.5 rounded-lg bg-[#0A0A10] border border-white/[0.08] text-[10px] font-mono text-[#B0B0C4] hover:text-[#FFFFFF] hover:border-white/20 disabled:opacity-40 transition-colors"
              >
                −5m
              </button>
              <button
                onClick={() => handleNudgeDuration(5)}
                disabled={isActive}
                className="px-2 py-0.5 rounded-lg bg-[#0A0A10] border border-white/[0.08] text-[10px] font-mono text-[#B0B0C4] hover:text-[#FFFFFF] hover:border-white/20 disabled:opacity-40 transition-colors"
              >
                +5m
              </button>
              <button
                onClick={() => handleNudgeDuration(15)}
                disabled={isActive}
                className="px-2 py-0.5 rounded-lg bg-[#0A0A10] border border-white/[0.08] text-[10px] font-mono text-[#B0B0C4] hover:text-[#FFFFFF] hover:border-white/20 disabled:opacity-40 transition-colors"
              >
                +15m
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[15, 25, 30, 45, 50, 60, 90, 120].map(m => (
              <button
                key={m}
                onClick={() => handleSelectDuration(m)}
                disabled={isActive}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                  durationMinutes === m
                    ? 'bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black shadow-md shadow-[#FFA726]/30'
                    : 'bg-[#0A0A10] border border-white/[0.1] text-[#B0B0C4] hover:text-[#FFFFFF] hover:border-white/25'
                } disabled:opacity-50`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Distraction Shield Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3 shadow-md shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-[#FFA726]" />
            <span className="text-xs font-bold text-[#FFFFFF]">Distraction Shield Protection</span>
          </div>

          <button
            onClick={() => setShieldActive(!shieldActive)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
              shieldActive ? 'bg-[#FFA726]' : 'bg-[#252535]'
            }`}
            aria-label="Toggle distraction shield"
          >
            <div
              className={`w-5 h-5 rounded-full bg-black shadow-md transform transition-transform duration-200 ${
                shieldActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-[#B0B0C4] leading-relaxed">
          {shieldActive
            ? '8 apps will automatically lock upon session start. Kinesis Intercept will intervene on any launch.'
            : 'Shield temporarily bypassed. Urge interventions disabled.'}
        </p>

        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
          <button
            onClick={() => setExpandAppList(!expandAppList)}
            className="text-[#B0B0C4] hover:text-[#FFFFFF] flex items-center gap-1 font-medium transition-colors"
          >
            {expandAppList ? 'Hide Blocked Apps' : '8 apps locked (Instagram, TikTok, X, Reddit…)'}
            {expandAppList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onNavigateTab('block')}
            className="text-[#FFA726] hover:underline font-semibold"
          >
            Edit App List
          </button>
        </div>

        {expandAppList && (
          <div className="p-3.5 bg-[#0A0A10] rounded-2xl border border-white/[0.08] grid grid-cols-2 gap-2 text-[11px] text-[#B0B0C4]">
            <span className="flex items-center gap-1.5">• Instagram <span className="text-[#FFA726] font-mono text-[10px]">(Feed lock)</span></span>
            <span className="flex items-center gap-1.5">• TikTok <span className="text-[#FF3366] font-mono text-[10px]">(Full lock)</span></span>
            <span className="flex items-center gap-1.5">• YouTube <span className="text-[#FFA726] font-mono text-[10px]">(Shorts lock)</span></span>
            <span className="flex items-center gap-1.5">• Reddit <span className="text-[#FF3366] font-mono text-[10px]">(Full lock)</span></span>
            <span className="flex items-center gap-1.5">• X Twitter <span className="text-[#FFA726] font-mono text-[10px]">(Feed lock)</span></span>
            <span className="flex items-center gap-1.5">• Mobile Games <span className="text-[#FF3366] font-mono text-[10px]">(Full lock)</span></span>
            <span className="flex items-center gap-1.5">• Amazon <span className="text-[#FF3366] font-mono text-[10px]">(Full lock)</span></span>
            <span className="flex items-center gap-1.5">• Threads <span className="text-[#FF3366] font-mono text-[10px]">(Full lock)</span></span>
          </div>
        )}
      </div>

      {/* MAIN TIMER DISPLAY CARD — PROMINENT LEVEL 2 SURFACE & POWERFUL TYPOGRAPHY */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181824] to-[#12121A] border border-white/[0.14] text-center space-y-4 shadow-2xl shadow-black">
        {/* Ambient Radial Glow */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isActive && !isPaused ? 'bg-[#FFA726]/20' : 'bg-white/[0.03]'
          }`}
        />

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A0A10] border border-white/[0.12] text-xs font-mono shadow-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              isActive && !isPaused
                ? 'bg-[#00E676] animate-ping'
                : isPaused
                ? 'bg-[#FFA726]'
                : 'bg-[#B0B0C4]'
            }`}
          />
          <span className="text-[#FFFFFF] font-semibold">
            {isActive && !isPaused ? '● Distractions Locked' : isPaused ? 'Session Paused' : 'Ready for Launch'}
          </span>
        </div>

        {/* FOCUS TIMER TYPOGRAPHY (Requirement 8): Visual Dominance */}
        <div className="space-y-1 py-1">
          <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#FFA726] font-bold block">
            FOCUS
          </span>
          <div className="text-7xl sm:text-8xl font-mono font-bold tracking-tight text-[#FFFFFF] select-none py-2 tabular-nums drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            {timeFormatted}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#FFFFFF] tracking-tight truncate max-w-sm mx-auto">
            {selectedSubject.name}
          </h3>
          <p className="text-xs font-mono text-[#B0B0C4] mt-0.5">
            Planned Duration: <span className="text-[#FFA726] font-semibold">{durationMinutes}m</span> · Mode: <span className="text-[#FFFFFF] font-semibold">{mode.replace('_', ' ').toUpperCase()}</span>
          </p>
        </div>

        {/* Milestone / Focus Goal Input */}
        <div className="max-w-xs mx-auto">
          <input
            type="text"
            value={milestone}
            onChange={e => setMilestone(e.target.value)}
            disabled={isActive}
            placeholder="Optional focus goal: e.g. solve 15 problems..."
            className="w-full px-3.5 py-2 text-xs text-center bg-[#0A0A10] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726] placeholder:text-[#B0B0C4]/60 disabled:opacity-60 transition-colors"
          />
        </div>

        {/* CTA Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {!isActive ? (
            <button
              onClick={handleStartSession}
              className="w-full max-w-xs py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FFA726]/30 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Begin {durationMinutes}-Min Session</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full max-w-xs">
              {isPaused ? (
                <button
                  onClick={handleResumeSession}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FFA726]/30 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Resume Flow</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseSession}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-[#222230] hover:bg-[#2C2C3E] text-[#FFFFFF] border border-white/[0.12] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}

              {/* Finish Button with Early Finish Intercept */}
              <button
                onClick={handleFinishButtonClick}
                className="py-3.5 px-4 rounded-2xl bg-[#00E676] hover:bg-[#00FF85] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#00E676]/30 transition-colors cursor-pointer"
                title="Finish focus session"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish</span>
              </button>

              <button
                onClick={handleResetSession}
                className="p-3.5 rounded-2xl bg-[#222230] hover:bg-[#2C2C3E] border border-white/[0.12] text-[#B0B0C4] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AMBIENT FOCUS AUDIO GRID */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#FFA726]" />
            <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
              AMBIENT FOCUS AUDIO
            </span>
          </div>

          {currentAmbient && (
            <span className="text-[10px] font-mono text-[#00E676] font-bold">
              ● Playing: {AMBIENT_TRACKS.find(t => t.id === currentAmbient)?.name}
            </span>
          )}
        </div>

        {/* Volume slider */}
        {currentAmbient && (
          <div className="flex items-center gap-3 p-3 bg-[#0A0A10] rounded-2xl border border-white/[0.08]">
            <span className="text-[10px] font-mono text-[#B0B0C4] uppercase">Vol</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioVolume}
              onChange={e => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 accent-[#FFA726] h-1.5 bg-[#252535] rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-[#FFA726] font-bold">
              {Math.round(audioVolume * 100)}%
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AMBIENT_TRACKS.map(track => {
            const isPlayingThis = currentAmbient === track.id;
            return (
              <button
                key={track.id}
                onClick={() => handleToggleAmbient(track.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isPlayingThis
                    ? 'bg-[#1C1812] border-[#FFA726] shadow-md shadow-[#FFA726]/20'
                    : 'bg-[#0A0A10] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold ${
                      isPlayingThis ? 'text-[#FFA726]' : 'text-[#FFFFFF]'
                    }`}
                  >
                    {track.name}
                  </span>
                  {isPlayingThis && (
                    <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#B0B0C4] block">
                  {track.frequencyLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PERSONAL COGNITIVE SANCTUARIES & FLOW PRESETS */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#FFA726]" />
            <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
              PERSONAL FOCUS SANCTUARIES
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#00E676] font-bold">
            100% Solitary & Offline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {LIVE_ROOMS.map(room => (
            <div
              key={room.id}
              onClick={() => onOpenLiveRoomModal(room)}
              className="p-3.5 rounded-2xl bg-[#0A0A10] border border-white/[0.08] hover:border-[#FFA726]/50 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#FFFFFF] group-hover:text-[#FFA726] transition-colors block leading-tight">
                  {room.name}
                </span>
                <span className="text-[10px] font-mono text-[#B0B0C4] block">
                  {room.topic} · {room.currentPace}
                </span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.06] text-[#FFA726] text-[10px] font-mono font-bold shrink-0 group-hover:bg-[#FFA726] group-hover:text-black transition-colors">
                <span>Preset</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EARLY FINISH WARNING CONFIRMATION DIALOG (Requirement 3) */}
      {showEarlyFinishWarningDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-sm bg-[#13131C] border border-white/[0.16] rounded-3xl p-6 shadow-2xl text-center shadow-black space-y-4">
            {/* Tone indicator icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FFA726]/15 border border-[#FFA726]/50 flex items-center justify-center text-[#FFA726] shadow-lg shadow-[#FFA726]/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFA726] font-bold block mb-1">
                EARLY COMPLETION WARNING
              </span>
              <h3 className="text-lg font-bold text-[#FFFFFF]">Finish Early?</h3>
              <p className="text-xs text-[#D0D0E2] mt-2 leading-relaxed">
                You still have <span className="text-[#FFA726] font-bold font-mono">{remainingTimeText}</span> left in this focus session.
              </p>
            </div>

            <p className="text-[11px] text-[#9E9EB6] leading-relaxed bg-[#0A0A10] p-3 rounded-2xl border border-white/[0.06]">
              Finishing now will preserve your actual logged time ({Math.max(1, Math.round((durationMinutes * 60 - secondsRemaining) / 60))}m) and record the session as ended early.
            </p>

            {/* Actions: Hierarchy defined in brief: Primary = Continue Session, Secondary = Finish Anyway */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleContinueSession}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-xs shadow-lg shadow-[#FFA726]/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Continue Session</span>
              </button>

              <button
                type="button"
                onClick={handleFinishAnyway}
                className="w-full py-3 px-4 rounded-2xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/50 hover:border-red-500/80 text-red-400 font-semibold text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                <span>Finish Anyway</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SESSION SUMMARY MODAL (Shown after completion or early-finish) */}
      <SessionSummaryModal
        session={summarySession}
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onStartRecall={onOpenActiveRecallModal}
      />
    </div>
  );
};
