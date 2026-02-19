"""
Analytics controller
"""

import pandas as pd
import numpy as np
from typing import Optional
from fastapi import HTTPException

from utils.data_manager import data_manager
from utils.aqi_helpers import get_aqi_category


def get_cities() -> dict:
    """Get list of all cities"""
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    cities = sorted(data_manager.df['City'].unique().tolist())
    return {"cities": cities, "count": len(cities)}


def get_city_stats(city_name: str) -> dict:
    """Get statistics for a specific city"""
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    city_data = data_manager.df[data_manager.df['City'] == city_name]
    
    if len(city_data) == 0:
        raise HTTPException(status_code=404, detail=f"City '{city_name}' not found")
    
    city_data = city_data.dropna(subset=['AQI'])
    
    return {
        'city': city_name,
        'avg_aqi': float(city_data['AQI'].mean()),
        'max_aqi': float(city_data['AQI'].max()),
        'min_aqi': float(city_data['AQI'].min()),
        'std_aqi': float(city_data['AQI'].std()),
        'data_points': len(city_data),
        'date_range': {
            'start': city_data['Date'].min().isoformat() if not city_data['Date'].isna().all() else None,
            'end': city_data['Date'].max().isoformat() if not city_data['Date'].isna().all() else None
        }
    }


def get_city_timeseries(city_name: str, limit: Optional[int] = 100) -> dict:
    """Get time series data for a specific city"""
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    city_data = data_manager.df[data_manager.df['City'] == city_name].copy()
    
    if len(city_data) == 0:
        raise HTTPException(status_code=404, detail=f"City '{city_name}' not found")
    
    city_data = city_data.dropna(subset=['AQI', 'Date']).sort_values('Date', ascending=False)
    
    if limit:
        city_data = city_data.head(limit)
    
    timeseries = []
    for _, row in city_data.iterrows():
        timeseries.append({
            'date': row['Date'].isoformat(),
            'aqi': round(float(row['AQI']), 2),
            'pm25': round(float(row['PM2.5']), 2) if pd.notna(row['PM2.5']) else None,
            'no': round(float(row['NO']), 2) if pd.notna(row['NO']) else None,
            'no2': round(float(row['NO2']), 2) if pd.notna(row['NO2']) else None,
            'nox': round(float(row['NOx']), 2) if pd.notna(row['NOx']) else None,
            'co': round(float(row['CO']), 2) if pd.notna(row['CO']) else None,
            'so2': round(float(row['SO2']), 2) if pd.notna(row['SO2']) else None,
            'o3': round(float(row['O3']), 2) if pd.notna(row['O3']) else None
        })
    
    return {
        'city': city_name,
        'data': timeseries,
        'count': len(timeseries)
    }


