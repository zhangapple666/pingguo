import React, { useState, useRef, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  isToday
} from 'date-fns';
import { PALETTE } from '../types';

interface TaskInputProps {
  onAddTask: (content: string, dueDate?: number) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim()) return;
    
    const timestamp = selectedDate ? selectedDate.getTime() : undefined;
    onAddTask(content, timestamp);
    
    setContent('');
    setSelectedDate(null);
    setIsCalendarOpen(false);
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        handleSubmit();
      }
    }

    // Command/Ctrl + B for Bold
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const selectedText = content.substring(start, end);
      const beforeText = content.substring(0, start);
      const afterText = content.substring(end);
      
      const newContent = `${beforeText}**${selectedText}**${afterText}`;
      setContent(newContent);

      requestAnimationFrame(() => {
        textarea.selectionStart = start + 2;
        textarea.selectionEnd = end + 2;
        textarea.focus();
      });
    }
  };

  // Calendar Logic
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }), // Start on Monday
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
  });

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
    // Reset view to selected date or current month when opening
    if (!isCalendarOpen) {
      setCurrentMonth(selectedDate || new Date());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 relative z-30">
      <div className={`
        bg-white p-4 rounded-2xl shadow-sm border border-gray-200 transition-shadow focus-within:shadow-md relative
      `}>
        <div className="flex gap-2">
           <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done? (Cmd+B for bold)"
              className="flex-1 px-1 py-1 bg-transparent text-gray-800 placeholder-gray-400 outline-none text-lg resize-none min-h-[44px] max-h-[200px]"
              rows={1}
            />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-1 pt-3 mt-2 border-t border-gray-50">
            <div className="flex items-center gap-4 relative">
               {/* Due Date Trigger */}
               <div className="flex items-center gap-2">
                 <button 
                   onClick={toggleCalendar}
                   className={`
                     transition-colors p-1.5 rounded-md flex items-center gap-2
                     ${isCalendarOpen ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}
                   `}
                   title="Set deadline"
                   type="button"
                 >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                   {selectedDate && (
                      <span className="text-xs font-bold text-gray-700">
                        {format(selectedDate, 'MMM d')}
                      </span>
                   )}
                 </button>

                 {/* Custom Calendar Popover */}
                 {isCalendarOpen && (
                   <div 
                      ref={calendarRef}
                      className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-[280px] z-50 select-none animate-in fade-in zoom-in-95 duration-100"
                   >
                      {/* Month Navigator */}
                      <div className="flex items-center justify-between mb-4">
                        <button 
                          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span className="text-sm font-bold text-gray-800">
                          {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <button 
                          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* Weekday Headers */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                          <div key={day} className="text-[10px] text-center text-gray-400 font-medium">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1.5">
                        {days.map((day, idx) => {
                          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                          const isCurrentMonth = isSameMonth(day, currentMonth);
                          const isDayToday = isToday(day);

                          if (!isCurrentMonth) {
                            return <div key={idx} className="w-8 h-8" />; // Invisible placeholder
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedDate(day);
                                setIsCalendarOpen(false);
                              }}
                              className={`
                                w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all
                                ${isSelected 
                                  ? 'text-white shadow-md transform scale-105' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                                ${isDayToday && !isSelected ? 'ring-1 ring-palette-red ring-inset' : ''}
                              `}
                              style={{ 
                                backgroundColor: isSelected ? PALETTE.RED : undefined 
                              }}
                            >
                              {format(day, 'd')}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Clear Button */}
                      {selectedDate && (
                         <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                            <button 
                              onClick={() => {
                                setSelectedDate(null);
                                setIsCalendarOpen(false);
                              }}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                            >
                              Clear date
                            </button>
                         </div>
                      )}
                   </div>
                 )}
               </div>
            </div>

            <div className="flex items-center gap-3">
               <span className="text-xs text-gray-300 font-medium hidden md:inline-block">Press Enter to add</span>
            </div>
          </div>
      </div>
    </div>
  );
};