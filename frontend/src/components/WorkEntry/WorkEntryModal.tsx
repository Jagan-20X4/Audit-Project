import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Maximize2,
  Minimize2,
  Check,
  RefreshCw,
  FileText,
  Download,
  Pencil,
  CloudUpload,
  Plus,
} from 'lucide-react';
import { message } from 'antd';
import { WorkEntry, Project } from '../../types';
import {
  exportWorkEntriesToWord,
  type WordExportEntry,
} from '../../lib/exportWorkEntriesToWord';

const TASK_TYPES = ['FEATURE', 'BUG', 'TASK', 'IMPROVEMENT'] as const;
const WORK_TYPES = [
  'Task',
  'Bug',
  'Meeting',
  'Review',
  'Documentation',
  'Other',
] as const;

const IMG_ACCEPT = 'image/jpeg,image/png,image/webp';

type ShotPair = { before?: string; after?: string };

function toTimeInputValue(h: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(h || '').trim());
  if (!m) return '00:00';
  const hh = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const mm = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function emptyForm(projectId: number | '', date: string) {
  return {
    projectId,
    date,
    category: 'Task' as (typeof WORK_TYPES)[number],
    taskNo: '',
    taskType: 'FEATURE' as (typeof TASK_TYPES)[number],
    hours: '00:00',
    description: '',
  };
}

/** Next numeric task no (1, 2, …) for this project + date; ignores non-integer taskNo values. */
function nextTaskNoForCell(
  allEntries: WorkEntry[],
  projectId: number | '',
  date: string,
): string {
  const pid = Number(projectId);
  if (!pid || !date) return '1';
  let max = 0;
  for (const e of allEntries) {
    if (e.projectId !== pid || e.date !== date) continue;
    const raw = String(e.taskNo ?? '').trim();
    if (/^\d+$/.test(raw)) {
      const n = parseInt(raw, 10);
      if (Number.isFinite(n)) max = Math.max(max, n);
    }
  }
  return String(max + 1);
}

function numericTaskNoForSort(e: WorkEntry): number {
  const raw = String(e.taskNo ?? '').trim();
  if (/^\d+$/.test(raw)) {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
  }
  return Number.MAX_SAFE_INTEGER;
}

interface WorkEntryModalProps {
  onClose: () => void;
  onCreate: (
    body: Omit<WorkEntry, 'id' | 'user'> & { taskTitle?: string },
  ) => Promise<WorkEntry>;
  onUpdate: (
    id: number,
    body: Partial<
      Pick<
        WorkEntry,
        'projectId' | 'taskNo' | 'description' | 'hours' | 'taskType' | 'date'
      > & { taskTitle?: string }
    >,
  ) => Promise<WorkEntry>;
  initialData: { projectId: number | null; date: string | null };
  projects: Project[];
  entries: WorkEntry[];
}

