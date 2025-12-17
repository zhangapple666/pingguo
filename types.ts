export interface Task {
  id: string;
  content: string;
  isUrgent: boolean;
  isImportant: boolean;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
  dueDate?: number;
}

export interface TaskAnalysis {
  isUrgent: boolean;
  isImportant: boolean;
  reasoning: string;
}

export interface SearchFilters {
  query: string;
  status: 'all' | 'completed' | 'pending';
  priority: 'all' | 'urgent' | 'important' | 'both';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate?: number;
  endDate?: number;
}

export enum QuadrantID {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4'
}

export const PALETTE = {
  RED: '#CD4C3F',
  BLUE: '#224E96',
  YELLOW: '#F4D737',
  GREEN: '#35AF76',
  BEIGE: '#404040',
  WHITE: '#FFFFFF',
  BLACK: '#000000'
};