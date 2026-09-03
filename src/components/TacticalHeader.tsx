import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bell, BellOff, Settings, Sparkles, Terminal, Radio } from 'lucide-react';
import { TrisSettings } from '../types';

interface TacticalHeaderProps {
  settings: TrisSettings;
  onUpdateSettings: (newSettings: Partial<TrisSettings>) => void;
  onOpenSettings: () => void;
  onRequestBriefing: () => void;
  pendingTasksCount: number;
  isSpeaking?: boolean;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings,
  onRequestBriefing,
  pendingTasksCount,
  isSpeaking = false,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).toUpperCase()
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header id="tactical-header" className="w-full bg-[#02050a]/95 border-b border-[#00f2ff]/30 px-4 lg:px-8 py-3.5 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand Identity & Callsign */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#00f2ff]/10 border border-[#00f2ff]/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,255,0.3)]">
              <Terminal className="w-5 h-5 text-[#00f2ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono font-bold text-2xl tracking-[0.2em] uppercase text-white">TRIS</h1>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#00f2ff]/10 border border-[#00f2ff]/40 text-[#00f2ff] uppercase tracking-wider">
                  FRIDAY PROTOCOL
                </span>
              </div>
              <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-widest font-mono">
                TACTICAL RESOURCE & INTELLIGENT SYSTEM // <span className="text-[#00f2ff] font-bold">{(settings?.callsign || 'Boss').toUpperCase()}</span>
              </p>
            </div>
          </div>

          {/* Quick tasks alert pill on mobile */}
          <div className="md:hidden text-[10px] font-mono px-2 py-1 rounded-sm bg-amber-500/10 border-l-2 border-amber-500 text-amber-400 uppercase tracking-wider">
            {pendingTasksCount} QUEUED
          </div>
        </div>

        {/* Center: System Telemetry (Latency, Human Voice Status, Local Time) */}
        <div className="hidden lg:flex items-center gap-6 text-right font-mono">
          {/* Neural Voice Engine Status Badge */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-[#00f2ff]/20 border-[#00f2ff] shadow-[0_0_12px_rgba(0,242,255,0.4)]'
                : 'bg-[#00f2ff]/5 border-[#00f2ff]/30 hover:border-[#00f2ff]/60'
            }`}
            title="Click to configure TRIS voice synthesis and models"
          >
            <Radio className={`w-3.5 h-3.5 ${isSpeaking ? 'text-[#00f2ff] animate-pulse' : 'text-[#00f2ff]'}`} />
            <div className="text-left flex flex-col">
              <span className="text-[9px] text-[#00f2ff]/70 uppercase tracking-wider font-bold">
                {settings?.voiceEngine === 'gemini' ? 'NEURAL HUMAN VOICE' : 'BROWSER TTS'}
              </span>
              <span className="text-xs font-bold text-white tracking-widest">
                {settings?.voiceEngine === 'gemini' ? (settings?.geminiVoice || 'Kore').toUpperCase() : 'OFFLINE'}
              </span>
            </div>
            {isSpeaking && (
              <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-ping" />
            )}
          </button>

          <div className="flex flex-col text-left">
            <span className="text-[10px] text-[#00f2ff]/60 uppercase tracking-wider">System Latency</span>
            <span className="text-base font-bold text-white tracking-widest">12ms</span>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] text-[#00f2ff]/60 uppercase tracking-wider">Local Time ({dateStr})</span>
            <span className="text-base font-bold text-white tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-ping" />
              {timeStr}
            </span>
          </div>
        </div>

        {/* Right: Actions, Briefing trigger & Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Quick Morning Briefing Button */}
          <button
            id="header-briefing-btn"
            onClick={onRequestBriefing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-[#00f2ff] hover:brightness-125 text-[#02050a] text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_12px_rgba(0,242,255,0.3)]"
            title="Ask TRIS for daily schedule & home telemetry briefing"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#02050a]" />
            <span>BRIEFING</span>
          </button>

          {/* Voice Synthesis Toggle */}
          <button
            id="header-voice-toggle"
            onClick={() => onUpdateSettings({ voiceSynthesis: !settings.voiceSynthesis })}
            className={`p-2 rounded-sm border transition-all cursor-pointer ${
              settings.voiceSynthesis
                ? 'bg-[#00f2ff]/20 border-[#00f2ff] text-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.3)]'
                : 'bg-[#00f2ff]/5 border-[#00f2ff]/20 text-[#00f2ff]/40 hover:text-[#00f2ff]'
            }`}
            title={settings.voiceSynthesis ? 'Voice Synthesis Enabled (Click to Mute)' : 'Voice Synthesis Muted (Click to Enable)'}
          >
            {settings.voiceSynthesis ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Sound FX Toggle */}
          <button
            id="header-soundfx-toggle"
            onClick={() => onUpdateSettings({ soundEffects: !settings.soundEffects })}
            className={`p-2 rounded-sm border transition-all cursor-pointer ${
              settings.soundEffects
                ? 'bg-[#00f2ff]/20 border-[#00f2ff] text-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.3)]'
                : 'bg-[#00f2ff]/5 border-[#00f2ff]/20 text-[#00f2ff]/40 hover:text-[#00f2ff]'
            }`}
            title={settings.soundEffects ? 'Sound FX Enabled (Click to Mute)' : 'Sound FX Muted (Click to Enable)'}
          >
            {settings.soundEffects ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          {/* Settings Modal */}
          <button
            id="header-settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-sm bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 border border-[#00f2ff]/40 text-[#00f2ff] transition-all cursor-pointer"
            title="Open TRIS Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
