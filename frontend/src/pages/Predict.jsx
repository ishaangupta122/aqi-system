import { useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  ChevronDown,
  Loader2,
  HeartPulse,
  Leaf,
  Thermometer,
  ShieldCheck,
} from "lucide-react";
import { api } from "../lib/api";
import { getAQICategory } from "../lib/constants";
import toast from "react-hot-toast";
import Header from "../components/Header";

export default function Predict() {
  const [features, setFeatures] = useState(null);
  const [pollutants, setPollutants] = useState({});
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [dayType, setDayType] = useState("weekday");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    loadFeatures();
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {features?.temporal.month.label}
            </label>
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none">
                {features?.temporal.month.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          {/* Day Type Selection */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {features?.presets.map((preset) => {
            const presetStyles = {
              Good: { bg: "#10b981", border: "#059669" },
              Satisfactory: { bg: "#fbbf24", border: "#d97706" },
              Moderate: { bg: "#f472b6", border: "#db2777" },
              Poor: { bg: "#c026d3", border: "#a21caf" },
              "Very Poor": { bg: "#f87171", border: "#ef4444" },
              Severe: { bg: "#ef4444", border: "#dc2626" },
            };
            const style = presetStyles[preset.category] || {
              bg: "#3b82f6",
              border: "#2563eb",
            };
            return (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset)}
                title={preset.description}
                style={{
                  background: `${style.bg}11`,
                  border: `1px solid ${style.border}`,
                  color: `${style.bg}`,
                }}
                className="px-4 py-3 rounded-lg font-medium transition-all duration-200 text-base hover:opacity-80">
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
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{aqiInfo.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-foreground leading-tight">
                Prediction Breakdown
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {aqiInfo.description}
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {/* Predicted AQI */}
            <div
              className="flex items-center gap-3 rounded-xl p-4 border border-border"
              style={{ borderLeft: `3px solid ${aqiInfo.color}` }}>
              <div
                className="flex-shrink-0 p-2.5 rounded-lg"
                style={{ background: `${aqiInfo.color}22` }}>
                <Activity
                  className="w-5 h-5"
                  style={{ color: aqiInfo.color }}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-0.5">
                  AQI
                </p>
                <p
                  className="text-2xl font-bold leading-none"
                  style={{ color: aqiInfo.color }}>
                  {prediction.aqi.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Category */}
            <div
              className="flex items-center gap-3 rounded-xl p-4 border border-border"
              style={{ borderLeft: `3px solid ${aqiInfo.color}` }}>
              <div
                className="flex-shrink-0 p-2.5 rounded-lg"
                style={{ background: `${aqiInfo.color}22` }}>
                <ShieldCheck
                  className="w-5 h-5"
                  style={{ color: aqiInfo.color }}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-0.5">
                  Category
                </p>
                <p
                  className="text-lg font-bold leading-none"
                  style={{ color: aqiInfo.color }}>
                  {prediction.category}
                </p>
              </div>
            </div>

            {/* Season */}
            <div
              className="flex items-center gap-3 rounded-xl p-4 border border-border"
              style={{ borderLeft: "3px solid #06b6d4" }}>
              <div
                className="flex-shrink-0 p-2.5 rounded-lg"
                style={{ background: "#06b6d422" }}>
                <Leaf className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-0.5">
                  Season
                </p>
                <p className="text-lg font-bold leading-none text-cyan-400">
                  {prediction.temporal_info?.season || "N/A"}
                </p>
              </div>
            </div>

            {/* Health Status */}
            {(() => {
              const isSafe =
                aqiInfo.category === "Good" ||
                aqiInfo.category === "Satisfactory";
              const isCaution = aqiInfo.category === "Moderate";
              const statusColor = isSafe
                ? "#10b981"
                : isCaution
                  ? "#f59e0b"
                  : "#ef4444";
              const statusLabel = isSafe
                ? "Safe"
                : isCaution
                  ? "Caution"
                  : "Unsafe";
              return (
                <div
                  className="flex items-center gap-3 rounded-xl p-4 border border-border"
                  style={{ borderLeft: `3px solid ${statusColor}` }}>
                  <div
                    className="flex-shrink-0 p-2.5 rounded-lg"
                    style={{ background: `${statusColor}22` }}>
                    <HeartPulse
                      className="w-5 h-5"
                      style={{ color: statusColor }}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-0.5">
                      Health
                    </p>
                    <p
                      className="text-lg font-bold leading-none"
                      style={{ color: statusColor }}>
                      {statusLabel}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Health Advisory */}
          <div
            className="rounded-xl p-5 border border-border"
            style={{
              borderLeft: `3px solid ${aqiInfo.color}`,
              background: `${aqiInfo.color}0d`,
            }}>
            <p
              className="text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: aqiInfo.color }}>
              <AlertCircle className="w-4 h-4" />
              Health Advisory
            </p>
            <p className="text-sm text-foreground/90 mb-3">
              {prediction.health_advisory.general}
            </p>
            <ul className="space-y-1.5">
              {prediction.health_advisory.actions.map((action, idx) => (
                <li
                  key={idx}
                  className="text-sm text-foreground/80 flex items-start gap-2">
                  <span
                    className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: aqiInfo.color }}
                  />
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
  const safePercent = Math.min(
    (pollutant.safe_limit / pollutant.max) * 100,
    100,
  );
  const warnPercent = Math.min(
    ((pollutant.safe_limit * 2) / pollutant.max) * 100,
    100,
  );
  const currentPercent = Math.min((value / pollutant.max) * 100, 100);

  // Three-zone colors
  const COLOR_SAFE = "#10b981"; // green
  const COLOR_WARN = "#f59e0b"; // amber
  const COLOR_DANGER = "#ef4444"; // red
  const COLOR_TRACK = "#374151"; // unfilled gray

  // Thumb & label color mirrors the zone the current value is in
  const thumbColor =
    value <= pollutant.safe_limit
      ? COLOR_SAFE
      : value <= pollutant.safe_limit * 2
        ? COLOR_WARN
        : COLOR_DANGER;

  // Build gradient stops: fill up to currentPercent with zone colors, rest gray
  let stops;
  if (currentPercent <= safePercent) {
    stops = [
      `${COLOR_SAFE} 0%`,
      `${COLOR_SAFE} ${currentPercent}%`,
      `${COLOR_TRACK} ${currentPercent}%`,
      `${COLOR_TRACK} 100%`,
    ];
  } else if (currentPercent <= warnPercent) {
    stops = [
      `${COLOR_SAFE} 0%`,
      `${COLOR_SAFE} ${safePercent}%`,
      `${COLOR_WARN} ${safePercent}%`,
      `${COLOR_WARN} ${currentPercent}%`,
      `${COLOR_TRACK} ${currentPercent}%`,
      `${COLOR_TRACK} 100%`,
    ];
  } else {
    stops = [
      `${COLOR_SAFE} 0%`,
      `${COLOR_SAFE} ${safePercent}%`,
      `${COLOR_WARN} ${safePercent}%`,
      `${COLOR_WARN} ${warnPercent}%`,
      `${COLOR_DANGER} ${warnPercent}%`,
      `${COLOR_DANGER} ${currentPercent}%`,
      `${COLOR_TRACK} ${currentPercent}%`,
      `${COLOR_TRACK} 100%`,
    ];
  }

  const gradient = `linear-gradient(to right, ${stops.join(", ")})`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {pollutant.name}
        </label>
        <span className="text-sm font-bold" style={{ color: thumbColor }}>
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
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: gradient,
          accentColor: thumbColor,
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
