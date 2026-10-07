import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Terminal,
  FileCode,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface AndroidApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkGuideModal: React.FC<AndroidApkGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState<'pwa' | 'studio' | 'gradle'>('pwa');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const gradleCode = `cd android
./gradlew assembleDebug
# Generated APK will be saved at:
# android/app/build/outputs/apk/debug/app-debug.apk`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gradleCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121A] border border-white/[0.16] rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col shadow-black text-left">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-white/[0.1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E676]/20 border border-[#00E676]/40 flex items-center justify-center text-[#00E676] shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#00E676] font-bold block">
                ANDROID DEPLOYMENT HUB
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#FFFFFF] leading-tight">
                Install on Your Android Phone
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

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0A0A10] rounded-2xl my-3 border border-white/[0.08]">
          <button
            onClick={() => setActiveStep('pwa')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeStep === 'pwa'
                ? 'bg-[#1F1F2C] text-[#00E676] font-bold border border-[#00E676]/30 shadow-sm'
                : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
            }`}
          >
            1. Direct Phone
          </button>
          <button
            onClick={() => setActiveStep('studio')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeStep === 'studio'
                ? 'bg-[#1F1F2C] text-[#FFA726] font-bold border border-[#FFA726]/30 shadow-sm'
                : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
            }`}
          >
            2. Android Studio
          </button>
          <button
            onClick={() => setActiveStep('gradle')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeStep === 'gradle'
                ? 'bg-[#1F1F2C] text-[#38BDF8] font-bold border border-[#38BDF8]/30 shadow-sm'
                : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
            }`}
          >
            3. CLI / Gradle
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {activeStep === 'pwa' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                <p className="text-[#D0D0E2] leading-relaxed">
                  <strong className="text-[#00E676]">Recommended for immediate personal use:</strong> Installs an official Android WebAPK directly onto your device launcher. Zero compilation required.
                </p>
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl bg-[#0A0A10] border border-white/[0.08]">
                <h4 className="font-bold text-[#FFFFFF] text-sm">How to install directly:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-[#B0B0C4] leading-relaxed">
                  <li>Open this app URL in <strong className="text-[#FFFFFF]">Chrome, Brave, or Samsung Internet</strong> on your phone.</li>
                  <li>Tap the <strong className="text-[#FFA726]">"Install Mentis App on Phone"</strong> button in this tab.</li>
                  <li>Alternatively, tap browser menu (<strong className="text-[#FFFFFF]">⋮</strong>) → <strong className="text-[#FFA726]">"Install app"</strong> or <strong className="text-[#FFA726]">"Add to Home screen"</strong>.</li>
                  <li>Android automatically creates an app icon in your app drawer that opens fullscreen without browser bars.</li>
                </ol>
              </div>

              <div className="p-3 rounded-2xl bg-[#13131C] border border-white/[0.08] space-y-1 font-mono text-[11px] text-[#00E676]">
                <p>✓ 100% Offline asset caching</p>
                <p>✓ Fullscreen standalone display mode</p>
                <p>✓ Hardware accelerated WebAudio and timer engines</p>
              </div>
            </div>
          )}

          {activeStep === 'studio' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#FFA726]/10 border border-[#FFA726]/30 flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-[#FFA726] shrink-0 mt-0.5" />
                <p className="text-[#D0D0E2] leading-relaxed">
                  A turnkey, native Kotlin Android shell project is provided in <code className="text-[#FFA726] font-mono">/android</code> with <code className="text-[#FFA726] font-mono">MainActivity.kt</code>, <code className="text-[#FFA726] font-mono">FocusForegroundService.kt</code>, and <code className="text-[#FFA726] font-mono">FocusAccessibilityService.kt</code>.
                </p>
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl bg-[#0A0A10] border border-white/[0.08]">
                <h4 className="font-bold text-[#FFFFFF] text-sm">Build in Android Studio:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-[#B0B0C4] leading-relaxed">
                  <li>Download or open the project folder in <strong className="text-[#FFFFFF]">Android Studio</strong>.</li>
                  <li>Select <strong className="text-[#FFFFFF]">File → Open</strong> and choose the <code className="text-[#FFA726]">android/</code> directory.</li>
                  <li>Wait for Gradle sync to complete (SDK 34 / Android 14).</li>
                  <li>Click <strong className="text-[#FFFFFF]">Build → Build Bundle(s) / APK(s) → Build APK(s)</strong>.</li>
                  <li>Locate the output APK in <code className="text-[#FFA726]">android/app/build/outputs/apk/debug/app-debug.apk</code>.</li>
                  <li>Install directly on your phone via USB or file manager!</li>
                </ol>
              </div>

              <div className="p-3 bg-[#0A0A10] rounded-xl border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono text-[#9E9EB6] uppercase font-bold block">Native Components Included:</span>
                <p className="text-[#D0D0E2] font-mono text-[11px]">• MainActivity.kt (Hardware-accelerated WebView & Bridge)</p>
                <p className="text-[#D0D0E2] font-mono text-[11px]">• FocusForegroundService.kt (System tray notification countdown)</p>
                <p className="text-[#D0D0E2] font-mono text-[11px]">• FocusAccessibilityService.kt (On-device app blocker)</p>
              </div>
            </div>
          )}

          {activeStep === 'gradle' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-start gap-2.5">
                <Terminal className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <p className="text-[#D0D0E2] leading-relaxed">
                  Build the APK via command line using the included Gradle build scripts.
                </p>
              </div>

              <div className="relative p-3.5 bg-[#0A0A10] rounded-2xl border border-white/[0.1] font-mono text-xs text-[#00E676] overflow-x-auto">
                <pre>{gradleCode}</pre>
                <button
                  onClick={handleCopyCode}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-[#1F1F2C] border border-white/[0.1] text-[#FFFFFF] hover:text-[#FFA726] transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0A0A10] border border-white/[0.08] space-y-1 text-[#B0B0C4] leading-relaxed">
                <p><strong className="text-[#FFFFFF]">Install to connected phone via ADB:</strong></p>
                <code className="text-[#FFA726] font-mono block mt-1">adb install app/build/outputs/apk/debug/app-debug.apk</code>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.1] flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#00E676]">
            ● Private & Offline-First
          </span>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black font-bold text-xs shadow-md shadow-[#FFA726]/30 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
