"""
Prediction controller for Refined AQI Model
"""

import pandas as pd
from datetime import datetime
from fastapi import HTTPException

from utils.schemas import PollutantLevels
from utils.data_manager import data_manager
from utils.aqi_helpers import get_aqi_category, get_health_advisory, get_season, get_early_warning


def get_prediction_features() -> dict:
    """Get all features configuration for prediction form"""
    return {
        "pollutants": [
            {
                "name": "PM2.5",
                "key": "PM2_5",
                "label": "PM2.5 (Fine Particulate Matter)",
                "unit": "μg/m³",
                "description": "Fine particles with diameter ≤ 2.5 micrometers",
                "min": 0,
                "max": 500,
                "step": 0.1,
                "default": 50,
                "safe_limit": 60,
            },
            {
                "name": "NO",
                "key": "NO",
                "label": "NO (Nitric Oxide)",
                "unit": "μg/m³",
                "description": "Nitrogen monoxide from combustion",
                "min": 0,
                "max": 300,
                "step": 0.1,
                "default": 20,
                "safe_limit": 80,
            },
            {
                "name": "NO2",
                "key": "NO2",
                "label": "NO2 (Nitrogen Dioxide)",
                "unit": "μg/m³",
                "description": "Reddish-brown toxic gas from combustion",
                "min": 0,
                "max": 300,
                "step": 0.1,
                "default": 40,
                "safe_limit": 80,
            },
            {
                "name": "NOx",
                "key": "NOx",
                "label": "NOx (Nitrogen Oxides)",
                "unit": "ppb",
                "description": "Combined nitrogen oxides (NO + NO2)",
                "min": 0,
                "max": 400,
                "step": 0.1,
                "default": 60,
                "safe_limit": 100,
            },
            {
                "name": "CO",
                "key": "CO",
                "label": "CO (Carbon Monoxide)",
                "unit": "mg/m³",
                "description": "Colorless, odorless toxic gas",
                "min": 0,
                "max": 50,
                "step": 0.01,
                "default": 2,
                "safe_limit": 2,
            },
            {
                "name": "SO2",
                "key": "SO2",
                "label": "SO2 (Sulfur Dioxide)",
                "unit": "μg/m³",
                "description": "Pungent gas from sulfur-containing fuels",
                "min": 0,
                "max": 300,
                "step": 0.1,
                "default": 50,
                "safe_limit": 80,
            },
            {
                "name": "O3",
                "key": "O3",
                "label": "O3 (Ozone)",
                "unit": "μg/m³",
                "description": "Ground-level ozone formed by sunlight",
                "min": 0,
                "max": 300,
                "step": 0.1,
                "default": 50,
                "safe_limit": 100,
            }
        ],
        "temporal": {
            "month": {
                "label": "Month",
                "type": "select",
                "options": [
                    {"value": 1, "label": "January"},
                    {"value": 2, "label": "February"},
                    {"value": 3, "label": "March"},
                    {"value": 4, "label": "April"},
                    {"value": 5, "label": "May"},
                    {"value": 6, "label": "June"},
                    {"value": 7, "label": "July"},
                    {"value": 8, "label": "August"},
                    {"value": 9, "label": "September"},
                    {"value": 10, "label": "October"},
                    {"value": 11, "label": "November"},
                    {"value": 12, "label": "December"}
                ],
                "default": 1
            },
            "day_type": {
                "label": "Day Type",
                "type": "select",
                "options": [
                    {"value": "weekday", "label": "Weekday", "description": "Monday to Friday"},
                    {"value": "weekend", "label": "Weekend", "description": "Saturday and Sunday"}
                ],
                "default": "weekday"
            }
        },
        "presets": [
            {
                "name": "Good",
                "description": "Clean air conditions - healthy for all",
                "category": "Good",
                "values": {
                    "PM2_5": 20,
                    "NO": 10,
                    "NO2": 20,
                    "NOx": 30,
                    "CO": 0.5,
                    "SO2": 20,
                    "O3": 30,
                    "month": 8,
                    "day_type": "weekend"
                }
            },
            {
                "name": "Moderate",
                "description": "Acceptable air quality for most people",
                "category": "Moderate",
                "values": {
                    "PM2_5": 60,
                    "NO": 30,
                    "NO2": 50,
                    "NOx": 80,
                    "CO": 1.5,
                    "SO2": 50,
                    "O3": 60,
                    "month": 3,
                    "day_type": "weekday"
                }
            },
            {
                "name": "Poor",
                "description": "Unhealthy for sensitive groups",
                "category": "Poor",
                "values": {
                    "PM2_5": 120,
                    "NO": 50,
                    "NO2": 80,
                    "NOx": 120,
                    "CO": 3,
                    "SO2": 100,
                    "O3": 100,
                    "month": 11,
                    "day_type": "weekday"
                }
            },
            {
                "name": "Very Poor",
                "description": "Health warnings - everyone may experience effects",
                "category": "Very Poor",
                "values": {
                    "PM2_5": 200,
                    "NO": 80,
                    "NO2": 120,
                    "NOx": 200,
                    "CO": 5,
                    "SO2": 150,
                    "O3": 150,
                    "month": 12,
                    "day_type": "weekday"
                }
            },
            {
                "name": "Severe",
                "description": "Health alert - serious effects for everyone",
                "category": "Severe",
                "values": {
                    "PM2_5": 300,
                    "NO": 120,
                    "NO2": 180,
                    "NOx": 300,
                    "CO": 10,
                    "SO2": 200,
                    "O3": 200,
                    "month": 1,
                    "day_type": "weekday"
                }
            }
        ],
        "validation_rules": {
            "required_fields": ["PM2_5", "NO", "NO2", "NOx", "CO", "SO2", "O3", "month", "day_type"],
            "month_range": [1, 12],
            "day_type_values": ["weekday", "weekend"]
        }
    }


