import { useState, useEffect } from "react";
import { Activity, AlertCircle, ChevronDown, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { getAQICategory } from "../lib/constants";
import toast from "react-hot-toast";
import Header from "../components/Header";

export default function Predict() {
  const [features, setFeatures] = useState(null);
  const [pollutants, setPollutants] = useState({});
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [dayType, setDayType] = useState("weekday");
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    loadFeatures();
    loadCities();
  }, []);

  const loadFeatures = async () => {
    try {
      const response = await api.getPredictionFeatures();
      const featuresData = response.data;
      setFeatures(featuresData);

      // Initialize pollutants with default values
      const defaultPollutants = {};
      featuresData.pollutants.forEach((p) => {
        defaultPollutants[p.key] = p.default;
      });
      setPollutants(defaultPollutants);
    } catch (error) {
      toast.error("Failed to load features");
      console.error(error);
    } finally {
      setLoadingFeatures(false);
    }
  };

  const loadCities = async () => {
    try {
      const response = await api.getCities();
      setCities(response.data.cities);
      if (response.data.cities.length > 0) {
        setSelectedCity(response.data.cities[0]);
      }
    } catch (error) {
      toast.error("Failed to load cities");
    }
  };

  const handlePreset = (preset) => {
    const newPollutants = {};
    features.pollutants.forEach((p) => {
      newPollutants[p.key] = preset.values[p.key];
    });
    setPollutants(newPollutants);
    setMonth(preset.values.month);
    setDayType(preset.values.day_type);
    toast.success(`Applied ${preset.name} preset`);
  };

  const handleSliderChange = (pollutant, value) => {
    setPollutants((prev) => ({ ...prev, [pollutant]: parseFloat(value) }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await api.predict({
        ...pollutants,
        month: month,
        day_type: dayType,
        city: selectedCity,
      });
      setPrediction(response.data);
      toast.success("AQI predicted successfully!");
    } catch (error) {
      toast.error("Failed to predict AQI");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    const clearedPollutants = {};
    features.pollutants.forEach((p) => {
      clearedPollutants[p.key] = 0;
    });
    setPollutants(clearedPollutants);
    toast.success("Cleared all values");
  };

  if (loadingFeatures) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading prediction features...
          </p>
        </div>
      </div>
    );
  }

  const aqiInfo = prediction ? getAQICategory(prediction.aqi) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Header
        title="Real-Time AQI Prediction"
        description="Input pollutant levels and get instant air quality predictions"
      />

      {/* Location & Temporal Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City Selection */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Select City
            </label>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none">
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          {/* Month Selection */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              {features?.temporal.month.label}
            </label>
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none">
                {features?.temporal.month.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.season})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          {/* Day Type Selection */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              {features?.temporal.day_type.label}
            </label>
            <div className="relative">
              <select
                value={dayType}
                onChange={(e) => setDayType(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none">
                {features?.temporal.day_type.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-medium text-foreground mb-4">
          Quick Presets
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {features?.presets.map((preset) => {
            const presetColors = {
              Good: "bg-green-700 hover:bg-green-800 border-green-600",
              Moderate: "bg-amber-700 hover:bg-amber-800 border-amber-600",
              Poor: "bg-orange-700 hover:bg-orange-800 border-orange-600",
              "Very Poor": "bg-red-700 hover:bg-red-800 border-red-600",
              Severe: "bg-red-900 hover:bg-red-950 border-red-800",
            };
            return (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset)}
                className={`px-4 py-3 text-white rounded-lg font-medium transition-all duration-200 border ${presetColors[preset.category] || "bg-blue-700 hover:bg-blue-800 border-blue-600"}`}
                title={preset.description}>
                {preset.name}
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <button
            onClick={handleClearAll}
            className="w-full px-4 py-3 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium transition-all duration-200 border border-red-600">
            Clear All
          </button>
        </div>
      </div>

      {/* Pollutant Sliders */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-medium text-foreground mb-4">
          Pollutant Levels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features?.pollutants.map((pollutant) => (
            <PollutantSlider
              key={pollutant.key}
              pollutant={pollutant}
              value={pollutants[pollutant.key] || 0}
              onChange={handleSliderChange}
            />
          ))}
        </div>
      </div>

      {/* Predict Button */}
      <button
        onClick={handlePredict}
        disabled={loading}
        className="w-full bg-primary hover:bg-accent text-primary-foreground font-medium py-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        <Activity className="w-5 h-5" />
        {loading ? "Predicting..." : "PREDICT AQI"}
      </button>

      {/* Prediction Result */}
      {prediction && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Prediction Breakdown
          </h2>

          {/* Prediction Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Predicted AQI */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-2 border-slate-700/50 rounded-lg p-6">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                PREDICTED
              </p>
              <p className={`text-3xl font-bold ${aqiInfo.textColor}`}>
                {prediction.aqi.toFixed(1)}
              </p>
            </div>

            {/* Category */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-2 border-slate-700/50 rounded-lg p-6">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                CATEGORY
              </p>
              <p className={`text-3xl font-bold ${aqiInfo.textColor}`}>
                {prediction.category}
              </p>
            </div>

            {/* Season */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-2 border-slate-700/50 rounded-lg p-6">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                SEASON
              </p>
              <p className="text-3xl font-bold text-cyan-400">
                {prediction.temporal_info?.season || "N/A"}
              </p>
            </div>

            {/* Health Status */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-2 border-slate-700/50 rounded-lg p-6">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                HEALTH STATUS
              </p>
              <p
                className={`text-2xl font-bold ${
                  aqiInfo.category === "Good" ||
                  aqiInfo.category === "Satisfactory"
                    ? "text-green-500"
                    : "text-red-500"
                }`}>
                {aqiInfo.category === "Good" ||
                aqiInfo.category === "Satisfactory"
                  ? "Safe"
                  : "Unsafe"}
              </p>
            </div>
          </div>

          {/* Health Advisory */}
          <div
            className={`rounded-lg p-4 ${aqiInfo.bgColor} bg-opacity-20 border border-current`}>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Health Advisory
            </p>
            <p className="text-foreground mb-3">
              {prediction.health_advisory.general}
            </p>
            <ul className="space-y-1">
              {prediction.health_advisory.actions.map((action, idx) => (
                <li
                  key={idx}
                  className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function PollutantSlider({ pollutant, value, onChange }) {
  const percentage = (value / pollutant.max) * 100;
  const isSafe = value <= pollutant.safe_limit;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {pollutant.name}
        </label>
        <span
          className={`text-sm font-bold ${isSafe ? "text-green-500" : "text-orange-500"}`}>
          {value.toFixed(1)} {pollutant.unit}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mb-1">
        {pollutant.description}
      </div>
      <input
        type="range"
        min={pollutant.min}
        max={pollutant.max}
        step={pollutant.step}
        value={value}
        onChange={(e) => onChange(pollutant.key, e.target.value)}
        className="w-full h-2 bg-secondary/50 rounded-lg appearance-none cursor-pointer accent-primary"
        style={{
          background: `linear-gradient(to right, ${isSafe ? "#10b981" : "#f59e0b"} ${percentage}%, hsl(var(--secondary)) ${percentage}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{pollutant.min}</span>
        <span className="text-xs">
          Safe limit: {pollutant.safe_limit} {pollutant.unit}
        </span>
        <span>{pollutant.max}</span>
      </div>
    </div>
  );
}
