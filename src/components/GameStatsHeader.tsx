import React from 'react';
import { motion } from 'motion/react';
import { Flame, Star, Zap, Mic, MicOff, Volume2, VolumeX, Lightbulb, Trophy } from 'lucide-react';
import { VoiceState } from '../utils/speech';

interface GameStatsHeaderProps {
  currentLevelTitle: string;
  levelNumber: number;
  totalLevels: number;
  questionNumber: number;
  totalQuestions: number;
  currentStreak: number;
  lastReactionTimeMs: number | null;
  voiceState: VoiceState;
  onToggleVoice: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenMnemonicGuide: () => void;
  onOpenLevelSelect: () => void;
  score: number;
}

export const GameStatsHeader: React.FC<GameStatsHeaderProps> = ({
  currentLevelTitle,
  levelNumber,
  totalLevels,
  questionNumber,
  totalQuestions,
  currentStreak,
  lastReactionTimeMs,
  voiceState,
  onToggleVoice,
  isMuted,
  onToggleMute,
  onOpenMnemonicGuide,
  onOpenLevelSelect,
  score,
}) => {
  const isListening = voiceState === 'listening';
  const progressPct = Math.round((questionNumber / totalQuestions) * 100);

  // Speed rating text
  let speedBadge = null;
  if (lastReactionTimeMs !== null) {
    const sec = (lastReactionTimeMs / 1000).toFixed(1);
    if (lastReactionTimeMs < 1500) {
      speedBadge = (
        <span className="text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-black text-xs flex items-center gap-1">
          <Zap className="w-3 h-3 text-emerald-600 fill-emerald-500" />
          ⚡ {sec}s (Lightning!)
        </span>
      );
    } else if (lastReactionTimeMs < 3000) {
      speedBadge = (
        <span className="text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full font-bold text-xs flex items-center gap-1">
          <Zap className="w-3 h-3 text-blue-600" />
          🚀 {sec}s (Fast!)
        </span>
      );
    } else {
      speedBadge = (
        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium text-xs">
          ⏱️ {sec}s
        </span>
      );
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-3">
      {/* Upper Status Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        {/* Level Indicator button */}
        <button
          onClick={onOpenLevelSelect}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-100 transition cursor-pointer"
          title="Change Level"
        >
          <Trophy className="w-4 h-4 text-indigo-600" />
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block leading-none">
              Level {levelNumber} of {totalLevels}
            </span>
            <span className="text-xs font-black text-slate-800 truncate max-w-[140px] sm:max-w-xs block">
              {currentLevelTitle}
            </span>
          </div>
        </button>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5">
          {/* Mnemonic Guide Button */}
          <button
            onClick={onOpenMnemonicGuide}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs transition active:scale-95 cursor-pointer shadow-xs"
            title="Open memory sentences (FACE, Every Good Boy...)"
          >
            <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-300" />
            <span className="hidden sm:inline">Tricks</span>
            <span>💡</span>
          </button>

          {/* Microphone Voice Answer Button */}
          <button
            onClick={onToggleVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition active:scale-95 cursor-pointer shadow-xs ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300 animate-pulse'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title={isListening ? 'Voice listening is ON. Tap to stop.' : 'Enable voice answer with microphone'}
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4 text-white animate-bounce" />
                <span>Listening...</span>
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4 text-slate-400" />
                <span>Voice Mic</span>
              </>
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            title={isMuted ? 'Unmute Piano Audio' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>

      {/* Progress & Gamification Row */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          {/* Note Counter */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-700">
              Note {questionNumber} / {totalQuestions}
            </span>
            {speedBadge}
          </div>

          {/* Streak & Score */}
          <div className="flex items-center gap-3">
            {currentStreak >= 2 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs shadow-xs"
              >
                <Flame className="w-3.5 h-3.5 fill-yellow-200" />
                <span>{currentStreak} Streak!</span>
              </motion.div>
            )}

            <div className="flex items-center gap-1 font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{score} pts</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500 rounded-full"
            style={{ width: `${progressPct}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
};
