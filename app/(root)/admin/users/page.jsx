"use client"
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.status === 401) { setError('Sign in required'); setLoading(false); return; }
      if (res.status === 403) { setError('Forbidden: your email is not allowed'); setLoading(false); return; }
      if (!res.ok) { setError('Failed to load'); setLoading(false); return; }
      const data = await res.json();
      setUsers(data.users);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="px-6 py-10">Loading…</div>;
  if (error) return <div className="px-6 py-10">{error}</div>;

  return (
    <div className="px-6 py-10 md:px-20 lg:px-32">
      <h1 className="text-xl font-semibold mb-6">Users (admin)</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b hover:bg-muted/30">
                <td className="py-2 pr-4 font-mono text-xs">{u.id}</td>
                <td className="py-2 pr-4">{u.email}</td>
                <td className="py-2 pr-4">{u.name || ''}</td>
                <td className="py-2 pr-4">{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


