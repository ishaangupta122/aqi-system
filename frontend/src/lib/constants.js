export const AQI_MAX = 500;

// AQI categories from clean to severe; `max` is the highest AQI of a category.
// `health` is the status shown with a result and `advice` what to do.
export const categories = [
  {
    name: "Good",
    max: 100,
    color: "#4DBE8A",
    description: "Air quality is satisfactory",
    health: { label: "Safe", color: "#4DBE8A" },
    advice: [
      "All outdoor activities are safe",
      "Great time for exercise and recreation",
      "Windows can be kept open for ventilation",
    ],
  },
  {
    name: "Moderate",
    max: 200,
    color: "#E9B44C",
    description: "May cause breathing discomfort",
    health: { label: "Caution", color: "#E9B44C" },
    advice: [
      "Sensitive people reduce prolonged outdoor exertion",
      "Watch for symptoms like coughing or shortness of breath",
      "Consider wearing masks in highly polluted areas",
    ],
  },
  {
    name: "Poor",
    max: 400,
    color: "#E05A55",
    description: "May cause respiratory issues",
    health: { label: "Unsafe", color: "#E05A55" },
    advice: [
      "Avoid prolonged outdoor activities",
      "Sensitive groups stay indoors",
      "Wear N95 masks if you must go outside",
    ],
  },
  {
    name: "Severe",
    max: AQI_MAX,
    color: "#BF4F95",
    description: "Health emergency - everyone affected",
    health: { label: "Unsafe", color: "#E05A55" },
    advice: [
      "Don't go outside unless absolutely necessary",
      "All outdoor activities must be cancelled",
      "Create a clean air room at home",
    ],
  },
];

export const categoryByName = {};
for (const category of categories) {
  categoryByName[category.name] = category;
}

export function getCategory(aqi) {
  for (const category of categories) {
    if (aqi <= category.max) return category;
  }
  return categories[categories.length - 1];
}

export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
].map((label, index) => ({ value: index + 1, label }));

export const dayTypes = [
  { value: "weekday", label: "Weekday" },
  { value: "weekend", label: "Weekend" },
];

// Sliders of the prediction form: the range, the starting value and the limit up to which a level is safe
export const pollutants = [
  { name: "PM2.5", unit: "μg/m³", min: 0, max: 500, step: 0.1, default: 50, safeLimit: 60 },
  { name: "NO", unit: "μg/m³", min: 0, max: 300, step: 0.1, default: 20, safeLimit: 80 },
  { name: "NO2", unit: "μg/m³", min: 0, max: 300, step: 0.1, default: 40, safeLimit: 80 },
  { name: "NOx", unit: "ppb", min: 0, max: 400, step: 0.1, default: 60, safeLimit: 100 },
  { name: "CO", unit: "mg/m³", min: 0, max: 50, step: 0.01, default: 2, safeLimit: 2 },
  { name: "SO2", unit: "μg/m³", min: 0, max: 300, step: 0.1, default: 50, safeLimit: 80 },
  { name: "O3", unit: "μg/m³", min: 0, max: 300, step: 0.1, default: 50, safeLimit: 100 },
];

// One preset for each category (the name is the category it should give)
export const presets = [
  { name: "Good", values: { "PM2.5": 8, "NO": 4, "NO2": 8, "NOx": 12, "CO": 0.2, "SO2": 8, "O3": 15, month: 8, day_type: "weekend" } },
  { name: "Moderate", values: { "PM2.5": 55, "NO": 25, "NO2": 45, "NOx": 75, "CO": 1.5, "SO2": 45, "O3": 55, month: 3, day_type: "weekday" } },
  { name: "Poor", values: { "PM2.5": 130, "NO": 18, "NO2": 22, "NOx": 39, "CO": 1.4, "SO2": 8, "O3": 49, month: 1, day_type: "weekday" } },
  { name: "Severe", values: { "PM2.5": 350, "NO": 150, "NO2": 180, "NOx": 280, "CO": 10, "SO2": 200, "O3": 200, month: 1, day_type: "weekday" } },
];
