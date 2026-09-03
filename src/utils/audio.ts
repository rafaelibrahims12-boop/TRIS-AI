// Web Audio API tactical sound synthesizer for TRIS HUD
class TacticalAudioSystem {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Initialized lazily on first user interaction
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Futuristic short click / button tap
  public playBeep(freq = 1200, duration = 0.05, type: OscillatorType = 'sine') {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore audio context failures
    }
  }

  // High-tech command confirmation chirp (two-tone ascending)
  public playConfirm() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1320, t + 0.06);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.16);
    } catch {
      // ignore
    }
  }

  // Protocol alert / warning chirp
  public playAlert() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.linearRampToValueAtTime(740, t + 0.08);
      osc.frequency.linearRampToValueAtTime(520, t + 0.16);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    } catch {
      // ignore
    }
  }

  // AI Awakening / listening chime
  public playWake() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(587.33, t); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, t + 0.15); // A5

      osc2.frequency.setValueAtTime(1174.66, t); // D6
      osc2.frequency.exponentialRampToValueAtTime(1760, t + 0.18); // A6

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.25);
      osc2.stop(t + 0.25);
    } catch {
      // ignore
    }
  }

  // Device power toggle pulse
  public playToggle(active: boolean) {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (active) {
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.08);
      } else {
        osc.frequency.setValueAtTime(1000, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);
      }

      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch {
      // ignore
    }
  }
}

export const tacticalAudio = new TacticalAudioSystem();

// Web Speech API Voice synthesis helper (FRIDAY persona)
export class TrisSpeechSynthesizer {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      voiceURI?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    } = {}
  ) {
    if (!this.synth) {
      options.onEnd?.();
      return;
    }

    try {
      // Cancel previous speech if ongoing
      this.synth.cancel();

      // Clean text for speech (strip markdown asterisks, backticks, bullet symbols)
      const cleanText = text
        .replace(/[*_#`~]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/https?:\/\/\S+/g, 'link')
        .trim();

      if (!cleanText) {
        options.onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = options.rate ?? 1.05;
      utterance.pitch = options.pitch ?? 1.0;

      // Select voice (prioritize Irish, British English, or crisp female voices like FRIDAY)
      const voices = this.getAvailableVoices();
      let chosenVoice: SpeechSynthesisVoice | undefined;

      if (options.voiceURI) {
        chosenVoice = voices.find(v => v.voiceURI === options.voiceURI);
      }

      if (!chosenVoice) {
        // Look for Irish English (en-IE) as FRIDAY in Marvel is voiced by Kerry Condon (Irish accent!)
        chosenVoice = voices.find(v => v.lang === 'en-IE' || v.lang.startsWith('en_IE'));
      }

      if (!chosenVoice) {
        // Next look for British female voices (en-GB) or crisp natural voices
        chosenVoice = voices.find(v => 
          (v.lang.startsWith('en-GB') || v.lang.startsWith('en-')) &&
          (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Serena') || v.name.includes('Victoria') || v.name.includes('Zira'))
        );
      }

      if (!chosenVoice) {
        // Fallback to any English voice
        chosenVoice = voices.find(v => v.lang.startsWith('en'));
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      utterance.onstart = () => options.onStart?.();
      utterance.onend = () => options.onEnd?.();
      utterance.onerror = () => options.onError?.();

      this.synth.speak(utterance);
    } catch {
      options.onEnd?.();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return !!this.synth?.speaking;
  }
}

export const trisVoice = new TrisSpeechSynthesizer();
