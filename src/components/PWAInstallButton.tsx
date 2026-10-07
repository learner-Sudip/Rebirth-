import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, show confirmation chip
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 p-3 bg-[#0A0A10] border border-[#00E676]/40 rounded-2xl text-xs text-[#00E676] font-semibold">
        <span className="w-2 h-2 rounded-full bg-[#00E676]" />
        <span>Mentis is running in sovereign standalone mode.</span>
      </div>
    );
  }

  // Chromium / Android flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FFA726]/30 active:scale-[0.98] transition-all cursor-pointer"
      >
        <Download className="w-4 h-4 stroke-[2.5]" />
        Install Mentis App on Phone
      </button>
    );
  }

  // iOS Safari flow or generic fallback
  return (
    <>
      <button
        onClick={() => setShowIOSGuide(true)}
        className="w-full py-3.5 px-4 rounded-2xl bg-[#222230] hover:bg-[#2C2C3E] border border-white/[0.12] text-[#FFFFFF] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Smartphone className="w-4 h-4 text-[#FFA726]" />
        Install on iOS / Android Home Screen
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#12121C] border border-white/[0.14] p-6 shadow-2xl text-left space-y-4 shadow-black">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.1]">
              <h3 className="text-sm font-bold text-[#FFFFFF]">Install Mentis Sovereign App</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-[#B0B0C4] hover:text-[#FFFFFF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#B0B0C4] leading-relaxed">
              <p>
                To install without an app store account:
              </p>
              <div className="p-3 bg-[#0A0A10] rounded-xl border border-white/[0.1] space-y-1.5">
                <p className="text-[#FFFFFF] font-bold">On iPhone (Safari):</p>
                <p>1. Tap the <strong className="text-[#FFFFFF]">Share</strong> button in Safari toolbar.</p>
                <p>2. Scroll down and tap <strong className="text-[#FFA726]">Add to Home Screen</strong>.</p>
              </div>
              <div className="p-3 bg-[#0A0A10] rounded-xl border border-white/[0.1] space-y-1.5">
                <p className="text-[#FFFFFF] font-bold">On Android (Chrome / Brave):</p>
                <p>1. Tap the <strong className="text-[#FFFFFF]">three dots (⋮)</strong> menu.</p>
                <p>2. Tap <strong className="text-[#FFA726]">Install app</strong> or <strong className="text-[#FFA726]">Add to Home screen</strong>.</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black text-xs font-bold cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
