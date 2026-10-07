import React, { useState, useRef } from 'react';
import { UserSettings, VisualTheme, EnforcementLevel } from '../types';
import {
  Shield,
  Coins,
  HeartHandshake,
  Palette,
  HardDrive,
  Download,
  Upload,
  Trash2,
  FileSpreadsheet,
  Check,
  Cpu,
  Smartphone,
  Lock,
  Terminal,
  Layers,
} from 'lucide-react';
import { storageService } from '../services/storage';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { AndroidApkGuideModal } from '../components/AndroidApkGuideModal';

interface ProfileTabProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onOpenPermissionsWizard: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  settings,
  onUpdateSettings,
  onOpenPermissionsWizard,
}) => {
  const [allyEmailInput, setAllyEmailInput] = useState(settings.allyEmail);
  const [allySaved, setAllySaved] = useState(false);
  const [purgeConfirm, setPurgeConfirm] = useState(false);
  const [showApkGuideModal, setShowApkGuideModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEnforcementChange = (lvl: EnforcementLevel) => {
    onUpdateSettings({ ...settings, enforcementLevel: lvl });
  };

  const handleThemeChange = (theme: VisualTheme) => {
    onUpdateSettings({ ...settings, theme });
  };

  const handleSaveAlly = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ ...settings, allyEmail: allyEmailInput.trim() });
    setAllySaved(true);
    setTimeout(() => setAllySaved(false), 2500);
  };

  const handleDepositBank = (mins: number) => {
    onUpdateSettings({
      ...settings,
      focusBankBalanceMinutes: settings.focusBankBalanceMinutes + mins,
    });
  };

  const handleWithdrawBank = (mins: number) => {
    if (settings.focusBankBalanceMinutes >= mins) {
      onUpdateSettings({
        ...settings,
        focusBankBalanceMinutes: settings.focusBankBalanceMinutes - mins,
      });
    }
  };

  const handleExportJSON = () => {
    const jsonStr = storageService.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentis_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvStr = storageService.exportSessionsCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentis_sessions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const success = storageService.importDataJSON(content);
      if (success) {
        setImportStatus('Backup restored successfully! Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setImportStatus('Failed to parse backup JSON.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handlePurgeAll = () => {
    if (!purgeConfirm) {
      setPurgeConfirm(true);
      return;
    }
    storageService.purgeAll();
    window.location.reload();
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 pt-2">
        <div>
          <span className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#FFA726] font-bold block">
            PRIVATE OPERATING SYSTEM
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FFFFFF] mt-0.5">
            Sovereignty & Device Controls
          </h1>
        </div>

        <button
          onClick={onOpenPermissionsWizard}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#13131C] hover:bg-[#1D1D28] border border-white/[0.12] text-xs font-mono text-[#00E676] font-bold shrink-0 transition-colors shadow-sm shadow-[#00E676]/10 cursor-pointer"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Android Permissions</span>
        </button>
      </div>

      {/* SOVEREIGN PRIVACY BANNER */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#171510] via-[#13131C] to-[#0E1511] border border-white/[0.12] space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#00E676]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#00E676] font-bold">
            100% PRIVATE · OFFLINE-FIRST ARCHITECTURE
          </span>
        </div>
        <p className="text-xs text-[#D0D0E2] leading-relaxed">
          Engineered exclusively for solitary personal use. Zero multi-user accounts, zero cloud servers, zero ads, zero public feeds. All study logs and memory algorithms live 100% on your phone.
        </p>
      </div>

      {/* SECTION: ANDROID APK & STANDALONE INSTALLATION HUB */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#181824] to-[#12121A] border border-[#00E676]/40 space-y-4 shadow-xl shadow-black/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-[#00E676]" />
            <div>
              <span className="text-[10px] font-mono text-[#00E676] font-bold uppercase tracking-wider block">
                NATIVE ANDROID INSTALLATION
              </span>
              <h3 className="text-sm font-bold text-[#FFFFFF]">
                Install Directly on Your Phone
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#00E676] font-bold px-2 py-0.5 rounded-full bg-[#00E676]/15 border border-[#00E676]/30">
            APK / WebAPK
          </span>
        </div>

        <p className="text-xs text-[#C5C5DC] leading-relaxed">
          Run Mentis on your phone with fullscreen AMOLED immersion, ongoing notification countdowns, and offline caching.
        </p>

        {/* 1-Tap Direct Install Button */}
        <PWAInstallButton />

        {/* Secondary: Android Studio & Gradle APK Guide */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={() => setShowApkGuideModal(true)}
            className="text-xs text-[#FFA726] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Build Standalone APK in Android Studio →</span>
          </button>
          <span className="text-[10px] font-mono text-[#9E9EB6]">
            Kotlin Shell Ready
          </span>
        </div>
      </div>

      {/* SECTION 1: PROTECTION ENFORCEMENT LEVEL */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-4 shadow-md shadow-black/40">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#FFA726]" />
          <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
            PROTECTION ENFORCEMENT LEVEL
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#0A0A10] rounded-2xl border border-white/[0.1]">
          {[
            { id: 'gentle' as EnforcementLevel, label: 'Gentle', desc: 'Warn-only' },
            { id: 'balanced' as EnforcementLevel, label: 'Balanced', desc: '30s Friction' },
            { id: 'strict' as EnforcementLevel, label: 'Strict', desc: 'Ally Alerted' },
          ].map(lvl => (
            <button
              key={lvl.id}
              onClick={() => handleEnforcementChange(lvl.id)}
              className={`p-2.5 rounded-xl text-center transition-all cursor-pointer ${
                settings.enforcementLevel === lvl.id
                  ? 'bg-[#222230] text-[#FFA726] font-bold shadow-md shadow-[#FFA726]/10 ring-1 ring-[#FFA726]/50'
                  : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
              }`}
            >
              <div className="text-xs font-semibold">{lvl.label}</div>
              <div className="text-[10px] font-mono opacity-80 mt-0.5">{lvl.desc}</div>
            </button>
          ))}
        </div>

        <p className="text-xs text-[#B0B0C4] leading-relaxed">
          {settings.enforcementLevel === 'balanced' &&
            'Balanced: Active application locking with 30-second mindful-friction emergency gate and typed confirmation.'}
          {settings.enforcementLevel === 'strict' &&
            'Strict: Hard uncompromising lockdown. No bypasses granted without sending an immediate streak-break alert to your Accountability Ally.'}
          {settings.enforcementLevel === 'gentle' &&
            'Gentle: Advisory toasts and notification warnings without aggressive screen intercepts.'}
        </p>
      </div>

      {/* SECTION 2: EARN YOUR SCROLL (FOCUS BANK) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-4 shadow-md shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#FFA726]" />
            <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
              EARN YOUR SCROLL (FOCUS BANK)
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#FFA726]/15 border border-[#FFA726]/40 text-[#FFA726] text-xs font-mono font-bold shadow-sm shadow-[#FFA726]/10">
            {settings.focusBankBalanceMinutes}m Available
          </div>
        </div>

        <p className="text-xs text-[#B0B0C4] leading-relaxed">
          The Dopamine Exchange Rule: 30 minutes of logged deep study yields 15 minutes of guilt-free entertainment credit to unlock Instagram or YouTube.
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => handleWithdrawBank(15)}
            disabled={settings.focusBankBalanceMinutes < 15}
            className="py-3 px-3.5 rounded-xl bg-[#0A0A10] border border-white/[0.1] hover:border-white/20 text-xs text-[#FFFFFF] font-bold disabled:opacity-40 transition-colors cursor-pointer"
          >
            Withdraw 15m (Unlock IG/YouTube)
          </button>
          <button
            onClick={() => handleDepositBank(15)}
            className="py-3 px-3.5 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] border border-white/[0.1] text-xs text-[#FFA726] font-bold transition-colors shadow-sm shadow-[#FFA726]/10 cursor-pointer"
          >
            + Deposit 15m (Study Reward)
          </button>
        </div>
      </div>

      {/* SECTION 3: ACCOUNTABILITY ALLY */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
            ACCOUNTABILITY ALLY
          </span>
        </div>
        <p className="text-xs text-[#B0B0C4] leading-relaxed">
          Shares daily focus streak summary only — never browsing history or personal notes. Zero surveillance.
        </p>

        <form onSubmit={handleSaveAlly} className="flex gap-2">
          <input
            type="email"
            value={allyEmailInput}
            onChange={e => setAllyEmailInput(e.target.value)}
            placeholder="ally.mentor@domain.com"
            className="flex-1 px-3.5 py-2.5 text-xs bg-[#0A0A10] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#38BDF8]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#56CAFF] text-black text-xs font-bold transition-colors shrink-0 shadow-sm shadow-[#38BDF8]/20 cursor-pointer"
          >
            {allySaved ? <Check className="w-4 h-4 stroke-[3]" /> : 'Save'}
          </button>
        </form>
      </div>

      {/* SECTION 4: VISUAL THEMES */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#FFA726]" />
          <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
            VISUAL CONSOLE THEMES
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[
            { id: 'dark' as VisualTheme, label: 'Dark', color: '#101016' },
            { id: 'amoled' as VisualTheme, label: 'AMOLED', color: '#000000' },
            { id: 'midnight' as VisualTheme, label: 'Midnight', color: '#090D16' },
            { id: 'forest' as VisualTheme, label: 'Forest', color: '#0A140F' },
            { id: 'light' as VisualTheme, label: 'Light', color: '#E8E8ED' },
          ].map(th => (
            <button
              key={th.id}
              onClick={() => handleThemeChange(th.id)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                settings.theme === th.id
                  ? 'border-[#FFA726] bg-[#FFA726]/15 ring-1 ring-[#FFA726]'
                  : 'border-white/[0.1] bg-[#0A0A10] hover:border-white/20'
              }`}
            >
              <div
                className="w-full h-5 rounded-lg mb-1.5 border border-white/20 shadow-inner"
                style={{ backgroundColor: th.color }}
              />
              <span className={`text-[10px] font-mono block truncate ${settings.theme === th.id ? 'text-[#FFA726] font-bold' : 'text-[#B0B0C4]'}`}>
                {th.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 5: DATA SOVEREIGNTY, OFFLINE BACKUP & RESTORE */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#FFA726]" />
          <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
            LOCAL DATA BACKUP & RESTORE
          </span>
        </div>

        <p className="text-xs text-[#B0B0C4] leading-relaxed">
          100% on-device storage. Back up your study records and flashcards to a JSON file on your phone, or restore from a previous backup.
        </p>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-[#00E676]/15 border border-[#00E676]/40 text-xs font-mono text-[#00E676] text-center">
            {importStatus}
          </div>
        )}

        {/* Hidden file input for restore */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".json,application/json"
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleExportJSON}
            className="py-3 px-3 rounded-xl bg-[#0A0A10] border border-white/[0.1] hover:border-white/20 text-xs text-[#FFFFFF] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#FFA726]" />
            <span>Backup Data (JSON)</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-3 rounded-xl bg-[#0A0A10] border border-white/[0.1] hover:border-white/20 text-xs text-[#FFFFFF] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Restore Backup</span>
          </button>
        </div>

        <div className="pt-1">
          <button
            onClick={handleExportCSV}
            className="w-full py-2.5 px-3 rounded-xl bg-[#0A0A10] border border-white/[0.08] hover:border-white/20 text-xs text-[#D0D0E2] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Export Sessions Spreadsheet (CSV)</span>
          </button>
        </div>

        <div className="pt-2 border-t border-white/[0.1]">
          <button
            onClick={handlePurgeAll}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              purgeConfirm
                ? 'bg-[#FF3366] text-white shadow-lg shadow-[#FF3366]/40'
                : 'bg-[#13131C] hover:bg-[#1E1E28] border border-[#FF3366]/50 text-[#FF3366]'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {purgeConfirm ? 'Click again to permanently erase all device data' : 'Purge Local Data'}
          </button>
        </div>
      </div>

      {/* APK Guide Modal */}
      <AndroidApkGuideModal
        isOpen={showApkGuideModal}
        onClose={() => setShowApkGuideModal(false)}
      />
    </div>
  );
};
