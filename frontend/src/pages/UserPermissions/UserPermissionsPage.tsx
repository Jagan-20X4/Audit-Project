import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Circle
} from 'lucide-react';
import { User, Role } from '../../types';
import { ROLE_DEFAULTS, DEPARTMENTS } from '../../constants';

interface UserPermissionsPageProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (id: number) => void;
}

const UserPermissionsPage: React.FC<UserPermissionsPageProps> = ({ 
  users, 
  onAddUser, 
  onEditUser, 
  onDeleteUser 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    const matchesDept = deptFilter === "All" || user.department === deptFilter;
    const matchesStatus = statusFilter === "All" || user.status === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'Admin': return 'bg-[#FEE2E2] text-[#DC2626]';
      case 'Manager': return 'bg-[#DBEAFE] text-[#2563EB]';
      case 'Team Lead': return 'bg-[#FEF3C7] text-[#D97706]';
      case 'Employee': return 'bg-[#D1FAE5] text-[#059669]';
      case 'Viewer': return 'bg-[#F3F4F6] text-[#6B7280]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Permissions</h1>
          <p className="text-sm text-[#6B7280]">Manage user access and permissions</p>
        </div>
        <button 
          onClick={onAddUser}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E7EB] flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
          />
        </div>
        <select 
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="p-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
        >
          <option>All Roles</option>
          {Object.keys(ROLE_DEFAULTS).map(role => <option key={role}>{role}</option>)}
        </select>
        <select 
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="p-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
        >
          <option>All</option>
          {DEPARTMENTS.map(dept => <option key={dept}>{dept}</option>)}
        </select>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="p-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-gray-50 border-b border-[#E5E7EB]">
              <tr>
                <th className="p-4 font-semibold text-[#6B7280]">#</th>
                <th className="p-4 font-semibold text-[#6B7280]">User</th>
                <th className="p-4 font-semibold text-[#6B7280]">Email</th>
                <th className="p-4 font-semibold text-[#6B7280]">Department</th>
                <th className="p-4 font-semibold text-[#6B7280]">Role</th>
                <th className="p-4 font-semibold text-[#6B7280]">Permissions</th>
                <th className="p-4 font-semibold text-[#6B7280]">Status</th>
                <th className="p-4 font-semibold text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredUsers.map((user, idx) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-[#6B7280]">{idx + 1}</td>
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-[#6B7280]">{user.email}</td>
                  <td className="p-4">{user.department}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map(p => (
                        <span key={p} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] capitalize">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Circle size={8} fill={user.status === 'active' ? '#059669' : '#6B7280'} className={user.status === 'active' ? 'text-[#059669]' : 'text-[#6B7280]'} />
                      <span className={`capitalize ${user.status === 'active' ? 'text-[#059669]' : 'text-[#6B7280]'}`}>{user.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onEditUser(user)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDeleteUser(user.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsPage;
