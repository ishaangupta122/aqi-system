# AQI Prediction System

Predicts the Air Quality Index (AQI) from 7 pollutant levels, the month and the type of day.
Three regression models are trained and compared (Random Forest, Multiple Linear, Polynomial);
Random Forest gives the main prediction.

## Structure

```
backend/
  model/    model.py (cleaning, features, training, evaluation), aqi_data.csv, saved models (.pkl)
  server/   predict.py (models + prediction), aqi.py (categories, advice), form_config.json (sliders and presets)
  app.py    FastAPI server: the routes (health, form settings, predict)
frontend/   React + Vite + Tailwind: Home and Predict pages
documents/  report and slides
```

## Run

1. **Train the models** 

   ```bash
   cd backend
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   cd model && python model.py
   ```

2. **Start the server** 

   ```bash
   cd backend
   uvicorn app:app --reload
   ```

3. **Start the frontend** 

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Server status |
| `/prediction/features` | GET | Sliders, month and day type options, presets |
| `/predict` | POST | AQI from the 7 pollutants, `month` (1-12) and `day_type` (`weekday` or `weekend`) |

## Model summary (test data)

| Model | R² | RMSE |
|---|---|---|
| Random Forest | 0.908 | 31.1 |
| Polynomial (degree 2) | 0.882 | 35.2 |
| Multiple Linear | 0.836 | 41.5 |

The numbers on the Home page are typed in `frontend/src/components/HowItWorks.jsx`;
update them there after retraining.
