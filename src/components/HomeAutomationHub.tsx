import React, { useState } from 'react';
import { SmartDevice, TacticalProtocol, DeviceZone } from '../types';
import {
  Lightbulb,
  Lock,
  Unlock,
  Thermometer,
  Zap,
  Shield,
  Sliders,
  Tv,
  Fan,
  SunMedium,
  CheckCircle2,
  Radio,
  Building2,
} from 'lucide-react';

interface HomeAutomationHubProps {
  devices: SmartDevice[];
  protocols: TacticalProtocol[];
  onToggleDevice: (deviceId: string) => void;
  onUpdateDeviceValue: (deviceId: string, value: number) => void;
  onToggleLock: (deviceId: string) => void;
  onActivateProtocol: (protocolId: string) => void;
}

export const HomeAutomationHub: React.FC<HomeAutomationHubProps> = ({
  devices,
  protocols,
  onToggleDevice,
  onUpdateDeviceValue,
  onToggleLock,
  onActivateProtocol,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  const filteredDevices = devices.filter((d) => {
    if (selectedZone !== 'ALL' && d.zone !== selectedZone) return false;
    return true;
  });

  const totalWattage = devices.reduce((sum, d) => (d.state ? sum + d.energyWattage : sum), 0);
  const activeDevicesCount = devices.filter((d) => d.state).length;

  const getDeviceIcon = (d: SmartDevice) => {
    switch (d.type) {
      case 'light':
        return <Lightbulb className="w-4 h-4" />;
      case 'lock':
        return d.isLocked ? <Lock className="w-4 h-4 text-emerald-400" /> : <Unlock className="w-4 h-4 text-amber-400" />;
      case 'climate':
        return <Thermometer className="w-4 h-4 text-cyan-400" />;
      case 'power':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'security_sensor':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'entertainment':
        return <Tv className="w-4 h-4 text-indigo-400" />;
      default:
        return <Fan className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div id="home-automation-hub" className="bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-sm p-5 backdrop-blur-md shadow-2xl space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#00f2ff]/30">
        <div className="border-l-2 border-[#00f2ff] pl-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00f2ff]" />
            <h2 className="text-base font-bold text-white uppercase tracking-widest">
              HOME AUTOMATION & LAB INFRASTRUCTURE
            </h2>
          </div>
          <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-widest mt-0.5">
            ZONAL PERIMETERS, SMART CIRCUITS & DEFENSE PROTOCOLS
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-sm bg-[#02050a] border border-[#00f2ff]/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse shadow-[0_0_6px_#00f2ff]" />
            <span className="text-[#00f2ff]/70 text-[10px] uppercase">CIRCUITS:</span>
            <span className="text-white font-bold">
              {activeDevicesCount}/{devices.length}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-sm bg-[#02050a] border border-[#00f2ff]/30 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-400/80 text-[10px] uppercase">DRAW:</span>
            <span className="text-orange-400 font-bold">{totalWattage} W</span>
          </div>
        </div>
      </div>

      {/* Tactical Protocols (1-Click Presets) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#00f2ff]/70">
          <span className="flex items-center gap-1.5 text-[#00f2ff] font-bold uppercase tracking-widest text-[11px] border-l-2 border-[#00f2ff] pl-2">
            <Radio className="w-3.5 h-3.5 text-[#00f2ff]" />
            TACTICAL PROTOCOL PRESETS
          </span>
          <span className="text-[10px] uppercase tracking-wider">AUTONOMOUS SUB-ROUTINES</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {protocols.map((protocol) => (
            <div
              key={protocol.id}
              onClick={() => onActivateProtocol(protocol.id)}
              className={`p-3 rounded-sm border transition-all cursor-pointer group relative overflow-hidden ${
                protocol.isActive
                  ? 'bg-[#00f2ff]/20 border-l-2 border-l-[#00f2ff] border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.3)]'
                  : 'bg-[#02050a] border-l-2 border-l-[#00f2ff]/40 border-[#00f2ff]/20 hover:border-[#00f2ff]/60 hover:bg-[#00f2ff]/5'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] text-[#00f2ff]/60 uppercase tracking-widest font-bold">
                  {protocol.codename}
                </span>
                {protocol.isActive ? (
                  <span className="flex items-center gap-1 text-[9px] text-[#02050a] bg-[#00f2ff] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    ENGAGED
                  </span>
                ) : (
                  <span className="text-[9px] text-[#00f2ff]/40 group-hover:text-[#00f2ff] uppercase tracking-wider">
                    STANDBY
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-[#00f2ff] transition-colors">
                {protocol.name}
              </h4>
              <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {protocol.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-[#00f2ff]/20">
        {[
          { id: 'ALL', label: 'ALL SECTORS' },
          { id: 'workshop', label: 'WORKSHOP & LAB' },
          { id: 'living', label: 'LIVING QUARTERS' },
          { id: 'climate', label: 'CLIMATE & HVAC' },
          { id: 'security', label: 'SECURITY & DEFENSE' },
          { id: 'power', label: 'POWER GRID' },
          { id: 'bedroom', label: 'MASTER QUARTERS' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedZone(tab.id)}
            className={`px-3 py-1.5 rounded-sm whitespace-nowrap text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
              selectedZone === tab.id
                ? 'bg-[#00f2ff] text-[#02050a] font-bold shadow-[0_0_10px_rgba(0,242,255,0.4)]'
                : 'bg-[#00f2ff]/5 border border-[#00f2ff]/20 text-[#00f2ff]/70 hover:text-white hover:bg-[#00f2ff]/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredDevices.map((device) => {
          const isOn = device.state;
          return (
            <div
              key={device.id}
              className={`p-4 rounded-sm border transition-all ${
                isOn
                  ? 'bg-[#00f2ff]/10 border-l-2 border-l-[#00f2ff] border-[#00f2ff]/40 shadow-[0_0_15px_rgba(0,242,255,0.08)]'
                  : 'bg-[#02050a]/80 border-l-2 border-l-[#00f2ff]/20 border-[#00f2ff]/15 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-sm flex items-center justify-center border transition-colors ${
                      isOn
                        ? 'bg-[#00f2ff]/20 border-[#00f2ff]/60 text-[#00f2ff]'
                        : 'bg-[#02050a] border-[#00f2ff]/20 text-[#00f2ff]/40'
                    }`}
                  >
                    {getDeviceIcon(device)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{device.name}</h4>
                    <span className="text-[9px] text-[#00f2ff]/60 uppercase tracking-wider">
                      ZONE // {device.zone}
                    </span>
                  </div>
                </div>

                {/* Power Toggle Switch */}
                <button
                  onClick={() => onToggleDevice(device.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isOn ? 'bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]' : 'bg-[#02050a] border border-[#00f2ff]/40'
                  }`}
                  title={isOn ? 'Turn device OFF' : 'Turn device ON'}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                      isOn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Status and Telemetry Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-[#00f2ff]/70">
                  <span className="uppercase tracking-wider">TELEMETRY:</span>
                  <span className={isOn ? 'text-[#00f2ff] font-bold' : 'text-[#00f2ff]/40'}>
                    {device.statusText || (isOn ? 'ACTIVE' : 'OFFLINE')}
                  </span>
                </div>

                {/* Interactive Slider for Lights & Appliances */}
                {device.value !== undefined && device.type !== 'lock' && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[10px] text-[#00f2ff]/70 mb-1">
                      <span className="flex items-center gap-1 uppercase tracking-wider">
                        <Sliders className="w-3 h-3 text-[#00f2ff]" />
                        {device.type === 'climate' ? 'TARGET TEMP' : 'LEVEL / POWER'}
                      </span>
                      <span className="text-white font-bold">
                        {device.value}
                        {device.unit || '%'}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={device.type === 'climate' ? 62 : 0}
                      max={device.type === 'climate' ? 82 : 100}
                      value={device.value}
                      disabled={!isOn}
                      onChange={(e) => onUpdateDeviceValue(device.id, Number(e.target.value))}
                      className="w-full h-1.5 bg-[#00f2ff]/20 rounded-none appearance-none cursor-pointer accent-[#00f2ff] disabled:opacity-40"
                    />
                  </div>
                )}

                {/* Lock Controls for Security Deadbolts */}
                {device.type === 'lock' && (
                  <div className="pt-1">
                    <button
                      onClick={() => onToggleLock(device.id)}
                      className={`w-full py-1.5 px-3 rounded-sm border flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                        device.isLocked
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-400 hover:bg-emerald-900/60'
                          : 'bg-orange-950/60 border-orange-500/60 text-orange-400 hover:bg-orange-900/60'
                      }`}
                    >
                      {device.isLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>LOCKED (ENGAGED)</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>DISENGAGED (UNLOCKED)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Energy usage readout */}
                <div className="flex items-center justify-between text-[10px] text-[#00f2ff]/50 pt-1 border-t border-[#00f2ff]/20 uppercase">
                  <span>ENERGY CONSUMPTION</span>
                  <span>{isOn ? `${device.energyWattage}W` : '0W (Standby)'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
