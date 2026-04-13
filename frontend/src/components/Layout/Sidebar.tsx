import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Grid, 
  FileText, 
  BarChart2, 
  Users, 
  Menu,
  Database,
  FolderKanban,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'MY PERSONAL WORKSPACE', path: '/' },
    { id: 'workentry', label: 'My Work Entry Grid', icon: Grid, section: 'MY PERSONAL WORKSPACE', path: '/work-entry' },
    { id: 'requests', label: 'My Work Entry Requests', icon: FileText, section: 'MY PERSONAL WORKSPACE', path: '/requests' },
    { id: 'batch', label: 'Batch Management', icon: Database, section: 'MY PERSONAL WORKSPACE', path: '/batch' },
    { id: 'projects', label: 'Project Management', icon: FolderKanban, section: 'MY PERSONAL WORKSPACE', path: '/projects' },
    { id: 'reports', label: 'Reports', icon: BarChart2, section: "MY TEAM'S WORK TRACKING", path: '/reports' },
    { id: 'permissions', label: 'User Permissions', icon: Users, section: "MY TEAM'S WORK TRACKING", path: '/permissions' },
  ];

  const sections = Array.from(new Set(menuItems.map(item => item.section)));

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="bg-white border-r border-[#E5E7EB] flex flex-col h-full z-20"
    >
      <div className="p-4 flex items-center justify-between border-b border-[#E5E7EB]">
        {!collapsed && <span className="font-bold text-xl text-[#6366F1]">WorkTrack</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-gray-100 rounded-md text-[#6366F1]">
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {sections.map(section => (
          <div key={section} className="mb-6">
            {!collapsed && (
              <h3 className="px-6 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                {section}
              </h3>
            )}
            {menuItems.filter(item => item.section === section).map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-6 py-3 transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-[#6366F1]/10 text-[#6366F1] border-r-4 border-[#6366F1]' 
                    : 'text-[#6B7280] hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} className="min-w-[20px]" />
                {!collapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </div>
    </motion.aside>
  );
};
