import React from 'react';
import { X, Shield, BarChart3, Info, Flame, CheckCircle } from 'lucide-react';

interface ReclaimScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  breakdown: {
    focusVolumePoints: number;
    attentionRatioPoints: number;
    urgeInvariancePoints: number;
    habitPoints: number;
    total: number;
  };
}

export const ReclaimScoreModal: React.FC<ReclaimScoreModalProps> = ({
  isOpen,
  onClose,
  score,
  breakdown,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12121C] border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-black">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-[#FFA726]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FFA726]/15 border border-[#FFA726]/40 text-[#FFA726]">
              <Shield className="w-5 h-5 fill-[#FFA726]/20" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#FFA726] font-bold block">
                DETERMINISTIC METRIC
              </span>
              <h3 className="text-lg font-bold text-[#FFFFFF]">Transparent Reclaim Score™</h3>
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

        {/* Current Score Summary */}
        <div className="mt-5 p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#B0B0C4] font-medium">Current Calculated Index</div>
            <div className="text-3xl font-mono font-extrabold text-[#FFFFFF] mt-0.5">
              {score} <span className="text-sm font-normal text-[#B0B0C4]">/ 100</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-[#00E676]/15 border border-[#00E676]/40 text-[#00E676] text-xs font-mono font-bold shadow-sm shadow-[#00E676]/10">
            +5 pts vs yesterday
          </div>
        </div>

        {/* Mathematical Formula Overview */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#050508] border border-white/[0.08] text-xs">
          <div className="flex items-center gap-1.5 text-[#FFA726] font-mono uppercase text-[10px] tracking-wider font-bold mb-1.5">
            <Info className="w-3.5 h-3.5" />
            Zero Black-Box Scoring Algorithm
          </div>
          <code className="text-[11px] font-mono text-[#FFFFFF] block leading-relaxed bg-[#12121C] p-3 rounded-xl border border-white/[0.08]">
            Reclaim Score = FocusVolume(40) + AttentionSovereignty(25) + UrgeInvariance(15) + HabitDiscipline(20)
          </code>
        </div>

        {/* Breakdown Items with Elevated Contrast */}
        <div className="mt-5 space-y-3">
          {/* Factor 1 */}
          <div className="p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FFA726]" />
                <span className="text-xs font-bold text-[#FFFFFF]">1. Cognitive Focus Volume</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#FFA726]">
                {breakdown.focusVolumePoints} / 40 pts
              </span>
            </div>
            <p className="text-[11px] text-[#B0B0C4] mt-1.5 leading-relaxed">
              Calculated as <code className="text-[#FFFFFF] bg-white/[0.08] px-1.5 py-0.5 rounded font-mono">(Logged Focus Minutes ÷ Daily Target) × 40</code>. Today: 3h 42m against 4h goal (92.5% pacing).
            </p>
          </div>

          {/* Factor 2 */}
          <div className="p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-xs font-bold text-[#FFFFFF]">2. Attention Sovereignty Ratio</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#38BDF8]">
                {breakdown.attentionRatioPoints} / 25 pts
              </span>
            </div>
            <p className="text-[11px] text-[#B0B0C4] mt-1.5 leading-relaxed">
              Ratio of intentional deep work vs total passive screen time: <code className="text-[#FFFFFF] bg-white/[0.08] px-1.5 py-0.5 rounded font-mono">76.9% Controlled Attention</code>.
            </p>
          </div>

          {/* Factor 3 */}
          <div className="p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF3366]" />
                <span className="text-xs font-bold text-[#FFFFFF]">3. Urge Invariance</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#FF3366]">
                {breakdown.urgeInvariancePoints} / 15 pts
              </span>
            </div>
            <p className="text-[11px] text-[#B0B0C4] mt-1.5 leading-relaxed">
              Protects points whenever short-form impulses are intercepted by friction gates: <code className="text-[#FFFFFF] bg-white/[0.08] px-1.5 py-0.5 rounded font-mono">27 urges halted today</code>.
            </p>
          </div>

          {/* Factor 4 */}
          <div className="p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00E676]" />
                <span className="text-xs font-bold text-[#FFFFFF]">4. Habit Discipline</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#00E676]">
                {breakdown.habitPoints} / 20 pts
              </span>
            </div>
            <p className="text-[11px] text-[#B0B0C4] mt-1.5 leading-relaxed">
              Daily sovereignty routines completed: <code className="text-[#FFFFFF] bg-white/[0.08] px-1.5 py-0.5 rounded font-mono">4 of 5 habits fulfilled</code>.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-2xl bg-white/[0.1] hover:bg-white/[0.18] text-[#FFFFFF] text-xs font-bold transition-colors cursor-pointer"
        >
          Close Formula Audit
        </button>
      </div>
    </div>
  );
};
