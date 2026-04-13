export type Role = 'Admin' | 'Manager' | 'Team Lead' | 'Employee' | 'Viewer';
export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'reports' | 'manage';

export interface Project {
  id: number;
  name: string;
}

export interface WorkEntry {
  id: number;
  /** Owner of the row; used for “My work entry” views. */
  userId?: number;
  user: string;
  projectId: number;
  taskNo: string;
  taskTitle: string;
  description: string;
  hours: string; // HH:MM
  taskType: string;
  date: string; // YYYY-MM-DD
}

export interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  role: Role;
  permissions: Permission[];
  status: 'active' | 'inactive';
}