def get_city_aggregated_data(city_name: str, filter_type: str = 'latest', year: Optional[int] = None, month: Optional[int] = None, season: Optional[str] = None) -> dict:
    """Get aggregated city data for problem analysis
    
    Args:
        city_name: Name of the city
        filter_type: 'latest', 'all_time', 'year', 'month', 'season'
        year: Required if filter_type is 'year' or 'month'
        month: Required if filter_type is 'month' (1-12)
        season: Required if filter_type is 'season' ('winter', 'summer', 'monsoon', 'post_monsoon')
    
    Returns:
        dict: Aggregated pollutant data
    """
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # Filter data for the specific city
    city_data = data_manager.df[data_manager.df['City'] == city_name].copy()
    
    if len(city_data) == 0:
        raise HTTPException(status_code=404, detail=f"City '{city_name}' not found")
    
    city_data = city_data.dropna(subset=['AQI', 'Date']).copy()
    
    if len(city_data) == 0:
        raise HTTPException(status_code=404, detail=f"No valid data available for city '{city_name}'")
    
    pollutant_cols = ['PM2.5', 'NO', 'NO2', 'NOx', 'CO', 'SO2', 'O3']
    
    if filter_type == 'latest':
        # Get most recent record
        latest = city_data.sort_values('Date', ascending=False).iloc[0]
        result = {
            'pm25': round(float(latest['PM2.5']), 2) if pd.notna(latest['PM2.5']) else None,
            'no': round(float(latest['NO']), 2) if pd.notna(latest['NO']) else None,
            'no2': round(float(latest['NO2']), 2) if pd.notna(latest['NO2']) else None,
            'nox': round(float(latest['NOx']), 2) if pd.notna(latest['NOx']) else None,
            'co': round(float(latest['CO']), 2) if pd.notna(latest['CO']) else None,
            'so2': round(float(latest['SO2']), 2) if pd.notna(latest['SO2']) else None,
            'o3': round(float(latest['O3']), 2) if pd.notna(latest['O3']) else None,
            'date': latest['Date'].isoformat(),
            'filter': 'latest'
        }
    
    elif filter_type == 'all_time':
        # Calculate average across all data
        result = {
            'pm25': round(float(city_data['PM2.5'].mean()), 2) if 'PM2.5' in city_data.columns else None,
            'no': round(float(city_data['NO'].mean()), 2) if 'NO' in city_data.columns else None,
            'no2': round(float(city_data['NO2'].mean()), 2) if 'NO2' in city_data.columns else None,
            'nox': round(float(city_data['NOx'].mean()), 2) if 'NOx' in city_data.columns else None,
            'co': round(float(city_data['CO'].mean()), 2) if 'CO' in city_data.columns else None,
            'so2': round(float(city_data['SO2'].mean()), 2) if 'SO2' in city_data.columns else None,
            'o3': round(float(city_data['O3'].mean()), 2) if 'O3' in city_data.columns else None,
            'date_range': {
                'start': city_data['Date'].min().isoformat(),
                'end': city_data['Date'].max().isoformat()
            },
            'records': len(city_data),
            'filter': 'all_time'
        }
    
    elif filter_type == 'year':
        if year is None:
            raise HTTPException(status_code=400, detail="Year parameter required for 'year' filter")
        
        city_data['Year'] = city_data['Date'].dt.year
        year_data = city_data[city_data['Year'] == year]
        
        if len(year_data) == 0:
            raise HTTPException(status_code=404, detail=f"No data available for city '{city_name}' in year {year}")
        
        result = {
            'pm25': round(float(year_data['PM2.5'].mean()), 2) if 'PM2.5' in year_data.columns else None,
            'no': round(float(year_data['NO'].mean()), 2) if 'NO' in year_data.columns else None,
            'no2': round(float(year_data['NO2'].mean()), 2) if 'NO2' in year_data.columns else None,
            'nox': round(float(year_data['NOx'].mean()), 2) if 'NOx' in year_data.columns else None,
            'co': round(float(year_data['CO'].mean()), 2) if 'CO' in year_data.columns else None,
            'so2': round(float(year_data['SO2'].mean()), 2) if 'SO2' in year_data.columns else None,
            'o3': round(float(year_data['O3'].mean()), 2) if 'O3' in year_data.columns else None,
            'year': year,
            'records': len(year_data),
            'filter': 'year'
        }
    
    elif filter_type == 'month':
        if year is None or month is None:
            raise HTTPException(status_code=400, detail="Year and month parameters required for 'month' filter")
        
        if month < 1 or month > 12:
            raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
        
        city_data['Year'] = city_data['Date'].dt.year
        city_data['Month'] = city_data['Date'].dt.month
        month_data = city_data[(city_data['Year'] == year) & (city_data['Month'] == month)]
        
        if len(month_data) == 0:
            raise HTTPException(status_code=404, detail=f"No data available for city '{city_name}' in {year}-{month:02d}")
        
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        result = {
            'pm25': round(float(month_data['PM2.5'].mean()), 2) if 'PM2.5' in month_data.columns else None,
            'no': round(float(month_data['NO'].mean()), 2) if 'NO' in month_data.columns else None,
            'no2': round(float(month_data['NO2'].mean()), 2) if 'NO2' in month_data.columns else None,
            'nox': round(float(month_data['NOx'].mean()), 2) if 'NOx' in month_data.columns else None,
            'co': round(float(month_data['CO'].mean()), 2) if 'CO' in month_data.columns else None,
            'so2': round(float(month_data['SO2'].mean()), 2) if 'SO2' in month_data.columns else None,
            'o3': round(float(month_data['O3'].mean()), 2) if 'O3' in month_data.columns else None,
            'year': year,
            'month': month,
            'month_name': month_names[month - 1],
            'records': len(month_data),
            'filter': 'month'
        }
    
    elif filter_type == 'season':
        if season is None:
            raise HTTPException(status_code=400, detail="Season parameter required for 'season' filter")
        
        season = season.lower()
        season_map = {
            'winter': [12, 1, 2],
            'summer': [3, 4, 5],
            'monsoon': [6, 7, 8, 9],
            'post_monsoon': [10, 11]
        }
        
        if season not in season_map:
            raise HTTPException(status_code=400, detail=f"Invalid season: {season}. Must be one of: winter, summer, monsoon, post_monsoon")
        
        city_data['Month'] = city_data['Date'].dt.month
        season_data = city_data[city_data['Month'].isin(season_map[season])]
        
        if len(season_data) == 0:
            raise HTTPException(status_code=404, detail=f"No data available for city '{city_name}' in {season} season")
        
        season_names = {
            'winter': 'Winter',
            'summer': 'Summer',
            'monsoon': 'Monsoon',
            'post_monsoon': 'Post-Monsoon'
        }
        
        result = {
            'pm25': round(float(season_data['PM2.5'].mean()), 2) if 'PM2.5' in season_data.columns else None,
            'no': round(float(season_data['NO'].mean()), 2) if 'NO' in season_data.columns else None,
            'no2': round(float(season_data['NO2'].mean()), 2) if 'NO2' in season_data.columns else None,
            'nox': round(float(season_data['NOx'].mean()), 2) if 'NOx' in season_data.columns else None,
            'co': round(float(season_data['CO'].mean()), 2) if 'CO' in season_data.columns else None,
            'so2': round(float(season_data['SO2'].mean()), 2) if 'SO2' in season_data.columns else None,
            'o3': round(float(season_data['O3'].mean()), 2) if 'O3' in season_data.columns else None,
            'season': season_names[season],
            'records': len(season_data),
            'filter': 'season'
        }
    
    else:
        raise HTTPException(status_code=400, detail=f"Invalid filter_type: {filter_type}")
    
    # Get available years for filter dropdown
    city_data['Year'] = city_data['Date'].dt.year
    available_years = sorted(city_data['Year'].unique().tolist())
    result['available_years'] = available_years
    
    return result


