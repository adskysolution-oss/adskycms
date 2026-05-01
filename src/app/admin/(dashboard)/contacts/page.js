'use client';

import { useEffect, useState } from 'react';
import { FaTrash, FaSpinner } from 'react-icons/fa';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setContacts(data.contacts || []);
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setMsg('Deleted');
      fetchContacts();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Contacts</h1>
          <p className="text-text-secondary text-sm mt-1">Submitted messages from the public</p>
        </div>
      </div>

      {msg && <div className={`mb-4 p-3 rounded text-sm ${msg.startsWith('Error') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>{msg}</div>}

      {loading ? (
        <div className="text-center py-10 text-text-muted"><FaSpinner className="animate-spin mx-auto" size={24} /></div>
      ) : contacts.length === 0 ? (
        <div className="glass-card p-12 text-center text-text-muted">No contacts yet.</div>
      ) : (
        <div className="glass-card p-4 overflow-auto max-h-[60vh]">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-text-secondary text-left border-b border-border">
                <th className="py-3 px-2">Name</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Phone</th>
                <th className="py-3 px-2">Message</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c._id} className="border-b border-border align-top">
                  <td className="py-3 px-2 align-top max-w-xs truncate">{c.name}</td>
                  <td className="py-3 px-2 align-top max-w-xs truncate">{c.email}</td>
                  <td className="py-3 px-2 align-top">{c.phone}</td>
                  <td className="py-3 px-2 align-top max-w-2xl break-words">{c.message}</td>
                  <td className="py-3 px-2 align-top">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-2 align-top">
                    <button onClick={() => handleDelete(c._id)} className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20"><FaTrash size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
