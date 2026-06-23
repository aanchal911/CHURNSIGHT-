import React, { useState, useEffect } from 'react';
import { 
  Sliders, ShieldAlert, BadgeHelp, CheckCircle, Flame, 
  HelpCircle, UserCheck, MessageSquareWarning, RefreshCw, Sparkles, AlertTriangle
} from 'lucide-react';
import { Domain, DOMAIN_COLORS, RISK_COLORS, SegmentType, Customer } from '../data';
import { predictSingle, PredictResponse } from '../api';

interface CustomerDetailTabProps {
  activeDomain: Domain;
  selectedCustomer: Customer | null;
  onClearSelectedCustomer: () => void;
}

export default function CustomerDetailTab({ 
  activeDomain, 
  selectedCustomer,
  onClearSelectedCustomer
}: CustomerDetailTabProps) {

  // Slide parameters
  const [tenure, setTenure] = useState(12);
  const [spend, setSpend] = useState(1200);
  const [frequency, setFrequency] = useState(5);
  
  // Innovations sliders
  const [sentSlope, setSentSlope] = useState(0.0);
  const [sentAvg, setSentAvg] = useState(0.2);
  const [microScore, setMicroScore] = useState(0.3);
  const [daysInactive, setDaysInactive] = useState(5);

  const [activeProfileName, setActiveProfileName] = useState('Custom Profile Sandbox');

  // Synchronize when a customer is chosen from the "Overview" table
  useEffect(() => {
    if (selectedCustomer) {
      setTenure(selectedCustomer.tenure);
      setSpend(selectedCustomer.spend);
      setFrequency(selectedCustomer.frequency);
      setSentSlope(selectedCustomer.sent_slope);
      setSentAvg(selectedCustomer.sent_avg);
      setMicroScore(selectedCustomer.micro_risk_score);
      setDaysInactive(selectedCustomer.days_inactive);
      setActiveProfileName(selectedCustomer.name);
    } else {
      // Default sandbox state
      setTenure(12);
      setSpend(1200);
      setFrequency(5);
      setSentSlope(0.1);
      setSentAvg(0.35);
      setMicroScore(0.25);
      setDaysInactive(4);
      setActiveProfileName('Custom Profile Sandbox');
    }
  }, [selectedCustomer, activeDomain]);

  const [apiResult, setApiResult] = React.useState<PredictResponse>({
    churn_score: 0, risk: 'LOW', segment: 'Loyal', prescriptions: []
  });

  React.useEffect(() => {
    predictSingle({
      domain: activeDomain, tenure, spend, frequency,
      sent_slope: sentSlope, sent_avg: sentAvg,
      micro_risk_score: microScore, days_inactive: daysInactive
    }).then(setApiResult).catch(() => {});
  }, [activeDomain, tenure, spend, frequency, sentSlope, sentAvg, microScore, daysInactive]);

  const prediction = { churn_score: apiResult.churn_score, risk: apiResult.risk, segment: apiResult.segment };
  const counterfactuals = { prescriptions: apiResult.prescriptions, originalScore: apiResult.churn_score, originalRisk: apiResult.risk };

  const activeColor = DOMAIN_COLORS[activeDomain];
  const riskColor = RISK_COLORS[prediction.risk];

  // Retention prescriptions
  const prescriptions = React.useMemo(() => {
    const list = [];
    
    if (tenure < 6) {
      list.push({
        icon: "🎁",
        title: "Welcome Retention Offer",
        desc: "New account early flight hazard. Provision custom greeting points or onboard checkup."
      });
    }
    if (spend < 500) {
      list.push({
        icon: "💰",
        title: "Financial Engagement Vouchers",
        desc: "Low customer lifetime value threshold. Issue loyalty discounts or cross-bundle offers."
      });
    }
    if (daysInactive > 10) {
      list.push({
        icon: "📱",
        title: "Automated Re-activation Push",
        desc: `Inactive for ${daysInactive} consecutive days. Trigger high-priority push or email sequences.`
      });
    }
    if (sentSlope < -0.2) {
      list.push({
        icon: "📞",
        title: "Customer Success Care Call",
        desc: "Conversational feedback sentiment dropping heavily. Needs a personal human call to resolve."
      });
    }
    if (prediction.risk === 'HIGH') {
      list.push({
        icon: "👨‍💼",
        title: "Dedicated Account Manager Assignment",
        desc: "High priority risk index. Flag account for 1-on-1 concierge resolution support."
      });
    }
    if (microScore > 0.5) {
      list.push({
        icon: "⭐",
        title: "Micro-moment Compensation",
        desc: "Symptomatic pre-churn usage sequence captured. Offer compensatory loyalty credits."
      });
    }

    if (list.length === 0) {
      list.push({
        icon: "✅",
        title: "Normal Account Health Engagement",
        desc: "Low risks verified. Maintain standard programmatic marketing schedules."
      });
    }

    return list;
  }, [tenure, spend, daysInactive, sentSlope, prediction.risk, microScore]);

  // Apply counterfactual values to state
  const applyCounterfactual = (item: { feature: string; action: string; impactScore: number }) => {
    if (item.feature === 'Days Inactive') {
      setDaysInactive(3);
    } else if (item.feature === 'Sentiment Trajectory') {
      setSentSlope(0.5);
    } else if (item.feature === 'Usage Frequency') {
      setFrequency(prev => prev + 5);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">{activeProfileName}</h3>
            {selectedCustomer && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#14A899]/15 text-[#14A899] font-bold">
                {selectedCustomer.id}
              </span>
            )}
          </div>
          <p className="text-xs text-[#8FA3B1] mt-1">
            {selectedCustomer ? 'Active data-lake customer record synced.' : 'Simulate individual scenario properties below.'}
          </p>
        </div>
        
        {selectedCustomer && (
          <button 
            onClick={onClearSelectedCustomer}
            className="px-3 py-1.5 bg-[#070D16] hover:bg-[#070D16]/80 text-[#8FA3B1] hover:text-white text-xs font-semibold rounded-lg transition border border-[#2A4A5A] cursor-pointer"
          >
            Switch to Sandbox Simulation
          </button>
        )}
      </div>

      {/* Main Core Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sliders Input Panel */}
        <div id="detail-sliders" className="glass rounded-xl p-5 shadow-lg space-y-5">
          <div className="flex items-center gap-2 border-b border-[#2A4A5A]/50 pb-3">
            <Sliders className="text-[#14A899]" size={18} />
            <h4 className="text-white font-semibold text-base">Customer Variable Inputs</h4>
          </div>

          {/* Slider 1: Tenure */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#E0E0E0]">Contract Tenure</span>
              <span className="text-white">{tenure} Months</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="72" 
              value={tenure} 
              onChange={(e) => setTenure(parseInt(e.target.value))}
              className="w-full accent-[#14A899] cursor-pointer bg-[#070D16] rounded-lg h-1"
            />
            <div className="flex justify-between text-[10px] text-[#8FA3B1] font-mono">
              <span>0M (New)</span>
              <span>36M (Mid-term)</span>
              <span>72M (Veteran)</span>
            </div>
          </div>

          {/* Slider 2: Spend */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#E0E0E0]">Total Account Spend</span>
              <span className="text-white">₹{spend.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="20000" 
              step="100"
              value={spend} 
              onChange={(e) => setSpend(parseInt(e.target.value))}
              className="w-full accent-[#14A899] cursor-pointer bg-[#070D16] rounded-lg h-1"
            />
            <div className="flex justify-between text-[10px] text-[#8FA3B1] font-mono">
              <span>₹100</span>
              <span>₹10,000</span>
              <span>₹20,000+</span>
            </div>
          </div>

          {/* Slider 3: Usage Frequency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#E0E0E0]">Engagement Frequency</span>
              <span className="text-white">
                {frequency} {activeDomain === 'Telecom' ? 'calls' : activeDomain === 'OTT' ? 'watch plays' : 'orders'} / month
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={frequency} 
              onChange={(e) => setFrequency(parseInt(e.target.value))}
              className="w-full accent-[#14A899] cursor-pointer bg-[#070D16] rounded-lg h-1"
            />
            <div className="flex justify-between text-[10px] text-[#8FA3B1] font-mono">
              <span>0 (Dormant)</span>
              <span>25 (Regular)</span>
              <span>50 (Heavy User)</span>
            </div>
          </div>

          {/* Innovation 1: Sentiment */}
          <div className="border-t border-[#2A4A5A]/50 pt-4 space-y-4">
            <h5 className="text-[#14A899] font-bold text-xs uppercase tracking-wider">🧠 Conversational Sentiment Trajectory</h5>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#E0E0E0]">Feedback Trend Slope</span>
                <span className={`font-mono font-bold ${sentSlope < 0 ? 'text-[#E05252]' : 'text-[#1D9E75]'}`}>
                  {sentSlope > 0 ? '+' : ''}{sentSlope.toFixed(2)}
                </span>
              </div>
              <input 
                type="range" 
                min="-1.0" 
                max="1.0" 
                step="0.05"
                value={sentSlope} 
                onChange={(e) => setSentSlope(parseFloat(e.target.value))}
                className="w-full accent-[#14A899] cursor-pointer bg-[#070D16] rounded-lg h-1"
              />
              <div className="flex justify-between text-[10px] text-[#8FA3B1] font-mono">
                <span>-1.0 (Declining)</span>
                <span>0.0 (Neutral)</span>
                <span>+1.0 (Rising)</span>
              </div>
            </div>
          </div>

          {/* Innovation 2: Micro-Moment */}
          <div className="border-t border-[#2A4A5A]/50 pt-4 space-y-4">
            <h5 className="text-[#14A899] font-bold text-xs uppercase tracking-wider">⚡ Micro-Moment Risk Vectors</h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#E0E0E0]">Micro-Risk Index</span>
                  <span className="text-white font-semibold font-mono">{microScore.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.0" 
                  max="1.0" 
                  step="0.05"
                  value={microScore} 
                  onChange={(e) => setMicroScore(parseFloat(e.target.value))}
                  className="w-full accent-[#14A899] cursor-pointer bg-[#070D16] rounded-lg h-1"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#E0E0E0]">Inactive Days</span>
                  <span className="text-[#BA7517] font-bold font-mono">{daysInactive} Days</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  value={daysInactive} 
                  onChange={(e) => setDaysInactive(parseInt(e.target.value))}
                  className="w-full accent-[#14A899] cursor-pointer bg-[#070D16] rounded-lg h-1"
                />
              </div>

            </div>
          </div>

        </div>

        {/* Prediction Outputs Panel */}
        <div id="detail-prediction-view" className="space-y-6">
          
          {/* Score & Risk Display Card */}
          <div className="glass rounded-xl p-5 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${riskColor}10 0%, transparent 70%)` }} />

            <span className="text-[#8FA3B1] text-xs font-bold uppercase tracking-wider mb-2">Churn Risk Probability</span>
            
            {/* Circular Gauge */}
            <div className="relative h-36 w-36 flex items-center justify-center my-3">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 ring-transition">
                <circle cx="68" cy="68" r="56" stroke="#0D1B2A" strokeWidth="8" fill="transparent" />
                <circle
                  cx="68" cy="68" r="56"
                  stroke={riskColor}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={Math.PI * 2 * 56}
                  strokeDashoffset={((100 - prediction.churn_score) / 100) * (Math.PI * 2 * 56)}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${riskColor})` }}
                />
              </svg>
              <div className="text-center z-10">
                <span className="text-4xl font-extrabold text-white font-mono tracking-tight">{prediction.churn_score}%</span>
              </div>
            </div>

            <div className="mt-2 flex flex-col items-center">
              <span 
                className="px-3 py-1 rounded-full font-bold text-xs tracking-wider border"
                style={{ 
                  color: riskColor, 
                  borderColor: `${riskColor}33`,
                  backgroundColor: `${riskColor}11`
                }}
              >
                {prediction.risk} RISK STATUS
              </span>
              <p className="text-xs text-[#8FA3B1] mt-2 max-w-sm">
                Segmented into <strong className="text-white">{prediction.segment}</strong> based on current usage and micro-moment sequences.
              </p>
            </div>
          </div>

          {/* Innovation Insight Alerts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8FA3B1] tracking-wider">🧠 Conversational Slope</span>
              <div className="mt-3">
                {sentSlope < -0.3 ? (
                  <div className="p-3 rounded-lg bg-[#E05252]/10 border border-[#E05252]/20 text-[#E05252] text-xs leading-normal">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <MessageSquareWarning size={14} />
                      Mood tezi se gir raha hai!
                    </p>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Customer feedback metrics reveal severe degradation trend. Fast action advised.</p>
                  </div>
                ) : sentSlope < 0 ? (
                  <div className="p-3 rounded-lg bg-[#BA7517]/10 border border-[#BA7517]/20 text-[#BA7517] text-xs leading-normal">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={14} />
                      Slightly negative trajectory
                    </p>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Slightly declining feedback sentiment. Engage with supportive check-in.</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[#1D9E75]/10 border border-[#1D9E75]/20 text-[#1D9E75] text-xs leading-normal">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <CheckCircle size={14} />
                      Mood positive & stable
                    </p>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Excellent sentiment engagement. Solid baseline affinity maintained.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8FA3B1] tracking-wider">⚡ Micro-Moment Signal</span>
              <div className="mt-3">
                {microScore > 0.6 ? (
                  <div className="p-3 rounded-lg bg-[#E05252]/10 border border-[#E05252]/20 text-[#E05252] text-xs leading-normal">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <ShieldAlert size={14} />
                      Pre-churn pattern captured!
                    </p>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Days inactive: {daysInactive}. Predictive signature shows high likelihood of cancellation.</p>
                  </div>
                ) : microScore > 0.3 ? (
                  <div className="p-3 rounded-lg bg-[#BA7517]/10 border border-[#BA7517]/20 text-[#BA7517] text-xs leading-normal">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={14} />
                      Warning sequence signals
                    </p>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Micro-moments scoring alerts. Intervene prior to total drop-out sequence.</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[#1D9E75]/10 border border-[#1D9E75]/20 text-[#1D9E75] text-xs leading-normal">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <CheckCircle size={14} />
                      Standard usage signature
                    </p>
                    <p className="text-[10px] text-[#8FA3B1] mt-0.5">Healthy session triggers. Normal continuous usage patterns recorded.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* DiCE Counterfactuals */}
      <div className="glass rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2A4A5A]/50">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#1D9E75]" size={18} />
            <h4 className="text-white font-semibold text-base">💊 DiCE Prescription Engine (What-If Scenarios)</h4>
          </div>
          <span className="text-[10px] font-mono text-[#1D9E75] font-bold uppercase px-2.5 py-0.5 bg-[#1D9E75]/10 rounded-full">
            Counterfactual Simulation
          </span>
        </div>

        <p className="text-xs text-[#E0E0E0] leading-normal max-w-4xl mb-4">
          Machine Learning models can look like black-boxes. DiCE (Diverse Counterfactual Explanations) resolves this by computing 
          the <strong>minimum targeted operational changes</strong> required to transition this specific customer profile into a 
          safer risk tier.
        </p>

        {counterfactuals.prescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {counterfactuals.prescriptions.map((p, idx) => {
              const newRiskColor = RISK_COLORS[p.newRisk as 'HIGH' | 'MEDIUM' | 'LOW'];
              return (
                <div key={idx} className="bg-[#070D16] p-4 rounded-xl border border-[#2A4A5A]/60 flex flex-col justify-between hover:border-[#1D9E75]/30 transition">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{p.feature}</span>
                      <span 
                        className="text-[9px] font-extrabold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${newRiskColor}15`, color: newRiskColor }}
                      >
                        TO {p.newRisk}
                      </span>
                    </div>
                    <p className="text-xs text-white font-medium leading-relaxed">{p.action}</p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-[#2A4A5A]/40 flex items-center justify-between">
                    <div className="text-[10px] text-[#8FA3B1]">
                      Score drop: <strong className="text-[#1D9E75] font-mono font-bold">{prediction.churn_score}% ➔ {p.impactScore}%</strong>
                    </div>
                    <button 
                      onClick={() => applyCounterfactual(p)}
                      className="text-[10px] font-bold text-[#1D9E75] hover:text-[#1D9E75]/80 transition flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={10} />
                      Simulate What-If
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 text-center bg-[#070D16] rounded-xl border border-[#2A4A5A]/60 text-[#8FA3B1] text-xs">
            <UserCheck className="mx-auto text-slate-600 mb-2" size={24} />
            This customer is already in a healthy low-risk tier. No counterfactual adjustments are necessary.
          </div>
        )}
      </div>

      {/* Retention Prescriptions */}
      <div className="glass rounded-xl p-5 shadow-lg">
        <h4 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
          <span>🚀 Automated Mitigation Playbook</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((pr, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-lg border flex items-start gap-3 transition-all ${
                prediction.risk === 'HIGH' 
                  ? 'bg-[#E05252]/5 border-[#E05252]/20 text-[#E05252]' 
                  : prediction.risk === 'MEDIUM' 
                    ? 'bg-[#BA7517]/5 border-[#BA7517]/10 text-[#BA7517]' 
                    : 'bg-[#1D9E75]/5 border-[#1D9E75]/10 text-[#1D9E75]'
              }`}
            >
              <span className="text-xl shrink-0 mt-0.5">{pr.icon}</span>
              <div>
                <h5 className="font-bold text-xs text-white">{pr.title}</h5>
                <p className="text-[11px] text-[#8FA3B1] mt-1 leading-normal">{pr.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
