"""
Problem analysis routes
"""

from fastapi import APIRouter
from typing import Dict

from controllers import problem_controller

router = APIRouter(tags=["Problems"])


@router.post("/problems/analyze")
async def analyze_problems(pollutants: Dict):
    """Analyze pollution problems from pollutant levels"""
    return problem_controller.analyze_problems(pollutants)


@router.get("/solutions/scenarios")
async def get_solution_scenarios():
    """Get intervention scenarios and solutions"""
    return problem_controller.get_solutions()
