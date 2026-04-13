const AUTH_USER_KEY = 'authUser';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
};

/** API/localStorage may have `role` as a string or nested `{ id, name }`. */
export function normalizeRoleToString(role: unknown): string {
  if (typeof role === 'string') return role;
  if (
    role &&
    typeof role === 'object' &&
    'name' in role &&
    typeof (role as { name: unknown }).name === 'string'
  ) {
    return (role as { name: string }).name;
  }
  return '';
}

/** Coerce login /me / cached JSON into a safe AuthUser (string role, etc.). */
export function normalizeAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = o.id;
  const email = o.email;
  if (typeof id !== 'number' || typeof email !== 'string') return null;
  return {
    id,
    name: typeof o.name === 'string' ? o.name : '',
    email,
    department: typeof o.department === 'string' ? o.department : '',
    role: normalizeRoleToString(o.role),
    status: typeof o.status === 'string' ? o.status : 'active',
  };
}

/** Subtitle under name in header: role, else department. */
export function sessionSubtitle(u: AuthUser | null): string {
  if (!u) return '—';
  const r = u.role?.trim();
  if (r) return r;
  const d = u.department?.trim();
  if (d) return d;
  return '—';
}

export function readStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const u = normalizeAuthUser(parsed);
    if (u) {
      try {
        if (JSON.stringify(parsed) !== JSON.stringify(u)) {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
        }
      } catch {
        /* ignore */
      }
    }
    return u;
  } catch {
    return null;
  }
}

export function writeStoredAuthUser(
  u: AuthUser | Record<string, unknown>,
): void {
  const n = normalizeAuthUser(u);
  if (n) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(n));
}

export function clearStoredAuthUser(): void {
  localStorage.removeItem(AUTH_USER_KEY);
}
