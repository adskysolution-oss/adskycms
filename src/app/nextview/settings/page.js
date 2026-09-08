'use client';
import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Key } from 'lucide-react';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
export default function NextViewSettingsPage() {
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState(null);
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'New Password and Confirm Password do not match.' });
            return;
        }
        setUpdating(true);
        setMessage(null);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
            else {
                setMessage({ type: 'error', text: data.message || 'Failed to update password' });
            }
        }
        catch {
            setMessage({ type: 'error', text: 'Failed to communicate with server.' });
        }
        finally {
            setUpdating(false);
        }
    };
    return (<MlmMemberLayout activePath="/nextview/settings">
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Account Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your credentials, security preferences, and portal notifications.
          </p>
        </div>

        {/* Global Feedback */}
        {message && (<div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.type === 'success' ? (<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/>) : (<AlertCircle className="w-4 h-4 text-red-600 shrink-0"/>)}
            <span>{message.text}</span>
          </div>)}

        {/* Security / Password Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Key className="w-5 h-5 text-amber-600"/>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Change Account Password
            </h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Current Password *
              </label>
              <input type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder="Enter current password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  New Password *
                </label>
                <input type="password" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Enter new password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Confirm New Password *
                </label>
                <input type="password" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="Re-enter new password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={updating} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition shadow-md shadow-amber-500/25 disabled:opacity-50">
                {updating ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MlmMemberLayout>);
}
