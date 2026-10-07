import React, { useState } from 'react';
import { AppRule, WebsiteRule, UserSettings } from '../types';
import {
  Shield,
  CheckCircle2,
  Globe,
  Plus,
  Play,
} from 'lucide-react';

interface BlockTabProps {
  appRules: AppRule[];
  websiteRules: WebsiteRule[];
  settings: UserSettings;
  onUpdateAppRules: (rules: AppRule[]) => void;
  onUpdateWebsiteRules: (rules: WebsiteRule[]) => void;
  onUpdateSettings: (settings: UserSettings) => void;
  onTriggerTestIntercept: (appName: string) => void;
}

export const BlockTab: React.FC<BlockTabProps> = ({
  appRules,
  websiteRules,
  settings,
  onUpdateAppRules,
  onUpdateWebsiteRules,
  onUpdateSettings,
  onTriggerTestIntercept,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'apps' | 'websites' | 'shortform' | 'schedule'>('apps');
  const [showAddApp, setShowAddApp] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('Social Media');

  const [newDomain, setNewDomain] = useState('');

  const toggleAppBlocked = (id: string) => {
    const updated = appRules.map(app => (app.id === id ? { ...app, isBlocked: !app.isBlocked } : app));
    onUpdateAppRules(updated);
  };

  const updateAppGranularity = (id: string, granularity: 'full' | 'feed_only') => {
    const updated = appRules.map(app => (app.id === id ? { ...app, granularity } : app));
    onUpdateAppRules(updated);
  };

  const updateAppLimit = (id: string, mins: number) => {
    const updated = appRules.map(app => (app.id === id ? { ...app, dailyLimitMinutes: mins } : app));
    onUpdateAppRules(updated);
  };

  const handleAddCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    const newApp: AppRule = {
      id: 'app_' + Date.now(),
      name: newAppName.trim(),
      category: newAppCategory,
      iconName: 'Smartphone',
      packageName: 'com.custom.' + newAppName.toLowerCase().replace(/\s+/g, ''),
      isBlocked: true,
      granularity: 'full',
      dailyLimitMinutes: 20,
      usageTodayMinutes: 0,
    };
    onUpdateAppRules([newApp, ...appRules]);
    setNewAppName('');
    setShowAddApp(false);
  };

  const handleAddWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    const domainClean = newDomain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const newSite: WebsiteRule = {
      id: 'web_' + Date.now(),
      domain: domainClean,
      isBlocked: true,
      dailyLimitMinutes: 15,
      usageTodayMinutes: 0,
    };
    onUpdateWebsiteRules([newSite, ...websiteRules]);
    setNewDomain('');
  };

  const toggleWebsiteBlocked = (id: string) => {
    const updated = websiteRules.map(site => (site.id === id ? { ...site, isBlocked: !site.isBlocked } : site));
    onUpdateWebsiteRules(updated);
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 pt-2">
        <div>
          <span className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#FFA726] font-bold block">
            APPLICATION RULES & DAILY LIMITS
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FFFFFF] mt-0.5">
            Distraction Shield
          </h1>
        </div>

        {/* Shield Synced Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#13131C] border border-[#00E676]/40 text-xs font-mono shrink-0 shadow-sm shadow-[#00E676]/10">
          <span className="w-2 h-2 rounded-full bg-[#00E676]" />
          <span className="text-[#00E676] font-bold">Shield Synced</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#13131C] rounded-2xl border border-white/[0.12] overflow-x-auto shadow-sm">
        {[
          { id: 'apps', label: `Apps (${appRules.length})` },
          { id: 'websites', label: `Websites (${websiteRules.length})` },
          { id: 'shortform', label: 'Short-Form Shield' },
          { id: 'schedule', label: 'Study Schedule' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id as typeof activeSubTab)}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === t.id
                ? 'bg-[#222230] text-[#FFA726] font-bold shadow-sm shadow-black/40 border border-white/[0.1]'
                : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: APPS */}
      {activeSubTab === 'apps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-[#B0B0C4]">
              Configure granular barrier types and daily quotas.
            </span>
            <button
              onClick={() => setShowAddApp(!showAddApp)}
              className="text-xs text-[#FFA726] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add App
            </button>
          </div>

          {/* Add custom app form */}
          {showAddApp && (
            <form onSubmit={handleAddCustomApp} className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.14] space-y-3 shadow-lg shadow-black/50">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newAppName}
                  onChange={e => setNewAppName(e.target.value)}
                  placeholder="App name (e.g. Discord)..."
                  className="px-3.5 py-2 text-xs bg-[#0A0A10] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                />
                <input
                  type="text"
                  value={newAppCategory}
                  onChange={e => setNewAppCategory(e.target.value)}
                  placeholder="Category..."
                  className="px-3.5 py-2 text-xs bg-[#0A0A10] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddApp(false)}
                  className="px-3.5 py-1.5 text-xs text-[#B0B0C4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-black text-xs font-bold cursor-pointer"
                >
                  Save App
                </button>
              </div>
            </form>
          )}

          {/* Per-App Cards List */}
          <div className="space-y-3">
            {appRules.map(app => {
              const limitExceeded = app.usageTodayMinutes >= app.dailyLimitMinutes;
              const statusBadge = !app.isBlocked
                ? { label: 'Allowed', color: 'bg-[#222230] text-[#B0B0C4]' }
                : app.granularity === 'feed_only'
                ? { label: 'Feed Restricted', color: 'bg-[#FFA726]/15 text-[#FFA726] border border-[#FFA726]/40' }
                : { label: 'Blocked', color: 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/40' };

              return (
                <div
                  key={app.id}
                  className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#FFFFFF]">{app.name}</h4>
                        <span className="text-[10px] font-mono text-[#B0B0C4]">· {app.category}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#B0B0C4] mt-0.5">
                        Usage today:{' '}
                        <span className={limitExceeded ? 'text-[#FF3366] font-bold' : 'text-[#FFFFFF] font-semibold'}>
                          {app.usageTodayMinutes}m
                        </span>{' '}
                        / {app.dailyLimitMinutes}m limit
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                      {/* Intercept Simulation Trigger */}
                      <button
                        onClick={() => onTriggerTestIntercept(app.name)}
                        className="p-2 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] border border-white/[0.1] text-[#B0B0C4] hover:text-[#FF3366] transition-colors cursor-pointer"
                        title="Simulate opening this app"
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Daily Limit Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#B0B0C4] font-bold">
                      <span>DAILY LIMIT SLIDER (5m–180m)</span>
                      <span className="text-[#FFA726]">{app.dailyLimitMinutes} mins</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="180"
                      step="5"
                      value={app.dailyLimitMinutes}
                      onChange={e => updateAppLimit(app.id, parseInt(e.target.value, 10))}
                      className="w-full accent-[#FFA726] h-1.5 bg-[#0A0A10] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Restriction Granularity Toggle */}
                  <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 p-1 bg-[#0A0A10] rounded-xl border border-white/[0.08] text-[11px]">
                      <button
                        onClick={() => updateAppGranularity(app.id, 'full')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          app.granularity === 'full'
                            ? 'bg-[#222230] text-[#FF3366] font-bold shadow-sm'
                            : 'text-[#B0B0C4]'
                        }`}
                      >
                        Full App Block
                      </button>
                      <button
                        onClick={() => updateAppGranularity(app.id, 'feed_only')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          app.granularity === 'feed_only'
                            ? 'bg-[#222230] text-[#FFA726] font-bold shadow-sm'
                            : 'text-[#B0B0C4]'
                        }`}
                      >
                        Block Feed Only
                      </button>
                    </div>

                    <button
                      onClick={() => toggleAppBlocked(app.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        app.isBlocked
                          ? 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/40 hover:bg-[#FF3366]/25'
                          : 'bg-[#222230] text-[#B0B0C4] hover:text-[#FFFFFF]'
                      }`}
                    >
                      {app.isBlocked ? 'Shielded' : 'Enable Shield'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: WEBSITES */}
      {activeSubTab === 'websites' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
                WEB DOMAIN BARRIERS
              </span>
            </div>
            <p className="text-xs text-[#B0B0C4] leading-relaxed">
              Blocks web versions and loop-holes in Chrome, Firefox, and Safari on device.
            </p>

            <form onSubmit={handleAddWebsite} className="flex gap-2">
              <input
                type="text"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                placeholder="e.g. news.ycombinator.com, x.com"
                className="flex-1 px-3.5 py-2 text-xs bg-[#0A0A10] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#38BDF8]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#56CAFF] text-black text-xs font-bold transition-colors cursor-pointer"
              >
                Add Domain
              </button>
            </form>
          </div>

          <div className="space-y-2.5">
            {websiteRules.map(site => (
              <div
                key={site.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#13131C] border border-white/[0.12] flex items-center justify-between shadow-sm"
              >
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#FFFFFF]">{site.domain}</h4>
                  <span className="text-[10px] font-mono text-[#B0B0C4]">
                    Usage today: {site.usageTodayMinutes}m / {site.dailyLimitMinutes}m limit
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTriggerTestIntercept(site.domain)}
                    className="p-1.5 rounded-lg bg-[#222230] text-[#B0B0C4] hover:text-[#FF3366] transition-colors cursor-pointer"
                    title="Simulate visiting site"
                  >
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleWebsiteBlocked(site.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      site.isBlocked
                        ? 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/40'
                        : 'bg-[#222230] text-[#B0B0C4]'
                    }`}
                  >
                    {site.isBlocked ? 'Blocked' : 'Allowed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SHORT-FORM FEED SHIELD */}
      {activeSubTab === 'shortform' && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-4 shadow-md shadow-black/40">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#FFA726] font-bold block">
                  SURGICAL INTERVENTION
                </span>
                <h3 className="text-base font-bold text-[#FFFFFF] mt-0.5">
                  Short-Form Feed Shield
                </h3>
              </div>

              {/* Amber Toggle */}
              <button
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    shortFormShieldActive: !settings.shortFormShieldActive,
                  })
                }
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.shortFormShieldActive ? 'bg-[#FFA726]' : 'bg-[#252535]'
                }`}
                aria-label="Toggle short-form feed shield"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black shadow transform transition-transform ${
                    settings.shortFormShieldActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-[#B0B0C4] leading-relaxed">
              Dopamine slot machines (Instagram Reels, YouTube Shorts, TikTok) produce rapid attention fragmentation. This shield intercepts algorithmic swipe-feeds exclusively, while keeping essential messaging, search, and direct communications uninhibited.
            </p>

            <div className="p-3.5 bg-[#0A0A10] rounded-2xl border border-white/[0.1] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#FFFFFF]">
                <span>Instagram Reels Interceptor</span>
                <span className="text-[#00E676] font-mono font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between text-[#FFFFFF]">
                <span>YouTube Shorts URL & Tab Barrier</span>
                <span className="text-[#00E676] font-mono font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between text-[#FFFFFF]">
                <span>TikTok Endless Feed Lock</span>
                <span className="text-[#00E676] font-mono font-bold">Active</span>
              </div>
            </div>

            <button
              onClick={() => onTriggerTestIntercept('Instagram Reels Feed')}
              className="w-full py-3 rounded-2xl bg-[#222230] hover:bg-[#2C2C3E] border border-white/[0.12] text-[#FFA726] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-[#FFA726]" />
              Test Feed Intercept Barrier
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: STUDY SCHEDULE */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-4 shadow-md shadow-black/40">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#FFA726] font-bold block">
                  RECURRING TEMPORAL BARRIER
                </span>
                <h3 className="text-base font-bold text-[#FFFFFF] mt-0.5">
                  Study Block Schedule
                </h3>
              </div>

              {/* Amber Toggle */}
              <button
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    studyScheduleActive: !settings.studyScheduleActive,
                  })
                }
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.studyScheduleActive ? 'bg-[#FFA726]' : 'bg-[#252535]'
                }`}
                aria-label="Toggle study block schedule"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black shadow transform transition-transform ${
                    settings.studyScheduleActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-[#B0B0C4] leading-relaxed">
              Automatically locks down all 8 non-essential entertainment applications during your sacred study window every evening without manual intervention.
            </p>

            <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#0A0A10] rounded-2xl border border-white/[0.1]">
              <div>
                <label className="text-[10px] font-mono text-[#B0B0C4] uppercase block mb-1 font-bold">
                  Start Window
                </label>
                <input
                  type="time"
                  value={settings.studyScheduleStart}
                  onChange={e =>
                    onUpdateSettings({ ...settings, studyScheduleStart: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-[#13131C] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#B0B0C4] uppercase block mb-1 font-bold">
                  End Window
                </label>
                <input
                  type="time"
                  value={settings.studyScheduleEnd}
                  onChange={e =>
                    onUpdateSettings({ ...settings, studyScheduleEnd: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-[#13131C] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726]"
                />
              </div>
            </div>

            <div className="p-3.5 bg-[#13131C] rounded-2xl border border-[#00E676]/40 text-xs text-[#00E676] font-semibold flex items-center gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00E676]" />
              <span>Status: Active Now (Current time falls within 6:00 PM – 10:00 PM)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
