import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  ArrowUpDown
} from 'lucide-react';
import { getDaysInMonth, isWeekend, isToday, parseTime, formatTime } from '../../utils/dateUtils';
import { Project, WorkEntry } from '../../types';

interface WorkEntryGridPageProps {
  currentMonth: Date;
  prevMonth: () => void;
  nextMonth: () => void;
  projects: Project[];
  entries: WorkEntry[];
  onCellClick: (projectId: number, date: string) => void;
  setModalOpen: (open: boolean) => void;
}

const WorkEntryGridPage: React.FC<WorkEntryGridPageProps> = ({ 
  currentMonth, 
  prevMonth, 
  nextMonth, 
  projects, 
  entries, 
  onCellClick, 
  setModalOpen 
}) => {
  const days = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  const getCellHours = (projectId: number, dateStr: string) => {
    const dayEntries = entries.filter((e: any) => e.projectId === projectId && e.date === dateStr);
    if (dayEntries.length === 0) return "";
    const totalMinutes = dayEntries.reduce((acc: number, curr: any) => acc + parseTime(curr.hours), 0);
    return formatTime(totalMinutes);
  };

  const getRowTotal = (projectId: number) => {
    const projectEntries = entries.filter((e: any) => e.projectId === projectId && new Date(e.date).getMonth() === currentMonth.getMonth());
    const totalMinutes = projectEntries.reduce((acc: number, curr: any) => acc + parseTime(curr.hours), 0);
    return formatTime(totalMinutes);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Work Entry Grid</h1>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
        >
          Work Entry Log
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        {/* Navigation */}
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-center gap-4">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-[#6366F1]">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Calendar size={18} className="text-[#6366F1]" />
            <span>{monthName} - {year}</span>
            <Calendar size={18} className="text-[#6366F1]" />
          </div>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-[#6366F1]">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 bg-gray-50 border-b border-r border-[#E5E7EB] p-3 text-left min-w-[180px] font-semibold">Project</th>
                {days.map(day => {
                  const dateStr = day.toISOString().split('T')[0];
                  const weekend = isWeekend(day);
                  const today = isToday(day);
                  return (
                    <th 
                      key={dateStr} 
                      className={`border-b border-r border-[#E5E7EB] p-2 text-center min-w-[45px] font-medium ${
                        weekend ? 'bg-[#FFEBEE]' : today ? 'bg-[#E8F5E9]' : ''
                      }`}
                    >
                      {day.getDate()}
                    </th>
                  );
                })}
                <th className="border-b border-[#E5E7EB] p-3 text-center min-w-[80px] font-semibold bg-gray-50">Total</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project: any) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white border-b border-r border-[#E5E7EB] p-3 font-medium shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    {project.name}
                  </td>
                  {days.map(day => {
                    const dateStr = day.toISOString().split('T')[0];
                    const hours = getCellHours(project.id, dateStr);
                    const weekend = isWeekend(day);
                    const today = isToday(day);
                    return (
                      <td 
                        key={dateStr} 
                        onClick={() => onCellClick(project.id, dateStr)}
                        className={`border-b border-r border-[#E5E7EB] p-2 text-center cursor-pointer hover:bg-gray-100 transition-colors ${
                          weekend ? 'bg-[#FFEBEE]' : today ? 'bg-[#E8F5E9]' : ''
                        }`}
                      >
                        {hours}
                      </td>
                    );
                  })}
                  <td className="border-b border-[#E5E7EB] p-3 text-center font-bold bg-gray-50">
                    {getRowTotal(project.id)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Recent Work Entries</h2>
        <EntriesTable entries={entries} projects={projects} />
      </div>
    </div>
  );
};

function EntriesTable({ entries, projects }: { entries: WorkEntry[], projects: Project[] }) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof WorkEntry, direction: 'asc' | 'desc' } | null>(null);

  const sortedEntries = useMemo(() => {
    let sortableItems = [...entries];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [entries, sortConfig]);

  const requestSort = (key: keyof WorkEntry) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-gray-50 border-b border-[#E5E7EB]">
            <tr>
              {['ID', 'User', 'Project', 'Task No', 'Task Title', 'Description', 'Hours', 'Task Type', 'Task Date'].map((header, idx) => {
                const keys: (keyof WorkEntry)[] = ['id', 'user', 'projectId', 'taskNo', 'taskTitle', 'description', 'hours', 'taskType', 'date'];
                return (
                  <th 
                    key={header} 
                    onClick={() => requestSort(keys[idx])}
                    className="p-4 font-semibold text-[#6B7280] cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {header}
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {sortedEntries.map(entry => (
              <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-[#6366F1]">{entry.id}</td>
                <td className="p-4">{entry.user}</td>
                <td className="p-4">{projects.find(p => p.id === entry.projectId)?.name}</td>
                <td className="p-4">{entry.taskNo}</td>
                <td className="p-4">{entry.taskTitle || "-"}</td>
                <td className="p-4 max-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{entry.description}</span>
                    <button className="text-[#6366F1] hover:underline font-medium text-[11px]">More</button>
                  </div>
                </td>
                <td className="p-4 font-semibold">{entry.hours}</td>
                <td className="p-4">
                  {entry.taskType !== "-" ? (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[11px] font-bold">
                      {entry.taskType}
                    </span>
                  ) : "-"}
                </td>
                <td className="p-4">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between text-sm text-[#6B7280]">
        <span>Showing {sortedEntries.length} entries</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-[#E5E7EB] rounded hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 bg-[#6366F1] text-white rounded">1</button>
          <button className="px-3 py-1 border border-[#E5E7EB] rounded hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}

export default WorkEntryGridPage;
