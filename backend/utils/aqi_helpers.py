"""
AQI calculation and categorization utilities
"""

from typing import Tuple, Dict, Any


def get_aqi_category(aqi: float) -> Tuple[str, str, str, str]:
    """Get AQI category, color, emoji, and description"""
    if aqi <= 50:
        return "Good", "#00ff00", "😊", "Air quality is satisfactory"
    elif aqi <= 100:
        return "Satisfactory", "#90ee90", "🙂", "Acceptable air quality"
    elif aqi <= 200:
        return "Moderate", "#ffff00", "😐", "May cause breathing discomfort"
    elif aqi <= 300:
        return "Poor", "#ff9900", "😷", "May cause respiratory issues"
    elif aqi <= 400:
        return "Very Poor", "#ff0000", "😨", "May cause serious health effects"
    else:
        return "Severe", "#8b0000", "☠️", "Health emergency - everyone affected"


def get_health_advisory(aqi: float, pollutants: dict) -> Dict[str, Any]:
    """Generate detailed health advisory"""
    category, _, emoji, desc = get_aqi_category(aqi)
    
    advisories = {
        "Good": {
            "general": "Air quality is excellent. Perfect for outdoor activities!",
            "actions": [
                "All outdoor activities are safe",
                "Great time for exercise and recreation",
                "Windows can be kept open for ventilation"
            ]
        },
        "Satisfactory": {
            "general": "Air quality is acceptable for most people.",
            "actions": [
                "Normal outdoor activities are safe",
                "Sensitive individuals should be aware",
                "Good time to be outdoors"
            ]
        },
        "Moderate": {
            "general": "Sensitive groups should take precautions.",
            "actions": [
                "Sensitive people reduce prolonged outdoor exertion",
                "Watch for symptoms like coughing or shortness of breath",
                "Consider wearing masks in highly polluted areas",
                "Keep rescue inhalers handy if you have asthma"
            ]
        },
        "Poor": {
            "general": "Everyone may experience health effects.",
            "actions": [
                "Avoid prolonged outdoor activities",
                "Sensitive groups stay indoors",
                "Wear N95 masks if you must go outside",
                "Keep windows closed",
                "Use air purifiers indoors",
                "Avoid strenuous activities"
            ]
        },
        "Very Poor": {
            "general": "HIGH POLLUTION ALERT - Serious health impacts likely.",
            "actions": [
                "Minimize outdoor exposure for everyone",
                "Vulnerable groups must stay indoors",
                "Cancel outdoor events and activities",
                "Use N95 or N99 masks if outdoor exposure is unavoidable",
                "Run air purifiers continuously",
                "Seek medical attention if experiencing symptoms"
            ]
        },
        "Severe": {
            "general": "HEALTH EMERGENCY - Avoid all outdoor exposure!",
            "actions": [
                "DO NOT go outside unless absolutely necessary",
                "All outdoor activities must be cancelled",
                "Create a clean air room at home",
                "Seal windows and doors",
                "Use HEPA air purifiers",
                "Monitor health closely and seek immediate medical care for symptoms",
                "Vulnerable populations should consider evacuation if possible"
            ]
        }
    }
    
    return advisories.get(category, advisories["Moderate"])


def get_season(month: int) -> str:
    """Get season from month number"""
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8, 9]:
        return "Monsoon"
    else:
        return "PostMonsoon"


def get_early_warning(aqi: float) -> str:
    """Get early warning message based on AQI level"""
    if aqi > 300:
        return "🚨 HEALTH EMERGENCY: Severe air pollution! Avoid outdoor activities."
    elif aqi > 200:
        return "⚠️ HIGH POLLUTION ALERT: Sensitive groups should stay indoors."
    elif aqi > 150:
        return "😷 MODERATE RISK: Consider wearing a mask outside."
    else:
        return "✅ Air quality is within safe limits."
