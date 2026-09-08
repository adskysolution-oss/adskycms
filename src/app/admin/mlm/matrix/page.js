'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Network, Search, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

function MatrixExplorerContent() {
    const searchParams = useSearchParams();
    const initialMember = searchParams?.get('member') || '';
    const [searchCode, setSearchCode] = useState(initialMember);
    const [matrixData, setMatrixData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchMatrix = async (codeToFetch) => {
        setLoading(true);
        setError('');
        try {
            const query = codeToFetch !== undefined ? codeToFetch : searchCode;
            const url = query
                ? `/api/mlm/matrix?member=${encodeURIComponent(query)}`
                : `/api/mlm/matrix`;
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok && data.success) {
                const nodeData = data.data || data;
                setMatrixData(nodeData);
                if (!nodeData?.node) {
                    setError('No matrix node found for the specified member.');
                }
            } else {
                setError(data.message || 'Unable to load matrix tree');
                setMatrixData(null);
            }
        } catch (e) {
            setError(e.message || 'Error connecting to matrix engine');
            setMatrixData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatrix(initialMember || undefined);
    }, [initialMember]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMatrix(searchCode.trim());
    };

    const rootNode = matrixData?.node;
    const rootMember = matrixData?.member || rootNode?.memberId;
    const childrenList = matrixData?.children || matrixData?.directChildren || matrixData?.downlines || [];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Network className="w-6 h-6 text-amber-500" />
                            <span>3×15 Matrix Explorer</span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Deterministic 3-width × 15-depth spatial ternary tree. Breadth-First Vacancy Resolution.
                        </p>
                    </div>

                    <button
                        onClick={() => fetchMatrix(searchCode || undefined)}
                        className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-2"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Reload Tree</span>
                    </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            placeholder="Enter Member Code (e.g. NEX-ROOT-001, NEX-032259-CE50)..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-amber-500/20 disabled:opacity-50"
                    >
                        {loading ? 'Inspecting...' : 'Inspect'}
                    </button>
                </form>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branching Factor</span>
                        <p className="text-xl font-black text-slate-900 dark:text-white">3 Children</p>
                        <span className="text-[10px] text-slate-500">Per parent node</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Depth</span>
                        <p className="text-xl font-black text-amber-500">15 Levels</p>
                        <span className="text-[10px] text-slate-500">Ternary capacity</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level 1 Capacity</span>
                        <p className="text-xl font-black text-emerald-500">3 Nodes</p>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Direct children</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level 2 Capacity</span>
                        <p className="text-xl font-black text-purple-500">9 Nodes</p>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400">Second tier</span>
                    </div>
                </div>

                {/* Matrix Visualizer */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white">
                                Spatial Node Inspection
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Current subtree root node and immediate ternary child placements.
                            </p>
                        </div>
                        {rootNode && (
                            <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                                Level {rootNode.level || 1}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="p-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                            <span>Resolving spatial positions from database...</span>
                        </div>
                    ) : rootNode ? (
                        <div className="space-y-8">
                            {/* Root / Focused Node */}
                            <div className="flex justify-center">
                                <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-850 border-2 border-amber-400 dark:border-amber-500/60 text-center shadow-lg shadow-amber-500/10 max-w-sm w-full space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2.5 py-0.5 rounded-full">
                                        Inspected Node (Root)
                                    </span>
                                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                                        {rootMember?.fullName || rootNode.memberId?.fullName || 'Root Member'}
                                    </h3>
                                    <div className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                                        {rootMember?.mlmCode || rootNode.memberId?.mlmCode || rootNode.mlmCode || searchCode || 'NEX-ROOT-001'}
                                    </div>
                                    <div className="pt-2 border-t border-amber-200/60 dark:border-slate-700 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 text-left">
                                        <div>
                                            <strong>Status:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">{rootMember?.status || 'ACTIVE'}</span>
                                        </div>
                                        <div>
                                            <strong>Level:</strong> {rootNode.level || 1}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ternary Branches (Position 1, 2, 3) */}
                            <div className="space-y-3">
                                <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Level +1 Ternary Offshoots (3 Positions)
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((pos) => {
                                        const child = childrenList.find(
                                            (c) => (c.position ?? c.positionInParent) === pos
                                        );
                                        const childMember = child?.memberId || child?.member;
                                        return (
                                            <div
                                                key={pos}
                                                className={`p-5 rounded-2xl border transition text-center space-y-2 ${
                                                    child
                                                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-sm'
                                                        : 'bg-slate-50 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between text-[10px] font-bold">
                                                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                                        Position {pos}
                                                    </span>
                                                    <span className={child ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                                                        {child ? 'Occupied' : 'Vacant Slot'}
                                                    </span>
                                                </div>

                                                {child ? (
                                                    <div className="space-y-1 pt-1">
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                            {childMember?.fullName || child.fullName || 'Active Member'}
                                                        </p>
                                                        <p className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                            {childMember?.mlmCode || child.mlmCode || '—'}
                                                        </p>
                                                        {childMember?.mobile && (
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                                                {childMember.mobile}
                                                            </p>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                const nextCode = childMember?.mlmCode || child.mlmCode;
                                                                if (nextCode) {
                                                                    setSearchCode(nextCode);
                                                                    fetchMatrix(nextCode);
                                                                }
                                                            }}
                                                            className="mt-2 w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition inline-flex items-center justify-center gap-1"
                                                        >
                                                            <span>Explore Subtree</span>
                                                            <ArrowRight className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="py-4 text-slate-400 text-xs font-medium">
                                                        Awaiting BFS placement
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400 text-xs">
                            Enter an active MLM member code to visualize their 3×15 matrix subtree.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function AdminMlmMatrixPage() {
    return (
        <Suspense fallback={
            <DashboardLayout>
                <div className="p-12 text-center text-slate-400 text-xs">
                    Loading 3×15 Matrix Explorer...
                </div>
            </DashboardLayout>
        }>
            <MatrixExplorerContent />
        </Suspense>
    );
}
