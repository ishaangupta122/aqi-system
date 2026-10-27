"""Loads the trained models and predicts the AQI"""

from pathlib import Path
from typing import Literal

import joblib
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field

from .aqi import ADVICE, get_category, get_season

# Files written by model/model.py; Random Forest is the main model
MODEL_DIR = Path(__file__).resolve().parent.parent / "model"
MODEL_FILES = {
    "Random Forest": "rf_model.pkl",
    "Multiple Linear": "mlr_model.pkl",
    "Polynomial": "poly_model.pkl",
}

models = {}
features = []


class PollutantLevels(BaseModel):
    """What the user enters: the 7 pollutants, the month and the type of day"""
    PM2_5: float
    NO: float
    NO2: float
    NOx: float
    CO: float
    SO2: float
    O3: float
    month: int = Field(ge=1, le=12)
    day_type: Literal["weekday", "weekend"]


def load_models():
    """Load the three models and the feature list saved by model/model.py"""
    global features
    paths = {name: MODEL_DIR / file for name, file in MODEL_FILES.items()}
    paths["features"] = MODEL_DIR / "features.pkl"

    missing = [path.name for path in paths.values() if not path.exists()]
    if missing:
        raise FileNotFoundError(f"Run model/model.py first, missing: {', '.join(missing)}")

    features = joblib.load(paths.pop("features"))
    models.update({name: joblib.load(path) for name, path in paths.items()})


def predict_aqi(levels: PollutantLevels) -> dict:
    """Predict the AQI with every model; the Random Forest result is the main one"""
    season = get_season(levels.month)

    # The same 12 features the models were trained on
    row = {
        "PM2.5": levels.PM2_5,
        "NO": levels.NO,
        "NO2": levels.NO2,
        "NOx": levels.NOx,
        "CO": levels.CO,
        "SO2": levels.SO2,
        "O3": levels.O3,
        "month": levels.month,
        "is_weekend": int(levels.day_type == "weekend"),
        "season_Winter": int(season == "Winter"),
        "season_Summer": int(season == "Summer"),
        "season_PostMonsoon": int(season == "PostMonsoon"),
    }
    X = pd.DataFrame([row])[features]

    # AQI is limited to the 0-500 scale
    model_predictions = []
    for name, model in models.items():
        aqi = float(np.clip(model.predict(X)[0], 0, 500))
        model_predictions.append({"name": name, "aqi": aqi, "category": get_category(aqi)})

    main = next(p for p in model_predictions if p["name"] == "Random Forest")
    return {
        "aqi": main["aqi"],
        "category": main["category"],
        "season": season,
        "health_advisory": ADVICE[main["category"]],
        "model_predictions": model_predictions,
    }
