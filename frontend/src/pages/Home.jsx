import { useEffect, useState, useCallback } from "react";
import { Activity, TrendingUp, MapPin, History, Lightbulb } from "lucide-react";
import api from "../lib/api";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import FeatureCard from "../components/FeatureCard";
import Header from "../components/Header";
import { color } from "echarts";

export default function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [analyticsRes, citiesRes, historyRes] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getCities(),
        api.getHistory(),
      ]);

      setStats({
        totalRecords: analyticsRes.data.total_records,
        minAQI: analyticsRes.data.min_aqi,
        maxAQI: analyticsRes.data.max_aqi,
        cities: citiesRes.data.count,
        predictions: historyRes.data.count,
      });
    } catch (error) {
      toast.error("Failed to load statistics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Header
        title="🌍 Advanced AQI Monitoring System"
        description="Comprehensive air quality analysis with problem-solution framework"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Activity}
          title="Dataset Records"
          value={loading ? "..." : stats?.totalRecords?.toLocaleString() || "0"}
          color="text-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          title="AQI Range"
          value={
            loading
              ? "..."
              : `${stats?.minAQI?.toFixed(0) || "0"} - ${stats?.maxAQI?.toFixed(0) || "0"}`
          }
          color="text-green-500"
        />
        <StatCard
          icon={MapPin}
          title="Cities Monitored"
          value={loading ? "..." : stats?.cities || "0"}
          color="text-orange-500"
        />
        <StatCard
          icon={History}
          title="Total Predictions"
          value={loading ? "..." : stats?.predictions || "0"}
          color="text-purple-500"
        />
      </div>

      {/* AQI Categories Table */}
      <div>
        <h2 className="text-2xl font-medium text-foreground mb-4">
          AQI Categories
        </h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  AQI Range
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">
                  Health Impact
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                  Advisory
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Good",
                  range: "0 – 50",
                  color: "#10b981",
                  impact: "Air quality is satisfactory.",
                  advisory: "No precautions needed. Enjoy outdoor activities.",
                },
                {
                  label: "Satisfactory",
                  range: "51 – 100",
                  color: "#fbbf24",
                  impact: "Acceptable air quality for most people.",
                  advisory:
                    "Sensitive individuals should limit prolonged exertion.",
                },
                {
                  label: "Moderate",
                  range: "101 – 200",
                  color: "#f472b6",
                  impact:
                    "May cause breathing discomfort on prolonged exposure.",
                  advisory:
                    "People with respiratory issues should reduce outdoor time.",
                },
                {
                  label: "Poor",
                  range: "201 – 300",
                  color: "#c026d3",
                  impact: "May cause respiratory issues for most.",
                  advisory:
                    "Wear masks outdoors. Limit strenuous outdoor activity.",
                },
                {
                  label: "Very Poor",
                  range: "301 – 400",
                  color: "#ef4444",
                  impact:
                    "May cause serious health effects on prolonged exposure.",
                  advisory: "Avoid outdoor activity. Keep windows closed.",
                },
                {
                  label: "Severe",
                  range: "400+",
                  color: "#991b1b",
                  impact: "Health emergency — everyone may be affected.",
                  advisory:
                    "Stay indoors. Use air purifiers. Seek medical advice.",
                },
              ].map((row, i) => (
                <tr
                  key={row.label}
                  className="border-b border-border/50 last:border-0 transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <span
                      className="flex items-center gap-2 font-semibold"
                      style={{ color: row.color }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: row.color,
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      {row.label}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 font-mono font-medium text-foreground"
                    style={{ color: row.color }}>
                    {row.range}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {row.impact}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {row.advisory}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Features */}
      <div>
        <h2 className="text-2xl font-medium text-foreground mb-4">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Activity />}
            title="Prediction Engine"
            features={[
              "ML-based AQI calculation",
              "7 pollutant inputs",
              "Instant health advisories",
              "Preset scenarios",
            ]}
          />
          <FeatureCard
            icon={<TrendingUp />}
            title="Problem Analysis"
            features={[
              "Identify critical pollutants",
              "Severity classification",
              "Health impact assessment",
              "City-specific analysis",
            ]}
          />
          <FeatureCard
            icon={<Lightbulb />}
            title="Solutions & Planning"
            features={[
              "3 intervention scenarios",
              "Budget allocation",
              "Policy recommendations",
              "Impact projections",
            ]}
          />
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div>
        <h2 className="text-2xl font-medium text-foreground mb-4">
          Quick Start Guide
        </h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <span>
                <strong>Predict AQI:</strong> Input pollutant levels and get
                ML-based predictions with health advisories
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <span>
                <strong>City Map:</strong> Explore air quality across major
                Indian cities on interactive map
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <span>
                <strong>Monitor Cities:</strong> Track AQI trends and pollutant
                levels over time for selected cities
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4.</span>
              <span>
                <strong>Analytics:</strong> View statistical analysis with
                trends, distribution, and correlations
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">5.</span>
              <span>
                <strong>Problems:</strong> Identify problematic pollutants and
                assess their health impacts by city
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">6.</span>
              <span>
                <strong>Solutions:</strong> Explore intervention scenarios,
                policy recommendations, and action plans
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">7.</span>
              <span>
                <strong>Dataset:</strong> View comprehensive dataset statistics,
                columns, and sample records
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">8.</span>
              <span>
                <strong>History:</strong> View and manage your prediction
                history with filters and export options
              </span>
            </li>
          </ol>
        </div>
      </div> */}
    </div>
  );
}
