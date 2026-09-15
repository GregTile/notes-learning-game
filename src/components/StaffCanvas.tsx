import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NoteDefinition } from '../types';
import { Volume2, Sparkles } from 'lucide-react';

interface StaffCanvasProps {
  note: NoteDefinition;
  feedback: 'idle' | 'correct' | 'incorrect';
  showMnemonicHint: boolean;
  onPlaySound: () => void;
}

export const StaffCanvas: React.FC<StaffCanvasProps> = ({
  note,
  feedback,
  showMnemonicHint,
  onPlaySound,
}) => {
  // Staff lines configuration
  // 5 lines from y = 60 (top / line 5) down to y = 140 (bottom / line 1), spacing = 20
  const staffLines = [60, 80, 100, 120, 140];
  const centerY = 100; // Line 3
  const stepSize = 10;
  const noteY = centerY - note.staffPosition * stepSize;

  const isTreble = note.clef === 'treble';

  // Clef and Note positioning:
  // The clef and note appear right next to each other.
  const clefX = isTreble ? 98 : 102;
  const noteX = isTreble ? 188 : 192;

  // Stem direction:
  // If note is below middle line (staffPosition < 0), stem points UP on right
  // If note is on or above middle line (staffPosition >= 0), stem points DOWN on left
  const stemUp = note.staffPosition < 0;
  const stemX = stemUp ? noteX + 11.5 : noteX - 11.5;
  const stemY1 = noteY;
  const stemY2 = stemUp ? noteY - 56 : noteY + 56;

  // Ledger lines
  const ledgerLines: number[] = [];
  if (note.staffPosition <= -6) {
    // Below staff (e.g. Middle C on Treble)
    for (let pos = -6; pos >= note.staffPosition; pos -= 2) {
      ledgerLines.push(centerY - pos * stepSize);
    }
  } else if (note.staffPosition >= 6) {
    // Above staff (e.g. Middle C on Bass)
    for (let pos = 6; pos <= note.staffPosition; pos += 2) {
      ledgerLines.push(centerY - pos * stepSize);
    }
  }

  // Feedback colors
  let noteColor = '#0f172a'; // slate-900
  if (feedback === 'correct') noteColor = '#16a34a'; // green-600
  if (feedback === 'incorrect') noteColor = '#dc2626'; // red-600

  // Only show the hint if explicitly turned on OR during a mistake feedback
  const shouldDisplayHint = showMnemonicHint || feedback === 'incorrect';

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-sm border-2 border-slate-200/80 relative">
      {/* Top Staff Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-xs">
            {isTreble ? '🎼 Treble Clef (Right Hand)' : '𝄢 Bass Clef (Left Hand)'}
          </span>
        </div>

        <button
          onClick={onPlaySound}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer"
          title="Listen to this note pitch"
        >
          <Volume2 className="w-4 h-4 text-indigo-600" />
          <span>Listen</span>
        </button>
      </div>

      {/* SVG Canvas for Musical Staff */}
      <div className="relative flex items-center justify-center overflow-hidden py-1">
        <svg
          viewBox="0 0 380 200"
          className="w-full h-44 sm:h-52 select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background subtle tint */}
          <rect width="380" height="200" fill="#fcfdfe" rx="16" />

          {/* 5 Staff Lines */}
          {staffLines.map((y, idx) => (
            <line
              key={idx}
              x1="30"
              y1={y}
              x2="350"
              y2={y}
              stroke="#64748b"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          ))}

          {/* Left Vertical Start Bar Line */}
          <line x1="30" y1="60" x2="30" y2="140" stroke="#475569" strokeWidth="2.5" />

          {/* Canonical Classical Engraving Vector Treble Clef positioned on staff lines */}
          {isTreble && (
            <g
              id="treble-clef"
              transform={`translate(${clefX}, 50) scale(2.75)`}
            >
              <path
                d="M 12.049,3.5296 C 12.354,6.6559 10.03,9.1859 7.9718,11.231 C 7.0369,12.128 7.8168,11.379 7.3281,11.825 C 7.2259,11.346 7.0295,10.094 7.0479,9.715 C 7.1783,7.0211 9.3677,3.1275 11.286,1.6914 C 11.595,2.2681 11.849,2.3145 12.049,3.5296 Z M 12.7,19.6716 C 11.468,18.7656 9.85,18.5276 8.3664,18.7866 C 8.1751,17.5316 7.9837,16.2766 7.7924,15.0226 C 10.143,12.6936 12.699,9.9904 12.833,6.4832 C 12.892,4.2512 12.557,1.8118 11.155,-0.0004 C 9.4546,0.1278 8.2555,2.1556 7.3531,3.4161 C 5.8642,6.0866 6.2117,9.333 6.7831,12.2126 C 5.9737,13.1646 4.8535,13.9556 4.0557,14.9466 C 1.6996,17.2546 -0.3528,20.3766 0.0511,23.8246 C 0.2344,27.1586 2.6405,30.2586 5.9213,31.0516 C 7.167,31.3666 8.4852,31.3976 9.7454,31.1506 C 9.9653,33.4006 10.772,35.7796 9.8379,37.9636 C 9.1372,39.5616 7.0504,40.9676 5.5054,40.1556 C 4.906,39.8396 5.3917,40.1046 5.0274,39.9036 C 6.0972,39.6466 7.027,38.8676 7.2874,38.3386 C 8.1252,36.8746 6.8876,34.6996 5.132,34.9806 C 2.87,35.0266 1.9416,38.1206 3.3964,39.6656 C 4.7432,41.1856 7.2294,40.9776 8.8265,39.9836 C 10.639,38.8036 10.866,36.4396 10.659,34.4216 C 10.589,33.7436 10.256,31.7516 10.215,31.0346 C 10.912,30.7856 10.424,30.9756 11.408,30.5856 C 14.068,29.5326 15.765,26.3266 15.002,23.4636 C 14.684,21.9946 13.958,20.5496 12.7,19.6716 Z M 13.261,25.4286 C 13.475,27.4196 12.208,29.7496 10.182,30.3886 C 10.046,29.5936 10.01,29.3776 9.9194,28.9136 C 9.4372,26.4536 9.1754,23.9266 8.8034,21.4326 C 10.428,21.2646 12.261,21.9756 12.826,23.6166 C 13.07,24.1936 13.169,24.8136 13.261,25.4286 Z M 8.1124,30.6246 C 5.5683,30.7656 3.1129,29.0296 2.4781,26.5436 C 1.7291,24.3906 1.9498,21.9136 3.2988,20.0396 C 4.4139,18.3376 5.9053,16.9346 7.3274,15.4966 C 7.5104,16.6236 7.6934,17.7506 7.8764,18.8786 C 4.8858,19.6606 2.8718,23.6036 4.6614,26.3296 C 5.1938,27.0936 6.6379,28.5526 7.4269,27.9636 C 6.3249,27.2806 5.4236,26.1046 5.6174,24.7366 C 5.5353,23.4546 6.9873,21.8256 8.2687,21.5386 C 8.7071,24.4076 9.21,27.6116 9.6484,30.4816 C 9.143,30.5816 8.6273,30.6246 8.1124,30.6246 Z"
                fill="#0f172a"
              />
            </g>
          )}

          {/* Canonical Classical Engraving Vector Bass Clef positioned on staff lines */}
          {!isTreble && (
            <g id="bass-clef" transform={`translate(${clefX}, 60)`}>
              {/* Head anchored right on line 4 (F3, y=80, local y=20) */}
              <circle cx="8" cy="20" r="5.5" fill="#0f172a" />
              {/* Main calligraphic arch */}
              <path
                d="M 8,20 C 8,13 16,3 29,3 C 42,3 48,13 48,23 C 48,39 37,56 18,76 C 14,80 10,83 8,85 C 14,79 22,71 27,61 C 34,47 38,34 38,24 C 38,16 33,9 25,9 C 18,9 11,15 11,20 Z"
                fill="#0f172a"
              />
              {/* Terminal lower dot */}
              <circle cx="8" cy="85" r="2.8" fill="#0f172a" />
              {/* Two canonical dots in spaces 3 (y=70, local y=10) and 2 (y=90, local y=30) */}
              <circle cx="54" cy="10" r="3.6" fill="#0f172a" />
              <circle cx="54" cy="30" r="3.6" fill="#0f172a" />
            </g>
          )}

          {/* Ledger Lines */}
          {ledgerLines.map((y, idx) => (
            <line
              key={`ledger-${idx}`}
              x1={noteX - 22}
              y1={y}
              x2={noteX + 22}
              y2={y}
              stroke="#475569"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}

          {/* Note Stem */}
          <line
            x1={stemX}
            y1={stemY1}
            x2={stemX}
            y2={stemY2}
            stroke={noteColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Note Head (Rotated Ellipse for Realistic Notation) */}
          <g transform={`translate(${noteX}, ${noteY}) rotate(-25)`}>
            <ellipse cx="0" cy="0" rx="12.5" ry="9" fill={noteColor} />
          </g>

          {/* In-Staff Helper Tag: Only shown if toggled ON or during mistake */}
          {shouldDisplayHint && (
            <g transform={`translate(${noteX + 26}, ${noteY - 10})`}>
              <rect
                x="-4"
                y="-14"
                width={note.mnemonicWord ? note.mnemonicWord.length * 9 + 40 : 65}
                height="22"
                rx="6"
                fill="#fef3c7"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
              <text
                x="4"
                y="1"
                fill="#854d0e"
                fontSize="11"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                💡 {note.pitch}: {note.mnemonicWord || note.name}
              </text>
            </g>
          )}
        </svg>

        {/* Correct Celebration Floating Icon */}
        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ scale: 0, y: 15, opacity: 0 }}
              animate={{ scale: 1.2, y: -25, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute pointer-events-none flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white font-black text-sm rounded-full shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Correct! {note.pitch}</span>
            </motion.div>
          )}
          {feedback === 'incorrect' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute pointer-events-none px-3 py-1 bg-rose-500 text-white font-black text-xs rounded-full shadow-lg"
            >
              Notice: That was {note.pitch} ({note.mnemonicWord})!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Memory Hint underneath: Only revealed if mistake occurred or parent enabled */}
      {shouldDisplayHint ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center justify-between text-xs text-amber-900 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-amber-950">
              {feedback === 'incorrect' ? '💡 Memory Clue (Review):' : 'Memory Trick:'}
            </span>
            <span className="truncate font-semibold">
              {note.mnemonicPhrase || 'Find this note on your staff!'}
            </span>
          </div>
          {note.mnemonicWord && (
            <span className="ml-2 font-black px-2 py-0.5 rounded bg-amber-200 text-amber-950 shrink-0">
              {note.pitch} = {note.mnemonicWord}
            </span>
          )}
        </motion.div>
      ) : (
        <div className="mt-2 text-center text-[11px] text-slate-400">
          Listen to the sound and read the note on the staff.
        </div>
      )}
    </div>
  );
};
