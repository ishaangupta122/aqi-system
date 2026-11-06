from pathlib import Path
import joblib
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    root_mean_squared_error,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

MODEL_DIR = Path(__file__).parent
RAW_CSV = MODEL_DIR / "aqi_data.csv"
REFINED_CSV = MODEL_DIR / "refined_aqi_data.csv"

MODEL_FILES = {
    "Random Forest": "rf_model.pkl",
    "Multiple Linear": "mlr_model.pkl",
    "Polynomial": "poly_model.pkl",
}

UPPER_LIMITS = {"PM2.5": 1000, "NO": 1000, "NO2": 1000, "NOx": 1000, "CO": 50, "SO2": 1600, "O3": 748}
POLLUTANTS = list(UPPER_LIMITS)

# Monsoon (Jun-Sep) is the baseline: all three below are 0
SEASONS = {
    "Winter": (12, 1, 2),
    "Summer": (3, 4, 5),
    "PostMonsoon": (10, 11),
}
FEATURES = POLLUTANTS + ["month", "is_weekend"] + list(SEASONS)

SAMPLE = {
    "PM2.5": 111.89,
    "NO": 22.25,
    "NO2": 43.29,
    "NOx": 64.53,
    "CO": 1.5,
    "SO2": 66.44,
    "O3": 5,
    "month": 1,
    "is_weekend": 0,
    "Winter": 1,
    "Summer": 0,
    "PostMonsoon": 0,
}

ADVICE = {
    "Good": "Air quality is within safe limits.",
    "Moderate": "Sensitive groups should limit time outdoors.",
    "Poor": "Avoid long outdoor activity and wear a mask outside.",
    "Severe": "Stay indoors with windows closed and avoid all outdoor exposure.",
}


def clean(df):
    df = df.dropna(subset=["AQI"])  # Drop rows with missing AQI
    df = df[df["AQI"] <= 500]  # Drop AQI above 500
    for column, upper in UPPER_LIMITS.items():  # Drop negative or extreme values
        df = df[df[column].isna() | df[column].between(0, upper)]
    df = df[df[POLLUTANTS].isnull().sum(axis=1) < 3].copy()  # Drop 3+ missing values
    for column in POLLUTANTS:
        df[column] = df[column].fillna(df[column].median())  # Median fill (skewed)
    return df


def add_time_features(data):
    data["Date"] = pd.to_datetime(data["Date"])
    data["month"] = data["Date"].dt.month
    data["is_weekend"] = (data["Date"].dt.dayofweek >= 5).astype(int)
    for season, months in SEASONS.items():
        data[season] = data["month"].isin(months).astype(int)
    return data


def split_data(df):
    return train_test_split(df[FEATURES], df["AQI"], test_size=0.2, random_state=42)


def train_and_score(X_train, X_test, y_train, y_test):
    models = {
        "Random Forest": RandomForestRegressor(n_estimators=500, random_state=42, n_jobs=-1),
        "Multiple Linear": make_pipeline(StandardScaler(), LinearRegression()),
        "Polynomial": make_pipeline(StandardScaler(), PolynomialFeatures(degree=2), LinearRegression()),
    }
    rows = []
    for model in models.values():
        model.fit(X_train, y_train)
        predicted = model.predict(X_test)
        rows.append(
            {
                "MAE": mean_absolute_error(y_test, predicted),
                "MSE": mean_squared_error(y_test, predicted),
                "RMSE": root_mean_squared_error(y_test, predicted),
                "R2": r2_score(y_test, predicted),
                "Train R2": r2_score(y_train, model.predict(X_train)),
            }
        )
    results = pd.DataFrame(rows, index=list(models))
    return models, results


def plot_results(X_test, y_test, models, results):
    # Actual vs predicted AQI, one graph per model
    plt.figure(figsize=(16, 5))
    graph_number = 1
    for name, model in models.items():
        plt.subplot(1, 3, graph_number)
        plt.scatter(y_test, model.predict(X_test), alpha=0.4, s=8)
        plt.plot([0, 500], [0, 500], color="red")
        plt.title(f"{name} (R2 = {results.loc[name, 'R2']:.3f})")
        plt.xlabel("Actual AQI")
        plt.ylabel("Predicted AQI")
        plt.grid(True)
        graph_number += 1
    plt.tight_layout()

    # Feature importance of the Random Forest
    plt.figure(figsize=(14, 7))
    plt.barh(FEATURES, models["Random Forest"].feature_importances_)
    plt.title("Feature Importance in AQI Prediction (Random Forest)")
    plt.show()


def aqi_category(aqi):
    if aqi <= 100:
        return "Good"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 400:
        return "Poor"
    return "Severe"


def print_sample_prediction(models, best_model_name):
    inputs = []
    for name, value in SAMPLE.items():
        inputs.append(f"{name} {value}")
    print("Input: " + ", ".join(inputs))

    sample = pd.DataFrame([SAMPLE])[FEATURES]
    print(f"\n{'Model':<18}{'AQI':>7}  Category")
    predicted_aqi = {}
    for name, model in models.items():
        aqi = model.predict(sample)[0]
        aqi = min(max(aqi, 0), 500)
        predicted_aqi[name] = aqi
        print(f"{name:<18}{aqi:>7.2f}  {aqi_category(aqi)}")

    best_aqi = predicted_aqi[best_model_name]
    category = aqi_category(best_aqi)
    print(f"\nBest Model      : {best_model_name} ({best_aqi:.2f})")
    print(f"Category        : {category}")
    print(f"Health Advisory : {ADVICE[category]}")


def main():
    print("1. Data Collection:\n")
    raw = pd.read_csv(RAW_CSV)
    print(raw.head())
    print(f"\nRaw dataset: {len(raw)} rows x {len(raw.columns)} columns")

    print("\n2. Data Cleaning and Feature Engineering:\n")
    cleaned = clean(raw)
    cleaned = add_time_features(cleaned)
    cleaned = cleaned[FEATURES + ["AQI"]]
    cleaned.to_csv(REFINED_CSV, index=False)
    print(cleaned.head())
    print(f"\nCleaned dataset: {len(cleaned)} rows x {len(cleaned.columns)} columns")

    print("\n3. Model Training and Evaluation:\n")
    X_train, X_test, y_train, y_test = split_data(cleaned)
    models, results = train_and_score(X_train, X_test, y_train, y_test)
    print(results.round(3))
    for name, filename in MODEL_FILES.items():
        joblib.dump(models[name], MODEL_DIR / filename)
    plot_results(X_test, y_test, models, results)

    print("\n4. Prediction on a Sample:\n")
    print_sample_prediction(models, results["R2"].idxmax())

    print(f"\nSaved: {REFINED_CSV.name}, {', '.join(MODEL_FILES.values())}")


if __name__ == "__main__":
    main()
