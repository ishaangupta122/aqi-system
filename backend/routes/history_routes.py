"""
History routes
"""

from fastapi import APIRouter
from typing import Optional

from controllers import analytics_controller

router = APIRouter(tags=["History"])


@router.get("/history")
async def get_prediction_history(limit: Optional[int] = 50):
    """Get prediction history"""
    return analytics_controller.get_prediction_history(limit)


@router.delete("/history")
async def clear_history():
    """Clear prediction history"""
    return analytics_controller.clear_history()


@router.get("/model/info")
async def get_model_info():
    """Get model information and metrics"""
    return analytics_controller.get_model_info()
