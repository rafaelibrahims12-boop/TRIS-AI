import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, FunctionDeclaration, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper: Convert raw 16-bit PCM (24kHz, 1 channel) into standard RIFF/WAVE buffer
function pcm16ToWav(pcmBuffer: Buffer, sampleRate = 24000, channels = 1): Buffer {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // AudioFormat: PCM (1)
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channels * 2, 28); // ByteRate
  header.writeUInt16LE(channels * 2, 32); // BlockAlign
  header.writeUInt16LE(16, 34); // BitsPerSample
  header.write('data', 36);
  header.writeUInt32LE(pcmBuffer.length, 40);
  return Buffer.concat([header, pcmBuffer]);
}

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Mock responses will be used as fallback.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Function declarations for TRIS tactical tool calling
const createTaskTool: FunctionDeclaration = {
  name: 'create_task',
  description: 'Create a new daily task or routine item in TRIS schedule.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Clear title of the task' },
      priority: {
        type: Type.STRING,
        description: 'Priority level: CRITICAL, TACTICAL, or ROUTINE',
      },
      category: {
        type: Type.STRING,
        description: 'Category: work, home, security, personal, or protocol',
      },
      scheduledTime: {
        type: Type.STRING,
        description: 'Scheduled time formatted as HH:MM in 24hr format, e.g. "14:30"',
      },
      estimatedMinutes: {
        type: Type.NUMBER,
        description: 'Estimated duration in minutes',
      },
      subtasks: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of checklist subtask titles',
      },
    },
    required: ['title'],
  },
};

const updateTaskStatusTool: FunctionDeclaration = {
  name: 'update_task_status',
  description: 'Update the status or details of an existing task.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskId: { type: Type.STRING, description: 'ID of the task to update (or match by title)' },
      status: {
        type: Type.STRING,
        description: 'Status: pending, in_progress, or completed',
      },
      note: { type: Type.STRING, description: 'Optional completion note' },
    },
    required: ['taskId', 'status'],
  },
};

const controlDeviceTool: FunctionDeclaration = {
  name: 'control_device',
  description: 'Control a smart home or workshop device (toggle power, adjust brightness/value, toggle lock).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      deviceId: {
        type: Type.STRING,
        description:
          'ID or keyword of device: lab_main_lights, lab_holotable, lab_ventilation, living_ambient, living_audio, living_blinds, thermostat_main, air_filtration, perimeter_locks, security_sensors, arc_power_tap, bedroom_blackout',
      },
      state: { type: Type.BOOLEAN, description: 'True to turn on/engage, False to turn off/disengage' },
      value: { type: Type.NUMBER, description: 'Target value/percentage (0-100 for lights/blinds, 60-85 for temp)' },
      isLocked: { type: Type.BOOLEAN, description: 'For security locks: true for locked, false for unlocked' },
      statusText: { type: Type.STRING, description: 'Optional operational status readout' },
    },
    required: ['deviceId'],
  },
};

const activateProtocolTool: FunctionDeclaration = {
  name: 'activate_protocol',
  description: 'Activate a smart home automation protocol preset (night_owl, focus_mode, clean_sweep, lockdown, welcome_home).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      protocolId: {
        type: Type.STRING,
        description: 'Identifier: night_owl, focus_mode, clean_sweep, lockdown, or welcome_home',
      },
    },
    required: ['protocolId'],
  },
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', system: 'TRIS-CORE-ONLINE', timestamp: new Date().toISOString() });
});