def get_city_monitor_data(city_name: str, year: Optional[int] = None) -> dict:
    """Get aggregated monitor data for a specific city with optional year filter
    
    Args:
        city_name: Name of the city
        year: Optional year filter. If None, returns average by year (all time).
              If provided, returns average by month for that year.
    
    Returns:
        dict: Aggregated AQI and pollutant data with labels and values
    """
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # Filter data for the specific city
    city_data = data_manager.df[data_manager.df['City'] == city_name].copy()
    
    if len(city_data) == 0:
        raise HTTPException(status_code=404, detail=f"City '{city_name}' not found")
    
    # Clean data - remove rows without AQI or Date
    city_data = city_data.dropna(subset=['AQI', 'Date']).copy()
    
    if len(city_data) == 0:
        raise HTTPException(status_code=404, detail=f"No valid data available for city '{city_name}'")
    
    # Extract year and month from dates
    city_data['Year'] = city_data['Date'].dt.year
    city_data['Month'] = city_data['Date'].dt.month
    
    # Define pollutant columns (based on refined model)
    pollutant_cols = ['PM2.5', 'NO', 'NO2', 'NOx', 'CO', 'SO2', 'O3']
    
    if year is None:
        # All time: Average by year
        yearly_agg = city_data.groupby('Year').agg({
            'AQI': 'mean',
            **{col: 'mean' for col in pollutant_cols if col in city_data.columns}
        }).sort_index()
        
        # Prepare response
        labels = [str(y) for y in yearly_agg.index.tolist()]
        aqi_values = [round(float(v), 2) for v in yearly_agg['AQI'].values.tolist()]
        
        pollutant_data = {}
        for col in pollutant_cols:
            if col in yearly_agg.columns:
                pollutant_data[col.lower().replace('.', '')] = [
                    round(float(v), 2) if pd.notna(v) else None for v in yearly_agg[col].values.tolist()
                ]
            else:
                pollutant_data[col.lower().replace('.', '')] = [None] * len(labels)
        
        # Get available years
        available_years = sorted(city_data['Year'].unique().tolist())
        
        return {
            'city': city_name,
            'filter': 'all_time',
            'year': None,
            'labels': labels,
            'aqi': aqi_values,
            'pollutants': pollutant_data,
            'available_years': available_years
        }
    else:
        # Specific year: Average by month
        year_data = city_data[city_data['Year'] == year]
        
        if len(year_data) == 0:
            raise HTTPException(status_code=404, detail=f"No data available for city '{city_name}' in year {year}")
        
        monthly_agg = year_data.groupby('Month').agg({
            'AQI': 'mean',
            **{col: 'mean' for col in pollutant_cols if col in year_data.columns}
        }).sort_index()
        
        # Month names
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Prepare response (only months with data)
        labels = [month_names[m - 1] for m in monthly_agg.index.tolist()]
        aqi_values = [round(float(v), 2) for v in monthly_agg['AQI'].values.tolist()]
        
        pollutant_data = {}
        for col in pollutant_cols:
            if col in monthly_agg.columns:
                pollutant_data[col.lower().replace('.', '')] = [
                    round(float(v), 2) if pd.notna(v) else None for v in monthly_agg[col].values.tolist()
                ]
            else:
                pollutant_data[col.lower().replace('.', '')] = [None] * len(labels)
        
        # Get available years
        available_years = sorted(city_data['Year'].unique().tolist())
        
        return {
            'city': city_name,
            'filter': 'yearly',
            'year': year,
            'labels': labels,
            'aqi': aqi_values,
            'pollutants': pollutant_data,
            'available_years': available_years
        }


def get_analytics_overview() -> dict:
    """Get overall analytics overview"""
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    df_clean = data_manager.df.dropna(subset=['AQI'])
    
    # AQI distribution by category
    categories = []
    for aqi in df_clean['AQI']:
        cat, _, _, _ = get_aqi_category(aqi)
        categories.append(cat)
    
    category_counts = pd.Series(categories).value_counts().to_dict()
    
    # Top polluted cities
    city_aqi = df_clean.groupby('City')['AQI'].mean().nlargest(10).to_dict()
    
    # Monthly averages
    df_monthly = df_clean.copy()
    df_monthly['Month'] = df_monthly['Date'].dt.month
    monthly_aqi = df_monthly.groupby('Month')['AQI'].mean().to_dict()
    
    return {
        'total_records': len(df_clean),
        'avg_aqi': float(df_clean['AQI'].mean()),
        'max_aqi': float(df_clean['AQI'].max()),
        'min_aqi': float(df_clean['AQI'].min()),
        'category_distribution': category_counts,
        'top_polluted_cities': city_aqi,
        'monthly_average': monthly_aqi
    }


def get_pollutant_correlation() -> dict:
    """Get correlation matrix between pollutants and AQI
    
    Returns:
        dict: Correlation matrix data with pollutant names and correlation values
    """
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # Select pollutant columns and AQI (based on refined model)
    pollutant_cols = ['PM2.5', 'NO', 'NO2', 'NOx', 'CO', 'SO2', 'O3', 'AQI']
    
    # Filter columns that exist in the dataframe
    available_cols = [col for col in pollutant_cols if col in data_manager.df.columns]
    
    if len(available_cols) < 2:
        raise HTTPException(status_code=400, detail="Not enough pollutant columns for correlation")
    
    # Get clean data with no NaN values for correlation calculation
    df_corr = data_manager.df[available_cols].dropna()
    
    if len(df_corr) < 10:
        raise HTTPException(status_code=400, detail="Not enough data points for correlation")
    
    # Calculate correlation matrix
    corr_matrix = df_corr.corr()
    
    # Convert to list format for frontend
    pollutants = corr_matrix.columns.tolist()
    matrix_data = []
    
    for i, row_name in enumerate(pollutants):
        for j, col_name in enumerate(pollutants):
            value = float(corr_matrix.loc[row_name, col_name])
            matrix_data.append({
                'x': j,
                'y': i,
                'value': round(value, 2),
                'row': row_name,
                'col': col_name
            })
    
    return {
        'pollutants': pollutants,
        'matrix': matrix_data,
        'data_points': len(df_corr)
    }


