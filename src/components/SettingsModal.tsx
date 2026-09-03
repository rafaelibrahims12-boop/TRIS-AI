import React, { useState, useEffect } from 'react';
import { TrisSettings } from '../types';
import { trisVoice, tacticalAudio } from '../utils/audio';
import { Settings, Volume2, Sliders, X, Check, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TrisSettings;
  onSaveSettings: (newSettings: TrisSettings) => void;
  onResetFactory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetFactory,
}) => {
  const [localSettings, setLocalSettings] = useState<TrisSettings>(settings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setLocalSettings(settings);
    if (typeof window !== 'undefined') {
      const v = trisVoice.getAvailableVoices();
      setVoices(v);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    tacticalAudio.playConfirm();
    trisVoice.speak(
      `Hello ${localSettings.callsign}. TRIS neural synthesis is online and calibrated to your exact specifications.`,
      {
        rate: localSettings.voiceRate,
        pitch: localSettings.voicePitch,
        voiceURI: localSettings.selectedVoiceURI,
      }
    );
  };

  const handleSave = () => {
    tacticalAudio.playConfirm();
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#02050a] border border-[#00f2ff]/50 rounded-sm p-6 shadow-2xl space-y-5 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-[#00f2ff]/30">
          <div className="flex items-center gap-2 border-l-2 border-[#00f2ff] pl-2">
            <Settings className="w-5 h-5 text-[#00f2ff]" />
            <h3 className="font-bold text-sm text-white uppercase tracking-widest">TRIS SYSTEM CONFIGURATION</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#00f2ff]/60 hover:text-white p-1 rounded-sm hover:bg-[#00f2ff]/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Callsign */}
          <div>
            <label className="block text-[11px] text-[#00f2ff] mb-1.5 uppercase tracking-wider font-bold">
              OPERATOR CALLSIGN / PROTOCOL TITLE
            </label>
            <input
              type="text"
              value={localSettings.callsign}
              onChange={(e) => setLocalSettings({ ...localSettings, callsign: e.target.value })}
              placeholder="Boss, Tony, Commander..."
              className="w-full bg-[#00f2ff]/5 border border-[#00f2ff]/30 focus:border-[#00f2ff] text-white px-3.5 py-2 rounded-sm text-xs font-mono focus:outline-none"
            />
            <p className="text-[10px] text-[#00f2ff]/60 mt-1 uppercase">
              TRIS will address you by this title in all tactical briefings and replies.
            </p>
          </div>

          {/* Voice Synthesis Controls */}
          <div className="p-3.5 rounded-sm bg-[#02050a] border border-[#00f2ff]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#00f2ff] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#00f2ff]" />
                FRIDAY-SPEC VOICE SYNTHESIS
              </span>
              <button
                type="button"
                onClick={() =>
                  setLocalSettings({ ...localSettings, voiceSynthesis: !localSettings.voiceSynthesis })
                }
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  localSettings.voiceSynthesis ? 'bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]' : 'bg-[#02050a] border border-[#00f2ff]/40'
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                    localSettings.voiceSynthesis ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {voices.length > 0 && (
              <div>
                <label className="block text-[10px] text-[#00f2ff]/70 mb-1 uppercase tracking-wider">
                  NEURAL VOICE ACCENT / ENGINE
                </label>
                <select
                  value={localSettings.selectedVoiceURI || ''}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, selectedVoiceURI: e.target.value })
                  }
                  className="w-full bg-[#02050a] border border-[#00f2ff]/30 text-white px-2.5 py-1.5 rounded-sm text-xs font-mono"
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

            {/* Voice Rate Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-[#00f2ff]/70 mb-1 uppercase tracking-wider">
                <span>SPEECH SPEED RATE</span>
                <span className="text-white font-bold">{localSettings.voiceRate}x</span>
              </div>
              <input
                type="range"
                min={0.8}
                max={1.4}
                step={0.05}
                value={localSettings.voiceRate}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, voiceRate: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-[#00f2ff]/20 rounded-none appearance-none cursor-pointer accent-[#00f2ff]"
              />
            </div>

            {/* Test Voice Button */}
            <button
              type="button"
              onClick={handleTestVoice}
              className="w-full py-1.5 px-3 rounded-sm bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 border border-[#00f2ff]/40 text-[#00f2ff] text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer font-bold"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>TEST VOICE SYNTHESIS</span>
            </button>
          </div>

          {/* Sound FX & Auto Briefing */}
          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-sm bg-[#02050a] border border-[#00f2ff]/20 cursor-pointer">
              <span className="text-[#00f2ff]/90 uppercase tracking-wider">TACTICAL HUD AUDIO FX</span>
              <input
                type="checkbox"
                checked={localSettings.soundEffects}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, soundEffects: e.target.checked })
                }
                className="accent-[#00f2ff] w-4 h-4 rounded-sm"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-sm bg-[#02050a] border border-[#00f2ff]/20 cursor-pointer">
              <span className="text-[#00f2ff]/90 uppercase tracking-wider">AUTO-GENERATE BRIEFING ON LAUNCH</span>
              <input
                type="checkbox"
                checked={localSettings.autoBriefingOnLaunch}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, autoBriefingOnLaunch: e.target.checked })
                }
                className="accent-[#00f2ff] w-4 h-4 rounded-sm"
              />
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#00f2ff]/30">
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
              className="px-3 py-1.5 rounded-sm bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] text-xs uppercase tracking-wider cursor-pointer border border-[#00f2ff]/30"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1 px-4 py-1.5 rounded-sm bg-[#00f2ff] hover:brightness-125 text-[#02050a] font-bold text-xs uppercase tracking-widest cursor-pointer shadow-[0_0_12px_rgba(0,242,255,0.3)]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>SAVE CONFIG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
