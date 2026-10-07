import React from 'react';
import { TabType } from '../types';
import { Home, BookOpen, Clock, Shield, BarChart3, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeTimerRunning?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  activeTimerRunning = false,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'study' as TabType, label: 'Study', icon: BookOpen },
    { id: 'focus' as TabType, label: 'Focus', icon: Clock, badge: activeTimerRunning },
    { id: 'block' as TabType, label: 'Block', icon: Shield },
    { id: 'insights' as TabType, label: 'Insights', icon: BarChart3 },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A10]/95 backdrop-blur-2xl border-t border-white/[0.12] pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-lg mx-auto grid grid-cols-6 items-center h-16 px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-all duration-200 select-none group ${
                isActive ? 'text-[#FFA726]' : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'scale-110 stroke-[2.3px] fill-[#FFA726]/20 text-[#FFA726] drop-shadow-[0_0_10px_rgba(255,167,38,0.6)]'
                      : 'stroke-[1.8px] group-hover:scale-105'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E676] ring-2 ring-[#0A0A10]" />
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight transition-colors ${
                  isActive ? 'font-bold text-[#FFA726]' : 'font-medium text-[#B0B0C4]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-gradient-to-r from-[#FFA726] to-[#FFB74D] shadow-[0_0_8px_rgba(255,167,38,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
