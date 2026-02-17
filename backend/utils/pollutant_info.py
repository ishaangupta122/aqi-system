"""
Pollutant limits and information
"""

# Pollutant safe limits
POLLUTANT_LIMITS = {
    'PM2_5': 60,
    'PM10': 100,
    'NO': 80,
    'NO2': 80,
    'NOx': 100,
    'NH3': 400,
    'CO': 2,
    'SO2': 80,
    'O3': 100,
    'Benzene': 5
}


def get_pollutant_info(pollutant: str) -> dict:
    """Get sources, health effects, and solutions for specific pollutants"""
    info = {
        'PM2_5': {
            'sources': [
                'Vehicle emissions (especially diesel)',
                'Construction dust and road dust',
                'Industrial combustion',
                'Biomass burning',
                'Power plants'
            ],
            'health_effects': [
                'Penetrates deep into lungs',
                'Cardiovascular problems',
                'Respiratory diseases',
                'Reduced lung function',
                'Premature death'
            ],
            'solutions': [
                'Transition to electric vehicles',
                'Implement BS-VI emission standards',
                'Water spraying on roads',
                'Ban stubble burning',
                'Use of cleaner fuels in industries'
            ]
        },
        'PM10': {
            'sources': [
                'Dust from roads and construction',
                'Industrial emissions',
                'Agricultural activities',
                'Natural dust',
                'Vehicle emissions'
            ],
            'health_effects': [
                'Respiratory irritation',
                'Aggravated asthma',
                'Decreased lung function',
                'Irregular heartbeat'
            ],
            'solutions': [
                'Road paving and maintenance',
                'Green belt development',
                'Water spraying',
                'Control construction activities',
                'Vehicle emission controls'
            ]
        },
        'NO2': {
            'sources': [
                'Vehicle emissions',
                'Power plants',
                'Industrial boilers',
                'Diesel generators',
                'Gas stoves'
            ],
            'health_effects': [
                'Airway inflammation',
                'Reduced immunity to lung infections',
                'Asthma exacerbation',
                'Increased allergen response'
            ],
            'solutions': [
                'Stricter vehicle emission norms',
                'Shift to CNG/electric vehicles',
                'Catalytic converters mandatory',
                'Reduce diesel vehicle usage',
                'Improve industrial emission controls'
            ]
        },
        'SO2': {
            'sources': [
                'Coal-based power plants',
                'Petroleum refineries',
                'Metal smelting',
                'Diesel fuel combustion',
                'Industrial processes'
            ],
            'health_effects': [
                'Respiratory problems',
                'Aggravates heart disease',
                'Contributes to acid rain',
                'Damages crops and vegetation'
            ],
            'solutions': [
                'Switch to renewable energy',
                'Flue gas desulfurization',
                'Use low-sulfur fuels',
                'Scrubbers in industries',
                'Relocate polluting industries'
            ]
        },
        'O3': {
            'sources': [
                'Formed from NOx and VOCs in sunlight',
                'Vehicle emissions (precursors)',
                'Industrial emissions',
                'Chemical solvents',
                'Not directly emitted'
            ],
            'health_effects': [
                'Lung tissue damage',
                'Chest pain and coughing',
                'Throat irritation',
                'Worsens asthma and emphysema'
            ],
            'solutions': [
                'Reduce NOx emissions',
                'Control VOC emissions',
                'Limit vehicle usage during peak sun hours',
                'Use low-VOC paints and solvents',
                'Increase green cover'
            ]
        },
        'CO': {
            'sources': [
                'Incomplete combustion of fuels',
                'Vehicle emissions',
                'Biomass burning',
                'Industrial processes',
                'Cigarette smoke'
            ],
            'health_effects': [
                'Reduces oxygen delivery to organs',
                'Headaches and dizziness',
                'Chest pain in heart disease patients',
                'Fatal at high concentrations'
            ],
            'solutions': [
                'Regular vehicle maintenance',
                'Catalytic converters',
                'Improved combustion efficiency',
                'Ventilation in indoor spaces',
                'Switch to cleaner cooking fuels'
            ]
        },
    }
    
    return info.get(pollutant, {
        'sources': ['Various sources'],
        'health_effects': ['May cause health issues'],
        'solutions': ['Reduce emissions']
    })


def get_solution_scenarios() -> dict:
    """Get intervention scenarios and solutions"""
    return {
        "moderate": {
            "timeline": "6-12 months",
            "reduction": "15-25 AQI points",
            "cost": "₹500-1000 Crores",
            "feasibility": "HIGH",
            "actions": [
                "Implement odd-even vehicle rationing during peak pollution",
                "Increase public transport frequency by 30%",
                "Ban construction activities during high pollution days",
                "Mandatory pollution control devices for industries",
                "Increase green cover by 15% in urban areas",
                "Mechanical road sweeping instead of manual",
                "Water spraying on major roads"
            ]
        },
        "aggressive": {
            "timeline": "12-24 months",
            "reduction": "40-60 AQI points",
            "cost": "₹2000-5000 Crores",
            "feasibility": "MEDIUM",
            "actions": [
                "Transition 50% public transport to electric vehicles",
                "Implement congestion pricing in city centers",
                "Strict enforcement of BS-VI emission standards",
                "Relocate polluting industries outside city limits",
                "Mandatory solar panels on commercial buildings",
                "Create 10 large urban forests (100+ acres each)",
                "Ban all diesel vehicles in core city areas",
                "Real-time emission monitoring for all industries",
                "Develop dedicated bicycle lanes citywide"
            ]
        },
        "transformative": {
            "timeline": "24-48 months",
            "reduction": "80-120 AQI points",
            "cost": "₹10,000-20,000 Crores",
            "feasibility": "CHALLENGING",
            "actions": [
                "Complete transition to electric public transport",
                "Ban all private diesel vehicles citywide",
                "Implement smart traffic management with AI",
                "Convert all power generation to renewable sources",
                "Create extensive metro/rapid transit network",
                "Mandatory green building standards for all construction",
                "Establish 50+ air purification towers",
                "Zero-waste policy for all industries",
                "40% increase in urban green cover",
                "Community-wide composting programs",
                "Rainwater harvesting mandatory in all buildings"
            ]
        }
    }
