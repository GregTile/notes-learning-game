import React, { useEffect } from 'react';
import { NotePitch } from '../types';
import { Mic } from 'lucide-react';

interface AnswerButtonsProps {
  onSelectPitch: (pitch: NotePitch) => void;
  disabled?: boolean;
  activeVoicePitch: NotePitch | null;
  lastSelectedPitch: NotePitch | null;
  lastCorrectPitch: NotePitch | null;
  feedback: 'idle' | 'correct' | 'incorrect';
}

const PITCHES: { pitch: NotePitch; color: string; hoverColor: string; bgSoft: string; border: string }[] = [
  { pitch: 'A', color: 'bg-rose-500', hoverColor: 'hover:bg-rose-600', bgSoft: 'bg-rose-50', border: 'border-rose-200' },
  { pitch: 'B', color: 'bg-amber-500', hoverColor: 'hover:bg-amber-600', bgSoft: 'bg-amber-50', border: 'border-amber-200' },
  { pitch: 'C', color: 'bg-emerald-500', hoverColor: 'hover:bg-emerald-600', bgSoft: 'bg-emerald-50', border: 'border-emerald-200' },
  { pitch: 'D', color: 'bg-teal-500', hoverColor: 'hover:bg-teal-600', bgSoft: 'bg-teal-50', border: 'border-teal-200' },
  { pitch: 'E', color: 'bg-sky-500', hoverColor: 'hover:bg-sky-600', bgSoft: 'bg-sky-50', border: 'border-sky-200' },
  { pitch: 'F', color: 'bg-indigo-500', hoverColor: 'hover:bg-indigo-600', bgSoft: 'bg-indigo-50', border: 'border-indigo-200' },
  { pitch: 'G', color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600', bgSoft: 'bg-purple-50', border: 'border-purple-200' },
];

export const AnswerButtons: React.FC<AnswerButtonsProps> = ({
  onSelectPitch,
  disabled = false,
  activeVoicePitch,
  lastSelectedPitch,
  lastCorrectPitch,
  feedback,
}) => {
  // Listen to physical keyboard events (A-G)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      // Do not trigger notes if user is typing into any input, textarea, or form field
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(key)) {
        onSelectPitch(key as NotePitch);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onSelectPitch]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 px-2">
      <div className="text-center mb-2 flex items-center justify-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Tap, Click, Speak, or Type (A - G)
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
        {PITCHES.map(({ pitch, color, hoverColor }) => {
          const isVoiceActive = activeVoicePitch === pitch;
          const isSelected = lastSelectedPitch === pitch;
          const isTheCorrectNote = lastCorrectPitch === pitch;

          let buttonStyle = `${color} ${hoverColor} text-white`;
          let animationStyle = '';

          if (feedback === 'correct' && (isSelected || isTheCorrectNote)) {
            buttonStyle = 'bg-green-600 text-white shadow-lg ring-4 ring-green-300';
            animationStyle = 'scale-105';
          } else if (feedback === 'incorrect' && isSelected) {
            buttonStyle = 'bg-rose-600 text-white ring-4 ring-rose-300';
            animationStyle = 'animate-shake';
          } else if (isVoiceActive) {
            buttonStyle = 'bg-indigo-700 text-white ring-4 ring-indigo-300 scale-105';
          }

          return (
            <button
              key={pitch}
              id={`answer-button-${pitch}`}
              onClick={() => !disabled && onSelectPitch(pitch)}
              disabled={disabled}
              aria-label={`Answer Note ${pitch}`}
              className={`
                relative flex flex-col items-center justify-center py-3.5 sm:py-5 rounded-2xl
                shadow-md active:scale-95 transition-all duration-150 cursor-pointer
                disabled:opacity-60 disabled:cursor-not-allowed select-none
                ${buttonStyle} ${animationStyle}
              `}
            >
              {/* Voice Heard Indicator Badge */}
              {isVoiceActive && (
                <span className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-yellow-300 text-slate-900 font-extrabold text-[10px] flex items-center gap-0.5 shadow-sm">
                  <Mic className="w-2.5 h-2.5 text-red-600" />
                  Heard!
                </span>
              )}

              {/* Big Note Letter */}
              <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none">
                {pitch}
              </span>

              {/* Subtle key hint for computer keyboards */}
              <span className="text-[10px] font-bold opacity-70 mt-1 uppercase hidden sm:inline">
                Key [{pitch}]
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
