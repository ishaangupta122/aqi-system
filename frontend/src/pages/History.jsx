import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { getAQICategory } from "../lib/constants";
import toast from "react-hot-toast";
import {
  Download,
  Trash2,
  Clock,
  MapPin,
  Calendar,
  Filter,
  BarChart4,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import StatCard from "../components/StatCard";
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

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={history.length === 0}
            className="px-4 py-2 bg-secondary/50 border border-border rounded-lg text-foreground hover:bg-muted disabled:opacity-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleClearHistory}
            disabled={history.length === 0}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading history...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={BarChart4}
              title="Total Predictions"
              value={stats.total || "0"}
              color="text-green-500"
            />

            <StatCard
              icon={TrendingUp}
              title="Average AQI"
              value={stats.avgAQI || "0"}
              color="text-blue-500"
            />

            <StatCard
              icon={ArrowUp}
              title="Highest AQI"
              value={stats.highest || "0"}
              color="text-red-500"
            />

            <StatCard
              icon={ArrowDown}
              title="Lowest AQI"
              value={stats.lowest || "0"}
              color="text-yellow-500"
            />
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

              <div className="ml-auto text-sm text-muted-foreground">
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
  const aqiInfo = getAQICategory(item.aqi);
  const date = new Date(item.timestamp);

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* AQI Badge */}
        <div className="flex-shrink-0">
          <div
            className={`${aqiInfo.bgColor} text-white rounded-lg p-4 text-center min-w-[100px]`}>
            <div className="text-3xl font-bold">{item.aqi.toFixed(0)}</div>
            <div className="text-xs font-medium mt-1">AQI</div>
          </div>
        </div>

        {/* Details */}
        <div className="flex-grow space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{aqiInfo.emoji}</span>
            <span className="font-bold text-lg text-foreground">
              {aqiInfo.category}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            {item.city && (
              <div className="flex items-center gap-2 text-blue-400">
                <MapPin className="w-4 h-4" />
                <span>{item.city}</span>
              </div>
            )}
            {item.date && (
              <div className="flex items-center gap-2 text-yellow-500">
                <Calendar className="w-4 h-4" />
                <span>{item.date}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-yellow-500">
              <Clock className="w-4 h-4" />
              <span>{date.toLocaleString()}</span>
            </div>
          </div>

          {/* Pollutants */}
          {item.pollutants && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(item.pollutants)
                .filter(([_, value]) => value > 0)
                .slice(0, 5)
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-1 bg-primary/10 border border-primary/40 text-xs rounded text-primary">
                    {formatPollutantName(key)}: {value.toFixed(1)}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
