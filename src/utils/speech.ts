import { NotePitch } from '../types';

export type VoiceState = 'idle' | 'listening' | 'heard' | 'unsupported' | 'error';

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEventLike) => void;
  onresult: (event: SpeechRecognitionEventLike) => void;
}

export class VoiceRecognitionService {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListeningRequested: boolean = false;
  private onNoteHeard: ((pitch: NotePitch, rawTranscript: string) => void) | null = null;
  private onStateChange: ((state: VoiceState, message?: string) => void) | null = null;
  private currentState: VoiceState = 'idle';

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      this.currentState = 'unsupported';
      return;
    }

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.maxAlternatives = 3;

      rec.onstart = () => {
        this.currentState = 'listening';
        this.onStateChange?.('listening');
      };

      rec.onend = () => {
        if (this.isListeningRequested) {
          // Restart automatically if user wants it active
          try {
            rec.start();
          } catch {
            // Already active or temporarily blocked
          }
        } else {
          this.currentState = 'idle';
          this.onStateChange?.('idle');
        }
      };

      rec.onerror = (e) => {
        if (e.error === 'no-speech') {
          // Normal timeout, ignore
          return;
        }
        if (e.error === 'not-allowed') {
          this.currentState = 'error';
          this.onStateChange?.('error', 'Microphone permission denied.');
          this.isListeningRequested = false;
          return;
        }
        // For transient errors, let it keep listening
      };

      rec.onresult = (event: SpeechRecognitionEventLike) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result && result[0]) {
            const transcript = result[0].transcript.trim().toLowerCase();
            const recognizedPitch = this.parseNoteFromSpeech(transcript);
            if (recognizedPitch) {
              this.currentState = 'heard';
              this.onStateChange?.('heard', `Heard: "${transcript}" → ${recognizedPitch}`);
              this.onNoteHeard?.(recognizedPitch, transcript);
              
              setTimeout(() => {
                if (this.isListeningRequested) {
                  this.currentState = 'listening';
                  this.onStateChange?.('listening');
                }
              }, 400);
            }
          }
        }
      };

      this.recognition = rec;
    } catch {
      this.currentState = 'unsupported';
    }
  }

  public isSupported(): boolean {
    return this.currentState !== 'unsupported' && this.recognition !== null;
  }

  public registerCallbacks(
    onNoteHeard: (pitch: NotePitch, rawTranscript: string) => void,
    onStateChange: (state: VoiceState, message?: string) => void
  ) {
    this.onNoteHeard = onNoteHeard;
    this.onStateChange = onStateChange;
  }

  public start() {
    if (!this.recognition) {
      this.onStateChange?.('unsupported', 'Voice recognition is not supported in this browser.');
      return;
    }
    this.isListeningRequested = true;
    try {
      this.recognition.start();
    } catch {
      // Might already be running
    }
  }

  public stop() {
    this.isListeningRequested = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Safe to ignore
      }
    }
    this.currentState = 'idle';
    this.onStateChange?.('idle');
  }

  public toggle(): boolean {
    if (this.isListeningRequested) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  /**
   * Translates spoken kids' words/pronunciations to note pitch A-G
   */
  private parseNoteFromSpeech(raw: string): NotePitch | null {
    const text = raw.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
    const words = text.split(/\s+/);

    // Direct mappings
    for (const w of words) {
      if (w === 'a' || w === 'ay' || w === 'ey' || w === 'hey' || w === 'eight') return 'A';
      if (w === 'b' || w === 'bee' || w === 'be' || w === 'bea') return 'B';
      if (w === 'c' || w === 'see' || w === 'sea' || w === 'si') return 'C';
      if (w === 'd' || w === 'dee' || w === 'de' || w === 'the') return 'D';
      if (w === 'e' || w === 'ee' || w === 'he' || w === 'ea') return 'E';
      if (w === 'f' || w === 'eff' || w === 'ef' || w === 'if' || w === 'half') return 'F';
      if (w === 'g' || w === 'gee' || w === 'jee' || w === 'je' || w === 'ji') return 'G';
    }

    // Check letter directly in string if length is short (e.g. "it's c", "note d")
    if (text.includes('note a') || text.includes('letter a')) return 'A';
    if (text.includes('note b') || text.includes('letter b')) return 'B';
    if (text.includes('note c') || text.includes('letter c')) return 'C';
    if (text.includes('note d') || text.includes('letter d')) return 'D';
    if (text.includes('note e') || text.includes('letter e')) return 'E';
    if (text.includes('note f') || text.includes('letter f')) return 'F';
    if (text.includes('note g') || text.includes('letter g')) return 'G';

    // Simple single letter match
    const cleanChars = text.replace(/[^a-g]/g, '');
    if (cleanChars.length === 1) {
      return cleanChars.toUpperCase() as NotePitch;
    }

    return null;
  }
}

export const voiceService = new VoiceRecognitionService();
