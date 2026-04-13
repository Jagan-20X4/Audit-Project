import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Briefcase, 
  Users, 
  AlertCircle, 
  TrendingUp,
  FileText,
  Plus,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell
} from 'recharts';
import { parseTime, formatTime } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import type { AuthUser } from '../../lib/authUser';

interface DashboardPageProps {
  entries: any[];
  projects: any[];
  users: any[];
  sessionUser: AuthUser | null;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  entries,
  projects,
  users,
  sessionUser,
}) => {
  const navigate = useNavigate();

  // Calculate stats
  const totalMinutes = entries.reduce((acc: number, curr: any) => acc + parseTime(curr.hours), 0);
  const totalHours = formatTime(totalMinutes);
  const activeProjects = projects.length;
  const activeUsers = users.filter((u: any) => u.status === 'active').length;
  
  // Data for Project Hours Bar Chart
  const projectData = projects.map((p: any) => {
    const projectMinutes = entries
      .filter((e: any) => e.projectId === p.id)
      .reduce((acc: number, curr: any) => acc + parseTime(curr.hours), 0);
    return {
      name: p.name,
      hours: parseFloat((projectMinutes / 60).toFixed(1))
    };
  }).filter((d: any) => d.hours > 0);

  // Data for Daily Hours Area Chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dailyData = last7Days.map(date => {
    const dayMinutes = entries
      .filter((e: any) => e.date === date)
      .reduce((acc: number, curr: any) => acc + parseTime(curr.hours), 0);
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      hours: parseFloat((dayMinutes / 60).toFixed(1))
    };
  });

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-sm text-[#6B7280]">
            Welcome back{sessionUser?.name ? `, ${sessionUser.name}` : ''}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6B7280] bg-white px-3 py-1.5 rounded-md border border-[#E5E7EB]">
          <Calendar size={16} />
          <span>April 07, 2026</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Hours', value: totalHours, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Projects', value: activeProjects, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active Users', value: activeUsers, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending Requests', value: '3', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-[#E5E7EB] flex items-center gap-4"
          >
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-[#6366F1]" />
              Work Hours Distribution
            </h3>
            <select className="text-xs border border-[#E5E7EB] rounded p-1 outline-none">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {projectData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Clock size={18} className="text-[#6366F1]" />
              Daily Activity Trend
            </h3>
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <TrendingUp size={14} />
              <span>+12% from last week</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="font-bold">Recent Activity</h3>
            <button className="text-xs text-[#6366F1] font-medium hover:underline">View All</button>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {entries.slice(0, 5).map((entry: any) => (
              <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[#6366F1]">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{entry.description}</p>
                    <p className="text-xs text-[#6B7280]">{projects.find((p: any) => p.id === entry.projectId)?.name} • {entry.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{entry.hours}</p>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">{entry.taskType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E5E7EB]">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Log New Work', icon: Plus, color: 'bg-[#6366F1]', path: '/work-entry' },
              { label: 'View Reports', icon: BarChart2, color: 'bg-green-500', path: '/' },
              { label: 'Manage Team', icon: Users, color: 'bg-orange-500', path: '/permissions' },
              { label: 'System Settings', icon: RefreshCw, color: 'bg-gray-500', path: '/' },
            ].map((action, i) => (
              <button 
                key={i}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 transition-all group"
              >
                <div className={`p-2 rounded-md ${action.color} text-white group-hover:scale-110 transition-transform`}>
                  <action.icon size={18} />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 p-4 bg-[#6366F1]/5 rounded-lg border border-[#6366F1]/10">
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-1">Pro Tip</p>
            <p className="text-xs text-[#6B7280]">You can use keyboard shortcuts to navigate between pages quickly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
