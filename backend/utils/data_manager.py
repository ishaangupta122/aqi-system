"""
Data loading and management utilities
"""

import pandas as pd
import joblib
import os
from typing import Optional


class DataManager:
    """Manages model and dataset loading"""
    
    def __init__(self):
        self.model_info: Optional[dict] = None
        self.df: Optional[pd.DataFrame] = None
        self.prediction_history: list = []
    
    def load_model(self) -> bool:
        """Load the trained model"""
        try:
            model_path = 'model/model.pkl'
            features_path = 'model/features.pkl'
            
            # Check if both files exist
            if not os.path.exists(model_path):
                print(f"✗ Model file not found: {model_path}")
                return False
            if not os.path.exists(features_path):
                print(f"✗ Features file not found: {features_path}")
                return False
            
            # Load model and features separately
            model = joblib.load(model_path)
            feature_names = joblib.load(features_path)
            
            # Create model_info dictionary
            self.model_info = {
                'model': model,
                'feature_names': feature_names
            }
            
            print(f"✓ Model loaded successfully")
            print(f"  Features: {len(feature_names)}")
            return True
        except Exception as e:
            print(f"✗ Error loading model: {str(e)}")
            return False
    
    def load_data(self) -> bool:
        """Load the dataset"""
        try:
            # Use refined dataset to match model training data
            # This ensures consistency between analytics range and prediction capabilities
            refined_path = 'model/refined_aqi_data.csv'
            data_path = 'model/aqi_data.csv'
            
            if os.path.exists(refined_path):
                self.df = pd.read_csv(refined_path)
                print(f"✓ Refined data loaded successfully")
                
                # Convert season columns from boolean strings to integers
                season_cols = ['season_Monsoon', 'season_PostMonsoon', 'season_Summer', 'season_Winter']
                for col in season_cols:
                    if col in self.df.columns:
                        # Convert 'True'/'False' strings or boolean to 0/1 integers
                        self.df[col] = self.df[col].map({True: 1, False: 0, 'True': 1, 'False': 0}).fillna(0).astype(int)
                
                # Ensure is_weekend is also integer
                if 'is_weekend' in self.df.columns:
                    self.df['is_weekend'] = self.df['is_weekend'].astype(int)
                    
            elif os.path.exists(data_path):
                self.df = pd.read_csv(data_path)
                print(f"✓ Original data loaded successfully")
            else:
                print(f"✗ Data file not found")
                return False
                
            self.df['Date'] = pd.to_datetime(self.df['Date'], errors='coerce')
            print(f"  Total records: {len(self.df)}")
            print(f"  Cities: {self.df['City'].nunique()}")
            return True
        except Exception as e:
            print(f"✗ Error loading data: {str(e)}")
            return False
    
    def add_prediction_to_history(self, prediction: dict) -> None:
        """Add a prediction to history"""
        self.prediction_history.append(prediction)
    
    def get_prediction_history(self, limit: Optional[int] = None) -> list:
        """Get prediction history"""
        if limit:
            return self.prediction_history[-limit:]
        return self.prediction_history
    
    def clear_history(self) -> int:
        """Clear prediction history and return count"""
        count = len(self.prediction_history)
        self.prediction_history = []
        return count


# Global instance
data_manager = DataManager()
