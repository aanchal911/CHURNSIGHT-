// ChurnSight Multi-Domain Mock Data & Intelligence Models

export type Domain = 'Telecom' | 'Food' | 'Ecommerce' | 'OTT';

export interface Customer {
  id: string;
  name: string;
  tenure: number; // in months
  spend: number; // USD / INR
  frequency: number; // orders or actions / month
  churn_score: number; // 0 - 100
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  sent_slope: number; // -1 to +1 (sentiment trend)
  sent_avg: number; // -1 to +1
  pagerank_score: number; // social graph influence
  churn_neighbor_ratio: number; // ratio of connections who churned
  micro_risk_score: number; // pre-churn event sequence score
  days_inactive: number; // inactivity days
  segment: 'Champions' | 'Loyal' | 'At-Risk' | 'Dormant';
}

// Custom segments
export type SegmentType = 'Champions' | 'Loyal' | 'At-Risk' | 'Dormant';

export const DOMAINS: Domain[] = ["Telecom", "Food", "Ecommerce", "OTT"];

export const DOMAIN_COLORS: Record<Domain, string> = {
  Telecom: '#14A899', // Cyan/Teal
  Food: '#BA7517', // Amber/Orange
  Ecommerce: '#534AB7', // Indigo
  OTT: '#E05252' // Coral/Red
};

export const RISK_COLORS = {
  HIGH: '#E05252',
  MEDIUM: '#BA7517',
  LOW: '#1D9E75'
};

export const SEG_COLORS: Record<SegmentType, string> = {
  Champions: '#1D9E75',
  Loyal: '#534AB7',
  'At-Risk': '#E05252',
  Dormant: '#8FA3B1'
};

// Seed names
const FIRST_NAMES = ["Amit", "Neha", "Rohan", "Priya", "Vikram", "Ananya", "Rahul", "Pooja", "Arjun", "Aditi", "Siddharth", "Kavya", "Sanjay", "Meera", "Kabir", "Zara", "Aarav", "Riya", "Yash", "Sneha"];
const LAST_NAMES = ["Sharma", "Verma", "Gupta", "Mehta", "Singh", "Joshi", "Patel", "Reddy", "Nair", "Rao", "Iyer", "Kumar", "Choudhury", "Das", "Roy", "Sen", "Bose", "Mishra", "Pandey", "Saxena"];

function generateName(index: number): string {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[(index + 7) % LAST_NAMES.length];
  return `${first} ${last}`;
}

// Generate high-fidelity mock customers for a domain
export function generateDomainCustomers(domain: Domain, count: number = 80): Customer[] {
  const customers: Customer[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = `${domain.substring(0, 3).toUpperCase()}-${1000 + i}`;
    const name = generateName(i);
    
    // Core parameters differ by domain
    let baseTenure = 12;
    let baseSpend = 500;
    let baseFreq = 5;
    
    if (domain === 'Telecom') {
      baseTenure = Math.floor(Math.random() * 60) + 2;
      baseSpend = Math.floor(Math.random() * 1500) + 199;
      baseFreq = Math.floor(Math.random() * 40) + 10; // calls/data events
    } else if (domain === 'Food') {
      baseTenure = Math.floor(Math.random() * 18) + 1;
      baseSpend = Math.floor(Math.random() * 6000) + 200;
      baseFreq = Math.floor(Math.random() * 25) + 1; // orders per month
    } else if (domain === 'Ecommerce') {
      baseTenure = Math.floor(Math.random() * 36) + 1;
      baseSpend = Math.floor(Math.random() * 12000) + 500;
      baseFreq = Math.floor(Math.random() * 12) + 1; // purchases per month
    } else if (domain === 'OTT') {
      baseTenure = Math.floor(Math.random() * 24) + 1;
      baseSpend = Math.floor(Math.random() * 800) + 149; // monthly subscription plan total
      baseFreq = Math.floor(Math.random() * 30) + 2; // watch sessions per month
    }

    // Induce correlation for realistic churn probability
    // Customers with short tenure, declining spend, low frequency tend to churn
    const sent_slope = parseFloat((Math.random() * 1.8 - 1.0).toFixed(2)); // -1.0 to 0.8
    const sent_avg = parseFloat((Math.random() * 1.6 - 0.7).toFixed(2)); // -0.7 to 0.9
    const pagerank_score = parseFloat((Math.random() * 0.05 + 0.001).toFixed(4));
    const churn_neighbor_ratio = parseFloat((Math.random() * 0.9).toFixed(2));
    const days_inactive = Math.floor(Math.random() * 28);
    const micro_risk_score = parseFloat((Math.random() * 0.8 + (days_inactive > 15 ? 0.2 : 0)).toFixed(2));

    // Calculate realistic churn score (0 to 100)
    let scoreBase = 40; // Default anchor
    
    // Tenure effect (longer tenure lowers churn risk)
    scoreBase -= (baseTenure / (domain === 'Telecom' ? 60 : 24)) * 25;
    
    // Frequency effect (higher frequency lowers churn risk)
    scoreBase -= (baseFreq / (domain === 'Telecom' ? 50 : 20)) * 20;
    
    // Inactivity effect (more inactive days increases risk)
    scoreBase += (days_inactive / 30) * 35;
    
    // Sentiment slope effect (negative slope increases risk)
    scoreBase -= sent_slope * 25;
    
    // Micro risk effect
    scoreBase += micro_risk_score * 20;
    
    // Social neighbor effect (connected to churners increases risk)
    scoreBase += churn_neighbor_ratio * 15;

    // Normalize score to 0 - 100
    const churn_score = Math.min(100, Math.max(0, Math.round(scoreBase)));
    
    // Categorize Risk
    let risk: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (churn_score >= 70) risk = 'HIGH';
    else if (churn_score >= 40) risk = 'MEDIUM';

    // Segment Assignment
    let segment: SegmentType = 'Loyal';
    if (churn_score >= 70) {
      segment = 'At-Risk';
    } else if (churn_score < 30 && baseTenure > 12) {
      segment = 'Champions';
    } else if (days_inactive > 20) {
      segment = 'Dormant';
    } else if (churn_score >= 40) {
      segment = 'At-Risk';
    } else {
      segment = 'Loyal';
    }

    customers.push({
      id,
      name,
      tenure: baseTenure,
      spend: baseSpend,
      frequency: baseFreq,
      churn_score,
      risk,
      sent_slope,
      sent_avg,
      pagerank_score,
      churn_neighbor_ratio,
      micro_risk_score: Math.min(1, Math.max(0, parseFloat(micro_risk_score.toFixed(2)))),
      days_inactive,
      segment
    });
  }

  // Sort by churn score descending
  return customers.sort((a, b) => b.churn_score - a.churn_score);
}

// Generate combined dataset
export const ALL_DATASETS: Record<Domain, Customer[]> = {
  Telecom: generateDomainCustomers('Telecom', 120),
  Food: generateDomainCustomers('Food', 95),
  Ecommerce: generateDomainCustomers('Ecommerce', 110),
  OTT: generateDomainCustomers('OTT', 130)
};

// Predictor function simulating ML model predictions
export function predictCustomerChurn(
  domain: Domain,
  tenure: number,
  spend: number,
  frequency: number,
  sent_slope: number,
  micro_risk_score: number,
  days_inactive: number
): { churn_score: number; risk: 'HIGH' | 'MEDIUM' | 'LOW'; segment: SegmentType } {
  let scoreBase = 45;

  // Heuristics based on domain constraints
  if (domain === 'Telecom') {
    scoreBase -= (tenure / 60) * 30;
    scoreBase -= (frequency / 40) * 15;
    scoreBase += (days_inactive / 30) * 25;
  } else if (domain === 'Food') {
    scoreBase -= (tenure / 18) * 20;
    scoreBase -= (frequency / 25) * 25;
    scoreBase += (days_inactive / 30) * 35;
  } else if (domain === 'Ecommerce') {
    scoreBase -= (tenure / 36) * 25;
    scoreBase -= (frequency / 12) * 20;
    scoreBase += (days_inactive / 30) * 30;
  } else { // OTT
    scoreBase -= (tenure / 24) * 25;
    scoreBase -= (frequency / 30) * 20;
    scoreBase += (days_inactive / 30) * 35;
  }

  scoreBase -= sent_slope * 20;
  scoreBase += micro_risk_score * 20;

  const score = Math.min(100, Math.max(0, Math.round(scoreBase)));
  
  let risk: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (score >= 70) risk = 'HIGH';
  else if (score >= 40) risk = 'MEDIUM';

  let segment: SegmentType = 'Loyal';
  if (score >= 70) segment = 'At-Risk';
  else if (score < 30 && tenure > 12) segment = 'Champions';
  else if (days_inactive > 20) segment = 'Dormant';
  else if (score >= 40) segment = 'At-Risk';

  return {
    churn_score: score,
    risk,
    segment
  };
}

// Markov Segment Drift Transition Matrices for each domain
// Represents probability of migrating from state (Row) to state (Col)
// Order: Champions, Loyal, At-Risk, Dormant
export const SEGMENT_DRIFT_DATA: Record<Domain, {
  matrix: number[][]; // 4x4 matrix
  counts_before: Record<SegmentType, number>;
  counts_after: Record<SegmentType, number>;
}> = {
  Telecom: {
    matrix: [
      [0.85, 0.12, 0.03, 0.00], // Champions to others
      [0.08, 0.76, 0.14, 0.02], // Loyal to others
      [0.01, 0.15, 0.62, 0.22], // At-Risk to others
      [0.00, 0.02, 0.18, 0.80]  // Dormant to others
    ],
    counts_before: { Champions: 350, Loyal: 850, 'At-Risk': 280, Dormant: 120 },
    counts_after: { Champions: 368, Loyal: 809, 'At-Risk': 314, Dormant: 209 }
  },
  Food: {
    matrix: [
      [0.72, 0.20, 0.08, 0.00],
      [0.10, 0.65, 0.20, 0.05],
      [0.02, 0.12, 0.55, 0.31],
      [0.01, 0.05, 0.22, 0.72]
    ],
    counts_before: { Champions: 210, Loyal: 620, 'At-Risk': 340, Dormant: 180 },
    counts_after: { Champions: 221, Loyal: 541, 'At-Risk': 371, Dormant: 217 }
  },
  Ecommerce: {
    matrix: [
      [0.80, 0.15, 0.05, 0.00],
      [0.06, 0.74, 0.16, 0.04],
      [0.02, 0.10, 0.58, 0.30],
      [0.01, 0.03, 0.15, 0.81]
    ],
    counts_before: { Champions: 420, Loyal: 910, 'At-Risk': 290, Dormant: 240 },
    counts_after: { Champions: 399, Loyal: 852, 'At-Risk': 335, Dormant: 274 }
  },
  OTT: {
    matrix: [
      [0.78, 0.16, 0.06, 0.00],
      [0.05, 0.70, 0.20, 0.05],
      [0.01, 0.08, 0.50, 0.41],
      [0.00, 0.02, 0.12, 0.86]
    ],
    counts_before: { Champions: 510, Loyal: 1100, 'At-Risk': 450, Dormant: 320 },
    counts_after: { Champions: 457, Loyal: 978, 'At-Risk': 529, Dormant: 416 }
  }
};

// Counterfactual simulation (What-if analysis)
// Suggests minimum changes to shift a customer from HIGH risk to LOW or MEDIUM risk
export function getCounterfactualSuggestions(
  domain: Domain,
  tenure: number,
  spend: number,
  frequency: number,
  sent_slope: number,
  micro_risk_score: number,
  days_inactive: number
): {
  originalScore: number;
  originalRisk: string;
  prescriptions: Array<{
    feature: string;
    action: string;
    impactScore: number;
    newRisk: string;
  }>;
} {
  const orig = predictCustomerChurn(domain, tenure, spend, frequency, sent_slope, micro_risk_score, days_inactive);
  
  const prescriptions: Array<{ feature: string; action: string; impactScore: number; newRisk: string }> = [];

  if (orig.risk === 'HIGH' || orig.risk === 'MEDIUM') {
    // Scenario A: Reduce inactive days
    if (days_inactive > 5) {
      const targetDays = 3;
      const res = predictCustomerChurn(domain, tenure, spend, frequency, sent_slope, micro_risk_score, targetDays);
      if (res.churn_score < orig.churn_score) {
        prescriptions.push({
          feature: 'Days Inactive',
          action: `Reduce inactivity from ${days_inactive} to ${targetDays} days (via re-engagement push campaigns)`,
          impactScore: res.churn_score,
          newRisk: res.risk
        });
      }
    }

    // Scenario B: Boost sentiment slope (recent feedback trend)
    if (sent_slope < 0.4) {
      const targetSlope = 0.5;
      const res = predictCustomerChurn(domain, tenure, spend, frequency, targetSlope, micro_risk_score, days_inactive);
      if (res.churn_score < orig.churn_score) {
        prescriptions.push({
          feature: 'Sentiment Trajectory',
          action: `Improve recent customer relationship trend to +${targetSlope} (resolve complaints or give VIP call)`,
          impactScore: res.churn_score,
          newRisk: res.risk
        });
      }
    }

    // Scenario C: Increase frequency
    const targetFreq = frequency + 5;
    const res = predictCustomerChurn(domain, tenure, spend, targetFreq, sent_slope, micro_risk_score, days_inactive);
    if (res.churn_score < orig.churn_score) {
      prescriptions.push({
        feature: 'Usage Frequency',
        action: `Increase usage frequency by +5 sessions/orders (via targeted personalized discount vouchers)`,
        impactScore: res.churn_score,
        newRisk: res.risk
      });
    }
  }

  return {
    originalScore: orig.churn_score,
    originalRisk: orig.risk,
    prescriptions: prescriptions.sort((a, b) => a.impactScore - b.impactScore)
  };
}
