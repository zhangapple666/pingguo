import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task, QuadrantID } from '../types';
import { TaskItem } from './TaskItem';

interface QuadrantProps {
  id: QuadrantID;
  title: string;
  subtitle?: string; 
  accentColor: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const Quadrant: React.FC<QuadrantProps> = ({ 
  id,
  title, 
  accentColor,
  tasks, 
  onToggle, 
  onDelete 
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`
        flex flex-col h-full rounded-xl transition-all duration-300
        bg-white shadow-sm overflow-hidden
        ${isOver ? 'ring-2 ring-offset-2 ring-offset-palette-beige' : ''}
      `}
      style={{ 
        borderLeft: `8px solid ${accentColor}`,
        boxShadow: isOver ? `0 0 0 2px ${accentColor}` : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <h3 className="font-bold text-lg text-gray-800 tracking-tight">{title}</h3>
        <span 
          className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        >
          {tasks.length}
        </span>
      </div>
      
      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 quadrant-scroll bg-white">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400/40">
            <div className="w-10 h-10 mb-2 rounded-full border-2 border-current border-dashed flex items-center justify-center opacity-50">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
               </svg>
            </div>
            <span className="text-xs font-medium">Drop here</span>
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskItem 
              key={task.id} 
              index={index + 1}
              task={task} 
              onToggle={onToggle} 
              onDelete={onDelete} 
              accentColor={accentColor}
            />
          ))
        )}
      </div>
    </div>
  );
};