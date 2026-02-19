# 🌍 Advanced AQI Monitoring System

An AI-powered **Air Quality Monitoring, Prediction, Analytics, and Problem-Solution Framework** built with Machine Learning and modern full-stack web technologies.

A comprehensive Environmental Intelligence Platform for real-time air quality monitoring, predictive analytics, pollution diagnostics, and environmental planning.

---

## 🧠 System Overview

This platform provides:

- 🔮 **AQI Prediction** - ML-based air quality forecasting from pollutant levels
- 📊 **City Monitoring** - Real-time dashboards tracking 26 Indian cities
- 📈 **Advanced Analytics** - Trends, correlations, seasonal patterns, and distributions
- 🗺️ **Interactive Map** - Visualize AQI across cities with geolocation
- 🚨 **Problem Analysis** - Identify pollution sources and health risks
- 🌱 **Solution Framework** - Environmental recommendations and policy insights
- 📜 **History Tracking** - Record and export prediction history
- ⚙️ **Dataset Insights** - Explore 14,598 historical records with statistics

---

## 🏗️ System Architecture

**Frontend (React + Vite)** ↔ **Backend API (FastAPI)** ↔ **ML Model (RandomForest)** ↔ **Data (CSV)**

| Layer           | Technology                             |
| --------------- | -------------------------------------- |
| Frontend        | React 19, Vite, TailwindCSS            |
| Backend         | FastAPI, Uvicorn                       |
| ML Model        | Scikit-learn (Random Forest Regressor) |
| Data Processing | Pandas, NumPy                          |
| Charts          | ECharts for React                      |
| Maps            | Leaflet, React-Leaflet                 |
| State           | Zustand                                |
| Storage         | CSV files, JSON history                |

---

## 📁 Project Structure

