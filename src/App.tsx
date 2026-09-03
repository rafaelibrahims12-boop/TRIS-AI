/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SmartDevice,
  TacticalProtocol,
  Task,
  TrisSettings,
  TrisStatus,
  ChatMessage,
  ArcCoreTelemetry,
  TaskStatus,
  TacticalActionExecuted,
} from './types';
import {
  INITIAL_DEVICES,
  INITIAL_PROTOCOLS,
  INITIAL_TASKS,
  INITIAL_SETTINGS,
} from './data/initialData';
import { tacticalAudio, trisVoice } from './utils/audio';
import { TacticalHeader } from './components/TacticalHeader';
import { ArcCoreVisualizer } from './components/ArcCoreVisualizer';
import { TrisCommandConsole } from './components/TrisCommandConsole';
import { TasksHub } from './components/TasksHub';
import { HomeAutomationHub } from './components/HomeAutomationHub';
import { TelemetryMatrix } from './components/TelemetryMatrix';
import { SettingsModal } from './components/SettingsModal';
import {
  Terminal,
  ListTodo,
  Building2,
  Radio,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function App() {
  // Persistence state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('tris_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [devices, setDevices] = useState<SmartDevice[]>(() => {
    try {
      const saved = localStorage.getItem('tris_devices');
      return saved ? JSON.parse(saved) : INITIAL_DEVICES;
    } catch {
      return INITIAL_DEVICES;
    }
  });

  const [protocols, setProtocols] = useState<TacticalProtocol[]>(() => {
    try {
      const saved = localStorage.getItem('tris_protocols');
      return saved ? JSON.parse(saved) : INITIAL_PROTOCOLS;
    } catch {
      return INITIAL_PROTOCOLS;
    }
  });

  const [settings, setSettings] = useState<TrisSettings>(() => {
    try {
      const saved = localStorage.getItem('tris_settings');
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // UI & TRIS Core State
  const [trisStatus, setTrisStatus] = useState<TrisStatus>('IDLE');
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'COMMAND' | 'TASKS' | 'HOME' | 'TELEMETRY'>('COMMAND');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  // Chat message thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'tris',
      content: `Good day, ${settings.callsign || 'Boss'}. TRIS neural core is active and calibrated. All smart home sectors and daily task queues are synced to your terminal. What are your directives?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Real-time telemetry simulation
  const [telemetry, setTelemetry] = useState<ArcCoreTelemetry>({
    arcOutputKw: 48.6,
    gridLoadPercent: 34,
    coreTemperatureC: 41.8,
    batteryReservePercent: 94,
    securityStatus: 'NOMINAL',
    networkUptime: '99.98%',
  });

  // Speech Recognition reference
  const recognitionRef = useRef<any>(null);

  // Audio system settings sync
  useEffect(() => {
    tacticalAudio.setSoundEnabled(settings.soundEffects);
  }, [settings.soundEffects]);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('tris_tasks', JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('tris_devices', JSON.stringify(devices));
    } catch {
      // ignore
    }
  }, [devices]);

  useEffect(() => {
    try {
      localStorage.setItem('tris_protocols', JSON.stringify(protocols));
    } catch {
      // ignore
    }
  }, [protocols]);

  useEffect(() => {
    try {
      localStorage.setItem('tris_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Dynamic subtle telemetry tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        arcOutputKw: +(48.0 + Math.sin(Date.now() / 6000) * 1.5).toFixed(1),
        coreTemperatureC: +(41.5 + Math.cos(Date.now() / 8000) * 0.8).toFixed(1),
        gridLoadPercent: Math.min(100, Math.max(20, Math.round(34 + Math.sin(Date.now() / 10000) * 4))),
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Voice playback wrapper
  const speakWithTris = useCallback(
    (text: string) => {
      if (!settings.voiceSynthesis) return;
      setTrisStatus('SPEAKING');
      trisVoice.speak(text, {
        engine: settings.voiceEngine,
        geminiVoice: settings.geminiVoice,
        rate: settings.voiceRate,
        pitch: settings.voicePitch,
        voiceURI: settings.selectedVoiceURI,
        onStart: () => setTrisStatus('SPEAKING'),
        onEnd: () => setTrisStatus('IDLE'),
        onError: () => setTrisStatus('IDLE'),
      });
    },
    [settings]
  );

  const stopSpeakingWithTris = useCallback(() => {
    trisVoice.stop();
    setTrisStatus('IDLE');
  }, []);

  // Protocol Execution Engine
  const activateProtocol = useCallback(
    (protocolId: string) => {
      tacticalAudio.playAlert();

      setProtocols((prev) =>
        prev.map((p) => ({
          ...p,
          isActive: p.id === protocolId,
        }))
      );

      // Mutate home devices according to protocol
      if (protocolId === 'night_owl') {
        setDevices((prev) =>
          prev.map((d) => {
            if (d.id === 'lab_main_lights') return { ...d, state: false, value: 0 };
            if (d.id === 'living_ambient') return { ...d, state: true, value: 15, color: '#f59e0b', statusText: 'Night Owl Amber 15%' };
            if (d.id === 'living_audio') return { ...d, state: false };
            if (d.id === 'living_blinds') return { ...d, state: true, value: 100, statusText: '100% Blackout' };
            if (d.id === 'thermostat_main') return { ...d, value: 67, statusText: 'Sleep Comfort (67°F)' };
            if (d.id === 'perimeter_locks') return { ...d, state: true, isLocked: true, statusText: 'Night Latched' };
            if (d.id === 'security_sensors') return { ...d, state: true, statusText: 'Maximum Night Surveillance' };
            return d;
          })
        );
      } else if (protocolId === 'focus_mode') {
        setDevices((prev) =>
          prev.map((d) => {
            if (d.id === 'lab_main_lights') return { ...d, state: true, value: 100, color: '#00f0ff', statusText: 'Daylight 5600K 100%' };
            if (d.id === 'lab_holotable') return { ...d, state: true, value: 100, statusText: 'Full Holo Array' };
            if (d.id === 'lab_ventilation') return { ...d, state: true, value: 65, statusText: 'Purge Circulation 65%' };
            if (d.id === 'thermostat_main') return { ...d, value: 69, statusText: 'Deep Focus (69°F)' };
            return d;
          })
        );
      } else if (protocolId === 'lockdown') {
        setDevices((prev) =>
          prev.map((d) => {
            if (d.type === 'lock') return { ...d, state: true, isLocked: true, statusText: 'EMERGENCY HARD SEAL' };
            if (d.id === 'security_sensors') return { ...d, state: true, value: 100, statusText: 'DEFENSE LEVEL ACTIVE' };
            if (d.id === 'living_blinds') return { ...d, state: true, value: 100, statusText: 'Sealed' };
            return d;
          })
        );
        setTelemetry((prev) => ({ ...prev, securityStatus: 'DEFENSE_MODE' }));
      } else if (protocolId === 'clean_sweep') {
        setDevices((prev) =>
          prev.map((d) => {
            if (d.id === 'air_filtration') return { ...d, state: true, value: 100, statusText: 'HEPA Nano Purge 100%' };
            if (d.id === 'lab_ventilation') return { ...d, state: true, value: 75 };
            return d;
          })
        );
      } else if (protocolId === 'welcome_home') {
        setDevices((prev) =>
          prev.map((d) => {
            if (d.id === 'living_ambient') return { ...d, state: true, value: 75, color: '#f59e0b', statusText: 'Warm Welcome 75%' };
            if (d.id === 'thermostat_main') return { ...d, value: 71, statusText: 'Comfort 71°F' };
            if (d.id === 'perimeter_locks') return { ...d, state: true, isLocked: false, statusText: 'Welcome Disarm' };
            return d;
          })
        );
        setTelemetry((prev) => ({ ...prev, securityStatus: 'NOMINAL' }));
      }
    },
    []
  );

  // Apply actions requested by Gemini tool calls
  const applyExecutedActions = useCallback(
    (actions: any[]) => {
      for (const action of actions) {
        if (action.type === 'TASK_CREATED' && action.payload) {
          const { title, priority, category, scheduledTime, estimatedMinutes, subtasks } = action.payload;
          const newTask: Task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: title || 'New Directive',
            priority: (priority as any) || 'TACTICAL',
            category: (category as any) || 'work',
            status: 'pending',
            scheduledTime: scheduledTime || '12:00',
            estimatedMinutes: estimatedMinutes || 30,
            subtasks: Array.isArray(subtasks)
              ? subtasks.map((st: string, idx: number) => ({
                  id: `sub-${Date.now()}-${idx}`,
                  title: typeof st === 'string' ? st : (st as any).title || 'Checklist step',
                  completed: false,
                }))
              : [],
            createdAt: new Date().toISOString(),
          };
          setTasks((prev) => [newTask, ...prev]);
        } else if (action.type === 'TASK_UPDATED' && action.payload) {
          const { taskId, status } = action.payload;
          setTasks((prev) =>
            prev.map((t) => {
              if (t.id === taskId || t.title.toLowerCase().includes(taskId.toLowerCase())) {
                return { ...t, status: status || t.status };
              }
              return t;
            })
          );
        } else if (action.type === 'DEVICE_MODIFIED' && action.payload) {
          const { deviceId, state, value, isLocked } = action.payload;
          setDevices((prev) =>
            prev.map((d) => {
              if (d.id === deviceId || d.name.toLowerCase().includes(deviceId.toLowerCase())) {
                return {
                  ...d,
                  state: state !== undefined ? state : d.state,
                  value: value !== undefined ? value : d.value,
                  isLocked: isLocked !== undefined ? isLocked : d.isLocked,
                };
              }
              return d;
            })
          );
        } else if (action.type === 'PROTOCOL_ACTIVATED' && action.payload) {
          const { protocolId } = action.payload;
          activateProtocol(protocolId);
        }
      }
    },
    [activateProtocol]
  );

  // Send transmission to TRIS Backend
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || trisStatus === 'PROCESSING') return;

    tacticalAudio.playConfirm();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setTrisStatus('PROCESSING');

    try {
      const response = await fetch('/api/tris/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          tasks,
          devices,
          protocols,
          callsign: settings.callsign,
          chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const replyText = data.text || 'Directive acknowledged, Boss.';
      const actionsExecuted: TacticalActionExecuted[] = data.actions || [];

      // Execute actions on client state
      if (actionsExecuted.length > 0) {
        applyExecutedActions(actionsExecuted);
        tacticalAudio.playConfirm();
      }

      const trisReply: ChatMessage = {
        id: `tris-${Date.now()}`,
        role: 'tris',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionsExecuted: actionsExecuted.length > 0 ? actionsExecuted : undefined,
      };

      setMessages((prev) => [...prev, trisReply]);
      speakWithTris(replyText);
    } catch (error) {
      console.error('TRIS communication error:', error);
      const fallbackReply = `Standing by, ${settings.callsign}. Directive recorded. Local systems are operating at nominal capacity.`;
      setMessages((prev) => [
        ...prev,
        {
          id: `tris-${Date.now()}`,
          role: 'tris',
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakWithTris(fallbackReply);
    } finally {
      if (trisStatus === 'PROCESSING') {
        setTrisStatus('IDLE');
      }
    }
  };

  // Morning / Tactical Daily Briefing
  const handleRequestBriefing = () => {
    const prompt = `Tris, give me a comprehensive morning status briefing. Review my active directives, high-priority tasks, home automation circuits, and the Arc power grid. Address me as ${settings.callsign}.`;
    handleSendMessage(prompt);
  };

  // Voice recognition toggle
  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTrisStatus('IDLE');
      tacticalAudio.playToggle(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech Recognition is not supported on this browser. Please type your message in the console.');
      return;
    }

    try {
      tacticalAudio.playWake();
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTrisStatus('LISTENING');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setTrisStatus('IDLE');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (trisStatus === 'LISTENING') {
          setTrisStatus('IDLE');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
      setTrisStatus('IDLE');
    }
  };

  // AI Task Breakdown Helper
  const handleDeconstructWithAI = async (taskTitle: string) => {
    try {
      const res = await fetch('/api/tris/breakdown-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle }),
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Device actions
  const handleToggleDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const nextState = !d.state;
          tacticalAudio.playToggle(nextState);
          return { ...d, state: nextState };
        }
        return d;
      })
    );
  };

  const handleUpdateDeviceValue = (deviceId: string, value: number) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, value } : d))
    );
  };

  const handleToggleLock = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const nextLock = !d.isLocked;
          tacticalAudio.playAlert();
          return {
            ...d,
            isLocked: nextLock,
            statusText: nextLock ? 'Hydraulic Deadbolts Engaged' : 'Disengaged / Free Access',
          };
        }
        return d;
      })
    );
  };

  // Task actions
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    tacticalAudio.playConfirm();
    const task: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    tacticalAudio.playBeep(status === 'completed' ? 1400 : 900, 0.08);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    tacticalAudio.playBeep(450, 0.08, 'triangle');
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    tacticalAudio.playBeep(1100, 0.04);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return t;
      })
    );
  };

  // Run full diagnostic sweep
  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    tacticalAudio.playWake();
    setTimeout(() => {
      setIsRunningDiagnostics(false);
      tacticalAudio.playConfirm();
      setTelemetry((prev) => ({
        ...prev,
        arcOutputKw: 48.9,
        coreTemperatureC: 41.2,
        securityStatus: 'NOMINAL',
      }));
      speakWithTris(`Diagnostic sweep completed, ${settings.callsign}. All sub-circuits, perimeter sensors, and containment coils are operating at optimal efficiency.`);
    }, 2000);
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#02050a] text-[#00f2ff] font-mono flex flex-col selection:bg-[#00f2ff]/30 selection:text-white relative overflow-x-hidden">
      {/* Immersive UI Dot Matrix Overlay */}
      <div className="fixed inset-0 opacity-10 pointer-events-none bg-immersive-dots z-0" />
      
      {/* Top Ambient Glow Beam */}
      <div className="fixed top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent opacity-50 z-50 pointer-events-none" />

      {/* Tactical Header */}
      <TacticalHeader
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRequestBriefing={handleRequestBriefing}
        pendingTasksCount={pendingTasksCount}
        isSpeaking={trisStatus === 'SPEAKING'}
      />

      {/* Main Tactical View Tabs */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-5 flex flex-col gap-5 relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-[#00f2ff]/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('COMMAND')}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm font-hud font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'COMMAND'
                  ? 'bg-[#00f2ff] text-[#02050a] shadow-[0_0_20px_rgba(0,242,255,0.4)]'
                  : 'bg-[#00f2ff]/5 text-[#00f2ff]/70 hover:text-[#00f2ff] border border-[#00f2ff]/30 hover:bg-[#00f2ff]/10'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>TRIS COMMAND HUD</span>
            </button>

            <button
              onClick={() => setActiveTab('TASKS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm font-hud font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'TASKS'
                  ? 'bg-[#00f2ff] text-[#02050a] shadow-[0_0_20px_rgba(0,242,255,0.4)]'
                  : 'bg-[#00f2ff]/5 text-[#00f2ff]/70 hover:text-[#00f2ff] border border-[#00f2ff]/30 hover:bg-[#00f2ff]/10'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>DAILY DIRECTIVES ({pendingTasksCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('HOME')}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm font-hud font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'HOME'
                  ? 'bg-[#00f2ff] text-[#02050a] shadow-[0_0_20px_rgba(0,242,255,0.4)]'
                  : 'bg-[#00f2ff]/5 text-[#00f2ff]/70 hover:text-[#00f2ff] border border-[#00f2ff]/30 hover:bg-[#00f2ff]/10'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>HOME AUTOMATION</span>
            </button>

            <button
              onClick={() => setActiveTab('TELEMETRY')}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm font-hud font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'TELEMETRY'
                  ? 'bg-[#00f2ff] text-[#02050a] shadow-[0_0_20px_rgba(0,242,255,0.4)]'
                  : 'bg-[#00f2ff]/5 text-[#00f2ff]/70 hover:text-[#00f2ff] border border-[#00f2ff]/30 hover:bg-[#00f2ff]/10'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>ARC TELEMETRY</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono uppercase text-[#00f2ff]/70">
            <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse shadow-[0_0_8px_#00f2ff]" />
            <span className="tracking-widest">FRIDAY INTERFACE v4.8 ONLINE</span>
          </div>
        </div>

        {/* Tab 1: Central Command HUD */}
        {activeTab === 'COMMAND' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Holographic Arc Reactor & Quick Status */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <ArcCoreVisualizer
                status={trisStatus}
                powerKw={telemetry.arcOutputKw}
                coreTempC={telemetry.coreTemperatureC}
                securityStatus={telemetry.securityStatus}
                onMicClick={toggleVoiceInput}
                isListening={isListening}
                isSpeaking={trisStatus === 'SPEAKING'}
                activeVoiceName={settings.geminiVoice}
                onStopSpeaking={stopSpeakingWithTris}
              />

              {/* Quick Directives & Active Protocols Card */}
              <div className="p-4 rounded-sm bg-[#00f2ff]/5 border border-[#00f2ff]/30 backdrop-blur-md font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-l-2 border-[#00f2ff] pl-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#00f2ff]">
                    <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" />
                    TACTICAL STATUS
                  </span>
                  <span className="text-[10px] text-[#00f2ff]/60 uppercase tracking-wider">ALL SECTORS</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
                    <span className="text-[11px] uppercase text-[#00f2ff]/70">PENDING DIRECTIVES:</span>
                    <span className="text-amber-400 font-bold font-mono tracking-wider">{pendingTasksCount} TASKS</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
                    <span className="text-[11px] uppercase text-[#00f2ff]/70">ACTIVE PROTOCOL:</span>
                    <span className="text-white font-bold font-mono tracking-wider">
                      {protocols.find((p) => p.isActive)?.name || 'STANDBY'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
                    <span className="text-[11px] uppercase text-[#00f2ff]/70">PERIMETER GATE:</span>
                    <span className="text-emerald-400 font-bold font-mono tracking-wider">SECURE (ENGAGED)</span>
                  </div>
                </div>

                <button
                  onClick={handleRequestBriefing}
                  className="w-full py-2.5 rounded-sm bg-[#00f2ff] hover:brightness-125 text-[#02050a] font-mono tracking-widest text-xs font-bold uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(0,242,255,0.25)]"
                >
                  REQUEST MORNING BRIEFING
                </button>
              </div>
            </div>

            {/* Right: TRIS AI Conversational Command Interface */}
            <div className="lg:col-span-8 flex flex-col">
              <TrisCommandConsole
                messages={messages}
                onSendMessage={handleSendMessage}
                status={trisStatus}
                isListening={isListening}
                onToggleVoiceInput={toggleVoiceInput}
                onReplayAudio={(text) => speakWithTris(text)}
                activeVoiceName={settings.geminiVoice}
                voiceEngine={settings.voiceEngine}
                isSpeaking={trisStatus === 'SPEAKING'}
                onClearHistory={() =>
                  setMessages([
                    {
                      id: `init-${Date.now()}`,
                      role: 'tris',
                      content: `Command log refreshed, ${settings.callsign}. Standing by for new directives.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
              />
            </div>
          </div>
        )}

        {/* Tab 2: Daily Tasks & Directives Hub */}
        {activeTab === 'TASKS' && (
          <TasksHub
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onToggleSubtask={handleToggleSubtask}
            onDeconstructWithAI={handleDeconstructWithAI}
          />
        )}

        {/* Tab 3: Home Automation & Lab Hub */}
        {activeTab === 'HOME' && (
          <HomeAutomationHub
            devices={devices}
            protocols={protocols}
            onToggleDevice={handleToggleDevice}
            onUpdateDeviceValue={handleUpdateDeviceValue}
            onToggleLock={handleToggleLock}
            onActivateProtocol={activateProtocol}
          />
        )}

        {/* Tab 4: Arc Telemetry Matrix */}
        {activeTab === 'TELEMETRY' && (
          <TelemetryMatrix
            telemetry={telemetry}
            onRunDiagnostics={handleRunDiagnostics}
            isRunningDiagnostics={isRunningDiagnostics}
          />
        )}
      </main>

      {/* Footer HUD telemetry */}
      <footer className="w-full border-t border-[#00f2ff]/30 py-3 px-4 lg:px-8 bg-[#02050a] text-[10px] font-mono uppercase text-[#00f2ff]/60 flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] shadow-[0_0_6px_#00f2ff]" />
          <span className="tracking-widest">TRIS TACTICAL SYSTEM // IMMERSIVE HUD ARCHITECTURE</span>
        </div>
        <div className="flex items-center gap-6 tracking-widest">
          <span>STARK INDUSTRIES SECURE LINK</span>
          <span className="text-[#00f2ff]">NEURAL ACCELERATOR: ONLINE</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onResetFactory={() => {
          setTasks(INITIAL_TASKS);
          setDevices(INITIAL_DEVICES);
          setProtocols(INITIAL_PROTOCOLS);
          setSettings(INITIAL_SETTINGS);
          setIsSettingsOpen(false);
          tacticalAudio.playWake();
        }}
      />
    </div>
  );
}
