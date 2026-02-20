import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { getAQICategory } from "../lib/constants";
import toast from "react-hot-toast";
import {
  Download,
  Trash2,
  Clock,
  Filter,
  BarChart4,
  ArrowUp,
  ArrowDown,
  Activity,
  FlaskConical,
} from "lucide-react";
import Header from "../components/Header";
import FilterDropdown from "../components/FilterDropdown";

// Helper function to format pollutant names
const formatPollutantName = (name) => {
  return name.replace(/_/g, ".").toUpperCase();
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.getHistory();
      setHistory(response.data.predictions || []);
    } catch (error) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear all prediction history?")) {
      return;
    }

    try {
      await api.clearHistory();
      setHistory([]);
      toast.success("History cleared successfully");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aqi-history-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("History exported successfully");
  };

  const filteredHistory = history.filter((item) => {
    if (filter === "all") return true;
    const aqiInfo = getAQICategory(item.aqi);
    return aqiInfo.category.toLowerCase() === filter.toLowerCase();
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else if (sortBy === "oldest") {
      return new Date(a.timestamp) - new Date(b.timestamp);
    } else if (sortBy === "highest") {
      return b.aqi - a.aqi;
    } else {
      return a.aqi - b.aqi;
    }
  });

  const stats = {
    total: history.length,
    avgAQI:
      history.length > 0
        ? (history.reduce((sum, h) => sum + h.aqi, 0) / history.length).toFixed(
            1,
          )
        : 0,
    highest:
      history.length > 0
        ? Math.max(...history.map((h) => h.aqi)).toFixed(1)
        : 0,
    lowest:
      history.length > 0
        ? Math.min(...history.map((h) => h.aqi)).toFixed(1)
        : 0,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Header
          title="Prediction History"
          description="View and manage your prediction history"
        />

        <div className="flex gap-2 font-medium">
          <button
            onClick={handleExport}
            disabled={history.length === 0}
            className="px-4 py-2 bg-blue-600 border border-border rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-2 text-white">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleClearHistory}
            disabled={history.length === 0}
            className="px-4 py-2 bg-red-700 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-lg h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading history...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                icon: <BarChart4 className="w-7 h-7" />,
                label: "TOTAL PREDICTIONS",
                value: stats.total || "0",
                color: "#10b981",
                category: null,
              },
              {
                icon: <Activity className="w-7 h-7" />,
                label: "AVERAGE AQI",
                value: stats.avgAQI || "0",
                color: "#fbbf24",
                category: getAQICategory(parseFloat(stats.avgAQI)).category,
              },
              {
                icon: <ArrowDown className="w-7 h-7" />,
                label: "LOWEST AQI",
                value: stats.lowest || "0",
                color: "#10b981",
                category: getAQICategory(parseFloat(stats.lowest)).category,
              },
              {
                icon: <ArrowUp className="w-7 h-7" />,
                label: "HIGHEST AQI",
                value: stats.highest || "0",
                color: "#ef4444",
                category: getAQICategory(parseFloat(stats.highest)).category,
              },
            ].map(({ icon, label, value, color, category }) => (
              <div
                key={label}
                className="bg-card border border-border rounded-lg p-3 flex items-center gap-4 hover:shadow-lg transition-shadow"
                style={{ borderLeft: `3px solid ${color}` }}>
                <div
                  className="flex-shrink-0 self-stretch flex items-center justify-center rounded-lg px-4"
                  style={{ background: `${color}25`, color }}>
                  {icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                    {label}
                  </p>
                  <p className="text-2xl font-bold text-foreground leading-none">
                    {value}
                  </p>
                  {category && (
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mt-1.5"
                      style={{ color }}>
                      {category}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground mr-2" />
                <FilterDropdown
                  label="Category:"
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: "all", label: "All Categories" },
                    { value: "good", label: "Good" },
                    { value: "satisfactory", label: "Satisfactory" },
                    { value: "moderate", label: "Moderate" },
                    { value: "poor", label: "Poor" },
                    { value: "very poor", label: "Very Poor" },
                    { value: "severe", label: "Severe" },
                  ]}
                  className="-ml-3"
                />
              </div>

              <FilterDropdown
                label="Sort:"
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "highest", label: "Highest AQI" },
                  { value: "lowest", label: "Lowest AQI" },
                ]}
              />

              <div className="ml-auto text-sm text-blue-400">
                Showing {sortedHistory.length} of {history.length} predictions
              </div>
            </div>
          </div>

          {/* History List */}
          {sortedHistory.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No Predictions Yet
              </h3>
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "Make your first prediction to see it here"
                  : "No predictions found for this category"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedHistory.map((item, index) => (
                <HistoryCard key={index} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HistoryCard({ item }) {
  const navigate = useNavigate();
  const aqiInfo = getAQICategory(item.aqi);
  const date = new Date(item.timestamp);

  return (
    <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-4 hover:shadow-lg transition-shadow">
      {/* AQI Block */}
      <div
        className="flex-shrink-0 self-stretch flex flex-col items-center justify-center rounded-lg p-5 min-w-24 max-w-24"
        style={{ background: `${aqiInfo.color}22` }}>
        <span
          className="text-2xl font-extrabold leading-none"
          style={{ color: aqiInfo.color }}>
          {item.aqi.toFixed(0)}
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-widest mt-1"
          style={{ color: aqiInfo.color }}>
          AQI
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-1.5">
        {/* Category + timestamp row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">{aqiInfo.emoji}</span>
            <span className="font-bold text-2xl text-foreground">
              {aqiInfo.category}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() =>
                navigate("/problems", { state: { prediction: item } })
              }
              className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md font-medium bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 transition-colors">
              <FlaskConical className="w-3 h-3" />
              Analyze
            </button>
          </div>
        </div>

        <div className="flex gap-3 justify-between items-center flex-row-reverse">
          <div className="flex items-center gap-1.5 text-sm text-blue-400 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" />
            <span>{date.toLocaleString()}</span>
          </div>
          {/* Pollutants */}
          {item.pollutants && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(item.pollutants)
                .filter(([_, value]) => value > 0)
                .slice(0, 6)
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2.5 py-0.5 text-xs rounded-md font-medium bg-yellow-500/10 border border-yellow-500/40 text-yellow-500">
                    {formatPollutantName(key)}:{" "}
                    {value % 1 === 0 ? value : value.toFixed(1)}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
