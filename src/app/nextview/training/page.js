'use client';
import React, { useState, useEffect } from 'react';
import { Video, FileText, ExternalLink, BookOpen } from 'lucide-react';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
export default function NextViewTrainingPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadTraining() {
            try {
                const res = await fetch('/api/mlm/training');
                const data = await res.json();
                if (data.success) {
                    setItems(data.data || []);
                }
            }
            catch (e) {
                console.error('Failed to load training:', e);
            }
            finally {
                setLoading(false);
            }
        }
        loadTraining();
    }, []);
    if (loading) {
        return (<MlmMemberLayout activePath="/nextview/training">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      </MlmMemberLayout>);
    }
    return (<MlmMemberLayout activePath="/nextview/training">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>NexVia Referral Training Academy</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Guides, customer explanation scripts, FD benefits tutorials, and 3×15 network growth strategies.
          </p>
        </div>

        {items.length === 0 ? (<div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto"/>
            <p className="text-xs font-bold text-slate-500">No training modules available yet</p>
            <p className="text-[11px] text-slate-400">Training modules published by administration will appear here.</p>
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (<div key={item._id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      {item.type === 'VIDEO' ? <Video className="w-5 h-5"/> : <FileText className="w-5 h-5"/>}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200">
                      {item.category || 'General'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3">{item.description}</p>
                  </div>
                </div>

                {item.contentUrl && (<div className="pt-3 border-t border-slate-100">
                    <a href={item.contentUrl} target="_blank" rel="noreferrer" className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5">
                      <span>Open Training Material</span>
                      <ExternalLink className="w-3.5 h-3.5"/>
                    </a>
                  </div>)}
              </div>))}
          </div>)}
      </div>
    </MlmMemberLayout>);
}
