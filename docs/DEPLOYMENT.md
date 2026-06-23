# 🔥 ChurnSight — Full-Stack MLOps Deployment Guide

Multi-domain churn prediction platform with FastAPI backend + React frontend.

## 🚀 Quick Start (Development)

### Option 1: Manual (2 terminals)
```bash
# Terminal 1 — FastAPI Backend
cd api
pip install -r requirements.txt
python -m uvicorn main:app --reload --port=8000

# Terminal 2 — React Frontend  
npm install
npm run dev
```
Frontend: `http://localhost:3000`
API docs: `http://localhost:8000/docs`

### Option 2: Concurrently (1 terminal)
```bash
npm install
npm run dev:full
```

## 🐳 Production (Docker)

```bash
# Build & run both containers
docker-compose up --build

# Access the app
open http://localhost:3000
```

Containers:
- **Frontend**: React app served by Nginx (port 3000)
- **API**: FastAPI with ML models (port 8000)
- **Networking**: Frontend proxies `/api/*` → FastAPI

## 📂 Architecture

```
/churn-analysis
├── api/                    # FastAPI backend
│   ├── main.py            # ML endpoints
│   └── requirements.txt   # Python deps
├── src/                   # React frontend
│   ├── components/        # UI components
│   ├── api.ts            # API client
│   └── data.ts           # Types & mock data
├── data/                  # Trained CSV files
│   └── clean_*.csv       # Real customer data
├── models/                # Trained ML models
│   └── model_*.pkl       # Scikit-learn models
├── docker-compose.yml     # Orchestration
├── Dockerfile.api         # FastAPI container
└── Dockerfile.frontend    # React + Nginx container
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service health check |
| `/api/customers/{domain}` | GET | Real customer data from CSV |
| `/api/predict` | POST | Single customer prediction |
| `/api/predict-batch` | POST | CSV batch predictions |
| `/api/segment-drift/{domain}` | GET | Markov transition matrices |

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL (dev) | `http://localhost:8000` |
| `DISABLE_HMR` | Disable hot reload | `false` |

## 🎯 MLOps Pipeline

1. **Training**: `build_pipeline.py` processes raw CSVs → clean data + models
2. **Serving**: FastAPI loads `.pkl` models → real-time predictions  
3. **Frontend**: React calls API → live dashboard updates
4. **Deployment**: Docker containerizes everything → production ready

## 🐛 Troubleshooting

**API connection issues:**
```bash
# Check API health
curl http://localhost:8000/api/health

# Verify models exist
ls -la models/model_*.pkl

# Check data files
ls -la data/clean_*.csv
```

**Frontend proxy issues:**
- Dev: Vite proxies `/api` → `localhost:8000`
- Prod: Nginx routes `/api` → `api:8000` container

**Docker issues:**
```bash
# Rebuild containers
docker-compose down
docker-compose up --build --force-recreate

# Check logs
docker-compose logs api
docker-compose logs frontend
```

## 📊 Innovation Features

- **Sentiment Trajectory**: NLP analysis of support tickets
- **Social Graph**: PageRank influence scoring  
- **Micro-Moments**: Real-time event sequence detection
- **DiCE Counterfactuals**: What-if retention scenarios
- **Markov Drift**: Customer segment migration patterns

## 🎨 Tech Stack

**Frontend**: React 19 + TypeScript + Tailwind CSS + Recharts + Motion  
**Backend**: FastAPI + Pandas + Scikit-learn + Uvicorn  
**ML**: GradientBoosting + Feature Engineering + Counterfactual Analysis  
**DevOps**: Docker + Docker Compose + Nginx + Multi-stage builds  
**Data**: 4 domains (Telecom, Food, Ecommerce, OTT) with 10K+ records