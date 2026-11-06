import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const api = {
  getModelComparison: () => apiClient.get("/model/comparison"),
  predict: (pollutantData) => apiClient.post("/predict", pollutantData),
};
