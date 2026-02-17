"""
Prediction routes
"""

from fastapi import APIRouter

from utils.schemas import PollutantLevels
from controllers import prediction_controller

router = APIRouter(tags=["Prediction"])


@router.get("/prediction/features")
async def get_prediction_features():
    """Get all features configuration for prediction form including pollutants, ranges, and presets"""
    return prediction_controller.get_prediction_features()


@router.post("/predict")
async def predict_aqi(pollutants: PollutantLevels):
    """Predict AQI from pollutant levels"""
    return prediction_controller.predict_aqi(pollutants)