def get_feature_importance() -> dict:
    """Get feature importance from the trained model"""
    if data_manager.model_info is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        model = data_manager.model_info['model']
        feature_names = data_manager.model_info['feature_names']
        
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            
            feature_importance_list = [
                {"feature": name, "importance": float(imp)}
                for name, imp in zip(feature_names, importances)
            ]
            
            feature_importance_list.sort(key=lambda x: x['importance'], reverse=True)
            
            return {
                "features": feature_importance_list,
                "count": len(feature_importance_list)
            }
        else:
            raise HTTPException(status_code=400, detail="Model does not support feature importance")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting feature importance: {str(e)}")


def get_prediction_history(limit: Optional[int] = 50) -> dict:
    """Get prediction history"""
    history_items = data_manager.get_prediction_history(limit)
    
    return {
        'count': len(history_items),
        'predictions': history_items,
        'stats': {
            'avg_aqi': float(np.mean([p['aqi'] for p in history_items])) if history_items else 0,
            'max_aqi': float(np.max([p['aqi'] for p in history_items])) if history_items else 0,
            'min_aqi': float(np.min([p['aqi'] for p in history_items])) if history_items else 0
        }
    }


def clear_history() -> dict:
    """Clear prediction history"""
    count = data_manager.clear_history()
    return {"message": f"Cleared {count} predictions from history"}


def get_model_info() -> dict:
    """Get comprehensive model information and metrics for Settings page"""
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    if data_manager.model_info is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    import numpy as np
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

    df = data_manager.df
    model = data_manager.model_info['model']
    features = data_manager.model_info['feature_names']

    # Dataset stats
    total_records = len(df)
    cities_count = df['City'].nunique() if 'City' in df.columns else 0

    # Reproduce the same train/test split used during training
    X = df[features]
    y = df["AQI"]
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    y_pred = model.predict(X_test)

    # Real metrics
    mae  = float(mean_absolute_error(y_test, y_pred))
    mse  = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2   = float(r2_score(y_test, y_pred))
    mape = float(np.mean(np.abs((y_test.values - y_pred) / y_test.values)) * 100)

    # Real feature importances
    importances = model.feature_importances_
    feature_importance_map = {f: round(float(imp) * 100, 2) for f, imp in zip(features, importances)}

    pollutant_features = [
        {"name": "PM2.5", "unit": "μg/m³", "used": True,  "importance": feature_importance_map.get("PM2.5", 0.0)},
        {"name": "NO",    "unit": "μg/m³", "used": True,  "importance": feature_importance_map.get("NO", 0.0)},
        {"name": "NO2",   "unit": "μg/m³", "used": True,  "importance": feature_importance_map.get("NO2", 0.0)},
        {"name": "NOx",   "unit": "μg/m³", "used": True,  "importance": feature_importance_map.get("NOx", 0.0)},
        {"name": "CO",    "unit": "mg/m³", "used": True,  "importance": feature_importance_map.get("CO", 0.0)},
        {"name": "SO2",   "unit": "μg/m³", "used": True,  "importance": feature_importance_map.get("SO2", 0.0)},
        {"name": "O3",    "unit": "μg/m³", "used": True,  "importance": feature_importance_map.get("O3", 0.0)},
        {"name": "PM10",    "unit": "μg/m³", "used": False, "importance": 0.0},
        {"name": "NH3",     "unit": "μg/m³", "used": False, "importance": 0.0},
        {"name": "Benzene", "unit": "μg/m³", "used": False, "importance": 0.0},
        {"name": "Toluene", "unit": "μg/m³", "used": False, "importance": 0.0},
        {"name": "Xylene",  "unit": "μg/m³", "used": False, "importance": 0.0},
        {"name": "month",           "unit": "-", "used": True, "importance": feature_importance_map.get("month", 0.0)},
        {"name": "is_weekend",      "unit": "-", "used": True, "importance": feature_importance_map.get("is_weekend", 0.0)},
        {"name": "season_Winter",   "unit": "-", "used": True, "importance": feature_importance_map.get("season_Winter", 0.0)},
        {"name": "season_Summer",   "unit": "-", "used": True, "importance": feature_importance_map.get("season_Summer", 0.0)},
        {"name": "season_Monsoon",  "unit": "-", "used": True, "importance": feature_importance_map.get("season_Monsoon", 0.0)},
        {"name": "season_PostMonsoon", "unit": "-", "used": True, "importance": feature_importance_map.get("season_PostMonsoon", 0.0)},
    ]

    # All real test-set points for scatter plot (matches full matplotlib output)
    scatter_data = [
        {"actual": round(float(y_test.values[i]), 1), "predicted": round(float(y_pred[i]), 1)}
        for i in range(len(y_test))
    ]

    # Residuals for first 30 points
    residual_errors = [
        {"sample": f"S{i+1}", "error": round(float(y_pred[i] - y_test.values[i]), 1)}
        for i in range(min(30, len(y_test)))
    ]

    model_info = {
        "modelName": "AQI Predictor",
        "algorithm": "Random Forest Regressor",
        "problemType": "Regression",
        "targetVariable": "AQI Index",
        "trainingRecords": len(X) - len(X_test),
        "testingRecords": len(X_test),
        "citiesUsed": cities_count,
        "columnsUsed": len(features) + 1,  # +1 for AQI target column
    }

    performance_metrics = {
        "rmse":    round(rmse, 2),
        "mae":     round(mae, 2),
        "r2Score": round(r2, 4),
        "mse":     round(mse, 2),
        "mape":    round(mape, 2),
    }

    model_details = {
        "numberOfTrees": int(getattr(model, 'n_estimators', 500)),
        "maxDepth": str(getattr(model, 'max_depth', 'None')),
        "minSamplesLeaf": int(getattr(model, 'min_samples_leaf', 1)),
        "featuresPerSplit": str(getattr(model, 'max_features', 'sqrt')),
        "randomState": int(getattr(model, 'random_state', 42)),
        "testRecords": len(X_test),
    }

    prediction_samples = {
        "scatterData": scatter_data,
        "residualErrors": residual_errors,
    }

    return {
        "modelInfo": model_info,
        "performanceMetrics": performance_metrics,
        "pollutantFeatures": pollutant_features,
        "modelDetails": model_details,
        "predictionSamples": prediction_samples,
    }



