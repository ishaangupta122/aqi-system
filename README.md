# AirSense: AQI Prediction System

Predicts the Air Quality Index (AQI) from 7 pollutant levels, the month and the type of day.
Three regression models (Random Forest, Multiple Linear, Polynomial) are trained on daily air
quality data, and the Random Forest gives the main prediction.

## Setup

You need Python 3 and Node.js.

```bash
# Backend: install the packages and train the models
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cd model && python model.py

# Frontend: install the packages
cd ../../frontend
npm install
```

## Run

Start the backend, then the frontend, in two terminals.

```bash
# Terminal 1: server on http://localhost:8000
cd backend
source venv/bin/activate
uvicorn app:app --reload
```

```bash
# Terminal 2: app on http://localhost:5173
cd frontend
npm run dev
```

Open the app in your browser. The Prediction page gives the AQI for the values you set, and the
Model Info page shows how the models were built and how well they predict.
