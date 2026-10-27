# Import required libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

pd.set_option("display.show_dimensions", True)  # always print rows x columns under a table


# Load dataset
df = pd.read_csv("aqi_data.csv")

print("First 5 rows of dataset:")
print(df.head())

pollutants = ["PM2.5", "NO", "NO2", "NOx", "CO", "SO2", "O3"]

print("\nMissing values before cleaning:")
print(df.isnull().sum())

# Data cleaning
rows_before = len(df)
# remove rows with empty AQI
df = df.dropna(subset=["AQI"])  
# AQI threshold: scale ends at 500, larger is noise
df = df[df["AQI"] <= 500]     
# Safety limits: remove negative readings and too much higher values 
limits = {"PM2.5": 1000, "NO": 1000, "NO2": 1000, "NOx": 1000, "CO": 50, "SO2": 1600, "O3": 748}
for col, upper in limits.items():
    df = df[df[col].isna() | df[col].between(0, upper)]
# remove rows missing 3+ pollutants
df = df[df[pollutants].isnull().sum(axis=1) < 3].copy()  
# Pollutants are right-skewed (a few very high readings),
# so the median is a safer fill for the remaining gaps than the mean
for col in pollutants:
    df[col] = df[col].fillna(df[col].median())

print(f"\nRows kept after cleaning: {len(df)} of {rows_before}")


# Map month to season
def get_season(month):
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8, 9]:
        return "Monsoon"
    else:
        return "PostMonsoon"


seasons = ["Winter", "Summer", "PostMonsoon"]  # Monsoon is the baseline (all 0)


# Create time-based features
def add_time_features(data):
    data["Date"] = pd.to_datetime(data["Date"])
    data["month"] = data["Date"].dt.month
    data["is_weekend"] = (data["Date"].dt.dayofweek >= 5).astype(int)
    season = data["month"].apply(get_season)
    for s in seasons:
        data[f"season_{s}"] = (season == s).astype(int)
    return data


df = add_time_features(df)

# Save cleaned and engineered dataset
df.to_csv("refined_aqi_data.csv", index=False)
print("Refined dataset saved as 'refined_aqi_data.csv'")


# Define feature set for modeling
features = pollutants + ["month", "is_weekend"] + [f"season_{s}" for s in seasons]

X = df[features]
y = df["AQI"]

print("\nFirst 5 rows after cleaning (features used by the model, with AQI):")
print(df[features + ["AQI"]].head())


# Dataset analysis: correlation between features and AQI
corr = df[features + ["AQI"]].corr()
plt.figure(figsize=(9, 7))
plt.imshow(corr, cmap="coolwarm", vmin=-1, vmax=1)
plt.colorbar()
plt.xticks(range(len(corr)), corr.columns, rotation=90)
plt.yticks(range(len(corr)), corr.columns)
for i in range(len(corr)):
    for j in range(len(corr)):
        plt.text(j, i, f"{corr.iloc[i, j]:.2f}", ha="center", va="center", fontsize=7)
plt.title("Correlation Between Features and AQI")
plt.tight_layout()
plt.show()


# Dataset analysis: mean AQI by month
plt.figure(figsize=(8, 5))
df.groupby("month")["AQI"].mean().plot(kind="bar")
plt.xticks(rotation=0)
plt.xlabel("Month")
plt.ylabel("Mean AQI")
plt.title("Mean AQI by Month")
plt.show()


# Split dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


# Define the three regression models (scaling is only needed for the regression ones)
rf_model = RandomForestRegressor(n_estimators=500, random_state=42, n_jobs=-1)
mlr_model = make_pipeline(StandardScaler(), LinearRegression())
poly_model = make_pipeline(
    StandardScaler(), PolynomialFeatures(degree=2), LinearRegression()
)

models = {
    "Random Forest": rf_model,
    "Multiple Linear": mlr_model,
    "Polynomial": poly_model,
}


# Train each model and evaluate it on the test data
predictions, rows = {}, {}
for name, model in models.items():
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    mse = mean_squared_error(y_test, pred)

    predictions[name] = pred
    rows[name] = {
        "MAE": mean_absolute_error(y_test, pred),
        "MSE": mse,
        "RMSE": np.sqrt(mse),
        "R2": r2_score(y_test, pred),
        "Train R2": r2_score(y_train, model.predict(X_train)),
        "Correlation": np.corrcoef(y_test, pred)[0, 1],
    }

results = pd.DataFrame(rows).T
best_model_name = results["R2"].idxmax()

print("\nModel Comparison (test data):")
print(results.round(3).to_string())


# Plot Actual vs Predicted AQI for each model
fig, axes = plt.subplots(1, 3, figsize=(16, 5), sharex=True, sharey=True)
for ax, (name, pred) in zip(axes, predictions.items()):
    ax.scatter(y_test, pred, alpha=0.4, s=8)
    ax.plot([0, 500], [0, 500], color="red", linewidth=2)
    ax.set_title(f"{name} (R2 = {results.loc[name, 'R2']:.3f})")
    ax.set_xlabel("Actual AQI")
    ax.grid(True)
axes[0].set_ylabel("Predicted AQI")
plt.tight_layout()
plt.show()


# Plot feature importance from the Random Forest
importances = rf_model.feature_importances_
plt.figure(figsize=(14, 7))
plt.barh(features, importances)
plt.xlabel("Importance (Monsoon is the baseline season, so it has no bar)")
plt.title("Feature Importance in AQI Prediction (Random Forest)")
plt.show()


# Prepare a sample input for prediction
sample = {
    "Date": "2024-01-15",
    "PM2.5": 111.89,
    "NO": 22.25,
    "NO2": 43.29,
    "NOx": 64.53,
    "CO": 1.5,
    "SO2": 66.44,
    "O3": 5,
}
sample_data = add_time_features(pd.DataFrame([sample]))[features]


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


# Predict AQI for the sample with every model (AQI is limited to 0-500)
print("\nSample input:")
print("  " + ", ".join(f"{key} = {value}" for key, value in sample.items()))

print("\nPredicted AQI for the sample:")
print(f"{'Model':<18}{'AQI':>8}   Category")
for name, model in models.items():
    aqi = float(np.clip(model.predict(sample_data)[0], 0, 500))
    print(f"{name:<18}{aqi:>8.2f}   {aqi_category(aqi)}")

best_aqi = float(np.clip(models[best_model_name].predict(sample_data)[0], 0, 500))
print(f"\nBest model    : {best_model_name} ({best_aqi:.2f})")
print(f"AQI Category  : {aqi_category(best_aqi)}")
print(f"Early Warning : {early_warning(best_aqi)}")


# Save trained models and feature list
joblib.dump(rf_model, "rf_model.pkl")
joblib.dump(mlr_model, "mlr_model.pkl")
joblib.dump(poly_model, "poly_model.pkl")
joblib.dump(features, "features.pkl")
print("\nModels and features saved successfully.")
