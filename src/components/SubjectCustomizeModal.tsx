import React, { useState, useEffect } from 'react';
import { Subject } from '../types';
import {
  X,
  Trash2,
  AlertTriangle,
  Check,
  Target,
  FileText,
  Sliders,
  Palette,
} from 'lucide-react';
import { SubjectIcon, SUBJECT_ICON_OPTIONS } from './SubjectIcon';

interface SubjectCustomizeModalProps {
  subject: Subject | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSubject: (updated: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

const COLOR_OPTIONS = [
  { hex: '#FFA726', label: 'Amber' },
  { hex: '#00E676', label: 'Emerald' },
  { hex: '#38BDF8', label: 'Sky Blue' },
  { hex: '#A855F7', label: 'Violet' },
  { hex: '#EC4899', label: 'Pink' },
  { hex: '#FF3366', label: 'Crimson' },
  { hex: '#EAB308', label: 'Gold' },
  { hex: '#14B8A6', label: 'Teal' },
];

export const SubjectCustomizeModal: React.FC<SubjectCustomizeModalProps> = ({
  subject,
  isOpen,
  onClose,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('BookOpen');
  const [color, setColor] = useState('#FFA726');
  const [targetHours, setTargetHours] = useState(30);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(60);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(8);
  const [monthlyGoalHours, setMonthlyGoalHours] = useState(35);
  const [description, setDescription] = useState('');

  // Delete confirmation dialog state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (subject) {
      setName(subject.name || '');
      setIcon(subject.icon || 'BookOpen');
      setColor(subject.color || '#FFA726');
      setTargetHours(subject.targetHours || 30);
      setDailyGoalMinutes(subject.dailyGoalMinutes || 60);
      setWeeklyGoalHours(subject.weeklyGoalHours || 8);
      setMonthlyGoalHours(subject.monthlyGoalHours || 35);
      setDescription(subject.description || '');
      setIsConfirmingDelete(false);
    }
  }, [subject, isOpen]);

  if (!isOpen || !subject) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    const updated: Subject = {
      ...subject,
      name: name.trim(),
      icon,
      color,
      targetHours: Math.max(1, Number(targetHours)),
      dailyGoalMinutes: Math.max(5, Number(dailyGoalMinutes)),
      weeklyGoalHours: Math.max(1, Number(weeklyGoalHours)),
      monthlyGoalHours: Math.max(1, Number(monthlyGoalHours)),
      description: description.trim(),
    };

    onUpdateSubject(updated);
    onClose();
  };

  const handleConfirmDelete = () => {
    onDeleteSubject(subject.id);
    setIsConfirmingDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121A] border border-white/[0.14] rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col shadow-black">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.1]">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base text-black shadow-md shrink-0 transition-colors"
              style={{ backgroundColor: color }}
            >
              <SubjectIcon name={icon} fallbackText={subject.code} className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#FFA726] font-bold block">
                CUSTOMIZE SUBJECT · {subject.code}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#FFFFFF] leading-tight mt-0.5 truncate max-w-[240px]">
                {name || subject.name}
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Subject Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-[#B0B0C4] font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#FFA726]" />
              Subject Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Advanced Mathematics"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A10] border border-white/[0.12] text-sm text-[#FFFFFF] font-medium placeholder:text-[#9E9EB6]/50 focus:outline-none focus:border-[#FFA726] transition-colors"
            />
          </div>

          {/* Subject Icon Picker */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-[#B0B0C4] font-bold block">
              Subject Icon
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-6 gap-2">
              {SUBJECT_ICON_OPTIONS.map(opt => {
                const IconComponent = opt.icon;
                const isSelected = icon === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIcon(opt.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFA726]/20 border-[#FFA726] text-[#FFA726] shadow-sm shadow-[#FFA726]/30'
                        : 'bg-[#0A0A10] border-white/[0.08] text-[#B0B0C4] hover:text-[#FFFFFF] hover:border-white/25'
                    }`}
                    title={opt.label}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Color / Accent Picker */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-[#B0B0C4] font-bold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#FFA726]" />
              Subject Color Accent
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_OPTIONS.map(c => {
                const isSelected = color === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform cursor-pointer shadow-md ${
                      isSelected ? 'ring-2 ring-white scale-110' : 'hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {isSelected && <Check className="w-4 h-4 text-black stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Targets & Goals Section */}
          <div className="p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] space-y-3.5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#FFA726]" />
              <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
                Study Goals & Benchmarks
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Daily Goal */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold block">
                  Daily Study Goal (min)
                </label>
                <input
                  type="number"
                  min="5"
                  max="720"
                  value={dailyGoalMinutes}
                  onChange={e => setDailyGoalMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#13131C] border border-white/[0.12] text-xs font-mono text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                />
              </div>

              {/* Weekly Goal */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold block">
                  Weekly Goal (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weeklyGoalHours}
                  onChange={e => setWeeklyGoalHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#13131C] border border-white/[0.12] text-xs font-mono text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                />
              </div>

              {/* Monthly Goal */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold block">
                  Monthly Goal (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="400"
                  value={monthlyGoalHours}
                  onChange={e => setMonthlyGoalHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#13131C] border border-white/[0.12] text-xs font-mono text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                />
              </div>

              {/* Overall Target Hours */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold block">
                  Total Target (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={targetHours}
                  onChange={e => setTargetHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#13131C] border border-white/[0.12] text-xs font-mono text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                />
              </div>
            </div>
          </div>

          {/* Description / Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-[#B0B0C4] font-bold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#FFA726]" />
              Curriculum Description & Focus Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Focus on proofs, exam preparation schedule, key textbooks..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0A10] border border-white/[0.12] text-xs text-[#FFFFFF] placeholder:text-[#9E9EB6]/50 focus:outline-none focus:border-[#FFA726] resize-none"
            />
          </div>

          {/* Destructive Section: Delete Subject */}
          <div className="pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-500/40 hover:border-red-500/80 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Trash2 className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span>Delete Subject</span>
            </button>
            <p className="text-[10px] text-[#9E9EB6] text-center mt-1">
              Removes this subject and associated curriculum progress after confirmation.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/[0.1] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#1A1A24] hover:bg-[#252535] border border-white/[0.1] text-xs text-[#B0B0C4] hover:text-[#FFFFFF] font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-xs shadow-md shadow-[#FFA726]/30 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>

        {/* Delete Confirmation Dialog Modal Overlay */}
        {isConfirmingDelete && (
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-[#FFFFFF] leading-snug">
              Delete Subject?
            </h3>
            <p className="text-xs text-[#D0D0E2] mt-2 max-w-xs leading-relaxed">
              This will permanently remove <span className="text-[#FFA726] font-bold">"{subject.name}"</span> and its associated study data.
            </p>

            <div className="flex items-center gap-3 mt-6 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1A1A24] hover:bg-[#252535] border border-white/[0.12] text-xs text-[#FFFFFF] font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-[#FF3366] hover:bg-[#FF4D7D] text-white font-bold text-xs shadow-lg shadow-[#FF3366]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
