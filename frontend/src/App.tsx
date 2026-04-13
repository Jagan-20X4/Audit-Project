/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';

import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';

import DashboardPage from './pages/Dashboard/DashboardPage';
import WorkEntryGridPage from './pages/WorkEntry/WorkEntryGridPage';
import UserPermissionsPage from './pages/UserPermissions/UserPermissionsPage';
import BatchPage from './pages/Batch/BatchPage';
import LoginPage from './pages/Auth/LoginPage';
import ProjectsPage from './pages/Projects/ProjectsPage';
import WorkEntryRequestsPage from './pages/WorkEntryRequests/WorkEntryRequestsPage';

import { WorkEntryModal } from './components/WorkEntry/WorkEntryModal';
import { UserModal } from './components/User/UserModal';

import { WorkEntry, User, Project } from './types';
import {
  createUser,
  createWorkEntry,
  deleteUser,
  fetchAuthMe,
  fetchProjects,
  fetchUsers,
  fetchWorkEntries,
  updateUser,
  updateWorkEntry,
} from './services/api/app-api';
import {
  readStoredAuthUser,
  writeStoredAuthUser,
  type AuthUser,
} from './lib/authUser';

export default function App() {
  useLocation(); // re-render on navigation so token is re-read after login
  const token = localStorage.getItem('accessToken');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1));

  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!token) {
      setSessionUser(null);
      return;
    }
    const stored = readStoredAuthUser();
    if (stored) {
      setSessionUser(stored);
      return;
    }
    let cancelled = false;
    fetchAuthMe()
      .then((u) => {
        if (cancelled) return;
        writeStoredAuthUser(u);
        setSessionUser(u);
      })
      .catch(() => {
        if (!cancelled) setSessionUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const refreshData = useCallback(async () => {
    setLoadError(null);
    try {
      const [p, u, e] = await Promise.all([
        fetchProjects(),
        fetchUsers(),
        fetchWorkEntries(),
      ]);
      setProjects(p);
      setUsers(u);
      setEntries(e);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (token) refreshData();
  }, [refreshData, token]);

  /** Logged-in user: new work entries are attributed to this account. */
  const workEntryUserId = sessionUser?.id;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    projectId: number | null;
    date: string | null;
  }>({ projectId: null, date: null });
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };
  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const handleCellClick = (projectId: number, date: string) => {
    setSelectedCell({ projectId, date });
    setModalOpen(true);
  };

  const handleCreateWorkEntry = async (
    body: Omit<WorkEntry, 'id' | 'user'> & { taskTitle?: string },
  ): Promise<WorkEntry> => {
    if (!workEntryUserId) throw new Error('You must be signed in to save.');
    return createWorkEntry({
      userId: workEntryUserId,
      projectId: Number(body.projectId),
      taskNo: String(body.taskNo ?? '-'),
      taskTitle: String(body.taskTitle ?? ''),
      description: String(body.description ?? ''),
      hours: String(body.hours ?? '0:00'),
      taskType: String(body.taskType ?? '-'),
      date: String(body.date ?? ''),
    });
  };

  const handleUpdateWorkEntry = async (
    id: number,
    body: Partial<
      Pick<
        WorkEntry,
        'projectId' | 'taskNo' | 'description' | 'hours' | 'taskType' | 'date'
      > & { taskTitle?: string }
    >,
  ): Promise<WorkEntry> => {
    return updateWorkEntry(id, {
      ...body,
      projectId:
        body.projectId != null ? Number(body.projectId) : undefined,
    });
  };

  const handleAddUser = async (
    userData: Omit<User, 'id'> & { password?: string },
  ) => {
    try {
      const { password, ...rest } = userData;
      const created = await createUser({
        name: rest.name,
        email: rest.email,
        department: rest.department,
        roleName: rest.role,
        status: rest.status,
        permissionCodes: rest.permissions.map(String),
        ...(password ? { password } : {}),
      });
      setUsers((prev) => [...prev, created]);
      setUserModalOpen(false);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not create user');
    }
  };

  const handleEditUser = async (userData: User & { password?: string }) => {
    try {
      const { password, ...u } = userData;
      const updated = await updateUser(u.id, {
        name: u.name,
        email: u.email,
        department: u.department,
        roleName: u.role,
        status: u.status,
        permissionCodes: u.permissions.map(String),
        ...(password ? { password } : {}),
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setUserModalOpen(false);
      setEditingUser(null);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not update user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not delete user');
    }
  };

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (initialLoad) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9FAFB] text-[#6B7280]">
        Loading…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F9FAFB] p-6 text-center">
        <p className="text-red-600">{loadError}</p>
        <p className="max-w-md text-sm text-[#6B7280]">
          Start the API (e.g. port 3002) and ensure PostgreSQL is running. Check
          backend/.env and frontend VITE_API_URL.
        </p>
        <button
          type="button"
          onClick={() => refreshData()}
          className="rounded-md bg-[#6366F1] px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB] font-sans text-[#111827]">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          sessionUser={sessionUser}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route
              path="/"
              element={
                <DashboardPage
                  entries={entries}
                  projects={projects}
                  users={users}
                  sessionUser={sessionUser}
                />
              }
            />
            <Route
              path="/work-entry"
              element={
                <WorkEntryGridPage
                  currentMonth={currentMonth}
                  prevMonth={prevMonth}
                  nextMonth={nextMonth}
                  projects={projects}
                  entries={entries}
                  onCellClick={handleCellClick}
                  setModalOpen={setModalOpen}
                />
              }
            />
            <Route
              path="/permissions"
              element={
                <UserPermissionsPage
                  users={users}
                  onAddUser={() => {
                    setEditingUser(null);
                    setUserModalOpen(true);
                  }}
                  onEditUser={(user) => {
                    setEditingUser(user);
                    setUserModalOpen(true);
                  }}
                  onDeleteUser={handleDeleteUser}
                />
              }
            />
            <Route path="/batch" element={<BatchPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route
              path="/requests"
              element={
                <WorkEntryRequestsPage
                  entries={entries}
                  projects={projects}
                  sessionUser={sessionUser}
                  onOpenEntry={(projectId, date) => {
                    setSelectedCell({ projectId, date });
                    setModalOpen(true);
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <WorkEntryModal
            onClose={() => setModalOpen(false)}
            onCreate={async (body) => {
              const created = await handleCreateWorkEntry(body);
              setEntries((prev) => [created, ...prev]);
              return created;
            }}
            onUpdate={async (id, body) => {
              const updated = await handleUpdateWorkEntry(id, body);
              setEntries((prev) =>
                prev.map((e) => (e.id === id ? updated : e)),
              );
              return updated;
            }}
            initialData={selectedCell}
            projects={projects}
            entries={entries}
          />
        )}
        {userModalOpen && (
          <UserModal
            onClose={() => {
              setUserModalOpen(false);
              setEditingUser(null);
            }}
            onSubmit={editingUser ? handleEditUser : handleAddUser}
            editingUser={editingUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
