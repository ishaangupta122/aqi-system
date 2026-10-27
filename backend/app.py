"""FastAPI server for the AQI predictor"""

import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server import predict
from server.predict import PollutantLevels

# Sliders, month and day type options and the presets of the prediction form
FORM_CONFIG = json.loads(
    (Path(__file__).parent / "server" / "form_config.json").read_text(encoding="utf-8")
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    predict.load_models()
    yield


app = FastAPI(title="AQI Prediction API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/prediction/features")
def prediction_features():
    return FORM_CONFIG


@app.post("/predict")
def predict_aqi(levels: PollutantLevels):
    return predict.predict_aqi(levels)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000)
