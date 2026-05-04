'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaFileUpload, FaCheckCircle, FaSpinner, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

export default function JobApplyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        setJob(data.job);
      } catch {} finally { setLoading(false); }
    };
    fetchJob();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setStatus({ type: 'error', msg: 'Please upload your resume.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', msg: '' });

    try {
      // 1. Upload Resume to Cloudinary
      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('folder', 'resumes');

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Resume upload failed');

      const resumeUrl = uploadData.media.url;

      // 2. Submit Application
      const appRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: id,
          resumeUrl,
          coverLetter,
          candidate: '6633768c8c8c8c8c8c8c8c8c', // Dummy User ID - in real app, get from auth session
        }),
      });

      if (!appRes.ok) throw new Error('Application submission failed');

      setStatus({ type: 'success', msg: 'Your application has been submitted successfully!' });
      setTimeout(() => router.push('/careers'), 3000);
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="pt-32 text-center text-text-muted">Loading job details...</div>;

  return (
    <div className="pt-32 pb-24 container-custom max-w-3xl">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-text-muted hover:text-primary-light transition-colors mb-8 font-medium">
        <FaArrowLeft size={14} /> Back
      </button>

      <div className="glass-card p-8 md:p-12 border border-white/10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">Apply for {job?.title}</h1>
          <p className="text-text-secondary">Fill in the details below to submit your application.</p>
        </div>

        {status.msg && (
          <div className={`mb-8 p-4 rounded-xl text-sm flex items-center gap-3 ${status.type === 'success' ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
            {status.type === 'success' && <FaCheckCircle />}
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Resume / CV (PDF) *</label>
            <div className="relative group">
              <input 
                type="file" 
                accept=".pdf,.doc,.docx"
                required
                className="hidden" 
                id="resume-upload"
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
              <label 
                htmlFor="resume-upload" 
                className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary-light mb-4 group-hover:scale-110 transition-transform">
                  <FaFileUpload size={24} />
                </div>
                {resumeFile ? (
                  <div className="text-center">
                    <p className="text-text-primary font-bold">{resumeFile.name}</p>
                    <p className="text-text-muted text-xs mt-1">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-text-primary font-bold">Click to upload resume</p>
                    <p className="text-text-muted text-xs mt-1">PDF, DOC, DOCX up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
            <p className="text-[10px] text-text-muted mt-3 italic">Resume will be uploaded only when you click "Submit Application".</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Cover Letter (Optional)</label>
            <textarea 
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell us why you are a good fit for this role..."
              className="w-full bg-surface border border-white/10 rounded-2xl px-6 py-4 text-text-primary focus:outline-none focus:border-primary/50 h-40 resize-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="btn-primary w-full justify-center !py-5 text-lg font-bold shadow-2xl shadow-primary/20"
          >
            {submitting ? (
              <><FaSpinner className="animate-spin mr-2" /> Submitting Application...</>
            ) : (
              <><FaPaperPlane className="mr-2" /> Submit Application</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
