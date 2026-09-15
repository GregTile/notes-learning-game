import React, { useState } from 'react';
import { Volume2, Sparkles, Music } from 'lucide-react';
import { MNEMONIC_GUIDE_DATA, ALL_NOTES } from '../utils/musicData';
import { soundEngine } from '../utils/audio';

export const MnemonicReferenceView: React.FC = () => {
  const [selectedClef, setSelectedClef] = useState<'treble' | 'bass'>('treble');

  const playPitch = (noteId: string) => {
    const note = ALL_NOTES[noteId];
    if (note) {
      soundEngine.playPianoNote(note.frequency);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border-2 border-slate-200/80 shadow-sm p-5 sm:p-6 mb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Interactive Memory Sentences</span>
          </h3>
          <p className="text-xs text-slate-500">
            Tap each word or letter to hear how it sounds on the piano!
          </p>
        </div>

        {/* Clef selector */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setSelectedClef('treble')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
              selectedClef === 'treble'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            𝄞 Right Hand
          </button>
          <button
            onClick={() => setSelectedClef('bass')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
              selectedClef === 'bass'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            𝄢 Left Hand
          </button>
        </div>
      </div>

      {selectedClef === 'treble' ? (
        <div className="space-y-4">
          {/* Treble Spaces - FACE */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                Treble Spaces (Bottom to Top)
              </span>
              <span className="text-[11px] font-bold text-emerald-600">F - A - C - E</span>
            </div>
            <p className="text-xs text-emerald-900 mb-3 font-medium">
              The 4 spaces spell out the word <strong>FACE</strong>!
            </p>
            <div className="grid grid-cols-4 gap-2">
              {MNEMONIC_GUIDE_DATA.treble.spaces.items.map((item) => {
                const oct = item.note === 'C' || item.note === 'E' ? '5' : '4';
                return (
                  <button
                    key={item.note}
                    onClick={() => playPitch(`${item.note}${oct}_treble`)}
                    className="p-3 bg-white rounded-xl border border-emerald-200 shadow-xs hover:border-emerald-400 hover:scale-105 active:scale-95 transition flex flex-col items-center cursor-pointer group"
                  >
                    <span className="text-2xl font-black text-emerald-700">{item.note}</span>
                    <span className="text-xs font-semibold text-slate-500 mt-0.5">
                      {item.position}
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-500 mt-1 opacity-70 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Treble Lines - Every Good Boy Deserves Fudge */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase text-blue-800 tracking-wider">
                Treble Lines (Bottom to Top)
              </span>
              <span className="text-[11px] font-bold text-blue-600">E - G - B - D - F</span>
            </div>
            <p className="text-xs text-blue-900 mb-3 font-medium">
              &ldquo;<strong>Every Good Boy Deserves Fudge</strong>&rdquo;
            </p>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {MNEMONIC_GUIDE_DATA.treble.lines.items.map((item) => {
                const oct = item.note === 'D' || item.note === 'F' ? '5' : '4';
                return (
                  <button
                    key={item.word}
                    onClick={() => playPitch(`${item.note}${oct}_treble`)}
                    className="p-2.5 bg-white rounded-xl border border-blue-200 shadow-xs hover:border-blue-400 hover:scale-105 active:scale-95 transition flex flex-col items-center cursor-pointer group"
                  >
                    <span className="text-xl font-black text-blue-700">{item.note}</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5">{item.word}</span>
                    <span className="text-[10px] text-slate-400">
                      {item.position.replace(' (Bottom)', '').replace(' (Top)', '')}
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-blue-500 mt-1 opacity-70 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bass Lines - Green Bears Don't Fly Airplanes */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
                Bass Lines (Bottom to Top)
              </span>
              <span className="text-[11px] font-bold text-amber-600">G - B - D - F - A</span>
            </div>
            <p className="text-xs text-amber-900 mb-3 font-medium">
              &ldquo;<strong>Green Bears Don&apos;t Fly Airplanes</strong>&rdquo;
            </p>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {MNEMONIC_GUIDE_DATA.bass.lines.items.map((item) => {
                const oct = item.note === 'G' || item.note === 'B' ? '2' : '3';
                return (
                  <button
                    key={item.word}
                    onClick={() => playPitch(`${item.note}${oct}_bass`)}
                    className="p-2.5 bg-white rounded-xl border border-amber-200 shadow-xs hover:border-amber-400 hover:scale-105 active:scale-95 transition flex flex-col items-center cursor-pointer group"
                  >
                    <span className="text-xl font-black text-amber-700">{item.note}</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5">{item.word}</span>
                    <span className="text-[10px] text-slate-400">
                      {item.position.replace(' (Bottom)', '').replace(' (Top)', '')}
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-amber-500 mt-1 opacity-70 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bass Spaces - All Cows Eat Grass */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase text-purple-800 tracking-wider">
                Bass Spaces (Bottom to Top)
              </span>
              <span className="text-[11px] font-bold text-purple-600">A - C - E - G</span>
            </div>
            <p className="text-xs text-purple-900 mb-3 font-medium">
              &ldquo;<strong>All Cows Eat Grass</strong>&rdquo;
            </p>
            <div className="grid grid-cols-4 gap-2">
              {MNEMONIC_GUIDE_DATA.bass.spaces.items.map((item) => {
                const oct = item.note === 'A' ? '2' : '3';
                return (
                  <button
                    key={item.note}
                    onClick={() => playPitch(`${item.note}${oct}_bass`)}
                    className="p-3 bg-white rounded-xl border border-purple-200 shadow-xs hover:border-purple-400 hover:scale-105 active:scale-95 transition flex flex-col items-center cursor-pointer group"
                  >
                    <span className="text-2xl font-black text-purple-700">{item.note}</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5">{item.word}</span>
                    <span className="text-xs font-semibold text-slate-400">{item.position}</span>
                    <Volume2 className="w-3.5 h-3.5 text-purple-500 mt-1 opacity-70 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
