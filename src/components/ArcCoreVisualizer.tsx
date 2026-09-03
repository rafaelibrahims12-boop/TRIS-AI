import React from 'react';
import { TrisStatus } from '../types';
import { Mic, Activity, Zap, Cpu, Volume2, ShieldCheck } from 'lucide-react';

interface ArcCoreVisualizerProps {
  status: TrisStatus;
  powerKw: number;
  coreTempC: number;
  securityStatus: string;
  onMicClick: () => void;
  isListening: boolean;
  isSpeaking: boolean;
}

export const ArcCoreVisualizer: React.FC<ArcCoreVisualizerProps> = ({
  status,
  powerKw,
  coreTempC,
  securityStatus,
  onMicClick,
  isListening,
  isSpeaking,
}) => {
  // Determine state-dependent visual styling
  const getStatusColor = () => {
    switch (status) {
      case 'LISTENING':
        return '#38bdf8'; // bright sky blue
      case 'PROCESSING':
        return '#f59e0b'; // tactical amber
      case 'SPEAKING':
        return '#00f0ff'; // radiant arc cyan
      case 'IDLE':
      default:
        return '#0ea5e9'; // steady cyan-blue
    }
  };

  const statusColor = getStatusColor();

  return (
    <div id="arc-core-container" className="relative flex flex-col items-center justify-center p-6 bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-sm backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.08)]">
      {/* Background radial glow */}
      <div 
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: statusColor }}
      />

      {/* Top Telemetry Header */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-[#00f2ff] mb-4 px-1 tracking-widest uppercase border-l-2 border-[#00f2ff] pl-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#00f2ff]" />
          <span className="font-bold">CORE REACTOR MATRIX</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse shadow-[0_0_8px_#00f2ff]" />
          <span className="font-bold tracking-widest">{status}</span>
        </div>
      </div>

      {/* Main Holographic Reactor Ring Assembly matching Immersive UI */}
      <div className="relative w-64 h-64 flex items-center justify-center my-3">
        {/* Outer expanding ping ring */}
        <div className="absolute w-64 h-64 rounded-full border border-[#00f2ff]/20 animate-ping pointer-events-none" />

        {/* Outer dashed spinning ring */}
        <div className="absolute w-56 h-56 rounded-full border-2 border-dashed border-[#00f2ff]/40 animate-spin-slow pointer-events-none" />

        {/* Counter-rotating SVG overlay */}
        <svg className="absolute inset-0 w-full h-full animate-spin-reverse-slow pointer-events-none opacity-60" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#00f2ff"
            strokeWidth="1.5"
            strokeDasharray="18 12 4 12"
          />
        </svg>

        {/* Center Glowing Arc Core Reactor Sphere */}
        <div 
          className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500 relative cursor-pointer group ${
            isSpeaking ? 'border-[#00f2ff] shadow-[0_0_50px_rgba(0,242,255,0.7)] bg-[#00f2ff]/15 scale-105' :
            isListening ? 'border-[#38bdf8] shadow-[0_0_40px_rgba(56,189,248,0.6)] bg-[#38bdf8]/15 scale-105' :
            status === 'PROCESSING' ? 'border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.6)] bg-amber-500/10' :
            'border-[#00f2ff] shadow-[0_0_50px_rgba(0,242,255,0.35)] bg-[#00f2ff]/5 hover:shadow-[0_0_60px_rgba(0,242,255,0.5)]'
          }`}
          onClick={onMicClick}
          title={isListening ? 'Listening to voice command... Click to stop' : 'Click to speak to TRIS'}
        >
          <div className="text-center flex flex-col items-center justify-center">
            {isListening ? (
              <Mic className="w-8 h-8 text-white animate-bounce mb-1" />
            ) : isSpeaking ? (
              <Volume2 className="w-8 h-8 text-[#00f2ff] animate-pulse mb-1" />
            ) : (
              <Activity className="w-8 h-8 text-[#00f2ff] group-hover:scale-110 transition-transform mb-1" />
            )}

            <span className="text-[10px] uppercase tracking-widest block text-[#00f2ff]/70 font-mono">
              {isListening ? 'VOICE CAPTURE' : isSpeaking ? 'SYNTHESIZING' : 'VOICE INTERFACE'}
            </span>
            <span className="text-xl font-bold tracking-widest uppercase font-mono text-white">
              {isListening ? 'LISTENING' : isSpeaking ? 'ACTIVE' : 'READY'}
            </span>

            {/* Immersive Sound Waveform equalizer */}
            <div className="flex gap-1 justify-center mt-2 items-end h-5">
              <div className="w-1 h-3 bg-[#00f2ff] animate-pulse shadow-[0_0_8px_#00f2ff]" />
              <div className="w-1 h-5 bg-[#00f2ff] animate-pulse delay-75 shadow-[0_0_8px_#00f2ff]" />
              <div className="w-1 h-4 bg-[#00f2ff] animate-pulse delay-150 shadow-[0_0_8px_#00f2ff]" />
              <div className="w-1 h-6 bg-[#00f2ff] animate-pulse delay-100 shadow-[0_0_8px_#00f2ff]" />
              <div className="w-1 h-3 bg-[#00f2ff] animate-pulse delay-200 shadow-[0_0_8px_#00f2ff]" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Telemetry Bar */}
      <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#00f2ff]/30 font-mono text-center">
        <div className="p-2.5 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
          <div className="flex items-center justify-center gap-1 text-[10px] text-[#00f2ff]/60 uppercase">
            <Zap className="w-3 h-3 text-[#00f2ff]" />
            <span>GRID LOAD</span>
          </div>
          <div className="text-sm font-bold text-white font-mono mt-0.5 tracking-wider">{powerKw.toFixed(1)} kW</div>
        </div>

        <div className="p-2.5 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
          <div className="flex items-center justify-center gap-1 text-[10px] text-[#00f2ff]/60 uppercase">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>CORE TEMP</span>
          </div>
          <div className="text-sm font-bold text-amber-400 font-mono mt-0.5 tracking-wider">{coreTempC.toFixed(1)}°C</div>
        </div>

        <div className="p-2.5 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
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
