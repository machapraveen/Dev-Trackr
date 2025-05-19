export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  notes: ProjectNote[];
  links: ProjectLink[];
  tasks: ProjectTask[];
  color: string;
  lastActive?: string;
  activityLogs: ActivityLog[];
}

export interface ProjectNote {
  id: string;
  content: string;
  timestamp: string;
}

export interface ProjectLink {
  id: string;
  type: 'file' | 'url' | 'llm';
  path: string;
  timestamp: string;
}

export interface ProjectTask {
  id: string;
  content: string;
  completed: boolean;
  timestamp: string;
  dueDate?: string;
  projectId: string;
}

export interface ActivityLog {
  id: string;
  type: 'project_opened' | 'task_completed' | 'progress_updated' | 'link_added';
  description: string;
  timestamp: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  color: string;
  timestamp?: string;
}

export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  timestamp: string;
}
