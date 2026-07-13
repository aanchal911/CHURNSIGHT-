import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, BrainCircuit, Users2, Menu, X,
  Sparkles, TrendingUp, Presentation
} from 'lucide-react';
import {
  Domain, DOMAINS, DOMAIN_COLORS, Customer, RISK_COLORS
} from './data';
import { fetchCustomers, checkHealth } from './api';

import OverviewTab from './components/OverviewTab';
import PredictTab from './components/PredictTab';
import CustomerDetailTab from './components/CustomerDetailTab';
import InnovationsTab from './components/InnovationsTab';
import SegmentDriftTab from './components/SegmentDriftTab';
import BrandStrategyTab from './components/BrandStrategyTab';

type Page = 'Overview' | 'Predict' | 'CustomerDetail' | 'Innovations' | 'SegmentDrift' | 'BrandStrategy';

export default function App() {
  const [activeDomain, setActiveDomain] = useState<Domain>('Telecom');
  const [activePage, setActivePage]     = useState<Page>('Overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer]   = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [allDatasets, setAllDatasets] = useState<Record<Domain, Customer[]>>({
    Telecom: [], Food: [], Ecommerce: [], OTT: []
  });
  const [loading, setLoading]     = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Check API health + load all domains on mount
  useEffect(() => {
    checkHealth().then(ok => setApiOnline(ok));
    DOMAINS.forEach(domain => {
      fetchCustomers(domain)
        .then(data => setAllDatasets(prev => ({ ...prev, [domain]: data })))
        .catch(() => {});
    });
  }, []);

  const reloadDomain = useCallback((domain: Domain) => {
    setLoading(true);
    fetchCustomers(domain)
      .then(data => { setAllDatasets(prev => ({ ...prev, [domain]: data })); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (allDatasets[activeDomain].length === 0) reloadDomain(activeDomain);
  }, [activeDomain]);

  const customers = useMemo(() => {
    const list = allDatasets[activeDomain] ?? [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(c => c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [allDatasets, activeDomain, searchQuery]);

  const handleAnalyzeCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setActivePage('CustomerDetail');
  };

  const handleClearSelectedCustomer = () => setSelectedCustomer(null);

  const activeColor = DOMAIN_COLORS[activeDomain];

  const apiStatus = apiOnline === null
    ? { color: '#BA7517', label: 'Connecting...' }
    : apiOnline
      ? { color: '#1D9E75', label: 'API Live' }
      : { color: '#E05252', label: 'API Offline' };

  const navItems: { page: Page; icon: React.ReactNode; label: string }[] = [
    { page: 'Overview',       icon: <BarChart3 size={15}/>,    label: '📊 Overview Console' },
    { page: 'Predict',        icon: <BrainCircuit size={15}/>, label: '🔮 Predict Batch CSV' },
    { page: 'CustomerDetail', icon: <Users2 size={15}/>,       label: '👤 Customer Analysis' },
    { page: 'Innovations',    icon: <Sparkles size={15}/>,     label: '💡 Innovations Hub' },
    { page: 'BrandStrategy',  icon: <Presentation size={15}/>, label: '💼 Brand Retention Hub' },
    { page: 'SegmentDrift',   icon: <TrendingUp size={15}/>,   label: '📈 Segment Drift' },
  ];

  const pageTitles: Record<Page, string> = {
    Overview:       `${activeDomain} Intelligence Dashboard`,
    Predict:        `${activeDomain} AI Prediction Console`,
    CustomerDetail: `${activeDomain} Risk Profile Analyzer`,
    Innovations:    `${activeDomain} Innovations Hub`,
    BrandStrategy:  `${activeDomain} Enterprise Brand Hub`,
    SegmentDrift:   `${activeDomain} Segment Drift Console`,
  };

  const pageDescs: Record<Page, string> = {
    Overview:       'Comprehensive cross-product health, key risk alerts, and customer lists.',
    Predict:        'Upload customer usage datasets for real-time churn predictions & annotations.',
    CustomerDetail: 'Simulate, analyze, and map retention solutions for individual customer profiles.',
    Innovations:    'Explore sentiment trajectory, social graph, micro-moment, and DiCE explainability.',
    BrandStrategy:  'Interactive corporate pitch deck and myth-buster tools custom built for big brands.',
    SegmentDrift:   'Evaluate customer state migration dynamics over time using Markov matrices.',
  };

  return (
    <div className="min-h-screen bg-[#060E1A] bg-grid flex flex-col font-sans text-[#E0E0E0]">

      {/* Mobile Header */}
      <header className="lg:hidden bg-[#060E1A]/90 backdrop-blur border-b border-[#1A2E42]/60 h-14 px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <h1 className="text-lg font-black tracking-tight text-white">
            Churn<span className="text-[#14A899]">Sight</span>
          </h1>
        </div>
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 bg-[#1A2E42] text-[#8FA3B1] hover:text-white rounded-lg border border-[#2A4A5A]">
          {mobileSidebarOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </header>

      <div className="flex-1 flex flex-row relative">

        {/* Sidebar */}
        <aside className={`
          fixed lg:static top-14 lg:top-0 bottom-0 left-0 z-20
          w-64 bg-[#060E1A]/95 backdrop-blur-xl border-r border-[#1A2E42]/50 p-5 flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="space-y-5">

            {/* Logo */}
            <div className="hidden lg:flex items-center gap-3 pb-1">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#14A899] to-[#0F6E56] flex items-center justify-center text-lg shadow-lg glow-teal">
                🔥
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white leading-none">
                  Churn<span className="text-[#14A899]">Sight</span>
                </h1>
                <span className="text-[9px] text-[#8FA3B1] font-mono tracking-widest font-bold block mt-1 uppercase">
                  Multi-Domain Intelligence
                </span>
              </div>
            </div>

            <hr className="border-[#1A2E42]/60 hidden lg:block"/>

            {/* Nav */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#4A6A7A] uppercase tracking-widest block px-1 mb-2">
                Navigate
              </span>
              {navItems.map(item => (
                <button key={item.page}
                  onClick={() => { setActivePage(item.page); setMobileSidebarOpen(false); }}
                  className={`nav-active w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    activePage === item.page
                      ? 'bg-[#14A899]/10 text-[#14A899] border border-[#14A899]/20'
                      : 'text-[#8FA3B1] hover:text-white hover:bg-[#1A2E42]/40'
                  }`}>
                  <span className={activePage === item.page ? 'text-[#14A899]' : 'text-[#4A6A7A]'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {activePage === item.page && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#14A899] animate-pulse"/>}
                </button>
              ))}
            </div>

            <hr className="border-[#1A2E42]/60"/>

            {/* Search */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-[#4A6A7A] uppercase tracking-widest">Search</span>
                {searchQuery && <span className="text-[9px] font-mono font-bold text-[#14A899]">{customers.length} matched</span>}
              </div>
              <div className="relative">
                <input type="text" placeholder="Filter by ID or name..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1A2E42] border border-[#2A4A5A] rounded-lg px-3 py-2 pl-8 pr-7 text-xs text-white outline-none focus:border-[#14A899] transition-all placeholder-[#8FA3B1]/50"/>
                <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#8FA3B1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-[#8FA3B1] hover:text-white text-sm font-bold cursor-pointer">×</button>
                )}
              </div>
              {searchQuery && (
                <div className="bg-[#060E1A] border border-[#2A4A5A] rounded-lg max-h-44 overflow-y-auto divide-y divide-[#1A2E42]/50 shadow-2xl">
                  {customers.length === 0
                    ? <div className="p-3 text-[10px] text-[#8FA3B1] text-center">No matches found</div>
                    : customers.slice(0, 5).map(c => (
                        <button key={c.id} onClick={() => { handleAnalyzeCustomer(c); setMobileSidebarOpen(false); }}
                          className="w-full text-left p-2 hover:bg-[#1A2E42]/60 flex flex-col gap-0.5 transition cursor-pointer">
                          <div className="flex justify-between items-center gap-1">
                            <span className="font-bold text-white text-[11px] truncate">{c.name}</span>
                            <span className="text-[9px] font-mono text-[#14A899]">{c.id}</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-[#8FA3B1]">
                            <span>Risk: <strong style={{ color: RISK_COLORS[c.risk] }}>{c.risk}</strong></span>
                            <span>{c.churn_score}%</span>
                          </div>
                        </button>
                      ))
                  }
                  {customers.length > 5 && (
                    <div className="p-1.5 text-[8px] text-[#8FA3B1] text-center font-mono">+{customers.length - 5} more</div>
                  )}
                </div>
              )}
            </div>

            <hr className="border-[#1A2E42]/60"/>

            {/* Domain Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#4A6A7A] uppercase tracking-widest block px-1">Active Domain</span>
              <select value={activeDomain}
                onChange={e => { setActiveDomain(e.target.value as Domain); setSelectedCustomer(null); }}
                className="w-full bg-[#1A2E42] border border-[#2A4A5A] rounded-lg px-3 py-2 text-xs font-medium text-white outline-none cursor-pointer">
                {DOMAINS.map(d => <option key={d} value={d}>🏢 {d} Portfolio</option>)}
              </select>
            </div>

          </div>

          {/* Bottom status */}
          <div className="space-y-3 pt-4 border-t border-[#1A2E42]/60">
            {/* API health */}
            <div className="flex items-center gap-2 px-1">
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: apiStatus.color }}/>
              <span className="text-[10px] font-mono font-bold" style={{ color: apiStatus.color }}>{apiStatus.label}</span>
              {loading && <span className="text-[9px] text-[#8FA3B1] ml-auto animate-pulse">Loading...</span>}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DOMAINS.map(d => (
                <div key={d} className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${
                  d === activeDomain
                    ? 'bg-[#14A899]/10 border-[#14A899]/25 text-[#14A899]'
                    : 'bg-[#0D1B2A] border-[#1A2E42]/50 text-[#8FA3B1]'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                    allDatasets[d].length > 0 ? 'bg-[#1D9E75]' : 'bg-[#4A6A7A]'
                  }`}/>
                  <span className="text-[9px] font-medium truncate">{d}</span>
                  {allDatasets[d].length > 0 && (
                    <span className="text-[8px] font-mono ml-auto opacity-60">{allDatasets[d].length}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </aside>

        {mobileSidebarOpen && (
          <div onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 lg:hidden"/>
        )}

        {/* Main */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-7 space-y-6">

          {/* Header bar */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A2E42]/50 pb-5">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold tracking-tight text-white">{pageTitles[activePage]}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border"
                  style={{ color: activeColor, borderColor: `${activeColor}44`, backgroundColor: `${activeColor}15` }}>
                  {activeDomain.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#8FA3B1] mt-1.5">{pageDescs[activePage]}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                style={{ backgroundColor: `${apiStatus.color}10`, borderColor: `${apiStatus.color}30`, color: apiStatus.color }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: apiStatus.color }}/>
                <span className="font-semibold">{apiStatus.label}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#1A2E42] text-[#8FA3B1] px-3 py-1.5 rounded-full border border-[#2A4A5A]/60">
                <span>{customers.length} records</span>
              </div>
            </div>
          </section>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activePage}-${activeDomain}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activePage === 'Overview' && (
                <OverviewTab customers={customers} allDatasets={allDatasets}
                  activeDomain={activeDomain} onAnalyzeCustomer={handleAnalyzeCustomer}/>
              )}
              {activePage === 'Predict' && <PredictTab activeDomain={activeDomain}/>}
              {activePage === 'CustomerDetail' && (
                <CustomerDetailTab activeDomain={activeDomain}
                  selectedCustomer={selectedCustomer}
                  onClearSelectedCustomer={handleClearSelectedCustomer}/>
              )}
              {activePage === 'Innovations' && (
                <InnovationsTab customers={customers} activeDomain={activeDomain}/>
              )}
              {activePage === 'BrandStrategy' && <BrandStrategyTab activeDomain={activeDomain}/>}
              {activePage === 'SegmentDrift' && <SegmentDriftTab activeDomain={activeDomain}/>}
            </motion.div>
          </AnimatePresence>

        </main>
      </div>

      <footer className="bg-[#060E1A]/80 border-t border-[#1A2E42]/40 py-3 px-6 flex items-center justify-between text-[11px] text-[#4A6A7A]">
        <span>© 2026 <span className="text-[#14A899] font-semibold">ChurnSight</span> — Multi-Domain Churn Intelligence</span>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: apiStatus.color }}/>
          <span style={{ color: apiStatus.color }}>{apiStatus.label}</span>
        </div>
      </footer>

    </div>
  );
}
