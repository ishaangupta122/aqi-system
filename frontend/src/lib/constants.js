export const getAQICategory = (aqi) => {
  if (aqi <= 50) {
    return {
      category: "Good",
      color: "#10b981",
      bgColor: "bg-green-500",
      textColor: "text-green-500",
      emoji: "😊",
      description: "Air quality is satisfactory",
    };
  } else if (aqi <= 100) {
    return {
      category: "Satisfactory",
      color: "#fbbf24",
      bgColor: "bg-yellow-400",
      textColor: "text-yellow-400",
      emoji: "🙂",
      description: "Acceptable air quality",
    };
  } else if (aqi <= 200) {
    return {
      category: "Moderate",
      color: "#f472b6",
      bgColor: "bg-pink-400",
      textColor: "text-pink-400",
      emoji: "😐",
      description: "May cause breathing discomfort",
    };
  } else if (aqi <= 300) {
    return {
      category: "Poor",
      color: "#c026d3",
      bgColor: "bg-fuchsia-600",
      textColor: "text-fuchsia-600",
      emoji: "😷",
      description: "May cause respiratory issues",
    };
  } else if (aqi <= 400) {
    return {
      category: "Very Poor",
      color: "#ef4444",
      bgColor: "bg-red-500",
      textColor: "text-red-500",
      emoji: "😨",
      description: "May cause serious health effects",
    };
  } else {
    return {
      category: "Severe",
      color: "#991b1b",
      bgColor: "bg-red-900",
      textColor: "text-red-900",
      emoji: "☠️",
      description: "Health emergency - everyone affected",
    };
  }
};

export const pollutantUnits = {
  "PM2.5": "µg/m³",
  PM10: "µg/m³",
  NO: "µg/m³",
  NO2: "µg/m³",
  NOx: "ppb",
  NH3: "µg/m³",
  CO: "mg/m³",
  SO2: "µg/m³",
  O3: "µg/m³",
  Benzene: "µg/m³",
};

export const pollutantLimits = {
  "PM2.5": 60,
  PM10: 100,
  NO: 80,
  NO2: 80,
  NOx: 100,
  NH3: 400,
  CO: 2,
  SO2: 80,
  O3: 100,
  Benzene: 5,
};

export const presets = {
  "Clean Air": {
    "PM2.5": 12,
    PM10: 20,
    NO: 10,
    NO2: 15,
    NOx: 20,
    NH3: 10,
    CO: 0.5,
    SO2: 5,
    O3: 50,
    Benzene: 1,
  },
  Moderate: {
    "PM2.5": 60,
    PM10: 80,
    NO: 40,
    NO2: 50,
    NOx: 70,
    NH3: 50,
    CO: 2,
    SO2: 20,
    O3: 100,
    Benzene: 3,
  },
  Polluted: {
    "PM2.5": 150,
    PM10: 200,
    NO: 80,
    NO2: 100,
    NOx: 150,
    NH3: 100,
    CO: 5,
    SO2: 50,
    O3: 180,
    Benzene: 6,
  },
  Severe: {
    "PM2.5": 300,
    PM10: 400,
    NO: 150,
    NO2: 180,
    NOx: 250,
    NH3: 200,
    CO: 8,
    SO2: 70,
    O3: 250,
    Benzene: 10,
  },
};

export const clearPreset = {
  "PM2.5": 0,
  PM10: 0,
  NO: 0,
  NO2: 0,
  NOx: 0,
  NH3: 0,
  CO: 0,
  SO2: 0,
  O3: 0,
  Benzene: 0,
};

export const maxValues = {
  "PM2.5": 500,
  PM10: 600,
  NO: 200,
  NO2: 200,
  NOx: 300,
  NH3: 400,
  CO: 10,
  SO2: 100,
  O3: 300,
  Benzene: 20,
};

export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// City coordinates (sample data - you can expand this)
export const cityCoordinates = {
  Ahmedabad: [23.0225, 72.5714],
  Aizawl: [23.7307, 92.7173],
  Amaravati: [16.5419, 80.513],
  Amritsar: [31.634, 74.8723],
  Bengaluru: [12.9716, 77.5946],
  Bhopal: [23.2599, 77.4126],
  Brajrajnagar: [21.823, 83.9219],
  Chandigarh: [30.7333, 76.7794],
  Chennai: [13.0827, 80.2707],
  Coimbatore: [11.0168, 76.9558],
  Delhi: [28.6139, 77.209],
  Ernakulam: [9.9816, 76.2999],
  Gurugram: [28.4595, 77.0266],
  Guwahati: [26.1445, 91.7362],
  Hyderabad: [17.385, 78.4867],
  Jaipur: [26.9124, 75.7873],
  Jorapokhar: [23.687, 86.1489],
  Kochi: [9.9312, 76.2673],
  Kolkata: [22.5726, 88.3639],
  Lucknow: [26.8467, 80.9462],
  Mumbai: [19.076, 72.8777],
  Patna: [25.5941, 85.1376],
  Shillong: [25.5788, 91.8933],
  Talcher: [20.9519, 85.2315],
  Thiruvananthapuram: [8.5241, 76.9366],
  Visakhapatnam: [17.6869, 83.2185],
};
