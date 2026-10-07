import React from 'react';
import { FocusSession } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Flame,
  Brain,
  ArrowRight,
  X,
} from 'lucide-react';

interface SessionSummaryModalProps {
  session: FocusSession | null;
  isOpen: boolean;
  onClose: () => void;
  onStartRecall?: (subjectName: string, subjectId: string) => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  session,
  isOpen,
  onClose,
  onStartRecall,
}) => {
  if (!isOpen || !session) return null;

  const isEarly = session.completionStatus === 'ENDED_EARLY' || session.earlyFinish;
  const planned = session.plannedDurationMinutes ?? session.durationMinutes;
  const focused = session.actualDurationMinutes ?? session.completedMinutes;
  const percentage =
    session.completionPercentage ??
    Math.min(100, Math.round((focused / Math.max(1, planned)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12121A] border border-white/[0.14] rounded-3xl p-6 shadow-2xl overflow-hidden shadow-black text-center space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#9E9EB6] hover:text-[#FFFFFF] hover:bg-white/[0.08] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
          {isEarly ? (
            <div className="w-16 h-16 rounded-2xl bg-[#FFA726]/15 border border-[#FFA726]/40 flex items-center justify-center text-[#FFA726]">
              <AlertCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/40 flex items-center justify-center text-[#00E676]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title & Status */}
        <div>
          <span
            className={`text-[10px] font-mono uppercase tracking-[0.18em] font-bold block ${
              isEarly ? 'text-[#FFA726]' : 'text-[#00E676]'
            }`}
          >
            {isEarly ? 'SESSION ENDED EARLY' : 'SESSION COMPLETED'}
          </span>
          <h2 className="text-xl font-bold text-[#FFFFFF] mt-1">
            {isEarly ? 'Partial Focus Preserved' : 'Deep Work Goal Achieved!'}
          </h2>
          <p className="text-xs text-[#C5C5DC] mt-1 font-medium">
            {session.subjectName} · {session.mode.replace('_', ' ').toUpperCase()}
          </p>
        </div>

        {/* Performance Metric Box */}
        <div className="p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] space-y-3 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9E9EB6] font-mono">Planned:</span>
            <span className="font-mono font-bold text-[#FFFFFF]">{planned} min</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9E9EB6] font-mono">Focused:</span>
            <span
              className={`font-mono font-bold ${
                isEarly ? 'text-[#FFA726]' : 'text-[#00E676]'
              }`}
            >
              {focused} min
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.08]">
            <span className="text-[#9E9EB6] font-mono">Completion:</span>
            <span className="font-mono font-bold text-[#FFFFFF] text-sm">
              {percentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-[#181824] overflow-hidden border border-white/[0.08]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isEarly
                  ? 'bg-gradient-to-r from-[#FFA726] to-[#FFB74D]'
                  : 'bg-gradient-to-r from-[#00E676] to-[#69F0AE]'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
            />
          </div>
        </div>

        {/* Focus Goal & Stats Pills */}
        {session.milestone && (
          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left text-xs text-[#D0D0E2]">
            <span className="text-[10px] font-mono uppercase text-[#FFA726] font-bold block mb-0.5">
              Target Goal:
            </span>
            <p className="line-clamp-2 italic">"{session.milestone}"</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="p-2.5 rounded-xl bg-[#0A0A10] border border-white/[0.08] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FFA726]" />
            <div>
              <span className="text-[9px] font-mono text-[#9E9EB6] uppercase block">
                XP Earned
              </span>
              <span className="text-xs font-mono font-bold text-[#FFFFFF]">
                +{session.xpEarned} XP
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0A0A10] border border-white/[0.08] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00E676]" />
            <div>
              <span className="text-[9px] font-mono text-[#9E9EB6] uppercase block">
                Shield Held
              </span>
              <span className="text-xs font-mono font-bold text-[#00E676]">
                {session.urgesBlocked} urges
              </span>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="pt-2 flex flex-col gap-2">
          {!isEarly && onStartRecall && (
            <button
              onClick={() => {
                onClose();
                onStartRecall(session.subjectName, session.subjectId);
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#38BDF8]/30 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <Brain className="w-4 h-4" />
              <span>Launch Active Recall Quiz</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-[#1A1A24] hover:bg-[#252535] border border-white/[0.12] text-xs text-[#FFFFFF] font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
