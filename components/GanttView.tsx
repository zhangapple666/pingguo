import React, { useState } from 'react';
import { Task, PALETTE } from '../types';
import { format, getDaysInMonth, getDate, isSameMonth, isSameYear } from 'date-fns';

interface GanttViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({ tasks, onToggle, onDelete }) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const currentDate = new Date(selectedYear, selectedMonth, 1);
  const daysInMonth = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter tasks for the selected month
  const monthlyTasks = tasks.filter(task => {
    const createdDate = new Date(task.createdAt);
    return isSameMonth(createdDate, currentDate) && isSameYear(createdDate, currentDate);
  }).sort((a, b) => a.createdAt - b.createdAt);

  const getTaskColor = (task: Task) => {
    if (task.isUrgent && task.isImportant) return PALETTE.RED;
    if (!task.isUrgent && task.isImportant) return PALETTE.BLUE;
    if (task.isUrgent && !task.isImportant) return PALETTE.YELLOW;
    return '#374151'; // Gray-700
  };

  const getBarStyles = (task: Task) => {
    const startDate = new Date(task.createdAt);
    const startDay = getDate(startDate);
    
    let endDay = daysInMonth; // Default cap

    if (task.dueDate) {
        // If there is a deadline
        const ddl = new Date(task.dueDate);
        if (isSameMonth(ddl, currentDate) && isSameYear(ddl, currentDate)) {
            endDay = getDate(ddl);
        } else if (ddl < currentDate) {
             // DDL was in past month, showing in current month view? 
             // Logic: Bar starts at creation. If DDL is past, cap at startDay (dot) or handle overlap.
             // Since we filter by created in this month, assume DDL is future or same month usually.
             endDay = startDay; 
        } else {
             // DDL is future month
             endDay = daysInMonth;
        }
    } else {
        // No Deadline: Show Created -> Completed (or Now)
        if (task.isCompleted && task.completedAt) {
            const completed = new Date(task.completedAt);
             if (isSameMonth(completed, currentDate) && isSameYear(completed, currentDate)) {
                endDay = getDate(completed);
            }
        } else {
            // Active, extend to today
            if (isSameMonth(now, currentDate) && isSameYear(now, currentDate)) {
                endDay = getDate(now);
            }
        }
    }
    
    // Ensure endDay is at least startDay
    endDay = Math.max(startDay, endDay);

    return {
      left: `${((startDay - 1) / daysInMonth) * 100}%`,
      width: `${Math.max(((endDay - startDay + 1) / daysInMonth) * 100, 2)}%` // Min width 2% for visibility
    };
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="w-full max-w-6xl mx-auto pb-10 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
      
      {/* Controls */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
         <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-800">Timeline</h2>
            <div className="flex items-center gap-2">
                <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                >
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
            </div>
         </div>
         <div className="text-sm text-gray-500">
             {monthlyTasks.length} Tasks
         </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-auto relative">
        <div className="min-w-[800px] h-full flex flex-col">
            
            {/* Header Days */}
            <div className="flex border-b border-gray-100 sticky top-0 bg-white z-20">
                <div className="w-48 flex-shrink-0 p-3 border-r border-gray-100 font-semibold text-xs text-gray-500 bg-gray-50/50">
                    Task
                </div>
                <div className="flex-1 flex">
                    {days.map(d => (
                        <div key={d} className="flex-1 border-r border-gray-50 py-2 text-center text-xs text-gray-400">
                            {d}
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 relative">
                {monthlyTasks.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        No tasks created in this period
                    </div>
                ) : (
                    monthlyTasks.map((task) => (
                        <div key={task.id} className="flex border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                            {/* Task Info Column */}
                            <div className="w-48 flex-shrink-0 p-3 border-r border-gray-100 flex flex-col justify-center bg-white sticky left-0 z-10 group-hover:bg-gray-50/50">
                                <div className="text-sm font-medium text-gray-800 truncate" title={task.content.replace(/\*\*/g, '')}>
                                    {task.content.replace(/\*\*/g, '')}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                    {format(new Date(task.createdAt), 'MMM d')} 
                                    {task.dueDate ? ` → ${format(new Date(task.dueDate), 'MMM d')}` : (task.completedAt ? ` - ${format(new Date(task.completedAt), 'MMM d')}` : '')}
                                </div>
                            </div>
                            
                            {/* Bar Column */}
                            <div className="flex-1 relative py-3">
                                {/* Background Grid Lines */}
                                <div className="absolute inset-0 flex">
                                    {days.map(d => (
                                        <div key={d} className="flex-1 border-r border-gray-50/50 h-full"></div>
                                    ))}
                                </div>
                                
                                {/* The Bar */}
                                <div 
                                    className="absolute h-6 rounded-md shadow-sm transition-all hover:brightness-110 cursor-pointer flex items-center justify-end px-1"
                                    style={{
                                        ...getBarStyles(task),
                                        backgroundColor: getTaskColor(task),
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        opacity: task.isCompleted ? 0.7 : 1
                                    }}
                                    title={`${task.content} ${task.dueDate ? `(Due: ${format(new Date(task.dueDate), 'yyyy-MM-dd')})` : ''}`}
                                    onClick={() => onToggle(task.id)}
                                >
                                    {task.dueDate && !task.isCompleted && (
                                       <svg className="w-3 h-3 text-white/90 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                       </svg>
                                    )}
                                    {task.isCompleted && (
                                        <div className="text-white/80">
                                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};