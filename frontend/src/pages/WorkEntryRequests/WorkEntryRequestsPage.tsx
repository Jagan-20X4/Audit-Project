import React, { useMemo } from 'react';
import { FileText, Pencil } from 'lucide-react';
import type { WorkEntry, Project } from '../../types';
import type { AuthUser } from '../../lib/authUser';

type Props = {
  entries: WorkEntry[];
  projects: Project[];
  sessionUser: AuthUser | null;
  onOpenEntry: (projectId: number, date: string) => void;
};

function projectName(projects: Project[], projectId: number): string {
  return projects.find((p) => p.id === projectId)?.name ?? `Project #${projectId}`;
}

function isMyEntry(entry: WorkEntry, session: AuthUser | null): boolean {
  if (!session) return false;
  if (entry.userId != null) return entry.userId === session.id;
  return entry.user === session.name;
}

export default function WorkEntryRequestsPage({
  entries,
  projects,
  sessionUser,
  onOpenEntry,
}: Props) {
  const mine = useMemo(() => {
    const list = entries.filter((e) => isMyEntry(e, sessionUser));
    return [...list].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.id - a.id;
    });
  }, [entries, sessionUser]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-[#6366F1]" />
          My Work Entry Requests
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          All work entries you have logged. Open one in the editor to update details
          or screenshots.
        </p>
      </div>

      {!sessionUser ? (
        <p className="text-sm text-[#6B7280]">Sign in to see your entries.</p>
      ) : mine.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 text-center text-[#6B7280] text-sm">
          No work entries yet. Use <strong>My Work Entry Grid</strong> or{' '}
          <strong>Log New Work</strong> from the dashboard to add your first entry.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F9FAFB] text-[#6B7280] text-xs uppercase tracking-wide border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Task</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Hours</th>
                  <th className="px-4 py-3 font-semibold w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {mine.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 whitespace-nowrap text-[#111827]">
                      {row.date}
                    </td>
                    <td className="px-4 py-3 text-[#111827]">
                      {projectName(projects, row.projectId)}
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <div className="font-medium text-[#111827] truncate" title={row.taskTitle}>
                        {row.taskTitle || '—'}
                      </div>
                      {row.taskNo && row.taskNo !== '-' && (
                        <div className="text-xs text-[#6B7280]">{row.taskNo}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-md bg-[#EEF2FF] px-2 py-0.5 text-xs font-medium text-[#4338CA]">
                        {row.taskType || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#111827]">{row.hours}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenEntry(row.projectId, row.date)}
                        className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-medium text-[#6366F1] hover:bg-[#6366F1]/5"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
