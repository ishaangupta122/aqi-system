"""
Problem analysis controller"""

from fastapi import HTTPException

from utils.pollutant_info import POLLUTANT_LIMITS, get_pollutant_info, get_solution_scenarios


def identify_problem_pollutants(pollutants: dict) -> list:
    """Identify which pollutants are causing problems"""
    problems = []
    for pollutant, value in pollutants.items():
        if value is None:
            continue
        if pollutant in POLLUTANT_LIMITS and value > POLLUTANT_LIMITS[pollutant]:
            excess = ((value - POLLUTANT_LIMITS[pollutant]) / POLLUTANT_LIMITS[pollutant]) * 100
            severity = "CRITICAL" if excess > 100 else "HIGH" if excess > 50 else "MODERATE"
            problems.append({
                'pollutant': pollutant,
                'value': value,
                'limit': POLLUTANT_LIMITS[pollutant],
                'excess': excess,
                'severity': severity
            })
    
    return sorted(problems, key=lambda x: x['excess'], reverse=True)


def analyze_problems(pollutants: dict) -> dict:
    """Analyze pollution problems from pollutant levels"""
    try:
        # Use only refined model pollutants
        pollutant_dict = {
            'PM2_5': pollutants.get('PM2_5'),
            'NO': pollutants.get('NO'),
            'NO2': pollutants.get('NO2'),
            'NOx': pollutants.get('NOx'),
            'CO': pollutants.get('CO'),
            'SO2': pollutants.get('SO2'),
            'O3': pollutants.get('O3')
        }
        
        # Filter out None values
        pollutant_dict = {k: v for k, v in pollutant_dict.items() if v is not None}
        
        problems = identify_problem_pollutants(pollutant_dict)
        
        # Add detailed information for each problem
        detailed_problems = []
        for problem in problems:
            info = get_pollutant_info(problem['pollutant'])
            detailed_problems.append({
                **problem,
                'sources': info['sources'],
                'health_effects': info['health_effects'],
                'solutions': info['solutions']
            })
        
        return {
            'problem_count': len(detailed_problems),
            'problems': detailed_problems,
            'has_critical': any(p['severity'] == 'CRITICAL' for p in detailed_problems)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


def get_solutions() -> dict:
    """Get intervention scenarios and solutions"""
    return get_solution_scenarios()
