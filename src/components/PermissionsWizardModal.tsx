import React, { useState } from 'react';
import { X, Shield, Cpu, Bell, BatteryCharging, Smartphone } from 'lucide-react';
import { storageService } from '../services/storage';

interface PermissionsWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestIntercept: () => void;
}

export const PermissionsWizardModal: React.FC<PermissionsWizardModalProps> = ({
  isOpen,
  onClose,
  onTestIntercept,
}) => {
  const [settings, setSettings] = useState(storageService.getSettings());
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');

  if (!isOpen) return null;

  const togglePermission = (key: keyof typeof settings.permissions) => {
    const updated = {
      ...settings,
      permissions: {
        ...settings.permissions,
        [key]: !settings.permissions[key],
      },
    };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12121C] border border-white/[0.14] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] shadow-black">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.1]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/40 text-[#00E676]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#00E676] font-bold block">
                DIAGNOSTICS & SYSTEM INTEGRITY
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#FFFFFF] leading-tight mt-0.5">
                Distraction Shield Permissions
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

        {/* Platform Selector */}
        <div className="flex items-center gap-2 p-1 bg-[#0A0A10] rounded-xl my-3 border border-white/[0.1]">
          <button
            onClick={() => setPlatform('android')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              platform === 'android'
                ? 'bg-[#222230] text-[#FFA726] font-bold shadow-sm border border-white/[0.1]'
                : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
            }`}
          >
            Android APK Architecture
          </button>
          <button
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              platform === 'ios'
                ? 'bg-[#222230] text-[#FFA726] font-bold shadow-sm border border-white/[0.1]'
                : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
            }`}
          >
            iOS Screen Time API
          </button>
        </div>

        {/* Permissions list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-1">
          {platform === 'android' ? (
            <>
              {/* Item 1: PACKAGE_USAGE_STATS */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] flex items-start justify-between gap-3 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#FFA726]" />
                    <span className="text-xs font-bold text-[#FFFFFF]">Usage Access Telemetry</span>
                  </div>
                  <code className="text-[10px] font-mono text-[#FFA726] block font-semibold">
                    PACKAGE_USAGE_STATS · UsageStatsManager
                  </code>
                  <p className="text-[11px] text-[#B0B0C4] leading-relaxed">
                    Detects foreground applications to accurately enforce daily app limits.
                  </p>
                </div>
                <button
                  onClick={() => togglePermission('usageStats')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    settings.permissions.usageStats
                      ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/40'
                      : 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/40'
                  }`}
                >
                  {settings.permissions.usageStats ? 'Granted' : 'Grant'}
                </button>
              </div>

              {/* Item 2: AccessibilityService & System Alert */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] flex items-start justify-between gap-3 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#FF3366]" />
                    <span className="text-xs font-bold text-[#FFFFFF]">Kinesis Intercept Overlay</span>
                  </div>
                  <code className="text-[10px] font-mono text-[#FF3366] block font-semibold">
                    AccessibilityService + SYSTEM_ALERT_WINDOW
                  </code>
                  <p className="text-[11px] text-[#B0B0C4] leading-relaxed">
                    Triggers the 30-second mindful-friction gate instantaneously when a locked app or short-form feed is launched.
                  </p>
                </div>
                <button
                  onClick={() => togglePermission('accessibility')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    settings.permissions.accessibility
                      ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/40'
                      : 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/40'
                  }`}
                >
                  {settings.permissions.accessibility ? 'Active' : 'Enable'}
                </button>
              </div>

              {/* Item 3: SCHEDULE_EXACT_ALARM */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] flex items-start justify-between gap-3 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#38BDF8]" />
                    <span className="text-xs font-bold text-[#FFFFFF]">Exact Alarm & Boot Rescheduler</span>
                  </div>
                  <code className="text-[10px] font-mono text-[#38BDF8] block font-semibold">
                    SCHEDULE_EXACT_ALARM + RECEIVE_BOOT_COMPLETED
                  </code>
                  <p className="text-[11px] text-[#B0B0C4] leading-relaxed">
                    Bypasses Doze mode to ring exact session reminders and reconstructs shields after device restart.
                  </p>
                </div>
                <button
                  onClick={() => togglePermission('exactAlarm')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    settings.permissions.exactAlarm
                      ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/40'
                      : 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/40'
                  }`}
                >
                  {settings.permissions.exactAlarm ? 'Granted' : 'Grant'}
                </button>
              </div>

              {/* Item 4: Battery Optimization */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] flex items-start justify-between gap-3 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BatteryCharging className="w-4 h-4 text-[#00E676]" />
                    <span className="text-xs font-bold text-[#FFFFFF]">Background Foreground Service</span>
                  </div>
                  <code className="text-[10px] font-mono text-[#00E676] block font-semibold">
                    REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
                  </code>
                  <p className="text-[11px] text-[#B0B0C4] leading-relaxed">
                    Guarantees timers and ambient binaural audio never get terminated when phone screen sleeps.
                  </p>
                </div>
                <button
                  onClick={() => togglePermission('batteryOpt')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    settings.permissions.batteryOpt
                      ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/40'
                      : 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/40'
                  }`}
                >
                  {settings.permissions.batteryOpt ? 'Whitelisted' : 'Ignore'}
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0A10] border border-white/[0.1] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFFFFF]">
                <Smartphone className="w-4 h-4 text-[#38BDF8]" />
                Apple Screen Time API Framework
              </div>
              <p className="text-xs text-[#B0B0C4] leading-relaxed">
                Mentis on iOS interfaces directly with native Apple frameworks:
              </p>
              <ul className="text-xs text-[#B0B0C4] space-y-1.5 list-disc list-inside">
                <li><code className="text-[#FFFFFF]">FamilyControls</code>: Authorizes on-device shield selection without third-party VPN profiles.</li>
                <li><code className="text-[#FFFFFF]">ManagedSettings</code>: Enforces application restrictions during active focus sessions.</li>
                <li><code className="text-[#FFFFFF]">DeviceActivity</code>: Schedules non-surveilled threshold interventions.</li>
              </ul>
              <div className="p-3 bg-[#12121C] rounded-xl border border-white/[0.08] text-[11px] text-[#00E676] font-semibold">
                ✓ TestFlight build configured with zero telemetry and on-device token storage.
              </div>
            </div>
          )}
        </div>

        {/* Test Intercept CTA */}
        <div className="mt-3 pt-3.5 border-t border-white/[0.1] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onTestIntercept();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] border border-[#FF3366]/40 text-xs font-bold text-[#FF3366] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            Test Kinesis Intercept Screen
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
