'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Phone, Calendar, Network, CheckCircle2, AlertCircle, Edit2, Save, Copy, Camera, Loader2, Trash2, Upload } from 'lucide-react';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';

export default function NextViewProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [message, setMessage] = useState(null);
    const [copiedCode, setCopiedCode] = useState(false);
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        address: '',
        state: '',
        district: '',
    });

    const loadProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/mlm/profile');
            const data = await res.json();
            if (data.success && data.data) {
                setProfile(data.data);
                setForm({
                    fullName: data.data.fullName || '',
                    email: data.data.email || '',
                    address: data.data.address || '',
                    state: data.data.state || '',
                    district: data.data.district || '',
                });
            }
        }
        catch (e) {
            console.error('Error loading profile:', e);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handlePhotoSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Clear input value so selecting the same file again still fires change
        e.target.value = '';

        // Validation
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select a valid image file (JPG, PNG, or WEBP).' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Profile photo must be smaller than 5MB.' });
            return;
        }

        setUploadingPhoto(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'mlm_members');

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const uploadData = await uploadRes.json();

            if (!uploadRes.ok || !uploadData.success || !uploadData.media?.url) {
                throw new Error(uploadData.error || uploadData.message || 'Failed to upload photo to server');
            }

            const imageUrl = uploadData.media.url;

            // Persist to MLM member profile
            const patchRes = await fetch('/api/mlm/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileImage: imageUrl }),
            });
            const patchData = await patchRes.json();

            if (!patchRes.ok || !patchData.success) {
                throw new Error(patchData.message || 'Failed to save profile image');
            }

            setProfile((prev) => ({ ...prev, profileImage: imageUrl }));
            setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
        } catch (err) {
            console.error('Photo upload error:', err);
            setMessage({ type: 'error', text: err.message || 'Could not upload photo. Please try again.' });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleRemovePhoto = async () => {
        if (!confirm('Are you sure you want to remove your profile photo?')) return;
        setUploadingPhoto(true);
        setMessage(null);
        try {
            const patchRes = await fetch('/api/mlm/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileImage: '' }),
            });
            const patchData = await patchRes.json();
            if (!patchRes.ok || !patchData.success) {
                throw new Error(patchData.message || 'Failed to remove photo');
            }
            setProfile((prev) => ({ ...prev, profileImage: '' }));
            setMessage({ type: 'success', text: 'Profile photo removed successfully.' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Could not remove photo.' });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/mlm/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setEditing(false);
                loadProfile();
            }
            else {
                setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
            }
        }
        catch {
            setMessage({ type: 'error', text: 'Network error occurred while saving profile' });
        }
        finally {
            setSaving(false);
        }
    };

    const copyCode = () => {
        if (!profile?.mlmCode)
            return;
        navigator.clipboard.writeText(profile.mlmCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    if (loading) {
        return (<MlmMemberLayout activePath="/nextview/profile">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      </MlmMemberLayout>);
    }

    const initials = (profile?.fullName || 'NM')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (<MlmMemberLayout activePath="/nextview/profile">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Member Profile</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your personal identity, sponsor association, and contact preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!editing ? (<button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs">
                <Edit2 className="w-3.5 h-3.5"/>
                <span>Edit Profile</span>
              </button>) : (<button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
                <span>Cancel</span>
              </button>)}
          </div>
        </div>

        {/* Global Feedback Alert */}
        {message && (<div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.type === 'success' ? (<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/>) : (<AlertCircle className="w-4 h-4 text-red-600 shrink-0"/>)}
            <span>{message.text}</span>
          </div>)}

        {/* ── CARD 1: IDENTITY BANNER ──────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={handlePhotoSelect}
          />

          {/* Interactive Avatar Container */}
          <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
            <div
              onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
              title="Click to change profile photo"
              className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md shadow-amber-500/15 cursor-pointer group border-2 border-amber-500/30 hover:border-amber-500 transition-all duration-200 bg-slate-100"
            >
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile?.fullName || 'Member Profile'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-black text-2xl flex items-center justify-center shadow-inner">
                  {initials}
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1">
                <Camera className="w-5 h-5 text-amber-300" />
                <span className="text-[10px] font-extrabold tracking-tight">Change</span>
              </div>

              {/* Loading State Overlay */}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-1 z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Saving...</span>
                </div>
              )}

              {/* Camera Badge in bottom corner */}
              {!uploadingPhoto && (
                <div className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-amber-500 text-white shadow-md border border-white/80 group-hover:bg-amber-600 transition">
                  <Camera className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Quick Action Photo Link */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50 transition"
              >
                <Upload className="w-3 h-3" />
                <span>{profile?.profileImage ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
              {profile?.profileImage && (
                <>
                  <span className="text-slate-300 text-xs">•</span>
                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-slate-900">{profile?.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {profile?.status || 'ACTIVE'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {profile?.mlmCode}
                </span>
                <button type="button" onClick={copyCode} title="Copy Member ID" className="text-slate-400 hover:text-slate-700">
                  <Copy className="w-3.5 h-3.5"/>
                </button>
                {copiedCode && <span className="text-[10px] text-emerald-600 font-bold">Copied</span>}
              </div>

              <span>•</span>
              <div className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400"/>
                <span>{profile?.mobile}</span>
              </div>
            </div>
          </div>

          {/* KYC Status Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center sm:text-right shrink-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">KYC Status</p>
            <p className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1 justify-center sm:justify-end">
              <ShieldCheck className="w-4 h-4 text-emerald-600"/>
              <span>{profile?.kycStatus || 'VERIFIED'}</span>
            </p>
          </div>
        </div>

        {/* ── CARD 2: PROFILE DETAILS & FORM ──────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100 mb-6">
            Account &amp; Hierarchy Details
          </h3>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input type="text" disabled={!editing} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 disabled:opacity-75 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
              </div>

              {/* Mobile Number (Fixed) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Registered Mobile Number
                </label>
                <input type="text" disabled value={profile?.mobile || ''} className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-600 disabled:cursor-not-allowed"/>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <input type="email" disabled={!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 disabled:opacity-75 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
              </div>

              {/* Sponsor Code */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Sponsor Association
                </label>
                <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-700 flex items-center justify-between">
                  <span>{profile?.sponsorCode || profile?.sponsorId?.mlmCode || 'ROOT SPONSOR'}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Locked</span>
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  State
                </label>
                <input type="text" disabled={!editing} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Enter state" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 disabled:opacity-75 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  District
                </label>
                <input type="text" disabled={!editing} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="Enter district" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 disabled:opacity-75 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
              </div>

              {/* Full Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Residential Address
                </label>
                <input type="text" disabled={!editing} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter residential address" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 disabled:opacity-75 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
              </div>
            </div>

            {/* Registration Date & Platform Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400"/>
                <span>
                  Member Since:{' '}
                  <strong className="text-slate-800">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : 'Active'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-slate-400"/>
                <span>Network Structure: <strong className="text-slate-800">Partner Network Tree</strong></span>
              </div>
            </div>

            {/* Save Button */}
            {editing && (<div className="flex justify-end pt-2">
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition shadow-md shadow-amber-500/25 disabled:opacity-50">
                  <Save className="w-4 h-4"/>
                  <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
                </button>
              </div>)}
          </form>
        </div>
      </div>
    </MlmMemberLayout>);
}
