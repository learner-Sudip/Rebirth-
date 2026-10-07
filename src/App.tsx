/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TabType,
  Subject,
  AppRule,
  WebsiteRule,
  HabitItem,
  UserSettings,
  SM2Revision,
  LiveFocusRoom,
  FocusSession,
} from './types';
import { storageService } from './services/storage';
import { notificationService } from './services/notifications';
import { NotificationToast } from './components/NotificationToast';
import { BottomNav } from './components/BottomNav';
import { KinesisInterceptModal } from './components/KinesisInterceptModal';
import { MindfulBreathingModal } from './components/MindfulBreathingModal';
import { ReclaimScoreModal } from './components/ReclaimScoreModal';
import { ActiveRecallModal } from './components/ActiveRecallModal';
import { SubjectDetailModal } from './components/SubjectDetailModal';
import { SubjectCustomizeModal } from './components/SubjectCustomizeModal';
import { AddSubjectModal } from './components/AddSubjectModal';
import { LiveFocusRoomModal } from './components/LiveFocusRoomModal';
import { PermissionsWizardModal } from './components/PermissionsWizardModal';
import { ArrowRight } from 'lucide-react';

// Screens
import { HomeTab, StartFocusOptions } from './tabs/HomeTab';
import { StudyTab } from './tabs/StudyTab';
import { FocusTab } from './tabs/FocusTab';
import { BlockTab } from './tabs/BlockTab';
import { InsightsTab } from './tabs/InsightsTab';
import { ProfileTab } from './tabs/ProfileTab';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Core Persistent State
  const [subjects, setSubjects] = useState<Subject[]>(() => storageService.getSubjects());
  const [appRules, setAppRules] = useState<AppRule[]>(() => storageService.getAppRules());
  const [websiteRules, setWebsiteRules] = useState<WebsiteRule[]>(() => storageService.getWebsiteRules());
  const [habits, setHabits] = useState<HabitItem[]>(() => storageService.getHabits());
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const [revisions, setRevisions] = useState<SM2Revision[]>(() => storageService.getRevisions());

  // Online / Offline state
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Active Timer state tracking for BottomNav and Floating Island
  const [isFocusTimerActive, setIsFocusTimerActive] = useState(false);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState(25 * 60);

  // Quick Start auto-launch trigger for Focus tab
  const [autoStartFocusTimer, setAutoStartFocusTimer] = useState(false);

  // Selected subject for Focus session
  const [selectedSubject, setSelectedSubject] = useState<Subject>(() => {
    const list = storageService.getSubjects();
    return list[0] || {
      id: 'subj_1',
      name: 'Mathematics & Quant Analysis',
      code: 'MA-301',
      color: '#FFA726',
      hoursStudied: 42.25,
      todayStudyMinutes: 85,
      targetHours: 60,
      dayStreak: 7,
      syllabusMasteredPercent: 68,
      units: [],
      tasks: [],
      notes: [],
    };
  });

  // Modal Visibility States
  const [isKinesisModalOpen, setIsKinesisModalOpen] = useState(false);
  const [kinesisTargetApp, setKinesisTargetApp] = useState('Instagram');

  const [isMindfulModalOpen, setIsMindfulModalOpen] = useState(false);
  const [isReclaimModalOpen, setIsReclaimModalOpen] = useState(false);

  const [activeRecallModalOpen, setActiveRecallModalOpen] = useState(false);
  const [activeRecallSubject, setActiveRecallSubject] = useState({ name: 'Mathematics & Quant Analysis', id: 'subj_1' });

  // Subject Curriculum Modal
  const [subjectDetailModalOpen, setSubjectDetailModalOpen] = useState(false);
  const [activeSubjectDetail, setActiveSubjectDetail] = useState<Subject | null>(null);

  // Subject Customize & Delete Modal
  const [subjectCustomizeModalOpen, setSubjectCustomizeModalOpen] = useState(false);
  const [activeCustomizeSubject, setActiveCustomizeSubject] = useState<Subject | null>(null);

  const [addSubjectModalOpen, setAddSubjectModalOpen] = useState(false);

  const [liveRoomModalOpen, setLiveRoomModalOpen] = useState(false);
  const [activeLiveRoom, setActiveLiveRoom] = useState<LiveFocusRoom | null>(null);

  const [permissionsWizardOpen, setPermissionsWizardOpen] = useState(false);

  const [urgesBlockedCount, setUrgesBlockedCount] = useState<number>(27);

  // Reclaim score computation
  const reclaimCalc = storageService.calculateReclaimScore(
    222,
    67,
    urgesBlockedCount,
    habits.filter(h => h.completedToday).length,
    habits.length
  );

  // Online/Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme application
  const getThemeBackground = () => {
    switch (settings.theme) {
      case 'amoled':
        return 'bg-[#000000] text-[#FFFFFF]';
      case 'midnight':
        return 'bg-[#05070D] text-[#FFFFFF]';
      case 'forest':
        return 'bg-[#040A06] text-[#FFFFFF]';
      case 'light':
        return 'bg-[#F4F5F9] text-[#0A0A10]';
      default:
        return 'command-console-mesh text-[#FFFFFF]';
    }
  };

  // Immediate global subject update (Requirement 1: changes update immediately throughout application)
  const handleUpdateSingleSubject = (updated: Subject) => {
    storageService.updateSubject(updated);
    const next = subjects.map(s => (s.id === updated.id ? updated : s));
    setSubjects(next);

    // If currently selected subject was edited, sync it immediately
    if (selectedSubject.id === updated.id) {
      setSelectedSubject(updated);
    }
    if (activeSubjectDetail?.id === updated.id) {
      setActiveSubjectDetail(updated);
    }
    if (activeCustomizeSubject?.id === updated.id) {
      setActiveCustomizeSubject(updated);
    }

    // Refresh revisions to reflect updated subject name
    setRevisions(storageService.getRevisions());

    notificationService.notify({
      channel: 'coach_advice',
      title: 'Subject Updated',
      body: `Changes for "${updated.name}" saved immediately across the app.`,
    });
  };

  // Delete subject (Requirement 1: removes from study section, menus, sessions, updates calculations)
  const handleDeleteSubject = (subjectId: string) => {
    storageService.deleteSubject(subjectId);
    const next = subjects.filter(s => s.id !== subjectId);
    setSubjects(next);

    // If currently selected subject was deleted, fallback to first available
    if (selectedSubject.id === subjectId) {
      if (next.length > 0) {
        setSelectedSubject(next[0]);
      }
    }
    if (activeSubjectDetail?.id === subjectId) {
      setActiveSubjectDetail(null);
      setSubjectDetailModalOpen(false);
    }
    if (activeCustomizeSubject?.id === subjectId) {
      setActiveCustomizeSubject(null);
      setSubjectCustomizeModalOpen(false);
    }

    // Refresh revisions
    setRevisions(storageService.getRevisions());

    notificationService.notify({
      channel: 'coach_advice',
      title: 'Subject Removed',
      body: 'Subject and associated curriculum data permanently deleted.',
    });
  };

  const handleAddSubject = (newSubject: Subject) => {
    const next = [...subjects, newSubject];
    setSubjects(next);
    storageService.saveSubjects(next);
  };

  const handleUpdateAppRules = (updated: AppRule[]) => {
    setAppRules(updated);
    storageService.saveAppRules(updated);
  };

  const handleUpdateWebsiteRules = (updated: WebsiteRule[]) => {
    setWebsiteRules(updated);
    storageService.saveWebsiteRules(updated);
  };

  const handleUpdateHabits = (updated: HabitItem[]) => {
    setHabits(updated);
    storageService.saveHabits(updated);
  };

  const handleUpdateSettings = (updated: UserSettings) => {
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleTriggerIntercept = (appName: string) => {
    setKinesisTargetApp(appName);
    setIsKinesisModalOpen(true);
  };

  const handleKinesisClose = (urgeHalted: boolean) => {
    setIsKinesisModalOpen(false);
    if (urgeHalted) {
      setUrgesBlockedCount(c => c + 1);
    }
  };

  const handleMindfulClose = (completed: boolean) => {
    setIsMindfulModalOpen(false);
    if (completed) {
      setUrgesBlockedCount(c => c + 1);
    }
  };

  const handleOpenSubjectDetail = (subject: Subject) => {
    setActiveSubjectDetail(subject);
    setSubjectDetailModalOpen(true);
  };

  const handleOpenCustomizeSubject = (subject: Subject) => {
    setActiveCustomizeSubject(subject);
    setSubjectCustomizeModalOpen(true);
  };

  const handleStartFocusFromSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setAutoStartFocusTimer(false);
    setCurrentTab('focus');
  };

  // Start Focus directly from Home (Requirement 2: Normal or Quick Start)
  const handleStartFocusFromHome = (options?: StartFocusOptions) => {
    if (options?.subject) {
      setSelectedSubject(options.subject);
    }
    if (options?.quickStart) {
      setAutoStartFocusTimer(true);
    } else {
      setAutoStartFocusTimer(false);
    }
    setCurrentTab('focus');
  };

  const handleOpenActiveRecallFromRevision = (rev: SM2Revision) => {
    setActiveRecallSubject({ name: rev.subjectName, id: rev.subjectId });
    setActiveRecallModalOpen(true);
  };

  const handleOpenLiveRoom = (room: LiveFocusRoom) => {
    setActiveLiveRoom(room);
    setLiveRoomModalOpen(true);
  };

  const handleSessionComplete = (session: FocusSession) => {
    setUrgesBlockedCount(c => c + session.urgesBlocked);
    // Refresh subjects to get new study hours
    setSubjects(storageService.getSubjects());
  };

  const handleTimerStateChange = (active: boolean, remaining: number) => {
    setIsFocusTimerActive(active);
    setTimerSecondsRemaining(remaining);
  };

  // Format timer for floating bar
  const floatingMins = Math.floor(timerSecondsRemaining / 60);
  const floatingSecs = timerSecondsRemaining % 60;
  const floatingTimerFormatted = `${floatingMins.toString().padStart(2, '0')}:${floatingSecs.toString().padStart(2, '0')}`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeBackground()} selection:bg-[#FFA726]/30`}>
      {/* Heads-up notifications */}
      <NotificationToast />

      {/* Offline Connectivity Banner */}
      {!isOnline && (
        <div className="bg-[#12121C] border-b border-[#FFA726]/40 px-4 py-1.5 text-center text-xs font-mono text-[#FFA726] flex items-center justify-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#FFA726] animate-pulse" />
          <span className="font-semibold">Offline Sovereignty Mode Active — All core study & focus engines run 100% locally.</span>
        </div>
      )}

      {/* Main Container - optimized for mobile ergonomic viewport */}
      <main className="max-w-lg mx-auto min-h-screen px-4 pt-3 pb-24">
        {currentTab === 'home' && (
          <HomeTab
            onNavigateTab={setCurrentTab}
            onOpenReclaimScoreModal={() => setIsReclaimModalOpen(true)}
            onOpenMindfulResetModal={() => setIsMindfulModalOpen(true)}
            onOpenFrictionGate={() => handleTriggerIntercept('Emergency Access Gate')}
            onOpenSubjectModal={handleOpenSubjectDetail}
            onStartFocus={handleStartFocusFromHome}
            subjects={subjects}
            reclaimScore={reclaimCalc.score}
            reclaimDescription={reclaimCalc.description}
            urgesBlockedCount={urgesBlockedCount}
          />
        )}

        {currentTab === 'study' && (
          <StudyTab
            subjects={subjects}
            revisions={revisions}
            onOpenSubjectModal={handleOpenSubjectDetail}
            onOpenAddSubjectModal={() => setAddSubjectModalOpen(true)}
            onCustomizeSubject={handleOpenCustomizeSubject}
            onStartFocusWithSubject={handleStartFocusFromSubject}
            onOpenActiveRecallForRevision={handleOpenActiveRecallFromRevision}
          />
        )}

        {currentTab === 'focus' && (
          <FocusTab
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            onNavigateTab={setCurrentTab}
            onOpenLiveRoomModal={handleOpenLiveRoom}
            onOpenActiveRecallModal={(name, id) => {
              setActiveRecallSubject({ name, id });
              setActiveRecallModalOpen(true);
            }}
            onSessionComplete={handleSessionComplete}
            onTimerStateChange={handleTimerStateChange}
            initialAutoStart={autoStartFocusTimer}
          />
        )}

        {currentTab === 'block' && (
          <BlockTab
            appRules={appRules}
            websiteRules={websiteRules}
            settings={settings}
            onUpdateAppRules={handleUpdateAppRules}
            onUpdateWebsiteRules={handleUpdateWebsiteRules}
            onUpdateSettings={handleUpdateSettings}
            onTriggerTestIntercept={handleTriggerIntercept}
          />
        )}

        {currentTab === 'insights' && (
          <InsightsTab
            habits={habits}
            onUpdateHabits={handleUpdateHabits}
            urgesBlockedTotal={843 + (urgesBlockedCount - 27)}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileTab
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenPermissionsWizard={() => setPermissionsWizardOpen(true)}
          />
        )}
      </main>

      {/* Floating Focus Capsule (Active session indicator when browsing other tabs) */}
      {isFocusTimerActive && currentTab !== 'focus' && (
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-2 duration-300">
          <div
            onClick={() => setCurrentTab('focus')}
            className="p-3 px-4 rounded-2xl bg-gradient-to-r from-[#1E1910] via-[#161622] to-[#12121A] border border-[#FFA726]/60 shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-center justify-between cursor-pointer hover:border-[#FFA726] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] block animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] block absolute top-0 left-0" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-[#FFA726] tabular-nums">
                    {floatingTimerFormatted}
                  </span>
                  <span className="text-xs font-semibold text-[#FFFFFF] truncate max-w-[130px]">
                    {selectedSubject.code}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#00E676] font-bold block">
                  ● Distractions Shielded
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFA726] text-black text-xs font-bold group-hover:scale-105 transition-transform shadow-md shadow-[#FFA726]/20">
              <span>Return</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeTimerRunning={isFocusTimerActive}
      />

      {/* Modals & Intercept Overlays */}
      <KinesisInterceptModal
        isOpen={isKinesisModalOpen}
        appName={kinesisTargetApp}
        onClose={handleKinesisClose}
        onUnlocked={() => setIsKinesisModalOpen(false)}
      />

      <MindfulBreathingModal
        isOpen={isMindfulModalOpen}
        onClose={handleMindfulClose}
      />

      <ReclaimScoreModal
        isOpen={isReclaimModalOpen}
        onClose={() => setIsReclaimModalOpen(false)}
        score={reclaimCalc.score}
        breakdown={reclaimCalc.breakdown}
      />

      <ActiveRecallModal
        isOpen={activeRecallModalOpen}
        subjectName={activeRecallSubject.name}
        subjectId={activeRecallSubject.id}
        onComplete={() => setActiveRecallModalOpen(false)}
      />

      {/* Subject Curriculum Details */}
      <SubjectDetailModal
        subject={activeSubjectDetail}
        isOpen={subjectDetailModalOpen}
        onClose={() => setSubjectDetailModalOpen(false)}
        onUpdateSubject={handleUpdateSingleSubject}
        onStartFocus={handleStartFocusFromSubject}
      />

      {/* Subject Customization (Name, Icon, Color, Goals, Delete Confirmation) */}
      <SubjectCustomizeModal
        subject={activeCustomizeSubject}
        isOpen={subjectCustomizeModalOpen}
        onClose={() => setSubjectCustomizeModalOpen(false)}
        onUpdateSubject={handleUpdateSingleSubject}
        onDeleteSubject={handleDeleteSubject}
      />

      <AddSubjectModal
        isOpen={addSubjectModalOpen}
        onClose={() => setAddSubjectModalOpen(false)}
        onAddSubject={handleAddSubject}
      />

      <LiveFocusRoomModal
        room={activeLiveRoom}
        isOpen={liveRoomModalOpen}
        onClose={() => setLiveRoomModalOpen(false)}
        isOnline={isOnline}
      />

      <PermissionsWizardModal
        isOpen={permissionsWizardOpen}
        onClose={() => setPermissionsWizardOpen(false)}
        onTestIntercept={() => handleTriggerIntercept('Instagram (Test Barrier)')}
      />
    </div>
  );
}
