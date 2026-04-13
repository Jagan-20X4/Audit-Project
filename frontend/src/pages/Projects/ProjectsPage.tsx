import React, { useEffect, useState } from 'react';
import { FolderKanban, Plus, Trash2 } from 'lucide-react';
import request from '../../lib/axios/request';

type Project = { id: number; name: string; description: string };

type ApiResp<T> = { data: T; message: string; error: boolean };

function projectsFromResponse(body: unknown): Project[] {
  if (Array.isArray(body)) return body;
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    Array.isArray((body as ApiResp<Project[]>).data)
  ) {
    return (body as ApiResp<Project[]>).data;
  }
  return [];
}

export default function ProjectsPage() {
  const [rows, setRows] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await request<Project[] | ApiResp<Project[]>>({
        url: '/projects',
        method: 'GET',
      });
      setRows(projectsFromResponse(res.data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const res = await request<ApiResp<Project>>({
      url: '/projects',
      method: 'POST',
      data: { name, description },
    });
    setRows((p) => [...p, res.data.data]);
    setName('');
    setDescription('');
  };

  const remove = async (id: number) => {
    await request<ApiResp<null>>({ url: `/projects/${id}`, method: 'DELETE' });
    setRows((p) => p.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="text-[#6366F1]" />
            Project Management
          </h1>
          <p className="text-sm text-[#6B7280]">Create and manage projects</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E7EB] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
          />
          <button
            onClick={create}
            disabled={!name.trim()}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Plus size={18} />
            Add Project
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-gray-50 border-b border-[#E5E7EB]">
              <tr>
                <th className="p-4 font-semibold text-[#6B7280]">Name</th>
                <th className="p-4 font-semibold text-[#6B7280]">Description</th>
                <th className="p-4 font-semibold text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    Loading projects...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    No projects found.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4 text-[#6B7280]">{p.description}</td>
                    <td className="p-4">
                      <button
                        onClick={() => remove(p.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

