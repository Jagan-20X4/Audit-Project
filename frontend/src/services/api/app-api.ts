import { config } from '../../utils';
import { normalizeAuthUser, type AuthUser } from '../../lib/authUser';
import type { WorkEntry, User, Project } from '../../types';

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function fetchAuthMe(): Promise<AuthUser> {
  const res = await fetch(`${config.apiUrl}/auth/me`, {
    headers: authHeaders(),
  });
  const raw = await parseJson<unknown>(res);
  const u = normalizeAuthUser(raw);
  if (!u) throw new Error('Invalid profile response');
  return u;
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${config.apiUrl}/projects`, {
    headers: authHeaders(),
  });
  return parseJson<Project[]>(res);
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${config.apiUrl}/users`, {
    headers: authHeaders(),
  });
  return parseJson<User[]>(res);
}

export async function fetchWorkEntries(): Promise<WorkEntry[]> {
  const res = await fetch(`${config.apiUrl}/work-entries`, {
    headers: authHeaders(),
  });
  return parseJson<WorkEntry[]>(res);
}

export type WorkEntryWriteBody = {
  userId: number;
  projectId: number;
  taskNo?: string;
  taskTitle?: string;
  description?: string;
  hours: string;
  taskType?: string;
  date: string;
};

export async function createWorkEntry(body: WorkEntryWriteBody): Promise<WorkEntry> {
  const res = await fetch(`${config.apiUrl}/work-entries`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  return parseJson<WorkEntry>(res);
}

export async function updateWorkEntry(
  id: number,
  body: Partial<
    Omit<WorkEntryWriteBody, 'userId'>
  >,
): Promise<WorkEntry> {
  const res = await fetch(`${config.apiUrl}/work-entries/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  return parseJson<WorkEntry>(res);
}

export async function createUser(body: {
  name: string;
  email: string;
  department: string;
  roleName: string;
  status: 'active' | 'inactive';
  permissionCodes: string[];
  password?: string;
}): Promise<User> {
  const res = await fetch(`${config.apiUrl}/users`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  return parseJson<User>(res);
}

export async function updateUser(
  id: number,
  body: Partial<{
    name: string;
    email: string;
    department: string;
    roleName: string;
    status: 'active' | 'inactive';
    permissionCodes: string[];
    password: string;
  }>,
): Promise<User> {
  const res = await fetch(`${config.apiUrl}/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  return parseJson<User>(res);
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${config.apiUrl}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
}
