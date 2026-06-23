# 📁 ChurnSight Project Structure

## Directory Organization

```
churn-analysis/
│
├── 📂 api/                          # Backend API Server
│   ├── main.py                      # FastAPI application with all endpoints
│   └── requirements.txt             # Python dependencies (FastAPI, scikit-learn, etc.)
│
├── 📂 src/                          # Frontend React Application
│   ├── components/                  # React Components
│   │   ├── OverviewTab.tsx          # Dashboard overview with metrics
│   │   ├── PredictTab.tsx           # Individual prediction interface
│   │   ├── CustomerDetailTab.tsx    # Deep customer analysis
│   │   ├── InnovationsTab.tsx       # Advanced ML features showcase
│   │   ├── SegmentDriftTab.tsx      # Markov chain analysis
│   │   └── BrandStrategyTab.tsx     # Retention strategies
│   ├── App.tsx                      # Main application component
│   ├── api.ts                       # API client for backend calls
│   ├── data.ts                      # Type definitions and constants
│   ├── index.css                    # Glassmorphism styles
│   └── main.tsx                     # React entry point
│
├── 📂 ml_pipeline/                  # Machine Learning Training Scripts
│   ├── build_pipeline.py            # Master ML pipeline (all 4 models)
│   └── train_telecom.py             # Individual telecom model training
│
├── 📂 models/                       # Trained ML Models (Binary Pickle Files)
│   ├── model_telecom.pkl            # Telecom churn model (94% AUC)
│   ├── model_food.pkl               # Food delivery churn model (96% AUC)
│   ├── model_ecommerce.pkl          # E-commerce churn model (99% AUC)
│   └── model_ott.pkl                # OTT streaming churn model (97% AUC)
│
├── 📂 data/                         # Processed & Clean Datasets
│   ├── clean_telecom.csv            # Engineered features for telecom
│   ├── clean_food.csv               # Engineered features for food delivery
│   ├── clean_ecommerce.csv          # Engineered features for e-commerce
│   ├── clean_ott.csv                # Engineered features for OTT
│   └── telecom_result.txt           # Training metrics log
│
├── 📂 raw_data/                     # Original Raw Datasets
│   ├── Telco_customer_churn.xlsx    # Original telecom data
│   ├── E Commerce Dataset.xlsx      # Original e-commerce data
│   ├── E comm.xlsx                  # Alternative e-commerce source
│   ├── onlinedeliverydata.csv       # Original food delivery data
│   └── netflix_customer_churn.csv   # Original OTT streaming data
│
├── 📂 notebooks/                    # Jupyter Notebooks (EDA & Experiments)
│   ├── telecom.ipnyb                # Telecom data exploration
│   ├── food.ipnyb                   # Food delivery analysis
│   ├── ecoomerce.ipnyb              # E-commerce insights
│   └── ott.ipnyb                    # OTT streaming patterns
│
├── 📂 docker/                       # Docker Deployment Configuration
│   ├── docker-compose.yml           # Multi-container orchestration
│   ├── Dockerfile.api               # Backend container definition
│   ├── Dockerfile.frontend          # Frontend container definition
│   └── nginx.conf                   # Nginx reverse proxy config
│
├── 📂 docs/                         # Documentation
│   └── DEPLOYMENT.md                # Production deployment guide
│
├── 📂 assets/                       # Static Assets
│   └── .aistudio/                   # AI Studio metadata
│
├── 📄 package.json                  # Node.js dependencies
├── 📄 package-lock.json             # Locked dependency versions
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 vite.config.ts                # Vite bundler config
├── 📄 index.html                    # HTML entry point
├── 📄 metadata.json                 # Project metadata
├── 📄 .env.local                    # Environment variables (Gemini API key)
├── 📄 .env.example                  # Example environment file
├── 📄 .gitignore                    # Git ignore rules
├── 📄 .gitattributes                # Git attributes
└── 📄 README.md                     # Project overview (this file)
```

## 🎯 Key Folder Purposes

### `/api` - Backend Server
- FastAPI REST API serving ML models
- Handles predictions, batch processing, customer data
- Health checks and CORS configuration

### `/src` - Frontend Application
- React + TypeScript dashboard
- 6 interactive tabs with real-time data
- API integration layer and UI components

### `/ml_pipeline` - Training Scripts
- Data preprocessing and feature engineering
- Model training and evaluation
- Generates `/models/*.pkl` and `/data/clean_*.csv`

### `/models` - Trained Models
- Production-ready scikit-learn models
- 94-99% AUC performance across domains
- Loaded by FastAPI for real-time inference

### `/data` - Processed Data
- Clean datasets with engineered features
- Sentiment slopes, PageRank scores, micro-risk
- Used by frontend and API

### `/raw_data` - Original Datasets
- Unprocessed source data
- Excel and CSV files from 4 industries
- Input for ML pipeline

### `/docker` - Deployment
- Containerization for production
- Nginx proxy configuration
- Multi-service orchestration

### `/notebooks` - Experiments
- Jupyter notebooks for EDA
- Feature exploration and visualization
- Model prototyping

---

## 🚀 Workflow

1. **Data Pipeline**: `raw_data/*.xlsx` → `ml_pipeline/build_pipeline.py` → `data/clean_*.csv` + `models/*.pkl`
2. **Backend**: `api/main.py` loads `models/*.pkl` and serves predictions
3. **Frontend**: `src/App.tsx` calls `api/main.py` via `src/api.ts`
4. **Deployment**: `docker/docker-compose.yml` orchestrates both services

---

Perfect folder organization ✨
