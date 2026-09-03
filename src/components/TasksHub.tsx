import React, { useState } from 'react';
import { Task, TaskPriority, TaskCategory, TaskStatus } from '../types';
import {
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  PlayCircle,
  Sparkles,
  ListTodo,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TasksHubProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeconstructWithAI: (taskTitle: string) => Promise<any>;
}

export const TasksHub: React.FC<TasksHubProps> = ({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onToggleSubtask,
  onDeconstructWithAI,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  // Add Task Modal State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('TACTICAL');
  const [newCategory, setNewCategory] = useState<TaskCategory>('work');
  const [newTime, setNewTime] = useState('10:00');
  const [newMinutes, setNewMinutes] = useState(30);
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isDeconstructing, setIsDeconstructing] = useState(false);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const criticalCount = tasks.filter((t) => t.priority === 'CRITICAL' && t.status !== 'completed').length;
  const completionPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((task) => {
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && task.status !== statusFilter) return false;
    return true;
  });

  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleDeconstruct = async () => {
    if (!newTitle.trim()) return;
    setIsDeconstructing(true);
    try {
      const result = await onDeconstructWithAI(newTitle.trim());
      if (result && result.subtasks) {
        const extracted = result.subtasks.map((s: { title: string }) => s.title);
        setNewSubtasks((prev) => [...prev, ...extracted]);
        if (result.suggestedPriority && ['CRITICAL', 'TACTICAL', 'ROUTINE'].includes(result.suggestedPriority)) {
          setNewPriority(result.suggestedPriority as TaskPriority);
        }
      }
    } catch {
      // fallback
    } finally {
      setIsDeconstructing(false);
    }
  };

  const handleAddSubtaskItem = () => {
    if (!subtaskInput.trim()) return;
    setNewSubtasks((prev) => [...prev, subtaskInput.trim()]);
    setSubtaskInput('');
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      priority: newPriority,
      category: newCategory,
      status: 'pending',
      scheduledTime: newTime || undefined,
      estimatedMinutes: Number(newMinutes) || 30,
      subtasks: newSubtasks.map((st, i) => ({
        id: `sub-${Date.now()}-${i}`,
        title: st,
        completed: false,
      })),
    });

    // Reset
    setNewTitle('');
    setNewDesc('');
    setNewPriority('TACTICAL');
    setNewCategory('work');
    setNewSubtasks([]);
    setIsAddModalOpen(false);
  };

  return (
    <div id="tasks-hub" className="bg-[#00f2ff]/5 border border-[#00f2ff]/30 rounded-sm p-5 backdrop-blur-md shadow-2xl flex flex-col h-full font-mono">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#00f2ff]/30">
        <div className="border-l-2 border-[#00f2ff] pl-2">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-[#00f2ff]" />
            <h2 className="text-base font-bold text-white tracking-widest uppercase">
              DAILY DIRECTIVES & TACTICAL OBJECTIVES
            </h2>
          </div>
          <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-widest mt-0.5">
            OPERATIONAL LOG // ACTIVE FLIGHT PATHS & SUB-ROUTINES
          </p>
        </div>

        <button
          id="tasks-add-directive-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-[#00f2ff] hover:brightness-125 text-[#02050a] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(0,242,255,0.3)]"
        >
          <Plus className="w-4 h-4 text-[#02050a]" />
          <span>NEW DIRECTIVE</span>
        </button>
      </div>

      {/* Progress & Priority Badges */}
      <div className="grid grid-cols-3 gap-2 my-4">
        <div className="p-3 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
          <div className="text-[10px] text-[#00f2ff]/60 uppercase tracking-wider">COMPLETION RATE</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-white">{completionPct}%</span>
            <span className="text-[10px] text-[#00f2ff]/60">
              {completedCount}/{tasks.length}
            </span>
          </div>
          <div className="w-full bg-[#00f2ff]/20 h-1 mt-1.5 overflow-hidden">
            <div
              className="bg-[#00f2ff] h-full shadow-[0_0_8px_#00f2ff] transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
          <div className="text-[10px] text-orange-400 uppercase tracking-wider">CRITICAL PRIORITY</div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-orange-400">{criticalCount}</span>
            <span className="text-[10px] text-orange-400/70 uppercase">ACTIVE</span>
          </div>
          <div className="text-[10px] text-orange-400/60 uppercase mt-1">HIGH VIGILANCE</div>
        </div>

        <div className="p-3 rounded-sm bg-[#02050a]/90 border border-[#00f2ff]/20">
          <div className="text-[10px] text-[#00f2ff]/60 uppercase tracking-wider">SCHEDULED BLOCKS</div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-[#00f2ff]">
              {tasks.filter((t) => t.scheduledTime && t.status !== 'completed').length}
            </span>
            <span className="text-[10px] text-[#00f2ff]/60 uppercase">TIMED</span>
          </div>
          <div className="text-[10px] text-[#00f2ff]/60 uppercase mt-1">24H TIMELINE</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
        <div className="flex items-center gap-1 bg-[#02050a] p-1 rounded-sm border border-[#00f2ff]/30">
          {['ALL', 'CRITICAL', 'TACTICAL', 'ROUTINE'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                priorityFilter === p
                  ? p === 'CRITICAL'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/60 font-bold'
                    : 'bg-[#00f2ff] text-[#02050a] font-bold shadow-[0_0_10px_rgba(0,242,255,0.4)]'
                  : 'text-[#00f2ff]/60 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#02050a] p-1 rounded-sm border border-[#00f2ff]/30">
          {['ALL', 'pending', 'in_progress', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/60 font-bold'
                  : 'text-[#00f2ff]/60 hover:text-white'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[300px]">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-[#00f2ff]/50 text-xs border border-dashed border-[#00f2ff]/30 rounded-sm uppercase tracking-wider">
            NO DIRECTIVES MATCHING FILTER CRITERIA
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCritical = task.priority === 'CRITICAL';
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';
            const isExpanded = !!expandedTaskIds[task.id];
            const completedSubCount = task.subtasks.filter((s) => s.completed).length;

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-sm border transition-all ${
                  isCompleted
                    ? 'bg-[#00f2ff]/5 border-l-2 border-l-[#00f2ff]/40 border-[#00f2ff]/10 opacity-50'
                    : isCritical
                    ? 'bg-orange-500/10 border-l-2 border-l-orange-500 border-orange-500/30 hover:border-orange-500/60'
                    : isInProgress
                    ? 'bg-[#00f2ff]/15 border-l-2 border-l-[#00f2ff] border-[#00f2ff]/40 shadow-[0_0_15px_rgba(0,242,255,0.15)]'
                    : 'bg-[#00f2ff]/5 border-l-2 border-l-[#00f2ff] border-[#00f2ff]/20 hover:border-[#00f2ff]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 flex-1">
                    {/* Status Toggle Button */}
                    <button
                      onClick={() => {
                        const nextStatus: TaskStatus =
                          task.status === 'pending'
                            ? 'in_progress'
                            : task.status === 'in_progress'
                            ? 'completed'
                            : 'pending';
                        onUpdateTaskStatus(task.id, nextStatus);
                      }}
                      className="mt-0.5 cursor-pointer shrink-0"
                      title="Click to toggle status: Pending -> In Progress -> Completed"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isInProgress ? (
                        <PlayCircle className="w-5 h-5 text-[#00f2ff] animate-pulse" />
                      ) : (
                        <div className="w-5 h-5 rounded-sm border-2 border-[#00f2ff]/40 hover:border-[#00f2ff] transition-colors" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Priority Badge */}
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                            isCritical
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                              : task.priority === 'TACTICAL'
                              ? 'bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/40'
                              : 'bg-[#02050a] text-slate-300 border border-[#00f2ff]/20'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Scheduled Time */}
                        {task.scheduledTime && (
                          <span className="flex items-center gap-1 text-[10px] text-[#00f2ff] bg-[#02050a] px-1.5 py-0.5 rounded-sm border border-[#00f2ff]/30">
                            <Clock className="w-3 h-3 text-[#00f2ff]" />
                            {task.scheduledTime}
                          </span>
                        )}

                        <span className="text-[9px] text-[#00f2ff]/70 uppercase bg-[#02050a] px-1.5 py-0.5 rounded-sm border border-[#00f2ff]/20">
                          {task.category}
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-bold tracking-wide ${
                          isCompleted ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">{task.description}</p>
                      )}

                      {/* Subtasks Summary */}
                      {task.subtasks.length > 0 && (
                        <div className="mt-2 flex items-center gap-3">
                          <button
                            onClick={() => toggleExpand(task.id)}
                            className="flex items-center gap-1 text-[11px] text-[#00f2ff] hover:brightness-125 transition-colors cursor-pointer uppercase tracking-wider"
                          >
                            <Layers className="w-3.5 h-3.5 text-[#00f2ff]" />
                            <span>
                              SUBTASKS ({completedSubCount}/{task.subtasks.length})
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Task */}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-[#00f2ff]/40 hover:text-red-400 p-1 rounded-sm hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                    title="Delete directive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded Subtasks Checklist */}
                {isExpanded && task.subtasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#00f2ff]/20 space-y-1.5 pl-6">
                    {task.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => onToggleSubtask(task.id, sub.id)}
                        className="flex items-center gap-2 text-xs cursor-pointer group text-slate-300 hover:text-[#00f2ff]"
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                            sub.completed
                              ? 'bg-[#00f2ff] border-[#00f2ff] text-[#02050a]'
                              : 'border-[#00f2ff]/40 group-hover:border-[#00f2ff]'
                          }`}
                        >
                          {sub.completed && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={sub.completed ? 'line-through text-slate-500' : ''}>
                          {sub.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#02050a] border border-[#00f2ff]/50 rounded-sm p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-[#00f2ff]/30 pb-3">
              <div className="flex items-center gap-2 border-l-2 border-[#00f2ff] pl-2">
                <Sparkles className="w-5 h-5 text-[#00f2ff]" />
                <h3 className="font-bold text-sm tracking-widest text-white uppercase">NEW TACTICAL DIRECTIVE</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#00f2ff]/60 hover:text-white text-xs uppercase tracking-wider cursor-pointer"
              >
                [ESC / CLOSE]
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#00f2ff] mb-1">
                  DIRECTIVE TITLE *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Inspect Arc Containment Coils"
                    className="flex-1 bg-[#00f2ff]/5 border border-[#00f2ff]/30 focus:border-[#00f2ff] text-white px-3 py-2 rounded-sm focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleDeconstruct}
                    disabled={!newTitle.trim() || isDeconstructing}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-sm bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 border border-[#00f2ff]/40 text-[#00f2ff] text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40"
                    title="Use TRIS to break this directive into subtasks"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" />
                    <span>{isDeconstructing ? 'CALCULATING...' : 'AI BREAKDOWN'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#00f2ff]/70 mb-1">
                  DETAILS / PARAMETERS
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Optional context, specifications, or notes..."
                  rows={2}
                  className="w-full bg-[#00f2ff]/5 border border-[#00f2ff]/30 focus:border-[#00f2ff] text-white px-3 py-2 rounded-sm focus:outline-none resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#00f2ff]/70 mb-1">
                    PRIORITY
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-[#02050a] border border-[#00f2ff]/30 text-white px-2.5 py-1.5 rounded-sm text-xs font-mono"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="TACTICAL">TACTICAL</option>
                    <option value="ROUTINE">ROUTINE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#00f2ff]/70 mb-1">
                    ZONE / SECTOR
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    className="w-full bg-[#02050a] border border-[#00f2ff]/30 text-white px-2.5 py-1.5 rounded-sm text-xs font-mono"
                  >
                    <option value="work">Work / Lab</option>
                    <option value="home">Home</option>
                    <option value="security">Security</option>
                    <option value="personal">Personal</option>
                    <option value="protocol">Protocol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#00f2ff]/70 mb-1">
                    SCHEDULED
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#02050a] border border-[#00f2ff]/30 text-white px-2 py-1.5 rounded-sm text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#00f2ff]/70 mb-1">
                    EST. MINUTES
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={360}
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full bg-[#02050a] border border-[#00f2ff]/30 text-white px-2 py-1.5 rounded-sm text-xs font-mono"
                  />
                </div>
              </div>

              {/* Subtask checklist additions */}
              <div className="border-t border-[#00f2ff]/20 pt-3">
                <label className="block text-[11px] uppercase tracking-wider text-[#00f2ff] mb-1.5">
                  CHECKLIST SUBTASKS ({newSubtasks.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtaskItem();
                      }
                    }}
                    placeholder="Add checklist step..."
                    className="flex-1 bg-[#00f2ff]/5 border border-[#00f2ff]/30 text-white px-3 py-1.5 rounded-sm text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtaskItem}
                    className="px-3 py-1.5 rounded-sm bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 border border-[#00f2ff]/30 text-[#00f2ff] text-xs uppercase tracking-wider cursor-pointer"
                  >
                    ADD
                  </button>
                </div>

                {newSubtasks.length > 0 && (
                  <div className="max-h-28 overflow-y-auto space-y-1 bg-[#02050a] p-2 rounded-sm border border-[#00f2ff]/20">
                    {newSubtasks.map((st, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-slate-300 bg-[#00f2ff]/5 px-2 py-1 rounded-sm border border-[#00f2ff]/10"
                      >
                        <span>• {st}</span>
                        <button
                          type="button"
                          onClick={() => setNewSubtasks((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-[#00f2ff]/50 hover:text-red-400 text-xs cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#00f2ff]/20">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-sm bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] text-xs uppercase tracking-wider cursor-pointer border border-[#00f2ff]/30"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-[#00f2ff] hover:brightness-125 text-[#02050a] font-bold text-xs uppercase tracking-widest cursor-pointer shadow-[0_0_12px_rgba(0,242,255,0.3)]"
                >
                  INITIALIZE DIRECTIVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
