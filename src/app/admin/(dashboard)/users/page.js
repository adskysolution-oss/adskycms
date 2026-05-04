'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSpinner, FaSave, FaTimes } from 'react-icons/fa';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const emptyUser = { name: '', email: '', password: '', role: 'admin' };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const saveUser = async () => {
    setSaving(true);
    setMsg('');
    try {
      const method = editing._id ? 'PUT' : 'POST';
      const payload = editing._id ? { id: editing._id, name: editing.name, email: editing.email, role: editing.role, isActive: editing.isActive } : editing;
      const res = await fetch('/api/users', { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setMsg('User saved!');
      setEditing(null);
      fetchUsers();
    } catch (err) { setMsg('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE', credentials: 'include' });
      fetchUsers();
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-text-secondary text-sm mt-1">Manage admin users and roles</p>
        </div>
        <button onClick={() => setEditing({ ...emptyUser })} className="btn-primary text-sm"><FaPlus size={12} /> Add User</button>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('Error') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{msg}</div>}

      {editing && (
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">{editing._id ? 'Edit' : 'New'} User</h2>
            <button onClick={() => setEditing(null)} className="text-text-muted hover:text-text-primary"><FaTimes size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Name</label>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Email</label>
              <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
            </div>
            {!editing._id && (
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Password</label>
                <input type="password" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary" />
              </div>
            )}
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Role</label>
              <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary">
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="partner">Partner</option>
                <option value="employer">Employer</option>
                <option value="candidate">Candidate</option>
              </select>
            </div>
          </div>
          <button onClick={saveUser} disabled={saving} className="btn-primary text-sm mt-4">
            {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save</>}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20"><FaSpinner className="animate-spin mx-auto text-text-muted" size={24} /></div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user._id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0)}
                </div>
                <div>
                  <div className="text-text-primary font-medium text-sm">{user.name}</div>
                  <div className="text-text-muted text-xs">{user.email} · {user.role}</div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <span className={`px-2 py-0.5 rounded text-xs ${user.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => setEditing({ ...user })} className="p-2 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20 text-xs">Edit</button>
                <button onClick={() => deleteUser(user._id)} className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20"><FaTrash size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
