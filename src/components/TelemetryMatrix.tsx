import React from 'react';
import { ArcCoreTelemetry } from '../types';
import { ShieldCheck, Wind, Gauge, BatteryCharging, Radio, RefreshCw } from 'lucide-react';

interface TelemetryMatrixProps {
  telemetry: ArcCoreTelemetry;
  onRunDiagnostics: () => void;
  isRunningDiagnostics: boolean;
}

export const TelemetryMatrix: React.FC<TelemetryMatrixProps> = ({
  telemetry,
  onRunDiagnostics,
  isRunningDiagnostics,
}) => {
  return (
    <div id="telemetry-matrix" className="bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-sm p-5 backdrop-blur-md shadow-2xl space-y-4 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[#00f2ff]/30">
        <div className="flex items-center gap-2 border-l-2 border-[#00f2ff] pl-2">
          <Radio className="w-5 h-5 text-[#00f2ff]" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">
              ARC REACTOR & ENVIRONMENTAL TELEMETRY
            </h3>
            <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-wider">
              REAL-TIME DIAGNOSTIC FEED // STARK INDUSTRIES PROTOCOL
            </p>
          </div>
        </div>

        <button
          onClick={onRunDiagnostics}
          disabled={isRunningDiagnostics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 border border-[#00f2ff]/40 hover:border-[#00f2ff] text-[#00f2ff] text-[11px] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostics ? 'animate-spin text-[#00f2ff]' : ''}`} />
          <span>{isRunningDiagnostics ? 'CALCULATING...' : 'RUN SWEEP'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Arc Output */}
        <div className="p-3 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20 border-l-2 border-l-[#00f2ff] relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-[#00f2ff]/70 mb-1 uppercase tracking-wider">
            <span>ARC OUTPUT</span>
            <span className="text-[#00f2ff] font-bold">NOMINAL</span>
          </div>
          <div className="text-xl font-bold text-white">
            {telemetry.arcOutputKw.toFixed(1)} <span className="text-xs font-normal text-[#00f2ff]/70">kW</span>
          </div>
          <div className="w-full bg-[#00f2ff]/20 h-1 mt-2 overflow-hidden">
            <div
              className="bg-[#00f2ff] h-full shadow-[0_0_8px_#00f2ff] transition-all duration-700"
              style={{ width: `${(telemetry.arcOutputKw / 60) * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-[#00f2ff]/50 mt-1.5 uppercase">Load: {telemetry.gridLoadPercent}% Total Cap</div>
        </div>

        {/* Battery Reserves */}
        <div className="p-3 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20 border-l-2 border-l-emerald-500">
          <div className="flex items-center justify-between text-[10px] text-[#00f2ff]/70 mb-1 uppercase tracking-wider">
            <span>BATTERY RESERVE</span>
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {telemetry.batteryReservePercent}%
          </div>
          <div className="w-full bg-[#00f2ff]/20 h-1 mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all duration-700"
              style={{ width: `${telemetry.batteryReservePercent}%` }}
            />
          </div>
          <div className="text-[10px] text-[#00f2ff]/50 mt-1.5 uppercase">Est. runtime: 78h isolation</div>
        </div>

        {/* Environmental Air Quality */}
        <div className="p-3 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20 border-l-2 border-l-[#00f2ff]">
          <div className="flex items-center justify-between text-[10px] text-[#00f2ff]/70 mb-1 uppercase tracking-wider">
            <span>ATMOSPHERE</span>
            <Wind className="w-3.5 h-3.5 text-[#00f2ff]" />
          </div>
          <div className="text-xl font-bold text-white">
            AQI 12 <span className="text-xs font-normal text-emerald-400">PRISTINE</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#00f2ff]/70 mt-2 uppercase">
            <span>Humidity: 44%</span>
            <span>O₂: 21.2%</span>
          </div>
          <div className="text-[10px] text-[#00f2ff]/50 mt-0.5 uppercase">HEPA-Carbon filter active</div>
        </div>

        {/* Security Matrix */}
        <div className="p-3 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20 border-l-2 border-l-[#00f2ff]">
          <div className="flex items-center justify-between text-[10px] text-[#00f2ff]/70 mb-1 uppercase tracking-wider">
            <span>PERIMETER MESH</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#00f2ff]" />
          </div>
          <div className="text-xl font-bold text-white uppercase tracking-wider">
            {telemetry.securityStatus}
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#00f2ff]/70 mt-2 uppercase">
            <span>Sensors: 4/4 Online</span>
            <span>Mesh: Sealed</span>
          </div>
          <div className="text-[10px] text-[#00f2ff]/50 mt-0.5 uppercase">Zero breaches detected</div>
        </div>
      </div>
    </div>
  );
};
