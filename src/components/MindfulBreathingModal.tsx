import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Wind } from 'lucide-react';
import { storageService } from '../services/storage';
import { audioEngine } from '../services/audioEngine';

interface MindfulBreathingModalProps {
  isOpen: boolean;
  onClose: (completed: boolean) => void;
}

export const MindfulBreathingModal: React.FC<MindfulBreathingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold (Still)' | 'Exhale' | 'Hold (Rest)'>('Inhale');

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(60);
      setBreathPhase('Inhale');
      return;
    }

    // Play serene reset chime
    audioEngine.playBell('reset');

    // 1-second countdown
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          audioEngine.playBell('complete');
          storageService.addShieldEvent({
            id: 'se_' + Date.now(),
            timestamp: new Date().toISOString(),
            appName: 'Mindful Reset',
            type: 'urge_blocked',
            details: '60s Mindful Reset completed — attention sovereignty restored',
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 4-4-4-4 Box breathing rhythm
    const phases: Array<'Inhale' | 'Hold (Still)' | 'Exhale' | 'Hold (Rest)'> = [
      'Inhale',
      'Hold (Still)',
      'Exhale',
      'Hold (Rest)',
    ];
    let step = 0;
    const phaseInterval = setInterval(() => {
      step = (step + 1) % 4;
      setBreathPhase(phases[step]);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(phaseInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isFinished = secondsRemaining === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12121C] border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-2xl text-center overflow-hidden shadow-black">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#FFA726]/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => onClose(isFinished)}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#B0B0C4] hover:text-[#FFFFFF] hover:bg-white/[0.08] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFA726]/15 border border-[#FFA726]/40 text-[#FFA726] text-xs font-mono uppercase tracking-widest mb-2 font-bold shadow-sm shadow-[#FFA726]/10">
          <Wind className="w-3.5 h-3.5" />
          COGNITIVE RESET PROTOCOL
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] tracking-tight">
          60-Second Mindful Breathing
        </h2>
        <p className="text-xs text-[#B0B0C4] mt-1 max-w-xs mx-auto leading-relaxed">
          Dissolve the distraction impulse. Box breathing resets prefrontal cortex executive control.
        </p>

        {/* Dynamic Expanding/Contracting Orb */}
        <div className="my-8 relative flex flex-col items-center justify-center h-52">
          <div
            className={`w-44 h-44 rounded-full border border-[#FFA726]/50 flex flex-col items-center justify-center transition-all duration-1000 ${
              breathPhase === 'Inhale'
                ? 'scale-110 bg-[#FFA726]/25 shadow-[0_0_55px_rgba(255,167,38,0.5)]'
                : breathPhase.startsWith('Hold')
                ? 'scale-105 bg-[#00E676]/25 shadow-[0_0_40px_rgba(0,230,118,0.4)]'
                : 'scale-90 bg-[#0A0A10] shadow-[0_0_20px_rgba(255,255,255,0.08)]'
            }`}
          >
            {isFinished ? (
              <CheckCircle2 className="w-14 h-14 text-[#00E676] animate-bounce" />
            ) : (
              <>
                <span className="text-4xl font-mono font-extrabold text-[#FFFFFF]">
                  {secondsRemaining}s
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-[#FFA726] mt-1 font-bold">
                  {breathPhase}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Advice guidance */}
        <div className="p-3.5 bg-[#0A0A10] border border-white/[0.1] rounded-2xl text-xs text-[#B0B0C4]">
          {isFinished ? (
            <span className="text-[#00E676] font-bold flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Sovereignty Restored · Urge Halted +1 Logged
            </span>
          ) : (
            <span>Feel your diaphragm expand. Let the wandering thought drift away without attachment.</span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <button
            onClick={() => onClose(isFinished)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity shadow-lg shadow-[#FFA726]/30 cursor-pointer"
          >
            {isFinished ? 'Complete Reset (+1 Urge Halted)' : 'End Early'}
          </button>
        </div>
      </div>
    </div>
  );
};
