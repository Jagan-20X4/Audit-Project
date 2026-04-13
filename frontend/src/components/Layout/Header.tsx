import React from 'react';
import { Menu, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  clearStoredAuthUser,
  sessionSubtitle,
  type AuthUser,
} from '../../lib/authUser';

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  sessionUser: AuthUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  collapsed,
  setCollapsed,
  sessionUser,
}) => {
  const nav = useNavigate();
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-4">
        <button onClick={() => setCollapsed(!collapsed)} className="lg:hidden p-2 text-[#6366F1]">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6366F1] rounded-lg flex items-center justify-center text-white font-bold">W</div>
          <span className="font-semibold text-lg hidden sm:block">Work Entry Management</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem('accessToken');
            clearStoredAuthUser();
            nav('/login', { replace: true });
          }}
          className="hidden sm:inline-flex rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm font-medium text-[#111827] hover:bg-gray-50"
        >
          Logout
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">
            {sessionUser?.name ?? 'Signed in'}
          </p>
          <p className="text-xs text-[#6B7280]">
            {sessionSubtitle(sessionUser)}
          </p>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          <UserIcon size={20} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
};
