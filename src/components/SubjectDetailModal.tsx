import React, { useState } from 'react';
import { Subject, UnitMastery, SubjectTask, SubjectNote } from '../types';
import {
  X,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Brain,
} from 'lucide-react';
import { storageService } from '../services/storage';
import { SubjectIcon } from './SubjectIcon';

interface SubjectDetailModalProps {
  subject: Subject | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSubject: (updated: Subject) => void;
  onStartFocus: (subject: Subject) => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  subject,
  isOpen,
  onClose,
  onUpdateSubject,
  onStartFocus,
}) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'tasks' | 'feynman' | 'analytics'>('syllabus');
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [feynmanExplanation, setFeynmanExplanation] = useState('');
  const [feynmanConcept, setFeynmanConcept] = useState('');
  const [showFeynmanForm, setShowFeynmanForm] = useState(false);

  if (!isOpen || !subject) return null;

  const toggleUnitMastery = (unitId: string) => {
    const updatedUnits = subject.units.map(u =>
      u.id === unitId ? { ...u, mastered: !u.mastered } : u
    );
    const masteredCount = updatedUnits.filter(u => u.mastered).length;
    const newPercent = Math.round((masteredCount / Math.max(1, updatedUnits.length)) * 100);

    const updated = {
      ...subject,
      units: updatedUnits,
      syllabusMasteredPercent: newPercent,
    };
    onUpdateSubject(updated);
  };

  const handleAddUnit = () => {
    if (!newUnitTitle.trim()) return;
    const newUnit: UnitMastery = {
      id: 'u_' + Date.now(),
      title: newUnitTitle.trim(),
      mastered: false,
    };
    const updatedUnits = [...subject.units, newUnit];
    const masteredCount = updatedUnits.filter(u => u.mastered).length;
    const newPercent = Math.round((masteredCount / updatedUnits.length) * 100);

    const updated = {
      ...subject,
      units: updatedUnits,
      syllabusMasteredPercent: newPercent,
    };
    onUpdateSubject(updated);
    setNewUnitTitle('');
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = subject.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdateSubject({ ...subject, tasks: updatedTasks });
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: SubjectTask = {
      id: 't_' + Date.now(),
      title: newTaskTitle.trim(),
      dueDate: 'Upcoming',
      completed: false,
    };
    onUpdateSubject({
      ...subject,
      tasks: [...subject.tasks, newTask],
    });
    setNewTaskTitle('');
  };

  const handleSaveFeynmanNote = () => {
    if (!feynmanConcept.trim() || !feynmanExplanation.trim()) return;
    const newNote: SubjectNote = {
      id: 'n_' + Date.now(),
      title: `Feynman: ${feynmanConcept.trim()}`,
      content: feynmanExplanation.trim(),
      type: 'feynman',
      updatedAt: new Date().toISOString(),
    };
    onUpdateSubject({
      ...subject,
      notes: [newNote, ...subject.notes],
    });
    setFeynmanConcept('');
    setFeynmanExplanation('');
    setShowFeynmanForm(false);
  };

  const sessions = storageService.getSessions().filter(s => s.subjectId === subject.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121C] border border-white/[0.14] rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col shadow-black">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.1]">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base text-black shadow-sm shrink-0"
              style={{ backgroundColor: subject.color }}
            >
              <SubjectIcon name={subject.icon} fallbackText={subject.code} className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#FFA726] font-bold block">
                {subject.code} · {subject.dayStreak}d STREAK 🔥
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#FFFFFF] leading-tight mt-0.5">
                {subject.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#B0B0C4] hover:text-[#FFFFFF] hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pacing Overview Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] text-[#B0B0C4] font-medium">Studied Pacing</div>
            <div className="text-lg font-mono font-bold text-[#FFFFFF]">
              {subject.hoursStudied.toFixed(1)}h{' '}
              <span className="text-xs text-[#B0B0C4] font-normal">/ {subject.targetHours}h goal</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-[#B0B0C4] font-medium">Syllabus Mastered</div>
            <div className="text-lg font-mono font-bold text-[#00E676]">
              {subject.syllabusMasteredPercent}%
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onStartFocus(subject);
            }}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-xs shadow-md shadow-[#FFA726]/30 flex items-center gap-1.5 hover:opacity-95 transition-opacity cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
            Focus Now
          </button>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#0A0A10] rounded-xl my-4 border border-white/[0.1] shrink-0 overflow-x-auto shadow-sm">
          {[
            { id: 'syllabus', label: 'Units & Syllabus' },
            { id: 'tasks', label: `Tasks (${subject.tasks.filter(t => !t.completed).length})` },
            { id: 'feynman', label: 'Feynman Notes' },
            { id: 'analytics', label: 'Sessions' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#222230] text-[#FFA726] font-bold shadow-sm shadow-black/40 border border-white/[0.1]'
                  : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Tab Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* TAB 1: SYLLABUS UNITS */}
          {activeTab === 'syllabus' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#B0B0C4]">
                <span>Check off units as conceptual mastery is proven</span>
                <span className="font-mono text-[#FFA726] font-bold">
                  {subject.units.filter(u => u.mastered).length} / {subject.units.length} Mastered
                </span>
              </div>

              <div className="space-y-2">
                {subject.units.map(unit => (
                  <div
                    key={unit.id}
                    onClick={() => toggleUnitMastery(unit.id)}
                    className="p-3.5 rounded-xl bg-[#0A0A10] border border-white/[0.1] hover:border-white/20 flex items-center gap-3 cursor-pointer transition-colors shadow-sm"
                  >
                    {unit.mastered ? (
                      <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#B0B0C4] shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        unit.mastered
                          ? 'text-[#B0B0C4] line-through font-normal'
                          : 'text-[#FFFFFF] font-semibold'
                      }`}
                    >
                      {unit.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Unit input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newUnitTitle}
                  onChange={e => setNewUnitTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddUnit()}
                  placeholder="Add syllabus unit or concept..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-[#0A0A10] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726] placeholder:text-[#B0B0C4]/50"
                />
                <button
                  onClick={handleAddUnit}
                  className="px-3.5 py-2.5 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] border border-white/[0.1] text-xs font-semibold text-[#FFFFFF] cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="space-y-2">
                {subject.tasks.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#B0B0C4]">
                    No pending tasks for this subject.
                  </div>
                ) : (
                  subject.tasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="p-3.5 rounded-xl bg-[#0A0A10] border border-white/[0.1] flex items-center justify-between cursor-pointer shadow-sm hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#00E676]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#B0B0C4]" />
                        )}
                        <span
                          className={`text-xs ${
                            task.completed ? 'line-through text-[#B0B0C4]' : 'text-[#FFFFFF] font-semibold'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#B0B0C4]">{task.dueDate}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                  placeholder="Add study task or problem set..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-[#0A0A10] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726] placeholder:text-[#B0B0C4]/50"
                />
                <button
                  onClick={handleAddTask}
                  className="px-3.5 py-2.5 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] border border-white/[0.1] text-xs font-semibold text-[#FFFFFF] cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FEYNMAN TECHNIQUE ("Teach It Back") */}
          {activeTab === 'feynman' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FFA726]/10 border border-[#FFA726]/30 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#FFA726]">
                  <Brain className="w-4 h-4" />
                  The Feynman Technique: "Teach It Back"
                </div>
                <p className="text-[11px] text-[#B0B0C4] mt-1 leading-relaxed">
                  Explain a concept in plain English as if explaining to a 10-year-old. Wherever you rely on jargon, you identify an epistemic blindspot.
                </p>
              </div>

              {!showFeynmanForm ? (
                <button
                  onClick={() => setShowFeynmanForm(true)}
                  className="w-full py-3 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] border border-white/[0.1] text-xs font-semibold text-[#FFA726] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New "Teach It Back" Note
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.12] space-y-3 shadow-sm">
                  <input
                    type="text"
                    value={feynmanConcept}
                    onChange={e => setFeynmanConcept(e.target.value)}
                    placeholder="Concept name (e.g., Markov Chains, Gradient Descent)..."
                    className="w-full px-3.5 py-2 text-xs bg-[#12121C] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                  />
                  <textarea
                    value={feynmanExplanation}
                    onChange={e => setFeynmanExplanation(e.target.value)}
                    rows={4}
                    placeholder="Explain it simply without technical jargon. Use analogies..."
                    className="w-full p-3 text-xs bg-[#12121C] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowFeynmanForm(false)}
                      className="px-3.5 py-1.5 text-xs text-[#B0B0C4] hover:text-[#FFFFFF] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveFeynmanNote}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black text-xs font-bold cursor-pointer"
                    >
                      Save Feynman Note
                    </button>
                  </div>
                </div>
              )}

              {/* List of notes */}
              <div className="space-y-2 mt-2">
                {subject.notes.map(note => (
                  <div key={note.id} className="p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1]">
                    <span className="text-[10px] font-mono uppercase text-[#FFA726] font-bold block">
                      {note.type === 'feynman' ? 'FEYNMAN TEACH-BACK' : 'NOTE'}
                    </span>
                    <h4 className="text-xs font-bold text-[#FFFFFF] mt-0.5">{note.title}</h4>
                    <p className="text-xs text-[#B0B0C4] mt-1.5 leading-relaxed bg-[#12121C] p-3 rounded-xl border border-white/[0.08]">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SESSIONS */}
          {activeTab === 'analytics' && (
            <div className="space-y-3">
              <span className="text-xs text-[#B0B0C4] block">
                Logged sessions for {subject.name}:
              </span>
              {sessions.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#B0B0C4]">
                  No sessions logged for this subject yet.
                </div>
              ) : (
                sessions.map(sess => (
                  <div key={sess.id} className="p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#FFFFFF]">{sess.method}</span>
                      <span className="font-mono text-[#FFA726] font-bold">{sess.completedMinutes}m logged</span>
                    </div>
                    {sess.milestone && (
                      <p className="text-[11px] text-[#B0B0C4]">Milestone: {sess.milestone}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#B0B0C4] pt-1.5 border-t border-white/[0.08]">
                      <span>+{sess.xpEarned} XP</span>
                      <span>·</span>
                      <span>{sess.urgesBlocked} Urges Resisted</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
