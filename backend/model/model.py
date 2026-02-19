# Import required libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib


# Load dataset
df = pd.read_csv("aqi_data.csv")

# Display initial data preview
print("First 5 rows of dataset:")
print(df.head())

# Check missing values before cleaning
print("\nMissing values before cleaning:")
print(df.isnull().sum())


# Remove rows with missing AQI values
df = df.dropna(subset=["AQI"])

# Fill missing pollutant values using median
pollutants = ["PM2.5", "NO", "NO2", "NOx", "CO", "SO2", "O3"]
for col in pollutants:
    if col in df.columns:
        df[col] = df[col].fillna(df[col].median())


# Remove outliers using IQR method
cols_for_outliers = pollutants + ["AQI"]
for col in cols_for_outliers:
    if col in df.columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1

        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR

        df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]


# Convert Date column to datetime and sort data
df["Date"] = pd.to_datetime(df["Date"])
df = df.sort_values("Date")


# Extract time-based features
df["month"] = df["Date"].dt.month
df["is_weekend"] = df["Date"].dt.dayofweek.apply(lambda x: 1 if x >= 5 else 0)


# Define function to map month to season
def get_season(month):
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8, 9]:
        return "Monsoon"
    else:
        return "PostMonsoon"


# Create season feature and apply one-hot encoding
df["season"] = df["month"].apply(get_season)
df = pd.get_dummies(df, columns=["season"])


# Ensure all season columns exist
for s in ["season_Winter", "season_Summer", "season_Monsoon", "season_PostMonsoon"]:
    if s not in df.columns:
        df[s] = 0


# Save cleaned and engineered dataset
df.to_csv("refined_aqi_data.csv", index=False)
print("\nRefined dataset saved as 'refined_aqi_data.csv'")


# Define feature set for modeling
features = ["PM2.5", "NO", "NO2", "NOx", "CO", "SO2", "O3"]
features = [f for f in features if f in df.columns]

season_cols = [col for col in df.columns if col.startswith("season_")]
features += ["month", "is_weekend"] + season_cols

X = df[features]
y = df["AQI"]


# Split dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


# Train Random Forest regression model
model = RandomForestRegressor(n_estimators=500, random_state=42)
model.fit(X_train, y_train)


# Generate predictions on test data
y_pred = model.predict(X_test)


# Evaluate model performance metrics
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print("\nModel Performance:")
print(f"Mean Absolute Error: {mae:.2f}")
print(f"Mean Squared Error: {mse:.2f}")
print(f"Root Mean Squared Error: {rmse:.2f}")
print(f"R2 Score: {r2:.4f}")


# Plot Actual vs Predicted AQI values
plt.figure(figsize=(8, 6))
plt.scatter(y_test, y_pred, alpha=0.6)

min_val = min(min(y_test), min(y_pred))
max_val = max(max(y_test), max(y_pred))
plt.plot([min_val, max_val], [min_val, max_val], color="red", linewidth=2)

plt.xlabel("Actual AQI")
plt.ylabel("Predicted AQI")
plt.title("Actual vs Predicted AQI with Prediction Line")
plt.grid(True)
plt.show()


# Plot feature importance from trained model
importances = model.feature_importances_
plt.figure(figsize=(14, 7))
plt.barh(features, importances)
plt.xlabel("Importance")
plt.title("Feature Importance in AQI Prediction")
plt.show()


# Prepare a sample input for prediction
sample_data = pd.DataFrame([{
    "PM2.5": 111.89,
    "NO": 22.25,
    "NO2": 43.29,
    "NOx": 64.53,
    "CO": 22.25,
    "SO2": 66.44,
    "O3": 5,
    "Date": "2024-01-15"
}])


# Generate temporal and seasonal features for sample
sample_data["Date"] = pd.to_datetime(sample_data["Date"])
sample_data["month"] = sample_data["Date"].dt.month
sample_data["is_weekend"] = sample_data["Date"].dt.dayofweek.apply(lambda x: 1 if x >= 5 else 0)
sample_data["season"] = sample_data["month"].apply(get_season)

sample_data = pd.get_dummies(sample_data, columns=["season"])


# Align sample features with training features
for col in season_cols:
    if col not in sample_data.columns:
        sample_data[col] = 0

sample_data = sample_data[features]


# Predict AQI for sample data
prediction = model.predict(sample_data)
print(f"\nPredicted AQI for given pollution levels: {prediction[0]:.2f}")


# Define AQI category classification function
def aqi_category(aqi):
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
    else:
        return "Severe"


# Define early warning message function
def early_warning(aqi):
    if aqi > 300:
        return "🚨 HEALTH EMERGENCY: Severe air pollution! Avoid outdoor activities."
    elif aqi > 200:
        return "⚠️ HIGH POLLUTION ALERT: Sensitive groups should stay indoors."
    elif aqi > 150:
        return "😷 MODERATE RISK: Consider wearing a mask outside."
    else:
        return "✅ Air quality is within safe limits."


# Display AQI category and warning message
print(f"AQI Category: {aqi_category(prediction[0])}")
print(f"Early Warning: {early_warning(prediction[0])}")


# Save trained model and feature list
joblib.dump(model, "model.pkl")
joblib.dump(features, "features.pkl")
print("\nModel and features saved successfully.")