export const WorkEntryModal: React.FC<WorkEntryModalProps> = ({
  onClose,
  onCreate,
  onUpdate,
  initialData,
  projects,
  entries,
}) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [shotByEntryId, setShotByEntryId] = useState<Record<number, ShotPair>>(
    {},
  );
  const [beforeB64, setBeforeB64] = useState<string | null>(null);
  const [afterB64, setAfterB64] = useState<string | null>(null);
  const [formData, setFormData] = useState(() => {
    const pid = initialData.projectId ?? '';
    const date =
      initialData.date || new Date().toISOString().split('T')[0];
    return {
      ...emptyForm(pid, date),
      taskNo: nextTaskNoForCell(entries, pid, date),
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const pid = initialData.projectId ?? '';
    const date =
      initialData.date || new Date().toISOString().split('T')[0];
    setFormData({
      ...emptyForm(pid, date),
      taskNo: nextTaskNoForCell(entries, pid, date),
    });
    setErrors({});
    setEditingId(null);
    setBeforeB64(null);
    setAfterB64(null);
    setJustSaved(false);
  }, [initialData.projectId, initialData.date]);

  /** When creating a new row, keep task no in sync if project or date changes in the form. */
  useEffect(() => {
    if (editingId != null) return;
    const pid = formData.projectId;
    const date = formData.date;
    if (!pid || !date) return;
    const next = nextTaskNoForCell(entries, pid, date);
    setFormData((prev) => {
      if (prev.projectId !== pid || prev.date !== date) return prev;
      if (prev.taskNo === next) return prev;
      return { ...prev, taskNo: next };
    });
    // Intentionally omit `entries` so saving a new row does not bump task no while the form is still dirty.
  }, [editingId, formData.projectId, formData.date]);

  const listEntries = useMemo(() => {
    const pid = Number(formData.projectId);
    if (!pid || !formData.date) return [];
    const rows = entries.filter(
      (e) => e.projectId === pid && e.date === formData.date,
    );
    return [...rows].sort((a, b) => {
      const na = numericTaskNoForSort(a);
      const nb = numericTaskNoForSort(b);
      if (na !== nb) return na - nb;
      return a.id - b.id;
    });
  }, [entries, formData.projectId, formData.date]);

  const validate = useCallback(() => {
    const next: Record<string, string> = {};
    if (!formData.projectId) next.projectId = 'Required';
    if (!formData.date) next.date = 'Required';
    if (!formData.category) next.category = 'Required';
    if (!String(formData.taskNo || '').trim()) next.taskNo = 'Required';
    if (!formData.taskType) next.taskType = 'Required';
    if (!formData.hours || formData.hours === '00:00')
      next.hours = 'Required';
    if (!String(formData.description || '').trim())
      next.description = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [formData]);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error('read failed'));
      r.readAsDataURL(file);
    });

  const onPickImage = async (
    file: File | undefined,
    side: 'before' | 'after',
  ) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      message.error('Only JPG, PNG, or WEBP allowed.');
      return;
    }
    const url = await readFileAsDataUrl(file);
    if (side === 'before') setBeforeB64(url);
    else setAfterB64(url);
  };

  const dropHandlers = (side: 'before' | 'after') => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const f = e.dataTransfer.files?.[0];
      if (f) void onPickImage(f, side);
    },
  });

  const buildWordRowsForExport = (): WordExportEntry[] =>
    listEntries.map((e) => {
      const shots = shotByEntryId[e.id];
      return {
        projectName: projects.find((p) => p.id === e.projectId)?.name ?? '',
        date: e.date,
        workType: e.taskTitle || '',
        taskNo: e.taskNo,
        taskType: e.taskType,
        hours: e.hours,
        description: e.description,
        beforeImageBase64: shots?.before ?? null,
        afterImageBase64: shots?.after ?? null,
      };
    });

  const handleExportWord = async () => {
    try {
      const rows = buildWordRowsForExport();
      if (rows.length === 0) {
        message.warning('No entries to export for this project/date.');
        return;
      }
      await exportWorkEntriesToWord(
        rows,
        `worktrack-entries-${formData.date}.docx`,
      );
      message.success('Word document downloaded.');
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Export failed');
    }
  };

  const persistShots = (id: number, before: string | null, after: string | null) => {
    setShotByEntryId((prev) => ({
      ...prev,
      [id]: {
        ...(before ? { before } : {}),
        ...(after ? { after } : {}),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const base = {
      projectId: Number(formData.projectId),
      taskNo: String(formData.taskNo).trim(),
      taskTitle: formData.category,
      description: formData.description.trim(),
      hours: formData.hours,
      taskType: formData.taskType,
      date: formData.date,
    };
    try {
      if (editingId != null) {
        const updated = await onUpdate(editingId, base);
        persistShots(updated.id, beforeB64, afterB64);
        message.success('Entry updated.');
        setJustSaved(true);
      } else {
        const created = await onCreate(base as Omit<WorkEntry, 'id' | 'user'>);
        persistShots(created.id, beforeB64, afterB64);
        message.success('Entry saved.');
        setJustSaved(true);
        const pid = Number(formData.projectId);
        const d = formData.date;
        const merged = [...entries, created];
        setFormData({
          ...emptyForm(pid, d),
          taskNo: nextTaskNoForCell(merged, pid, d),
        });
        setBeforeB64(null);
        setAfterB64(null);
        setErrors({});
        setEditingId(null);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const resetForm = () => {
    setFormData((prev) => ({
      ...emptyForm(prev.projectId, prev.date),
      taskNo: nextTaskNoForCell(entries, prev.projectId, prev.date),
    }));
    setBeforeB64(null);
    setAfterB64(null);
    setErrors({});
    setEditingId(null);
    setJustSaved(false);
  };

  const handleAddNew = () => {
    resetForm();
  };

  const startEdit = (entry: WorkEntry) => {
    setEditingId(entry.id);
    setJustSaved(false);
    const cat = entry.taskTitle as string;
    const category = (WORK_TYPES as readonly string[]).includes(cat)
      ? (cat as (typeof WORK_TYPES)[number])
      : 'Task';
    setFormData({
      projectId: entry.projectId,
      date: entry.date,
      category,
      taskNo: entry.taskNo,
      taskType: (TASK_TYPES as readonly string[]).includes(entry.taskType)
        ? (entry.taskType as (typeof TASK_TYPES)[number])
        : 'FEATURE',
      hours: toTimeInputValue(entry.hours),
      description: entry.description,
    });
    const sh = shotByEntryId[entry.id];
    setBeforeB64(sh?.before ?? null);
    setAfterB64(sh?.after ?? null);
    setErrors({});
  };

  const shellClass = fullscreen
    ? 'fixed inset-2 z-[60] max-w-none w-auto min-h-0 h-[calc(100vh-1rem)] sm:inset-4'
    : 'w-full max-w-[920px] min-h-[88vh] max-h-[92vh]';

  const UploadZone = ({
    label,
    value,
    onClear,
    side,
  }: {
    label: string;
    value: string | null;
    onClear: () => void;
    side: 'before' | 'after';
  }) => (
    <div className="relative flex-1 min-h-[200px]">
      <input
        type="file"
        accept={IMG_ACCEPT}
        className="hidden"
        id={`shot-${side}`}
        onChange={(ev) => {
          const f = ev.target.files?.[0];
          void onPickImage(f, side);
          ev.target.value = '';
        }}
      />
      <label
        htmlFor={`shot-${side}`}
        {...dropHandlers(side)}
        className="flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-3 text-center transition-colors hover:border-[#6366F1]/50 hover:bg-[#EEF2FF]/40"
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className="max-h-[170px] max-w-full rounded object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClear();
              }}
              className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow hover:bg-red-700"
            >
              ×
            </button>
          </>
        ) : (
          <>
            <CloudUpload className="mb-2 text-[#6366F1]" size={32} />
            <span className="text-sm font-medium text-[#374151]">{label}</span>
            <span className="mt-1 text-xs text-[#6B7280]">Click or drop</span>
          </>
        )}
      </label>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className={`relative z-10 flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-2xl min-w-0 sm:min-w-[820px] ${shellClass}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-gray-50 px-4 py-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#111827]">
            <FileText size={20} className="text-[#6366F1]" />
            Work Entry Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleExportWord()}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-gray-50"
            >
              <Download size={16} />
              Export Word
            </button>
            <button
              type="button"
              onClick={() => setFullscreen((f) => !f)}
              className="p-1.5 text-gray-500 hover:rounded-md hover:bg-gray-200"
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:rounded-md hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">
                  Project*
                </label>
                <select
                  value={formData.projectId === '' ? '' : String(formData.projectId)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectId: e.target.value
                        ? Number(e.target.value)
                        : '',
                    })
                  }
                  className={`w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20 ${
                    errors.projectId ? 'border-red-500' : 'border-[#E5E7EB]'
                  }`}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="text-[10px] text-red-500">{errors.projectId}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">
                  Date*
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20 ${
                    errors.date ? 'border-red-500' : 'border-[#E5E7EB]'
                  }`}
                />
                {errors.date && (
                  <p className="text-[10px] text-red-500">{errors.date}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">
                  Type*
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as (typeof WORK_TYPES)[number],
                    })
                  }
                  className={`w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20 ${
                    errors.category ? 'border-red-500' : 'border-[#E5E7EB]'
                  }`}
                >
                  {WORK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-[10px] text-red-500">{errors.category}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">
                  Task No*
                  {editingId == null && (
                    <span className="ml-1 font-normal normal-case text-[#9CA3AF]">
                      (auto)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  readOnly={editingId == null}
                  title={
                    editingId == null
                      ? 'Sequential number for this project and date'
                      : undefined
                  }
                  value={formData.taskNo}
                  onChange={(e) =>
                    setFormData({ ...formData, taskNo: e.target.value })
                  }
                  className={`w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20 ${
                    errors.taskNo ? 'border-red-500' : 'border-[#E5E7EB]'
                  } ${editingId == null ? 'cursor-default bg-[#F9FAFB] text-[#374151]' : ''}`}
                />
                {errors.taskNo && (
                  <p className="text-[10px] text-red-500">{errors.taskNo}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">
                  Task Type*
                </label>
                <select
                  value={formData.taskType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taskType: e.target.value as (typeof TASK_TYPES)[number],
                    })
                  }
                  className={`w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20 ${
                    errors.taskType ? 'border-red-500' : 'border-[#E5E7EB]'
                  }`}
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.taskType && (
                  <p className="text-[10px] text-red-500">{errors.taskType}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">
                  Total Hours*
                </label>
                <input
                  type="time"
                  value={formData.hours}
                  onChange={(e) =>
                    setFormData({ ...formData, hours: e.target.value })
                  }
                  className={`w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20 ${
                    errors.hours ? 'border-red-500' : 'border-[#E5E7EB]'
                  }`}
                />
                {errors.hours && (
                  <p className="text-[10px] text-red-500">{errors.hours}</p>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <label className="text-xs font-semibold text-[#6B7280]">
                Description*
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={`w-full resize-y rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20 ${
                  errors.description ? 'border-red-500' : 'border-[#E5E7EB]'
                }`}
              />
              {errors.description && (
                <p className="text-[10px] text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                Screenshots
              </h3>
              <div className="flex flex-col gap-4 sm:flex-row">
                <UploadZone
                  label="Before Changes"
                  value={beforeB64}
                  onClear={() => setBeforeB64(null)}
                  side="before"
                />
                <UploadZone
                  label="After Changes"
                  value={afterB64}
                  onClear={() => setAfterB64(null)}
                  side="after"
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                Saved entries (this project & date)
              </h3>
              <div className="max-h-48 overflow-auto rounded-lg border border-[#E5E7EB]">
                <table className="w-full text-left text-[12px]">
                  <thead className="sticky top-0 bg-gray-100 text-[#6B7280]">
                    <tr>
                      <th className="p-2">Task No</th>
                      <th className="p-2">Task Type</th>
                      <th className="p-2">Hours</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Before</th>
                      <th className="p-2">After</th>
                      <th className="p-2 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {listEntries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-4 text-center text-[#9CA3AF]"
                        >
                          No entries yet.
                        </td>
                      </tr>
                    ) : (
                      listEntries.map((row) => {
                        const sh = shotByEntryId[row.id];
                        return (
                          <tr
                            key={row.id}
                            className="border-t border-[#E5E7EB] hover:bg-gray-50"
                          >
                            <td className="p-2 font-medium">{row.taskNo}</td>
                            <td className="p-2">{row.taskType}</td>
                            <td className="p-2">{row.hours}</td>
                            <td className="max-w-[140px] truncate p-2" title={row.description}>
                              {row.description}
                            </td>
                            <td className="p-2">
                              {sh?.before ? (
                                <img
                                  src={sh.before}
                                  alt=""
                                  className="h-8 w-10 rounded object-cover"
                                />
                              ) : (
                                <span className="text-[#9CA3AF]">—</span>
                              )}
                            </td>
                            <td className="p-2">
                              {sh?.after ? (
                                <img
                                  src={sh.after}
                                  alt=""
                                  className="h-8 w-10 rounded object-cover"
                                />
                              ) : (
                                <span className="text-[#9CA3AF]">—</span>
                              )}
                            </td>
                            <td className="p-2">
                              <button
                                type="button"
                                onClick={() => startEdit(row)}
                                className="rounded p-1 text-[#6366F1] hover:bg-[#EEF2FF]"
                                aria-label="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[#E5E7EB] bg-white px-6 py-4">
            {justSaved ? (
              <>
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 rounded-md bg-[#6366F1] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#4F46E5]"
                >
                  <Plus size={18} />
                  Add New
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-gray-50"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-md border border-[#2196F3] px-4 py-2 text-sm font-medium text-[#2196F3] hover:bg-[#2196F3]/5"
                >
                  <RefreshCw size={18} />
                  Reset
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md bg-[#4CAF50] px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#43A047]"
                >
                  <Check size={18} />
                  {editingId != null ? 'Update Entry' : 'Create'}
                </button>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};
