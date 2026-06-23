import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Users, AlertOctagon, AlertTriangle, Activity, 
  ArrowUpRight, ShieldCheck, HelpCircle, Network, TrendingDown, Clock
} from 'lucide-react';
import { Customer, Domain, DOMAIN_COLORS, RISK_COLORS } from '../data';

interface OverviewTabProps {
  customers: Customer[];
  allDatasets: Record<Domain, Customer[]>;
  activeDomain: Domain;
  onAnalyzeCustomer: (customer: Customer) => void;
}

export default function OverviewTab({ 
  customers, 
  allDatasets,
  activeDomain, 
  onAnalyzeCustomer 
}: OverviewTabProps) {
  
  // Calculations
  const metrics = useMemo(() => {
    const total = customers.length;
    const high = customers.filter(c => c.risk === 'HIGH').length;
    const med = customers.filter(c => c.risk === 'MEDIUM').length;
    const low = customers.filter(c => c.risk === 'LOW').length;
    const avgScore = customers.reduce((sum, c) => sum + c.churn_score, 0) / (total || 1);
    
    return {
      total,
      high,
      highPct: (high / (total || 1)) * 100,
      med,
      medPct: (med / (total || 1)) * 100,
      low,
      lowPct: (low / (total || 1)) * 100,
      avgScore
    };
  }, [customers]);

  // Chart 1: Risk Distribution Pie Data
  const riskPieData = useMemo(() => {
    return [
      { name: 'HIGH', value: metrics.high, color: RISK_COLORS.HIGH },
      { name: 'MEDIUM', value: metrics.med, color: RISK_COLORS.MEDIUM },
      { name: 'LOW', value: metrics.low, color: RISK_COLORS.LOW },
    ].filter(item => item.value > 0);
  }, [metrics]);

  // Chart 2: Churn Score Histogram Data
  const scoreHistogramData = useMemo(() => {
    // 10 bins: 0-10, 10-20, ..., 90-100
    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${(i + 1) * 10}`,
      count: 0,
    }));
    
    customers.forEach(c => {
      const binIdx = Math.min(9, Math.floor(c.churn_score / 10));
      bins[binIdx].count++;
    });
    
    return bins;
  }, [customers]);

  // Chart 3: Domain Comparison Bar Data
  const domainComparisonData = useMemo(() => {
    return Object.entries(allDatasets).map(([dom, list]) => {
      const avg = list.reduce((sum, c) => sum + c.churn_score, 0) / (list.length || 1);
      return {
        name: dom,
        avgScore: parseFloat(avg.toFixed(1)),
        color: DOMAIN_COLORS[dom as Domain]
      };
    });
  }, [allDatasets]);

  // Feature detection states based on active domain data
  const hasSentiment = useMemo(() => customers.some(c => c.sent_slope !== 0), [customers]);
  const hasSocialGraph = useMemo(() => customers.some(c => c.pagerank_score > 0), [customers]);
  const hasMicroMoment = useMemo(() => customers.some(c => c.micro_risk_score > 0), [customers]);

  const activeColor = DOMAIN_COLORS[activeDomain];

  // Custom tooltips for enhanced metrics & precise data points upon hover
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalCount = riskPieData.reduce((acc: number, cur: any) => acc + cur.value, 0);
      const percentage = ((data.value / (totalCount || 1)) * 100).toFixed(1);
      return (
        <div className="bg-[#070D16] border border-[#2A4A5A] p-3 rounded-lg shadow-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="text-white">{data.name} Risk Profile</span>
          </div>
          <div className="text-slate-300 font-medium">
            Customers: <span className="text-white font-bold">{data.value}</span>
          </div>
          <div className="text-slate-400 font-mono text-[10px]">
            Share: <span className="text-[#14A899] font-bold">{percentage}%</span> of active set
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomHistogramTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalCount = customers.length;
      const percentage = ((data.count / (totalCount || 1)) * 100).toFixed(1);
      
      const lowerBound = parseInt(data.range.split('-')[0]);
      let rangeColor = '#1D9E75';
      let riskLabel = 'Low Churn Probability';
      if (lowerBound >= 70) {
        rangeColor = '#E05252';
        riskLabel = 'Critical Retention Alert';
      } else if (lowerBound >= 40) {
        rangeColor = '#BA7517';
        riskLabel = 'Moderate Concern';
      }

      return (
        <div className="bg-[#070D16] border border-[#2A4A5A] p-3 rounded-lg shadow-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold" style={{ color: rangeColor }}>
            <span>Score Segment: {data.range}%</span>
          </div>
          <div className="text-slate-300 font-medium">
            Volume: <span className="text-white font-bold">{data.count} customers</span>
          </div>
          <div className="text-slate-400 font-mono text-[10px]">
            Density: <span className="text-[#14A899] font-bold">{percentage}%</span> of cohort
          </div>
          <div className="text-[10px] text-slate-500 pt-0.5 border-t border-[#1A2E42] mt-1">
            Status: <span className="font-semibold text-slate-300">{riskLabel}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDomainTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isCurrent = data.name === activeDomain;
      
      return (
        <div className="bg-[#070D16] border border-[#2A4A5A] p-3 rounded-lg shadow-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="text-white">{data.name} Portfolio</span>
          </div>
          <div className="text-slate-300 font-medium">
            Avg Churn Risk: <span className="text-white font-bold">{data.avgScore}%</span>
          </div>
          <div className="text-slate-400 text-[10px] pt-1 border-t border-[#1A2E42] mt-1">
            {isCurrent ? (
              <span className="text-[#14A899] font-bold font-mono">● Active Workspace Context</span>
            ) : (
              <span className="text-slate-500 font-mono">Click domain menu to switch views</span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="kpi-card glass rounded-xl p-5 glow-teal" style={{'--accent':'#14A899'} as React.CSSProperties}>
          <p className="text-[11px] text-[#8FA3B1] uppercase tracking-widest font-semibold mb-2">Total Customers</p>
          <div className="text-3xl font-black text-white">{metrics.total.toLocaleString()}</div>
          <p className="text-[11px] text-[#1D9E75] mt-2 flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
            Active in pipeline
          </p>
        </div>

        <div className="kpi-card glass rounded-xl p-5 glow-red" style={{'--accent':'#E05252'} as React.CSSProperties}>
          <p className="text-[11px] text-[#8FA3B1] uppercase tracking-widest font-semibold mb-2">High Risk</p>
          <div className="text-3xl font-black text-[#E05252]">{metrics.high.toLocaleString()}</div>
          <div className="mt-2 h-1 w-full bg-[#0D1B2A] rounded-full overflow-hidden">
            <div className="h-full bg-[#E05252] rounded-full transition-all duration-700" style={{ width: `${metrics.highPct}%` }} />
          </div>
          <p className="text-[11px] text-[#8FA3B1] mt-1">{metrics.highPct.toFixed(1)}% of total</p>
        </div>

        <div className="kpi-card glass rounded-xl p-5 glow-amber" style={{'--accent':'#BA7517'} as React.CSSProperties}>
          <p className="text-[11px] text-[#8FA3B1] uppercase tracking-widest font-semibold mb-2">Medium Risk</p>
          <div className="text-3xl font-black text-[#BA7517]">{metrics.med.toLocaleString()}</div>
          <div className="mt-2 h-1 w-full bg-[#0D1B2A] rounded-full overflow-hidden">
            <div className="h-full bg-[#BA7517] rounded-full transition-all duration-700" style={{ width: `${metrics.medPct}%` }} />
          </div>
          <p className="text-[11px] text-[#8FA3B1] mt-1">{metrics.medPct.toFixed(1)}% of total</p>
        </div>

        <div className="kpi-card glass rounded-xl p-5" style={{'--accent':'#534AB7'} as React.CSSProperties}>
          <p className="text-[11px] text-[#8FA3B1] uppercase tracking-widest font-semibold mb-2">Avg Churn Score</p>
          <div className="text-3xl font-black text-white">{metrics.avgScore.toFixed(1)}%</div>
          <div className="mt-2 h-1 w-full bg-[#0D1B2A] rounded-full overflow-hidden">
            <div className="h-full bg-[#534AB7] rounded-full transition-all duration-700" style={{ width: `${metrics.avgScore}%` }} />
          </div>
          <p className="text-[11px] text-[#8FA3B1] mt-1">Cross-domain average</p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Risk Pie */}
        <div className="glass rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-white font-semibold text-base mb-1">Risk Distribution</h4>
            <p className="text-xs text-[#8FA3B1]">Proportion of high, mid and low risk accounts</p>
          </div>
          <div className="h-60 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-[#8FA3B1] font-medium">High Risk</span>
              <span className="text-2xl font-bold text-[#E05252]">{metrics.highPct.toFixed(0)}%</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS.HIGH }} />
              <span className="text-[#E0E0E0]">High ({metrics.high})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS.MEDIUM }} />
              <span className="text-[#E0E0E0]">Med ({metrics.med})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS.LOW }} />
              <span className="text-[#E0E0E0]">Low ({metrics.low})</span>
            </div>
          </div>
        </div>

        {/* Churn Score Histogram */}
        <div className="glass rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-white font-semibold text-base mb-1">Churn Score Histogram</h4>
            <p className="text-xs text-[#8FA3B1]">Distribution frequency of churn probability scores</p>
          </div>
          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreHistogramData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A4A5A" opacity={0.3} />
                <XAxis dataKey="range" stroke="#8FA3B1" fontSize={10} tickLine={false} />
                <YAxis stroke="#8FA3B1" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomHistogramTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar dataKey="count" fill={activeColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center text-xs text-[#8FA3B1] px-1 border-t border-[#2A4A5A]/50 pt-3">
            <div className="flex items-center gap-1">
              <span className="text-[#E05252]">🔴</span>
              <span>High Risk Threshold &gt;70%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#BA7517]">🟡</span>
              <span>Medium Threshold &gt;40%</span>
            </div>
          </div>
        </div>

        {/* Domain Comparison */}
        <div className="glass rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-white font-semibold text-base mb-1">Cross-Domain Risk Profile</h4>
            <p className="text-xs text-[#8FA3B1]">Average Churn scores compared across products</p>
          </div>
          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={domainComparisonData} 
                layout="vertical"
                margin={{ top: 10, right: 25, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2A4A5A" opacity={0.3} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#8FA3B1" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#8FA3B1" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomDomainTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar 
                  dataKey="avgScore" 
                  radius={[0, 4, 4, 0]}
                  label={{ position: 'right', fill: '#E0E0E0', fontSize: 10 }}
                >
                  {domainComparisonData.map((entry, index) => {
                    const isSelected = entry.name === activeDomain;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        fillOpacity={isSelected ? 1 : 0.4}
                        stroke={entry.color}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-[#8FA3B1] pt-2">
            <span>Glowing bar indicates current active domain context</span>
          </div>
        </div>

      </div>

      {/* Innovation Feature Pills */}
      <div className="glass rounded-xl p-5 shadow-lg">
        <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <span className="text-base">🔥</span> Domain Intelligence Framework
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="bg-[#060E1A] p-4 rounded-xl border border-[#2A4A5A]/40 flex items-start gap-3 hover:border-[#14A899]/30 transition-all">
            <div className={`p-2 rounded-lg ${hasSentiment ? 'bg-[#14A899]/10 text-[#14A899]' : 'bg-slate-800 text-slate-500'}`}>
              <TrendingDown size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white text-xs font-semibold">Sentiment Trajectory</span>
                {hasSentiment && <span className="h-1.5 w-1.5 rounded-full bg-[#14A899] animate-pulse" />}
              </div>
              <p className="text-[11px] text-[#8FA3B1] mt-0.5">Conversational slope tracking.</p>
            </div>
          </div>

          <div className="bg-[#060E1A] p-4 rounded-xl border border-[#2A4A5A]/40 flex items-start gap-3 hover:border-indigo-500/30 transition-all">
            <div className={`p-2 rounded-lg ${hasSocialGraph ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
              <Network size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white text-xs font-semibold">Social Graph</span>
                {hasSocialGraph && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />}
              </div>
              <p className="text-[11px] text-[#8FA3B1] mt-0.5">Network contagion factors.</p>
            </div>
          </div>

          <div className="bg-[#060E1A] p-4 rounded-xl border border-[#2A4A5A]/40 flex items-start gap-3 hover:border-[#E05252]/30 transition-all">
            <div className={`p-2 rounded-lg ${hasMicroMoment ? 'bg-[#E05252]/10 text-[#E05252]' : 'bg-slate-800 text-slate-500'}`}>
              <Clock size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white text-xs font-semibold">Micro-Moment</span>
                {hasMicroMoment && <span className="h-1.5 w-1.5 rounded-full bg-[#E05252] animate-pulse" />}
              </div>
              <p className="text-[11px] text-[#8FA3B1] mt-0.5">Real-time event chains.</p>
            </div>
          </div>

          <div className="bg-[#060E1A] p-4 rounded-xl border border-[#2A4A5A]/40 flex items-start gap-3 hover:border-[#1D9E75]/30 transition-all">
            <div className="p-2 rounded-lg bg-[#1D9E75]/10 text-[#1D9E75]">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white text-xs font-semibold">DiCE What-If</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
              </div>
              <p className="text-[11px] text-[#8FA3B1] mt-0.5">Retention prescriptions.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Top At-Risk Table */}
      <div className="glass rounded-xl p-5 shadow-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div>
            <h4 className="text-white font-bold text-sm">🚨 Top 10 At-Risk Customers</h4>
            <p className="text-[11px] text-[#8FA3B1] mt-0.5">Ranked by churn probability index</p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#E05252]/10 text-[#E05252] border border-[#E05252]/20">
            Action Required
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2A4A5A] text-[#8FA3B1] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Cust ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Tenure</th>
                <th className="py-3 px-4">Spend</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Inactivity</th>
                <th className="py-3 px-4 text-center">Churn Score</th>
                <th className="py-3 px-4 text-center">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A4A5A]/30 text-slate-300">
              {customers.slice(0, 10).map((c, idx) => (
                <tr key={c.id} className="hover:bg-[#2A4A5A]/30 transition">
                  <td className="py-3 px-4 font-mono font-bold text-[#8FA3B1]">{c.id}</td>
                  <td className="py-3 px-4 font-medium text-white">{c.name}</td>
                  <td className="py-3 px-4">{c.tenure} months</td>
                  <td className="py-3 px-4">₹{c.spend.toLocaleString()}</td>
                  <td className="py-3 px-4">{c.frequency} {activeDomain === 'Telecom' ? 'calls' : activeDomain === 'OTT' ? 'plays' : 'orders'}/mo</td>
                  <td className="py-3 px-4 text-[#BA7517] font-semibold">{c.days_inactive} days</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-bold text-[#E0E0E0]">{c.churn_score}%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span 
                      className="px-2 py-0.5 rounded-full font-bold text-[10px] inline-block tracking-wider"
                      style={{ 
                        backgroundColor: `${RISK_COLORS[c.risk]}22`, 
                        color: RISK_COLORS[c.risk],
                        border: `1px solid ${RISK_COLORS[c.risk]}44`
                      }}
                    >
                      {c.risk}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => onAnalyzeCustomer(c)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#14A899] text-[#0A1628] font-bold hover:bg-[#14A899]/90 transition"
                    >
                      Analyse
                      <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
