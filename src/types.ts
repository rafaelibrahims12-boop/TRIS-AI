export type TaskPriority = 'CRITICAL' | 'TACTICAL' | 'ROUTINE';
export type TaskCategory = 'work' | 'home' | 'security' | 'personal' | 'protocol';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  scheduledTime?: string;
  estimatedMinutes?: number;
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
}

export type DeviceZone = 'workshop' | 'living' | 'security' | 'climate' | 'power' | 'bedroom';
export type DeviceType = 'light' | 'lock' | 'climate' | 'appliance' | 'power' | 'security_sensor' | 'entertainment';

export interface SmartDevice {
  id: string;
  name: string;
  zone: DeviceZone;
  type: DeviceType;
  state: boolean;
  value?: number;
  unit?: string;
  color?: string;
  isLocked?: boolean;
  statusText?: string;
  energyWattage: number;
}

export interface TacticalProtocol {
  id: string;
  name: string;
  codename: string;
  description: string;
  isActive: boolean;
  color: string;
  actionsSummary: string[];
}

export interface ArcCoreTelemetry {
  arcOutputKw: number;
  gridLoadPercent: number;
  coreTemperatureC: number;
  batteryReservePercent: number;
  securityStatus: 'NOMINAL' | 'ELEVATED' | 'DEFENSE_MODE';
  networkUptime: string;
}

export type TrisStatus = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

export type GeminiVoiceName = 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon';

export interface TacticalActionExecuted {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'DEVICE_MODIFIED' | 'PROTOCOL_ACTIVATED' | 'DIAGNOSTIC_RUN';
  detail: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'tris' | 'system';
  content: string;
  timestamp: string;
  actionsExecuted?: TacticalActionExecuted[];
}

export interface TrisSettings {
  callsign: string;
  voiceSynthesis: boolean;
  voiceEngine: 'gemini' | 'browser';
  geminiVoice: GeminiVoiceName;
  soundEffects: boolean;
  voiceRate: number;
  voicePitch: number;
  selectedVoiceURI?: string;
  autoBriefingOnLaunch: boolean;
}
