'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaFileUpload, FaCheckCircle, FaSpinner, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

export default function JobApplyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [useExistingResume, setUseExistingResume] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobRes = await fetch(`/api/jobs/${id}`);
        const jobData = await jobRes.json();
        setJob(jobData.job);

        const userRes = await fetch('/api/user/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
          if (userData.user.resumeUrl) {
            setUseExistingResume(true);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!useExistingResume && !resumeFile) {
      setStatus({ type: 'error', msg: 'Please upload your resume.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', msg: '' });

    try {
      let resumeUrl = user?.resumeUrl;

        // 1. Upload Resume only if not using existing one
        if(!useExistingResume && resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        formData.append('folder', 'resumes');

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Resume upload failed');
        resumeUrl = uploadData.media.url;
      }

      // 2. Submit Application
      const appRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: id,
          resumeUrl,
          coverLetter,
        }),
      });

      const appData = await appRes.json();
      if (!appRes.ok) throw new Error(appData.error || 'Application submission failed');

      setStatus({ type: 'success', msg: 'Your application has been submitted successfully!' });
      setTimeout(() => router.push('/dashboard/candidate'), 2000);
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

            {user?.resumeUrl && (
              <div className="mb-6 p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light">
                    <FaFileUpload size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Using saved resume</p>
                    <a href={user.resumeUrl} target="_blank" className="text-[10px] text-primary-light hover:underline font-bold uppercase">View Current Resume</a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUseExistingResume(!useExistingResume)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${useExistingResume ? 'bg-white/5 text-text-muted border border-white/10 hover:bg-white/10' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                >
                  {useExistingResume ? 'Change Resume' : 'Use Saved'}
                </button>
              </div>
            )}

            {!useExistingResume && (
              <div className="relative group animate-in fade-in slide-in-from-top-4 duration-300">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  required={!useExistingResume}
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
                      <p className="text-text-primary font-bold">Click to upload new resume</p>
                      <p className="text-text-muted text-xs mt-1">PDF, DOC, DOCX up to 5MB</p>
                    </div>
                  )}
                </label>
                <p className="text-[10px] text-text-muted mt-3 italic">Resume will be uploaded only when you click "Submit Application".</p>
              </div>
            )}
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
