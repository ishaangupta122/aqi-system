import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error

from model.model import (
    FEATURES,
    MODEL_DIR,
    MODEL_FILES,
    POLLUTANTS,
    RAW_CSV,
    REFINED_CSV,
    SEASONS,
    UPPER_LIMITS,
    split_data,
)

models = {}
for name, filename in MODEL_FILES.items():
    models[name] = joblib.load(MODEL_DIR / filename)


def count_cleaning(raw):
    with_aqi = raw.dropna(subset=["AQI"])
    in_scale = with_aqi[with_aqi["AQI"] <= 500]
    valid = in_scale
    for column, upper in UPPER_LIMITS.items():
        valid = valid[valid[column].isna() | valid[column].between(0, upper)]
    enough = valid[valid[POLLUTANTS].isnull().sum(axis=1) < 3]

    return {
        "rows_before": len(raw),
        "empty_aqi": len(raw) - len(with_aqi),
        "aqi_above_500": len(with_aqi) - len(in_scale),
        "impossible_readings": len(in_scale) - len(valid),
        "mostly_empty_rows": len(valid) - len(enough),
        "filled_values": int(enough[POLLUTANTS].isnull().sum().sum()),
        "rows_after": len(enough),
    }


def get_r2(score):
    return score["r2"]


def score_models():
    raw = pd.read_csv(RAW_CSV)
    df = pd.read_csv(REFINED_CSV)

    cleaning = count_cleaning(raw)
    if cleaning["rows_after"] != len(df):
        raise ValueError("The cleaning rules in app.py and model/model.py give different row counts")

    X_train, X_test, y_train, y_test = split_data(df)
    graph_rows = np.random.default_rng(42).choice(len(y_test), size=400, replace=False)

    scores = []
    for name, model in models.items():
        predicted = model.predict(X_test)
        points = np.column_stack([y_test, predicted])[graph_rows]
        scores.append(
            {
                "name": name,
                "r2": r2_score(y_test, predicted),
                "train_r2": r2_score(y_train, model.predict(X_train)),
                "mae": mean_absolute_error(y_test, predicted),
                "rmse": root_mean_squared_error(y_test, predicted),
                "points": points.round(1).tolist(),
            }
        )
    scores.sort(key=get_r2, reverse=True)

    return {
        "raw_rows": len(raw),
        "raw_columns": list(raw.columns),
        "cleaning": cleaning,
        "features": FEATURES,
        "train_rows": len(y_train),
        "test_rows": len(y_test),
        "best": scores[0]["name"],
        "models": scores,
    }


comparison = score_models()

app = FastAPI(title="AQI Prediction API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/model/comparison")
def model_comparison():
    return comparison


@app.post("/predict")
def predict(levels: dict):
    """The AQI of every model. The frontend checks the values, so they are used as they come."""
    month = levels["month"]

    row = {}
    for name in POLLUTANTS:
        row[name] = levels[name]
    row["month"] = month
    row["is_weekend"] = int(levels["day_type"] == "weekend")

    season = "Monsoon"
    for name, months in SEASONS.items():
        row[name] = int(month in months)
        if month in months:
            season = name

    X = pd.DataFrame([row])[FEATURES]

    model_predictions = []
    for name, model in models.items():
        aqi = model.predict(X)[0]
        aqi = float(min(max(aqi, 0), 500))
        model_predictions.append({"name": name, "aqi": aqi})

    return {
        "aqi": model_predictions[0]["aqi"],
        "season": season,
        "model_predictions": model_predictions,
    }
