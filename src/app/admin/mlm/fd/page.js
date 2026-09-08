'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Award, Search, RefreshCw, CheckCircle2, AlertCircle, CreditCard, ExternalLink, Plus, Edit2, X, ShieldCheck } from 'lucide-react';
export default function AdminMlmFdPage() {
    const [activeMainTab, setActiveMainTab] = useState('APPLICATIONS');
    // Applications State
    const [applications, setApplications] = useState([]);
    const [appStatusTab, setAppStatusTab] = useState('ALL');
    const [appSearch, setAppSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    // Reject Modal State
    const [rejectingAppId, setRejectingAppId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    // Products State
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '',
        slug: '',
        type: 'FD_CARD',
        providerName: '',
        referralUrl: '',
        interestRate: 'Up to 9.0% p.a.',
        minAmount: 2000,
        maxAmount: 2000,
        creditLimit: 1800,
        description: '',
        benefits: '',
        status: 'ACTIVE',
    });
    const [savingProduct, setSavingProduct] = useState(false);
    const [productMsg, setProductMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const loadData = async () => {
        setLoading(true);
        try {
            const [appRes, prodRes] = await Promise.all([
                fetch('/api/admin/mlm/fd').then((r) => r.json()),
                fetch('/api/mlm/products?all=true').then((r) => r.json()),
            ]);
            if (appRes.success)
                setApplications(appRes.data || []);
            if (prodRes.success)
                setProducts(prodRes.data || []);
        }
        catch (e) {
            console.error('Failed to load FD admin data:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    const handleVerify = async (appId) => {
        if (!confirm('Are you sure you want to APPROVE & VERIFY this FD-Credit Card application? This will immediately distribute Level 1–15 rewards across upline members.'))
            return;
        setActionLoading(appId);
        try {
            const res = await fetch(`/api/admin/mlm/fd/${appId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'VERIFY',
                    adminRemarks: 'Application verified and approved by admin',
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || 'Action failed');
            alert('Application verified successfully! 15-tier matrix level rewards distributed.');
            loadData();
        }
        catch (e) {
            alert(e.message || 'Verification failed');
        }
        finally {
            setActionLoading(null);
        }
    };
    const handleConfirmReject = async (e) => {
        e.preventDefault();
        if (!rejectingAppId)
            return;
        setActionLoading(rejectingAppId);
        try {
            const res = await fetch(`/api/admin/mlm/fd/${rejectingAppId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'REJECT',
                    rejectionReason: rejectionReason.trim() || 'Invalid or unverified bank reference number',
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || 'Action failed');
            alert('Application marked as rejected.');
            setRejectingAppId(null);
            setRejectionReason('');
            loadData();
        }
        catch (e) {
            alert(e.message || 'Rejection failed');
        }
        finally {
            setActionLoading(null);
        }
    };
    const handleOpenEditProduct = (prod) => {
        setEditingProduct(prod);
        setIsCreatingProduct(false);
        setProductForm({
            name: prod.name || '',
            slug: prod.slug || '',
            type: prod.type || 'FD_CARD',
            providerName: prod.providerName || '',
            referralUrl: prod.referralUrl || prod.applicationUrl || '',
            interestRate: prod.interestRate || 'Up to 9.0% p.a.',
            minAmount: prod.minAmount || 2000,
            maxAmount: prod.maxAmount || 2000,
            creditLimit: prod.creditLimit || 1800,
            description: prod.description || '',
            benefits: Array.isArray(prod.benefits) ? prod.benefits.join('\n') : '',
            status: prod.status || 'ACTIVE',
        });
        setProductMsg(null);
    };
    const handleOpenCreateProduct = () => {
        setEditingProduct(null);
        setIsCreatingProduct(true);
        setProductForm({
            name: 'Sakhi Mahila Samriddhi FD-Credit Card',
            slug: 'sakhi-mahila-samriddhi-fd-card',
            type: 'FD_CARD',
            providerName: 'SakhiHub Co-operative & Banking Partner',
            referralUrl: 'https://wee.bnking.in/c/ZGZjODFlM',
            interestRate: 'Up to 9.0% p.a.',
            minAmount: 2000,
            maxAmount: 2000,
            creditLimit: 1800,
            description: 'Exclusive Women Empowerment Fixed Deposit Card offering ₹1,800 instant credit limit against ₹2,000 fixed deposit, high-yield interest, and 15-tier matrix level rewards.',
            benefits: '₹1,800 Instant Credit Limit against ₹2,000 Deposit\nGuaranteed Fixed Deposit Returns up to 9.0% p.a.\nZero Foreclosure Penalty after 1 Year\nMatrix Tier Level 1–15 Referral Rewards upon Verification',
            status: 'ACTIVE',
        });
        setProductMsg(null);
    };
    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setSavingProduct(true);
        setProductMsg(null);
        try {
            const url = '/api/mlm/products';
            const method = editingProduct ? 'PUT' : 'POST';
            const payload = {
                ...productForm,
                benefits: productForm.benefits.split('\n').filter(Boolean),
            };
            if (editingProduct)
                payload.id = editingProduct._id;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || 'Failed to save product');
            setProductMsg({ type: 'success', text: `Product ${editingProduct ? 'updated' : 'created'} successfully!` });
            loadData();
            setTimeout(() => {
                setEditingProduct(null);
                setIsCreatingProduct(false);
            }, 1200);
        }
        catch (err) {
            setProductMsg({ type: 'error', text: err.message || 'Failed to save product' });
        }
        finally {
            setSavingProduct(false);
        }
    };
    const filteredApps = applications.filter((app) => {
        const q = appSearch.toLowerCase();
        const matchesSearch = !q ||
            app.applicantName?.toLowerCase().includes(q) ||
            app.applicantMobile?.includes(q) ||
            app.applicationReference?.toLowerCase().includes(q) ||
            app.productId?.name?.toLowerCase().includes(q);
        const matchesTab = appStatusTab === 'ALL' || app.status === appStatusTab;
        return matchesSearch && matchesTab;
    });
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Award className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                FD-Credit Card Applications &amp; Verification
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Verify booked ₹2,000 FD-Credit Card applications to trigger automated Level 1 to Level 15 reward distributions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={loadData} disabled={loading} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Main Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button onClick={() => setActiveMainTab('APPLICATIONS')} className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${activeMainTab === 'APPLICATIONS'
            ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <ShieldCheck className="w-4 h-4"/>
            <span>FD Applications Verification ({applications.length})</span>
          </button>

          <button onClick={() => setActiveMainTab('PRODUCTS')} className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${activeMainTab === 'PRODUCTS'
            ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <CreditCard className="w-4 h-4"/>
            <span>FD-Credit Card Product Configuration ({products.length})</span>
          </button>
        </div>

        {/* ── TAB 1: APPLICATIONS VERIFICATION ─────────────────────────────── */}
        {activeMainTab === 'APPLICATIONS' && (<div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                {['ALL', 'PENDING', 'ELIGIBLE', 'VERIFIED', 'REJECTED'].map((tab) => (<button key={tab} onClick={() => setAppStatusTab(tab)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${appStatusTab === tab
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {tab}
                  </button>))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5"/>
                <input type="text" placeholder="Search reference, name..." value={appSearch} onChange={(e) => setAppSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"/>
              </div>
            </div>

            {filteredApps.length === 0 ? (<div className="bg-white rounded-2xl p-10 border border-gray-100 text-center space-y-2">
                <Award className="w-8 h-8 text-gray-300 mx-auto"/>
                <p className="text-xs font-bold text-gray-500">No applications match current filter</p>
              </div>) : (<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3.5">Reference / ARN</th>
                        <th className="p-3.5">Product</th>
                        <th className="p-3.5">Applicant Info</th>
                        <th className="p-3.5">FD Amount</th>
                        <th className="p-3.5">Credit Limit</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {filteredApps.map((app) => {
                    const isPending = app.status === 'PENDING' || app.status === 'UNDER_REVIEW';
                    return (<tr key={app._id} className="hover:bg-gray-50/60 transition">
                            <td className="p-3.5 font-mono font-bold text-gray-900">
                              {app.applicationReference || '—'}
                              {app.maskedCardNumber && (<span className="block text-[10px] text-gray-400">
                                  Card: {app.maskedCardNumber}
                                </span>)}
                            </td>
                            <td className="p-3.5 font-extrabold text-gray-900">
                              {app.productId?.name || 'Sakhi Mahila Samriddhi FD-Credit Card'}
                            </td>
                            <td className="p-3.5">
                              <p className="font-bold text-gray-900">{app.applicantName}</p>
                              <p className="font-mono text-[11px] text-gray-400">{app.applicantMobile}</p>
                            </td>
                            <td className="p-3.5 font-mono font-bold text-gray-900">
                              ₹{(app.fdAmount || 2000).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-emerald-600">
                              ₹{(app.creditLimit || 1800).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                              {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${app.status === 'ELIGIBLE' || app.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.status === 'REJECTED'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              {isPending ? (<>
                                  <button onClick={() => handleVerify(app._id)} disabled={actionLoading === app._id} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50">
                                    {actionLoading === app._id ? 'Processing...' : 'Approve & Distribute'}
                                  </button>
                                  <button onClick={() => {
                                setRejectingAppId(app._id);
                                setRejectionReason('');
                            }} disabled={actionLoading === app._id} className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition border border-red-200 disabled:opacity-50">
                                    Reject
                                  </button>
                                </>) : (<span className="text-gray-400 font-semibold text-[11px]">Processed</span>)}
                            </td>
                          </tr>);
                })}
                    </tbody>
                  </table>
                </div>
              </div>)}
          </div>)}

        {/* ── TAB 2: PRODUCTS MANAGEMENT ───────────────────────────────────── */}
        {activeMainTab === 'PRODUCTS' && (<div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">
                Official MLM FD-Credit Card product configuration (₹2,000 FD, ₹1,800 Credit Limit, and Provider URL).
              </p>
              {products.length === 0 && (<button onClick={handleOpenCreateProduct} className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-amber-500/20">
                  <Plus className="w-4 h-4"/>
                  <span>Configure FD-Credit Card</span>
                </button>)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (<div key={p._id} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-800 border border-purple-200">
                        {p.type}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${p.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-gray-900">{p.name}</h3>
                      <p className="text-xs text-gray-500">{p.providerName || 'SakhiHub Co-operative & Banking Partner'}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-bold">FD Deposit Amount:</span>
                        <span className="font-black text-gray-900 font-mono">₹{p.minAmount?.toLocaleString('en-IN') || '2,000'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-bold">Instant Credit Limit:</span>
                        <span className="font-black text-emerald-600 font-mono">₹{p.creditLimit?.toLocaleString('en-IN') || '1,800'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-bold">Interest Rate Yield:</span>
                        <span className="font-extrabold text-amber-600">{p.interestRate || 'Up to 9.0% p.a.'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-200/60">
                        <span className="text-gray-400 font-bold">Application URL:</span>
                        <a href={p.referralUrl || p.applicationUrl} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-blue-600 hover:underline max-w-[180px] truncate inline-flex items-center gap-1">
                          <span>{p.referralUrl || p.applicationUrl || 'Not configured'}</span>
                          <ExternalLink className="w-3 h-3 shrink-0"/>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-end">
                    <button onClick={() => handleOpenEditProduct(p)} className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition inline-flex items-center gap-1.5">
                      <Edit2 className="w-3.5 h-3.5"/>
                      <span>Edit Configuration &amp; URL</span>
                    </button>
                  </div>
                </div>))}
            </div>
          </div>)}

        {/* ── REJECTION MODAL ──────────────────────────────────────────────── */}
        {rejectingAppId && (<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900">Reject FD-Credit Card Application</h3>
                <button onClick={() => setRejectingAppId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea required rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g. Bank reference number not found in reconciliation / Name mismatch." className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"/>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setRejectingAppId(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading === rejectingAppId} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs">
                    {actionLoading === rejectingAppId ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>)}

        {/* ── PRODUCT CREATE / EDIT MODAL ──────────────────────────────────── */}
        {(editingProduct || isCreatingProduct) && (<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 relative border border-gray-100">
              <button type="button" onClick={() => {
                setEditingProduct(null);
                setIsCreatingProduct(false);
            }} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition">
                <X className="w-4 h-4"/>
              </button>

              <div className="space-y-1 pr-8">
                <h3 className="text-lg font-black text-gray-900">
                  {editingProduct ? 'Edit FD-Credit Card Product' : 'Configure FD-Credit Card'}
                </h3>
                <p className="text-xs text-gray-500">
                  Configure external bank application URL, FD amount (₹2,000), and credit limit (₹1,800).
                </p>
              </div>

              {productMsg && (<div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${productMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {productMsg.type === 'success' ? (<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/>) : (<AlertCircle className="w-4 h-4 text-red-600 shrink-0"/>)}
                  <span>{productMsg.text}</span>
                </div>)}

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Product Name *</label>
                    <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g. Sakhi Mahila Samriddhi FD-Credit Card" className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Slug *</label>
                    <input type="text" required value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="e.g. sakhi-mahila-samriddhi-fd-card" className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Type *</label>
                    <select value={productForm.type} onChange={(e) => setProductForm({ ...productForm, type: e.target.value })} className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold">
                      <option value="FD_CARD">FD_CARD (Credit Card against FD)</option>
                      <option value="FD">FD (Fixed Deposit)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Interest Rate Display</label>
                    <input type="text" value={productForm.interestRate} onChange={(e) => setProductForm({ ...productForm, interestRate: e.target.value })} placeholder="e.g. Up to 9.0% p.a." className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                    <select value={productForm.status} onChange={(e) => setProductForm({ ...productForm, status: e.target.value })} className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PAUSED">PAUSED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    External Provider Application URL * (Where [Apply Now] redirects)
                  </label>
                  <input type="url" required value={productForm.referralUrl} onChange={(e) => setProductForm({ ...productForm, referralUrl: e.target.value })} placeholder="e.g. https://wee.bnking.in/c/ZGZjODFlM" className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-blue-700"/>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Members clicking &quot;Apply Now&quot; will be redirected to this banking partner link.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Provider Name</label>
                    <input type="text" value={productForm.providerName} onChange={(e) => setProductForm({ ...productForm, providerName: e.target.value })} placeholder="e.g. SakhiHub Co-operative Partner" className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">FD Amount (₹)</label>
                    <input type="number" value={productForm.minAmount} onChange={(e) => setProductForm({ ...productForm, minAmount: Number(e.target.value), maxAmount: Number(e.target.value) })} placeholder="2000" className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold"/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Credit Limit (₹)</label>
                    <input type="number" value={productForm.creditLimit} onChange={(e) => setProductForm({ ...productForm, creditLimit: Number(e.target.value) })} placeholder="1800" className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-emerald-600"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <textarea rows={2} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Short product overview..." className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"/>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Benefits (1 per line)</label>
                  <textarea rows={3} value={productForm.benefits} onChange={(e) => setProductForm({ ...productForm, benefits: e.target.value })} placeholder="₹1,800 Instant Credit Limit against ₹2,000 Deposit&#10;Guaranteed Fixed Deposit Returns up to 9.0% p.a.&#10;Zero Foreclosure Penalty after 1 Year" className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"/>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => {
                setEditingProduct(null);
                setIsCreatingProduct(false);
            }} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold">
                    Cancel
                  </button>

                  <button type="submit" disabled={savingProduct} className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition shadow-md shadow-amber-500/20 disabled:opacity-50">
                    {savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>)}
      </div>
    </DashboardLayout>);
}
