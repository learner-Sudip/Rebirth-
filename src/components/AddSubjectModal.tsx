import React, { useState } from 'react';
import { Subject } from '../types';
import { X, BookOpen } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (subject: Subject) => void;
}

const COLOR_PALETTE = [
  '#FFA726', // Amber
  '#38BDF8', // Blue
  '#00E676', // Emerald
  '#A855F7', // Violet
  '#EC4899', // Pink
  '#FFD600', // Yellow
  '#06B6D4', // Cyan
  '#FF5722', // Deep Orange
];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAddSubject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [targetHours, setTargetHours] = useState('20');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSubject: Subject = {
      id: 'subj_' + Date.now(),
      name: name.trim(),
      code: code.trim().toUpperCase() || name.slice(0, 2).toUpperCase() + '-101',
      color: selectedColor,
      hoursStudied: 0,
      targetHours: Math.max(1, parseInt(targetHours, 10) || 20),
      dayStreak: 0,
      syllabusMasteredPercent: 0,
      units: [
        { id: 'u_' + Date.now() + '_1', title: 'Foundational Principles & Core Concepts', mastered: false },
        { id: 'u_' + Date.now() + '_2', title: 'Advanced Applications & Problem Sets', mastered: false },
      ],
      tasks: [],
      notes: [],
    };

    onAddSubject(newSubject);
    setName('');
    setCode('');
    setTargetHours('20');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12121C] border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.1]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFA726]/15 text-[#FFA726] border border-[#FFA726]/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#FFFFFF]">Add Custom Subject</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#B0B0C4] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-[11px] font-mono text-[#B0B0C4] uppercase tracking-wider block mb-1 font-bold">
              Subject Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Constitutional Law, Deep Learning"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-[#0A0A10] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726] placeholder:text-[#B0B0C4]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#B0B0C4] uppercase tracking-wider block mb-1 font-bold">
                Course Code (Optional)
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. CS-204"
                className="w-full px-3.5 py-2.5 text-xs bg-[#0A0A10] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726] placeholder:text-[#B0B0C4]/50"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-[#B0B0C4] uppercase tracking-wider block mb-1 font-bold">
                Goal (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={targetHours}
                onChange={e => setTargetHours(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0A0A10] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#B0B0C4] uppercase tracking-wider block mb-2 font-bold">
              Color Accent
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {COLOR_PALETTE.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-xl transition-transform cursor-pointer shrink-0 ${
                    selectedColor === c ? 'scale-110 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FFA726]/30 hover:opacity-95 transition-opacity cursor-pointer"
            >
              Create Subject & Syllabus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
