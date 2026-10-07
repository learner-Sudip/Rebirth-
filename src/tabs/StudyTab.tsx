import React, { useState } from 'react';
import {
  Subject,
  SM2Revision,
  PlannedStudyBlock,
} from '../types';
import {
  Plus,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  ChevronRight,
  Brain,
  Sparkles,
  MoreVertical,
  Sliders,
  Target,
} from 'lucide-react';
import { storageService } from '../services/storage';
import { SubjectIcon } from '../components/SubjectIcon';

interface StudyTabProps {
  subjects: Subject[];
  revisions: SM2Revision[];
  onOpenSubjectModal: (subject: Subject) => void;
  onOpenAddSubjectModal: () => void;
  onCustomizeSubject: (subject: Subject) => void;
  onStartFocusWithSubject: (subject: Subject) => void;
  onOpenActiveRecallForRevision: (rev: SM2Revision) => void;
}

export function formatTimeHoursMinutes(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h 00m`;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function formatMinutesDisplay(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h 00m`;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export const StudyTab: React.FC<StudyTabProps> = ({
  subjects,
  revisions,
  onOpenSubjectModal,
  onOpenAddSubjectModal,
  onCustomizeSubject,
  onStartFocusWithSubject,
  onOpenActiveRecallForRevision,
}) => {
  const [subTab, setSubTab] = useState<'dashboard' | 'subjects' | 'planner'>('dashboard');
  const [plannerBlocks, setPlannerBlocks] = useState<PlannedStudyBlock[]>(() => storageService.getPlanner());
  const [newIntentionTime, setNewIntentionTime] = useState('19:00');
  const [newIntentionSubj, setNewIntentionSubj] = useState(subjects[0]?.id || '');
  const [newIntentionNote, setNewIntentionNote] = useState('');

  const revisionsDueCount = revisions.filter(r => r.status === 'due').length;
  const totalTasksDue = subjects.reduce((acc, s) => acc + s.tasks.filter(t => !t.completed).length, 0);

  // Overall mastered unit count
  const totalUnits = subjects.reduce((acc, s) => acc + s.units.length, 0);
  const masteredUnits = subjects.reduce((acc, s) => acc + s.units.filter(u => u.mastered).length, 0);
  const syllabusMasteredPercent = Math.round((masteredUnits / Math.max(1, totalUnits)) * 100);

  // Today's total study time calculation across all subjects
  const todayTotalMinutes = subjects.reduce((acc, s) => acc + (s.todayStudyMinutes || 0), 0);
  const dailyTargetMinutes = 240; // 4 hours
  const dailyTargetPercent = Math.min(100, Math.round((todayTotalMinutes / dailyTargetMinutes) * 100));

  const handleAddIntention = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find(s => s.id === newIntentionSubj) || subjects[0];
    if (!subj) return;

    const newBlock: PlannedStudyBlock = {
      id: 'pb_' + Date.now(),
      subjectId: subj.id,
      subjectName: subj.name,
      startTime: newIntentionTime,
      durationMinutes: 50,
      method: 'Implementation Intention',
      intention: newIntentionNote.trim() || `If ${newIntentionTime}, then open ${subj.name}`,
      completed: false,
    };

    const next = [...plannerBlocks, newBlock];
    setPlannerBlocks(next);
    storageService.savePlanner(next);
    setNewIntentionNote('');
  };

  const togglePlannerItem = (id: string) => {
    const next = plannerBlocks.map(p => (p.id === id ? { ...p, completed: !p.completed } : p));
    setPlannerBlocks(next);
    storageService.savePlanner(next);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#FFA726] font-bold block">
            PERSONAL LEARNING OPERATING SYSTEM
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FFFFFF]">
            Study Command Center
          </h1>
        </div>

        <button
          onClick={onOpenAddSubjectModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-xs shadow-md shadow-[#FFA726]/30 hover:opacity-95 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#13131C] rounded-2xl border border-white/[0.1]">
        {(
          [
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'subjects', label: `My Subjects (${subjects.length})` },
            { id: 'planner', label: 'Planner' },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subTab === tab.id
                ? 'bg-[#222230] text-[#FFA726] border border-[#FFA726]/40 shadow-sm font-bold'
                : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: DASHBOARD */}
      {subTab === 'dashboard' && (
        <>
          {/* SECTION PRIORITY (Requirement 16): Today's Study Time & Overall Progress */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#B0B0C4] font-bold tracking-wider">
                TODAY'S STUDY TIME & OVERALL PROGRESS
              </span>
              <span className="text-[10px] font-mono text-[#00E676] font-bold">
                Daily Goal: 4h 00m
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#FFFFFF]">
                {formatMinutesDisplay(todayTotalMinutes)}{' '}
                <span className="text-xs sm:text-sm font-mono text-[#B0B0C4] font-normal">
                  / 4h 00m target
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#FFA726]">
                {dailyTargetPercent}% Daily Target
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-[#0A0A10] overflow-hidden border border-white/[0.08]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF9800] to-[#FFB74D] shadow-sm shadow-[#FFA726]/40 transition-all duration-500"
                style={{ width: `${dailyTargetPercent}%` }}
              />
            </div>
          </div>

          {/* 4 Overview Tiles with High Contrast */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Tile 1: Total Subjects */}
            <div className="p-3.5 rounded-2xl bg-[#13131C] border border-white/[0.12] space-y-1 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold tracking-wider block">
                TOTAL SUBJECTS
              </span>
              <div className="text-xl font-mono font-bold text-[#FFFFFF]">
                {subjects.length}
              </div>
              <div className="text-[10px] text-[#B0B0C4] font-medium">Curriculums Active</div>
            </div>

            {/* Tile 2: Tasks Due */}
            <div className="p-3.5 rounded-2xl bg-[#13131C] border border-white/[0.12] space-y-1 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-[#00E676] font-bold tracking-wider block">
                TASKS DUE
              </span>
              <div className="text-xl font-mono font-bold text-[#00E676]">
                {totalTasksDue}
              </div>
              <div className="text-[10px] text-[#00E676] font-mono font-bold">Action items</div>
            </div>

            {/* Tile 3: Revisions Due */}
            <div className="p-3.5 rounded-2xl bg-[#13131C] border border-white/[0.12] space-y-1 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-[#38BDF8] font-bold tracking-wider block">
                REVISIONS DUE
              </span>
              <div className="text-xl font-mono font-bold text-[#38BDF8]">
                {revisionsDueCount}
              </div>
              <div className="text-[10px] text-[#38BDF8] font-mono font-bold">SM-2 Spaced Recall</div>
            </div>

            {/* Tile 4: Syllabus Mastered */}
            <div className="p-3.5 rounded-2xl bg-[#13131C] border border-white/[0.12] space-y-1 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold tracking-wider block">
                SYLLABUS MASTERED
              </span>
              <div className="text-xl font-mono font-bold text-[#00E676]">
                {syllabusMasteredPercent}%
              </div>
              <div className="text-[10px] text-[#B0B0C4] font-mono font-medium">
                {masteredUnits}/{totalUnits} units
              </div>
            </div>
          </div>

          {/* SM-2 Spaced Recall Due Section */}
          {revisionsDueCount > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-[#38BDF8]/50 space-y-3.5 shadow-md shadow-black/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#38BDF8]" />
                  <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
                    SM-2 SPACED RECALL DRILLS ({revisionsDueCount} Due Today)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#38BDF8] font-bold">Memory consolidation</span>
              </div>

              <div className="space-y-2">
                {revisions
                  .filter(r => r.status === 'due')
                  .map(rev => (
                    <div
                      key={rev.id}
                      onClick={() => onOpenActiveRecallForRevision(rev)}
                      className="p-3.5 rounded-2xl bg-[#0A0A10] border border-white/[0.1] hover:border-[#38BDF8]/70 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <div className="space-y-0.5 pr-2">
                        <span className="text-[10px] font-mono uppercase text-[#FFA726] font-bold">
                          {rev.subjectName} · Interval: {rev.intervalDays}d
                        </span>
                        <p className="text-xs text-[#FFFFFF] font-medium line-clamp-1 group-hover:text-[#38BDF8] transition-colors">
                          {rev.prompt}
                        </p>
                      </div>
                      <button className="px-3.5 py-1.5 rounded-xl bg-[#38BDF8] hover:bg-[#56CAFF] text-black text-[11px] font-bold shrink-0 shadow-sm shadow-[#38BDF8]/30 cursor-pointer">
                        Recall
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SUBJECT CARDS SECTION (Requirement 1 & 16) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono uppercase text-[#B0B0C4] font-bold tracking-wider">
                SUBJECTS & INDIVIDUAL STUDY METRICS
              </span>
              <span className="text-[11px] text-[#B0B0C4]">Tap ⋮ menu to edit/customize</span>
            </div>

            <div className="space-y-3">
              {subjects.map(subj => {
                const todayMins = subj.todayStudyMinutes || 0;
                return (
                  <div
                    key={subj.id}
                    className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] hover:border-[#FFA726]/40 transition-all shadow-md shadow-black/30 space-y-3 group"
                  >
                    {/* Top Row: Icon, Name, Streak, Three-dot Menu */}
                    <div className="flex items-start justify-between">
                      <div
                        onClick={() => onOpenSubjectModal(subj)}
                        className="flex items-center gap-3 cursor-pointer flex-1 mr-2"
                      >
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-black shadow-sm shrink-0 transition-transform group-hover:scale-105"
                          style={{ backgroundColor: subj.color }}
                        >
                          <SubjectIcon
                            name={subj.icon}
                            fallbackText={subj.code}
                            className="w-5 h-5 text-black"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-[#FFFFFF] group-hover:text-[#FFA726] transition-colors leading-tight">
                              {subj.name}
                            </h3>
                            {subj.dayStreak > 0 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1C1812] border border-[#FFA726]/30 text-[#FFA726] text-[10px] font-mono font-bold shrink-0">
                                <Flame className="w-3 h-3 fill-[#FFA726]" />
                                <span>{subj.dayStreak}d streak</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-[#9E9EB6] block mt-0.5">
                            {subj.code} · {subj.units.length} units
                          </span>
                        </div>
                      </div>

                      {/* Three-Dot Menu Button (Requirement 1: Customize Subject) */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onCustomizeSubject(subj);
                        }}
                        className="p-2 rounded-xl text-[#B0B0C4] hover:text-[#FFA726] hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
                        title="Customize subject (Edit name, icon, goals, or delete)"
                        aria-label={`Customize ${subj.name}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Middle: Progress Bar & Progress Percentage */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#9E9EB6] font-semibold">
                          Progress: <span className="text-[#00E676] font-bold">{subj.syllabusMasteredPercent}%</span>
                        </span>
                        <span className="text-[#9E9EB6]">
                          Target: {subj.targetHours}h
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#0A0A10] overflow-hidden border border-white/[0.08]">
                        <div
                          className="h-full rounded-full transition-all duration-500 shadow-sm"
                          style={{
                            width: `${subj.syllabusMasteredPercent}%`,
                            backgroundColor: subj.color,
                          }}
                        />
                      </div>
                    </div>

                    {/* Metrics Row: Today Study Time & Total Study Time (Exact User Spec) */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono bg-[#0A0A10] p-2.5 rounded-2xl border border-white/[0.06]">
                      <div>
                        <span className="text-[10px] text-[#9E9EB6] uppercase block">Today</span>
                        <span className="text-xs font-bold text-[#FFA726]">
                          {formatMinutesDisplay(todayMins)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9E9EB6] uppercase block">Total</span>
                        <span className="text-xs font-bold text-[#FFFFFF]">
                          {formatTimeHoursMinutes(subj.hoursStudied)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions: Open Curriculum & Focus */}
                    <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                      <button
                        onClick={() => onOpenSubjectModal(subj)}
                        className="text-xs text-[#FFA726] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Open Curriculum & Notes</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onCustomizeSubject(subj)}
                          className="py-1.5 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-[#B0B0C4] hover:text-[#FFFFFF] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          title="Edit subject"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => onStartFocusWithSubject(subj)}
                          className="py-1.5 px-3 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] border border-white/[0.12] text-xs text-[#FFFFFF] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-[#FFA726]" />
                          <span>Focus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* SUBTAB 2: MY SUBJECTS GRID */}
      {subTab === 'subjects' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-[#B0B0C4]">
              Manage curriculum units, goals, and syllabus for all active subjects.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjects.map(subj => {
              const todayMins = subj.todayStudyMinutes || 0;
              return (
                <div
                  key={subj.id}
                  className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 flex flex-col justify-between shadow-md shadow-black/40"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-black shadow-sm"
                        style={{ backgroundColor: subj.color }}
                      >
                        <SubjectIcon
                          name={subj.icon}
                          fallbackText={subj.code}
                          className="w-4 h-4 text-black"
                        />
                      </div>
                      <button
                        onClick={() => onCustomizeSubject(subj)}
                        className="p-1.5 rounded-lg text-[#9E9EB6] hover:text-[#FFA726] hover:bg-white/[0.08] transition-colors cursor-pointer"
                        title="Customize Subject"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-[#FFFFFF] mt-2.5 leading-tight">
                      {subj.name}
                    </h3>
                    {subj.description && (
                      <p className="text-[11px] text-[#9E9EB6] mt-1 line-clamp-2 leading-relaxed">
                        {subj.description}
                      </p>
                    )}

                    {/* Progress Bar & percentage */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#9E9EB6]">
                        <span>Progress: {subj.syllabusMasteredPercent}%</span>
                        <span>{subj.units.length} units</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#0A0A10] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${subj.syllabusMasteredPercent}%`,
                            backgroundColor: subj.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 p-2 bg-[#0A0A10] rounded-xl text-[11px] font-mono">
                      <div>
                        <span className="text-[9px] text-[#9E9EB6] uppercase block">Today</span>
                        <span className="font-bold text-[#FFA726]">{formatMinutesDisplay(todayMins)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#9E9EB6] uppercase block">Total</span>
                        <span className="font-bold text-[#FFFFFF]">{formatTimeHoursMinutes(subj.hoursStudied)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-white/[0.1] flex items-center justify-between">
                    <button
                      onClick={() => onOpenSubjectModal(subj)}
                      className="text-xs text-[#FFA726] font-semibold hover:underline cursor-pointer"
                    >
                      Curriculum
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onCustomizeSubject(subj)}
                        className="p-1.5 px-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs text-[#B0B0C4] hover:text-[#FFFFFF] cursor-pointer"
                        title="Edit Subject"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onStartFocusWithSubject(subj)}
                        className="py-1.5 px-3 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] border border-white/[0.1] text-xs text-[#FFFFFF] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#FFA726]" />
                        Focus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: STUDY PLANNER */}
      {subTab === 'planner' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFA726]" />
              <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
                IMPLEMENTATION INTENTIONS & INTERLEAVING
              </span>
            </div>
            <p className="text-xs text-[#B0B0C4] leading-relaxed">
              Psychological research (Gollwitzer) proves pre-deciding cues ("If time X, then action Y") doubles execution probability. Interleaving multiple subjects prevents plateauing.
            </p>

            <form onSubmit={handleAddIntention} className="p-3.5 bg-[#0A0A10] rounded-2xl border border-white/[0.1] space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-[#B0B0C4] uppercase block mb-1 font-bold">
                    Trigger Time
                  </label>
                  <input
                    type="time"
                    value={newIntentionTime}
                    onChange={e => setNewIntentionTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#13131C] border border-white/[0.1] text-xs font-mono text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#B0B0C4] uppercase block mb-1 font-bold">
                    Target Subject
                  </label>
                  <select
                    value={newIntentionSubj}
                    onChange={e => setNewIntentionSubj(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#13131C] border border-white/[0.1] text-xs text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#13131C]">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#B0B0C4] uppercase block mb-1 font-bold">
                  Concrete Execution Trigger
                </label>
                <input
                  type="text"
                  placeholder="e.g. If 7:00 PM, then sit at desk and solve 10 proofs..."
                  value={newIntentionNote}
                  onChange={e => setNewIntentionNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#13131C] border border-white/[0.1] text-xs text-[#FFFFFF] focus:outline-none focus:border-[#FFA726] placeholder:text-[#B0B0C4]/60"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#FFA726] hover:bg-[#FFB74D] text-black font-bold text-xs shadow-md shadow-[#FFA726]/30 transition-all cursor-pointer"
              >
                Schedule Implementation Intention
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {plannerBlocks.map(block => (
              <div
                key={block.id}
                onClick={() => togglePlannerItem(block.id)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  block.completed
                    ? 'bg-[#0A0A10] border-white/[0.06] opacity-60'
                    : 'bg-[#13131C] border-white/[0.12] hover:border-[#FFA726]/50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      block.completed ? 'bg-[#00E676] text-black' : 'border border-white/20'
                    }`}
                  >
                    {block.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#FFA726]">
                        {block.startTime}
                      </span>
                      <span className="text-xs font-bold text-[#FFFFFF]">
                        {block.subjectName}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${block.completed ? 'line-through text-[#9E9EB6]' : 'text-[#D0D0E2]'}`}>
                      {block.intention}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#9E9EB6]">
                  {block.durationMinutes}m
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