def predict_aqi(pollutants: PollutantLevels) -> dict:
    """Predict AQI from pollutant levels using refined model"""
    if data_manager.model_info is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Get month and weekend status from request
        month = pollutants.month
        is_weekend = 1 if pollutants.day_type.lower() == "weekend" else 0
        season = get_season(month)
        
        # Create input data with only required features
        # Note: Using 'PM2.5' (with dot) to match the model's expected feature names
        input_data = {
            'PM2.5': pollutants.PM2_5,
            'NO': pollutants.NO,
            'NO2': pollutants.NO2,
            'NOx': pollutants.NOx,
            'CO': pollutants.CO,
            'SO2': pollutants.SO2,
            'O3': pollutants.O3,
            'month': month,
            'is_weekend': is_weekend
        }
        
        # Add season one-hot encoding as integers (0 or 1)
        input_data['season_Monsoon'] = 1 if season == 'Monsoon' else 0
        input_data['season_PostMonsoon'] = 1 if season == 'PostMonsoon' else 0
        input_data['season_Summer'] = 1 if season == 'Summer' else 0
        input_data['season_Winter'] = 1 if season == 'Winter' else 0
        
        # Create dataframe with correct feature order
        df_input = pd.DataFrame([input_data])
        
        # Ensure column order matches training
        feature_names = data_manager.model_info['feature_names']
        df_input = df_input[feature_names]
        
        # Predict
        model = data_manager.model_info['model']
        predicted_aqi = float(model.predict(df_input)[0])
        
        # Get category and advisory
        category, color, emoji, description = get_aqi_category(predicted_aqi)
        advisory = get_health_advisory(predicted_aqi, input_data)
        early_warning = get_early_warning(predicted_aqi)
        
        # Save to history
        prediction_record = {
            'timestamp': datetime.now().isoformat(),
            'aqi': predicted_aqi,
            'category': category,
            'pollutants': {
                'PM2_5': pollutants.PM2_5,
                'NO': pollutants.NO,
                'NO2': pollutants.NO2,
                'NOx': pollutants.NOx,
                'CO': pollutants.CO,
                'SO2': pollutants.SO2,
                'O3': pollutants.O3
            },
            'temporal_features': {
                'month': month,
                'is_weekend': bool(is_weekend),
                'day_type': pollutants.day_type,
                'season': season
            }
        }
        data_manager.add_prediction_to_history(prediction_record)
        
        return {
            'aqi': predicted_aqi,
            'category': category,
            'color': color,
            'emoji': emoji,
            'description': description,
            'health_advisory': advisory,
            'early_warning': early_warning,
            'timestamp': datetime.now().isoformat(),
            'temporal_info': {
                'month': month,
                'is_weekend': bool(is_weekend),
                'day_type': pollutants.day_type,
                'season': season
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
