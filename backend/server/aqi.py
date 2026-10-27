"""AQI categories, health advice and season lookup"""

# Health advice shown with each AQI category
ADVICE = {
    "Good": {
        "general": "Air quality is excellent. Perfect for outdoor activities!",
        "actions": [
            "All outdoor activities are safe",
            "Great time for exercise and recreation",
            "Windows can be kept open for ventilation",
        ],
    },
    "Satisfactory": {
        "general": "Air quality is acceptable for most people.",
        "actions": [
            "Normal outdoor activities are safe",
            "Sensitive individuals should be aware",
            "Good time to be outdoors",
        ],
    },
    "Moderate": {
        "general": "Sensitive groups should take precautions.",
        "actions": [
            "Sensitive people reduce prolonged outdoor exertion",
            "Watch for symptoms like coughing or shortness of breath",
            "Consider wearing masks in highly polluted areas",
            "Keep rescue inhalers handy if you have asthma",
        ],
    },
    "Poor": {
        "general": "Everyone may experience health effects.",
        "actions": [
            "Avoid prolonged outdoor activities",
            "Sensitive groups stay indoors",
            "Wear N95 masks if you must go outside",
            "Keep windows closed",
            "Use air purifiers indoors",
            "Avoid strenuous activities",
        ],
    },
    "Very Poor": {
        "general": "HIGH POLLUTION ALERT - Serious health impacts likely.",
        "actions": [
            "Minimize outdoor exposure for everyone",
            "Vulnerable groups must stay indoors",
            "Cancel outdoor events and activities",
            "Use N95 or N99 masks if outdoor exposure is unavoidable",
            "Run air purifiers continuously",
            "Seek medical attention if experiencing symptoms",
        ],
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
            "Vulnerable populations should consider evacuation if possible",
        ],
    },
}


def get_category(aqi: float) -> str:
    """AQI category for an AQI value"""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very Poor"
    return "Severe"


def get_season(month: int) -> str:
    """Season of a month (same mapping as model/model.py)"""
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8, 9]:
        return "Monsoon"
    return "PostMonsoon"