def get_dataset_info() -> dict:
    """Get comprehensive dataset information including statistics and column details"""
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    df = data_manager.df
    
    # Dataset shape
    total_rows = len(df)
    total_cols = len(df.columns)
    shape_info = {
        'rows': total_rows,
        'columns': total_cols,
        'totalCells': total_rows * total_cols
    }
    
    # Missing values
    missing_total = int(df.isnull().sum().sum())
    total_cells = total_rows * total_cols
    missing_percentage = round((missing_total / total_cells * 100), 2) if total_cells > 0 else 0
    missing_info = {
        'total': missing_total,
        'percentage': missing_percentage,
        'status': 'Present' if missing_total > 0 else 'None'
    }
    
    # Data types - count by category
    numeric_count = 0
    object_count = 0
    datetime_count = 0
    
    for dtype in df.dtypes:
        dtype_str = str(dtype)
        if 'int' in dtype_str or 'float' in dtype_str:
            numeric_count += 1
        elif 'datetime' in dtype_str:
            datetime_count += 1
        elif 'object' in dtype_str:
            object_count += 1
    
    data_types = {
        'numeric': numeric_count,
        'object': object_count,
        'datetime': datetime_count
    }
    
    # Feature metadata (from refined model)
    feature_metadata = {
        "PM2.5": {"unit": "μg/m³", "used": True, "importance": 32.0},
        "PM10": {"unit": "μg/m³", "used": False, "importance": 0.0},
        "NO": {"unit": "μg/m³", "used": True, "importance": 9.0},
        "NO2": {"unit": "μg/m³", "used": True, "importance": 14.0},
        "NOx": {"unit": "μg/m³", "used": True, "importance": 8.0},
        "NH3": {"unit": "μg/m³", "used": False, "importance": 0.0},
        "CO": {"unit": "mg/m³", "used": True, "importance": 7.0},
        "SO2": {"unit": "μg/m³", "used": True, "importance": 9.0},
        "O3": {"unit": "μg/m³", "used": True, "importance": 11.0},
        "Benzene": {"unit": "μg/m³", "used": False, "importance": 0.0},
        "Toluene": {"unit": "μg/m³", "used": False, "importance": 0.0},
        "Xylene": {"unit": "μg/m³", "used": False, "importance": 0.0},
        "AQI": {"unit": "-", "used": True, "importance": 0.0},  # Target variable
        "month": {"unit": "-", "used": True, "importance": 5.0},
        "is_weekend": {"unit": "-", "used": True, "importance": 3.0},
        "season_Winter": {"unit": "-", "used": True, "importance": 2.0},
        "season_Summer": {"unit": "-", "used": True, "importance": 2.0},
        "season_Monsoon": {"unit": "-", "used": True, "importance": 1.0},
        "season_PostMonsoon": {"unit": "-", "used": True, "importance": 1.0},
    }
    
    # Column details
    column_details = []
    for col in df.columns:
        non_null = int(df[col].count())
        null_count = int(len(df) - non_null)
        col_type = str(df[col].dtype)
        
        # Get feature metadata if available
        metadata = feature_metadata.get(col, {"unit": "-", "used": False, "importance": 0.0})
        
        column_details.append({
            'name': col,
            'type': col_type,
            'nonNull': non_null,
            'null': null_count,
            'unit': metadata['unit'],
            'used': metadata['used'],
            'importance': metadata['importance']
        })
    
    # Statistical summary for numeric columns (refined model pollutants)
    pollutant_cols = ['PM2.5', 'NO', 'NO2', 'NOx', 'CO', 'SO2', 'O3']
    
    statistics = []
    
    for col in pollutant_cols:
        if col in df.columns:
            col_data = df[col].dropna()
            if len(col_data) > 0:
                # For display, use PM2_5 (underscore) for consistency with frontend
                display_name = 'PM2_5' if col == 'PM2.5' else col
                stats = {
                    'column': display_name,
                    'count': int(col_data.count()),
                    'mean': round(float(col_data.mean()), 4),
                    'std': round(float(col_data.std()), 4),
                    'min': round(float(col_data.min()), 2),
                    'q25': round(float(col_data.quantile(0.25)), 4),
                    'q50': round(float(col_data.quantile(0.50)), 2),
                    'q75': round(float(col_data.quantile(0.75)), 4),
                    'max': round(float(col_data.max()), 2)
                }
                statistics.append(stats)
    
    # Add AQI statistics
    if 'AQI' in df.columns:
        aqi_data = df['AQI'].dropna()
        if len(aqi_data) > 0:
            statistics.append({
                'column': 'AQI',
                'count': int(aqi_data.count()),
                'mean': round(float(aqi_data.mean()), 2),
                'std': round(float(aqi_data.std()), 2),
                'min': round(float(aqi_data.min()), 2),
                'q25': round(float(aqi_data.quantile(0.25)), 2),
                'q50': round(float(aqi_data.quantile(0.50)), 2),
                'q75': round(float(aqi_data.quantile(0.75)), 2),
                'max': round(float(aqi_data.max()), 2)
            })
    
    # Dataset preview (last row for each city)
    preview_data = []
    
    if 'City' in df.columns:
        # Get last row for each city, sorted alphabetically
        cities = sorted(df['City'].dropna().unique())
        for city in cities:
            city_data = df[df['City'] == city]
            if len(city_data) > 0:
                last_row = city_data.iloc[-1]
                row_dict = {}
                for col in df.columns:
                    val = last_row[col]
                    if pd.isna(val):
                        row_dict[col] = None
                    elif isinstance(val, (np.integer, np.floating)):
                        row_dict[col] = round(float(val), 2)
                    elif isinstance(val, pd.Timestamp):
                        row_dict[col] = val.strftime('%Y-%m-%d')
                    else:
                        row_dict[col] = str(val)
                preview_data.append(row_dict)
    else:
        # Fallback to first 10 rows if no City column
        preview_df = df.head(10)
        for idx, row in preview_df.iterrows():
            row_dict = {}
            for col in df.columns:
                val = row[col]
                if pd.isna(val):
                    row_dict[col] = None
                elif isinstance(val, (np.integer, np.floating)):
                    row_dict[col] = round(float(val), 2)
                elif isinstance(val, pd.Timestamp):
                    row_dict[col] = val.strftime('%Y-%m-%d')
                else:
                    row_dict[col] = str(val)
            preview_data.append(row_dict)
    
    result = {
        'shape': shape_info,
        'missingValues': missing_info,
        'dataTypes': data_types,
        'columnDetails': column_details,
        'statistics': statistics,
        'preview': preview_data
    }
    
    return result


