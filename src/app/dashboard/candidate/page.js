'use client';

import { useState, useEffect } from 'react';
import { 
  FaBriefcase, FaClock, FaRocket, FaSearch, 
  FaBookmark, FaComments, FaBuilding, FaSpinner,
  FaChevronRight, FaMapMarkerAlt, FaMoneyBillWave,
  FaCheckCircle, FaExclamationCircle, FaArrowRight,
  FaTrophy, FaLightbulb, FaHistory, FaTrash, FaUserCircle
} from 'react-icons/fa';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CandidateDashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await fetch('/api/user/me');
      const userData = await userRes.json();
      setUser(userData.user);
      
      // Fetch Applications
      const appRes = await fetch('/api/applications/me');
      const appData = await appRes.json();
      setApplications(appData.applications || []);

      // Fetch Recommended Jobs
      const recRes = await fetch('/api/jobs?recommend=true&limit=6');
      const recData = await recRes.json();
      setRecommendedJobs(recData.jobs || []);

      // Fetch Saved Jobs
      if (userData.user.savedJobs?.length > 0) {
        const savedRes = await fetch('/api/jobs?ids=' + userData.user.savedJobs.join(','));
        const savedData = await savedRes.json();
        setSavedJobs(savedData.jobs || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (jobSkills = []) => {
    if (!user?.skills || user.skills.length === 0 || jobSkills.length === 0) return 0;
    const matched = jobSkills.filter(skill => 
      user.skills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
    );
    return Math.round((matched.length / jobSkills.length) * 100);
  };

  const calculateProfileProgress = () => {
    if (!user) return 0;
    let score = 0;
    if (user.name) score += 20;
    if (user.phone) score += 10;
    if (user.resumeUrl) score += 25;
    if (user.skills?.length > 0) score += 15;
    if (user.experience?.length > 0) score += 15;
    if (user.education?.length > 0) score += 15;
    return score;
  };

  const handleRemoveSaved = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        setSavedJobs(prev => prev.filter(j => j._id !== jobId));
        toast.success('Removed from saved');
      }
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <FaRocket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
      </div>
      <p className="text-text-muted font-black tracking-tighter uppercase italic">Syncing Your Career Orbit...</p>
    </div>
  );

  const progress = calculateProfileProgress();
  const suggestions = [
    { condition: !user?.resumeUrl, text: 'Upload your latest resume to get 3.5x more views.', action: 'Upload Resume' },
    { condition: (user?.skills?.length || 0) < 5, text: 'Adding 5+ skills increases match accuracy by 60%.', action: 'Add Skills' },
    { condition: (user?.experience?.length || 0) === 0, text: 'Experience details help recruiters trust your expertise.', action: 'Add Experience' },
  ].filter(s => s.condition);

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <FaRocket size={18} />
             </div>
             <h1 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic">
               {activeTab === 'overview' && 'Mission Control'}
               {activeTab === 'applications' && 'Application Tracker'}
               {activeTab === 'saved' && 'Opportunity Vault'}
             </h1>
          </div>
          <p className="text-text-secondary font-medium">
            {activeTab === 'overview' && `Welcome back, ${user?.name?.split(' ')[0]}. Here is your career intelligence overview.`}
            {activeTab === 'applications' && 'Real-time status of your professional submissions.'}
            {activeTab === 'saved' && 'Your curated list of potential career breakthroughs.'}
          </p>
        </div>
        <Link href="/careers" className="btn-primary !px-8 !py-4 shadow-2xl shadow-primary/30 flex items-center gap-3 group">
          <FaSearch size={14} className="group-hover:scale-125 transition-transform" /> 
          Explore jobs matching your skills
        </Link>
      </header>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Active Applications', value: applications.length, icon: FaBriefcase, color: 'text-primary-light', bg: 'bg-primary/5' },
              { label: 'Saved Jobs', value: user?.savedJobs?.length || 0, icon: FaBookmark, color: 'text-secondary-light', bg: 'bg-secondary/5' },
              { label: 'Interviews Scheduled', value: applications.filter(a => a.status === 'interviewing').length, icon: FaComments, color: 'text-purple-400', bg: 'bg-purple-400/5' },
              { label: 'Profile Strength', value: `${progress}%`, icon: FaTrophy, color: 'text-accent-light', bg: 'bg-accent/5' },
            ].map((stat, idx) => (
              <div key={idx} className={`glass-card p-6 border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all`}>
                 <div className={`absolute -right-6 -bottom-6 text-7xl opacity-5 group-hover:scale-125 transition-transform duration-500 ${stat.color}`}>
                   <stat.icon />
                 </div>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
                 <p className={`text-4xl font-black tracking-tighter relative z-10 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content: Recommendations or Activity */}
            <div className="lg:col-span-2 space-y-8">
               {/* Recommended for You */}
               <section>
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter italic flex items-center gap-3">
                      <FaLightbulb className="text-secondary-light animate-pulse" /> Recommended For You
                    </h3>
                    <Link href="/careers" className="text-xs font-bold text-primary-light hover:underline uppercase tracking-widest">See all matches</Link>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedJobs.slice(0, 4).map(job => {
                      const match = calculateMatchScore(job.skills);
                      return (
                        <Link key={job._id} href={`/jobs/${job._id}`} className="glass-card p-5 border border-white/5 hover:border-secondary/30 transition-all group">
                           <div className="flex items-start justify-between mb-4">
                              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                {job.company?.logo ? <img src={job.company.logo} className="w-full h-full object-contain p-2" /> : <FaBuilding size={18} className="text-text-muted" />}
                              </div>
                              <div className="text-right">
                                <div className={`text-[10px] font-black px-2 py-1 rounded bg-secondary/10 border border-secondary/20 mb-1 ${match > 70 ? 'text-secondary-light' : 'text-text-muted'}`}>
                                  {match}% MATCH
                                </div>
                                <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest">{job.type}</p>
                              </div>
                           </div>
                           <h4 className="font-bold text-text-primary group-hover:text-secondary-light transition-colors line-clamp-1 mb-1">{job.title}</h4>
                           <p className="text-xs text-text-secondary font-medium mb-4">{job.company?.companyName}</p>
                           <div className="flex items-center gap-3 text-[10px] text-text-muted font-bold">
                              <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} className="text-primary-light" /> {job.location}</span>
                              <span className="flex items-center gap-1"><FaMoneyBillWave size={10} className="text-secondary-light" /> {job.salary}</span>
                           </div>
                        </Link>
                      );
                    })}
                    {recommendedJobs.length === 0 && (
                      <div className="col-span-full glass-card p-12 text-center border-dashed border-white/10">
                        <FaSearch className="mx-auto text-text-muted mb-4 opacity-30" size={32} />
                        <p className="text-sm text-text-muted font-bold italic uppercase tracking-tighter">Tell us your skills to unlock smart matches</p>
                        <Link href="/dashboard/candidate/profile" className="btn-secondary !py-2 !px-6 text-[10px] font-black uppercase mt-4">Update Profile</Link>
                      </div>
                    )}
                 </div>
               </section>

               {/* Activity Timeline */}
               <section>
                 <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter italic mb-6 flex items-center gap-3">
                    <FaHistory className="text-text-muted" /> Recent Activity
                 </h3>
                 <div className="space-y-4">
                    {applications.slice(0, 3).map(app => (
                      <div key={app._id} className="relative pl-8 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-white/5 last:before:h-8">
                         <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-dark border border-white/10 flex items-center justify-center z-10">
                            <div className={`w-2 h-2 rounded-full ${app.status === 'applied' ? 'bg-primary animate-pulse' : app.status === 'shortlisted' ? 'bg-secondary' : 'bg-green-400'}`} />
                         </div>
                         <div className="glass-card p-4 border border-white/5 hover:border-white/10 transition-all">
                            <p className="text-sm text-text-primary font-bold">Applied to <span className="text-primary-light">{app.job?.title}</span></p>
                            <div className="flex items-center gap-4 mt-2">
                               <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Status: <span className="text-text-primary">{app.status}</span></p>
                               <p className="text-[10px] text-text-muted font-bold italic">{new Date(app.createdAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                      </div>
                    ))}
                    {user?.createdAt && (
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-dark border border-white/10 flex items-center justify-center z-10">
                           <FaUserCircle className="text-text-muted" size={14} />
                        </div>
                        <div className="glass-card p-4 border border-white/5">
                           <p className="text-sm text-text-primary font-bold">Member of AdSky Career Hub</p>
                           <p className="text-[10px] text-text-muted font-bold italic mt-1">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                 </div>
               </section>
            </div>

            {/* Sidebar: Profile Intelligence */}
            <div className="space-y-8">
               <div className="glass-card p-8 border border-white/5 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-5 blur-3xl -mr-16 -mt-16 group-hover:opacity-10 transition-opacity" />
                  <h3 className="text-lg font-black text-text-primary mb-6 italic border-l-4 border-primary pl-4">Profile Intelligence</h3>
                  
                  <div className="space-y-6">
                    {suggestions.map((s, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex gap-3">
                           <FaExclamationCircle className="text-primary-light flex-shrink-0 mt-1" size={14} />
                           <p className="text-xs text-text-secondary leading-relaxed font-medium">{s.text}</p>
                        </div>
                        <Link href="/dashboard/candidate/profile" className="flex items-center gap-2 text-[10px] font-black text-primary-light uppercase tracking-widest hover:translate-x-1 transition-transform">
                          {s.action} <FaArrowRight size={10} />
                        </Link>
                      </div>
                    ))}
                    {suggestions.length === 0 && (
                      <div className="text-center py-4">
                         <FaCheckCircle className="text-green-400 mx-auto mb-3" size={32} />
                         <p className="text-sm text-text-primary font-bold">Your profile is elite.</p>
                         <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Ready for high-impact roles.</p>
                      </div>
                    )}
                  </div>
               </div>

               <div className="glass-card p-8 border border-white/5">
                  <h3 className="text-sm font-black text-text-primary mb-6 uppercase tracking-widest flex items-center gap-2">
                    <FaRocket className="text-secondary-light" /> Quick Start
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/careers" className="w-full btn-secondary !py-3 text-[10px] font-black uppercase flex items-center justify-center gap-2">
                      Continue job search
                    </Link>
                    <button className="w-full py-3 px-4 rounded-xl border border-white/10 text-[10px] font-black uppercase text-text-muted hover:text-white hover:bg-white/5 transition-all">
                      Review saved items
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-6">
          {applications.length === 0 ? (
            <div className="glass-card p-20 text-center border border-white/5 animate-in zoom-in-95">
               <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10 group">
                  <FaBriefcase className="text-text-muted group-hover:text-primary transition-all group-hover:scale-110" size={40} />
               </div>
               <h3 className="text-2xl font-black text-text-primary mb-3 uppercase italic tracking-tighter">No Active Submissions</h3>
               <p className="text-text-muted text-sm max-w-md mx-auto mb-10 leading-relaxed">Your professional journey starts here. Explore opportunities tailored to your unique skill set.</p>
               <Link href="/careers" className="btn-primary !px-12 !py-4 text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20">
                 Explore jobs matching your skills
               </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => (
                <div key={app._id} className="glass-card p-6 border border-white/5 flex flex-col lg:flex-row items-center justify-between hover:border-primary/20 transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    app.status === 'applied' ? 'bg-yellow-400' :
                    app.status === 'shortlisted' ? 'bg-blue-400' :
                    app.status === 'interviewing' ? 'bg-purple-400' :
                    'bg-danger'
                  }`} />
                  
                  <div className="flex items-center gap-6 w-full">
                     <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden group-hover:scale-110 transition-transform">
                        {app.job?.company?.logo ? <img src={app.job.company.logo} className="w-full h-full object-contain p-2" /> : <FaBriefcase size={24} className="text-text-muted" />}
                     </div>
                     <div>
                       <h3 className="font-bold text-text-primary text-2xl mb-1 group-hover:text-primary-light transition-colors">{app.job?.title}</h3>
                       <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted font-bold tracking-tight uppercase">
                          <span className="flex items-center gap-2"><FaBuilding className="text-primary-light" size={12} /> {app.job?.company?.companyName || 'AdSky Partner'}</span>
                          <span className="flex items-center gap-2"><FaClock className="text-secondary-light" size={12} /> Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                       </div>
                     </div>
                  </div>
                  
                  <div className="mt-8 lg:mt-0 flex flex-col lg:items-end w-full lg:w-auto">
                     <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 lg:mb-1">Application Pipeline</p>
                     <div className="flex items-center gap-4">
                        <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-tighter shadow-xl ${
                          app.status === 'applied' ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 shadow-yellow-400/5' :
                          app.status === 'shortlisted' ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20 shadow-blue-400/5' :
                          app.status === 'interviewing' ? 'bg-purple-400/10 text-purple-400 border border-purple-400/20 shadow-purple-400/5' :
                          'bg-danger/10 text-danger border border-danger/20 shadow-danger/5'
                        }`}>
                          {app.status}
                        </span>
                        <Link href={`/jobs/${app.job?._id}`} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-text-muted hover:text-white transition-all">
                           <FaChevronRight size={14} />
                        </Link>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-6">
          {savedJobs.length === 0 ? (
            <div className="glass-card p-20 text-center border border-white/5 animate-in zoom-in-95">
               <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10 group">
                  <FaBookmark className="text-text-muted group-hover:text-secondary transition-all group-hover:scale-110" size={40} />
               </div>
               <h3 className="text-2xl font-black text-text-primary mb-3 uppercase italic tracking-tighter">Vault is Empty</h3>
               <p className="text-text-muted text-sm max-w-md mx-auto mb-10 leading-relaxed">Secure the roles you love. Bookmarked jobs will appear here so you never miss a breakthrough.</p>
               
               <div className="space-y-8">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Recommended for your skills</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {recommendedJobs.slice(0, 2).map(job => (
                      <Link key={job._id} href={`/jobs/${job._id}`} className="glass-card p-5 border border-white/5 flex items-center gap-4 text-left hover:border-secondary/30 transition-all">
                         <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                            {job.company?.logo ? <img src={job.company.logo} className="w-full h-full object-contain p-2" /> : <FaBuilding className="text-text-muted" />}
                         </div>
                         <div className="overflow-hidden">
                            <h4 className="font-bold text-text-primary text-sm truncate">{job.title}</h4>
                            <p className="text-[10px] text-text-muted font-bold uppercase">{job.company?.companyName}</p>
                         </div>
                         <FaChevronRight className="ml-auto text-text-muted" size={12} />
                      </Link>
                    ))}
                  </div>
               </div>
               
               <Link href="/careers" className="btn-primary !px-12 !py-4 text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 inline-block mt-12">
                 Explore jobs matching your skills
               </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedJobs.map((job) => {
                const match = calculateMatchScore(job.skills);
                return (
                  <div key={job._id} className="glass-card p-6 border border-white/5 hover:border-secondary/20 transition-all group flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-start justify-between mb-6">
                       <div className="flex gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden group-hover:scale-110 transition-transform">
                             {job.company?.logo ? <img src={job.company.logo} className="w-full h-full object-contain p-2" /> : <FaBriefcase size={24} className="text-text-muted" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-text-primary text-2xl mb-1 group-hover:text-secondary-light transition-colors line-clamp-1">{job.title}</h3>
                            <p className="text-sm text-text-secondary font-bold uppercase tracking-tight">{job.company?.companyName}</p>
                          </div>
                       </div>
                       <button 
                         onClick={(e) => handleRemoveSaved(e, job._id)}
                         className="p-3 rounded-xl bg-white/5 text-text-muted hover:text-danger hover:bg-danger/10 transition-all border border-white/5"
                         title="Remove from saved"
                       >
                         <FaTrash size={14} />
                       </button>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-text-muted font-bold tracking-tight uppercase mb-8 pb-6 border-b border-white/5">
                       <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-primary-light" size={12} /> {job.location}</span>
                       <span className="flex items-center gap-2"><FaMoneyBillWave className="text-secondary-light" size={12} /> {job.salary}</span>
                       <span className="flex items-center gap-2"><FaClock className="text-accent-light" size={12} /> {job.type}</span>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Compatibility Score</span>
                          <div className={`text-xl font-black ${match > 80 ? 'text-green-400' : match > 50 ? 'text-secondary-light' : 'text-text-muted'}`}>
                             {match}% MATCH
                          </div>
                       </div>
                       <Link href={`/jobs/${job._id}`} className="btn-secondary !px-8 !py-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/5">
                          Apply Now
                       </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
