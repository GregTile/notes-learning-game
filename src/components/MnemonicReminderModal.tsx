import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Volume2, CheckCircle2, Music } from 'lucide-react';
import { MNEMONIC_GUIDE_DATA, ALL_NOTES } from '../utils/musicData';
import { soundEngine } from '../utils/audio';

interface MnemonicReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClef?: 'treble' | 'bass' | 'mixed';
}

export const MnemonicReminderModal: React.FC<MnemonicReminderModalProps> = ({
  isOpen,
  onClose,
  initialClef = 'treble',
}) => {
  const [activeTab, setActiveTab] = useState<'treble' | 'bass'>(
    initialClef === 'bass' ? 'bass' : 'treble'
  );

  if (!isOpen) return null;

  const playNoteAudio = (noteKey: string) => {
    const note = ALL_NOTES[noteKey];
    if (note) {
      soundEngine.playPianoNote(note.frequency);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border-4 border-amber-300 max-w-2xl w-full p-6 md:p-8 relative max-h-[88vh] overflow-y-auto flex flex-col"
        >
          {/* Header Banner */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-sm mb-2 border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Secret Piano Memory Tricks</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Remembering Your Sheet Music Notes!
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-1 max-w-lg mx-auto">
              Use these fun sentences whenever you look at piano sheet music. They unlock every note!
            </p>
          </div>

          {/* Clef Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('treble')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-black transition cursor-pointer ${
                activeTab === 'treble'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>𝄞 Right Hand</span>
              <span className="text-xs opacity-80">(Treble Clef)</span>
            </button>
            <button
              onClick={() => setActiveTab('bass')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-black transition cursor-pointer ${
                activeTab === 'bass'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>𝄢 Left Hand</span>
              <span className="text-xs opacity-80">(Bass Clef)</span>
            </button>
          </div>

          {/* Content for Treble Clef */}
          {activeTab === 'treble' && (
            <div className="space-y-5">
              {/* Spaces Card: FACE */}
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs uppercase tracking-wider">
                    Spaces Between Lines
                  </span>
                  <span className="text-xs font-bold text-emerald-800">Bottom ➔ Top</span>
                </div>
                <h3 className="text-xl font-black text-emerald-950 flex items-center gap-2">
                  <span>😊 Spells</span>
                  <span className="text-2xl text-emerald-600 tracking-widest font-mono font-black">
                    F - A - C - E
                  </span>
                </h3>
                <p className="text-xs md:text-sm text-emerald-800 mt-1 mb-3">
                  The notes sitting comfortably inside the 4 spaces spell out your <strong>FACE</strong>!
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {MNEMONIC_GUIDE_DATA.treble.spaces.items.map((item) => (
                    <button
                      key={item.note}
                      onClick={() => playNoteAudio(`${item.note}${item.note === 'C' || item.note === 'E' ? '5' : '4'}_treble`)}
                      className="flex flex-col items-center bg-white rounded-xl p-2.5 border border-emerald-200 shadow-xs hover:border-emerald-400 hover:scale-105 transition cursor-pointer group"
                    >
                      <span className="text-2xl font-black text-emerald-700 group-hover:text-emerald-900">
                        {item.note}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 mt-0.5">
                        {item.position}
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-500 mt-1 opacity-60 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Lines Card: Every Good Boy Deserves Fudge */}
              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-black text-xs uppercase tracking-wider">
                    Notes On The 5 Lines
                  </span>
                  <span className="text-xs font-bold text-blue-800">Bottom Line ➔ Top Line</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-blue-950">
                  &ldquo;Every Good Boy Deserves Fudge&rdquo;
                </h3>
                <p className="text-xs md:text-sm text-blue-800 mt-1 mb-3">
                  Each word starts with the note on that line: <strong>E - G - B - D - F</strong>
                </p>

                <div className="grid grid-cols-5 gap-1.5 md:gap-2">
                  {MNEMONIC_GUIDE_DATA.treble.lines.items.map((item) => {
                    const octave = item.note === 'D' || item.note === 'F' ? '5' : '4';
                    return (
                      <button
                        key={item.word}
                        onClick={() => playNoteAudio(`${item.note}${octave}_treble`)}
                        className="flex flex-col items-center bg-white rounded-xl p-2 border border-blue-200 shadow-xs hover:border-blue-400 hover:scale-105 transition cursor-pointer group"
                      >
                        <span className="text-xl font-black text-blue-700 group-hover:text-blue-900">
                          {item.note}
                        </span>
                        <span className="text-xs font-bold text-slate-800 mt-0.5">
                          {item.word}
                        </span>
                        <span className="text-[10px] text-slate-400 text-center leading-tight">
                          {item.position.replace(' (Bottom)', '').replace(' (Top)', '')}
                        </span>
                        <Volume2 className="w-3.5 h-3.5 text-blue-500 mt-1 opacity-60 group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Content for Bass Clef */}
          {activeTab === 'bass' && (
            <div className="space-y-5">
              {/* Lines Card: Green Bears Don't Fly Airplanes */}
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-lg bg-amber-600 text-white font-black text-xs uppercase tracking-wider">
                    Notes On The 5 Lines
                  </span>
                  <span className="text-xs font-bold text-amber-800">Bottom Line ➔ Top Line</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-amber-950">
                  &ldquo;Green Bears Don&apos;t Fly Airplanes&rdquo;
                </h3>
                <p className="text-xs md:text-sm text-amber-800 mt-1 mb-3">
                  Follow the lines from bottom to top: <strong>G - B - D - F - A</strong>
                </p>

                <div className="grid grid-cols-5 gap-1.5 md:gap-2">
                  {MNEMONIC_GUIDE_DATA.bass.lines.items.map((item) => {
                    const octave = item.note === 'G' ? '2' : item.note === 'B' ? '2' : '3';
                    return (
                      <button
                        key={item.word}
                        onClick={() => playNoteAudio(`${item.note}${octave}_bass`)}
                        className="flex flex-col items-center bg-white rounded-xl p-2 border border-amber-200 shadow-xs hover:border-amber-400 hover:scale-105 transition cursor-pointer group"
                      >
                        <span className="text-xl font-black text-amber-700 group-hover:text-amber-900">
                          {item.note}
                        </span>
                        <span className="text-xs font-bold text-slate-800 mt-0.5">
                          {item.word}
                        </span>
                        <span className="text-[10px] text-slate-400 text-center leading-tight">
                          {item.position.replace(' (Bottom)', '').replace(' (Top)', '')}
                        </span>
                        <Volume2 className="w-3.5 h-3.5 text-amber-500 mt-1 opacity-60 group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spaces Card: All Cows Eat Grass */}
              <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/50 p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-lg bg-purple-600 text-white font-black text-xs uppercase tracking-wider">
                    Spaces Between Lines
                  </span>
                  <span className="text-xs font-bold text-purple-800">Bottom ➔ Top</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-purple-950">
                  &ldquo;All Cows Eat Grass&rdquo;
                </h3>
                <p className="text-xs md:text-sm text-purple-800 mt-1 mb-3">
                  The notes inside the 4 spaces from bottom to top: <strong>A - C - E - G</strong>
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {MNEMONIC_GUIDE_DATA.bass.spaces.items.map((item) => {
                    const octave = item.note === 'A' ? '2' : '3';
                    return (
                      <button
                        key={item.note}
                        onClick={() => playNoteAudio(`${item.note}${octave}_bass`)}
                        className="flex flex-col items-center bg-white rounded-xl p-2.5 border border-purple-200 shadow-xs hover:border-purple-400 hover:scale-105 transition cursor-pointer group"
                      >
                        <span className="text-2xl font-black text-purple-700 group-hover:text-purple-900">
                          {item.note}
                        </span>
                        <span className="text-xs font-bold text-slate-800 mt-0.5">
                          {item.word}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {item.position}
                        </span>
                        <Volume2 className="w-3.5 h-3.5 text-purple-500 mt-1 opacity-60 group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Close Button */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Music className="w-4 h-4 text-indigo-500" />
              <span>Tap any card above to hear how that piano note sounds!</span>
            </div>
            <button
              id="start-playing-modal-btn"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>I Got It, Let&apos;s Play!</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
