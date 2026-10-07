import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft, Unlock, Flame, CheckCircle2, AlertOctagon } from 'lucide-react';
import { storageService } from '../services/storage';
import { audioEngine } from '../services/audioEngine';

interface KinesisInterceptModalProps {
  isOpen: boolean;
  appName: string;
  onClose: (urgeHalted: boolean) => void;
  onUnlocked: () => void;
}

export const KinesisInterceptModal: React.FC<KinesisInterceptModalProps> = ({
  isOpen,
  appName,
  onClose,
  onUnlocked,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [showTypedBypass, setShowTypedBypass] = useState(false);
  const settings = storageService.getSettings();

  const requiredPhrase = 'I consciously choose to interrupt my cognitive flow';

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(30);
      setTypedConfirmation('');
      setShowTypedBypass(false);
      return;
    }

    // Play subtle alert tone
    audioEngine.playBell('reset');

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const breathInterval = setInterval(() => {
      setBreathPhase(curr => {
        if (curr === 'Inhale') return 'Hold';
        if (curr === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(breathInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReturnToSovereignty = () => {
    // Log urge halted event
    storageService.addShieldEvent({
      id: 'se_' + Date.now(),
      timestamp: new Date().toISOString(),
      appName: appName || 'Distracting App',
      type: 'urge_blocked',
      details: 'Mindful friction intercept held — Urge conquered',
    });
    audioEngine.playBell('complete');
    onClose(true);
  };

  const handleFocusBankUnlock = () => {
    if (settings.focusBankBalanceMinutes >= 15) {
      settings.focusBankBalanceMinutes -= 15;
      storageService.saveSettings(settings);
      storageService.addShieldEvent({
        id: 'se_' + Date.now(),
        timestamp: new Date().toISOString(),
        appName: appName || 'App',
        type: 'friction_unlocked',
        details: '15m Earn Your Scroll Focus Bank credit applied',
      });
      onUnlocked();
    }
  };

  const handleTypedBypassUnlock = () => {
    if (typedConfirmation.trim().toLowerCase() === requiredPhrase.toLowerCase()) {
      storageService.addShieldEvent({
        id: 'se_' + Date.now(),
        timestamp: new Date().toISOString(),
        appName: appName || 'App',
        type: 'friction_unlocked',
        details: 'Emergency typed friction confirmed',
      });
      onUnlocked();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12121C] border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-center shadow-black">
        {/* Subtle Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#FF3366]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Intercept Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF3366]/15 border border-[#FF3366]/50 text-[#FF3366] text-xs font-mono uppercase tracking-widest mb-3 font-bold shadow-sm shadow-[#FF3366]/20">
          <ShieldAlert className="w-3.5 h-3.5 text-[#FF3366]" />
          KINESIS INTERCEPT
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] tracking-tight">
          Attention Barrier Engaged
        </h2>
        <p className="text-xs text-[#B0B0C4] mt-1 max-w-xs mx-auto leading-relaxed">
          {appName ? `${appName} is locked` : 'Distraction shield active'}. Your sovereign focus is guarded under Mentis protocols.
        </p>

        {/* Urge Halted Counter Card */}
        <div className="mt-4 p-3 bg-[#0A0A10] border border-white/[0.1] rounded-2xl flex items-center justify-center gap-2">
          <Flame className="w-4 h-4 text-[#FFA726]" />
          <span className="text-xs font-mono text-[#FFA726] uppercase tracking-wider font-bold">
            Urge Halted +1 Ready
          </span>
          <span className="text-xs text-[#B0B0C4]">· 843 Conquered Total</span>
        </div>

        {/* Breathing Circle / Friction Gate */}
        <div className="my-6 relative flex flex-col items-center justify-center">
          <div
            className={`w-36 h-36 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 ${
              breathPhase === 'Inhale'
                ? 'scale-110 border-[#FFA726] bg-[#FFA726]/15 shadow-[0_0_35px_rgba(255,167,38,0.4)]'
                : breathPhase === 'Hold'
                ? 'scale-105 border-[#00E676] bg-[#00E676]/15 shadow-[0_0_25px_rgba(0,230,118,0.4)]'
                : 'scale-95 border-white/20 bg-[#0A0A10]'
            }`}
          >
            <span className="text-3xl font-mono font-extrabold text-[#FFFFFF]">
              {secondsLeft > 0 ? `${secondsLeft}s` : <CheckCircle2 className="w-9 h-9 text-[#00E676]" />}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#FFA726] mt-0.5 font-bold">
              {secondsLeft > 0 ? breathPhase : 'Ready'}
            </span>
          </div>
          <p className="text-xs text-[#B0B0C4] mt-3 font-medium">
            {secondsLeft > 0 ? 'Observe the impulse without acting upon it.' : 'Friction timer fulfilled.'}
          </p>
        </div>

        {/* Primary Action: Return to Sovereignty */}
        <button
          onClick={handleReturnToSovereignty}
          className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FFA726]/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          Return to Sovereignty (+1 Urge Halted)
        </button>

        {/* Secondary Options */}
        <div className="mt-4 pt-4 border-t border-white/[0.1] space-y-2.5">
          {settings.enforcementLevel === 'strict' && (
            <div className="p-3 rounded-xl bg-[#FF3366]/15 border border-[#FF3366]/40 text-[#FF3366] text-[11px] flex items-center justify-center gap-2 font-semibold">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>Strict Mode: Unlocks notify ally ({settings.allyEmail})</span>
            </div>
          )}

          {/* Focus Bank Credit Unlock */}
          {settings.focusBankBalanceMinutes >= 15 && (
            <button
              onClick={handleFocusBankUnlock}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0A0A10] hover:bg-[#1A1A24] border border-white/[0.12] text-xs font-bold text-[#FFFFFF] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Spend 15m Focus Bank Credit ({settings.focusBankBalanceMinutes}m left)</span>
            </button>
          )}

          {/* Emergency Typed Friction Gate */}
          {!showTypedBypass ? (
            <button
              onClick={() => setShowTypedBypass(true)}
              disabled={secondsLeft > 0}
              className={`text-[11px] font-mono tracking-wide underline underline-offset-4 transition-colors cursor-pointer ${
                secondsLeft > 0 ? 'text-[#B0B0C4]/40 cursor-not-allowed' : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
              }`}
            >
              Emergency access override (requires typing confirmation)
            </button>
          ) : (
            <div className="p-3.5 bg-[#0A0A10] border border-white/[0.12] rounded-2xl text-left space-y-2 shadow-sm">
              <p className="text-[11px] text-[#B0B0C4]">
                Type exact phrase to confirm conscious bypass:
              </p>
              <div className="text-[10px] font-mono text-[#FFA726] select-none p-2 bg-[#050508] rounded-lg border border-white/[0.1] font-bold">
                "{requiredPhrase}"
              </div>
              <input
                type="text"
                value={typedConfirmation}
                onChange={e => setTypedConfirmation(e.target.value)}
                placeholder="Type confirmation here..."
                className="w-full px-3 py-2 text-xs bg-[#12121C] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
              />
              <button
                onClick={handleTypedBypassUnlock}
                disabled={typedConfirmation.trim().toLowerCase() !== requiredPhrase.toLowerCase()}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typedConfirmation.trim().toLowerCase() === requiredPhrase.toLowerCase()
                    ? 'bg-[#FF3366] text-white hover:bg-[#ff1f57] shadow-lg shadow-[#FF3366]/30'
                    : 'bg-white/[0.05] text-[#B0B0C4]/50 cursor-not-allowed'
                }`}
              >
                Confirm Emergency Unlock
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
