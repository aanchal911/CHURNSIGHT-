import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, HelpCircle, Layers, 
  ArrowRight, ShieldCheck, RefreshCw, AlertOctagon 
} from 'lucide-react';
import { Domain, SegmentType, SEG_COLORS, DOMAIN_COLORS } from '../data';
import { fetchSegmentDrift } from '../api';

interface SegmentDriftTabProps {
  activeDomain: Domain;
}

const SEGMENTS: SegmentType[] = ['Champions', 'Loyal', 'At-Risk', 'Dormant'];

export default function SegmentDriftTab({ activeDomain }: SegmentDriftTabProps) {
  
  const [driftData, setDriftData] = React.useState({
    matrix: [[0.8, 0.2, 0, 0], [0.1, 0.7, 0.2, 0], [0, 0.1, 0.6, 0.3], [0, 0, 0.2, 0.8]],
    counts_before: { Champions: 100, Loyal: 200, 'At-Risk': 50, Dormant: 25 },
    counts_after:  { Champions: 105, Loyal: 190, 'At-Risk': 60, Dormant: 30 }
  });

  React.useEffect(() => {
    fetchSegmentDrift(activeDomain).then(setDriftData).catch(() => {});
  }, [activeDomain]);

  // Reformat counts before vs after for Recharts double bar chart
  const comparativeChartData = useMemo(() => {
    return SEGMENTS.map(seg => ({
      name: seg,
      Before: driftData.counts_before[seg],
      After: driftData.counts_after[seg],
      color: SEG_COLORS[seg]
    }));
  }, [driftData]);

  // Calculate drift percentages and direction
  const healthAssessment = useMemo(() => {
    const beforeAtRiskDormant = driftData.counts_before['At-Risk'] + driftData.counts_before['Dormant'];
    const afterAtRiskDormant = driftData.counts_after['At-Risk'] + driftData.counts_after['Dormant'];
    const growth = ((afterAtRiskDormant - beforeAtRiskDormant) / beforeAtRiskDormant) * 100;
    
    const isWorsening = growth > 0;

    return {
      growthPct: Math.abs(growth).toFixed(1),
      isWorsening,
      summary: isWorsening 
        ? `⚠️ Segment drift indicates high leakage! At-Risk and Dormant nodes have grown by ${Math.abs(growth).toFixed(1)}%.`
        : `✅ Positive segment drift! Overall health indicators show stable customer migration with growing retention blocks.`
    };
  }, [driftData]);

  const activeColor = DOMAIN_COLORS[activeDomain];

  // Custom tooltips for enhanced metrics & precise data points upon hover
  const CustomDriftTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const before = payload[0].value;
      const after = payload[1]?.value || 0;
      const diff = after - before;
      const diffPct = ((diff / before) * 100).toFixed(1);
      const isPositiveGrowth = diff > 0;
      
      const segmentName = payload[0].payload.name;
      const segmentColor = payload[0].payload.color;

      return (
        <div className="bg-[#070D16] border border-[#2A4A5A] p-3 rounded-lg shadow-xl text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-white border-b border-[#1A2E42] pb-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segmentColor }} />
            <span>{segmentName} Segment</span>
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between gap-6 text-slate-300">
              <span>Before Transition:</span>
              <span className="font-mono font-bold text-slate-100">{before}</span>
            </div>
            <div className="flex justify-between gap-6 text-slate-300">
              <span>After Transition:</span>
              <span className="font-mono font-bold text-[#14A899]">{after}</span>
            </div>
            <div className="flex justify-between gap-6 border-t border-[#1A2E42] pt-1 mt-1 text-[11px]">
              <span>Net Drift:</span>
              <span className={`font-mono font-bold ${isPositiveGrowth ? 'text-[#14A899]' : 'text-[#E05252]'}`}>
                {isPositiveGrowth ? '+' : ''}{diff} ({isPositiveGrowth ? '+' : ''}{diffPct}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="glass rounded-xl p-5 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span>📈 Segment Drift & State Transition — {activeDomain}</span>
        </h3>
        <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
          Using Markov Chain formulations, segment drift tracks how customers migrate across segments 
          (Champions, Loyal, At-Risk, and Dormant) from month to month. This reveals aggregate retention velocity 
          and structural leakage prior to direct cancellations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Heatmap */}
        <div className="glass rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-white font-semibold text-base">Transition Probability Matrix</h4>
              <p className="text-xs text-slate-400">Probability of migrating from Row state to Column state next month</p>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded px-2 py-0.5 font-bold font-mono">
              Markov Chains
            </span>
          </div>

          {/* Grid Heatmap */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {/* Headers Row */}
            <div className="text-slate-500 font-bold self-center text-left">FROM \ TO</div>
            {SEGMENTS.map(s => (
              <div key={s} className="text-slate-300 font-bold p-2 bg-[#0f1a2a] rounded border border-slate-900 truncate">
                {s}
              </div>
            ))}

            {/* Matrix Data Rows */}
            {SEGMENTS.map((rowSeg, rIdx) => (
              <React.Fragment key={rowSeg}>
                {/* Row Label */}
                <div className="text-slate-300 font-bold self-center text-left p-1 text-[11px] truncate">
                  {rowSeg}
                </div>
                
                {/* Probability Cells */}
                {SEGMENTS.map((colSeg, cIdx) => {
                  const val = driftData.matrix[rIdx][cIdx];
                  const valPct = (val * 100).toFixed(0);
                  
                  // Heatmap color intensity background calculations
                  // High diagonal retention = safe green, high leakage shifts to warm red
                  let bgAlpha = Math.min(0.9, Math.max(0.05, val));
                  let cellColor = '#14A899'; // Default teal highlight
                  
                  if (rowSeg === colSeg) {
                    cellColor = '#14A899'; // Stayed in same segment (Diagonal)
                  } else if (colSeg === 'At-Risk' || colSeg === 'Dormant') {
                    cellColor = '#E05252'; // Bad migration (leakage)
                  } else {
                    cellColor = '#534AB7'; // Loyal or Champions upgrade
                  }

                  return (
                    <div 
                      key={colSeg}
                      className="p-3 rounded border border-slate-800/40 font-mono font-bold text-sm relative flex flex-col items-center justify-center min-h-[60px]"
                      style={{ 
                        backgroundColor: `${cellColor}${Math.round(bgAlpha * 255).toString(16).padStart(2, '0')}`,
                        color: val > 0.4 ? '#fff' : '#cbd5e1'
                      }}
                    >
                      <span>{valPct}%</span>
                      {val > 0.15 && (
                        <span className="text-[8px] opacity-60 font-sans font-normal mt-0.5">
                          {rowSeg === colSeg ? 'Retention' : 'Shift'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-4 p-3 bg-[#060E1A] rounded-xl border border-[#1A2E42]/60 text-[11px] text-slate-400 flex items-start gap-2">
            <HelpCircle className="text-[#14A899] shrink-0 mt-0.5" size={14} />
            <p>
              <strong>Reading matrix:</strong> Read horizontally. For example, a customer currently in the 
              <strong> {SEGMENTS[1]}</strong> state has a <strong className="text-white">{(driftData.matrix[1][2]*100).toFixed(0)}%</strong> probability 
              of sliding into <strong>{SEGMENTS[2]}</strong> next month.
            </p>
          </div>
        </div>

        <div className="glass rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-white font-semibold text-base mb-1">State Size Migration Dynamics</h4>
            <p className="text-xs text-slate-400">Comparing Segment cluster sizes Before vs After state transitions</p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativeChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip content={<CustomDriftTooltip />} />
                <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar name="Initial Size (Before)" dataKey="Before" fill="#534AB7" radius={[3, 3, 0, 0]} />
                <Bar name="Drifted Size (After)" dataKey="After" fill="#14A899" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Health Assessment Status */}
          <div className={`p-4 rounded-xl border mt-2 flex items-start gap-3 ${
            healthAssessment.isWorsening 
              ? 'bg-red-500/5 border-red-500/20 text-red-300' 
              : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-200'
          }`}>
            <div className="shrink-0 mt-0.5">
              {healthAssessment.isWorsening ? <AlertOctagon size={16} /> : <ShieldCheck size={16} />}
            </div>
            <div className="text-xs">
              <h5 className="font-bold text-slate-100">
                {healthAssessment.isWorsening ? 'Deterioration warning' : 'Stable Segment Balance'}
              </h5>
              <p className="text-slate-400 mt-1 leading-normal">{healthAssessment.summary}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
