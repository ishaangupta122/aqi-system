# AQI Monitoring & Prediction System - Backend

FastAPI backend for air quality index monitoring, analytics, and ML-based prediction.

## ⚡ Getting Started

### 1. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Train the model

```bash
cd ml_model
python train_model.py
```

### 4. Run the backend server

```bash
cd ..
python app.py
# or use: start.bat
```

### 5. Access API docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📁 Folder Structure

```
backend/
├── app.py                  # Main FastAPI app
├── requirements.txt        # Python dependencies
├── start.bat              # Windows start script
├── ml_model/               # ML model & data
│   ├── city_day.csv        # Historical AQI dataset
│   ├── train_model.py      # Model training script
│   ├── model.py            # Model utilities
├── controllers/            # Business logic
│   ├── analytics_controller.py
│   ├── prediction_controller.py
│   ├── problem_controller.py
├── routes/                 # API endpoints
│   ├── analytics_routes.py
│   ├── prediction_routes.py
│   ├── problem_routes.py
│   ├── history_routes.py
├── utils/                  # Utilities
│   ├── data_manager.py     # Data/model loader
│   ├── aqi_helpers.py      # AQI calculations
│   ├── pollutant_info.py   # Pollutant info & limits
│   ├── schemas.py          # Pydantic schemas
```

---

## 📚 API Endpoints

### 🔮 Prediction

- `GET /prediction/features` — Get prediction form config (pollutants, ranges, presets)
- `POST /predict` — Predict AQI from pollutant levels

### 📊 Analytics

- `GET /analytics/overview` — Overall dataset statistics
- `GET /cities` — List all cities
- `GET /city/{city_name}` — City statistics
- `GET /city/{city_name}/timeseries` — City AQI time series
- `GET /feature-importance` — Model feature importance

### ⚠️ Problems & Solutions

- `POST /problems/analyze` — Analyze pollution problems from input
- `GET /solutions/scenarios` — Get intervention scenarios & solutions

### 🕒 History & Model

- `GET /history` — Prediction history
- `DELETE /history` — Clear history
- `GET /model/info` — Model info & metrics

---

## 🔧 Tech Stack

- FastAPI — Web framework
- Pandas — Data processing
- Scikit-learn — Machine learning
- Joblib — Model serialization
- Pydantic — Data validation

## ✨ Features

- Real-time AQI prediction
- Multi-city analytics
- Problem pollutant identification
- Health advisories
- Intervention solutions
- Feature importance analysis
- Prediction history tracking
