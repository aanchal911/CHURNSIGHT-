# ================================================================
# ChurnSight — Master Pipeline
# Builds clean CSVs + trained models for all 4 domains
# Run: python build_pipeline.py
# ================================================================

import pandas as pd
import numpy as np
import joblib, os, warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import roc_auc_score, classification_report

os.makedirs('data', exist_ok=True)
os.makedirs('models', exist_ok=True)


# ── helpers ───────────────────────────────────────────────────────
def add_sentiment(df, n):
    """Simulate sentiment slope & avg for n rows."""
    rng = np.random.default_rng(42)
    df['sent_slope'] = rng.normal(-0.05, 0.3, n)
    df.loc[df['churn'] == 1, 'sent_slope'] -= 0.25
    df['sent_avg'] = rng.normal(0.1, 0.4, n).clip(-1, 1)
    return df


def add_micro(df, inactive_col, n):
    """Add micro-risk score from inactivity + complaints."""
    rng = np.random.default_rng(7)
    df['micro_risk_score'] = (
        df[inactive_col].clip(0, 30) / 30 * 0.6 +
        rng.uniform(0, 0.4, n)
    ).clip(0, 1)
    return df


def add_graph(df, n):
    """Simulate network graph features."""
    rng = np.random.default_rng(13)
    df['pagerank_score']       = rng.uniform(0.001, 0.01, n)
    df['churn_neighbor_ratio'] = rng.uniform(0, 0.6, n)
    df.loc[df['churn'] == 1, 'churn_neighbor_ratio'] += 0.2
    df['churn_neighbor_ratio'] = df['churn_neighbor_ratio'].clip(0, 1)
    df['degree_centrality']    = rng.uniform(0.01, 0.3, n)
    return df


def churn_score_col(df, model, feats):
    X = df[feats].fillna(0)
    df['churn_score'] = (model.predict_proba(X)[:, 1] * 100).round(1)
    df['risk'] = pd.cut(df['churn_score'],
                        bins=[-1, 40, 70, 101],
                        labels=['LOW', 'MEDIUM', 'HIGH'])
    return df


def train_save(X, y, domain):
    X = X.fillna(0)
    Xt, Xv, yt, yv = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)
    clf = GradientBoostingClassifier(
        n_estimators=150, learning_rate=0.08,
        max_depth=4, random_state=42)
    clf.fit(Xt, yt)
    auc = roc_auc_score(yv, clf.predict_proba(Xv)[:, 1])
    print(f"  [{domain}] AUC = {auc:.4f}")
    print(classification_report(yv, clf.predict(Xv),
          target_names=['Retained', 'Churned'], digits=3))
    joblib.dump(clf, f'models/model_{domain.lower()}.pkl')
    return clf


# ══════════════════════════════════════════════════════════════════
# 1 — OTT  (netflix_customer_churn.csv)
# ══════════════════════════════════════════════════════════════════
print("\n=== OTT ===")
ott = pd.read_csv('netflix_customer_churn.csv')
ott.columns = ott.columns.str.strip().str.lower().str.replace(' ', '_')

ott = ott.rename(columns={
    'churned':              'churn',
    'monthly_fee':         'spend',
    'last_login_days':     'days_no_watch',
    'watch_hours':         'frequency',
})

# tenure proxy from age bucket
ott['tenure'] = (ott['age'] - 18).clip(0, 60)

n = len(ott)
ott = add_sentiment(ott, n)
ott = add_micro(ott, 'days_no_watch', n)
ott['ott_micro_score'] = ott['micro_risk_score']
ott = add_graph(ott, n)

feats_ott = ['tenure', 'spend', 'frequency', 'days_no_watch',
             'sent_slope', 'sent_avg', 'micro_risk_score',
             'ott_micro_score', 'pagerank_score',
             'churn_neighbor_ratio', 'degree_centrality',
             'number_of_profiles', 'avg_watch_time_per_day']
feats_ott = [f for f in feats_ott if f in ott.columns]

clf_ott = train_save(ott[feats_ott], ott['churn'], 'ott')
ott = churn_score_col(ott, clf_ott, feats_ott)
ott['domain'] = 'OTT'
ott.to_csv('data/clean_ott.csv', index=False)
print(f"  Saved {len(ott)} rows -> data/clean_ott.csv")


# ══════════════════════════════════════════════════════════════════
# 2 — FOOD  (onlinedeliverydata.csv)
# ══════════════════════════════════════════════════════════════════
print("\n=== Food ===")
food = pd.read_csv('onlinedeliverydata.csv')

# churn target from 'Output' column
food['churn'] = (food['Output'].astype(str).str.strip() == 'No').astype(int)

# encode ordinal satisfaction cols
sat_map = {
    'Strongly agree': 5, 'Agree': 4, 'Strongly Agree': 5,
    'Neutral': 3, 'Disagree': 2, 'Strongly disagree': 1,
    'Strongly Disagree': 1,
    'Very Important': 5, 'Moderately Important': 4,
    'Important': 3, 'Less Important': 2, 'Not Important': 1,
    'Yes': 1, 'No': 0,
}

food['spend']       = food['Monthly Income'].map({
    'No Income': 0, 'Below Rs.10000': 5000,
    '10001 to 25000': 17500, '25001 to 50000': 37500,
    'More than 50000': 60000
}).fillna(0)

