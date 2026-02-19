"""
Data models for request/response validation
"""

from pydantic import BaseModel
from typing import List, Dict, Optional, Any


class PollutantLevels(BaseModel):
    """Pollutant levels for AQI prediction (Refined Model)"""
    PM2_5: float
    NO: float
    NO2: float
    NOx: float
    CO: float
    SO2: float
    O3: float
    month: int  # 1-12
    day_type: str  # "weekend" or "weekday"


class PredictionResponse(BaseModel):
    aqi: float
    category: str
    color: str
    emoji: str
    description: str
    health_advisory: Dict[str, Any]
    timestamp: str


class CityStats(BaseModel):
    avg_aqi: float
    max_aqi: float
    min_aqi: float
    data_points: int
    city: str


class ProblemPollutant(BaseModel):
    pollutant: str
    value: float
    limit: float
    excess: float
    severity: str
    sources: List[str]
    health_effects: List[str]
    solutions: List[str]
