import { Role, Permission } from './types';

export const PROJECTS = [
  { id: 1, name: "Bench" },
  { id: 2, name: "Boilerplate - SaaS" },
  { id: 3, name: "Happy Flow" },
  { id: 4, name: "HR Activities" },
  { id: 5, name: "Miscellaneous" },
  { id: 6, name: "Sales Crawler" },
  { id: 7, name: "Work Time" },
  { id: 8, name: "Office Time" },
];

export const ROLE_DEFAULTS: Record<Role, Permission[]> = {
  Admin: ['view', 'create', 'edit', 'delete', 'approve', 'reports', 'manage'],
  Manager: ['view', 'create', 'edit', 'approve', 'reports'],
  'Team Lead': ['view', 'create', 'edit', 'approve'],
  Employee: ['view', 'create', 'edit'],
  Viewer: ['view'],
};

export const DEPARTMENTS = ["IT", "HR", "Development", "Sales", "Marketing", "Finance"];
