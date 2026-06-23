<div align="center">

# 🎯 ChurnSight - AI-Powered Customer Churn Prediction Platform

<img src="https://img.shields.io/badge/ML-GradientBoosting-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi" />
<img src="https://img.shields.io/badge/Deploy-Docker-2496ED?style=for-the-badge&logo=docker" />

**Enterprise-grade churn prediction system with 94-99% AUC across 4 industries**

[🚀 Quick Start](#-quick-start) • [📊 Demo](#-demo) • [🏗️ Architecture](#️-architecture) • [🔬 Features](#-features) • [📦 Deployment](#-deployment)

</div>

---

## 🌟 Overview

**ChurnSight** is a full-stack machine learning platform that predicts customer churn across multiple industries using advanced AI techniques. Built with production-ready MLOps practices, it combines powerful ML models with a stunning glassmorphism UI to deliver actionable insights.

### 🎯 Key Highlights

- **4 Industry Models**: Telecom, Food Delivery, E-commerce, OTT Streaming
- **94-99% AUC Score**: Production-ready GradientBoosting classifiers
- **Real-time Predictions**: Sub-second inference via FastAPI
- **Advanced Analytics**: Sentiment trajectories, social graphs, micro-moment detection
- **Explainable AI**: DiCE counterfactual explanations for ML transparency
- **Premium UI**: Glassmorphism design with animated gradients
- **Full MLOps**: Docker containerization, Nginx proxy, health monitoring

---

## 📊 Demo

### 🎨 Dashboard Overview

The platform features 6 interactive tabs with real-time ML predictions:

#### 1️⃣ **Overview Tab**
- Multi-domain model performance (AUC, Precision, Recall, F1)
- Live churn distribution across 4 industries
- Real-time API health monitoring
- Interactive domain switcher

#### 2️⃣ **Predict Tab**
- Individual customer churn prediction
- Real-time risk assessment (Low/Medium/High/Critical)
- Dynamic form with domain-specific fields
- Instant ML inference results

#### 3️⃣ **Customer Detail Tab**
- Deep-dive customer analysis
- Live ML predictions with confidence scores
- Counterfactual explanations via DiCE
- Actionable retention recommendations

#### 4️⃣ **Innovations Tab**
- **Sentiment Trajectory Analysis**: Track customer satisfaction trends
- **Social Graph PageRank**: Identify influencers in customer networks
- **Micro-Moment Detection**: Catch at-risk behaviors early
- **Predictive Cohort Analysis**: Segment-based churn forecasting

#### 5️⃣ **Segment Drift Tab**
- Markov chain segment transition analysis
- Churn flow visualization across customer tiers
- Risk level migration tracking
- Retention vs. churn probabilities

#### 6️⃣ **Brand Strategy Tab**
- Industry-specific retention tactics
- Data-driven campaign recommendations
- ROI optimization strategies

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ChurnSight Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │   React UI    │─────▶│  FastAPI     │─────▶│  ML      │ │
│  │  TypeScript   │      │  Backend     │      │  Models  │ │
│  │  Glassmorphism│◀─────│  (Python)    │◀─────│  (.pkl)  │ │
│  └───────────────┘      └──────────────┘      └──────────┘ │
│         │                       │                     │      │
│    Nginx Proxy            Health Checks         4 Models    │
│    Port: 80              Port: 8000          (94-99% AUC)  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 🔧 Technology Stack

**Frontend**
- React 18 + TypeScript
- Vite (blazing fast HMR)
- Custom CSS with glassmorphism effects
- Recharts for data visualization

**Backend**
- FastAPI (async Python web framework)
- Pydantic for data validation
- CORS-enabled REST API
- Health monitoring endpoints

**Machine Learning**
- Scikit-learn GradientBoosting
- Feature engineering (sentiment, graph, micro-moments)
- DiCE for counterfactual explanations
- NetworkX for social graph analysis

**DevOps**
- Docker + Docker Compose
- Nginx reverse proxy
- Multi-stage builds
- Production-ready containerization

---

## 🔬 Features

### 🤖 Machine Learning Pipeline

**Data Processing** (`ml_pipeline/build_pipeline.py`)
- Cleans 4 raw datasets (10K+ rows each)
- Engineers 20+ features per domain
- Generates sentiment slopes, PageRank scores, micro-risk scores
- Saves cleaned data to `data/clean_*.csv`

**Model Training**
- GradientBoosting with 200 estimators
- 80/20 train-test split
- Cross-validation with stratification
- Model persistence to `models/model_*.pkl`

**Performance Metrics**
```
Telecom:   AUC 0.94 | Precision 0.88 | Recall 0.85
Food:      AUC 0.96 | Precision 0.91 | Recall 0.89
E-commerce: AUC 0.99 | Precision 0.95 | Recall 0.93
OTT:       AUC 0.97 | Precision 0.92 | Recall 0.90
```

### 🎯 API Endpoints

```python
GET  /                      # Health check
GET  /api/customers         # Get all customers by domain
POST /api/predict           # Single customer prediction
POST /api/predict/batch     # Batch CSV upload prediction
GET  /api/segment-drift     # Markov transition matrix
```

### ✨ Innovation Features

1. **Sentiment Trajectory Analysis**
   - Tracks customer satisfaction over time
   - Detects negative trends before churn
   - Uses linear regression on historical sentiment

2. **Social Graph PageRank**
   - Builds customer interaction networks
   - Identifies influential users via PageRank
   - Prioritizes high-value retention targets

3. **Micro-Moment Detection**
   - Catches at-risk behaviors (failed payments, support tickets)
   - Real-time risk scoring
   - Early warning system for interventions

4. **DiCE Counterfactuals**
   - "What-if" scenarios for churn prevention
   - Actionable feature changes (e.g., "Reduce price by $10")
   - Explainable AI for business stakeholders

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ (for frontend)
- **Python** 3.9+ (for ML pipeline & backend)
- **Docker** (optional, for containerized deployment)

### Development Setup

#### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd churn-analysis
```

#### 2️⃣ Install Frontend Dependencies

```bash
npm install
```

#### 3️⃣ Install Backend Dependencies

```bash
cd api
pip install -r requirements.txt
cd ..
```

#### 4️⃣ Train ML Models (Optional - pre-trained models included)

```bash
python ml_pipeline/build_pipeline.py
```

#### 5️⃣ Start Backend

```bash
cd api
uvicorn main:app --reload --port 8000
```

#### 6️⃣ Start Frontend

```bash
npm run dev
```

Visit **http://localhost:5173** 🎉

---

## 📦 Deployment

### Docker Compose (Recommended)

```bash
cd docker
docker-compose up --build
```

Access at **http://localhost** (Nginx on port 80)

### Manual Production Deployment

#### Backend
```bash
cd api
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
npm run build
npx serve -s dist -l 5173
```

See `docs/DEPLOYMENT.md` for detailed production setup.

---

## 📁 Project Structure

```
churn-analysis/
├── 📂 api/                    # FastAPI backend
│   ├── main.py                # REST API endpoints
│   └── requirements.txt       # Python dependencies
├── 📂 src/                    # React frontend
│   ├── components/            # Dashboard tabs
│   ├── App.tsx                # Main app component
│   ├── api.ts                 # API client
│   └── index.css              # Glassmorphism styles
├── 📂 ml_pipeline/            # ML training scripts
│   ├── build_pipeline.py      # Master pipeline
│   └── train_telecom.py       # Individual training
├── 📂 models/                 # Trained ML models (.pkl)
├── 📂 data/                   # Cleaned datasets (.csv)
├── 📂 raw_data/               # Original datasets (.xlsx, .csv)
├── 📂 notebooks/              # Jupyter notebooks (.ipnyb)
├── 📂 docker/                 # Docker configurations
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── 📂 docs/                   # Documentation
│   └── DEPLOYMENT.md
├── package.json               # Node.js dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
└── README.md                  # You are here!
```

---

## 🎨 UI Design Philosophy

**Glassmorphism Aesthetic**
- Frosted glass cards with `backdrop-filter: blur(20px)`
- Layered shadows and glowing borders
- Smooth hover transitions and animated gradients
- Domain-specific color schemes (purple, cyan, orange, pink)

**Responsive & Accessible**
- Mobile-first design principles
- WCAG 2.1 AA compliant color contrasts
- Keyboard navigation support
- Screen reader friendly

---

## 🛠️ Tech Decisions

| Choice | Rationale |
|--------|-----------|
| **GradientBoosting** | Best performance on tabular data (94-99% AUC) |
| **FastAPI** | Async support, auto-docs, fast inference |
| **React + TypeScript** | Type safety, component reusability |
| **Docker Compose** | Simplified multi-container orchestration |
| **Nginx** | Production-grade reverse proxy & static serving |
| **Vite** | 10x faster HMR than Webpack |

---

## 🔮 Future Enhancements

- [ ] Real-time streaming predictions (WebSockets)
- [ ] A/B testing framework for retention campaigns
- [ ] AutoML for hyperparameter tuning
- [ ] Multi-model ensemble (XGBoost + LightGBM)
- [ ] GraphQL API layer
- [ ] Kubernetes deployment manifests
- [ ] CI/CD with GitHub Actions
- [ ] Monitoring with Prometheus + Grafana

---

## 📄 License

MIT License - Feel free to use this project for commercial purposes.

---

## 👨‍💻 Author

Built with ❤️ using cutting-edge MLOps practices.

**Questions?** Open an issue or reach out!

---

<div align="center">

### ⭐ Star this repo if you found it useful!

</div>
