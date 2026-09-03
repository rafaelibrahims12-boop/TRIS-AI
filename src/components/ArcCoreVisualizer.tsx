import React, { useEffect, useState, useRef } from 'react';
import { TrisStatus, GeminiVoiceName } from '../types';
import { Mic, Activity, Zap, Cpu, Volume2, ShieldCheck, VolumeX, Radio } from 'lucide-react';
import { trisVoice } from '../utils/audio';

interface ArcCoreVisualizerProps {
  status: TrisStatus;
  powerKw: number;
  coreTempC: number;
  securityStatus: string;
  onMicClick: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  activeVoiceName?: GeminiVoiceName;
  onStopSpeaking?: () => void;
}

export const ArcCoreVisualizer: React.FC<ArcCoreVisualizerProps> = ({
  status,
  powerKw,
  coreTempC,
  securityStatus,
  onMicClick,
  isListening,
  isSpeaking,
  activeVoiceName = 'Kore',
  onStopSpeaking,
}) => {
  const [frequencies, setFrequencies] = useState<number[]>(new Array(16).fill(0));
  const animFrameRef = useRef<number | null>(null);

  // Sample real Web Audio frequency levels during neural speech synthesis
  useEffect(() => {
    const freqArray = new Uint8Array(16);

    const updateFrequencies = () => {
      if (isSpeaking) {
        trisVoice.getFrequencyData(freqArray);
        // Normalize values to 0-100% scale
        const normalized = Array.from(freqArray).map((v) => Math.min(100, Math.round((v / 255) * 100)));
        setFrequencies(normalized);
        animFrameRef.current = requestAnimationFrame(updateFrequencies);
      } else {
        setFrequencies((prev) => prev.map((v) => Math.max(0, Math.round(v * 0.8))));
      }
    };

    if (isSpeaking) {
      animFrameRef.current = requestAnimationFrame(updateFrequencies);
    } else {
      setFrequencies(new Array(16).fill(0));
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpeaking]);

  const getStatusColor = () => {
    switch (status) {
      case 'LISTENING':
        return '#38bdf8'; // bright sky blue
      case 'PROCESSING':
        return '#f59e0b'; // tactical amber
      case 'SPEAKING':
        return '#00f2ff'; // radiant arc cyan
      case 'IDLE':
      default:
        return '#00f2ff'; // steady cyan
    }
  };

  const statusColor = getStatusColor();

  const handleCoreClick = () => {
    if (isSpeaking && onStopSpeaking) {
      onStopSpeaking();
    } else {
      onMicClick();
    }
  };

  return (
    <div id="arc-core-container" className="relative flex flex-col items-center justify-center p-6 bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-sm backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.1)]">
      {/* Dynamic Background Radial Glow */}
      <div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: statusColor }}
      />

      {/* Top Telemetry Header */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-[#00f2ff] mb-3 px-1 tracking-widest uppercase border-l-2 border-[#00f2ff] pl-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#00f2ff]" />
          <span className="font-bold">ARC NEURAL CORE</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isSpeaking
                ? 'bg-[#00f2ff] animate-ping'
                : isListening
                ? 'bg-sky-400 animate-pulse'
                : status === 'PROCESSING'
                ? 'bg-amber-400 animate-spin'
                : 'bg-[#00f2ff]'
            } shadow-[0_0_8px_#00f2ff]`}
          />
          <span className="font-bold tracking-widest">{status}</span>
        </div>
      </div>

      {/* Main Holographic Reactor Ring Assembly */}
      <div className="relative w-72 h-72 flex items-center justify-center my-2">
        {/* Outer expanding pulse ring */}
        <div
          className={`absolute w-72 h-72 rounded-full border border-[#00f2ff]/20 pointer-events-none ${
            isSpeaking ? 'animate-ping duration-1000' : ''
          }`}
        />

        {/* Outer dashed spinning ring */}
        <div className="absolute w-64 h-64 rounded-full border border-dashed border-[#00f2ff]/40 animate-spin-slow pointer-events-none" />

        {/* Counter-rotating calibrated degree SVG overlay */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin-reverse-slow pointer-events-none opacity-60"
          viewBox="0 0 200 200"
        >
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="#00f2ff"
            strokeWidth="1.2"
            strokeDasharray="20 10 4 10"
          />
          <circle
            cx="100"
            cy="100"
            r="72"
            fill="none"
            stroke="#00f2ff"
            strokeWidth="0.8"
            strokeDasharray="8 8"
          />
        </svg>

        {/* Radial Vocal Frequency Spikes (only when speaking or receiving sound) */}
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {frequencies.map((val, idx) => {
              const deg = (360 / frequencies.length) * idx;
              const height = Math.max(6, (val / 100) * 24);
              return (
                <div
                  key={idx}
                  className="absolute w-1 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff] transition-all duration-75 origin-bottom"
                  style={{
                    height: `${height}px`,
                    transform: `rotate(${deg}deg) translateY(-105px)`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Center Glowing Arc Core Sphere */}
        <div
          className={`w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500 relative cursor-pointer group select-none ${
            isSpeaking
              ? 'border-[#00f2ff] shadow-[0_0_60px_rgba(0,242,255,0.7)] bg-[#00f2ff]/20 scale-105'
              : isListening
              ? 'border-sky-400 shadow-[0_0_50px_rgba(56,189,248,0.7)] bg-sky-500/20 scale-105'
              : status === 'PROCESSING'
              ? 'border-amber-400 shadow-[0_0_45px_rgba(245,158,11,0.6)] bg-amber-500/15'
              : 'border-[#00f2ff] shadow-[0_0_40px_rgba(0,242,255,0.3)] bg-[#00f2ff]/5 hover:shadow-[0_0_60px_rgba(0,242,255,0.5)]'
          }`}
          onClick={handleCoreClick}
          title={
            isSpeaking
              ? 'Click to silence TRIS vocalizer'
              : isListening
              ? 'Listening to voice directive... Click to cancel'
              : 'Click to transmit voice command to TRIS'
          }
        >
          <div className="text-center flex flex-col items-center justify-center px-2">
            {isListening ? (
              <Mic className="w-8 h-8 text-white animate-bounce mb-1" />
            ) : isSpeaking ? (
              <Volume2 className="w-8 h-8 text-[#00f2ff] animate-pulse mb-1" />
            ) : (
              <Activity className="w-8 h-8 text-[#00f2ff] group-hover:scale-110 transition-transform mb-1" />
            )}

            <span className="text-[10px] uppercase tracking-widest block text-[#00f2ff]/80 font-mono font-bold">
              {isListening
                ? 'VOICE CAPTURE'
                : isSpeaking
                ? `HUMAN VOCAL [${(activeVoiceName || 'Kore').toUpperCase()}]`
                : 'TRIS INTERFACE'}
            </span>

            <span className="text-lg font-bold tracking-widest uppercase font-mono text-white">
              {isListening ? 'LISTENING' : isSpeaking ? 'VOCALIZING' : 'CALIBRATED'}
            </span>

            {/* Real-time reactive vocalizer spectrum equalizer */}
            <div className="flex gap-1 justify-center mt-2 items-end h-5 w-28">
              {isSpeaking ? (
                frequencies.slice(0, 7).map((f, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-[#00f2ff] rounded-full transition-all duration-75 shadow-[0_0_8px_#00f2ff]"
                    style={{ height: `${Math.max(4, (f / 100) * 20)}px` }}
                  />
                ))
              ) : (
                <>
                  <div className="w-1 h-3 bg-[#00f2ff]/50" />
                  <div className="w-1 h-5 bg-[#00f2ff]/70" />
                  <div className="w-1 h-4 bg-[#00f2ff]" />
                  <div className="w-1 h-6 bg-[#00f2ff]" />
                  <div className="w-1 h-3 bg-[#00f2ff]/60" />
                </>
              )}
            </div>

            {/* Subtle click prompt */}
            <span className="text-[9px] uppercase tracking-wider text-[#00f2ff]/50 mt-1">
              {isSpeaking ? 'CLICK TO SILENCE' : isListening ? 'CLICK TO STOP' : 'CLICK TO SPEAK'}
            </span>
          </div>
        </div>
      </div>

      {/* Voice Status Pill */}
      <div className="w-full mt-2 py-1.5 px-3 rounded-sm bg-[#02050a] border border-[#00f2ff]/30 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 text-[#00f2ff]">
          <Radio className="w-3.5 h-3.5 text-[#00f2ff]" />
          <span className="uppercase font-bold tracking-wider">
            VOICE: <span className="text-white">{(activeVoiceName || 'Kore').toUpperCase()}</span> (NEURAL HUMAN)
          </span>
        </div>
        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider cursor-pointer"
          >
            <VolumeX className="w-3 h-3" />
            <span>MUTE</span>
          </button>
        )}
      </div>

      {/* Quick Telemetry Matrix Bar */}
      <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#00f2ff]/30 font-mono text-center">
        <div className="p-2 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
          <div className="flex items-center justify-center gap-1 text-[10px] text-[#00f2ff]/60 uppercase">
            <Zap className="w-3 h-3 text-[#00f2ff]" />
            <span>GRID LOAD</span>
          </div>
          <div className="text-sm font-bold text-white font-mono mt-0.5 tracking-wider">{powerKw.toFixed(1)} kW</div>
        </div>

        <div className="p-2 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
          <div className="flex items-center justify-center gap-1 text-[10px] text-[#00f2ff]/60 uppercase">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>CORE TEMP</span>
          </div>
          <div className="text-sm font-bold text-amber-400 font-mono mt-0.5 tracking-wider">{coreTempC.toFixed(1)}°C</div>
        </div>

        <div className="p-2 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
          <div className="flex items-center justify-center gap-1 text-[10px] text-[#00f2ff]/60 uppercase">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>DEFENSE</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5 tracking-wider">{securityStatus}</div>
        </div>
      </div>
    </div>
  );
};
