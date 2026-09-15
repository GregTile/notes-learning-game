import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music } from 'lucide-react';
import {
  NoteDefinition,
  NotePitch,
  LevelConfig,
  ChildProfile,
} from './types';
import { ALL_NOTES, LEVELS } from './utils/musicData';
import { soundEngine } from './utils/audio';
import { voiceService, VoiceState } from './utils/speech';
import {
  loadProfiles,
  saveProfiles,
  getActiveProfileId,
  setActiveProfileId,
  updateProfileProgress,
  resetProfileProgress,
  setProfileUnlockedLevel,
} from './utils/storage';
import { StaffCanvas } from './components/StaffCanvas';
import { AnswerButtons } from './components/AnswerButtons';
import { GameStatsHeader } from './components/GameStatsHeader';
import { ProfileButton, ProfileModal } from './components/ProfileSelector';
import { MnemonicReminderModal } from './components/MnemonicReminderModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { MnemonicReferenceView } from './components/MnemonicReferenceView';

export default function App() {
  // Profiles
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => loadProfiles());
  const [activeProfileId, setActiveProfileIdState] = useState<string>(() => getActiveProfileId());

  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Level & Quiz State
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    return Math.min(activeProfile.unlockedLevel, LEVELS.length);
  });
  const currentLevel: LevelConfig =
    LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(1);
  const [currentNote, setCurrentNote] = useState<NoteDefinition>(() => {
    const firstNoteId = currentLevel.noteIds[0] || 'C4_treble';
    return ALL_NOTES[firstNoteId] || ALL_NOTES['C4_treble'];
  });

  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [lastSelectedPitch, setLastSelectedPitch] = useState<NotePitch | null>(null);
  const [lastCorrectPitch, setLastCorrectPitch] = useState<NotePitch | null>(null);
  const [activeVoicePitch, setActiveVoicePitch] = useState<NotePitch | null>(null);

  // Gamification stats
  const [streak, setStreak] = useState<number>(0);
  const [roundCorrectCount, setRoundCorrectCount] = useState<number>(0);
  const [roundTotalTimeMs, setRoundTotalTimeMs] = useState<number>(0);
  const [lastReactionTimeMs, setLastReactionTimeMs] = useState<number | null>(null);
  const [bestRoundStreak, setBestRoundStreak] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // Settings & Modals
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showMnemonicModal, setShowMnemonicModal] = useState<boolean>(false);
  const [showLevelSelectModal, setShowLevelSelectModal] = useState<boolean>(false);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState<boolean>(false);
  const [showMnemonicHintOnStaff, setShowMnemonicHintOnStaff] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'game' | 'learn'>('game');

  // Completed level stats for modal
  const [completedLevelStats, setCompletedLevelStats] = useState<{
    stars: number;
    accuracy: number;
    avgTimeSec: number;
  }>({ stars: 0, accuracy: 0, avgTimeSec: 0 });

  // Timer tracking
  const noteStartTimeRef = useRef<number>(Date.now());
  const isAnsweringRef = useRef<boolean>(false);
  const prevNoteIdRef = useRef<string>('');

  // Keep track of latest currentNote and feedback in refs for voice recognition callback
  const currentNoteRef = useRef<NoteDefinition>(currentNote);
  currentNoteRef.current = currentNote;
  const feedbackRef = useRef<'idle' | 'correct' | 'incorrect'>(feedback);
  feedbackRef.current = feedback;

  // Update profile when switching
  const handleSelectProfile = (profileId: string) => {
    setActiveProfileIdState(profileId);
    setActiveProfileId(profileId);
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      setCurrentLevelId(Math.min(target.unlockedLevel, LEVELS.length));
    }
  };

  const handleAddProfile = (name: string, avatar: string, color: string) => {
    const newProfile: ChildProfile = {
      id: `child_${Date.now()}`,
      name,
      avatar,
      color,
      unlockedLevel: 1,
      totalStars: 0,
      totalNotesAnswered: 0,
      totalCorrect: 0,
      bestStreak: 0,
      levelRecords: {},
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    saveProfiles(updated);
    handleSelectProfile(newProfile.id);
  };

  const handleEditProfile = (profileId: string, name: string, avatar: string, color: string) => {
    const updated = profiles.map((p) => {
      if (p.id === profileId) {
        return {
          ...p,
          name,
          avatar,
          color,
        };
      }
      return p;
    });
    setProfiles(updated);
    saveProfiles(updated);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (profiles.length <= 1) return;
    const remaining = profiles.filter((p) => p.id !== profileId);
    setProfiles(remaining);
    saveProfiles(remaining);

    // If active profile was deleted, switch to first remaining profile
    if (activeProfileId === profileId) {
      const nextActiveId = remaining[0].id;
      setActiveProfileIdState(nextActiveId);
      setActiveProfileId(nextActiveId);
      setCurrentLevelId(Math.min(remaining[0].unlockedLevel, LEVELS.length));
    }
  };

  // Reset progress for active child
  const handleResetProfileProgress = () => {
    const updated = resetProfileProgress(activeProfile.id);
    setProfiles(updated);
    setCurrentLevelId(1);
    startLevel(1);
  };

  // Manually unlock / advance to level
  const handleAdvanceToLevel = (levelId: number) => {
    const updated = setProfileUnlockedLevel(activeProfile.id, levelId);
    setProfiles(updated);
    setCurrentLevelId(levelId);
    startLevel(levelId);
  };

  // Helper to pick next note ensuring variety
  const pickRandomNoteForLevel = useCallback((level: LevelConfig, excludeId?: string): NoteDefinition => {
    const availableIds = level.noteIds.filter((id) => id !== excludeId);
    const list = availableIds.length > 0 ? availableIds : level.noteIds;
    const randomId = list[Math.floor(Math.random() * list.length)];
    return ALL_NOTES[randomId] || ALL_NOTES['C4_treble'];
  }, []);

  // Start new round / level
  const startLevel = useCallback((levelId: number) => {
    const lvl = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    setCurrentLevelId(lvl.id);
    setCurrentQuestionIdx(1);
    setRoundCorrectCount(0);
    setRoundTotalTimeMs(0);
    setStreak(0);
    setBestRoundStreak(0);
    setFeedback('idle');
    setLastSelectedPitch(null);
    setLastCorrectPitch(null);
    setShowLevelCompleteModal(false);

    const firstNote = pickRandomNoteForLevel(lvl);
    setCurrentNote(firstNote);
    prevNoteIdRef.current = firstNote.id;
    noteStartTimeRef.current = Date.now();
    isAnsweringRef.current = false;

    // Play note audio
    setTimeout(() => {
      soundEngine.playPianoNote(firstNote.frequency);
    }, 200);
  }, [pickRandomNoteForLevel]);

  // When currentLevelId changes, start that level
  useEffect(() => {
    startLevel(currentLevelId);
  }, [currentLevelId, startLevel]);

  // Voice recognition callbacks - persistent, NEVER stop between notes
  useEffect(() => {
    voiceService.registerCallbacks(
      (pitch: NotePitch) => {
        // If system is currently evaluating a note, ignore
        if (isAnsweringRef.current || feedbackRef.current !== 'idle') return;
        setActiveVoicePitch(pitch);
        handleAnswer(pitch);
        setTimeout(() => setActiveVoicePitch(null), 700);
      },
      (state: VoiceState) => {
        setVoiceState(state);
      }
    );

    // Note: Do NOT call voiceService.stop() here so voice mic remains active across re-renders!
  }, []);

  // Handle answering
  const handleAnswer = (userPitch: NotePitch) => {
    if (isAnsweringRef.current || feedbackRef.current !== 'idle') return;
    isAnsweringRef.current = true;

    const currentEvaluatingNote = currentNoteRef.current;
    const timeTaken = Math.max(200, Date.now() - noteStartTimeRef.current);
    setLastReactionTimeMs(timeTaken);
    setLastSelectedPitch(userPitch);
    setLastCorrectPitch(currentEvaluatingNote.pitch);

    const isCorrect = userPitch === currentEvaluatingNote.pitch;

    // Play the user's pressed pitch so they hear the difference if wrong
    const matchingKey = Object.values(ALL_NOTES).find(
      (n) => n.pitch === userPitch && n.clef === currentEvaluatingNote.clef
    );
    soundEngine.playPianoNote(matchingKey ? matchingKey.frequency : currentEvaluatingNote.frequency);

    if (isCorrect) {
      setFeedback('correct');
      soundEngine.playSuccessSound(streak + 1);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestRoundStreak((prev) => Math.max(prev, newStreak));
      setRoundCorrectCount((prev) => prev + 1);
      setRoundTotalTimeMs((prev) => prev + timeTaken);

      // Score calculation: base 100 + speed bonus + streak bonus
      let points = 100;
      if (timeTaken < 1500) points += 100; // Lightning
      else if (timeTaken < 3000) points += 50; // Fast
      if (newStreak >= 3) points += newStreak * 20; // Streak bonus

      setScore((prev) => prev + points);

      // Transition to next question after delay
      setTimeout(() => {
        advanceQuestion(true, timeTaken);
      }, 900);
    } else {
      setFeedback('incorrect');
      soundEngine.playGentleErrorSound();
      setStreak(0);
      setRoundTotalTimeMs((prev) => prev + timeTaken);

      // Advance after visual feedback so kid sees which note it was
      setTimeout(() => {
        advanceQuestion(false, timeTaken);
      }, 1500);
    }
  };

  const advanceQuestion = (wasCorrect: boolean, timeTaken: number) => {
    const isLevelDone = currentQuestionIdx >= currentLevel.totalNotes;

    if (isLevelDone) {
      // Calculate level completion
      const totalCorrect = wasCorrect ? roundCorrectCount + 1 : roundCorrectCount;
      const totalTime = roundTotalTimeMs + timeTaken;
      const totalQ = currentLevel.totalNotes;
      const accuracy = Math.round((totalCorrect / totalQ) * 100);
      const avgSec = Number((totalTime / totalQ / 1000).toFixed(1));

      let stars = 0;
      if (accuracy >= currentLevel.minAccuracyToPass) {
        stars = 1;
        if (accuracy >= 80) stars = 2;
        if (accuracy >= 90 && avgSec <= 3.0) stars = 3;
      }

      setCompletedLevelStats({ stars, accuracy, avgTimeSec: avgSec });
      setShowLevelCompleteModal(true);

      // Persist progress to active child profile
      const updatedProfiles = updateProfileProgress(
        activeProfile.id,
        currentLevel.id,
        accuracy,
        avgSec,
        stars,
        totalQ,
        totalCorrect,
        bestRoundStreak
      );
      setProfiles(updatedProfiles);
    } else {
      // Pick next note
      setCurrentQuestionIdx((prev) => prev + 1);
      setFeedback('idle');
      setLastSelectedPitch(null);
      setLastCorrectPitch(null);

      const nextNote = pickRandomNoteForLevel(currentLevel, prevNoteIdRef.current);
      prevNoteIdRef.current = nextNote.id;
      setCurrentNote(nextNote);
      noteStartTimeRef.current = Date.now();
      isAnsweringRef.current = false;

      // Play next note
      setTimeout(() => {
        soundEngine.playPianoNote(nextNote.frequency);
      }, 150);
    }
  };

  const handleToggleVoice = () => {
    if (voiceState === 'listening') {
      voiceService.stop();
    } else {
      voiceService.start();
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  const handleNextLevel = () => {
    setShowLevelCompleteModal(false);
    if (currentLevelId < LEVELS.length) {
      setCurrentLevelId(currentLevelId + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/30 to-amber-50/20 text-slate-900 pb-12">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Piano Notes Trainer</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] hidden sm:inline">
                  Kids Edition
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Treble &amp; Bass Clef Note Reading with Sound &amp; Continuous Voice
              </p>
            </div>
          </div>

          {/* Mode Switch & Profile Selector */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveTab('game')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  activeTab === 'game'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎮 Play
              </button>
              <button
                onClick={() => setActiveTab('learn')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  activeTab === 'learn'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💡 Memory Tricks
              </button>
            </div>

            {/* Child Profile Button */}
            <ProfileButton
              activeProfile={activeProfile}
              onClick={() => setShowProfileModal(true)}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 pt-4">
        {/* Tab 1: Game Play Mode */}
        {activeTab === 'game' && (
          <div className="space-y-3">
            {/* Header with stats, speed gauge, and voice mic toggle */}
            <GameStatsHeader
              currentLevelTitle={currentLevel.title}
              levelNumber={currentLevel.id}
              totalLevels={LEVELS.length}
              questionNumber={currentQuestionIdx}
              totalQuestions={currentLevel.totalNotes}
              currentStreak={streak}
              lastReactionTimeMs={lastReactionTimeMs}
              voiceState={voiceState}
              onToggleVoice={handleToggleVoice}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onOpenMnemonicGuide={() => setShowMnemonicModal(true)}
              onOpenLevelSelect={() => setShowLevelSelectModal(true)}
              score={score}
            />

            {/* Sheet Music Staff Notation */}
            <StaffCanvas
              note={currentNote}
              feedback={feedback}
              showMnemonicHint={showMnemonicHintOnStaff}
              onPlaySound={() => soundEngine.playPianoNote(currentNote.frequency)}
            />

            {/* Answer Options: A, B, C, D, E, F, G */}
            <AnswerButtons
              onSelectPitch={handleAnswer}
              disabled={
                feedback !== 'idle' ||
                showProfileModal ||
                showLevelSelectModal ||
                showMnemonicModal ||
                showLevelCompleteModal
              }
              activeVoicePitch={activeVoicePitch}
              lastSelectedPitch={lastSelectedPitch}
              lastCorrectPitch={lastCorrectPitch}
              feedback={feedback}
            />

            {/* Optional hint toggle & keyboard shortcut reminder */}
            <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-slate-500 px-3 pt-1">
              <button
                onClick={() => setShowMnemonicHintOnStaff(!showMnemonicHintOnStaff)}
                className="hover:text-indigo-600 font-semibold underline cursor-pointer"
              >
                {showMnemonicHintOnStaff ? '🔒 Cheat Hint: ON (Click to Hide)' : '🔓 Cheat Hint: OFF'}
              </button>

              <span className="text-[11px] text-slate-400">
                {voiceState === 'listening'
                  ? '🎙️ Voice Mic is ON — Say letter name anytime!'
                  : 'Tip: Tap Mic button to answer by voice!'}
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Memory Tricks Reference Explorer */}
        {activeTab === 'learn' && (
          <div className="space-y-4">
            <MnemonicReferenceView />
            <div className="text-center pt-2">
              <button
                onClick={() => setActiveTab('game')}
                className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-md hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
              >
                🎮 Return to Practice Game
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profiles={profiles}
        activeProfile={activeProfile}
        onSelectProfile={handleSelectProfile}
        onAddProfile={handleAddProfile}
        onEditProfile={handleEditProfile}
        onDeleteProfile={handleDeleteProfile}
      />

      <MnemonicReminderModal
        isOpen={showMnemonicModal}
        onClose={() => setShowMnemonicModal(false)}
        initialClef={currentLevel.clef === 'bass' ? 'bass' : 'treble'}
      />

      <LevelSelectModal
        isOpen={showLevelSelectModal}
        onClose={() => setShowLevelSelectModal(false)}
        activeProfile={activeProfile}
        currentLevelId={currentLevelId}
        onSelectLevel={(lvlId) => {
          startLevel(lvlId);
        }}
        onAdvanceToLevel={handleAdvanceToLevel}
        onResetProgress={handleResetProfileProgress}
      />

      <LevelCompleteModal
        isOpen={showLevelCompleteModal}
        level={currentLevel}
        starsEarned={completedLevelStats.stars}
        accuracy={completedLevelStats.accuracy}
        avgTimeSec={completedLevelStats.avgTimeSec}
        bestStreak={bestRoundStreak}
        hasNextLevel={currentLevelId < LEVELS.length}
        onNextLevel={handleNextLevel}
        onReplay={() => startLevel(currentLevelId)}
        onSelectLevel={() => {
          setShowLevelCompleteModal(false);
          setShowLevelSelectModal(true);
        }}
      />
    </div>
  );
}
