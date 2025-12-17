import React, { useState, useMemo } from 'react';
import { Task, SearchFilters, PALETTE } from '../types';

interface SearchHistoryProps {
  tasks: Task[];
  onClose: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ tasks, onClose }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });

  const filterTasks = (tasks: Task[], filters: SearchFilters): Task[] => {
    return tasks.filter(task => {
      // Text search
      if (filters.query && !task.content.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filters.status === 'completed' && !task.isCompleted) {
        return false;
      }
      if (filters.status === 'pending' && task.isCompleted) {
        return false;
      }

      // Priority filter
      if (filters.priority === 'urgent' && !task.isUrgent) {
        return false;
      }
      if (filters.priority === 'important' && !task.isImportant) {
        return false;
      }
      if (filters.priority === 'both' && (!task.isUrgent || !task.isImportant)) {
        return false;
      }

      // Date range filter
      const now = Date.now();
      const taskDate = task.completedAt || task.createdAt;

      switch (filters.dateRange) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (taskDate < today.getTime()) return false;
          break;
        case 'week':
          const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
          if (taskDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
          if (taskDate < monthAgo) return false;
          break;
        case 'custom':
          if (filters.startDate && taskDate < filters.startDate) return false;
          if (filters.endDate && taskDate > filters.endDate) return false;
          break;
      }

      return true;
    });
  };

  const filteredTasks = useMemo(() => {
    const filtered = filterTasks(tasks, filters);
    return filtered.sort((a, b) => {
      // Sort by completion status first, then by date
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      const dateA = a.completedAt || a.createdAt;
      const dateB = b.completedAt || b.createdAt;
      return dateB - dateA; // Most recent first
    });
  }, [tasks, filters]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuadrantColor = (task: Task): string => {
    if (task.isUrgent && task.isImportant) return PALETTE.RED;
    if (!task.isUrgent && task.isImportant) return PALETTE.BLUE;
    if (task.isUrgent && !task.isImportant) return PALETTE.YELLOW;
    return PALETTE.BLACK;
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      status: 'all',
      priority: 'all',
      dateRange: 'all'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" style={{ backgroundColor: PALETTE.WHITE }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">历史记录搜索</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          {/* Search Input */}
          <div>
            <input
              type="text"
              placeholder="搜索任务内容..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-palette-blue focus:border-transparent"
              style={{ color: PALETTE.BLACK }}
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-palette-blue"
              >
                <option value="all">全部</option>
                <option value="completed">已完成</option>
                <option value="pending">进行中</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-palette-blue"
              >
                <option value="all">全部</option>
                <option value="urgent">紧急</option>
                <option value="important">重要</option>
                <option value="both">紧急且重要</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">时间范围</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-palette-blue"
              >
                <option value="all">全部时间</option>
                <option value="today">今天</option>
                <option value="week">最近一周</option>
                <option value="month">最近一月</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                清除筛选
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4 text-sm text-gray-600">
            找到 {filteredTasks.length} 个任务
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>没有找到匹配的任务</p>
              <p className="text-sm mt-2">尝试调整搜索条件</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {/* Priority Indicator */}
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getQuadrantColor(task) }}
                    />

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {task.content}
                        </span>
                        {task.isCompleted && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            已完成
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>创建: {formatDate(task.createdAt)}</span>
                        {task.completedAt && (
                          <span>完成: {formatDate(task.completedAt)}</span>
                        )}
                        {task.dueDate && (
                          <span className="text-orange-600">
                            截止: {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchHistory;