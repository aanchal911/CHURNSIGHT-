// ChurnSight — API Client
// All calls go to /api (proxied to FastAPI in dev, Nginx in prod)

import { Domain, Customer, SegmentType } from './data';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// ── Endpoints ─────────────────────────────────────────────────────

export function fetchCustomers(domain: Domain, limit = 120): Promise<Customer[]> {
  return get(`/customers/${domain.toLowerCase()}?limit=${limit}`);
}

export function fetchOverview(domain: Domain): Promise<{
  total: number; high: number; medium: number; low: number; avg_score: number;
}> {
  return get(`/overview/${domain.toLowerCase()}`);
}

export function fetchDomainComparison(): Promise<{ name: string; avgScore: number }[]> {
  return get('/domain-comparison');
}

export function fetchSegmentDrift(domain: Domain): Promise<{
  matrix: number[][];
  counts_before: Record<SegmentType, number>;
  counts_after: Record<SegmentType, number>;
}> {
  return get(`/segment-drift/${domain.toLowerCase()}`);
}

export interface PredictResponse {
  churn_score: number;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  segment: SegmentType;
  prescriptions: Array<{
    feature: string;
    action: string;
    impactScore: number;
    newRisk: string;
  }>;
}

export function predictSingle(params: {
  domain: Domain;
  tenure: number;
  spend: number;
  frequency: number;
  sent_slope: number;
  sent_avg: number;
  micro_risk_score: number;
  days_inactive: number;
}): Promise<PredictResponse> {
  return post('/predict', params);
}

export async function predictBatch(
  domain: Domain,
  tenureCol: string,
  spendCol: string,
  freqCol: string,
  file: File
): Promise<Record<string, string | number>[]> {
  const form = new FormData();
  form.append('file', file);
  const url = `${BASE}/predict-batch?domain=${domain.toLowerCase()}&tenure_col=${tenureCol}&spend_col=${spendCol}&freq_col=${freqCol}`;
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Batch predict failed: ${res.status}`);
  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/health`);
    return r.ok;
  } catch {
    return false;
  }
}
