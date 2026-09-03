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

// Voice options definition
export interface SpeakOptions {
  engine?: 'gemini' | 'browser';
  geminiVoice?: 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon';
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

// Advanced Dual-Engine Speech Synthesizer for TRIS (Gemini 3.1 Flash Neural Human Voice + Web Audio Analyzer)
export class TrisSpeechSynthesizer {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private speaking: boolean = false;
  private audioCache = new Map<string, string>(); // key: `${voice}:${cleanedText}` -> base64 wav
  private currentEndCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private initAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    if (this.audioContext && !this.analyser) {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.connect(this.audioContext.destination);
    }
    return this.audioContext;
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

  // Returns live vocal frequency spectrum for HUD equalizer visualization (0-255)
  public getFrequencyData(outputArray: Uint8Array): void {
    if (this.analyser && this.speaking) {
      try {
        this.analyser.getByteFrequencyData(outputArray);
        return;
      } catch {
        // ignore
      }
    }
    // If not speaking, decay to zero
    outputArray.fill(0);
  }

  // Primary speak method: defaults to Gemini Neural Human Voice
  public async speak(text: string, options: SpeakOptions = {}) {
    this.stop();

    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/\/\/+/g, ' - ')
      .trim();

    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    const engine = options.engine ?? 'gemini';
    const geminiVoice = options.geminiVoice ?? 'Kore';

    if (engine === 'gemini') {
      try {
        await this.speakNeuralGemini(cleanText, geminiVoice, options);
      } catch (err) {
        console.warn('Neural TTS fallback to browser speech synthesis:', err);
        this.speakBrowser(cleanText, options);
      }
    } else {
      this.speakBrowser(cleanText, options);
    }
  }

  // Speak using Gemini 3.1 Flash Neural Human Voice
  private async speakNeuralGemini(text: string, voiceName: string, options: SpeakOptions) {
    const cacheKey = `${voiceName}:${text.slice(0, 150)}`;
    let audioBase64 = this.audioCache.get(cacheKey);

    if (!audioBase64) {
      const response = await fetch('/api/tris/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceName,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS server responded with ${response.status}`);
      }

      const data = await response.json();
      if (!data.audioBase64) {
        throw new Error('No audio returned by TTS endpoint');
      }

      audioBase64 = data.audioBase64;
      // Keep cache size bounded
      if (this.audioCache.size > 50) {
        const firstKey = this.audioCache.keys().next().value;
        if (firstKey) this.audioCache.delete(firstKey);
      }
      this.audioCache.set(cacheKey, audioBase64!);
    }

    const audioBlob = this.base64ToBlob(audioBase64!, 'audio/wav');
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    this.currentAudio = audio;
    audio.playbackRate = options.rate ?? 1.0;

    // Connect to Web Audio Analyser for live visualizer waveform
    try {
      const ctx = this.initAudioContext();
      if (ctx && this.analyser) {
        // Avoid recreating source on same element
        const source = ctx.createMediaElementSource(audio);
        source.connect(this.analyser);
      }
    } catch {
      // Audio element will still play directly through HTMLAudioElement
    }

    this.speaking = true;
    options.onStart?.();

    const cleanup = () => {
      this.speaking = false;
      URL.revokeObjectURL(audioUrl);
      this.currentAudio = null;
      options.onEnd?.();
    };

    audio.onended = cleanup;
    audio.onerror = () => {
      this.speaking = false;
      URL.revokeObjectURL(audioUrl);
      this.currentAudio = null;
      options.onError?.();
    };

    try {
      await audio.play();
    } catch {
      cleanup();
    }
  }

  // Fallback: Browser Web Speech API with natural voice heuristics
  private speakBrowser(cleanText: string, options: SpeakOptions) {
    if (!this.synth) {
      options.onEnd?.();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;

      const voices = this.getAvailableVoices();
      let chosenVoice: SpeechSynthesisVoice | undefined;

      if (options.voiceURI) {
        chosenVoice = voices.find(v => v.voiceURI === options.voiceURI);
      }

      if (!chosenVoice) {
        // Kerry Condon / FRIDAY Irish accent
        chosenVoice = voices.find(v => v.lang === 'en-IE' || v.lang.startsWith('en_IE'));
      }

      if (!chosenVoice) {
        // British or natural sounding female voices
        chosenVoice = voices.find(v => 
          (v.lang.startsWith('en-GB') || v.lang.startsWith('en')) &&
          (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Serena'))
        );
      }

      if (!chosenVoice) {
        chosenVoice = voices.find(v => v.lang.startsWith('en'));
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      this.speaking = true;
      utterance.onstart = () => {
        this.speaking = true;
        options.onStart?.();
      };
      utterance.onend = () => {
        this.speaking = false;
        options.onEnd?.();
      };
      utterance.onerror = () => {
        this.speaking = false;
        options.onError?.();
      };

      this.synth.speak(utterance);
    } catch {
      this.speaking = false;
      options.onEnd?.();
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  public stop() {
    this.speaking = false;
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return this.speaking || !!this.synth?.speaking;
  }
}

export const trisVoice = new TrisSpeechSynthesizer();
