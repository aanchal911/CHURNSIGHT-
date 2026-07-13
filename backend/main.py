# ================================================================
# ChurnSight — FastAPI Backend
# Serves real ML predictions + CSV data to the React frontend
# ================================================================

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import numpy as np
import joblib
import io
import os

app = FastAPI(title="ChurnSight API", version="1.0.0")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Paths ─────────────────────────────────────────────────────────
_HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(_HERE, "data")
MODELS_DIR = os.path.join(_HERE, "models")

DOMAINS = ["telecom", "food", "ecommerce", "ott"]

# ── Load models once at startup ───────────────────────────────────
models: dict = {}
for domain in DOMAINS:
    path = os.path.join(MODELS_DIR, f"model_{domain}.pkl")
    if os.path.exists(path):
        try:
            models[domain] = joblib.load(path)
        except Exception as e:
            print(f"[WARN] Could not load model for {domain}: {e}")

# ── Load CSVs once at startup ─────────────────────────────────────
dataframes: dict = {}
for domain in DOMAINS:
    path = os.path.join(DATA_DIR, f"clean_{domain}.csv")
    if os.path.exists(path):
        dataframes[domain] = pd.read_csv(path)

# ── Helpers ───────────────────────────────────────────────────────
RISK_COLORS = {"HIGH": "#E05252", "MEDIUM": "#BA7517", "LOW": "#1D9E75"}

def score_to_risk(score: float) -> str:
    if score >= 70: return "HIGH"
    if score >= 40: return "MEDIUM"
    return "LOW"

def score_to_segment(score: float, tenure: float, days_inactive: float) -> str:
    if score >= 70:             return "At-Risk"
    if score < 30 and tenure > 12: return "Champions"
    if days_inactive > 20:     return "Dormant"
    if score >= 40:             return "At-Risk"
    return "Loyal"

def run_model(domain: str, features: dict) -> float:
    model = models.get(domain)
    if model is None:
        return fallback_score(features)
    df = pd.DataFrame([features])
    try:
        feats = list(model.feature_names_in_)
        X = df.reindex(columns=feats, fill_value=0).apply(
            pd.to_numeric, errors="coerce").fillna(0)
        return round(float(model.predict_proba(X)[0, 1]) * 100, 1)
    except Exception:
        return fallback_score(features)

def fallback_score(f: dict) -> float:
    tenure       = float(f.get("tenure", 12))
    spend        = float(f.get("spend", 1000))
    frequency    = float(f.get("frequency", 5))
    sent_slope   = float(f.get("sent_slope", 0))
    micro        = float(f.get("micro_risk_score", 0.3))
    days_inact   = float(f.get("days_inactive", 5))
    score = (
        (1 - min(tenure, 60) / 60) * 35 +
        (1 - min(frequency, 30) / 30) * 25 +
        (1 - min(spend, 3000) / 3000) * 20 +
        (days_inact / 30) * 10 +
        micro * 10
    )
    return round(min(100, max(0, score)), 1)

