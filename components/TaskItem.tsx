import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { format, differenceInCalendarDays, isToday, isTomorrow } from 'date-fns';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  accentColor: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, index, onToggle, onDelete, accentColor }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task }
  });

  // Handle click outside to collapse
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (elementRef.current && !elementRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  // Render content with Bold support (**text**)
  const renderContent = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const text = part.slice(2, -2);
        return (
          <span 
            key={i} 
            style={{ color: accentColor }} 
            className="font-extrabold"
          >
            {text}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const getSmartDateLabel = (timestamp?: number) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const now = new Date();
    // Calculate difference in days (ignoring time)
    const diff = differenceInCalendarDays(date, now);

    // Past 
    if (diff < 0) return format(date, 'MMM d'); // e.g., Oct 23
    
    // Today/Tomorrow
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    
    // Future: Within a week (2 to 7 days)
    if (diff <= 7) {
      return format(date, 'EEEE'); // e.g. "Monday"
    }

    // Future: More than a week
    return format(date, 'MMM d'); // e.g. "Oct 24"
  };

  const dateLabel = getSmartDateLabel(task.dueDate);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        relative mb-0.5 group transition-all duration-200
        ${task.isCompleted ? 'opacity-50' : ''}
      `}
      style={style}
    >
      <div 
        ref={elementRef}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        className={`
          flex items-start gap-2 px-2 py-1.5 rounded-md transition-all duration-200 border border-transparent cursor-pointer
          ${isExpanded ? 'bg-gray-50 shadow-sm border-gray-200 z-10 relative cursor-text' : 'hover:bg-gray-50 cursor-pointer'}
        `}
      >
        {/* Numbering */}
        <div className="mt-1 text-xs font-bold text-gray-400 w-4 text-right flex-shrink-0 select-none">
          {index}
        </div>

        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            onToggle(task.id);
          }}
          className={`
            mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer z-20
            ${task.isCompleted 
              ? 'bg-gray-400 border-gray-400 text-white' 
              : 'border-gray-300 hover:border-gray-400 bg-white'
            }
          `}
          onPointerDown={(e) => e.stopPropagation()} // Stop drag init on checkbox
        >
          {task.isCompleted && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className={`text-sm text-gray-800 leading-snug flex-1 ${isExpanded ? 'whitespace-pre-wrap break-all' : 'truncate'}`}>
              {renderContent(task.content)}
            </div>
            
            {/* Date Badge (Visible when collapsed or expanded) */}
            {dateLabel && !isExpanded && (
               <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded flex-shrink-0 whitespace-nowrap shadow-sm">
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                   <span>{dateLabel}</span>
               </div>
            )}
          </div>

          {isExpanded && (
             <div className="mt-2 pt-1.5 border-t border-gray-200 flex justify-between items-center select-none">
               <div className="flex items-center gap-3">
                 <span className="text-[10px] text-gray-400 font-medium">
                   Created: {new Date(task.createdAt).toLocaleDateString()}
                 </span>
                 {dateLabel && (
                   <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due: {dateLabel}
                   </span>
                 )}
               </div>
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 z-20"
                onPointerDown={(e) => e.stopPropagation()}
               >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
               </button>
             </div>
          )}
        </div>
        
        {/* Quick Delete (visible on hover when not expanded) */}
        {!isExpanded && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5 z-20 ml-1"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};