food['tenure']      = food['Age'].clip(18, 60) - 18
food['frequency']   = food['Family size'].fillna(2)
food['order_gap_days'] = food['Maximum wait time'].map(
    {'Less than 30 minutes': 5, '30 minutes': 10,
     'More than an hour': 20, '45 minutes': 15}
).fillna(10)

food['complaint_score'] = food['Bad past experience'].map(sat_map).fillna(3)

n = len(food)
food = add_sentiment(food, n)
food = add_micro(food, 'order_gap_days', n)
food = add_graph(food, n)

feats_food = ['tenure', 'spend', 'frequency', 'order_gap_days',
              'complaint_score', 'sent_slope', 'sent_avg',
              'micro_risk_score', 'pagerank_score',
              'churn_neighbor_ratio', 'degree_centrality']

clf_food = train_save(food[feats_food], food['churn'], 'food')
food = churn_score_col(food, clf_food, feats_food)
food['domain'] = 'Food'
food.to_csv('data/clean_food.csv', index=False)
print(f"  Saved {len(food)} rows -> data/clean_food.csv")


# ══════════════════════════════════════════════════════════════════
# 3 — ECOMMERCE  (E Commerce Dataset.xlsx)
# ══════════════════════════════════════════════════════════════════
print("\n=== Ecommerce ===")
ecom = pd.read_excel('E Commerce Dataset.xlsx', sheet_name='E Comm')

ecom = ecom.rename(columns={
    'Churn':              'churn',
    'Tenure':             'tenure',
    'CashbackAmount':     'spend',
    'OrderCount':         'frequency',
    'DaySinceLastOrder':  'order_gap_days',
    'SatisfactionScore':  'sat_score',
    'Complain':           'complaint_score',
})

ecom['tenure']        = ecom['tenure'].fillna(0)
ecom['order_gap_days']= ecom['order_gap_days'].fillna(5)
ecom['frequency']     = ecom['frequency'].fillna(1)

n = len(ecom)
ecom = add_sentiment(ecom, n)
ecom = add_micro(ecom, 'order_gap_days', n)
ecom = add_graph(ecom, n)

feats_ecom = ['tenure', 'spend', 'frequency', 'order_gap_days',
              'sat_score', 'complaint_score', 'sent_slope', 'sent_avg',
              'micro_risk_score', 'pagerank_score',
              'churn_neighbor_ratio', 'degree_centrality',
              'HourSpendOnApp', 'NumberOfDeviceRegistered',
              'OrderAmountHikeFromlastYear', 'CouponUsed',
              'WarehouseToHome', 'CityTier']
feats_ecom = [f for f in feats_ecom if f in ecom.columns]

clf_ecom = train_save(ecom[feats_ecom], ecom['churn'], 'ecommerce')
ecom = churn_score_col(ecom, clf_ecom, feats_ecom)
ecom['domain'] = 'Ecommerce'
ecom.to_csv('data/clean_ecommerce.csv', index=False)
print(f"  Saved {len(ecom)} rows -> data/clean_ecommerce.csv")


# ══════════════════════════════════════════════════════════════════
# 4 — TELECOM  (Telco_customer_churn.xlsx)
# ══════════════════════════════════════════════════════════════════
print("\n=== Telecom ===")
tel = pd.read_excel('Telco_customer_churn.xlsx')

tel['churn'] = (tel['Churn Label'].str.strip() == 'Yes').astype(int)
tel = tel.rename(columns={
    'Tenure Months':    'tenure',
    'Monthly Charges':  'spend',
})

tel['Total Charges'] = pd.to_numeric(
    tel['Total Charges'], errors='coerce').fillna(0)
tel['frequency'] = (tel['Total Charges'] /
                    tel['spend'].replace(0, 1)).round().clip(0, 72)

# days inactive proxy
tel['days_inactive'] = (72 - tel['tenure'].clip(0, 72)).astype(int)

# binary encode a couple useful cols
for col in ['Phone Service', 'Multiple Lines',
            'Online Security', 'Tech Support', 'Streaming TV']:
    if col in tel.columns:
        tel[col + '_enc'] = (tel[col] == 'Yes').astype(int)

n = len(tel)
tel = add_sentiment(tel, n)
tel = add_micro(tel, 'days_inactive', n)
tel = add_graph(tel, n)

feats_tel = ['tenure', 'spend', 'frequency', 'days_inactive',
             'sent_slope', 'sent_avg', 'micro_risk_score',
             'pagerank_score', 'churn_neighbor_ratio',
             'degree_centrality',
             'Phone Service_enc', 'Multiple Lines_enc',
             'Online Security_enc', 'Tech Support_enc',
             'Streaming TV_enc', 'Senior Citizen']
feats_tel = [f for f in feats_tel if f in tel.columns]
# ensure all feature columns are numeric
tel[feats_tel] = tel[feats_tel].apply(pd.to_numeric, errors='coerce').fillna(0)

clf_tel = train_save(tel[feats_tel], tel['churn'], 'telecom')
tel = churn_score_col(tel, clf_tel, feats_tel)
tel['domain'] = 'Telecom'
tel.to_csv('data/clean_telecom.csv', index=False)
print(f"  Saved {len(tel)} rows -> data/clean_telecom.csv")


print("\n✅ Pipeline complete!")
print("   data/clean_*.csv  -> 4 files")
print("   models/model_*.pkl -> 4 models")
print("Now run: streamlit run app.py")
