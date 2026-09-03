import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, Volume2, Bot, User, CheckCircle2, RotateCcw, Flame, Radio, Copy, Check } from 'lucide-react';
import { ChatMessage, TrisStatus, GeminiVoiceName } from '../types';

interface TrisCommandConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  status: TrisStatus;
  isListening: boolean;
  onToggleVoiceInput: () => void;
  onReplayAudio: (text: string) => void;
  onClearHistory: () => void;
  activeVoiceName?: GeminiVoiceName;
  voiceEngine?: 'gemini' | 'browser';
  isSpeaking?: boolean;
}

const QUICK_COMMANDS = [
  'Give me my daily briefing, Tris',
  'Activate Protocol Night Owl',
  'Add critical task: Test Arc containment at 11:00',
  'Dim lounge lights to 20% and set thermostat to 69°F',
  'Lock all perimeter gates & run security sweep',
  'Status report on power grid and Mark 85 systems',
];

export const TrisCommandConsole: React.FC<TrisCommandConsoleProps> = ({
  messages,
  onSendMessage,
  status,
  isListening,
  onToggleVoiceInput,
  onReplayAudio,
  onClearHistory,
  activeVoiceName = 'Kore',
  voiceEngine = 'gemini',
  isSpeaking = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || status === 'PROCESSING') return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickCommand = (cmd: string) => {
    onSendMessage(cmd);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="tris-command-console" className="flex flex-col h-[540px] bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-sm backdrop-blur-md overflow-hidden shadow-2xl font-mono">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#02050a]/90 border-b border-[#00f2ff]/30">
        <div className="flex items-center gap-2 border-l-2 border-[#00f2ff] pl-2">
          <div className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse shadow-[0_0_6px_#00f2ff]" />
          <span className="font-bold text-xs uppercase tracking-widest text-[#00f2ff]">
            TACTICAL COMMAND INTERFACE
          </span>
          <span className="text-[10px] text-[#00f2ff]/60 uppercase tracking-wider hidden sm:inline">
            // NEURAL STREAM
          </span>
        </div>

        {/* Console status pill & reset */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[10px] text-[#00f2ff]">
            <Radio className={`w-3 h-3 ${isSpeaking ? 'animate-pulse text-[#00f2ff]' : 'text-[#00f2ff]/70'}`} />
            <span className="font-bold uppercase">
              {voiceEngine === 'gemini' ? `HUMAN VOICE: ${activeVoiceName || 'Kore'}` : 'BROWSER TTS'}
            </span>
          </div>

          <button
            id="console-clear-history-btn"
            onClick={onClearHistory}
            className="text-[10px] text-[#00f2ff]/70 hover:text-[#00f2ff] flex items-center gap-1 uppercase tracking-wider transition-colors cursor-pointer px-2 py-1 rounded-sm border border-[#00f2ff]/20 bg-[#00f2ff]/5 hover:bg-[#00f2ff]/15"
            title="Reset conversation logs"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">RESET LOGS</span>
          </button>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#02050a]/60">
        {messages.map((msg) => {
          const isTris = msg.role === 'tris';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isTris ? 'justify-start' : 'justify-end'}`}
            >
              {isTris && (
                <div className="w-7 h-7 rounded-sm bg-[#00f2ff]/10 border border-[#00f2ff]/50 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(0,242,255,0.3)] text-[#00f2ff]">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-sm p-3 border transition-all ${
                  isTris
                    ? 'border-l-2 border-l-[#00f2ff] border-[#00f2ff]/30 bg-[#00f2ff]/10 text-slate-100'
                    : 'border-r-2 border-r-[#00f2ff] border-[#00f2ff]/20 bg-[#02050a]/90 text-cyan-100 ml-auto'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5 text-[10px] text-[#00f2ff]/80 font-bold uppercase tracking-wider">
                  <span>{isTris ? 'TRIS // SYSTEM DIRECTIVE' : 'OPERATOR // DIRECTIVE'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#00f2ff]/50 text-[9px]">{msg.timestamp}</span>

                    {/* Copy button */}
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-white text-[#00f2ff]/60 transition-colors p-0.5 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>

                    {/* Replay with human voice button */}
                    {isTris && (
                      <button
                        onClick={() => onReplayAudio(msg.content)}
                        className="hover:text-white text-[#00f2ff] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded-sm bg-[#00f2ff]/10 border border-[#00f2ff]/30 cursor-pointer text-[9px] font-bold"
                        title="Replay in neural human voice"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span className="hidden sm:inline">VOICE</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="whitespace-pre-wrap leading-relaxed text-slate-200 text-xs font-mono">{msg.content}</p>

                {/* Tactical actions telemetry badges */}
                {msg.actionsExecuted && msg.actionsExecuted.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#00f2ff]/20 space-y-1">
                    <div className="text-[10px] text-[#00f2ff] flex items-center gap-1 font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>SUB-ROUTINES EXECUTED:</span>
                    </div>
                    {msg.actionsExecuted.map((action, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] bg-[#02050a] border border-[#00f2ff]/20 rounded-sm px-2 py-1 text-slate-300 flex items-center justify-between font-mono"
                      >
                        <span>{action.detail}</span>
                        <span className="text-[9px] text-[#00f2ff] uppercase font-bold tracking-wider">
                          {action.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isTris && (
                <div className="w-7 h-7 rounded-sm bg-[#00f2ff]/5 border border-[#00f2ff]/30 flex items-center justify-center shrink-0 text-[#00f2ff]">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Processing Indicator */}
        {status === 'PROCESSING' && (
          <div className="flex items-center gap-2 text-xs text-amber-400 p-2.5 rounded-sm bg-amber-500/10 border-l-2 border-amber-500 w-fit uppercase tracking-wider font-mono">
            <Flame className="w-4 h-4 animate-spin text-amber-400" />
            <span>PROCESSING DIRECTIVES & SYNTHESIZING NEURAL AUDIO...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Command Suggestions Chips */}
      <div className="px-3 py-2 bg-[#02050a]/90 border-t border-[#00f2ff]/20 overflow-x-auto flex items-center gap-2 text-xs no-scrollbar">
        <span className="text-[10px] text-[#00f2ff]/70 shrink-0 uppercase tracking-widest flex items-center gap-1 font-bold">
          <Sparkles className="w-3 h-3 text-[#00f2ff]" />
          PRESETS:
        </span>
        {QUICK_COMMANDS.map((cmd, i) => (
          <button
            key={i}
            onClick={() => handleQuickCommand(cmd)}
            className="shrink-0 px-2.5 py-1 rounded-sm bg-[#00f2ff]/5 hover:bg-[#00f2ff]/15 border border-[#00f2ff]/30 hover:border-[#00f2ff] text-[#00f2ff]/90 hover:text-white text-[10px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#02050a] border-t border-[#00f2ff]/30 flex items-center gap-2">
        {/* Voice Input Trigger */}
        <button
          id="console-mic-input-btn"
          type="button"
          onClick={onToggleVoiceInput}
          className={`p-2.5 rounded-sm border transition-all cursor-pointer shrink-0 ${
            isListening
              ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-white animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.5)]'
              : 'bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 border-[#00f2ff]/40 text-[#00f2ff]'
          }`}
          title={isListening ? 'Voice recording active... Click to stop' : 'Click to speak to TRIS'}
        >
          {isListening ? <MicOff className="w-4 h-4 text-sky-300" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          id="console-text-input"
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? 'Listening for voice directive...' : 'Message TRIS (e.g., "Dim lab lights and schedule task at 14:00")...'}
          className="flex-1 bg-[#00f2ff]/5 border border-[#00f2ff]/30 focus:border-[#00f2ff] text-white placeholder-[#00f2ff]/40 text-xs px-3.5 py-2.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#00f2ff]/50 transition-all font-mono"
        />

        <button
          id="console-send-btn"
          type="submit"
          disabled={!inputText.trim() || status === 'PROCESSING'}
          className="p-2.5 rounded-sm bg-[#00f2ff] hover:brightness-125 disabled:opacity-40 disabled:cursor-not-allowed text-[#02050a] font-bold transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)] cursor-pointer"
          title="Send transmission to TRIS"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
