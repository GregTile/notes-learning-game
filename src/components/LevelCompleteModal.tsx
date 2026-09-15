import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Star, Trophy, ArrowRight, RotateCcw, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { LevelConfig } from '../types';
import { soundEngine } from '../utils/audio';

interface LevelCompleteModalProps {
  isOpen: boolean;
  level: LevelConfig;
  starsEarned: number; // 0 - 3
  accuracy: number; // 0 - 100
  avgTimeSec: number;
  bestStreak: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onSelectLevel: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  isOpen,
  level,
  starsEarned,
  accuracy,
  avgTimeSec,
  bestStreak,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onSelectLevel,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playLevelWinFanfare();

      // Launch cheerful confetti
      if (starsEarned >= 1) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
          });
        } catch {
          // ignore
        }
      }
    }
  }, [isOpen, starsEarned]);

  if (!isOpen) return null;

  const isPassed = starsEarned >= 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl border-4 border-amber-300 max-w-md w-full p-6 sm:p-8 text-center relative overflow-hidden"
      >
        {/* Celebration Mascot Icon */}
        <div className="w-16 h-16 mx-auto mb-3 bg-amber-100 rounded-2xl flex items-center justify-center shadow-inner text-3xl">
          {isPassed ? '🎉' : '💪'}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          {isPassed ? 'Level Cleared!' : 'Good Effort!'}
        </h2>
        <p className="text-sm font-semibold text-slate-500 mt-1 mb-5">
          {level.title}
        </p>

        {/* Star Rating Display */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((starIndex) => {
            const hasStar = starIndex <= starsEarned;
            return (
              <motion.div
                key={starIndex}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: hasStar ? [1, 1.3, 1] : 1, rotate: 0 }}
                transition={{ delay: 0.15 * starIndex, duration: 0.4 }}
                className={`p-2 rounded-2xl ${
                  hasStar
                    ? 'bg-amber-100 text-amber-500 fill-amber-400'
                    : 'bg-slate-100 text-slate-300 fill-slate-200'
                }`}
              >
                <Star className="w-10 h-10" />
              </motion.div>
            );
          })}
        </div>

        {/* Performance Stats Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {/* Accuracy */}
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Accuracy</span>
            <span className="text-xl font-black text-emerald-900">{accuracy}%</span>
          </div>

          {/* Speed */}
          <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-2xl">
            <span className="text-[10px] font-bold text-sky-700 uppercase block">Avg Speed</span>
            <span className="text-xl font-black text-sky-900 flex items-center justify-center gap-0.5">
              <Zap className="w-4 h-4 text-sky-600" />
              {avgTimeSec.toFixed(1)}s
            </span>
          </div>

          {/* Streak */}
          <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-2xl">
            <span className="text-[10px] font-bold text-rose-700 uppercase block">Best Streak</span>
            <span className="text-xl font-black text-rose-900">🔥 {bestStreak}</span>
          </div>
        </div>

        {/* Badge Banner if earned */}
        {isPassed && (
          <div className="mb-6 p-3 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-300 rounded-2xl flex items-center justify-center gap-2 text-amber-900 font-extrabold text-xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Unlocked Badge: {level.badgeName}!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {isPassed && hasNextLevel ? (
            <button
              id="next-level-btn"
              onClick={onNextLevel}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Play Next Level</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onReplay}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again for 3 Stars</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onReplay}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Replay Level</span>
            </button>
            <button
              onClick={onSelectLevel}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Level Map</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
