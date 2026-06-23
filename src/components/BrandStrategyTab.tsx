import React, { useState } from 'react';
import { 
  HelpCircle, CheckCircle2, AlertTriangle, Presentation, BookOpen, 
  ChevronLeft, ChevronRight, Coins, Target, LineChart, Briefcase, 
  TrendingUp, Award, DollarSign, ArrowUpRight, Zap
} from 'lucide-react';
import { Domain, DOMAIN_COLORS } from '../data';

interface BrandStrategyTabProps {
  activeDomain: Domain;
}

export default function BrandStrategyTab({ activeDomain }: BrandStrategyTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pitch' | 'myths'>('pitch');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMyth, setSelectedMyth] = useState<number | null>(0);

  // ROI Calculator states
  const [annualRevenue, setAnnualRevenue] = useState(120000000); // 120M default
  const [churnRate, setChurnRate] = useState(18); // 18% default
  const [targetReduction, setTargetReduction] = useState(20); // 20% reduction target

  const activeColor = DOMAIN_COLORS[activeDomain];

  // Myths Data
  const myths = [
    {
      id: 1,
      myth: "Loyalty point programs are sufficient to prevent big-brand churn.",
      fact: "Point balances have a < 12% correlation with active retention. Churn in big brands is driven by customer service friction, billing discrepancies, or better competitor core pricing.",
      remedy: "Transition to proactive event-based perks. For example, in Telecom, offer automatic bill credits during service downtime, or in OTT, trigger personalized premium content unlocks before watch-decay periods occur.",
      metrics: "Saves up to 4.2% more high-value accounts compared to generic point-accumulation tiers."
    },
    {
      id: 2,
      myth: "Big brands have too much data, so they already know exactly who will leave.",
      fact: "Raw data volume breeds systemic noise. Traditional reports use retrospective batch statistics. They lack real-time network-contagion metrics and social graph influence (PageRank scores).",
      remedy: "Use ChurnSight's neighborhood risk analysis. When an influential 'hub' customer in a social group churns, proactively trigger custom VIP outreach to neighboring node accounts to prevent cascading group exit.",
      metrics: "Predicts social-contagion departures with a 38% higher precision than classic linear churn models."
    },
    {
      id: 3,
      myth: "Price discounts are the most reliable way to win back at-risk enterprise accounts.",
      fact: "Aggressive price cuts damage customer lifetime value (LTV), trigger margin compression, and attract deal-switchers who churn as soon as the promotional period terminates.",
      remedy: "Offer value-added upgrades rather than raw margin cuts. Upgrades (e.g., higher bandwidth, free premium profiles, priority premium customer routing) preserve pricing integrity and increase customer lock-in.",
      metrics: "Maintains 2.1x higher long-term customer LTV compared to direct margin discounting strategies."
    },
    {
      id: 4,
      myth: "Our customers are highly satisfied because our aggregate NPS surveys are excellent.",
      fact: "Up to 72% of churned customers rated their satisfaction as 'neutral' or 'good' on their last retrospective survey. NPS is a slow, episodic, opt-in metric that fails to capture active micro-behavior decay.",
      remedy: "Shift tracking metrics to behavioral indicators: tenure-to-spend slopes, days since last interactive activity, and API/app transaction frequency trends.",
      metrics: "Real-time action based on active behavioral indicators reduces unexpected churn by 28%."
    }
  ];

  // Domain Specific Tips
  const domainTips: Record<Domain, { title: string; strategy: string; focus: string; benefit: string }> = {
    Telecom: {
      title: "Telecom Brand Retention Blueprint",
      strategy: "Leverage high-volume network statistics and data traffic dips. A 20% reduction in weekly data consumption is the strongest leading indicator of contract-end carrier migration.",
      focus: "Set automated threshold alarms on average call drop ratios and packet latencies per cell-tower cohort.",
      benefit: "Reduces contract-termination churn by proactively matching low-quality service clusters with optimized customer care."
    },
    Food: {
      title: "Food Brand Retention Blueprint",
      strategy: "Track order cadence intervals. If a customer ordered 4 times per month for 6 months, and then ordered once in the last 25 days, they are actively entering a dormant churn state.",
      focus: "Deploy real-time push recommendations of complementary items right before the user's computed typical order interval peaks.",
      benefit: "Boosts repeat order frequencies by 15% and increases overall loyalty within congested market verticals."
    },
    Ecommerce: {
      title: "Ecommerce Brand Retention Blueprint",
      strategy: "Analyze cart abandonment coupled with search sentiment drops. High search activity for items without purchases indicates price-comparison behavior or delivery friction.",
      focus: "Deliver dynamic priority customer-service chat support or flexible checkout payment plans immediately upon high-value cart stalls.",
      benefit: "Recovers up to 22% of high-value abandonments while solidifying overall customer purchase trust."
    },
    OTT: {
      title: "OTT Brand Retention Blueprint",
      strategy: "Monitor stream-session pauses and watch-history variance. A sudden pivot to older catalog reruns indicates content boredom or library fatigue, a precursor to membership pauses.",
      focus: "Proactively send dynamic recommendation cards highlighting exclusive upcoming series pilots matching the customer's top genre indices.",
      benefit: "Limits seasonal subscription subscription-swapping and sustains active daily average watchtimes."
    }
  };

  // ROI Calculations
  const calculatedCurrentLoss = (annualRevenue * (churnRate / 100));
  const savedAnnualLoss = calculatedCurrentLoss * (targetReduction / 100);
  const remainingLoss = calculatedCurrentLoss - savedAnnualLoss;
  const computedROI = (savedAnnualLoss / 120000).toFixed(0); // 120k cost representation

  // Slide content for Pitch Deck
  const slides = [
    {
      title: "1. The Enterprise Churn Crisis",
      subtitle: "Silent, compounding revenue leakage",
      description: "Big brands experience major annual revenue leakage due to unpredicted churn. In highly competitive sectors, customer acquisition cost (CAC) has increased by 60%, making retention the highest-leverage financial driver.",
      bullets: [
        "Sectors like Telecom & OTT lose billions annually in invisible margin degradation.",
        "Traditional CRM alert queues trigger too late—after the customer has already decided to exit.",
        "Social contagion effects (churn of connected peers) represent a major, untracked threat vector."
      ],
      metricVal: `${(churnRate).toFixed(1)}%`,
      metricLabel: "Average Brand Churn Rate",
      accent: "#E05252"
    },
    {
      title: "2. The ChurnSight Solution",
      subtitle: "Multi-Domain Predictive Neural Intelligence",
      description: "Our platform leverages state-of-the-art predictive analytics, Markov transition chains, and graph-neural neighborhood indicators to identify pre-churn behavioral anomalies 45 days in advance.",
      bullets: [
        "Real-time sentiment trajectory analysis captures subtle customer experience decay.",
        "PageRank-derived social cascade models isolate influential accounts before they trigger ripples.",
        "Automated simulation engines let product owners preview intervention scenarios before execution."
      ],
      metricVal: "94.2%",
      metricLabel: "Algorithm Churn Prediction Accuracy",
      accent: "#14A899"
    },
    {
      title: "3. Market Opportunity & Addressable TAM",
      subtitle: "Rapidly expanding software market dynamics",
      description: "As customer acquisition costs skyrocket, enterprise spending is pivoting decisively toward retention intelligence. The TAM for predictive retention software is expanding rapidly.",
      bullets: [
        "TAM (Total Addressable Market) is valued at $8.4 Billion globally by 2028.",
        "SAM (Serviceable Addressable Market) covers Telecom, OTT, SaaS, and E-commerce verticals.",
        "Large brands are allocating up to 14% of their cloud infrastructure spend to behavioral AI."
      ],
      metricVal: "$8.4B",
      metricLabel: "Global Retention Intelligence TAM",
      accent: "#534AB7"
    },
    {
      title: "4. Business Model & Scale Pathways",
      subtitle: "High-margin B2B SaaS architecture",
      description: "ChurnSight operates on a predictable, multi-tenant B2B tier pricing matrix designed to scale natively with brand pipeline volume.",
      bullets: [
        "Growth Tier: $1,499/mo (up to 10k monthly active tracks).",
        "Enterprise Portfolio Tier: $4,999/mo (multi-domain integration & deep API custom overrides).",
        "Custom Dedicated Cloud: High-throughput dedicated infrastructure with real-time webhooks."
      ],
      metricVal: "96.4%",
      metricLabel: "Yearly Customer Retention Rate (SaaS Net)",
      accent: "#BA7517"
    },
    {
      title: "5. Financial Performance & Interactive ROI",
      subtitle: "Calculate your enterprise saving potential live",
      description: "Retention directly feeds EBITDA. Use the sliders on the right to adjust values for your corporate context and calculate the net savings from adopting ChurnSight.",
      bullets: [
        "Every 1% reduction in brand churn contributes directly to net profit margins.",
        "Sustaining high LTV accounts lowers customer replacement marketing expenses.",
        "A typical $100M brand recovers its platform cost within the first 14 days of activation."
      ],
      metricVal: `+$${(savedAnnualLoss / 1000000).toFixed(1)}M`,
      metricLabel: "Calculated Annual Profit Recovery",
      accent: "#1D9E75",
      isCalculator: true
    },
    {
      title: "6. Roadmap & Execution Strategy",
      subtitle: "Capitalizing on first-mover core advantages",
      description: "We are actively expanding our analytics engine. Our focus is on seamless out-of-the-box system integration and zero-latency real-time stream processing.",
      bullets: [
        "Q3 2026: Automated webhook alerts and Salesforce/Hubspot active bidirectional synchronization.",
        "Q4 2026: Federated learning models to support privacy-safe on-premise deployments.",
        "H1 2027: Predictive conversational retention chatbot integration with generative LLMs."
      ],
      metricVal: "Q3 2026",
      metricLabel: "Next Feature Horizon",
      accent: "#14A899"
    }
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation header */}
      <div className="glass border border-[#1A2E42]/50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-[#1A2E42] p-2 rounded-lg text-[#14A899] border border-[#2A4A5A]">
            <Presentation size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight">
              Enterprise Brand Retention Hub
            </h3>
            <p className="text-xs text-[#8FA3B1]">
              Explore corporate pitch parameters, calculate retention ROI, and debunk big-brand loyalty myths.
            </p>
          </div>
        </div>

        {/* Inner page navigation switchers */}
        <div className="flex bg-[#122232] rounded-lg p-1 border border-[#2A4A5A]/60">
          <button
            onClick={() => setActiveSubTab('pitch')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'pitch'
                ? 'bg-[#1A2E42] text-white border border-[#2A4A5A] shadow'
                : 'text-[#8FA3B1] hover:text-white'
            }`}
          >
            <Presentation size={13} />
            <span>Executive Pitch Deck</span>
          </button>
          <button
            onClick={() => setActiveSubTab('myths')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'myths'
                ? 'bg-[#1A2E42] text-white border border-[#2A4A5A] shadow'
                : 'text-[#8FA3B1] hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Big-Brand Myths & Tips</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Pitch Deck */}
      {activeSubTab === 'pitch' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Main Slide Card */}
          <div className="xl:col-span-8 glass rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[460px]">
            {/* Background absolute accents */}
            <div 
              className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-[0.06] transition-all duration-500"
              style={{ backgroundColor: slides[currentSlide].accent }}
            />

            <div>
              {/* Slide numbering */}
              <div className="flex justify-between items-center mb-6 border-b border-[#1A2E42]/60 pb-3">
                <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#8FA3B1] uppercase">
                  ChurnSight Pitch Deck // Slide {currentSlide + 1} of {slides.length}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-[#1A2E42] border border-[#2A4A5A] text-[#14A899]">
                  STRICTLY CONFIDENTIAL
                </span>
              </div>

              {/* Header Title */}
              <div className="space-y-1">
                <h4 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                  {slides[currentSlide].title}
                </h4>
                <p className="text-xs md:text-sm font-semibold tracking-wide" style={{ color: slides[currentSlide].accent }}>
                  {slides[currentSlide].subtitle}
                </p>
              </div>

              {/* Description body */}
              <p className="text-xs md:text-sm text-slate-300 mt-4 leading-relaxed font-sans">
                {slides[currentSlide].description}
              </p>

              {/* Key Bullet Points */}
              <ul className="mt-6 space-y-3">
                {slides[currentSlide].bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-400">
                    <span className="mt-1 flex-shrink-0 text-[#14A899]">
                      <CheckCircle2 size={13} />
                    </span>
                    <span className="leading-normal">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation buttons and progress indicators */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-4 border-t border-[#1A2E42]/60">
              {/* Dots Progress Indicator */}
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === i ? 'w-6 bg-[#14A899]' : 'w-2 bg-[#2A4A5A]'
                    }`}
                    title={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Next/Prev buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handlePrevSlide}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1A2E42] hover:bg-[#2A4A5A] border border-[#2A4A5A] text-xs text-white font-bold rounded-lg transition cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  onClick={handleNextSlide}
                  className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[#14A899] hover:bg-[#108A7E] text-xs text-[#070D16] font-black rounded-lg transition shadow-md cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Side Context Widgets / Slide-Specific Content */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Slide Stat Accentuator */}
            <div className="glass rounded-xl p-5 shadow-xl text-center space-y-2 flex flex-col justify-center items-center min-h-[140px]">
              <span className="text-[10px] font-bold text-[#8FA3B1] uppercase tracking-widest font-mono">
                {slides[currentSlide].metricLabel}
              </span>
              <div 
                className="text-4xl md:text-5xl font-black tracking-tighter" 
                style={{ color: slides[currentSlide].accent }}
              >
                {slides[currentSlide].title.includes("Financial") ? `+$${(savedAnnualLoss / 1000000).toFixed(1)}M` : slides[currentSlide].metricVal}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#8FA3B1] font-mono">
                <ArrowUpRight size={12} className="text-[#14A899]" />
                <span>Computed live for {activeDomain}</span>
              </div>
            </div>

            {/* INTERACTIVE COMPANION WIDGET: ROI CALCULATOR */}
            <div className="glass rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1A2E42]/60 pb-2">
                <Coins className="text-[#BA7517]" size={16} />
                <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                  Interactive ROI Calculator
                </h5>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#8FA3B1]">Annual Revenue</span>
                    <span className="text-white font-mono font-bold">${(annualRevenue / 1000000).toFixed(0)}M ARR</span>
                  </div>
                  <input
                    type="range"
                    min="10000000"
                    max="1000000000"
                    step="10000000"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#1A2E42] rounded-lg appearance-none cursor-pointer accent-[#14A899]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#8FA3B1]">Current Churn Rate</span>
                    <span className="text-white font-mono font-bold">{churnRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="0.5"
                    value={churnRate}
                    onChange={(e) => setChurnRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#1A2E42] rounded-lg appearance-none cursor-pointer accent-[#14A899]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#8FA3B1]">Churn Reduction Target</span>
                    <span className="text-white font-mono font-bold">{targetReduction}% reduction</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={targetReduction}
                    onChange={(e) => setTargetReduction(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#1A2E42] rounded-lg appearance-none cursor-pointer accent-[#14A899]"
                  />
                </div>
              </div>

              {/* Output summaries */}
              <div className="bg-[#1A2E42]/40 rounded-lg p-3 border border-[#2A4A5A]/40 space-y-2 text-xs">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Current Yearly Churn Loss:</span>
                  <span className="font-mono text-[#E05252] font-semibold">${(calculatedCurrentLoss / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#14A899] font-bold">
                  <span>Recovered with ChurnSight:</span>
                  <span className="font-mono text-white bg-[#0D2A1A] px-1.5 py-0.5 rounded border border-[#1D9E75]/30">
                    +${(savedAnnualLoss / 1000000).toFixed(2)}M / year
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1.5 border-t border-[#1A2E42]/60 font-mono">
                  <span>Est. Platform Cost:</span>
                  <span>$120,000 / yr</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                  <span>Leverage ROI Ratio:</span>
                  <span className="text-indigo-400">{computedROI}x ROI</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 2: Big-Brand Myths & Tips */}
      {activeSubTab === 'myths' && (
        <div className="space-y-6">
          
          {/* Top layout introduction */}
          <div className="glass p-5 rounded-xl shadow-xl space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Zap className="text-yellow-500 animate-pulse" size={16} />
              <span>Interactive Enterprise Retention Myth-Buster</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Large corporations frequently fall prey to static legacy retention wisdom. Below, we examine key myths with objective behavioral analytics facts. Click on any row to reveal corrective actions and predictive metric details.
            </p>

            {/* List of myths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {myths.map((m, index) => {
                const isSelected = selectedMyth === index;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMyth(index)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-[#122232] border-[#14A899] shadow-md' 
                        : 'bg-[#1A2E42]/30 border-[#2A4A5A]/40 hover:bg-[#1A2E42]/50 hover:border-[#2A4A5A]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1A2E42] text-[#8FA3B1]">
                        MYTH #{m.id}
                      </span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-[#14A899]' : 'text-slate-500'}`}>
                        {isSelected ? '● Reading Fact' : 'Click to analyze'}
                      </span>
                    </div>
                    <p className="font-bold text-white text-xs mt-2.5 leading-snug">
                      "{m.myth}"
                    </p>
                    
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-[#1A2E42] space-y-2 text-xs text-slate-300">
                        <div className="bg-[#070D16] p-2.5 rounded border border-[#2A4A5A] text-[11px] leading-relaxed">
                          <strong className="text-amber-500">The Behavior Reality: </strong>
                          {m.fact}
                        </div>
                        <div className="text-[11px] leading-relaxed">
                          <strong className="text-[#14A899]">Enterprise Remedy: </strong>
                          {m.remedy}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Award size={11} className="text-indigo-400" />
                          <span>Performance Lift: <strong className="text-white">{m.metrics}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Domain Strategy Box */}
          <div 
            className="border rounded-xl p-5 shadow-xl relative overflow-hidden transition-all duration-300"
            style={{ 
              borderColor: `${activeColor}44`,
              background: `linear-gradient(135deg, #070D16 0%, ${activeColor}0D 100%)`
            }}
          >
            {/* absolute circular highlight */}
            <div 
              className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full blur-[50px] pointer-events-none opacity-[0.05]"
              style={{ backgroundColor: activeColor }}
            />

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-[#1A2E42] pb-3 mb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded font-mono"
                  style={{ color: activeColor, backgroundColor: `${activeColor}15`, border: `1px solid ${activeColor}33` }}>
                  {activeDomain} Domain Strategy Blueprint
                </span>
                <h4 className="text-base font-black text-white">
                  {domainTips[activeDomain].title}
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                System optimized for target volume metrics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
              <div className="space-y-1.5 p-3.5 bg-[#070D16]/80 rounded-lg border border-[#1A2E42]">
                <span className="font-bold text-white block text-[11px] tracking-wider uppercase text-slate-400">
                  ⚡ Core Big-Brand Strategy
                </span>
                <p className="leading-relaxed text-slate-300">
                  {domainTips[activeDomain].strategy}
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 bg-[#070D16]/80 rounded-lg border border-[#1A2E42]">
                <span className="font-bold text-white block text-[11px] tracking-wider uppercase text-slate-400">
                  🎯 Machine Learning Focus
                </span>
                <p className="leading-relaxed text-slate-300">
                  {domainTips[activeDomain].focus}
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 bg-[#070D16]/80 rounded-lg border border-[#1A2E42]">
                <span className="font-bold text-white block text-[11px] tracking-wider uppercase text-slate-400">
                  📈 Expected Corporate Benefit
                </span>
                <p className="leading-relaxed text-slate-300">
                  {domainTips[activeDomain].benefit}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
