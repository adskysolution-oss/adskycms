'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaClock, FaCheckCircle, FaBuilding, FaArrowLeft, FaShareAlt } from 'react-icons/fa';

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        setJob(data.job);
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return (
    <div className="pt-32 pb-24 container-custom">
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-white/5 rounded-xl w-3/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white/5 rounded-2xl" />
          <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (!job) return (
    <div className="pt-32 pb-24 container-custom text-center">
      <h1 className="text-4xl font-bold mb-6 text-text-primary">Job Not Found</h1>
      <Link href="/careers" className="btn-primary">Back to Careers</Link>
    </div>
  );

  return (
    <div className="pt-32 pb-24">
      <div className="container-custom">
        {/* Breadcrumb / Back */}
        <Link href="/careers" className="inline-flex items-center gap-2 text-text-muted hover:text-primary-light transition-colors mb-10 font-medium">
          <FaArrowLeft size={14} /> Back to Job Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8 md:p-12 mb-8 border border-white/5">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                <div className="flex gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-surface border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xl">
                    {job.company?.logo ? (
                      <img src={job.company.logo} alt={job.company.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <FaBuilding size={32} className="text-text-muted" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-3 leading-tight">
                      {job.title}
                    </h1>
                    <p className="text-text-secondary font-bold flex items-center gap-2">
                      <FaBuilding size={14} className="text-primary-light" /> {job.company?.companyName}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none btn-secondary !py-3">
                    <FaShareAlt className="mr-2" /> Share
                  </button>
                  <Link href={`/jobs/${job._id}/apply`} className="flex-1 md:flex-none btn-primary !py-3">
                    Apply Now
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-white/5 mb-10">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Location</span>
                  <div className="flex items-center gap-2 text-text-primary font-bold text-sm">
                    <FaMapMarkerAlt className="text-primary-light" /> {job.location}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Salary</span>
                  <div className="flex items-center gap-2 text-text-primary font-bold text-sm">
                    <FaMoneyBillWave className="text-primary-light" /> {job.salary}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Job Type</span>
                  <div className="flex items-center gap-2 text-text-primary font-bold text-sm">
                    <FaClock className="text-primary-light" /> {job.type}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Experience</span>
                  <div className="flex items-center gap-2 text-text-primary font-bold text-sm">
                    <FaBriefcase className="text-primary-light" /> {job.experience}
                  </div>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-2xl font-bold text-text-primary mb-6">Job Description</h3>
                <div className="text-text-secondary leading-relaxed mb-10 whitespace-pre-wrap">
                  {job.description}
                </div>

                <h3 className="text-2xl font-bold text-text-primary mb-6">Requirements</h3>
                <ul className="space-y-4 mb-10 list-none p-0">
                  {job.requirements?.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-secondary">
                      <FaCheckCircle className="text-primary-light mt-1 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-2xl font-bold text-text-primary mb-6">Required Skills</h3>
                <div className="flex flex-wrap gap-3 mb-10">
                  {job.skills?.map((skill, i) => (
                    <span key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-10 bg-gradient-to-br from-primary/10 to-secondary/10 border-none text-center">
              <h3 className="text-2xl font-bold text-text-primary mb-4">Interested in this position?</h3>
              <p className="text-text-secondary mb-8">Click the button below to start your application process.</p>
              <Link href={`/jobs/${job._id}/apply`} className="btn-primary !px-12 !py-4 text-lg">
                Apply for this Job
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="glass-card p-8 border border-white/5">
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <FaBuilding className="text-primary-light" /> About {job.company?.companyName}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                {job.company?.description || 'No description available for this company.'}
              </p>
              <div className="space-y-4">
                <div className="flex justify-between text-sm py-3 border-b border-white/5">
                  <span className="text-text-muted">Industry</span>
                  <span className="text-text-primary font-bold">{job.company?.industry || 'IT Services'}</span>
                </div>
                <div className="flex justify-between text-sm py-3 border-b border-white/5">
                  <span className="text-text-muted">Location</span>
                  <span className="text-text-primary font-bold">{job.company?.location || 'India'}</span>
                </div>
                {job.company?.website && (
                  <div className="flex justify-between text-sm py-3">
                    <span className="text-text-muted">Website</span>
                    <a href={job.company.website} target="_blank" rel="noopener" className="text-primary-light hover:underline font-bold">Visit Site</a>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-8 border border-white/5">
              <h3 className="text-lg font-bold text-text-primary mb-6">Job Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm py-2">
                  <span className="text-text-muted">Published On</span>
                  <span className="text-text-primary font-bold">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="text-text-muted">Category</span>
                  <span className="text-text-primary font-bold">{job.category?.name}</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="text-text-muted">Job Status</span>
                  <span className="text-green-400 font-bold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
