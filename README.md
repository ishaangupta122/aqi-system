# 🌍 AQI Intelligence & Prediction Platform

An AI-powered **Air Quality Monitoring, Prediction, Analytics, and Environmental Planning System** built using Machine Learning and a full-stack web architecture.

This project evolved from a research ML model into a **production-style Environmental Intelligence Platform** capable of prediction, diagnostics, and policy simulation.

---

## 🧠 System Overview

This platform provides:

- 🔮 Real-time AQI prediction using Machine Learning
- 📊 City air quality monitoring dashboards
- 📈 Advanced pollution analytics
- 🚨 Pollution problem diagnosis
- 🌱 Environmental solution & policy planning
- 📜 Prediction history tracking

---

## 🏗️ System Architecture

Frontend (React) → Backend API (FastAPI) → ML Model + Services → Database

| Layer           | Technology                  |
| --------------- | --------------------------- |
| Frontend        | React                       |
| Backend         | FastAPI                     |
| ML Model        | Scikit-learn                |
| Data Processing | Pandas, NumPy               |
| Charts          | Plotly / JS chart libraries |
| Storage         | SQLite / JSON               |

---

# 📁 Project Folder Structure

```text
aqi-system/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   │
│   ├── model/
│   │   ├── model.pkl
│   │   └── predictor.py
│   │
│   ├── data/
│   │   └── aqi_data.csv
│   │
│   ├── services/
│   │   ├── feature_engineering.py
│   │   ├── aqi_rules.py
│   │   ├── health_advisory.py
│   │   ├── pollutant_analysis.py
│   │   ├── analytics_engine.py
│   │   ├── planning_engine.py
│   │   └── history_service.py
│   │
│   ├── api/routes/
│   │   ├── prediction.py
│   │   ├── monitoring.py
│   │   ├── analytics.py
│   │   ├── problem_analysis.py
│   │   ├── planning.py
│   │   └── history.py
│   │
│   └── schemas/
│
├── frontend/
│   ├── pages/
│   ├── components/
│   └── services/api.js
│
└── database/

```

---

# 🤖 Machine Learning Model

### Model Used

Random Forest Regressor

### Target

Predict Air Quality Index (AQI)

### Input Features

**Pollutants**
PM2.5, NO, NO2, NOx, CO, SO2, O3

**Time Features**

- Month
- Weekend flag
- Season (Winter, Summer, Monsoon, PostMonsoon)

**Temporal Behavior**

- AQI Lag-1 (Yesterday AQI)
- 3-day AQI rolling average

---

## 🧪 Model Training Process

1. Load dataset (`aqi_data.csv`)
2. Remove rows missing AQI
3. Fill missing pollutant values using median
4. Convert Date → Month, Weekend, Season
5. One-hot encode seasons
6. Add lag & rolling AQI features
7. Train-test split (80/20)
8. Train RandomForestRegressor
9. Evaluate performance: MAE, MSE, RMSE, R²
10. Save trained model → `model.pkl`

---

# 🧠 Backend Services (Logic Layer)

| Service             | Responsibility                          |
| ------------------- | --------------------------------------- |
| feature_engineering | Builds date, season, lag features       |
| predictor           | Loads model & performs prediction       |
| aqi_rules           | AQI category classification             |
| health_advisory     | Health recommendations                  |
| pollutant_analysis  | Identifies pollutant issues             |
| analytics_engine    | Trends, correlations, seasonal patterns |
| planning_engine     | Policy simulations & AQI projections    |
| history_service     | Stores prediction history               |

---

# 🌐 Frontend Pages (React)

| Page                 | Description                              |
| -------------------- | ---------------------------------------- |
| Home                 | System overview & statistics             |
| Predict AQI          | Input pollutants → prediction + advisory |
| Monitor Cities       | AQI trends & pollutant charts            |
| Analytics            | Correlations, trends, seasonal patterns  |
| Problem Analysis     | Pollutant source & health risk analysis  |
| Solutions & Planning | Policy simulation & AQI forecasting      |
| History              | Past predictions & export                |

---

# 🔌 Key API Endpoints

| Endpoint                | Purpose              |
| ----------------------- | -------------------- |
| POST /predict-aqi       | Predict AQI          |
| GET /city-stats/{city}  | City monitoring data |
| GET /analytics/trends   | AQI trends           |
| POST /analyze-pollution | Pollutant diagnosis  |
| GET /planning/scenarios | Policy simulations   |
| GET /history            | Prediction history   |

---

# 🚀 How to Run

### Backend

cd backend  
pip install -r requirements.txt  
uvicorn app:app --reload

### Frontend

cd frontend  
npm install  
npm start

---

# 🎯 System Capabilities

✔ Machine Learning prediction  
✔ Environmental data analytics  
✔ Health advisory system  
✔ Pollution diagnostics  
✔ Environmental planning simulation  
✔ Historical tracking

---

# 📌 Project Category

AI-Powered Environmental Intelligence & Decision Support Platform
