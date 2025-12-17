import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Task, QuadrantID, PALETTE } from './types';
import { Quadrant } from './components/Quadrant';
import { TaskInput } from './components/TaskInput';
import { GanttView } from './components/GanttView';
import SearchHistory from './components/SearchHistory';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'matrix' | 'gantt'>('matrix');
  const [showSearch, setShowSearch] = useState(false);

  // Configure sensors to require a small movement (8px) before dragging starts.
  // This allows "click" events to fire on the task items for expansion.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('eisenflow-tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
    setLoading(false);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('eisenflow-tasks', JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  const addTask = (content: string, dueDate?: number) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      content,
      // Default to Q1 (Do First)
      isUrgent: true,
      isImportant: true,
      isCompleted: false,
      createdAt: Date.now(),
      dueDate: dueDate
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { 
        ...t, 
        isCompleted: !t.isCompleted,
        completedAt: !t.isCompleted ? Date.now() : undefined 
      } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const targetQuadrant = over.id as QuadrantID;
      
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          switch (targetQuadrant) {
            case QuadrantID.Q1: return { ...t, isUrgent: true, isImportant: true };
            case QuadrantID.Q2: return { ...t, isUrgent: false, isImportant: true };
            case QuadrantID.Q3: return { ...t, isUrgent: true, isImportant: false };
            case QuadrantID.Q4: return { ...t, isUrgent: false, isImportant: false };
            default: return t;
          }
        }
        return t;
      }));
    }
  };

  const filterTasks = (isUrgent: boolean, isImportant: boolean) => {
    return tasks
      .filter(t => t.isUrgent === isUrgent && t.isImportant === isImportant)
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return b.createdAt - a.createdAt;
      });
  };

  // Daily Quote Logic
  const dailyQuote = useMemo(() => {
    const quotes = [
      "热爱可抵岁月漫长 ❤️",
      "追光的人，终会万丈光芒 ✨",
      "你的坚持，终将美好 💎",
      "万物明朗，未来可期 🌈",
      "保持自律，即是自由 🚀",
      "做自己的太阳，无需借光 ☀️",
      "满怀希望，所向披靡 💪",
      "心有山海，静而无边 🌊",
      "与其仰望星空，不如成为星星 🌟",
      "生活原本沉闷，但跑起来就有风 🍃",
      "乾坤未定，你我皆是黑马 🐎",
      "但行好事，莫问前程 🌸"
    ];
    const today = new Date();
    // Use day of year as seed to ensure same quote for the whole day
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    return quotes[dayOfYear % quotes.length];
  }, []);

  const completedCount = tasks.filter(t => t.isCompleted).length;

  return (
    <div className="min-h-screen font-sans selection:bg-yellow-200 text-gray-800 flex flex-col" style={{ backgroundColor: PALETTE.BEIGE }}>
      
      {/* Header */}
      <header className="px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-palette-red rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/10 transform -rotate-6 transition-transform hover:rotate-0">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path d="M17.8 8.6c.6-1.3.3-2.6-.6-3.4-.6-.5-1.4-.8-2.2-.8-.9 0-1.8.4-2.7.9-.9-.5-1.9-.9-2.9-.9-.8 0-1.6.3-2.2.8-.9.8-1.2 2.1-.6 3.4.4.9 1.1 1.7 1.9 2.3.9.6 1.9.9 2.9.9 1 0 1.9-.3 2.8-.9.9-.6 1.6-1.4 2-2.3zm-6.9-2.1c.5 0 1 .2 1.5.5.5-.3 1-.5 1.5-.5.4 0 .8.1 1.1.4.4.4.5 1 .3 1.5-.2.5-.6.9-1.1 1.2-.5.3-1 .5-1.6.5-.5 0-1.1-.1-1.6-.5-.5-.3-.9-.7-1.1-1.2-.2-.6 0-1.1.3-1.5.4-.3.7-.4 1.1-.4zM12 4.5c.3-1.8 1.5-3.2 3.1-3.6.2 0 .4-.1.6 0 .2.1.3.2.4.4.1.2.1.4 0 .6-.4 1.7-1.7 3.1-3.4 3.4-.2 0-.4 0-.6-.1-.2-.1-.3-.3-.4-.5-.1-.2 0-.4.3-.2zM12 21.5c-4.4 0-8-3.6-8-8 0-3.1 1.8-5.8 4.4-7.1.4-.2.6-.7.4-1.1-.2-.4-.7-.6-1.1-.4C3.8 6.8 1.5 10.1 1.5 14c0 5.2 4.3 9.5 9.5 9.5.5 0 1-.4 1-1s-.4-1-1-1zm5.5-1.5c-1.3 1-2.9 1.5-4.5 1.5-.6 0-1.1-.4-1.1-1s.5-1 1.1-1c1.2 0 2.4-.4 3.3-1.1.4-.3 1-.2 1.3.2.3.4.2 1-.1 1.4z"/>
               </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-medium tracking-wide" style={{ color: PALETTE.YELLOW }}>
                {dailyQuote}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/60 p-1.5 rounded-xl border border-white/40 shadow-sm">
             <button
              onClick={() => setViewMode('matrix')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'matrix' ? 'bg-palette-black text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
             >
               Matrix
             </button>
             <button
              onClick={() => setViewMode('gantt')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'gantt' ? 'bg-palette-black text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
             >
               Timeline
             </button>
             <div className="w-px h-6 bg-gray-300 mx-1"></div>
             <button
              onClick={() => setShowSearch(true)}
              className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-800 transition-all hover:bg-gray-100"
              title="搜索历史记录"
             >
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                 <circle cx="11" cy="11" r="8"/>
                 <path d="m21 21-4.35-4.35"/>
               </svg>
             </button>
             <span className="px-3 text-xs font-bold text-gray-500">{completedCount} Done</span>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 pb-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
        
        <TaskInput onAddTask={addTask} />

        {viewMode === 'matrix' ? (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0">
              
              <Quadrant
                id={QuadrantID.Q1}
                title="Do First"
                accentColor={PALETTE.RED}
                tasks={filterTasks(true, true)}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />

              <Quadrant
                id={QuadrantID.Q2}
                title="Schedule"
                accentColor={PALETTE.BLUE}
                tasks={filterTasks(false, true)}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />

              <Quadrant
                id={QuadrantID.Q3}
                title="Delegate"
                accentColor={PALETTE.YELLOW}
                tasks={filterTasks(true, false)}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />

              <Quadrant
                id={QuadrantID.Q4}
                title="Eliminate"
                accentColor={PALETTE.BLACK}
                tasks={filterTasks(false, false)}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            </div>
          </DndContext>
        ) : (
          <GanttView tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
        )}
      </main>

      {/* Search Modal */}
      {showSearch && (
        <SearchHistory
          tasks={tasks}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
};

export default App;