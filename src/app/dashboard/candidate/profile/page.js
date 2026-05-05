'use client';

import { useState, useEffect } from 'react';
import { 
  FaUser, FaEnvelope, FaPhone, FaGraduationCap, 
  FaBriefcase, FaFileUpload, FaSpinner, FaCheckCircle, 
  FaPlus, FaTrash, FaSave, FaTrophy
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CandidateProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  // Form States
  const [personalInfo, setPersonalInfo] = useState({ name: '', email: '', phone: '' });
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState([{ degree: '', school: '', year: '' }]);
  const [experience, setExperience] = useState([{ title: '', company: '', duration: '' }]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/me');
      const data = await res.json();
      if (data.success) {
        const u = data.user;
        setUser(u);
        setPersonalInfo({ name: u.name || '', email: u.email || '', phone: u.phone || '' });
        setSkills(u.skills?.join(', ') || '');
        setEducation(u.education?.length > 0 ? u.education : [{ degree: '', school: '', year: '' }]);
        setExperience(u.experience?.length > 0 ? u.experience : [{ title: '', company: '', duration: '' }]);
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!user) return 0;
    let score = 0;
    if (personalInfo.name) score += 20;
    if (personalInfo.phone) score += 10;
    if (user.resumeUrl) score += 25;
    if (skills.length > 0) score += 15;
    if (experience.some(e => e.title && e.company)) score += 15;
    if (education.some(e => e.degree && e.school)) score += 15;
    return Math.min(score, 100);
  };

  const handleAddEducation = () => setEducation([...education, { degree: '', school: '', year: '' }]);
  const handleRemoveEducation = (index) => setEducation(education.filter((_, i) => i !== index));
  const handleEducationChange = (index, field, value) => {
    const newEdu = [...education];
    newEdu[index][field] = value;
    setEducation(newEdu);
  };

  const handleAddExperience = () => setExperience([...experience, { title: '', company: '', duration: '' }]);
  const handleRemoveExperience = (index) => setExperience(experience.filter((_, i) => i !== index));
  const handleExperienceChange = (index, field, value) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let resumeUrl = user.resumeUrl;

      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        formData.append('folder', 'resumes');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        resumeUrl = uploadData.media.url;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...personalInfo,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          education: education.filter(e => e.degree && e.school),
          experience: experience.filter(e => e.title && e.company),
          resumeUrl
        }),
      });

      if (res.ok) {
        toast.success('Profile updated successfully!');
        fetchProfile();
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center">
      <FaSpinner className="animate-spin text-primary" size={40} />
    </div>
  );

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-dark pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic flex items-center gap-3">
              <FaUser className="text-primary-light" /> Professional Profile
            </h1>
            <p className="text-text-secondary mt-2">Manage your identity and career credentials.</p>
          </div>
          
          <div className="glass-card px-6 py-3 border border-primary/20 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Profile Strength</p>
              <p className="text-xl font-black text-primary-light">{progress}%</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-white/5 relative flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * progress) / 100} className="text-primary-light" />
               </svg>
               <FaTrophy className="absolute text-primary-light opacity-50" size={14} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <section className="glass-card p-8 border border-white/5">
            <h2 className="text-lg font-bold text-text-primary mb-8 flex items-center gap-2 border-l-4 border-primary pl-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <input 
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                    className="w-full bg-dark border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-text-primary focus:border-primary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <input 
                    disabled
                    value={personalInfo.email}
                    className="w-full bg-dark/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-text-muted cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Phone Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <input 
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    placeholder="+91 00000 00000"
                    className="w-full bg-dark border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-text-primary focus:border-primary/50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Experience */}
          <section className="glass-card p-8 border border-white/5">
            <div className="flex justify-between items-center mb-8 border-l-4 border-secondary pl-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                Work Experience
              </h2>
              <button type="button" onClick={handleAddExperience} className="text-xs font-bold text-secondary-light flex items-center gap-1 hover:underline">
                <FaPlus size={10} /> Add Experience
              </button>
            </div>
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative p-6 rounded-2xl bg-white/5 border border-white/5 animate-in slide-in-from-right-4 duration-300">
                  <button type="button" onClick={() => handleRemoveExperience(idx)} className="absolute top-4 right-4 text-text-muted hover:text-danger">
                    <FaTrash size={12} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      placeholder="Role (e.g. Senior Developer)"
                      value={exp.title}
                      onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                      className="bg-dark border border-white/10 rounded-lg p-3 text-sm text-text-primary"
                    />
                    <input 
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                      className="bg-dark border border-white/10 rounded-lg p-3 text-sm text-text-primary"
                    />
                    <input 
                      placeholder="Duration (e.g. 2 Years)"
                      value={exp.duration}
                      onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                      className="bg-dark border border-white/10 rounded-lg p-3 text-sm text-text-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="glass-card p-8 border border-white/5">
            <div className="flex justify-between items-center mb-8 border-l-4 border-accent pl-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                Education
              </h2>
              <button type="button" onClick={handleAddEducation} className="text-xs font-bold text-accent-light flex items-center gap-1 hover:underline">
                <FaPlus size={10} /> Add Education
              </button>
            </div>
            <div className="space-y-6">
              {education.map((edu, idx) => (
                <div key={idx} className="relative p-6 rounded-2xl bg-white/5 border border-white/5 animate-in slide-in-from-right-4 duration-300">
                  <button type="button" onClick={() => handleRemoveEducation(idx)} className="absolute top-4 right-4 text-text-muted hover:text-danger">
                    <FaTrash size={12} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      placeholder="Degree (e.g. B.Tech CS)"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                      className="bg-dark border border-white/10 rounded-lg p-3 text-sm text-text-primary"
                    />
                    <input 
                      placeholder="College/University"
                      value={edu.school}
                      onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                      className="bg-dark border border-white/10 rounded-lg p-3 text-sm text-text-primary"
                    />
                    <input 
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                      className="bg-dark border border-white/10 rounded-lg p-3 text-sm text-text-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills & Resume */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="glass-card p-8 border border-white/5">
              <h2 className="text-lg font-bold text-text-primary mb-6 border-l-4 border-primary pl-4">Skills Matrix</h2>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-4">Comma separated tags</p>
              <textarea 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node.js, TypeScript, Cloud..."
                className="w-full bg-dark border border-white/10 rounded-2xl p-6 text-sm text-text-primary h-32 resize-none focus:border-primary/50"
              />
            </section>

            <section className="glass-card p-8 border border-white/5">
              <h2 className="text-lg font-bold text-text-primary mb-6 border-l-4 border-secondary pl-4">Resume / CV</h2>
              <div className="relative group">
                <input 
                  type="file" 
                  id="resume" 
                  className="hidden" 
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <label 
                  htmlFor="resume" 
                  className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 cursor-pointer group-hover:border-secondary/50 transition-all hover:bg-white/10"
                >
                  <FaFileUpload className="mb-4 text-text-muted group-hover:text-secondary-light" size={32} />
                  <span className="text-sm font-bold text-text-secondary">{resumeFile ? resumeFile.name : 'Update Resume (PDF)'}</span>
                </label>
              </div>
              {user?.resumeUrl && !resumeFile && (
                <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-green-400">
                    <FaCheckCircle /> Verified Resume
                  </div>
                  <a href={user.resumeUrl} target="_blank" className="text-[10px] font-black text-primary-light hover:underline uppercase">View</a>
                </div>
              )}
            </section>
          </div>

          <div className="flex justify-end gap-4">
            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary !px-12 !py-5 text-lg font-black uppercase tracking-tighter shadow-2xl shadow-primary/20 flex items-center gap-3"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {saving ? 'Synchronizing...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
