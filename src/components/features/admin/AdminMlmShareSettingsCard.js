'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Share2, Image as ImageIcon, Upload, Copy, Save, RotateCcw, Eye, Trash2, ExternalLink, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DEFAULT_SHARE_MESSAGE } from '@/constants/mlmShare';
export default function AdminMlmShareSettingsCard() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('NEXVIA Referral WhatsApp Share');
    const [messageTemplate, setMessageTemplate] = useState(DEFAULT_SHARE_MESSAGE);
    // posterUrl = signed URL for display only (never saved to DB)
    // rawPosterUrl = actual S3 URL saved to DB
    const [posterUrl, setPosterUrl] = useState('');
    const [rawPosterUrl, setRawPosterUrl] = useState('');
    const [posterTitle, setPosterTitle] = useState('NEXVIA Official Promotional Poster');
    const [includePosterUrlInText, setIncludePosterUrlInText] = useState(false);
    const [copiedPreview, setCopiedPreview] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const loadConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mlm/share-config');
            const json = await res.json();
            if (res.ok && json.success && json.data) {
                setTitle(json.data.title || 'NEXVIA Referral WhatsApp Share');
                setMessageTemplate(json.data.messageTemplate || DEFAULT_SHARE_MESSAGE);
                // posterUrl from API is already signed (for display); rawPosterUrl comes from API's rawPosterUrl field
                setPosterUrl(json.data.posterUrl || '');
                setRawPosterUrl(json.data.rawPosterUrl || json.data.posterUrl || '');
                setPosterTitle(json.data.posterTitle || 'NEXVIA Official Promotional Poster');
                setIncludePosterUrlInText(json.data.includePosterUrlInText === true);
            }
        }
        catch (err) {
            console.error('Failed to load share settings:', err);
            toast.error('Failed to load WhatsApp share settings');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadConfig();
    }, []);
    const handleInsertTag = (tag) => {
        if (!textareaRef.current)
            return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + tag + text.substring(end);
        setMessageTemplate(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 50);
    };
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }
        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64 = reader.result;
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image: base64,
                            folder: 'mlm_marketing',
                            originalName: file.name,
                        }),
                    });
                    const json = await res.json();
                    if (res.ok && json.success && json.data?.url) {
                        // Store signed URL for display, raw S3 URL for saving to DB
                        setPosterUrl(json.data.url);
                        setRawPosterUrl(json.data.rawUrl || json.data.url);
                        toast.success('Poster image uploaded successfully! Click Save to persist.');
                    }
                    else {
                        toast.error(json.message || 'Image upload failed');
                    }
                }
                catch (err) {
                    toast.error(err.message || 'Upload error');
                }
                finally {
                    setUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
        catch (err) {
            setUploading(false);
            toast.error('Failed to process image');
        }
    };
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/mlm/share-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    messageTemplate,
                    // Always send rawPosterUrl (actual S3 URL) to DB, NOT the signed URL
                    posterUrl: rawPosterUrl || posterUrl,
                    posterTitle,
                    includePosterUrlInText,
                    isActive: true,
                }),
            });
            const json = await res.json();
            if (res.ok && json.success) {
                // Update display URL with freshly signed URL from response
                if (json.data?.posterUrl) {
                    setPosterUrl(json.data.posterUrl);
                }
                if (json.data?.rawPosterUrl) {
                    setRawPosterUrl(json.data.rawPosterUrl);
                }
                toast.success('WhatsApp referral content & poster saved successfully!');
            }
            else {
                toast.error(json.message || 'Failed to save configuration');
            }
        }
        catch (err) {
            toast.error(err.message || 'Failed to save');
        }
        finally {
            setSaving(false);
        }
    };
    // Generate sample preview with mock member data
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.adskysolution.com';
    const sampleLink = `${origin}/nextview/register?sponsor=NEX-ROOT-001`;
    let previewText = messageTemplate
        .replace(/\{\{REFERRAL_LINK\}\}/g, sampleLink)
        .replace(/\*?\{\{REFERRAL_CODE\}\}\*?/g, '*NEX-ROOT-001*')
        .replace(/\{\{MEMBER_NAME\}\}/g, 'Rahul Sharma');
    if (includePosterUrlInText && posterUrl && !previewText.includes(posterUrl)) {
        previewText += `\n\n🖼️ Official Campaign Poster:\n${posterUrl}`;
    }
    const handleTestWhatsApp = () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(previewText)}`, '_blank');
    };
    const handleCopyPreview = () => {
        navigator.clipboard.writeText(previewText);
        setCopiedPreview(true);
        toast.success('Preview message copied to clipboard');
        setTimeout(() => setCopiedPreview(false), 2000);
    };
    if (loading) {
        return (<div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-slate-200 rounded-lg"/>
        <div className="h-32 bg-slate-100 rounded-2xl"/>
      </div>);
    }
    return (<div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-amber-50/40 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Share2 className="w-5 h-5"/>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>WhatsApp Referral Share &amp; Poster Settings</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Live Dynamic
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Set the default WhatsApp message template and promotional poster that members send when sharing their referral link.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setMessageTemplate(DEFAULT_SHARE_MESSAGE)} className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs">
              <RotateCcw className="w-3.5 h-3.5 text-slate-500"/>
              <span>Reset Default</span>
            </button>

            <button type="button" onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20">
              <Save className="w-3.5 h-3.5"/>
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Template Title */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Template Title / Label
            </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. NEXVIA Referral WhatsApp Share" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"/>
          </div>

          {/* Placeholders helper toolbar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                WhatsApp Message Template
              </label>
              <span className="text-[11px] font-bold text-slate-400">
                Click placeholder to insert
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/70">
              <button type="button" onClick={() => handleInsertTag('{{REFERRAL_LINK}}')} className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-700 text-xs font-mono font-bold transition shadow-2xs" title="Inserts the dynamic registration link with member's code">
                + &#123;&#123;REFERRAL_LINK&#125;&#125;
              </button>

              <button type="button" onClick={() => handleInsertTag('{{REFERRAL_CODE}}')} className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-amber-800 text-xs font-mono font-bold transition shadow-2xs" title="Inserts the member's sponsor code">
                + &#123;&#123;REFERRAL_CODE&#125;&#125;
              </button>

              <button type="button" onClick={() => handleInsertTag('{{MEMBER_NAME}}')} className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-800 text-xs font-mono font-bold transition shadow-2xs" title="Inserts the member's full name">
                + &#123;&#123;MEMBER_NAME&#125;&#125;
              </button>
            </div>

            <textarea ref={textareaRef} rows={14} value={messageTemplate} onChange={(e) => setMessageTemplate(e.target.value)} placeholder="Type your WhatsApp message template here..." className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed font-medium transition"/>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Supports emojis, bold formatting (*text*), and line breaks.</span>
              <span>{messageTemplate.length} characters</span>
            </div>
          </div>

          {/* Poster Image Section */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600"/>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Promotional Poster / Banner Image
                </h3>
              </div>
              {posterUrl && (<button type="button" onClick={() => { setPosterUrl(''); setRawPosterUrl(''); }} className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5"/>
                  <span>Remove Image</span>
                </button>)}
            </div>

            {posterUrl ? (<div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                <div className="w-28 h-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-100 relative shrink-0">
                  <img src={posterUrl} alt={posterTitle} className="w-full h-full object-cover"/>
                </div>
                <div className="flex-1 min-w-0 space-y-2 text-left">
                  <input type="text" value={posterTitle} onChange={(e) => setPosterTitle(e.target.value)} placeholder="Poster Title (e.g. NEXVIA Growth Banner)" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800"/>
                  <div className="flex items-center gap-2">
                    <a href={posterUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3"/>
                      <span>View Full Image</span>
                    </a>
                    <span className="text-slate-300">•</span>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[11px] font-bold text-slate-600 hover:text-slate-900">
                      Replace Image
                    </button>
                  </div>
                </div>
              </div>) : (<div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-6 text-center bg-white cursor-pointer transition group">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <Upload className="w-5 h-5"/>
                </div>
                <p className="text-xs font-bold text-slate-700">
                  {uploading ? 'Uploading poster...' : 'Click to Upload Promotional Poster Image'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG, WEBP up to 5MB (1080×1080 or 1200×630 recommended)
                </p>
              </div>)}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>

            {/* Direct URL input fallback */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Or enter Direct Image URL:
              </label>
              <div className="flex gap-2">
                <input type="url" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="https://example.com/poster.jpg" className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"/>
              </div>
            </div>

            {/* Include link in text option */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input type="checkbox" checked={includePosterUrlInText} onChange={(e) => setIncludePosterUrlInText(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"/>
              <span className="text-xs font-bold text-slate-700">
                Automatically append poster image link at the bottom of the WhatsApp message
              </span>
            </label>
          </div>
        </div>

        {/* Right Side: Live WhatsApp Phone Simulator Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600"/>
              <span>Live Receiver Preview</span>
            </h3>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={handleCopyPreview} className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
                <Copy className="w-3 h-3 text-slate-500"/>
                <span>{copiedPreview ? 'Copied' : 'Copy'}</span>
              </button>

              <button type="button" onClick={handleTestWhatsApp} className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1">
                <MessageSquare className="w-3 h-3"/>
                <span>Test Share</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Chat Simulation */}
          <div className="rounded-3xl border border-slate-200/80 shadow-inner bg-[#EFEAE2] p-4 relative overflow-hidden flex flex-col min-h-[500px]">
            {/* WhatsApp Chat Header Bar */}
            <div className="bg-[#075E54] text-white p-3 rounded-2xl flex items-center gap-2.5 mb-3 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                N
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">NEXVIA Community Share</p>
                <p className="text-[10px] text-white/80">Preview with sample member</p>
              </div>
            </div>

            {/* Chat Bubble with Poster and Message */}
            <div className="bg-white rounded-2xl p-3.5 shadow-sm max-w-[95%] self-start space-y-3 border border-slate-100/50">
              {/* If Poster is attached */}
              {posterUrl && (<div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 aspect-video relative">
                  <img src={posterUrl} alt={posterTitle} className="w-full h-full object-cover"/>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[10px] font-bold text-white">
                    Poster Attached
                  </div>
                </div>)}

              {/* Message text formatted with line breaks */}
              <div className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap font-sans break-words max-h-96 overflow-y-auto pr-1">
                {previewText}
              </div>

              <div className="text-right text-[9px] text-slate-400 font-medium">
                Just now &bull; ✓✓
              </div>
            </div>

            <div className="mt-auto pt-3 text-center text-[10px] text-slate-500 font-bold">
              When members click &ldquo;Share WhatsApp&rdquo;, this exact message is sent with their unique referral link.
            </div>
          </div>
        </div>
      </div>
    </div>);
}
