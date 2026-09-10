'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { SlidersHorizontal, RefreshCw, Save, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
export default function AdminMlmLevelsPage() {
    const [levelsConfig, setLevelsConfig] = useState(null);
    const [editingLevels, setEditingLevels] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const loadLevels = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/mlm/levels');
            let data = null;
            try {
                data = await res.json();
            } catch {
                throw new Error('Invalid response from server');
            }
            if (res.ok && data.success && data.data?.levels) {
                setLevelsConfig(data.data);
                setEditingLevels(data.data.levels);
            } else if (!res.ok) {
                setError(data?.message || 'Failed to load level configuration');
            }
        }
        catch (e) {
            setError(e.message || 'Failed to load level configuration');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadLevels();
    }, []);
    const updateLevelAmount = (levelNum, newAmount) => {
        setEditingLevels((prev) => prev.map((l) => (l.level === levelNum ? { ...l, bonusAmount: newAmount } : l)));
    };
    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        setError('');
        try {
            const res = await fetch('/api/admin/mlm/levels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    levels: editingLevels,
                    description: 'Updated via MLM Admin Portal',
                }),
            });
            let data = null;
            try {
                data = await res.json();
            } catch {
                throw new Error('Server returned an unexpected response');
            }
            if (!res.ok)
                throw new Error(data?.message || 'Failed to save configuration');
            setMessage('Level 1–15 configuration saved and versioned successfully!');
            loadLevels();
        }
        catch (e) {
            setError(e.message || 'Failed to update level configuration');
        }
        finally {
            setSaving(false);
        }
    };
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <SlidersHorizontal className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Level 1–15 Reward Configuration
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Configure fixed reward commission amounts distributed across 15 matrix upline tiers on verified FD bookings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={loadLevels} disabled={loading || saving} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
              <span>Reset</span>
            </button>

            <button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-md shadow-amber-500/20 disabled:opacity-50">
              <Save className="w-3.5 h-3.5"/>
              <span>{saving ? 'Saving Rules...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {message && (<div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/>
            <span>{message}</span>
          </div>)}

        {error && (<div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0"/>
            <span>{error}</span>
          </div>)}

        {/* Immutability Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"/>
          <div>
            <span className="font-bold">Financial Rule Immutability Guarantee:</span> Changes made here create a new rule version and apply only to future qualifying FD referral verifications. Past commissions and historical reward ledgers remain permanently unaltered.
          </div>
        </div>

        {/* Level Cards Grid */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-base font-black text-gray-900">
              15-Tier Spatial Reward Matrix
            </h2>
            {levelsConfig?.version && (<span className="text-xs font-bold font-mono px-3 py-1 bg-gray-100 text-gray-700 rounded-xl">
                Active Version: v{levelsConfig.version}
              </span>)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {editingLevels.map((lvl) => {
            const capacity = Math.pow(3, lvl.level);
            return (<div key={lvl.level} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-amber-400 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900 uppercase">
                      Level {lvl.level}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      Cap: {capacity.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Reward Per Qualified FD
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">
                        ₹
                      </span>
                      <input type="number" value={lvl.bonusAmount} onChange={(e) => updateLevelAmount(lvl.level, Number(e.target.value))} className="w-full pl-7 pr-3 py-2 text-xs font-black text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"/>
                    </div>
                  </div>
                </div>);
        })}
          </div>
        </div>
      </div>
    </DashboardLayout>);
}
