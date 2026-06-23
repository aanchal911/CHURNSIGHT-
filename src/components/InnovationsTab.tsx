import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Brain, Network, Zap, Pill, ArrowRightLeft, 
  MessageSquare, Users, Sparkles, TrendingDown, RefreshCw, Layers
} from 'lucide-react';
import { Customer, Domain, DOMAIN_COLORS, RISK_COLORS } from '../data';

interface InnovationsTabProps {
  customers: Customer[];
  activeDomain: Domain;
}

export default function InnovationsTab({ customers, activeDomain }: InnovationsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'sentiment' | 'social' | 'micro' | 'dice'>('sentiment');

  // Chart 1: Sentiment Slope Double Histogram
  // Group slopes into bins (-1.0 to -0.8, -0.8 to -0.6, ..., 0.8 to 1.0)
  const sentimentHistogramData = useMemo(() => {
    const bins = Array.from({ length: 10 }, (_, i) => {
      const start = -1.0 + i * 0.2;
      const end = start + 0.2;
      return {
        range: `${start.toFixed(1)} to ${end.toFixed(1)}`,
        retainedCount: 0,
        churnedCount: 0,
      };
    });

    customers.forEach(c => {
      const idx = Math.min(9, Math.floor((c.sent_slope + 1.0) / 0.2));
      if (idx >= 0 && idx < 10) {
        if (c.churn_score >= 60) {
          bins[idx].churnedCount++;
        } else {
          bins[idx].retainedCount++;
        }
      }
    });

    return bins;
  }, [customers]);

  // Chart 2: PageRank vs Churn Scatter Data
  const socialScatterData = useMemo(() => {
    return customers.map(c => ({
      name: c.name,
      pagerank: c.pagerank_score * 1000, // amplify for visibility
      churnScore: c.churn_score,
      risk: c.risk,
      neighborRatio: c.churn_neighbor_ratio * 100
    }));
  }, [customers]);

  const activeColor = DOMAIN_COLORS[activeDomain];

  // Custom tooltips for enhanced metrics & precise data points upon hover
  const CustomSentimentTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data.retainedCount + data.churnedCount;
      const churnRate = total > 0 ? ((data.churnedCount / total) * 100).toFixed(0) : '0';
      
      return (
        <div className="bg-[#070D16] border border-[#2A4A5A] p-3 rounded-lg shadow-xl text-xs space-y-1">
          <div className="text-white font-bold border-b border-[#2A4A5A] pb-1 mb-1 font-mono">
            Slope Range: {data.range}
          </div>
          <div className="flex items-center gap-1.5 text-[#1D9E75] font-semibold">
            <span className="h-2 w-2 rounded-full bg-[#1D9E75]" />
            <span>Retained (Low Risk): {data.retainedCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#E05252] font-semibold">
            <span className="h-2 w-2 rounded-full bg-[#E05252]" />
            <span>At-Risk (High Risk): {data.churnedCount}</span>
          </div>
          {total > 0 && (
            <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1A2E42] mt-1 font-mono">
              Risk Concentration: <span className="text-[#E05252] font-bold">{churnRate}%</span> of range
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomSocialTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      let riskColor = '#1D9E75';
      if (data.risk === 'HIGH') riskColor = '#E05252';
      else if (data.risk === 'MEDIUM') riskColor = '#BA7517';

      return (
        <div className="bg-[#070D16] border border-[#2A4A5A] p-3 rounded-lg shadow-xl text-xs space-y-1.5 max-w-[220px]">
          <div className="text-white font-bold border-b border-[#2A4A5A] pb-1 truncate">
            {data.name}
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>PageRank (x1000):</span>
              <span className="font-mono font-bold text-indigo-400">{data.pagerank.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Churn Score:</span>
              <span className="font-mono font-bold text-white">{data.churnScore}%</span>
            </div>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Risk Tier:</span>
              <span className="font-bold font-mono" style={{ color: riskColor }}>{data.risk}</span>
            </div>
            <div className="flex justify-between text-slate-300 border-t border-[#1A2E42] pt-1 mt-1 text-[11px]">
              <span>Neighbors Churned:</span>
              <span className="font-mono text-[#14A899] font-bold">{data.neighborRatio.toFixed(0)}%</span>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 italic leading-snug">
            *High neighbor ratio triggers risk contagion ripples.
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors */}
      <div className="flex glass p-1.5 rounded-xl gap-1">
        
        <button 
          onClick={() => setActiveSubTab('sentiment')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'sentiment' ? 'bg-[#070D16] text-[#14A899] border border-[#2A4A5A]' : 'text-[#8FA3B1] hover:text-slate-200'
          }`}
        >
          <Brain size={16} />
          <span>🧠 Sentiment Trajectory</span>
        </button>

        <button 
          onClick={() => setActiveSubTab('social')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'social' ? 'bg-[#070D16] text-[#14A899] border border-[#2A4A5A]' : 'text-[#8FA3B1] hover:text-slate-200'
          }`}
        >
          <Network size={16} />
          <span>🕸️ Social PageRank</span>
        </button>

        <button 
          onClick={() => setActiveSubTab('micro')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'micro' ? 'bg-[#070D16] text-[#14A899] border border-[#2A4A5A]' : 'text-[#8FA3B1] hover:text-slate-200'
          }`}
        >
          <Zap size={16} />
          <span>⚡ Micro-Moment</span>
        </button>

        <button 
          onClick={() => setActiveSubTab('dice')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'dice' ? 'bg-[#070D16] text-[#14A899] border border-[#2A4A5A]' : 'text-[#8FA3B1] hover:text-slate-200'
          }`}
        >
          <Pill size={16} />
          <span>💊 DiCE Prescription</span>
        </button>

      </div>

      {/* Sub-Tab Contents */}
      {activeSubTab === 'sentiment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 glass rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-[#14A899]" size={20} />
                <h4 className="text-white font-semibold text-base">Sentiment Trajectory Scoring</h4>
              </div>
              <p className="text-xs text-[#E0E0E0] leading-relaxed">
                Standard machine learning engines only review isolated snapshot logs (e.g. "Customer X has spent ₹500"). 
                This leads to missed warning signs when a customer is privately frustrated.
              </p>
              <p className="text-xs text-[#8FA3B1] leading-relaxed">
                <strong>ChurnSight NLP Integration</strong> parses customer support tickets, online chatbot scripts, and reviews over time, 
                computing a time-series <strong>Sentiment Slope</strong>.
              </p>
              <div className="p-3 bg-[#E05252]/10 border border-[#E05252]/20 rounded-lg text-[11px] text-[#E05252]">
                <strong>💡 Early Warning Indicator:</strong> A highly negative slope (e.g. -0.8) indicates that complaints are escalating rapidly. 
                Even if their current subscription is active, they will likely cancel within 30 days!
              </div>
            </div>

            <div className="pt-4 border-t border-[#2A4A5A]/40 text-xs text-[#8FA3B1]">
              Technology: VADER NLP + Simple Time Series Linear Regression
            </div>
          </div>

          <div className="lg:col-span-2 glass rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-white font-semibold text-sm">Slope Distribution (Retained vs Churned)</h4>
                <p className="text-xs text-[#8FA3B1]">Notice how churned accounts heavily cluster in the negative slope territory</p>
              </div>
              <span className="text-[10px] font-mono text-[#8FA3B1]">All Database Samples</span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentHistogramData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A4A5A" />
                  <XAxis dataKey="range" stroke="#8FA3B1" fontSize={9} />
                  <YAxis stroke="#8FA3B1" fontSize={10} />
                  <Tooltip content={<CustomSentimentTooltip />} />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar name="Retained Customers (Low Score)" dataKey="retainedCount" fill="#1D9E75" radius={[3, 3, 0, 0]} />
                  <Bar name="At-Risk Customers (High Score)" dataKey="churnedCount" fill="#E05252" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'social' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 glass rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="text-[#14A899]" size={20} />
                <h4 className="text-white font-semibold text-base">Social Graph Contagion</h4>
              </div>
              <p className="text-xs text-[#E0E0E0] leading-relaxed">
                Customers are not isolated islands. They exist within rich community networks. 
                If a key influencer in a community churns, it triggers a <strong>contagion ripple effect</strong> across their circle.
              </p>
              <p className="text-xs text-[#8FA3B1] leading-relaxed">
                By modeling user connections (family plans, social referrals, or community chat activity), ChurnSight calculates 
                a <strong>PageRank Score</strong> for each node to determine their local influence.
              </p>
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-[11px] text-indigo-300">
                <strong>💡 Viral Prevention:</strong> Targeting retention efforts on a high PageRank customer prevents them from dragging 
                5 other connected accounts down with them when they leave!
              </div>
            </div>

            <div className="pt-4 border-t border-[#2A4A5A]/40 text-xs text-[#8FA3B1]">
              Technology: NetworkX Community Clusters + PageRank Algorithm
            </div>
          </div>

          <div className="lg:col-span-2 glass rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-white font-semibold text-sm">Influence (PageRank) vs. Churn Risk Index</h4>
                <p className="text-xs text-[#8FA3B1]">Node size indicates the percentage of immediate neighbors who have already churned</p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A4A5A" />
                  <XAxis 
                    type="number" 
                    dataKey="pagerank" 
                    name="Relative Influence Score" 
                    stroke="#8FA3B1" 
                    fontSize={10} 
                    label={{ value: 'Local Node Influence Factor (PageRank)', position: 'bottom', fill: '#8FA3B1', fontSize: 10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="churnScore" 
                    name="Churn Score" 
                    stroke="#8FA3B1" 
                    fontSize={10} 
                    label={{ value: 'Churn %', angle: -90, position: 'insideLeft', fill: '#8FA3B1', fontSize: 10 }}
                  />
                  <ZAxis type="number" dataKey="neighborRatio" range={[30, 250]} name="Neighbour Churned %" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    content={<CustomSocialTooltip />}
                  />
                  <Scatter name="Customers" data={socialScatterData} fill={activeColor} fillOpacity={0.8} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'micro' && (
        <div className="glass rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-[#BA7517]" size={20} />
            <h4 className="text-white font-semibold text-base">Micro-Moment Event Sequences</h4>
          </div>

          <p className="text-sm text-[#E0E0E0] max-w-4xl mb-6 leading-relaxed">
            Standard data models aggregate metrics monthly (e.g. "Total watch-time was 120 minutes"). This masks structural changes. 
            <strong>Micro-Moment Sequence Tracking</strong> monitors real-time action hierarchies to identify symptom timelines.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Standard Healthy Sequence */}
            <div className="p-5 rounded-xl bg-[#1D9E75]/5 border border-[#1D9E75]/20 space-y-4">
              <span className="text-xs font-extrabold text-[#1D9E75] uppercase tracking-wider">🟢 Healthy Retained Sequence</span>
              
              <div className="space-y-4 relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-emerald-950">
                
                <div className="relative flex items-start gap-3">
                  <span className="absolute left-[-21px] top-1.5 h-4 w-4 rounded-full bg-[#1D9E75] border-4 border-[#1A2E42] text-white flex items-center justify-center text-[8px]" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Continuous Value Seeking</h5>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Regular logging, frequent short orders, browsing categories.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3">
                  <span className="absolute left-[-21px] top-1.5 h-4 w-4 rounded-full bg-[#1D9E75] border-4 border-[#1A2E42] text-white flex items-center justify-center text-[8px]" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Implicit Satisfaction Signals</h5>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Writing highly positive or stable rating reviews; regular check-outs.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3">
                  <span className="absolute left-[-21px] top-1.5 h-4 w-4 rounded-full bg-[#1D9E75] border-4 border-[#1A2E42] text-white flex items-center justify-center text-[8px]" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Expansion Engagement</h5>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Signing family members up or extending contracts seamlessly.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Warning Pre-Churn Sequence */}
            <div className="p-5 rounded-xl bg-[#E05252]/5 border border-[#E05252]/20 space-y-4">
              <span className="text-xs font-extrabold text-[#E05252] uppercase tracking-wider">🔴 Pre-Churn Risk Sequence (Symptomatic)</span>
              
              <div className="space-y-4 relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-red-950">
                
                <div className="relative flex items-start gap-3">
                  <span className="absolute left-[-21px] top-1.5 h-4 w-4 rounded-full bg-[#E05252] border-4 border-[#1A2E42] text-white flex items-center justify-center text-[8px]" />
                  <div>
                    <h5 className="text-xs font-bold text-[#E05252]">1. Silent Disengagement</h5>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Sudden drop in daily session counts; cart abandonment; unresolved billing questions.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3">
                  <span className="absolute left-[-21px] top-1.5 h-4 w-4 rounded-full bg-[#E05252] border-4 border-[#1A2E42] text-white flex items-center justify-center text-[8px]" />
                  <div>
                    <h5 className="text-xs font-bold text-[#E05252]">2. Competitor Benchmarking</h5>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Comparing plan specifications; reviewing help pages for "How do I cancel my subscription".</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3">
                  <span className="absolute left-[-21px] top-1.5 h-4 w-4 rounded-full bg-[#E05252] border-4 border-[#1A2E42] text-white flex items-center justify-center text-[8px]" />
                  <div>
                    <h5 className="text-xs font-bold text-[#E05252]">3. Total Abandonment</h5>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Complete termination of logins, app uninstall flags, or subscription expiration.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {activeSubTab === 'dice' && (
        <div className="glass rounded-xl p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-2 border-b border-[#2A4A5A]/50 pb-3">
            <Pill className="text-[#1D9E75]" size={20} />
            <h4 className="text-white font-semibold text-base">DiCE: Diverse Counterfactual Explanations</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
            <div className="space-y-3 text-xs text-[#E0E0E0]">
              <p>
                Explainable AI (XAI) typically lists "Feature Importances" which are global and abstract (e.g. "Tenure is 30% important"). 
                This is completely unhelpful when a customer success representative is actively dealing with a single customer.
              </p>
              <p>
                <strong>Diverse Counterfactual Explanations (DiCE)</strong> solves this by answering "what-if" questions: 
                <em className="text-white"> "What is the minimum, most realistic change we can make to save this customer?"</em>
              </p>
              <p className="text-[#8FA3B1]">
                It uses optimization algorithms to search the prediction boundary of the machine learning model, generating 
                diverse recommendations (like reducing inactive days, or boosting satisfaction scores) that would safely shift 
                the customer below the danger thresholds.
              </p>
            </div>

            <div className="bg-[#070D16] p-4 rounded-xl border border-[#2A4A5A] space-y-4">
              <span className="text-xs font-bold text-[#14A899] uppercase tracking-wider block">Theoretical Example Matrix</span>
              
              <div className="space-y-3 text-xs text-[#E0E0E0]">
                <div className="flex justify-between items-center bg-[#1A2E42] p-2.5 rounded-lg border border-[#2A4A5A]">
                  <span>Current Churn Prediction</span>
                  <span className="font-mono text-[#E05252] font-bold">84% Risk (HIGH)</span>
                </div>

                <div className="text-[10px] text-[#8FA3B1] uppercase font-bold tracking-wider pt-1">Computed Counterfactuals:</div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-[#1D9E75]/5 border border-[#1D9E75]/10 flex justify-between items-center">
                    <span>What-if Inactive Days ➔ &lt; 3 days</span>
                    <span className="font-mono text-[#1D9E75] font-semibold">Risk: 38% (LOW)</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#1D9E75]/5 border border-[#1D9E75]/10 flex justify-between items-center">
                    <span>What-if Frequency ➔ +5 calls/mo</span>
                    <span className="font-mono text-[#1D9E75] font-semibold">Risk: 42% (MED)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