```text
aqi-system/
│
├── backend/
│   ├── app.py                  # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   │
│   ├── model/
│   │   ├── aqi_data.csv        # Original historical dataset
│   │   ├── refined_aqi_data.csv # Cleaned dataset (used for analytics)
│   │   ├── model.pkl           # Trained ML model
│   │   ├── features.pkl        # Feature names
│   │   └── model.py            # Model training script
│   │
│   ├── controllers/            # Business logic
│   │   ├── analytics_controller.py
│   │   ├── prediction_controller.py
│   │   └── problem_controller.py
│   │
│   ├── routes/                 # API endpoints
│   │   ├── analytics_routes.py
│   │   ├── prediction_routes.py
│   │   ├── problem_routes.py
│   │   └── history_routes.py
│   │
│   └── utils/                  # Helper utilities
│       ├── data_manager.py     # Data & model loading
│       ├── aqi_helpers.py      # AQI calculations & categories
│       ├── pollutant_info.py   # Pollutant metadata
│       └── schemas.py          # Pydantic models
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # React pages
│   │   │   ├── Home.jsx
│   │   │   ├── Predict.jsx
│   │   │   ├── Monitor.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── CityMap.jsx
│   │   │   ├── Problems.jsx
│   │   │   ├── Solutions.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Dataset.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── components/         # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── FeatureCard.jsx
│   │   │   └── FilterDropdown.jsx
│   │   │
│   │   ├── lib/                # Utilities
│   │   │   ├── api.js          # API client
│   │   │   ├── constants.js    # Constants & helpers
│   │   │   └── utils.js
│   │   │
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🤖 Machine Learning Model

### Algorithm

**Random Forest Regressor** - Ensemble learning method for robust AQI prediction

### Dataset Statistics

- **Records**: 14,598 cleaned historical readings
- **Cities**: 26 major Indian cities
- **Date Range**: 2015-2020
- **AQI Range**: 13 - 219 (Good to Poor categories)

### Input Features

**Pollutants** (7 features)

- PM2.5 - Fine particulate matter
- NO - Nitric oxide
- NO2 - Nitrogen dioxide
- NOx - Nitrogen oxides
- CO - Carbon monoxide
- SO2 - Sulfur dioxide
- O3 - Ozone

**Temporal Features** (6 features)

- Month (1-12)
- Is Weekend (0/1)
- Season (one-hot encoded): Winter, Summer, Monsoon, Post-Monsoon

**Total Features**: 13

### Model Performance

The model is trained with IQR outlier removal and achieves reliable predictions across the AQI spectrum from Good to Poor air quality levels.

---

## 🧪 Model Training Process

1. Load dataset (`aqi_data.csv`)
2. Remove rows with missing AQI values
3. Fill missing pollutant values using median imputation
4. Apply IQR (Interquartile Range) outlier removal
5. Extract temporal features: Month, Weekend flag, Season
6. One-hot encode seasonal features
7. Train-test split (80/20)
8. Train Random Forest Regressor
9. Evaluate: MAE, MSE, RMSE, R² score
10. Save model artifacts: `model.pkl`, `features.pkl`
11. Generate refined dataset: `refined_aqi_data.csv`

---

## 🧠 Backend Components

### Controllers (Business Logic)

| Controller               | Responsibilities                                      |
| ------------------------ | ----------------------------------------------------- |
| analytics_controller.py  | City stats, trends, correlations, seasonal analysis   |
| prediction_controller.py | AQI prediction, health advisories, feature importance |
| problem_controller.py    | Pollutant analysis, health risks, pollution diagnosis |

### Routes (API Endpoints)

| Route                | Endpoints                                        |
| -------------------- | ------------------------------------------------ |
| analytics_routes.py  | Cities list, city stats, analytics, dataset info |
| prediction_routes.py | Predict AQI, model info, feature importance      |
| problem_routes.py    | Analyze pollution, aggregated city/overall data  |
| history_routes.py    | Get, save, clear prediction history              |

### Utilities

| Utility           | Purpose                                      |
| ----------------- | -------------------------------------------- |
| data_manager.py   | Load model, dataset, manage prediction cache |
| aqi_helpers.py    | AQI category classification, colors, emojis  |
| pollutant_info.py | Pollutant metadata, sources, health impacts  |
| schemas.py        | Pydantic models for request/response         |

---

## 🌐 Frontend Pages

| Page      | Route        | Description                                          |
| --------- | ------------ | ---------------------------------------------------- |
| Home      | `/`          | Overview with system stats and AQI categories        |
| Predict   | `/predict`   | Input pollutants → Real-time AQI prediction          |
| Monitor   | `/monitor`   | City-wise AQI trends and pollutant charts            |
| Analytics | `/analytics` | AQI trends, frequency distribution, city comparisons |
| City Map  | `/map`       | Interactive map showing AQI across 26 cities         |
| Problems  | `/problems`  | Pollution source analysis and health risk assessment |
| Solutions | `/solutions` | Environmental recommendations and policy insights    |
| History   | `/history`   | Past predictions with export functionality           |
| Dataset   | `/dataset`   | Explore historical data with statistics              |
| Settings  | `/settings`  | Model performance metrics and system info            |

---

## 🔌 Key API Endpoints

### Prediction APIs

| Endpoint              | Method | Purpose                        |
| --------------------- | ------ | ------------------------------ |
| `/predict`            | POST   | Predict AQI from pollutants    |
| `/model-info`         | GET    | Get model details & metrics    |
| `/feature-importance` | GET    | Get feature importance ranking |

### Analytics APIs

| Endpoint                  | Method | Purpose                    |
| ------------------------- | ------ | -------------------------- |
| `/cities`                 | GET    | List all cities            |
| `/city-stats/{city}`      | GET    | Get city statistics        |
| `/city-timeseries/{city}` | GET    | Get city AQI time series   |
| `/city-aggregated/{city}` | GET    | Get aggregated city data   |
| `/city-monitor/{city}`    | GET    | Get city monitoring data   |
| `/analytics-overview`     | GET    | Overall analytics summary  |
| `/city-comparison`        | GET    | Compare cities by AQI      |
| `/seasonal-data`          | GET    | Seasonal patterns          |
| `/aqi-trend`              | GET    | AQI trends over time       |
| `/aqi-frequency`          | GET    | AQI distribution histogram |
| `/dataset-info`           | GET    | Dataset statistics & info  |

### Problem Analysis APIs

| Endpoint                    | Method | Purpose                  |
| --------------------------- | ------ | ------------------------ |
| `/analyze-pollution`        | POST   | Analyze pollution issues |
| `/city-aggregated-problems` | GET    | City pollution analysis  |
| `/overall-aggregated-data`  | GET    | Overall pollution data   |

### History APIs

| Endpoint         | Method | Purpose                |
| ---------------- | ------ | ---------------------- |
| `/history`       | GET    | Get prediction history |
| `/history`       | POST   | Save prediction        |
| `/history/clear` | DELETE | Clear history          |

---

## 🚀 How to Run the Application

### Prerequisites

Before running the application, ensure you have:

- **Python 3.8+** installed (for backend)
- **Node.js 16+** and **npm** installed (for frontend)
- **Git** (to clone the repository)

### Quick Start

#### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd aqi-system
```

#### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The backend will be running at: `http://localhost:8000`

**API Documentation** (Swagger UI): `http://localhost:8000/docs`

#### 3️⃣ Frontend Setup