def get_city_comparison(year: Optional[int] = None, limit: int = 20) -> dict:
    """Get city comparison data with optional year filter
    
    Args:
        year: Optional year filter. If None, returns data for all years.
              If provided, returns data for that specific year.
        limit: Maximum number of cities to return
    
    Returns:
        dict: City comparison data with average AQI
    """
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    df_clean = data_manager.df.dropna(subset=['AQI', 'City', 'Date']).copy()
    
    if len(df_clean) == 0:
        raise HTTPException(status_code=404, detail="No data available")
    
    # Filter by year if provided
    if year is not None:
        df_clean['Year'] = df_clean['Date'].dt.year
        df_clean = df_clean[df_clean['Year'] == year]
        
        if len(df_clean) == 0:
            raise HTTPException(status_code=404, detail=f"No data available for year {year}")
    
    # Calculate average AQI per city
    city_avg_aqi = df_clean.groupby('City')['AQI'].mean().reset_index()
    city_avg_aqi.columns = ['city', 'avg_aqi']
    
    # Add category to each city
    city_avg_aqi['category'] = city_avg_aqi['avg_aqi'].apply(
        lambda aqi: get_aqi_category(aqi)[0]
    )
    
    # Sort by average AQI (descending) and limit
    city_avg_aqi = city_avg_aqi.sort_values('avg_aqi', ascending=False).head(limit)
    
    # Get available years for filter dropdown
    df_with_years = data_manager.df.dropna(subset=['Date']).copy()
    df_with_years['Year'] = df_with_years['Date'].dt.year
    available_years = sorted(df_with_years['Year'].unique().tolist())
    
    return {
        'cities': city_avg_aqi['city'].tolist(),
        'avg_aqi': [float(aqi) for aqi in city_avg_aqi['avg_aqi'].tolist()],
        'categories': city_avg_aqi['category'].tolist(),
        'count': len(city_avg_aqi),
        'filter': 'all_time' if year is None else 'yearly',
        'year': year,
        'available_years': available_years
    }


