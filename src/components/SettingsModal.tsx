import React, { useState, useEffect } from 'react';
import { TrisSettings, GeminiVoiceName } from '../types';
import { trisVoice, tacticalAudio } from '../utils/audio';
import { Settings, Volume2, Sliders, X, Check, RotateCcw, Sparkles, Radio, Activity } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TrisSettings;
  onSaveSettings: (newSettings: TrisSettings) => void;
  onResetFactory: () => void;
}

interface VoiceOption {
  id: GeminiVoiceName;
  name: string;
  badge: string;
  desc: string;
  accent: string;
}

const NEURAL_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'KORE (FRIDAY SIGNATURE)',
    badge: 'HUMAN WARMTH & WIT',
    desc: 'Warm, natural conversational cadence with crisp tactical clarity and lifelike human pauses.',
    accent: 'border-[#00f2ff] text-[#00f2ff]',
  },
  {
    id: 'Zephyr',
    name: 'ZEPHYR (TACTICAL CONVERSATIONAL)',
    badge: 'ARTICULATE & CALM',
    desc: 'Smooth, companion-grade voice with friendly, balanced pacing for complex directives.',
    accent: 'border-sky-400 text-sky-400',
  },
  {
    id: 'Puck',
    name: 'PUCK (RAPID INTEL)',
    badge: 'CRISP & DYNAMIC',
    desc: 'High-tempo, quick-witted tactical intelligence for fast-paced workflow management.',
    accent: 'border-emerald-400 text-emerald-400',
  },
  {
    id: 'Fenrir',
    name: 'FENRIR (DEEP COMMAND)',
    badge: 'RESONANT & AUTHORITATIVE',
    desc: 'Low-frequency, commanding presence modeled after heavy armor operational protocols.',
    accent: 'border-amber-400 text-amber-400',
  },
  {
    id: 'Charon',
    name: 'CHARON (STRATEGIC OPERATOR)',
    badge: 'MEASURED & STOIC',
    desc: 'Unflappable, analytical operator voice tailored for security and defense monitoring.',
    accent: 'border-purple-400 text-purple-400',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetFactory,
}) => {
  const [localSettings, setLocalSettings] = useState<TrisSettings>(settings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  useEffect(() => {
    setLocalSettings({
      callsign: 'Boss',
      voiceSynthesis: true,
      voiceEngine: 'gemini',
      geminiVoice: 'Kore',
      soundEffects: true,
      voiceRate: 1.0,
      voicePitch: 1.0,
      autoBriefingOnLaunch: true,
      ...settings,
    });
    if (typeof window !== 'undefined') {
      const v = trisVoice.getAvailableVoices();
      setVoices(v);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    tacticalAudio.playConfirm();
    setIsPlayingTest(true);

    const testPhrases = {
      Kore: `Good day, ${localSettings.callsign}. TRIS neural human voice matrix is online and calibrated to your frequency. All smart home sectors and daily tasks are ready.`,
      Zephyr: `Standing by, ${localSettings.callsign}. Real-time telemetry is stabilized, and home environmental systems are within nominal margins.`,
      Puck: `Directives loaded, ${localSettings.callsign}! Task queues synchronized and repulsor calibration ready when you are.`,
      Fenrir: `Armor status nominal, ${localSettings.callsign}. Perimeter defense protocols are hard-sealed and awaiting your orders.`,
      Charon: `Diagnostics verified, ${localSettings.callsign}. Arc reactor power flow is locked at forty-eight kilowatts.`,
    };

    const phrase = testPhrases[localSettings.geminiVoice] || testPhrases.Kore;

    trisVoice.speak(phrase, {
      engine: localSettings.voiceEngine,
      geminiVoice: localSettings.geminiVoice,
      rate: localSettings.voiceRate,
      pitch: localSettings.voicePitch,
      voiceURI: localSettings.selectedVoiceURI,
      onStart: () => setIsPlayingTest(true),
      onEnd: () => setIsPlayingTest(false),
      onError: () => setIsPlayingTest(false),
    });
  };

  const handleStopTest = () => {
    trisVoice.stop();
    setIsPlayingTest(false);
  };

  const handleSave = () => {
    tacticalAudio.playConfirm();
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-[#02050a] border border-[#00f2ff]/50 rounded-sm shadow-2xl font-mono overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#02050a] border-b border-[#00f2ff]/30 shrink-0">
          <div className="flex items-center gap-2 border-l-2 border-[#00f2ff] pl-2">
            <Settings className="w-5 h-5 text-[#00f2ff]" />
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-widest">
                TRIS SYSTEM CONFIGURATION
              </h3>
              <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-wider">
                NEURAL CORE & VOICE SYNTHESIS MATRIX
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#00f2ff]/60 hover:text-white p-1.5 rounded-sm hover:bg-[#00f2ff]/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-[#02050a]/90">
          {/* Operator Callsign */}
          <div className="p-3.5 rounded-sm bg-[#00f2ff]/5 border border-[#00f2ff]/30">
            <label className="block text-[11px] text-[#00f2ff] mb-1.5 uppercase tracking-wider font-bold">
              OPERATOR CALLSIGN / PROTOCOL TITLE
            </label>
            <input
              type="text"
              value={localSettings.callsign}
              onChange={(e) => setLocalSettings({ ...localSettings, callsign: e.target.value })}
              placeholder="Boss, Tony, Commander..."
              className="w-full bg-[#02050a] border border-[#00f2ff]/40 focus:border-[#00f2ff] text-white px-3.5 py-2 rounded-sm text-xs font-mono focus:outline-none tracking-wider"
            />
            <p className="text-[10px] text-[#00f2ff]/60 mt-1 uppercase tracking-wide">
              TRIS will address you by this designation in all tactical briefings and conversational voice logs.
            </p>
          </div>

          {/* Voice Engine Mode Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-l-2 border-[#00f2ff] pl-2">
              <span className="text-xs text-[#00f2ff] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#00f2ff]" />
                VOICE SYNTHESIS ENGINE
              </span>
              <span className="text-[10px] text-[#00f2ff]/60 uppercase tracking-widest">
                {localSettings.voiceEngine === 'gemini' ? 'NEURAL STUDIO AUDIO' : 'BROWSER LOCAL'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, voiceEngine: 'gemini' })}
                className={`p-3 rounded-sm border text-left cursor-pointer transition-all ${
                  localSettings.voiceEngine === 'gemini'
                    ? 'bg-[#00f2ff]/15 border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.25)]'
                    : 'bg-[#02050a] border-[#00f2ff]/20 text-[#00f2ff]/60 hover:border-[#00f2ff]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" />
                    HUMAN NEURAL VOICE
                  </span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-[#00f2ff]/20 text-[#00f2ff] font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-normal">
                  Powered by Gemini 3.1 Flash Neural Audio. True human intonation, conversational pauses, and warmth.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, voiceEngine: 'browser' })}
                className={`p-3 rounded-sm border text-left cursor-pointer transition-all ${
                  localSettings.voiceEngine === 'browser'
                    ? 'bg-[#00f2ff]/15 border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.25)]'
                    : 'bg-[#02050a] border-[#00f2ff]/20 text-[#00f2ff]/60 hover:border-[#00f2ff]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                    BROWSER SYNTHESIS
                  </span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    OFFLINE
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-normal">
                  Local client Web Speech API. Low latency, but produces standard synthetic robotic playback.
                </p>
              </button>
            </div>
          </div>

          {/* Gemini Neural Voice Personas Picker */}
          {localSettings.voiceEngine === 'gemini' && (
            <div className="space-y-3">
              <label className="block text-[11px] text-[#00f2ff] uppercase tracking-wider font-bold">
                SELECT TRIS VOICE PERSONALITY
              </label>

              <div className="space-y-2">
                {NEURAL_VOICES.map((v) => {
                  const isSelected = localSettings.geminiVoice === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setLocalSettings({ ...localSettings, geminiVoice: v.id })}
                      className={`p-3 rounded-sm border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#00f2ff]/15 border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                          : 'bg-[#02050a] border-[#00f2ff]/20 hover:border-[#00f2ff]/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {v.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00f2ff]/20 text-[#00f2ff] uppercase font-bold tracking-wider">
                            {v.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{v.desc}</p>
                      </div>

                      <div className="pt-0.5">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#00f2ff] bg-[#00f2ff] text-[#02050a]'
                              : 'border-[#00f2ff]/40'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Browser Voices (if browser engine chosen) */}
          {localSettings.voiceEngine === 'browser' && voices.length > 0 && (
            <div>
              <label className="block text-[10px] text-[#00f2ff]/70 mb-1 uppercase tracking-wider">
                BROWSER SYSTEM VOICE PROFILE
              </label>
              <select
                value={localSettings.selectedVoiceURI || ''}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, selectedVoiceURI: e.target.value })
                }
                className="w-full bg-[#02050a] border border-[#00f2ff]/30 text-white px-2.5 py-2 rounded-sm text-xs font-mono"
              >
                <option value="">Default (Irish / British Female FRIDAY profile)</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Speech Rate & Audio Preview */}
          <div className="p-3.5 rounded-sm bg-[#00f2ff]/5 border border-[#00f2ff]/30 space-y-3">
            <div>
              <div className="flex justify-between text-[10px] text-[#00f2ff]/80 mb-1 uppercase tracking-wider">
                <span>SPEECH SPEED RATE</span>
                <span className="text-white font-bold">{localSettings.voiceRate}x</span>
              </div>
              <input
                type="range"
                min={0.85}
                max={1.3}
                step={0.05}
                value={localSettings.voiceRate}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, voiceRate: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-[#00f2ff]/20 rounded-none appearance-none cursor-pointer accent-[#00f2ff]"
              />
            </div>

            {/* Test Voice Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={isPlayingTest ? handleStopTest : handleTestVoice}
                className={`flex-1 py-2 px-3 rounded-sm text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer font-bold transition-all ${
                  isPlayingTest
                    ? 'bg-amber-500/20 border border-amber-400 text-amber-300 animate-pulse'
                    : 'bg-[#00f2ff]/10 hover:bg-[#00f2ff]/25 border border-[#00f2ff]/50 text-[#00f2ff]'
                }`}
              >
                {isPlayingTest ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-amber-400" />
                    <span>PLAYING HUMAN VOICE (CLICK TO STOP)</span>
                  </>
                ) : (
                  <>
                    <Sliders className="w-4 h-4 text-[#00f2ff]" />
                    <span>PREVIEW HUMAN VOICE ({(localSettings?.geminiVoice || 'Kore').toUpperCase()})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sound FX & Automation Toggles */}
          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-3 rounded-sm bg-[#02050a] border border-[#00f2ff]/20 cursor-pointer">
              <span className="text-[#00f2ff]/90 uppercase tracking-wider">TACTICAL HUD AUDIO FX & CHIMES</span>
              <input
                type="checkbox"
                checked={localSettings.soundEffects}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, soundEffects: e.target.checked })
                }
                className="accent-[#00f2ff] w-4 h-4 rounded-sm cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-sm bg-[#02050a] border border-[#00f2ff]/20 cursor-pointer">
              <span className="text-[#00f2ff]/90 uppercase tracking-wider">AUTO-GENERATE BRIEFING ON LAUNCH</span>
              <input
                type="checkbox"
                checked={localSettings.autoBriefingOnLaunch}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, autoBriefingOnLaunch: e.target.checked })
                }
                className="accent-[#00f2ff] w-4 h-4 rounded-sm cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#02050a] border-t border-[#00f2ff]/30 shrink-0">
          <button
            type="button"
            onClick={onResetFactory}
            className="flex items-center gap-1 text-[#00f2ff]/50 hover:text-red-400 text-[11px] uppercase tracking-wider cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>FACTORY RESET</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-sm bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] text-xs uppercase tracking-wider cursor-pointer border border-[#00f2ff]/30"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1 px-5 py-2 rounded-sm bg-[#00f2ff] hover:brightness-125 text-[#02050a] font-bold text-xs uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(0,242,255,0.4)]"
            >
              <Check className="w-4 h-4" />
              <span>APPLY CONFIG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
