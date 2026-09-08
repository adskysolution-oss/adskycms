'use client';
import React, { useState, useEffect } from 'react';
import { Network, Users, Layers, UserX, ChevronRight, Sparkles, Search, Filter, ArrowLeft, CheckCircle2, Clock, Eye, AlertCircle } from 'lucide-react';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
export default function NextViewNetworkPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    // Tab & Filters
    const [activeTab, setActiveTab] = useState('all');
    const [selectedLevelFilter, setSelectedLevelFilter] = useState('all');
    const [fdFilter, setFdFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    // Interactive Tree View State
    const [treeHistory, setTreeHistory] = useState([]); // stack of inspected nodes
    useEffect(() => {
        async function loadMatrix() {
            try {
                const res = await fetch('/api/mlm/matrix');
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            }
            catch (e) {
                console.error('Error loading network:', e);
            }
            finally {
                setLoading(false);
            }
        }
        loadMatrix();
    }, []);
    if (loading) {
        return (<MlmMemberLayout activePath="/nextview/network">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      </MlmMemberLayout>);
    }
    const { currentNode, member, directChildren, totalDescendantsCount, directSponsored, downlineMembers, levelOccupancies } = data || {};
    // Compute current active level = first level not yet fully complete
    const occupancyList = levelOccupancies || [];
    const firstIncomplete = occupancyList.find((l) => !l.isComplete);
    const activeLevel = firstIncomplete?.level ?? 1;
    const activeLevelFilled = firstIncomplete?.filledCount ?? 0;
    const activeLevelCapacity = firstIncomplete?.capacity ?? Math.pow(3, activeLevel);
    const allLevelsComplete = occupancyList.length === 15 && occupancyList.every((l) => l.isComplete);
    const allDownlineList = downlineMembers || [];
    const directList = directSponsored || [];
    // Downline FD counts
    const totalDownlineCount = allDownlineList.length;
    const fdDoneCount = allDownlineList.filter((m) => ['ELIGIBLE', 'VERIFIED'].includes(m.fdCard?.status)).length;
    const fdPendingCount = totalDownlineCount - fdDoneCount;
    // Available levels present in downline
    const uniqueLevels = Array.from(new Set(allDownlineList.map((m) => m.relativeLevel))).sort((a, b) => a - b);
    // Helper for Mobile Number Masking: Direct connect gets full mobile, others get 62****5001
    const formatMobile = (mobile, isDirect) => {
        if (!mobile)
            return '—';
        if (isDirect)
            return mobile;
        const clean = mobile.replace(/\D/g, '');
        if (clean.length <= 6)
            return mobile;
        const prefix = clean.slice(0, 2);
        const suffix = clean.slice(-4);
        return `${prefix}****${suffix}`;
    };
    // Filtered Downline Members
    const filteredDownline = allDownlineList.filter((m) => {
        const matchesLevel = selectedLevelFilter === 'all' || m.relativeLevel === selectedLevelFilter;
        const isFdDone = ['ELIGIBLE', 'VERIFIED'].includes(m.fdCard?.status);
        const matchesFd = fdFilter === 'all' ||
            (fdFilter === 'done' && isFdDone) ||
            (fdFilter === 'pending' && !isFdDone);
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query ||
            m.fullName?.toLowerCase().includes(query) ||
            m.mlmCode?.toLowerCase().includes(query) ||
            m.mobile?.includes(query) ||
            m.sponsor?.fullName?.toLowerCase().includes(query) ||
            m.placedUnder?.fullName?.toLowerCase().includes(query);
        return matchesLevel && matchesFd && matchesSearch;
    });
    // Filtered Direct Members
    const filteredDirect = directList.filter((m) => {
        const isFdDone = ['ELIGIBLE', 'VERIFIED'].includes(m.fdCard?.status);
        const matchesFd = fdFilter === 'all' ||
            (fdFilter === 'done' && isFdDone) ||
            (fdFilter === 'pending' && !isFdDone);
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query ||
            m.fullName?.toLowerCase().includes(query) ||
            m.mlmCode?.toLowerCase().includes(query) ||
            m.mobile?.includes(query);
        return matchesFd && matchesSearch;
    });
    // Helper for FD Card Badge
    const renderFdCardBadge = (fdCard) => {
        const status = fdCard?.status || 'NOT_APPLIED';
        if (status === 'ELIGIBLE' || status === 'VERIFIED') {
            return (<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0"/>
          <span>FD Card: Active ✓</span>
        </span>);
        }
        if (status === 'PENDING' || status === 'UNDER_REVIEW') {
            return (<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600 shrink-0"/>
          <span>FD Card: In Review</span>
        </span>);
        }
        return (<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3 h-3 text-rose-600 shrink-0"/>
        <span>FD Card: Not Created</span>
      </span>);
    };
    // Current Focus Node for Visual Tree
    const currentFocusedNode = treeHistory.length > 0 ? treeHistory[treeHistory.length - 1] : {
        nodeId: currentNode?._id,
        member: member,
        isRoot: true,
        relativeLevel: 0,
    };
    // Find 3 direct slots under currentFocusedNode
    const focusedNodeIdStr = (currentFocusedNode.nodeId || currentFocusedNode._id)?.toString();
    const slotsUnderFocused = [1, 2, 3].map((pos) => {
        if (treeHistory.length === 0) {
            // Find from allDownlineList first (has full fdCard), fallback to directChildren
            const foundDownline = allDownlineList.find((d) => d.relativeLevel === 1 && d.positionInParent === pos);
            const foundChild = directChildren?.find((c) => c.positionInParent === pos);
            const memObj = foundDownline ? {
                _id: foundDownline.memberId || foundDownline._id,
                fullName: foundDownline.fullName,
                mlmCode: foundDownline.mlmCode,
                mobile: foundDownline.mobile,
                status: foundDownline.status,
                platformFeePaid: foundDownline.platformFeePaid,
                kycStatus: foundDownline.kycStatus,
                fdCard: foundDownline.fdCard,
                isDirect: foundDownline.isDirect,
            } : (foundChild?.memberId ? {
                ...foundChild.memberId,
                isDirect: true,
            } : null);
            return {
                position: pos,
                node: foundDownline || foundChild,
                member: memObj,
                nodeId: foundDownline?.nodeId || foundChild?._id,
                relativeLevel: 1,
                filledAt: foundDownline?.joinedAt || foundChild?.filledAt,
            };
        }
        else {
            const found = allDownlineList.find((d) => d.parentNodeId?.toString() === focusedNodeIdStr && d.positionInParent === pos);
            return {
                position: pos,
                node: found,
                member: found ? {
                    _id: found.memberId || found._id,
                    fullName: found.fullName,
                    mlmCode: found.mlmCode,
                    mobile: found.mobile,
                    status: found.status,
                    platformFeePaid: found.platformFeePaid,
                    kycStatus: found.kycStatus,
                    fdCard: found.fdCard,
                    isDirect: found.isDirect,
                } : null,
                nodeId: found?.nodeId,
                relativeLevel: found?.relativeLevel,
                filledAt: found?.joinedAt,
            };
        }
    });
    const handleDrillDown = (slotItem) => {
        if (!slotItem.member || !slotItem.nodeId)
            return;
        setTreeHistory((prev) => [
            ...prev,
            {
                nodeId: slotItem.nodeId,
                member: slotItem.member,
                isRoot: false,
                relativeLevel: slotItem.relativeLevel,
            }
        ]);
    };
    const handleBreadcrumbClick = (index) => {
        if (index === -1) {
            setTreeHistory([]);
        }
        else {
            setTreeHistory((prev) => prev.slice(0, index + 1));
        }
    };
    return (<MlmMemberLayout activePath="/nextview/network">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>3×15 Network Visualizer</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore your entire 15-level network tree, downline placements, and FD-Card status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600"/>
              <span>3×15 Matrix Tree</span>
            </span>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Currently Filling Level */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-1">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Filling Level</span>
            <div className={`text-lg sm:text-2xl font-black ${allLevelsComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
              {allLevelsComplete ? 'Complete! 🎉' : `Level ${activeLevel}`}
            </div>
            {!allLevelsComplete ? (<>
                <div className="text-[11px] sm:text-xs text-slate-400 truncate">
                  {activeLevelFilled}/{activeLevelCapacity} filled (3^{activeLevel}={activeLevelCapacity})
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1">
                  <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${Math.min(100, Math.round((activeLevelFilled / activeLevelCapacity) * 100))}%` }}/>
                </div>
              </>) : (<div className="text-[11px] text-emerald-600 font-semibold">15 levels full!</div>)}
          </div>

          {/* Card 2: Total Downline Members */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-1">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Total Downline</span>
            <div className="text-lg sm:text-2xl font-black text-slate-900">{totalDownlineCount}</div>
            <div className="text-[11px] sm:text-xs text-slate-400">Active matrix nodes</div>
          </div>

          {/* Card 3: Direct Sponsored */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-1">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Direct Referrals</span>
            <div className="text-lg sm:text-2xl font-black text-purple-600">{directList.length}</div>
            <div className="text-[11px] sm:text-xs text-slate-400">Via your referral ID</div>
          </div>

          {/* Card 4: FD Card Progress */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-1">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">FD Card Status</span>
            <div className="text-lg sm:text-2xl font-black text-emerald-600">
              {fdDoneCount} <span className="text-xs font-normal text-slate-400">/ {totalDownlineCount}</span>
            </div>
            <div className="text-[11px] text-rose-500 font-bold">
              {fdPendingCount} Pending Action
            </div>
          </div>
        </div>

        {/* ── INTERACTIVE VISUAL TREE EXPLORER ───────────────────────────────── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs space-y-6">
          {/* Visualizer Header & Breadcrumbs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Network className="w-4 h-4 text-amber-600"/>
                <span>Interactive Tree Structure</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Click on any member slot to drill down and inspect their 3 direct sub-slots.
              </p>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button type="button" onClick={() => handleBreadcrumbClick(-1)} className={`px-2.5 py-1 rounded-lg font-bold transition ${treeHistory.length === 0
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                You (Root)
              </button>

              {treeHistory.map((h, idx) => {
            const isLast = idx === treeHistory.length - 1;
            return (<React.Fragment key={idx}>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400"/>
                    <button type="button" onClick={() => handleBreadcrumbClick(idx)} className={`px-2.5 py-1 rounded-lg font-bold transition truncate max-w-[120px] ${isLast
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {h.member?.fullName}
                    </button>
                  </React.Fragment>);
        })}

              {treeHistory.length > 0 && (<button type="button" onClick={() => handleBreadcrumbClick(-1)} className="ml-1 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition">
                  <ArrowLeft className="w-3 h-3"/>
                  <span>Back to Root</span>
                </button>)}
            </div>
          </div>

          {/* Focused Parent Node Card */}
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 max-w-sm w-full text-center relative">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/20 text-white uppercase tracking-wider">
                {currentFocusedNode.isRoot ? 'Your Matrix Root' : `Level ${currentFocusedNode.relativeLevel} Parent`}
              </span>
              <div className="text-sm sm:text-base font-black text-white mt-1">{currentFocusedNode.member?.fullName}</div>
              <div className="text-xs font-mono font-bold text-amber-100 mt-0.5">{currentFocusedNode.member?.mlmCode}</div>
              {currentFocusedNode.member?.mobile && (<div className="text-[11px] text-amber-100/90 mt-0.5 font-mono">
                  Mobile: {formatMobile(currentFocusedNode.member?.mobile, true)}
                </div>)}
            </div>
          </div>

          {/* Tree Connectors */}
          <div className="flex justify-center items-center py-1">
            <div className="w-1 h-6 bg-amber-400 rounded-full"/>
          </div>

          {/* 3 Direct Slots under Focused Node */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slotsUnderFocused.map((slotItem) => {
            const childMember = slotItem.member;
            const hasGrandchildren = childMember && allDownlineList.some((d) => d.parentNodeId?.toString() === slotItem.nodeId?.toString());
            return (<div key={slotItem.position} className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between items-center text-center min-h-[200px] transition group ${childMember
                    ? 'bg-amber-50/50 border-amber-200 shadow-2xs hover:border-amber-400 hover:shadow-xs'
                    : 'bg-slate-50 border-dashed border-slate-200 text-slate-400'}`}>
                  {/* Slot Top Bar */}
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-200/60 pb-2">
                    <span className="font-mono">Slot #{slotItem.position}</span>
                    <div className="flex items-center gap-1.5">
                      {slotItem.relativeLevel && (<span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-slate-200 text-slate-700">
                          L{slotItem.relativeLevel}
                        </span>)}
                      <span className={childMember ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}>
                        {childMember ? 'Active' : 'Vacant'}
                      </span>
                    </div>
                  </div>

                  {/* Slot Body */}
                  {childMember ? (<div className="my-2 space-y-1.5 w-full">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-black text-sm shadow-xs">
                        {childMember.fullName?.charAt(0)}
                      </div>
                      <div className="text-sm font-black text-slate-900 truncate px-2">{childMember.fullName}</div>
                      <div className="text-xs font-mono text-amber-700 font-bold">{childMember.mlmCode}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Mobile: {formatMobile(childMember.mobile, childMember.isDirect)}
                      </div>

                      {/* FD Status in slot */}
                      <div className="pt-0.5">
                        {renderFdCardBadge(childMember.fdCard)}
                      </div>

                      {/* Drill-down button */}
                      <button type="button" onClick={() => handleDrillDown(slotItem)} className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-800 hover:text-white border border-amber-500/20 text-[11px] font-bold transition">
                        <Eye className="w-3 h-3"/>
                        <span>Inspect Sub-slots</span>
                        {hasGrandchildren && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>}
                      </button>
                    </div>) : (<div className="my-auto py-4 space-y-1">
                      <UserX className="w-6 h-6 text-slate-300 mx-auto"/>
                      <p className="text-xs text-slate-400">Available slot for spillover placement</p>
                    </div>)}

                  {/* Slot Footer */}
                  <div className="w-full pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                    {slotItem.filledAt ? `Placed on ${new Date(slotItem.filledAt).toLocaleDateString('en-IN')}` : 'Slot Available'}
                  </div>
                </div>);
        })}
          </div>
        </div>

        {/* ── DOWNLINE & REFERRALS COMPREHENSIVE TABLES & MOBILE CARDS ──────── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs space-y-5">
          {/* Tabs & Search Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full sm:w-fit">
              <button type="button" onClick={() => setActiveTab('all')} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${activeTab === 'all'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-500 hover:text-slate-800'}`}>
                <Layers className="w-3.5 h-3.5 text-amber-600"/>
                <span>All Downline</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-800">
                  {allDownlineList.length}
                </span>
              </button>

              <button type="button" onClick={() => setActiveTab('direct')} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${activeTab === 'direct'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-500 hover:text-slate-800'}`}>
                <Users className="w-3.5 h-3.5 text-purple-600"/>
                <span>Direct Sponsored</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-purple-500/15 text-purple-800">
                  {directList.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search member, ID, mobile..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"/>
            </div>
          </div>

          {/* Filter Bar (Level Filter + FD Filter) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
            {/* Level Filter Chips (Only for 'all' tab) */}
            {activeTab === 'all' && uniqueLevels.length > 0 && (<div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3"/>
                  <span>Level:</span>
                </span>

                <button type="button" onClick={() => setSelectedLevelFilter('all')} className={`px-2.5 py-1 rounded-xl font-bold transition text-[11px] sm:text-xs ${selectedLevelFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  All ({allDownlineList.length})
                </button>

                {uniqueLevels.map((lvl) => {
                const count = allDownlineList.filter((m) => m.relativeLevel === lvl).length;
                return (<button key={lvl} type="button" onClick={() => setSelectedLevelFilter(lvl)} className={`px-2.5 py-1 rounded-xl font-bold transition text-[11px] sm:text-xs ${selectedLevelFilter === lvl
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      L{lvl} ({count})
                    </button>);
            })}
              </div>)}

            {/* FD Status Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs overflow-x-auto">
              <span className="text-[10px] font-black uppercase text-slate-400 px-1.5 shrink-0">FD Card:</span>
              <button type="button" onClick={() => setFdFilter('all')} className={`px-2 py-0.5 rounded-lg font-bold transition shrink-0 ${fdFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}>
                All
              </button>
              <button type="button" onClick={() => setFdFilter('done')} className={`px-2 py-0.5 rounded-lg font-bold transition shrink-0 ${fdFilter === 'done' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:bg-emerald-50'}`}>
                Done ({fdDoneCount})
              </button>
              <button type="button" onClick={() => setFdFilter('pending')} className={`px-2 py-0.5 rounded-lg font-bold transition shrink-0 ${fdFilter === 'pending' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-700 hover:bg-rose-50'}`}>
                Not Created ({fdPendingCount})
              </button>
            </div>
          </div>

          {/* ── TAB 1: ALL NETWORK DOWNLINE MEMBERS ─────────────────────────── */}
          {activeTab === 'all' && (<div>
              {filteredDownline.length === 0 ? (<div className="text-center py-10 space-y-2">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto"/>
                  <p className="text-xs font-bold text-slate-600">No downline members found</p>
                  <p className="text-[11px] text-slate-400">
                    {searchQuery ? 'Try adjusting your search criteria or level filter.' : 'Members joining in your matrix downline will appear here.'}
                  </p>
                </div>) : (<>
                  {/* Desktop Table View (md: and above) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pl-2">Member</th>
                          <th className="pb-3">Matrix Level</th>
                          <th className="pb-3">Placement Position</th>
                          <th className="pb-3">Introduced By</th>
                          <th className="pb-3">FD Card Status</th>
                          <th className="pb-3">Joined Date</th>
                          <th className="pb-3 text-right pr-2">Inspect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredDownline.map((m) => (<tr key={m.nodeId || m._id} className="hover:bg-slate-50/70 transition">
                            {/* Member Details */}
                            <td className="py-3.5 pl-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                  {m.fullName?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                    <span>{m.fullName}</span>
                                    {m.isDirect && (<span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">
                                        Direct
                                      </span>)}
                                  </div>
                                  <div className="text-[11px] font-mono text-amber-700 font-semibold">{m.mlmCode}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{formatMobile(m.mobile, m.isDirect)}</div>
                                </div>
                              </div>
                            </td>

                            {/* Relative Matrix Level */}
                            <td className="py-3.5">
                              <span className={`px-2.5 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 ${m.relativeLevel === 1
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : m.relativeLevel === 2
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : m.relativeLevel === 3
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-purple-50 text-purple-800 border border-purple-200'}`}>
                                <span>Level {m.relativeLevel}</span>
                              </span>
                            </td>

                            {/* Placed Under */}
                            <td className="py-3.5">
                              <div className="font-bold text-slate-800 text-[11px]">
                                {m.placedUnder?.fullName || 'Root'}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Slot #{m.positionInParent} • {m.placedUnder?.mlmCode || ''}
                              </div>
                            </td>

                            {/* Introduced By / Sponsor */}
                            <td className="py-3.5">
                              <div className="font-extrabold text-slate-800 text-[11px]">
                                {m.sponsor?.fullName || 'Root'}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {m.sponsor?.mlmCode || ''}
                              </div>
                            </td>

                            {/* FD Card Status */}
                            <td className="py-3.5">
                              {renderFdCardBadge(m.fdCard)}
                            </td>

                            {/* Joined Date */}
                            <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                              {new Date(m.joinedAt).toLocaleDateString('en-IN')}
                            </td>

                            {/* Tree Focus Action */}
                            <td className="py-3.5 text-right pr-2">
                              <button type="button" onClick={() => {
                        setTreeHistory([
                            {
                                nodeId: m.nodeId,
                                member: m,
                                isRoot: false,
                                relativeLevel: m.relativeLevel,
                            }
                        ]);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                    }} className="p-1.5 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-700 transition" title="Inspect in Visual Tree">
                                <Eye className="w-4 h-4"/>
                              </button>
                            </td>
                          </tr>))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View (< md) */}
                  <div className="block md:hidden space-y-3">
                    {filteredDownline.map((m) => (<div key={m.nodeId || m._id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                        {/* Mobile Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {m.fullName?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 flex-wrap">
                                <span>{m.fullName}</span>
                                {m.isDirect && (<span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">
                                    Direct
                                  </span>)}
                              </div>
                              <div className="text-[11px] font-mono text-amber-700 font-bold">{m.mlmCode}</div>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-lg text-xs font-black shrink-0 ${m.relativeLevel === 1
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : m.relativeLevel === 2
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : m.relativeLevel === 3
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-purple-50 text-purple-800 border border-purple-200'}`}>
                            Level {m.relativeLevel}
                          </span>
                        </div>

                        {/* Mobile Details Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile</span>
                            <span className="font-mono text-slate-700 font-semibold">{formatMobile(m.mobile, m.isDirect)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Introduced By</span>
                            <span className="font-bold text-slate-800 truncate block">{m.sponsor?.fullName || 'Root'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Placement</span>
                            <span className="text-slate-700 truncate block">Slot #{m.positionInParent} under {m.placedUnder?.fullName || 'Root'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Joined Date</span>
                            <span className="font-mono text-slate-500">{new Date(m.joinedAt).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Mobile Bottom Bar: FD Status & Inspect */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                          {renderFdCardBadge(m.fdCard)}

                          <button type="button" onClick={() => {
                        setTreeHistory([
                            {
                                nodeId: m.nodeId,
                                member: m,
                                isRoot: false,
                                relativeLevel: m.relativeLevel,
                            }
                        ]);
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                    }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-amber-700 text-xs font-bold transition shadow-2xs">
                            <Eye className="w-3.5 h-3.5 text-amber-600"/>
                            <span>Inspect</span>
                          </button>
                        </div>
                      </div>))}
                  </div>
                </>)}
            </div>)}

          {/* ── TAB 2: DIRECTLY SPONSORED MEMBERS ─────────────────────────── */}
          {activeTab === 'direct' && (<div>
              {filteredDirect.length === 0 ? (<div className="text-center py-10 space-y-2">
                  <Users className="w-10 h-10 text-slate-300 mx-auto"/>
                  <p className="text-xs font-bold text-slate-600">No directly sponsored members found</p>
                  <p className="text-[11px] text-slate-400">Share your personal referral link to recruit new members.</p>
                </div>) : (<>
                  {/* Desktop Table View (md: and above) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pl-2">Member Name</th>
                          <th className="pb-3">Member ID</th>
                          <th className="pb-3">Matrix Level</th>
                          <th className="pb-3">Mobile (Direct)</th>
                          <th className="pb-3">FD Card Status</th>
                          <th className="pb-3">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredDirect.map((m) => (<tr key={m._id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 pl-2 font-extrabold text-slate-900">{m.fullName}</td>
                            <td className="py-3.5 font-mono text-amber-700 font-bold">{m.mlmCode}</td>
                            <td className="py-3.5">
                              {m.relativeLevel ? (<span className="px-2 py-0.5 rounded-lg text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
                                  Level {m.relativeLevel}
                                </span>) : (<span className="text-[11px] text-slate-400">Pending Placement</span>)}
                            </td>
                            <td className="py-3.5 text-slate-700 font-mono font-semibold">{formatMobile(m.mobile, true)}</td>
                            <td className="py-3.5">
                              {renderFdCardBadge(m.fdCard)}
                            </td>
                            <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                              {new Date(m.joinedAt).toLocaleDateString('en-IN')}
                            </td>
                          </tr>))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View (< md) */}
                  <div className="block md:hidden space-y-3">
                    {filteredDirect.map((m) => (<div key={m._id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-extrabold text-sm text-slate-900">{m.fullName}</div>
                            <div className="text-[11px] font-mono text-amber-700 font-bold">{m.mlmCode}</div>
                          </div>
                          {m.relativeLevel ? (<span className="px-2 py-0.5 rounded-lg text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
                              Level {m.relativeLevel}
                            </span>) : (<span className="text-[10px] text-slate-400">Pending Placement</span>)}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile (Direct)</span>
                            <span className="font-mono text-slate-800 font-bold">{formatMobile(m.mobile, true)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Joined Date</span>
                            <span className="font-mono text-slate-500">{new Date(m.joinedAt).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60">
                          {renderFdCardBadge(m.fdCard)}
                        </div>
                      </div>))}
                  </div>
                </>)}
            </div>)}
        </div>
      </div>
    </MlmMemberLayout>);
}
