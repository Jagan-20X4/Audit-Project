import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../../lib/axios/request';
import { writeStoredAuthUser, type AuthUser } from '../../lib/authUser';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await request<{ accessToken: string; user: AuthUser }>({
        url: '/auth/login',
        method: 'POST',
        data: { email, password },
      });
      localStorage.setItem('accessToken', res.data.accessToken);
      writeStoredAuthUser(res.data.user);
      nav('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">Sign in</h1>
          <p className="text-sm text-[#6B7280]">
            Use your email and password to continue.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-[#111827]">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-1 w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-[#111827]">
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-1 w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-md bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#4F46E5] disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

