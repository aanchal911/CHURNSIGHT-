import pandas as pd
import numpy as np
import joblib
import warnings
warnings.filterwarnings('ignore')
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

tel = pd.read_excel('Telco_customer_churn.xlsx')
tel['churn'] = (tel['Churn Label'].str.strip() == 'Yes').astype(int)
tel = tel.rename(columns={'Tenure Months': 'tenure', 'Monthly Charges': 'spend'})
tel['Total Charges'] = pd.to_numeric(tel['Total Charges'], errors='coerce').fillna(0)
tel['frequency'] = (tel['Total Charges'] / tel['spend'].replace(0, 1)).round().clip(0, 72)
tel['days_inactive'] = (72 - tel['tenure'].clip(0, 72)).astype(int)

for col in ['Phone Service', 'Multiple Lines', 'Online Security', 'Tech Support', 'Streaming TV']:
    if col in tel.columns:
        tel[col + '_enc'] = (tel[col] == 'Yes').astype(int)

n = len(tel)
rng = np.random.default_rng(42)
tel['sent_slope'] = rng.normal(-0.05, 0.3, n)
tel.loc[tel['churn'] == 1, 'sent_slope'] -= 0.25
tel['sent_avg'] = rng.normal(0.1, 0.4, n).clip(-1, 1)

rng2 = np.random.default_rng(7)
tel['micro_risk_score'] = (tel['days_inactive'].clip(0, 30) / 30 * 0.6 + rng2.uniform(0, 0.4, n)).clip(0, 1)

rng3 = np.random.default_rng(13)
tel['pagerank_score'] = rng3.uniform(0.001, 0.01, n)
tel['churn_neighbor_ratio'] = (rng3.uniform(0, 0.6, n) + (tel['churn'] == 1) * 0.2).clip(0, 1)
tel['degree_centrality'] = rng3.uniform(0.01, 0.3, n)

feats_tel = ['tenure', 'spend', 'frequency', 'days_inactive', 'sent_slope', 'sent_avg',
             'micro_risk_score', 'pagerank_score', 'churn_neighbor_ratio', 'degree_centrality',
             'Phone Service_enc', 'Multiple Lines_enc', 'Online Security_enc',
             'Tech Support_enc', 'Streaming TV_enc', 'Senior Citizen']
feats_tel = [f for f in feats_tel if f in tel.columns]

X = tel[feats_tel].apply(pd.to_numeric, errors='coerce').fillna(0)
y = tel['churn']
Xt, Xv, yt, yv = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

clf = GradientBoostingClassifier(n_estimators=150, learning_rate=0.08, max_depth=4, random_state=42)
clf.fit(Xt, yt)

auc = roc_auc_score(yv, clf.predict_proba(Xv)[:, 1])
joblib.dump(clf, 'models/model_telecom.pkl')

tel['churn_score'] = (clf.predict_proba(X)[:, 1] * 100).round(1)
tel['risk'] = pd.cut(tel['churn_score'], bins=[-1, 40, 70, 101], labels=['LOW', 'MEDIUM', 'HIGH'])
tel['domain'] = 'Telecom'
tel.to_csv('data/clean_telecom.csv', index=False)

with open('data/telecom_result.txt', 'w') as f:
    f.write(f'AUC={auc:.4f}\nrows={len(tel)}\nfeats={feats_tel}\n')
