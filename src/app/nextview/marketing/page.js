'use client';
import React, { useState, useEffect } from 'react';
import { Copy, Download, Share2, Image as ImageIcon, Sparkles } from 'lucide-react';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
import { DEFAULT_SHARE_MESSAGE } from '@/constants/mlmShare';
export default function NextViewMarketingPage() {
    const [items, setItems] = useState([]);
    const [memberCode, setMemberCode] = useState('');
    const [memberName, setMemberName] = useState('');
    const [shareConfig, setShareConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);
    const [copiedOfficial, setCopiedOfficial] = useState(false);
    useEffect(() => {
        async function loadData() {
            try {
                const [mktRes, profRes, shareRes] = await Promise.all([
                    fetch('/api/mlm/marketing').then((r) => r.json()),
                    fetch('/api/mlm/profile').then((r) => r.json()),
                    fetch('/api/mlm/share-config').then((r) => r.json()),
                ]);
                if (mktRes.success)
                    setItems(mktRes.data || []);
                if (profRes.success && profRes.data) {
                    setMemberCode(profRes.data.mlmCode);
                    setMemberName(profRes.data.fullName || '');
                }
                if (shareRes?.success && shareRes.data) {
                    setShareConfig(shareRes.data);
                }
            }
            catch (e) {
                console.error('Failed to load marketing creatives:', e);
            }
            finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);
    const getOfficialShareText = () => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const base = (origin.includes('localhost') || origin.includes('127.0.0.1'))
            ? 'https://www.sakhihub.com'
            : origin;
        const inviteLink = `${base}/nextview/register?sponsor=${memberCode}`;
        const rawTemplate = shareConfig?.messageTemplate || DEFAULT_SHARE_MESSAGE;
        let text = rawTemplate
            .replace(/\{\{REFERRAL_LINK\}\}/g, inviteLink)
            .replace(/\*?\{\{REFERRAL_CODE\}\}\*?/g, `*${memberCode}*`)
            .replace(/\{\{MEMBER_NAME\}\}/g, memberName || 'NEXVIA Member');
        if (shareConfig?.posterUrl && !text.includes(shareConfig.posterUrl)) {
            text += `\n\n🖼️ Official Campaign Poster:\n${shareConfig.posterUrl}`;
        }
        return text;
    };
    const copyOfficialText = () => {
        navigator.clipboard.writeText(getOfficialShareText());
        setCopiedOfficial(true);
        setTimeout(() => setCopiedOfficial(false), 2000);
    };
    const downloadPoster = async () => {
        if (!shareConfig?.posterUrl)
            return;
        try {
            const response = await fetch(shareConfig.posterUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `nexvia-poster-${memberCode || 'official'}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        }
        catch (e) {
            window.open(shareConfig.posterUrl, '_blank');
        }
    };
    const shareOfficialWhatsapp = async () => {
        const text = getOfficialShareText();
        if (typeof navigator !== 'undefined' && navigator.share && shareConfig?.posterUrl) {
            try {
                const response = await fetch(shareConfig.posterUrl);
                const blob = await response.blob();
                const file = new File([blob], 'nexvia-poster.jpg', { type: blob.type || 'image/jpeg' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: shareConfig.title || 'NEXVIA Community',
                        text,
                        files: [file],
                    });
                    return;
                }
            }
            catch (e) {
                // Fallback
            }
        }
        if (shareConfig?.posterUrl) {
            downloadPoster();
        }
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };
    const copyPersonalizedCaption = (id, captionTemplate) => {
        const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://www.sakhihub.com'}/nextview/register?sponsor=${memberCode}`;
        const personalized = (captionTemplate || '').replace(/\{\{REFERRAL_LINK\}\}/g, inviteLink);
        navigator.clipboard.writeText(personalized);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    const shareOnWhatsapp = (captionTemplate) => {
        const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://www.sakhihub.com'}/nextview/register?sponsor=${memberCode}`;
        const personalized = (captionTemplate || '').replace(/\{\{REFERRAL_LINK\}\}/g, inviteLink);
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(personalized)}`, '_blank');
    };
    if (loading) {
        return (<MlmMemberLayout activePath="/nextview/marketing">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      </MlmMemberLayout>);
    }
    return (<MlmMemberLayout activePath="/nextview/marketing">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Promotional Marketing Creatives</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Share personalized posters, banners, and ready-to-use WhatsApp messages with your invite link embedded.
          </p>
        </div>

        {/* ── OFFICIAL WHATSAPP REFERRAL PROMOTION CARD ── */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-white border border-emerald-300/80 rounded-3xl p-6 shadow-xs overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              {shareConfig?.posterUrl ? (<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white border border-emerald-200 shadow-sm shrink-0">
                  <img src={shareConfig.posterUrl} alt={shareConfig.posterTitle || 'Poster'} className="w-full h-full object-cover"/>
                </div>) : (<div className="w-20 h-20 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-600/20">
                  <Sparkles className="w-8 h-8"/>
                </div>)}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    Official Campaign
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    {shareConfig?.title || 'NEXVIA Official WhatsApp Referral Message & Poster'}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 max-w-xl line-clamp-2">
                  Ready-to-share promotional message preloaded with your sponsor code ({memberCode}) and personal registration link.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
              <button type="button" onClick={copyOfficialText} className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs">
                <Copy className="w-3.5 h-3.5 text-slate-500"/>
                <span>{copiedOfficial ? 'Copied Text!' : 'Copy Message'}</span>
              </button>

              {shareConfig?.posterUrl && (<button type="button" onClick={downloadPoster} className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition flex items-center justify-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-amber-700"/>
                  <span>Download Poster</span>
                </button>)}

              <button type="button" onClick={shareOfficialWhatsapp} className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20">
                <Share2 className="w-3.5 h-3.5"/>
                <span>Share WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── ADDITIONAL MARKETING ASSETS GRID ── */}
        {items.length === 0 ? (<div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center text-slate-400 space-y-2">
            <ImageIcon className="w-8 h-8 text-slate-300 mx-auto"/>
            <p className="text-xs font-bold text-slate-500">Additional Marketing Creatives</p>
            <p className="text-[11px] text-slate-400">Extra banners and creatives published by admin will appear here.</p>
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (<div key={item._id} className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                {item.imageUrl && (<div className="relative aspect-video bg-slate-100 border-b border-slate-100">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover"/>
                  </div>)}

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                    {item.caption && (<p className="text-xs text-slate-500 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                        {item.caption}
                      </p>)}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    <button type="button" onClick={() => copyPersonalizedCaption(item._id, item.caption)} className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5">
                      <Copy className="w-3.5 h-3.5 text-slate-500"/>
                      <span>{copiedId === item._id ? 'Copied!' : 'Copy Text'}</span>
                    </button>

                    <button type="button" onClick={() => shareOnWhatsapp(item.caption)} className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20">
                      <Share2 className="w-3.5 h-3.5"/>
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>))}
          </div>)}
      </div>
    </MlmMemberLayout>);
}
