import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Play, RotateCcw, FastForward, CheckCircle } from 'lucide-react';
import { LevelConfig, ChildProfile } from '../types';
import { LEVELS } from '../utils/musicData';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: ChildProfile;
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onAdvanceToLevel: (levelId: number) => void;
  onResetProgress: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  currentLevelId,
  onSelectLevel,
  onAdvanceToLevel,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl border-4 border-indigo-100 max-w-xl w-full p-6 relative max-h-[88vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeProfile.avatar}</span>
                <h3 className="text-xl font-black text-slate-900">
                  {activeProfile.name}&apos;s Levels
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeProfile.totalStars} Total Stars Earned • Currently at Level {activeProfile.unlockedLevel}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Management Bar: Reset or Unlock All */}
          <div className="flex items-center justify-between gap-2 py-2 px-3 my-2 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600">
              Teacher &amp; Parent Level Controls:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Reset all level progress for ${activeProfile.name} back to Level 1?`
                    )
                  ) {
                    onResetProgress();
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                title="Reset this child's progress back to Level 1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset to Level 1</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onAdvanceToLevel(LEVELS.length);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                title="Unlock all 8 levels so child can jump directly to any lesson"
              >
                <FastForward className="w-3.5 h-3.5 text-indigo-600" />
                <span>Unlock All Lessons</span>
              </button>
            </div>
          </div>

          {/* Level List */}
          <div className="mt-1 overflow-y-auto space-y-2.5 pr-1 flex-1">
            {LEVELS.map((level: LevelConfig) => {
              const isUnlocked = level.id <= activeProfile.unlockedLevel;
              const isCurrent = level.id === currentLevelId;
              const record = activeProfile.levelRecords[level.id];
              const stars = record ? record.stars : 0;

              return (
                <div
                  key={level.id}
                  className={`
                    flex items-center justify-between p-3.5 rounded-2xl border-2 transition
                    ${
                      isCurrent
                        ? 'bg-indigo-50/90 border-indigo-500 shadow-sm'
                        : isUnlocked
                        ? 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 shadow-xs'
                        : 'bg-slate-50/80 border-slate-200'
                    }
                  `}
                >
                  <div
                    onClick={() => {
                      onSelectLevel(level.id);
                      onClose();
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    {/* Level Number Badge */}
                    <div
                      className={`
                        w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0
                        ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : isUnlocked
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-200 text-slate-600'
                        }
                      `}
                    >
                      {level.id}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {level.title}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[9px]">
                            Playing
                          </span>
                        )}
                        {!isUnlocked && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[9px]">
                            Advanced
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {level.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                          Trick: {level.mnemonicFocus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stars & Action / Start from here */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    {isUnlocked ? (
                      <button
                        onClick={() => {
                          onSelectLevel(level.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Play</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onAdvanceToLevel(level.id);
                          onSelectLevel(level.id);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                        title="Start directly from this advanced lesson"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Start Here</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