// Task Breakdown Endpoint
app.post('/api/tris/breakdown-task', async (req, res) => {
  try {
    const { taskTitle, context } = req.body;
    if (!taskTitle) {
      return res.status(400).json({ error: 'taskTitle is required' });
    }

    const ai = getGeminiClient();
    const prompt = `You are TRIS, Tony Stark's AI assistant (inspired by FRIDAY). Break down this task into 3-5 tactical checklist steps:
Task: "${taskTitle}"
Context: ${context || 'Daily productivity and home automation'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are TRIS. Return tactical, crisp, actionable subtasks formatted as JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tacticalSummary: { type: Type.STRING },
            suggestedPriority: { type: Type.STRING },
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  estimatedMinutes: { type: Type.NUMBER },
                },
                required: ['title'],
              },
            },
          },
          required: ['tacticalSummary', 'subtasks'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Task breakdown error:', error);
    res.status(500).json({
      tacticalSummary: 'Tactical breakdown calculated from local heuristics.',
      suggestedPriority: 'TACTICAL',
      subtasks: [
        { title: 'Initial diagnostics and parameter check', estimatedMinutes: 10 },
        { title: 'Execute primary operation sequence', estimatedMinutes: 25 },
        { title: 'Verification and telemetry readout', estimatedMinutes: 10 },
      ],
    });
  }
});

// TRIS Tactical Chat & Automation Execution
app.post('/api/tris/chat', async (req, res) => {
  try {
    const {
      message,
      tasks = [],
      devices = [],
      protocols = [],
      callsign = 'Boss',
      chatHistory = [],
    } = req.body;

    const ai = getGeminiClient();

    const systemPrompt = `You are TRIS, a tactical, highly sophisticated AI assistant inspired by FRIDAY from Iron Man.
You assist ${callsign} with managing their daily tasks, schedules, and smart home & lab automation.

Personality & Tone:
- Address ${callsign} warmly and respectfully (e.g., "Right away, ${callsign}", "All systems nominal, ${callsign}", "I've adjusted the lab diagnostics").
- Speak with the sharp wit, crisp intelligence, and proactive loyalty of FRIDAY.
- Keep your replies conversational, efficient, and confident—like an elite military/tech tactical AI.
- When performing actions, explicitly acknowledge the executed action (e.g. "I've dimmed the living room lights to 15% and engaged perimeter locks for you, ${callsign}.").
- You have tools to create tasks, update tasks, control home devices, and activate protocols. Use them whenever ${callsign}'s prompt implies or requests an action!

Current State of the System:
- Current Time: ${new Date().toLocaleTimeString()}
- Active Tasks (${tasks.length}): ${JSON.stringify(tasks.map((t: { id: string; title: string; priority: string; status: string }) => ({ id: t.id, title: t.title, priority: t.priority, status: t.status })))}
- Devices (${devices.length}): ${JSON.stringify(devices.map((d: { id: string; name: string; state: boolean; value?: number; isLocked?: boolean }) => ({ id: d.id, name: d.name, state: d.state, value: d.value, isLocked: d.isLocked })))}
- Protocols: ${JSON.stringify(protocols.map((p: { id: string; name: string; isActive: boolean }) => ({ id: p.id, name: p.name, isActive: p.isActive })))}`;

    // Prepare conversation
    const contents: any[] = [];

    // Include recent chat turns if provided
    const recentHistory = chatHistory.slice(-6);
    for (const h of recentHistory) {
      contents.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        tools: [
          {
            functionDeclarations: [
              createTaskTool,
              updateTaskStatusTool,
              controlDeviceTool,
              activateProtocolTool,
            ],
          },
        ],
      },
    });

    // Extract function calls if any
    const functionCalls = response.functionCalls || [];
    const actionsExecuted: any[] = [];

    for (const fc of functionCalls) {
      if (fc.name === 'create_task') {
        actionsExecuted.push({
          type: 'TASK_CREATED',
          payload: fc.args,
          detail: `Created task: "${(fc.args as any)?.title}" (${(fc.args as any)?.priority || 'TACTICAL'})`,
        });
      } else if (fc.name === 'update_task_status') {
        actionsExecuted.push({
          type: 'TASK_UPDATED',
          payload: fc.args,
          detail: `Updated task ${(fc.args as any)?.taskId} status to ${(fc.args as any)?.status}`,
        });
      } else if (fc.name === 'control_device') {
        actionsExecuted.push({
          type: 'DEVICE_MODIFIED',
          payload: fc.args,
          detail: `Device ${(fc.args as any)?.deviceId} set to state: ${(fc.args as any)?.state !== undefined ? (fc.args as any)?.state : 'modified'}`,
        });
      } else if (fc.name === 'activate_protocol') {
        actionsExecuted.push({
          type: 'PROTOCOL_ACTIVATED',
          payload: fc.args,
          detail: `Protocol ${(fc.args as any)?.protocolId} engaged.`,
        });
      }
    }

    let replyText = response.text || '';
    if (!replyText && actionsExecuted.length > 0) {
      replyText = `Right away, ${callsign}. I've executed your instructions: ${actionsExecuted.map(a => a.detail).join('; ')}. All parameters are nominal.`;
    } else if (!replyText) {
      replyText = `Standing by, ${callsign}. All systems are operating within optimal thresholds. What are your orders?`;
    }

    res.json({
      text: replyText,
      actions: actionsExecuted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('TRIS Chat processing error:', error);
    const callsign = req.body?.callsign || 'Boss';
    // Fallback response with natural heuristic
    const msg = (req.body?.message || '').toLowerCase();
    let fallbackReply = `Standing by, ${callsign}. Telemetry is online and all local systems are nominal.`;
    const actions: any[] = [];

    if (msg.includes('night owl') || msg.includes('sleep') || msg.includes('goodnight')) {
      fallbackReply = `Right away, ${callsign}. Engaging Protocol Night Owl. Dimming ambient lights, engaging perimeter locks, and cooling the quarters. Sleep well.`;
      actions.push({
        type: 'PROTOCOL_ACTIVATED',
        payload: { protocolId: 'night_owl' },
        detail: 'Protocol Night Owl activated.',
      });
    } else if (msg.includes('focus') || msg.includes('work') || msg.includes('lab')) {
      fallbackReply = `Acknowledged, ${callsign}. Deep Lab Focus protocol initiated. Workshop lighting at 100% daylight, ventilation engaged.`;
      actions.push({
        type: 'PROTOCOL_ACTIVATED',
        payload: { protocolId: 'focus_mode' },
        detail: 'Protocol Focus Mode engaged.',
      });
    } else if (msg.includes('lockdown') || msg.includes('secure') || msg.includes('intruder')) {
      fallbackReply = `Iron Fortress Protocol initiated immediately, ${callsign}. All blast locks engaged and perimeter motion sensors elevated to maximum alert.`;
      actions.push({
        type: 'PROTOCOL_ACTIVATED',
        payload: { protocolId: 'lockdown' },
        detail: 'Protocol Lockdown engaged.',
      });
    } else if (msg.includes('briefing') || msg.includes('status') || msg.includes('report')) {
      fallbackReply = `Good day, ${callsign}. All core diagnostics are nominal. Arc reactor output is steady at 48.6 kW with battery reserves at 94%. You have daily tactical tasks queued. Standing by for command.`;
    }

    res.json({
      text: fallbackReply,
      actions,
      timestamp: new Date().toISOString(),
    });
  }
});

// TRIS Human Voice Neural TTS Endpoint (Gemini 3.1 Flash Audio)
app.post('/api/tris/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for voice synthesis' });
    }

    // Clean text for natural speech: strip markdown symbols, asterisks, urls, raw hashes, bullets
    let cleanedText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\/\/+/g, '-')
      .replace(/•/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanedText) {
      return res.status(400).json({ error: 'Text was empty after sanitization' });
    }

    // Convert technical symbols into spoken English for human naturalness
    cleanedText = cleanedText
      .replace(/(\d+(?:\.\d+)?)\s*kW\b/gi, '$1 kilowatts')
      .replace(/(\d+(?:\.\d+)?)\s*°C\b/gi, '$1 degrees Celsius')
      .replace(/(\d+(?:\.\d+)?)\s*°F\b/gi, '$1 degrees Fahrenheit')
      .replace(/(\d+)%/g, '$1 percent');

    // Clamp length for speech responsiveness (limit to ~450 characters per chunk)
    if (cleanedText.length > 450) {
      cleanedText = cleanedText.slice(0, 450);
    }

    const ai = getGeminiClient();

    // Natural human voice guidance prompt: directs Gemini to speak with lifelike inflection and warmth
    const vocalPrompt = `Say in a warm, natural, human conversational cadence with crisp tactical clarity: ${cleanedText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: vocalPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const base64Data = inlineData?.data;

    if (!base64Data) {
      return res.status(500).json({ error: 'No audio returned by neural voice model' });
    }

    // Convert linear 16-bit PCM (24kHz, 1 channel) into standard WAV format
    const pcmBuffer = Buffer.from(base64Data, 'base64');
    const wavBuffer = pcm16ToWav(pcmBuffer, 24000, 1);

    res.json({
      audioBase64: wavBuffer.toString('base64'),
      mimeType: 'audio/wav',
      voice: voice || 'Kore',
      byteLength: wavBuffer.length,
    });
  } catch (error: any) {
    console.error('TRIS TTS synthesis error:', error);
    res.status(500).json({ error: error?.message || 'Neural voice synthesis failed' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRIS Tactical Server operational on http://0.0.0.0:${PORT}`);
  });
}

startServer();
