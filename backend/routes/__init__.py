"""
Initialize routes package
"""

from . import prediction_routes
from . import analytics_routes
from . import problem_routes
from . import history_routes

__all__ = ['prediction_routes', 'analytics_routes', 'problem_routes', 'history_routes']