def get_seasonal_data(year: Optional[int] = None) -> dict:
    """Get seasonal AQI data grouped by months and seasons
    
    Args:
        year: Optional year filter. If None, returns data for all years.
              If provided, returns data for that specific year.
    
    Returns:
        dict: Monthly and seasonal AQI averages with categories
    """
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    df_clean = data_manager.df.dropna(subset=['AQI', 'Date']).copy()
    
    if len(df_clean) == 0:
        raise HTTPException(status_code=404, detail="No data available")
    
    # Extract year if filtering
    if year is not None:
        df_clean['Year'] = df_clean['Date'].dt.year
        df_clean = df_clean[df_clean['Year'] == year]
        
        if len(df_clean) == 0:
            raise HTTPException(status_code=404, detail=f"No data available for year {year}")
    
    # Extract month from dates
    df_clean['Month'] = df_clean['Date'].dt.month
    
    # Calculate monthly average AQI
    monthly_avg = df_clean.groupby('Month')['AQI'].mean().sort_index()
    
    # Create month data
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    if year is None:
        # All time: Include all 12 months (with None for missing months)
        monthly_labels = month_names
        monthly_values = []
        monthly_categories = []
        
        for month_num in range(1, 13):
            if month_num in monthly_avg.index:
                aqi = float(monthly_avg[month_num])
                monthly_values.append(aqi)
                category, _, _, _ = get_aqi_category(aqi)
                monthly_categories.append(category)
            else:
                monthly_values.append(None)
                monthly_categories.append(None)
    else:
        # Specific year: Only include months with data
        monthly_labels = []
        monthly_values = []
        monthly_categories = []
        
        for month_num in range(1, 13):
            if month_num in monthly_avg.index:
                monthly_labels.append(month_names[month_num - 1])
                aqi = float(monthly_avg[month_num])
                monthly_values.append(aqi)
                category, _, _, _ = get_aqi_category(aqi)
                monthly_categories.append(category)
    
    # Calculate seasonal average AQI (Indian seasons) using monthly averages
    # Winter: Dec, Jan, Feb (12, 1, 2)
    # Summer: Mar, Apr, May (3, 4, 5)
    # Monsoon: Jun, Jul, Aug, Sep (6, 7, 8, 9)
    # Post-Monsoon: Oct, Nov (10, 11)
    
    seasons = [
        ('Winter', [12, 1, 2]),
        ('Summer', [3, 4, 5]),
        ('Monsoon', [6, 7, 8, 9]),
        ('Post-Monsoon', [10, 11])
    ]
    
    seasonal_data = []
    for season_name, month_list in seasons:
        # Calculate from monthly averages for consistency with radar chart
        season_month_values = [monthly_avg.get(m) for m in month_list if m in monthly_avg.index]
        if season_month_values:
            season_aqi = sum(season_month_values) / len(season_month_values)
            category, _, _, _ = get_aqi_category(season_aqi)
            seasonal_data.append({
                'season': season_name,
                'avg_aqi': float(season_aqi),
                'category': category,
                'months_with_data': len(season_month_values)
            })
        elif year is None:
            # Only include empty seasons when showing all time
            seasonal_data.append({
                'season': season_name,
                'avg_aqi': 0,
                'category': None,
                'months_with_data': 0
            })
    
    # Get available years for filter dropdown
    df_with_years = data_manager.df.dropna(subset=['Date']).copy()
    df_with_years['Year'] = df_with_years['Date'].dt.year
    available_years = sorted(df_with_years['Year'].unique().tolist())
    
    return {
        'monthly': {
            'labels': monthly_labels,
            'values': monthly_values,
            'categories': monthly_categories
        },
        'seasonal': seasonal_data,
        'filter': 'all_time' if year is None else 'yearly',
        'year': year,
        'available_years': available_years
    }


def get_aqi_trend(year: Optional[int] = None) -> dict:
    """Get AQI trend data with optional year filter
    
    Args:
        year: Optional year filter. If None, returns average AQI by year.
              If provided, returns average AQI by month for that year.
    
    Returns:
        dict: Trend data with labels and values
    """
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    df_clean = data_manager.df.dropna(subset=['AQI', 'Date']).copy()
    
    if len(df_clean) == 0:
        raise HTTPException(status_code=404, detail="No data available")
    
    # Extract year and month from dates
    df_clean['Year'] = df_clean['Date'].dt.year
    df_clean['Month'] = df_clean['Date'].dt.month
    
    if year is None:
        # All time: Average AQI by year
        yearly_avg = df_clean.groupby('Year')['AQI'].mean().sort_index()
        
        # Get available years for frontend
        available_years = sorted(df_clean['Year'].unique().tolist())
        
        return {
            'filter': 'all_time',
            'year': None,
            'labels': [str(y) for y in yearly_avg.index.tolist()],
            'values': [float(v) for v in yearly_avg.values.tolist()],
            'available_years': available_years
        }
    else:
        # Specific year: Average AQI by month
        year_data = df_clean[df_clean['Year'] == year]
        
        if len(year_data) == 0:
            raise HTTPException(status_code=404, detail=f"No data available for year {year}")
        
        monthly_avg = year_data.groupby('Month')['AQI'].mean().sort_index()
        
        # Only return months that have data (not all 12 months)
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Get only available months
        labels = []
        values = []
        for month_num in monthly_avg.index:
            labels.append(month_names[month_num - 1])
            values.append(float(monthly_avg[month_num]))
        
        # Get available years for frontend
        available_years = sorted(df_clean['Year'].unique().tolist())
        
        return {
            'filter': 'yearly',
            'year': year,
            'labels': labels,
            'values': values,
            'available_years': available_years
        }


def get_aqi_frequency(year: Optional[int] = None, bin_size: int = 50) -> dict:
    """Get AQI frequency distribution with optional year filter
    
    Args:
        year: Optional year filter. If None, uses all data.
        bin_size: Size of AQI bins for frequency calculation
    
    Returns:
        dict: Frequency distribution data
    """
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    df_clean = data_manager.df.dropna(subset=['AQI', 'Date']).copy()
    
    if len(df_clean) == 0:
        raise HTTPException(status_code=404, detail="No data available")
    
    # Extract year
    df_clean['Year'] = df_clean['Date'].dt.year
    
    # Filter by year if provided
    if year is not None:
        df_clean = df_clean[df_clean['Year'] == year]
        
        if len(df_clean) == 0:
            raise HTTPException(status_code=404, detail=f"No data available for year {year}")
    
    # Get AQI values
    aqi_values = df_clean['AQI'].values
    
    # Calculate bins
    max_aqi = int(np.ceil(aqi_values.max() / bin_size) * bin_size)
    bins = np.arange(0, max_aqi + bin_size, bin_size)
    
    # Calculate frequency distribution
    hist, bin_edges = np.histogram(aqi_values, bins=bins)
    
    # Create labels for bins (e.g., "0-50", "50-100")
    labels = []
    for i in range(len(bin_edges) - 1):
        labels.append(f"{int(bin_edges[i])}-{int(bin_edges[i+1])}")
    
    # Get available years for frontend
    available_years = sorted(data_manager.df.dropna(subset=['Date'])['Date'].dt.year.unique().tolist())
    
    return {
        'filter': 'all_time' if year is None else 'yearly',
        'year': year,
        'labels': labels,
        'frequencies': [int(f) for f in hist.tolist()],
        'bin_size': bin_size,
        'total_records': len(aqi_values),
        'available_years': available_years
    }