Open a **new terminal** and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at: `http://localhost:5173`

### Access the Application

Open your browser and navigate to:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📋 Available Scripts

### Backend

```bash
# Start server with auto-reload (development)
uvicorn app:app --reload

# Start server on specific host/port
uvicorn app:app --host 0.0.0.0 --port 8000

# Run model training script
cd model
python model.py
```

### Frontend

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🔧 Configuration

### Backend Configuration

- **Port**: Default is `8000`, can be changed in uvicorn command
- **CORS**: Currently allows all origins (`*`), modify in `app.py` for production
- **Data Files**: Located in `backend/model/` directory

### Frontend Configuration

- **API Base URL**: Configured in `src/lib/api.js`
- **Port**: Default is `5173` (Vite default)
- **Environment Variables**: Can be set in `.env` file

---

## 📊 Dataset Information

The system uses two datasets:

1. **aqi_data.csv** - Original dataset with 29,531 records
2. **refined_aqi_data.csv** - Cleaned dataset with 14,598 records (used for analytics and predictions)

**Dataset Features:**

- 26 Indian cities
- 2015-2020 timeframe
- 7 pollutants (PM2.5, NO, NO2, NOx, CO, SO2, O3)
- Temporal features (date, season, weekend)
- AQI values ranging from 13 (Good) to 219 (Poor)

---

## 🎯 Key Features

### ✨ Prediction & Forecasting

- Real-time AQI prediction from pollutant inputs
- Health advisory based on AQI levels
- Early warning system for poor air quality
- Feature importance analysis

### 📊 Analytics & Insights

- Multi-year AQI trend analysis
- Seasonal pattern detection
- City-wise comparison charts
- AQI frequency distribution
- Pollutant correlation analysis

### 🗺️ Visualization

- Interactive city map with real-time AQI
- Time-series charts for trends
- Comparative bar charts
- Distribution histograms
- Color-coded AQI categories

### 🔍 Problem Diagnosis

- Pollutant source identification
- Health impact assessment
- Risk level categorization
- City and overall pollution analysis

### 💡 Solutions & Planning

- Environmental recommendations
- Pollutant-specific solutions
- Health protection measures
- Policy insights

### 📈 Data Management

- Historical data exploration
- Prediction history tracking
- Export functionality
- Dataset statistics viewer
- Model performance metrics

---

## 🎨 User Interface

Built with modern design principles:

- **Dark Mode**: Easy on the eyes
- **Responsive Design**: Works on all devices
- **Interactive Charts**: Powered by ECharts
- **Real-time Updates**: Smooth animations with Framer Motion
- **Toast Notifications**: User-friendly feedback
- **Loading States**: Clear progress indicators

---

## 🏆 System Capabilities

✅ Machine Learning-based AQI prediction  
✅ Multi-city air quality monitoring (26 cities)  
✅ Historical data analytics (14,598+ records)  
✅ Interactive geospatial visualization  
✅ Health advisory system  
✅ Pollution source diagnosis  
✅ Environmental solution framework  
✅ Prediction history tracking & export  
✅ Real-time data processing  
✅ RESTful API architecture  
✅ Comprehensive API documentation  
✅ Modern, responsive UI/UX

---

## 📌 Technology Stack

### Backend

- **Framework**: FastAPI (async Python web framework)
- **ML Library**: Scikit-learn (Random Forest)
- **Data Processing**: Pandas, NumPy
- **Validation**: Pydantic
- **Server**: Uvicorn (ASGI server)

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Charts**: ECharts for React
- **Maps**: Leaflet, React-Leaflet
- **Routing**: React Router DOM
- **State**: Zustand
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## 📖 Project Category

**AI-Powered Environmental Intelligence & Decision Support Platform**

A comprehensive air quality monitoring system combining machine learning, real-time analytics, and interactive visualization for environmental awareness and decision-making.

---

## 👨‍💻 Development

### Project Structure Philosophy

- **Separation of Concerns**: Controllers handle business logic, routes handle HTTP
- **Modular Design**: Reusable components and utilities
- **Type Safety**: Pydantic models for validation
- **Clean Code**: Following best practices

### Future Enhancements

- Real-time data integration with government APIs
- Mobile application
- User authentication and personalized dashboards
- Advanced ML models (LSTM, Prophet)
- Alert notification system
- More cities and international coverage

---

## 📄 License

This project is for educational and research purposes.

---

## 🙏 Acknowledgments

Dataset sourced from Indian government air quality monitoring stations (2015-2020).

Built with modern technologies to demonstrate full-stack ML application development.

---

**Made with ❤️ for cleaner air and better environmental awareness**
