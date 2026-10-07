import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateSM2 } from '../services/sm2';
import { storageService } from '../services/storage';
import { audioEngine } from '../services/audioEngine';

interface ActiveRecallModalProps {
  isOpen: boolean;
  subjectName: string;
  subjectId: string;
  onComplete: (xpAwarded: number) => void;
}

export const ActiveRecallModal: React.FC<ActiveRecallModalProps> = ({
  isOpen,
  subjectName,
  subjectId,
  onComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [userRetrieval, setUserRetrieval] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  // Find a prompt from revisions or generate domain challenge
  const revisions = storageService.getRevisions();
  const currentCard = revisions.find(r => r.subjectId === subjectId) || revisions[0];

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(120);
      setUserRetrieval('');
      setShowAnswer(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFinishGrade = (grade: number) => {
    audioEngine.playBell('complete');

    // Update SM-2 schedule
    if (currentCard) {
      const updatedSM2 = calculateSM2(
        grade,
        currentCard.repetitions,
        currentCard.intervalDays,
        currentCard.easinessFactor
      );
      const allRevisions = storageService.getRevisions();
      const idx = allRevisions.findIndex(r => r.id === currentCard.id);
      if (idx !== -1) {
        allRevisions[idx] = {
          ...allRevisions[idx],
          repetitions: updatedSM2.repetitions,
          intervalDays: updatedSM2.intervalDays,
          easinessFactor: updatedSM2.easinessFactor,
          nextReviewDate: updatedSM2.nextReviewDate,
          status: updatedSM2.repetitions >= 3 ? 'mastered' : 'learning',
        };
        storageService.saveRevisions(allRevisions);
      }
    }

    // Confetti celebration
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFA726', '#FFB74D', '#00E676'],
      });
    } catch (_) {}

    const xpEarned = grade >= 3 ? 50 : 25;
    setTimeout(() => {
      onComplete(xpEarned);
    }, 600);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12121C] border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto shadow-black">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-mono uppercase tracking-wider font-bold">
            <Brain className="w-3.5 h-3.5" />
            Active Recall Protocol
          </div>
          <span className="text-sm font-mono font-extrabold text-[#FFA726]">
            {timeFormatted}
          </span>
        </div>

        <h3 className="text-lg font-bold text-[#FFFFFF] mt-3">
          Close-Notes Retrieval Prompt
        </h3>
        <p className="text-xs text-[#B0B0C4] mt-0.5 leading-relaxed">
          Subject: <span className="text-[#FFFFFF] font-semibold">{subjectName}</span>. Test your neurological retention before XP is unlocked.
        </p>

        {/* Prompt Card */}
        <div className="mt-4 p-4 rounded-2xl bg-[#0A0A10] border border-white/[0.1]">
          <span className="text-[10px] font-mono text-[#FFA726] font-bold uppercase tracking-wider block">
            RETRIEVAL QUESTION
          </span>
          <p className="text-sm text-[#FFFFFF] font-medium mt-1.5 leading-relaxed">
            {currentCard ? currentCard.prompt : 'Summarize the core mental model or derivation you just completed without looking at notes.'}
          </p>
        </div>

        {/* User Retrieval Input */}
        <div className="mt-4">
          <label className="text-[11px] font-mono text-[#B0B0C4] uppercase tracking-wider block mb-1 font-bold">
            Type your recollection (or recall mentally):
          </label>
          <textarea
            value={userRetrieval}
            onChange={e => setUserRetrieval(e.target.value)}
            rows={3}
            placeholder="Write key equations, principles, or concepts from memory..."
            className="w-full p-3 text-xs bg-[#0A0A10] border border-white/[0.12] rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#FFA726] placeholder:text-[#B0B0C4]/50"
          />
        </div>

        {/* Show Ideal Solution / Answer */}
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="mt-3.5 w-full py-3 rounded-2xl bg-white/[0.1] hover:bg-white/[0.18] text-xs font-bold text-[#FFFFFF] transition-colors cursor-pointer"
          >
            Reveal Model Solution & Self-Grade
          </button>
        ) : (
          <div className="mt-4 space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-[#08080C] border border-[#00E676]/40 text-xs">
              <span className="text-[10px] font-mono text-[#00E676] uppercase tracking-wider block mb-1 font-bold">
                CANONICAL ANSWER
              </span>
              <p className="text-xs text-[#FFFFFF] leading-relaxed">
                {currentCard ? currentCard.answer : 'Core synthesis verified.'}
              </p>
            </div>

            {/* SM-2 Rating Quality Buttons */}
            <div>
              <span className="text-[11px] font-mono text-[#B0B0C4] uppercase tracking-wider block mb-2 text-center font-bold">
                Rate Retrieval Quality (SM-2 Interval Update):
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { grade: 1, label: 'Forgot (0)', color: 'border-[#FF3366]/40 bg-[#FF3366]/15 text-[#FF3366]' },
                  { grade: 3, label: 'Struggled (3)', color: 'border-[#FFA726]/40 bg-[#FFA726]/15 text-[#FFA726]' },
                  { grade: 4, label: 'Good (4)', color: 'border-[#38BDF8]/40 bg-[#38BDF8]/15 text-[#38BDF8]' },
                  { grade: 5, label: 'Flawless (5)', color: 'border-[#00E676]/40 bg-[#00E676]/15 text-[#00E676]' },
                ].map(item => (
                  <button
                    key={item.grade}
                    onClick={() => handleFinishGrade(item.grade)}
                    className={`py-2 px-1 rounded-xl border text-center text-[10px] font-bold hover:scale-[1.03] transition-transform cursor-pointer ${item.color}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
