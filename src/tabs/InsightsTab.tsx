import React, { useState } from 'react';
import { HabitItem } from '../types';
import {
  BarChart3,
  TrendingDown,
  CheckCircle2,
  Circle,
  Moon,
  Sun,
  Smartphone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../services/audioEngine';

interface InsightsTabProps {
  habits: HabitItem[];
  onUpdateHabits: (habits: HabitItem[]) => void;
  urgesBlockedTotal: number;
}

interface PointData {
  label: string;
  focusHours: number;
  distractionHours: number;
  ratio: string;
}

const DATA_BY_RANGE: Record<'daily' | 'weekly' | 'monthly', {
  points: PointData[];
  totalFocus: string;
  totalDistraction: string;
  sovereignRatio: string;
  bestNote: string;
}> = {
  daily: {
    points: [
      { label: '8 AM', focusHours: 0.9, distractionHours: 0.1, ratio: '9.0×' },
      { label: '11 AM', focusHours: 1.5, distractionHours: 0.2, ratio: '7.5×' },
      { label: '2 PM', focusHours: 0.6, distractionHours: 0.4, ratio: '1.5×' },
      { label: '5 PM', focusHours: 0.4, distractionHours: 0.3, ratio: '1.3×' },
      { label: '8 PM', focusHours: 1.2, distractionHours: 0.1, ratio: '12.0×' },
    ],
    totalFocus: '4h 36m',
    totalDistraction: '1h 06m',
    sovereignRatio: '80.7%',
    bestNote: 'Peak cognitive focus recorded during 11 AM – 1 PM deep flow block.',
  },
  weekly: {
    points: [
      { label: 'Mon', focusHours: 3.8, distractionHours: 1.2, ratio: '3.2×' },
      { label: 'Tue', focusHours: 4.2, distractionHours: 0.9, ratio: '4.7×' },
      { label: 'Wed', focusHours: 3.5, distractionHours: 1.5, ratio: '2.3×' },
      { label: 'Thu', focusHours: 5.1, distractionHours: 0.7, ratio: '7.3×' },
      { label: 'Fri', focusHours: 3.4, distractionHours: 1.4, ratio: '2.4×' },
      { label: 'Sat', focusHours: 3.1, distractionHours: 1.1, ratio: '2.8×' },
      { label: 'Sun', focusHours: 2.9, distractionHours: 1.0, ratio: '2.9×' },
    ],
    totalFocus: '26h 00m',
    totalDistraction: '7h 48m',
    sovereignRatio: '76.9%',
    bestNote: 'Best focus ratio recorded on Thursday (7.3× sovereign) following afternoon deep work.',
  },
  monthly: {
    points: [
      { label: 'W1', focusHours: 24.5, distractionHours: 8.2, ratio: '3.0×' },
      { label: 'W2', focusHours: 28.0, distractionHours: 7.1, ratio: '3.9×' },
      { label: 'W3', focusHours: 26.2, distractionHours: 7.5, ratio: '3.5×' },
      { label: 'W4', focusHours: 29.8, distractionHours: 6.4, ratio: '4.7×' },
    ],
    totalFocus: '108h 30m',
    totalDistraction: '29h 12m',
    sovereignRatio: '78.8%',
    bestNote: 'Monthly trend demonstrates continuous week-over-week distraction reduction of 22%.',
  },
};

export const InsightsTab: React.FC<InsightsTabProps> = ({
  habits,
  onUpdateHabits,
  urgesBlockedTotal,
}) => {
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [viewMode, setViewMode] = useState<'bars' | 'trend'>('bars');

  const currentDataset = DATA_BY_RANGE[range];
  const [inspectedIndex, setInspectedIndex] = useState<number>(range === 'weekly' ? 3 : 0);

  const inspectedPoint = currentDataset.points[inspectedIndex] || currentDataset.points[0];
  const completedHabitsCount = habits.filter(h => h.completedToday).length;

  const toggleHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const nextCompleted = !habit.completedToday;

    if (nextCompleted) {
      audioEngine.playBell('complete');
      try {
        confetti({
          particleCount: 50,
          spread: 55,
          origin: { y: 0.8 },
          colors: ['#FFA726', '#00E676'],
        });
      } catch (_) {}
    }

    const updated = habits.map(h =>
      h.id === id
        ? {
            ...h,
            completedToday: nextCompleted,
            streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
          }
        : h
    );
    onUpdateHabits(updated);
  };

  const maxVal = Math.max(...currentDataset.points.map(d => Math.max(d.focusHours, d.distractionHours)), 1);

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 pt-2">
        <div>
          <span className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#FFA726] font-bold block">
            BEHAVIORAL ANALYTICS
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FFFFFF] mt-0.5">
            Attention Sovereignty
          </h1>
        </div>

        {/* Range Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#13131C] rounded-2xl border border-white/[0.12] shadow-sm">
          {(['daily', 'weekly', 'monthly'] as const).map(r => (
            <button
              key={r}
              onClick={() => {
                setRange(r);
                setInspectedIndex(0);
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                range === r
                  ? 'bg-[#222230] text-[#FFA726] shadow-sm shadow-black/40 border border-white/[0.1]'
                  : 'text-[#B0B0C4] hover:text-[#FFFFFF]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Focus Time vs Distraction Time Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-4 shadow-md shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#FFA726]" />
            <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
              FOCUS TIME VS DISTRACTION TIME
            </span>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-[#0A0A10] rounded-xl border border-white/[0.1] text-[10px] font-mono">
            <button
              onClick={() => setViewMode('bars')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'bars' ? 'bg-[#222230] text-[#FFA726] font-bold shadow-sm' : 'text-[#B0B0C4]'
              }`}
            >
              Bars
            </button>
            <button
              onClick={() => setViewMode('trend')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'trend' ? 'bg-[#222230] text-[#FFA726] font-bold shadow-sm' : 'text-[#B0B0C4]'
              }`}
            >
              Trend
            </button>
          </div>
        </div>

        {/* 3 Metric Tiles with High Contrast */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Tile 1 */}
          <div className="p-3.5 rounded-2xl bg-[#0A0A10] border border-white/[0.1] space-y-1 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold block">
              TOTAL FOCUS
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-[#FFA726]">
              {currentDataset.totalFocus}
            </div>
            <div className="text-[10px] text-[#B0B0C4] font-mono">Controlled flow</div>
          </div>

          {/* Tile 2 */}
          <div className="p-3.5 rounded-2xl bg-[#0A0A10] border border-white/[0.1] space-y-1 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold block">
              DISTRACTION
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-[#FF3366]">
              {currentDataset.totalDistraction}
            </div>
            <div className="text-[10px] text-[#00E676] font-mono font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" />
              <span>↓32% vs avg</span>
            </div>
          </div>

          {/* Tile 3 */}
          <div className="p-3.5 rounded-2xl bg-[#0A0A10] border border-white/[0.1] space-y-1 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-[#B0B0C4] font-bold block">
              SOVEREIGN RATIO
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-[#00E676]">
              {currentDataset.sovereignRatio}
            </div>
            <div className="text-[10px] text-[#B0B0C4] font-mono">Controlled Attention</div>
          </div>
        </div>

        {/* Visual Chart Area */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#B0B0C4] mb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FFA726] shadow-sm shadow-[#FFA726]/40" />
                Focus
              </span>
              <span className="flex items-center gap-1.5 text-white font-bold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FF3366] shadow-sm shadow-[#FF3366]/40" />
                Distraction
              </span>
            </div>
            <span className="font-medium text-[10px]">Tap data point to inspect</span>
          </div>

          {viewMode === 'bars' ? (
            /* Grouped Bar Chart */
            <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-white/[0.1]">
              {currentDataset.points.map((d, idx) => {
                const focusHeight = Math.max(8, Math.round((d.focusHours / maxVal) * 100));
                const distractHeight = Math.max(8, Math.round((d.distractionHours / maxVal) * 100));
                const isSelected = inspectedIndex === idx;

                return (
                  <div
                    key={d.label}
                    onClick={() => setInspectedIndex(idx)}
                    className={`flex-1 flex flex-col items-center gap-1 h-full justify-end cursor-pointer group p-1.5 rounded-2xl transition-all ${
                      isSelected ? 'bg-white/[0.1] ring-1 ring-[#FFA726]/60 shadow-md shadow-black/50' : 'hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="w-full flex items-end justify-center gap-1.5 h-32">
                      {/* Focus bar (amber) */}
                      <div
                        className="w-1/2 rounded-t-md bg-gradient-to-t from-[#FF9800] to-[#FFB74D] shadow-sm shadow-[#FFA726]/40 transition-all duration-300"
                        style={{ height: `${focusHeight}%` }}
                      />
                      {/* Distraction bar (crimson) */}
                      <div
                        className="w-1/2 rounded-t-md bg-gradient-to-t from-[#E91E63] to-[#FF3366] shadow-sm shadow-[#FF3366]/40 transition-all duration-300"
                        style={{ height: `${distractHeight}%` }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-mono mt-1 ${
                        isSelected ? 'text-[#FFA726] font-bold' : 'text-[#B0B0C4]'
                      }`}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* SVG Trend Spline Chart */
            <div className="h-44 w-full relative pt-2 px-2 border-b border-white/[0.1]">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="focusTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFA726" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FFA726" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const pts = currentDataset.points;
                  const step = 100 / (pts.length - 1);
                  const coords = pts.map((p, i) => {
                    const x = i * step;
                    const y = 45 - (p.focusHours / maxVal) * 40;
                    return `${x},${y}`;
                  });
                  const polyPoints = `0,50 ${coords.join(' ')} 100,50`;
                  return (
                    <>
                      <polygon points={polyPoints} fill="url(#focusTrendGrad)" />
                      <polyline
                        points={coords.join(' ')}
                        fill="none"
                        stroke="#FFA726"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}
              </svg>

              {/* Data dots */}
              <div className="absolute inset-x-2 top-2 h-32 flex justify-between items-center pointer-events-none">
                {currentDataset.points.map((p, idx) => {
                  const yPct = 90 - (p.focusHours / maxVal) * 80;
                  const isSelected = inspectedIndex === idx;
                  return (
                    <div
                      key={p.label}
                      style={{ transform: `translateY(${yPct - 50}%)` }}
                      className="pointer-events-auto cursor-pointer"
                      onClick={() => setInspectedIndex(idx)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'bg-[#FFA726] border-white scale-125 shadow-lg shadow-[#FFA726]/70'
                            : 'bg-[#13131C] border-[#FFA726] hover:scale-110'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Labels */}
              <div className="flex justify-between items-center mt-2 px-1 text-[11px] font-mono text-[#B0B0C4]">
                {currentDataset.points.map((p, idx) => (
                  <span
                    key={p.label}
                    onClick={() => setInspectedIndex(idx)}
                    className={`cursor-pointer ${
                      inspectedIndex === idx ? 'text-[#FFA726] font-bold' : ''
                    }`}
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tap-to-inspect Tooltip Box */}
          {inspectedPoint && (
            <div className="mt-3.5 p-3.5 rounded-2xl bg-[#0A0A10] border border-white/[0.1] flex items-center justify-between text-xs font-mono shadow-sm">
              <span className="font-bold text-[#FFFFFF]">{inspectedPoint.label}:</span>
              <span className="text-[#FFA726] font-bold">Focus: {inspectedPoint.focusHours}h</span>
              <span className="text-[#B0B0C4]">·</span>
              <span className="text-[#FF3366] font-bold">Distraction: {inspectedPoint.distractionHours}h</span>
              <span className="text-[#B0B0C4]">·</span>
              <span className="text-[#00E676] font-bold">{inspectedPoint.ratio} sovereign</span>
            </div>
          )}

          {/* Insight Line */}
          <p className="text-xs text-[#C2C2D6] italic mt-3 leading-relaxed">
            "{currentDataset.bestNote}"
          </p>
        </div>
      </div>

      {/* Automated Behavioral Insights */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
        <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono block">
          AUTOMATED BEHAVIORAL PATTERNS
        </span>

        <div className="space-y-2.5">
          {/* Pattern 1 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#FF3366]/15 text-[#FF3366] shrink-0 border border-[#FF3366]/30">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#FFFFFF]">
                Night Vulnerability Window
              </h4>
              <p className="text-[11px] text-[#B0B0C4] mt-0.5 leading-relaxed">
                Highest distraction frequency logged between 10:00 PM – Midnight (68% of slip-ups). Recommendation: Enable Sleep Protection Shield at 10:15 PM.
              </p>
            </div>
          </div>

          {/* Pattern 2 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#00E676]/15 text-[#00E676] shrink-0 border border-[#00E676]/30">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#FFFFFF]">
                Morning Prime Window
              </h4>
              <p className="text-[11px] text-[#B0B0C4] mt-0.5 leading-relaxed">
                Longest uninterrupted deep focus stretches consistently occur between 7:30 AM – 10:30 AM. Peak cognitive capacity preserved.
              </p>
            </div>
          </div>

          {/* Pattern 3 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] shrink-0 border border-[#38BDF8]/30">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#FFFFFF]">
                Algorithmic Reel Reduction
              </h4>
              <p className="text-[11px] text-[#B0B0C4] mt-0.5 leading-relaxed">
                Instagram usage collapsed by −41% following activation of the Short-Form Feed Shield. 38 minutes recovered daily.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Habit Consistency Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider font-mono">
            HABIT CONSISTENCY
          </span>
          <span className="text-xs font-mono font-bold text-[#FFA726]">
            {completedHabitsCount} / {habits.length} Done Today
          </span>
        </div>

        <div className="space-y-2">
          {habits.map(habit => (
            <div
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1] hover:border-[#FFA726]/50 cursor-pointer flex items-center justify-between transition-colors group shadow-sm"
            >
              <div className="flex items-center gap-3">
                {habit.completedToday ? (
                  <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-[#B0B0C4] group-hover:text-[#FFA726] shrink-0" />
                )}
                <span
                  className={`text-xs ${
                    habit.completedToday
                      ? 'text-[#B0B0C4] line-through font-normal'
                      : 'text-[#FFFFFF] font-semibold'
                  }`}
                >
                  {habit.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-[#FFA726] font-bold">+{habit.xp} XP</span>
                <span className="text-[10px] font-mono text-[#B0B0C4] font-semibold">🔥 {habit.streak}d</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progression & XP Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#13131C] border border-white/[0.12] space-y-3.5 shadow-md shadow-black/40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#FFA726] tracking-[0.18em] font-bold block">
              LEVEL 12
            </span>
            <h3 className="text-sm font-bold text-[#FFFFFF]">Disciplined Sovereign</h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#FFFFFF]">1,450 / 2,000 XP</span>
        </div>

        {/* XP Bar */}
        <div className="w-full h-2.5 rounded-full bg-[#0A0A10] overflow-hidden border border-white/[0.08]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FFA726] to-[#FFB74D] shadow-sm shadow-[#FFA726]/40"
            style={{ width: '72.5%' }}
          />
        </div>

        {/* 3 Summary Badges */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.1] text-center">
          <div>
            <span className="text-sm font-mono font-bold text-[#FFFFFF] block">142 Hours</span>
            <span className="text-[10px] font-mono text-[#B0B0C4] font-medium">Total Focus</span>
          </div>
          <div>
            <span className="text-sm font-mono font-bold text-[#FF3366] block">
              {urgesBlockedTotal}
            </span>
            <span className="text-[10px] font-mono text-[#B0B0C4] font-medium">Urges Blocked</span>
          </div>
          <div>
            <span className="text-sm font-mono font-bold text-[#00E676] block">19 Days</span>
            <span className="text-[10px] font-mono text-[#B0B0C4] font-medium">Longest Streak</span>
          </div>
        </div>
      </div>
    </div>
  );
};
