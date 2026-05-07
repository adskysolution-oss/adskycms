'use client';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function OTPModal({ email, userId, type, onSuccess }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('OTP must be 6 digits');
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-8 border border-white/10 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
          <p className="text-text-secondary text-sm">
            We've sent a 6-digit code to <span className="text-primary-light">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            className="w-full bg-dark border border-white/10 rounded-xl py-4 text-center text-3xl font-bold tracking-[10px] text-white focus:outline-none focus:border-primary/50 transition-all"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'Verify Code'}
          </button>
        </form>
      </div>
    </div>
  );
}
