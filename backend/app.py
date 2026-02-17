"""
FastAPI Backend for AQI Monitoring & Prediction System
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from routes import prediction_routes, analytics_routes, problem_routes, history_routes
from utils.data_manager import data_manager

app = FastAPI(
    title="AQI Monitoring System API",
    description="API for air quality monitoring and prediction",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prediction_routes.router)
app.include_router(analytics_routes.router)
app.include_router(problem_routes.router)
app.include_router(history_routes.router)


@app.on_event("startup")
async def startup_event():
    """Initialize model and data on startup"""
    print("\n" + "="*50)
    print("Starting AQI Monitoring System API")
    print("="*50)
    
    model_loaded = data_manager.load_model()
    data_loaded = data_manager.load_data()
    
    if model_loaded and data_loaded:
        print("System initialized successfully")
    else:
        print("System started with warnings")
    print("="*50 + "\n")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AQI Monitoring System API",
        "version": "1.0.0",
        "status": "active",
        "model_loaded": data_manager.model_info is not None,
        "data_loaded": data_manager.df is not None,
        "docs_url": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": data_manager.model_info is not None,
        "data_loaded": data_manager.df is not None,
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