def df_to_customers(df: pd.DataFrame, domain: str, limit: int = 120) -> list:
    """Convert a cleaned CSV dataframe into customer dicts for the frontend."""
    rows = []
    # normalise column names to lowercase
    df = df.copy()
    df.columns = df.columns.str.lower()

    id_col      = next((c for c in df.columns if "id" in c), None)
    tenure_col  = "tenure"
    spend_col   = "spend"
    freq_col    = "frequency"
    slope_col   = "sent_slope"
    avg_col     = "sent_avg"
    pr_col      = "pagerank_score"
    cnr_col     = "churn_neighbor_ratio"
    micro_col   = "micro_risk_score"
    score_col   = "churn_score"
    risk_col    = "risk"

    FIRST = ["Amit","Neha","Rohan","Priya","Vikram","Ananya","Rahul","Pooja",
             "Arjun","Aditi","Siddharth","Kavya","Sanjay","Meera","Kabir",
             "Zara","Aarav","Riya","Yash","Sneha"]
    LAST  = ["Sharma","Verma","Gupta","Mehta","Singh","Joshi","Patel","Reddy",
             "Nair","Rao","Iyer","Kumar","Choudhury","Das","Roy"]

    # days inactive column differs by domain
    inactive_col = next(
        (c for c in ["days_no_watch", "order_gap_days", "days_inactive"]
         if c in df.columns), None)

    sample = df.head(limit)
    for i, row in sample.iterrows():
        idx = int(str(i).replace(".", "")) % len(FIRST)
        name = f"{FIRST[idx % len(FIRST)]} {LAST[idx % len(LAST)]}"
        cid  = str(row[id_col]) if id_col else f"{domain[:3].upper()}-{1000+i}"

        tenure    = float(row.get(tenure_col, 12) or 12)
        spend     = float(row.get(spend_col, 500) or 500)
        freq      = float(row.get(freq_col, 5) or 5)
        slope     = float(row.get(slope_col, 0) or 0)
        sent_avg  = float(row.get(avg_col, 0) or 0)
        pr        = float(row.get(pr_col, 0.003) or 0.003)
        cnr       = float(row.get(cnr_col, 0.2) or 0.2)
        micro     = float(row.get(micro_col, 0.3) or 0.3)
        days_in   = float(row[inactive_col]) if inactive_col and pd.notna(row.get(inactive_col)) else 5
        churn_sc  = float(row.get(score_col, 50) or 50)
        risk      = str(row.get(risk_col, score_to_risk(churn_sc))).upper()
        if risk not in ("HIGH","MEDIUM","LOW"):
            risk = score_to_risk(churn_sc)
        segment   = score_to_segment(churn_sc, tenure, days_in)

        rows.append({
            "id":                   cid,
            "name":                 name,
            "tenure":               round(tenure, 1),
            "spend":                round(spend, 1),
            "frequency":            round(freq, 1),
            "churn_score":          round(churn_sc, 1),
            "risk":                 risk,
            "sent_slope":           round(slope, 3),
            "sent_avg":             round(sent_avg, 3),
            "pagerank_score":       round(pr, 5),
            "churn_neighbor_ratio": round(min(cnr, 1), 3),
            "micro_risk_score":     round(min(micro, 1), 3),
            "days_inactive":        round(days_in, 1),
            "segment":              segment,
            "domain":               domain.capitalize(),
        })

    rows.sort(key=lambda x: x["churn_score"], reverse=True)
    return rows


# ══════════════════════════════════════════════════════════════════
# ROUTES
# ══════════════════════════════════════════════════════════════════

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "models":  list(models.keys()),
        "datasets": list(dataframes.keys()),
    }


@app.get("/api/customers/{domain}")
def get_customers(domain: str, limit: int = 10000):
    domain = domain.lower()
    if domain not in dataframes:
        raise HTTPException(404, f"Domain '{domain}' not found")
    return df_to_customers(dataframes[domain], domain, limit)


@app.get("/api/overview/{domain}")
def get_overview(domain: str):
    domain = domain.lower()
    if domain not in dataframes:
        raise HTTPException(404, f"Domain '{domain}' not found")
    df   = dataframes[domain]
    df.columns = df.columns.str.lower()
    total = len(df)
    high  = int((df["risk"].str.upper() == "HIGH").sum())   if "risk" in df.columns else 0
    med   = int((df["risk"].str.upper() == "MEDIUM").sum()) if "risk" in df.columns else 0
    low   = int((df["risk"].str.upper() == "LOW").sum())    if "risk" in df.columns else 0
    avg_s = float(df["churn_score"].mean()) if "churn_score" in df.columns else 0
    return {"total": total, "high": high, "medium": med, "low": low, "avg_score": round(avg_s, 1)}


# ── Single-customer predict ───────────────────────────────────────
class PredictRequest(BaseModel):
    domain:          str
    tenure:          float = 12
    spend:           float = 1000
    frequency:       float = 5
    sent_slope:      float = 0.0
    sent_avg:        float = 0.2
    micro_risk_score:float = 0.3
    days_inactive:   float = 5

@app.post("/api/predict")
def predict_single(req: PredictRequest):
    domain = req.domain.lower()
    feats = {
        "tenure":           req.tenure,
        "spend":            req.spend,
        "frequency":        req.frequency,
        "sent_slope":       req.sent_slope,
        "sent_avg":         req.sent_avg,
        "micro_risk_score": req.micro_risk_score,
        "ott_micro_score":  req.micro_risk_score,
        "days_no_watch":    req.days_inactive,
        "order_gap_days":   req.days_inactive,
        "days_inactive":    req.days_inactive,
    }
    score   = run_model(domain, feats)
    risk    = score_to_risk(score)
    segment = score_to_segment(score, req.tenure, req.days_inactive)

    # Counterfactuals
    prescriptions = []
    if risk in ("HIGH", "MEDIUM"):
        if req.days_inactive > 5:
            f2 = {**feats, "days_no_watch": 3, "order_gap_days": 3, "days_inactive": 3}
            s2 = run_model(domain, f2)
            if s2 < score:
                prescriptions.append({
                    "feature": "Days Inactive",
                    "action":  f"Reduce inactivity to 3 days via re-engagement push",
                    "impactScore": s2,
                    "newRisk": score_to_risk(s2),
                })
        if req.sent_slope < 0.4:
            f2 = {**feats, "sent_slope": 0.5}
            s2 = run_model(domain, f2)
            if s2 < score:
                prescriptions.append({
                    "feature": "Sentiment Trajectory",
                    "action":  "Improve sentiment to +0.5 via VIP care call",
                    "impactScore": s2,
                    "newRisk": score_to_risk(s2),
                })
        f2 = {**feats, "frequency": req.frequency + 5}
        s2 = run_model(domain, f2)
        if s2 < score:
            prescriptions.append({
                "feature": "Usage Frequency",
                "action":  "Boost frequency +5 via personalised discount",
                "impactScore": s2,
                "newRisk": score_to_risk(s2),
            })

    return {
        "churn_score":   score,
        "risk":          risk,
        "segment":       segment,
        "prescriptions": sorted(prescriptions, key=lambda x: x["impactScore"]),
    }


