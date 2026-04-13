import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { User, Role, Permission } from '../../types';
import { ROLE_DEFAULTS, DEPARTMENTS } from '../../constants';

export type UserFormPayload =
  | (Omit<User, 'id'> & { password?: string })
  | (User & { password?: string });

interface UserModalProps {
  onClose: () => void;
  onSubmit: (user: UserFormPayload) => void;
  editingUser: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({ onClose, onSubmit, editingUser }) => {
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    name: editingUser?.name || "",
    email: editingUser?.email || "",
    department: editingUser?.department || "Development",
    role: editingUser?.role || "Employee",
    permissions: editingUser?.permissions || ROLE_DEFAULTS.Employee,
    status: editingUser?.status || "active"
  });

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [useDefaults, setUseDefaults] = useState(true);

  useEffect(() => {
    setFormData({
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      department: editingUser?.department || "Development",
      role: editingUser?.role || "Employee",
      permissions: editingUser?.permissions || ROLE_DEFAULTS[editingUser?.role || "Employee"],
      status: editingUser?.status || "active"
    });
    setPassword('');
    setPasswordError(null);
    setUseDefaults(!editingUser);
  }, [editingUser]);

  useEffect(() => {
    if (useDefaults && !editingUser) {
      setFormData(prev => ({ ...prev, permissions: ROLE_DEFAULTS[formData.role] }));
    }
  }, [formData.role, useDefaults, editingUser]);

  const togglePermission = (perm: Permission) => {
    setUseDefaults(false);
    if (formData.permissions.includes(perm)) {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm) });
    } else {
      setFormData({ ...formData, permissions: [...formData.permissions, perm] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();
    if (!editingUser) {
      if (trimmed.length < 6) {
        setPasswordError('Password is required (at least 6 characters).');
        return;
      }
    } else if (trimmed.length > 0 && trimmed.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    setPasswordError(null);

    if (editingUser) {
      onSubmit({
        ...formData,
        id: editingUser.id,
        ...(trimmed ? { password: trimmed } : {}),
      });
    } else {
      onSubmit({ ...formData, password: trimmed });
    }
  };

  const permissionGroups = [
    { title: 'WORK ENTRIES', perms: ['view', 'create', 'edit', 'delete'] as Permission[] },
    { title: 'APPROVALS', perms: ['approve'] as Permission[] },
    { title: 'REPORTS', perms: ['reports'] as Permission[] },
    { title: 'ADMINISTRATION', perms: ['manage'] as Permission[] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold">
            {editingUser ? `Edit User: ${editingUser.name}` : 'Add New User'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Section 1 - User Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">Full Name*</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">Email*</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#6B7280]">
                  {editingUser ? 'New password' : 'Password*'}
                  {editingUser && (
                    <span className="font-normal text-[#9CA3AF]"> (leave blank to keep current)</span>
                  )}
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  className={`w-full p-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20 ${
                    passwordError ? 'border-red-300' : 'border-[#E5E7EB]'
                  }`}
                  placeholder={editingUser ? '••••••••' : 'Min. 6 characters'}
                />
                {passwordError && (
                  <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">Department*</label>
                <select 
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full p-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">Reporting Manager</label>
                <select className="w-full p-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20">
                  <option>Select Manager</option>
                  <option>Rajesh Kumar</option>
                  <option>Priya Sharma</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Section 2 - Role & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">Role*</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as Role})}
                  className="w-full p-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                >
                  {Object.keys(ROLE_DEFAULTS).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">Status</label>
                <div className="flex items-center gap-3 h-[38px]">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, status: formData.status === 'active' ? 'inactive' : 'active'})}
                    className={`relative w-10 h-5 rounded-full transition-colors ${formData.status === 'active' ? 'bg-[#059669]' : 'bg-gray-300'}`}
                  >
                    <motion.div 
                      animate={{ x: formData.status === 'active' ? 20 : 2 }}
                      className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                  <span className="text-sm capitalize">{formData.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Section 3 - Permissions</h3>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useDefaults} 
                  onChange={e => setUseDefaults(e.target.checked)}
                  className="rounded text-[#6366F1]"
                />
                Use default role permissions
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-[#E5E7EB]">
              {permissionGroups.map(group => (
                <div key={group.title} className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#6B7280] tracking-widest">{group.title}</h4>
                  <div className="space-y-1">
                    {group.perms.map(perm => (
                      <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#6366F1] transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.permissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                          className="rounded text-[#6366F1]"
                        />
                        <span className="capitalize">{perm} Entry</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-md font-medium transition-colors shadow-sm"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
