"""
Analytics routes
"""

from fastapi import APIRouter
from typing import Optional

from controllers import analytics_controller

router = APIRouter(tags=["Analytics"])


@router.get("/analytics/overview")
async def get_analytics_overview():
    """Get overall analytics overview"""
    return analytics_controller.get_analytics_overview()


@router.get("/feature-importance")
async def get_feature_importance():
    """Get feature importance from the trained model"""
    return analytics_controller.get_feature_importance()


@router.get("/cities")
async def get_cities():
    """Get list of all cities in the dataset"""
    return analytics_controller.get_cities()


@router.get("/city/{city_name}")
async def get_city_stats(city_name: str):
    """Get statistics for a specific city"""
    return analytics_controller.get_city_stats(city_name)


@router.get("/city/{city_name}/timeseries")
async def get_city_timeseries(city_name: str, limit: Optional[int] = 100):
    """Get time series data for a specific city"""
    return analytics_controller.get_city_timeseries(city_name, limit)


@router.get("/city/{city_name}/monitor")
async def get_city_monitor_data(city_name: str, year: Optional[int] = None):
    """Get aggregated monitor data for a specific city with optional year filter
    
    - If year is None: Returns average AQI and pollutants by year (all time)
    - If year is provided: Returns average AQI and pollutants by month for that specific year
    """
    return analytics_controller.get_city_monitor_data(city_name, year)


@router.get("/city/{city_name}/aggregated")
async def get_city_aggregated_data(
    city_name: str, 
    filter_type: str = 'latest',
    year: Optional[int] = None,
    month: Optional[int] = None,
    season: Optional[str] = None
):
    """Get aggregated city pollutant data with time filtering for problem analysis
    
    - filter_type='latest': Returns most recent record
    - filter_type='all_time': Returns average across all available data
    - filter_type='year': Returns average for specific year (requires year parameter)
    - filter_type='month': Returns average for specific month in year (requires year and month parameters)
    - filter_type='season': Returns average for specific season (requires season parameter: winter, summer, monsoon, post_monsoon)
    """
    return analytics_controller.get_city_aggregated_data(city_name, filter_type, year, month, season)


@router.get("/overall/aggregated")
async def get_overall_aggregated_data(
    filter_type: str = 'all_time',
    year: Optional[int] = None,
    season: Optional[str] = None
):
    """Get aggregated pollutant data across all cities with time filtering for problem analysis
    
    - filter_type='all_time': Returns average across all available data
    - filter_type='year': Returns average for specific year (requires year parameter)
    - filter_type='season': Returns average for specific season (requires season parameter: winter, summer, monsoon, post_monsoon)
    """
    return analytics_controller.get_overall_aggregated_data(filter_type, year, season)


@router.get("/model/info")
async def get_model_info():
    """Get model information and performance metrics"""
    return analytics_controller.get_model_info()


@router.get("/dataset/info")
async def get_dataset_info():
    """Get comprehensive dataset information including statistics, column details, and preview"""
    return analytics_controller.get_dataset_info()


@router.get("/analytics/trend")
async def get_aqi_trend(year: Optional[int] = None):
    """Get AQI trend data with optional year filter
    
    - If year is None: Returns average AQI by year (all time)
    - If year is provided: Returns average AQI by month for that specific year
    """
    return analytics_controller.get_aqi_trend(year)


@router.get("/analytics/frequency")
async def get_aqi_frequency(year: Optional[int] = None, bin_size: int = 50):
    """Get AQI frequency distribution with optional year filter
    
    - If year is None: Returns frequency distribution for all data
    - If year is provided: Returns frequency distribution for that specific year
    """
    return analytics_controller.get_aqi_frequency(year, bin_size)


@router.get("/analytics/city-comparison")
async def get_city_comparison(year: Optional[int] = None, limit: int = 20):
    """Get city comparison data with optional year filter
    
    - year: Optional year filter. If None, returns data for all years.
    - limit: Maximum number of cities to return (default: 20)
    """
    return analytics_controller.get_city_comparison(year, limit)


@router.get("/analytics/seasonal")
async def get_seasonal_data(year: Optional[int] = None):
    """Get seasonal AQI data grouped by months and seasons
    
    - If year is None: Returns data for all years
    - If year is provided: Returns data for that specific year
    
    Returns monthly average AQI and seasonal average AQI with categories
    """
    return analytics_controller.get_seasonal_data(year)


@router.get("/analytics/correlation")
async def get_pollutant_correlation():
    """Get correlation matrix between pollutants and AQI
    
    Returns correlation values between all pollutants and AQI
    """
    return analytics_controller.get_pollutant_correlation()