def get_overall_aggregated_data(filter_type: str = 'all_time', year: Optional[int] = None, season: Optional[str] = None) -> dict:
    """Get aggregated data across all cities for problem analysis
    
    Args:
        filter_type: 'all_time', 'year', 'season'
        year: Required if filter_type is 'year'
        season: Required if filter_type is 'season' ('winter', 'summer', 'monsoon', 'post_monsoon')
    
    Returns:
        dict: Aggregated pollutant data across all cities
    """
    if data_manager.df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # Get all data
    all_data = data_manager.df.copy()
    
    all_data = all_data.dropna(subset=['AQI', 'Date']).copy()
    
    if len(all_data) == 0:
        raise HTTPException(status_code=404, detail="No valid data available")
    
    pollutant_cols = ['PM2.5', 'NO', 'NO2', 'NOx', 'CO', 'SO2', 'O3']
    
    if filter_type == 'all_time':
        # Calculate average across all data
        result = {
            'pm25': round(float(all_data['PM2.5'].mean()), 2) if 'PM2.5' in all_data.columns else None,
            'no': round(float(all_data['NO'].mean()), 2) if 'NO' in all_data.columns else None,
            'no2': round(float(all_data['NO2'].mean()), 2) if 'NO2' in all_data.columns else None,
            'nox': round(float(all_data['NOx'].mean()), 2) if 'NOx' in all_data.columns else None,
            'co': round(float(all_data['CO'].mean()), 2) if 'CO' in all_data.columns else None,
            'so2': round(float(all_data['SO2'].mean()), 2) if 'SO2' in all_data.columns else None,
            'o3': round(float(all_data['O3'].mean()), 2) if 'O3' in all_data.columns else None,
            'date_range': {
                'start': all_data['Date'].min().isoformat(),
                'end': all_data['Date'].max().isoformat()
            },
            'records': len(all_data),
            'filter': 'all_time'
        }
    
    elif filter_type == 'year':
        if year is None:
            raise HTTPException(status_code=400, detail="Year parameter required for 'year' filter")
        
        all_data['Year'] = all_data['Date'].dt.year
        year_data = all_data[all_data['Year'] == year]
        
        if len(year_data) == 0:
            raise HTTPException(status_code=404, detail=f"No data available for year {year}")
        
        result = {
            'pm25': round(float(year_data['PM2.5'].mean()), 2) if 'PM2.5' in year_data.columns else None,
            'no': round(float(year_data['NO'].mean()), 2) if 'NO' in year_data.columns else None,
            'no2': round(float(year_data['NO2'].mean()), 2) if 'NO2' in year_data.columns else None,
            'nox': round(float(year_data['NOx'].mean()), 2) if 'NOx' in year_data.columns else None,
            'co': round(float(year_data['CO'].mean()), 2) if 'CO' in year_data.columns else None,
            'so2': round(float(year_data['SO2'].mean()), 2) if 'SO2' in year_data.columns else None,
            'o3': round(float(year_data['O3'].mean()), 2) if 'O3' in year_data.columns else None,
            'year': year,
            'records': len(year_data),
            'filter': 'year'
        }
    
    elif filter_type == 'season':
        if season is None:
            raise HTTPException(status_code=400, detail="Season parameter required for 'season' filter")
        
        season = season.lower()
        season_map = {
            'winter': [12, 1, 2],
            'summer': [3, 4, 5],
            'monsoon': [6, 7, 8, 9],
            'post_monsoon': [10, 11]
        }
        
        if season not in season_map:
            raise HTTPException(status_code=400, detail=f"Invalid season: {season}. Must be one of: winter, summer, monsoon, post_monsoon")
        
        all_data['Month'] = all_data['Date'].dt.month
        season_data = all_data[all_data['Month'].isin(season_map[season])]
        
        if len(season_data) == 0:
            raise HTTPException(status_code=404, detail=f"No data available for {season} season")
        
        season_names = {
            'winter': 'Winter',
            'summer': 'Summer',
            'monsoon': 'Monsoon',
            'post_monsoon': 'Post-Monsoon'
        }
        
        result = {
            'pm25': round(float(season_data['PM2.5'].mean()), 2) if 'PM2.5' in season_data.columns else None,
            'no': round(float(season_data['NO'].mean()), 2) if 'NO' in season_data.columns else None,
            'no2': round(float(season_data['NO2'].mean()), 2) if 'NO2' in season_data.columns else None,
            'nox': round(float(season_data['NOx'].mean()), 2) if 'NOx' in season_data.columns else None,
            'co': round(float(season_data['CO'].mean()), 2) if 'CO' in season_data.columns else None,
            'so2': round(float(season_data['SO2'].mean()), 2) if 'SO2' in season_data.columns else None,
            'o3': round(float(season_data['O3'].mean()), 2) if 'O3' in season_data.columns else None,
            'season': season_names[season],
            'records': len(season_data),
            'filter': 'season'
        }
    
    else:
        raise HTTPException(status_code=400, detail=f"Invalid filter_type: {filter_type}")
    
    # Get available years for filter dropdown
    all_data['Year'] = all_data['Date'].dt.year
    available_years = sorted(all_data['Year'].unique().tolist())
    result['available_years'] = available_years
    
    return result