# ── Batch CSV predict ─────────────────────────────────────────────
@app.post("/api/predict-batch")
async def predict_batch(
    domain: str,
    tenure_col: str,
    spend_col: str,
    freq_col: str,
    file: UploadFile = File(...),
):
    domain = domain.lower()
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"CSV parse error: {e}")

    results = []
    for _, row in df.iterrows():
        tenure    = float(row.get(tenure_col, 0) or 0)
        spend     = float(row.get(spend_col, 0) or 0)
        frequency = float(row.get(freq_col, 0) or 0)
        feats = {
            "tenure": tenure, "spend": spend, "frequency": frequency,
            "sent_slope": 0, "sent_avg": 0,
            "micro_risk_score": 0.1, "ott_micro_score": 0.1,
            "days_no_watch": 0, "order_gap_days": 0, "days_inactive": 0,
        }
        score = run_model(domain, feats)
        risk  = score_to_risk(score)
        results.append({**row.to_dict(), "Churn_Score_%": score, "Risk_Level": risk})

    return results


# ── Segment drift (Markov data) ───────────────────────────────────
SEGMENT_DRIFT = {
    "telecom": {
        "matrix": [
            [0.85, 0.12, 0.03, 0.00],
            [0.08, 0.76, 0.14, 0.02],
            [0.01, 0.15, 0.62, 0.22],
            [0.00, 0.02, 0.18, 0.80],
        ],
        "counts_before": {"Champions":350,"Loyal":850,"At-Risk":280,"Dormant":120},
        "counts_after":  {"Champions":368,"Loyal":809,"At-Risk":314,"Dormant":209},
    },
    "food": {
        "matrix": [
            [0.72, 0.20, 0.08, 0.00],
            [0.10, 0.65, 0.20, 0.05],
            [0.02, 0.12, 0.55, 0.31],
            [0.01, 0.05, 0.22, 0.72],
        ],
        "counts_before": {"Champions":210,"Loyal":620,"At-Risk":340,"Dormant":180},
        "counts_after":  {"Champions":221,"Loyal":541,"At-Risk":371,"Dormant":217},
    },
    "ecommerce": {
        "matrix": [
            [0.80, 0.15, 0.05, 0.00],
            [0.06, 0.74, 0.16, 0.04],
            [0.02, 0.10, 0.58, 0.30],
            [0.01, 0.03, 0.15, 0.81],
        ],
        "counts_before": {"Champions":420,"Loyal":910,"At-Risk":290,"Dormant":240},
        "counts_after":  {"Champions":399,"Loyal":852,"At-Risk":335,"Dormant":274},
    },
    "ott": {
        "matrix": [
            [0.78, 0.16, 0.06, 0.00],
            [0.05, 0.70, 0.20, 0.05],
            [0.01, 0.08, 0.50, 0.41],
            [0.00, 0.02, 0.12, 0.86],
        ],
        "counts_before": {"Champions":510,"Loyal":1100,"At-Risk":450,"Dormant":320},
        "counts_after":  {"Champions":457,"Loyal":978,"At-Risk":529,"Dormant":416},
    },
}

@app.get("/api/segment-drift/{domain}")
def get_segment_drift(domain: str):
    domain = domain.lower()
    if domain not in SEGMENT_DRIFT:
        raise HTTPException(404, f"Domain '{domain}' not found")
    return SEGMENT_DRIFT[domain]


@app.get("/api/domain-comparison")
def domain_comparison():
    result = []
    for domain in DOMAINS:
        df = dataframes.get(domain)
        if df is not None:
            df.columns = df.columns.str.lower()
            avg = float(df["churn_score"].mean()) if "churn_score" in df.columns else 50
            result.append({"name": domain.capitalize(), "avgScore": round(avg, 1)})
    return result
