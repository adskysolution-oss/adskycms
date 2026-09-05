'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    if (!name.trim()) return 'Full Name is required';
    if (!email.trim()) return 'Email is required';
    if (!phone.trim()) return 'Phone is required';
    if (!message.trim()) return 'Message is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Enter a valid email';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      setSuccess('Thanks — your message has been sent.');
      setName(''); setEmail(''); setPhone(''); setMessage('');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      {/* <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Get in Touch</h2>
        <p className="text-text-secondary text-sm">We'd love to hear from you. Let's build something great together.</p>
      </div> */}

      {error && <div className="p-4 rounded-xl text-sm bg-danger/10 text-danger border border-danger/20">{error}</div>}
      {success && <div className="p-4 rounded-xl text-sm bg-success/10 text-success border border-success/20">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-text-secondary text-xs font-medium uppercase tracking-wider ml-1">Full Name*</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all" 
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-text-secondary text-xs font-medium uppercase tracking-wider ml-1">E-mail Address*</label>
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all" 
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-text-secondary text-xs font-medium uppercase tracking-wider ml-1">Phone Number*</label>
        <input 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all" 
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-text-secondary text-xs font-medium uppercase tracking-wider ml-1">Message*</label>
        <textarea 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          rows={5} 
          className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none" 
          placeholder="How can we help you?"
        />
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? 'Sending Message...' : 'Submit Now'}
        </button>
      </div>
    </form>
  );
}

