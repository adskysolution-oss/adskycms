'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Bell, RefreshCw, Send, X } from 'lucide-react';
export default function AdminMlmNotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        title: '',
        message: '',
        targetType: 'ALL',
        priority: 'NORMAL',
    });
    const [sending, setSending] = useState(false);
    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mlm/notifications');
            const json = await res.json();
            if (res.ok && json.success) {
                setNotifications(json.data || []);
            }
        }
        catch (e) {
            console.error('Failed to load notifications:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadNotifications();
    }, []);
    const handleBroadcast = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch('/api/admin/mlm/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok)
                throw new Error(json.message || 'Failed to send notification');
            alert('Notification broadcasted to MLM network successfully!');
            setShowModal(false);
            setForm({ title: '', message: '', targetType: 'ALL', priority: 'NORMAL' });
            loadNotifications();
        }
        catch (err) {
            alert(err.message || 'Error broadcasting notification');
        }
        finally {
            setSending(false);
        }
    };
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Bell className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                MLM Member Notifications
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Broadcast announcements, payout updates, and network alerts to active MLM members.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={loadNotifications} disabled={loading} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
              <span>Refresh</span>
            </button>

            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-md shadow-amber-500/20">
              <Send className="w-3.5 h-3.5"/>
              <span>Broadcast Notice</span>
            </button>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px] border-b border-gray-200 font-bold">
                <tr>
                  <th className="p-4">Notification Title</th>
                  <th className="p-4">Message Body</th>
                  <th className="p-4">Audience</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notifications.length === 0 ? (<tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      No broadcast notifications sent yet.
                    </td>
                  </tr>) : (notifications.map((n) => (<tr key={n._id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-bold text-gray-900">{n.title}</td>
                      <td className="p-4 text-gray-600 max-w-sm">{n.message}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold">
                          {n.targetType || 'ALL'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${n.priority === 'HIGH'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                          {n.priority || 'NORMAL'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-600">{n.status || 'SENT'}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(n.sentAt || n.createdAt).toLocaleString('en-IN')}
                      </td>
                    </tr>)))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-black text-gray-900 text-sm">Broadcast Notice to Network</h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-gray-400">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Title *</label>
                  <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Weekly FD Payouts Dispatched" className="w-full px-3 py-2 border rounded-xl"/>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Audience</label>
                  <select value={form.targetType} onChange={(e) => setForm({ ...form, targetType: e.target.value })} className="w-full px-3 py-2 border rounded-xl">
                    <option value="ALL">All Registered MLM Members</option>
                    <option value="ACTIVE_ONLY">Active (Matrix Placed) Members Only</option>
                    <option value="PENDING_PAYMENT">Members Pending Platform Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Message Content *</label>
                  <textarea rows={4} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Enter notification message text..." className="w-full px-3 py-2 border rounded-xl"/>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={sending} className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold shadow-sm">
                    {sending ? 'Broadcasting...' : 'Broadcast Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>)}
      </div>
    </DashboardLayout>);
}
