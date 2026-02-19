import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  // Health check
  healthCheck: () => apiClient.get("/health"),

  // Prediction
  getPredictionFeatures: () => apiClient.get("/prediction/features"),
  predict: (pollutantData) => apiClient.post("/predict", pollutantData),

  // Cities
  getCities: () => apiClient.get("/cities"),
  getCityStats: (cityName) => apiClient.get(`/city/${cityName}`),
  getCityTimeseries: (cityName, limit = 100) =>
    apiClient.get(`/city/${cityName}/timeseries?limit=${limit}`),
  getCityMonitorData: (cityName, year = null) => {
    const params = year ? `?year=${year}` : "";
    return apiClient.get(`/city/${cityName}/monitor${params}`);
  },
  getCityAggregatedData: (
    cityName,
    filterType = "latest",
    year = null,
    month = null,
    season = null,
  ) => {
    const params = new URLSearchParams();
    params.append("filter_type", filterType);
    if (year) params.append("year", year);
    if (month) params.append("month", month);
    if (season) params.append("season", season);
    return apiClient.get(`/city/${cityName}/aggregated?${params.toString()}`);
  },
  getOverallAggregatedData: (
    filterType = "all_time",
    year = null,
    season = null,
  ) => {
    const params = new URLSearchParams();
    params.append("filter_type", filterType);
    if (year) params.append("year", year);
    if (season) params.append("season", season);
    return apiClient.get(`/overall/aggregated?${params.toString()}`);
  },

  // Analytics
  getAnalyticsOverview: () => apiClient.get("/analytics/overview"),
  getAQITrend: (year) => {
    const params = year ? `?year=${year}` : "";
    return apiClient.get(`/analytics/trend${params}`);
  },
  getAQIFrequency: (year, binSize = 50) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    params.append("bin_size", binSize);
    return apiClient.get(`/analytics/frequency?${params.toString()}`);
  },
  getCityComparison: (year, limit = 20) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    params.append("limit", limit);
    return apiClient.get(`/analytics/city-comparison?${params.toString()}`);
  },
  getSeasonalData: (year) => {
    const params = year ? `?year=${year}` : "";
    return apiClient.get(`/analytics/seasonal${params}`);
  },
  getCorrelationData: () => apiClient.get("/analytics/correlation"),
  // Problems
  analyzeProblems: (pollutantData) =>
    apiClient.post("/problems/analyze", pollutantData),

  // Solutions
  getSolutionScenarios: () => apiClient.get("/solutions/scenarios"),

  // History
  getHistory: (limit = 50) => apiClient.get(`/history?limit=${limit}`),
  clearHistory: () => apiClient.delete("/history"),

  // Model
  getModelInfo: () => apiClient.get("/model/info"),
  getFeatureImportance: () => apiClient.get("/feature-importance"),

  // Dataset
  getDatasetInfo: () => apiClient.get("/dataset/info"),
};

export default api;
