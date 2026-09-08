'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RecruitmentRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ companyName: '', contactPerson: '', email: '', mobile: '', password: '', confirmPassword: '', state: '', district: '', address: '', pincode: '', gstNumber: '' });
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/recruitment/auth/partner/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast.success(data.message); setStep(2); } else toast.error(data.message);
    } catch { toast.error('Network error.'); }
    setLoading(false);
  };

  const handleOtp = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/recruitment/auth/partner/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: form.mobile, otp, companyName: form.companyName, gstNumber: form.gstNumber, state: form.state, district: form.district, address: form.address, pincode: form.pincode }) });
      const data = await res.json();
      if (data.success) { toast.success(data.message); router.push('/recruitment/dashboard'); } else toast.error(data.message);
    } catch { toast.error('Network error.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-4"><span className="text-3xl">🤝</span></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Become a Partner</h1>
          <p className="text-slate-400 mt-2">Join AdSky Recruitment Partner Network</p>
        </div>
        <div className="glass-card p-8">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-slate-300 mb-1">Company Name *</label><input required value={form.companyName} onChange={e => setForm(f => ({...f, companyName: e.target.value}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" placeholder="Your company name" /></div>
                <div><label className="block text-sm text-slate-300 mb-1">Contact Person *</label><input required value={form.contactPerson} onChange={e => setForm(f => ({...f, contactPerson: e.target.value}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" placeholder="Your full name" /></div>
                <div><label className="block text-sm text-slate-300 mb-1">Email *</label><input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" placeholder="business@email.com" /></div>
                <div><label className="block text-sm text-slate-300 mb-1">Mobile *</label><input required maxLength={10} value={form.mobile} onChange={e => setForm(f => ({...f, mobile: e.target.value.replace(/\D/g,'')}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" placeholder="10-digit mobile" /></div>
                <div><label className="block text-sm text-slate-300 mb-1">Password *</label><input type="password" required minLength={8} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" placeholder="Min 8 chars" /></div>
                <div><label className="block text-sm text-slate-300 mb-1">Confirm Password *</label><input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({...f, confirmPassword: e.target.value}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" placeholder="Re-enter" /></div>
                <div><label className="block text-sm text-slate-300 mb-1">State</label><input value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" /></div>
                <div><label className="block text-sm text-slate-300 mb-1">GST Number</label><input value={form.gstNumber} onChange={e => setForm(f => ({...f, gstNumber: e.target.value}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" /></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60">
                {loading ? 'Sending OTP...' : 'Register & Verify Email'}
              </button>
              <p className="text-center text-slate-400 text-sm">Already a partner? <Link href="/recruitment/login" className="text-purple-400 hover:underline">Login</Link></p>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-6">
              <div className="text-center"><div className="text-4xl mb-3">📧</div><h2 className="text-xl font-bold text-white mb-2">Verify Email</h2><p className="text-slate-400 text-sm">OTP sent to <strong className="text-purple-400">{form.email}</strong></p></div>
              <input type="text" value={otp} required maxLength={6} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white text-center text-2xl font-bold tracking-widest focus:border-purple-500 focus:outline-none" placeholder="_ _ _ _ _ _" />
              <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60">
                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-slate-400 text-sm hover:text-white">Back to form</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
