import React, { useState } from 'react';
import { LiveFocusRoom } from '../types';
import { X, Sparkles, Clock, Compass, Check, Play, BookOpen } from 'lucide-react';

interface LiveFocusRoomModalProps {
  room: LiveFocusRoom | null;
  isOpen: boolean;
  onClose: () => void;
  isOnline?: boolean;
  onApplyPreset?: (room: LiveFocusRoom) => void;
}

export const LiveFocusRoomModal: React.FC<LiveFocusRoomModalProps> = ({
  room,
  isOpen,
  onClose,
  onApplyPreset,
}) => {
  const [personalIntention, setPersonalIntention] = useState('');
  const [savedIntention, setSavedIntention] = useState(false);

  if (!isOpen || !room) return null;

  const handleSaveIntention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalIntention.trim()) return;
    setSavedIntention(true);
    setTimeout(() => setSavedIntention(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121A] border border-white/[0.14] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] shadow-black text-left">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-white/[0.1]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FFA726]/15 border border-[#FFA726]/40 text-[#FFA726]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#FFA726] font-bold block">
                PERSONAL FOCUS SANCTUARY
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#FFFFFF] leading-tight mt-0.5">
                {room.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#B0B0C4] hover:text-[#FFFFFF] hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Environmental Overview */}
        <div className="py-4 space-y-4 flex-1 overflow-y-auto pr-1">
          <p className="text-xs text-[#D0D0E2] leading-relaxed">
            {room.description}
          </p>

          <div className="p-3.5 rounded-2xl bg-[#0A0A10] border border-white/[0.1] grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#9E9EB6] font-bold block">
                ENVIRONMENT PACING
              </span>
              <span className="font-semibold text-[#FFFFFF] font-mono mt-0.5 block">
                {room.currentPace}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#9E9EB6] font-bold block">
                INTENTION FOCUS
              </span>
              <span className="text-xs text-[#38BDF8] font-semibold mt-0.5 block">
                {room.topic}
              </span>
            </div>
          </div>

          {/* Solitary Session Intention (Saved purely on device) */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-[#B0B0C4] font-bold block">
              Personal Session Intention (Saved to Device)
            </label>
            <form onSubmit={handleSaveIntention} className="space-y-2">
              <textarea
                rows={2}
                value={personalIntention}
                onChange={e => setPersonalIntention(e.target.value)}
                placeholder="What single hard cognitive challenge will you conquer in this session?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A10] border border-white/[0.12] text-xs text-[#FFFFFF] placeholder:text-[#9E9EB6]/50 focus:outline-none focus:border-[#FFA726] resize-none"
              />
              {savedIntention && (
                <div className="flex items-center gap-1.5 text-xs text-[#00E676] font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Intention anchored to current session.</span>
                </div>
              )}
            </form>
          </div>

          <div className="p-3 rounded-2xl bg-[#13131C] border border-white/[0.08] space-y-1 text-[11px] text-[#9E9EB6]">
            <p className="text-[#00E676] font-semibold">✓ 100% Solitary & Offline</p>
            <p>No external network requests or remote presence beacons.</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/[0.1] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#1A1A24] hover:bg-[#252535] text-xs text-[#B0B0C4] font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyPreset?.(room);
              onClose();
            }}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-xs shadow-md shadow-[#FFA726]/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Apply Sanctuary Pace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
