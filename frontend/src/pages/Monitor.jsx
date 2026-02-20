import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "../lib/api";
import { getAQICategory } from "../lib/constants";
import toast from "react-hot-toast";
import { Activity, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import Header from "../components/Header";
import FilterDropdown from "../components/FilterDropdown";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function Monitor() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedYearAQI, setSelectedYearAQI] = useState("all");
  const [selectedYearPollutants, setSelectedYearPollutants] = useState("all");
  const [availableYears, setAvailableYears] = useState([]);
  const [aqiData, setAqiData] = useState(null);
  const [pollutantsData, setPollutantsData] = useState(null);
  const [cityStats, setCityStats] = useState(null);
  const [loadingCities, setLoadingCities] = useState(true);
  const [errorCities, setErrorCities] = useState(false);
  const [loadingAQI, setLoadingAQI] = useState(false);
  const [loadingPollutants, setLoadingPollutants] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      // Reset year filters when changing cities
      setSelectedYearAQI("all");
      setSelectedYearPollutants("all");
      setAvailableYears([]);
      loadCityStats();
      // Pass "all" directly to avoid using stale state values
      loadAQIData("all");
      loadPollutantsData("all");
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedCity) {
      loadAQIData();
    }
  }, [selectedYearAQI]);

  useEffect(() => {
    if (selectedCity) {
      loadPollutantsData();
    }
  }, [selectedYearPollutants]);

  const loadCities = async () => {
    try {
      const response = await api.getCities();
      setCities(response.data.cities);
      if (response.data.cities.length > 0) {
        setSelectedCity(response.data.cities[0]);
      }
    } catch (error) {
      toast.error("Failed to load cities");
      setErrorCities(true);
    } finally {
      setLoadingCities(false);
    }
  };

  const loadCityStats = async () => {
    try {
      const statsResponse = await api.getCityStats(selectedCity);
      setCityStats(statsResponse.data);
    } catch (error) {
      console.error("Error loading city stats:", error);
    }
  };

  const loadAQIData = async (yearOverride = null) => {
    setLoadingAQI(true);
    try {
      const yearToUse = yearOverride !== null ? yearOverride : selectedYearAQI;
      const year = yearToUse === "all" ? null : parseInt(yearToUse);
      const response = await api.getCityMonitorData(selectedCity, year);
      const data = response.data;

      // Transform API response to match chart format
      const transformedData = {
        labels: data.labels || [],
        aqi: data.aqi || [],
        filter: data.filter || "all_time",
        year: data.year,
      };

      setAqiData(transformedData);

      // Update available years for the dropdown
      if (data.available_years && data.available_years.length > 0) {
        setAvailableYears(data.available_years);

        // If only one year is available, automatically select it
        if (data.available_years.length === 1) {
          const singleYear = data.available_years[0].toString();
          if (selectedYearAQI !== singleYear) {
            setSelectedYearAQI(singleYear);
          }
        } else {
          // Reset year selection if current year is not available
          if (
            selectedYearAQI !== "all" &&
            !data.available_years.includes(parseInt(selectedYearAQI))
          ) {
            setSelectedYearAQI("all");
          }
        }
      }
    } catch (error) {
      toast.error("Failed to load AQI data");
      console.error("Error loading AQI data:", error);
    } finally {
      setLoadingAQI(false);
    }
  };

  const loadPollutantsData = async (yearOverride = null) => {
    setLoadingPollutants(true);
    try {
      const yearToUse =
        yearOverride !== null ? yearOverride : selectedYearPollutants;
      const year = yearToUse === "all" ? null : parseInt(yearToUse);
      const response = await api.getCityMonitorData(selectedCity, year);
      const data = response.data;

      // Transform API response to match chart format
      const transformedData = {
        labels: data.labels || [],
        pm25: data.pollutants?.pm25 || [],
        no: data.pollutants?.no || [],
        no2: data.pollutants?.no2 || [],
        nox: data.pollutants?.nox || [],
        co: data.pollutants?.co || [],
        so2: data.pollutants?.so2 || [],
        o3: data.pollutants?.o3 || [],
        filter: data.filter || "all_time",
        year: data.year,
      };

      setPollutantsData(transformedData);

      // Update available years for the dropdown
      if (data.available_years && data.available_years.length > 0) {
        setAvailableYears(data.available_years);

        // If only one year is available, automatically select it
        if (data.available_years.length === 1) {
          const singleYear = data.available_years[0].toString();
          if (selectedYearPollutants !== singleYear) {
            setSelectedYearPollutants(singleYear);
          }
        } else {
          // Reset year selection if current year is not available
          if (
            selectedYearPollutants !== "all" &&
            !data.available_years.includes(parseInt(selectedYearPollutants))
          ) {
            setSelectedYearPollutants("all");
          }
        }
      }
    } catch (error) {
      toast.error("Failed to load pollutants data");
      console.error("Error loading pollutants data:", error);
    } finally {
      setLoadingPollutants(false);
    }
  };

  const getAQIChartOption = () => {
    if (!aqiData) return {};

    const labels = aqiData.labels || [];
    const aqiValues = aqiData.aqi || [];

    // Determine chart title based on filter
    let chartTitle = "AQI Trend";
    if (aqiData.filter === "all_time") {
      chartTitle = "AQI Trend {filter|- All Time (Yearly Average)}";
    } else if (aqiData.year) {
      chartTitle = `AQI Trend {filter|- ${aqiData.year} (Monthly Average)}`;
    }

    return {
      backgroundColor: "transparent",
      title: {
        text: chartTitle,
        textStyle: {
          color: "#e5e7eb",
          fontSize: 16,
          fontWeight: "bold",
          rich: {
            filter: {
              color: "hsl(168, 76%, 42%)",
              fontSize: 14,
              fontWeight: "normal",
            },
          },
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: { color: "#4b5563", type: "dashed" },
        },
        backgroundColor: "rgba(10, 15, 25, 0.92)",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 0,
        formatter: (params) => {
          if (!params || params.length === 0) return "";
          const idx = params[0].dataIndex;
          const label = params[0].axisValue;
          const aqi = params[0].value;
          if (aqi == null) return "";
          const cat = getAQICategory(aqi);
          const prevVal = idx > 0 ? aqiValues[idx - 1] : null;
          const delta = prevVal !== null ? (aqi - prevVal).toFixed(1) : null;
          const deltaStr =
            delta !== null
              ? `<span style="color:${parseFloat(delta) <= 0 ? "#6ee7b7" : "#f87171"}; font-size:11px; margin-left:6px;">${parseFloat(delta) > 0 ? "+" : ""}${delta}</span>`
              : "";
          return `
            <div style="padding:12px 16px; min-width:190px; font-family:inherit;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; border-bottom:1px solid #374151; padding-bottom:8px;">
                <span style="font-size:18px;">${cat.emoji}</span>
                <span style="color:#f9fafb; font-weight:700; font-size:14px;">${label}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="color:#9ca3af; font-size:12px;">Avg AQI</span>
                <span style="color:${cat.color}; font-weight:700; font-size:16px;">${aqi.toFixed(1)}${deltaStr}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="color:#9ca3af; font-size:12px;">Category</span>
                <span style="color:${cat.color}; font-weight:600; font-size:12px;">${cat.category}</span>
              </div>
              <div style="background:#1f2937; border-radius:6px; padding:6px 8px; font-size:11px; color:#d1d5db; border-left:3px solid ${cat.color};">
                ${cat.description}
              </div>
            </div>`;
        },
      },
      grid: {
        left: "8%",
        right: "4%",
        bottom: "15%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        name: aqiData.filter === "all_time" ? "Year" : "Month",
        nameLocation: "middle",
        nameGap: 35,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        data: labels,
        axisLabel: {
          color: "#9ca3af",
          fontSize: 11,
        },
        axisLine: { lineStyle: { color: "#4b5563" } },
        boundaryGap: false,
      },
      yAxis: {
        type: "value",
        name: "AQI",
        nameLocation: "middle",
        nameGap: 65,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        axisLabel: { color: "#9ca3af" },
        axisLine: { lineStyle: { color: "#4b5563" } },
        splitLine: { lineStyle: { color: "#374151", type: "dashed" } },
      },
      series: [
        {
          name: "AQI",
          type: "line",
          data: aqiValues,
          showSymbol: true,
          symbol: "circle",
          symbolSize: 8,
          smooth: true,
          lineStyle: { width: 3, color: "#6ee7b7" },
          itemStyle: { color: "#6ee7b7" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(110, 231, 183, 0.4)" },
                { offset: 1, color: "rgba(110, 231, 183, 0.04)" },
              ],
            },
          },
          emphasis: {
            focus: "series",
            itemStyle: {
              color: "#3b82f6",
              borderColor: "#fff",
              borderWidth: 2,
            },
          },
        },
      ],
    };
  };

  const getPollutantsChartOption = () => {
    if (!pollutantsData) return {};

    const labels = pollutantsData.labels || [];

    // Determine chart title based on filter
    let chartTitle = "Pollutant Levels";
    if (pollutantsData.filter === "all_time") {
      chartTitle = "Pollutant Levels {filter|- All Time (Yearly Average)}";
    } else if (pollutantsData.year) {
      chartTitle = `Pollutant Levels {filter|- ${pollutantsData.year} (Monthly Average)}`;
    }

    const pollutantColors = {
      "PM2.5": "#ef4444",
      NO: "#f59e0b",
      NO2: "#8b5cf6",
      NOx: "#06b6d4",
      CO: "#3b82f6",
      SO2: "#10b981",
      O3: "#ec4899",
    };

    return {
      backgroundColor: "transparent",
      title: {
        text: chartTitle,
        textStyle: {
          color: "#e5e7eb",
          fontSize: 16,
          fontWeight: "bold",
          rich: {
            filter: {
              color: "hsl(168, 76%, 42%)",
              fontSize: 14,
              fontWeight: "normal",
            },
          },
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: { color: "#4b5563", type: "dashed" },
        },
        backgroundColor: "rgba(10, 15, 25, 0.92)",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 0,
        formatter: (params) => {
          if (!params || params.length === 0) return "";
          const label = params[0].axisValue;
          const rows = params
            .filter((p) => p.value != null)
            .map((p) => {
              const color = pollutantColors[p.seriesName] || "#9ca3af";
              return `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                  <span style="display:flex; align-items:center; gap:5px; color:#9ca3af; font-size:12px;">
                    <span style="width:8px; height:8px; border-radius:50%; background:${color}; display:inline-block; flex-shrink:0;"></span>
                    ${p.seriesName}
                  </span>
                  <span style="color:${color}; font-weight:600; font-size:12px; margin-left:16px;">${typeof p.value === "number" ? p.value.toFixed(2) : p.value} <span style="color:#6b7280; font-weight:400;">µg/m³</span></span>
                </div>`;
            })
            .join("");
          return `
            <div style="padding:12px 16px; min-width:220px; font-family:inherit;">
              <div style="color:#f9fafb; font-weight:700; font-size:14px; margin-bottom:8px; border-bottom:1px solid #374151; padding-bottom:8px;">
                📍 ${label}
              </div>
              ${rows}
            </div>`;
        },
      },
      legend: {
        data: ["PM2.5", "NO", "NO2", "NOx", "CO", "SO2", "O3"],
        textStyle: { color: "#9ca3af" },
        top: "12%",
        selected: {
          "PM2.5": true,
          NO: true,
          NO2: true,
          NOx: true,
          CO: true,
          SO2: true,
          O3: true,
        },
      },
      grid: {
        left: "8%",
        right: "4%",
        bottom: "15%",
        top: "25%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: labels,
        name: pollutantsData.filter === "all_time" ? "Year" : "Month",
        nameLocation: "middle",
        nameGap: 35,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        axisLabel: {
          color: "#9ca3af",
          fontSize: 11,
        },
        axisLine: { lineStyle: { color: "#4b5563" } },
        boundaryGap: false,
      },
      yAxis: {
        type: "value",
        name: "Concentration (µg/m³)",
        nameLocation: "middle",
        nameGap: 70,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        axisLabel: { color: "#9ca3af" },
        axisLine: { lineStyle: { color: "#4b5563" } },
        splitLine: { lineStyle: { color: "#374151", type: "dashed" } },
      },
      series: [
        {
          name: "PM2.5",
          type: "line",
          data: pollutantsData.pm25 || [],
          smooth: true,
          showSymbol: true,
          symbolSize: 5,
          lineStyle: { width: 2 },
          itemStyle: { color: "#ef4444" },
          emphasis: { focus: "series" },
        },
        {
          name: "NO",
          type: "line",
          data: pollutantsData.no || [],
          smooth: true,
          showSymbol: true,
          symbolSize: 5,
          lineStyle: { width: 2 },
          itemStyle: { color: "#f59e0b" },
          emphasis: { focus: "series" },
        },
        {
          name: "NO2",
          type: "line",
          data: pollutantsData.no2 || [],
          smooth: true,
          showSymbol: true,
          symbolSize: 5,
          lineStyle: { width: 2 },
          itemStyle: { color: "#8b5cf6" },
          emphasis: { focus: "series" },
        },
        {
          name: "NOx",
          type: "line",
          data: pollutantsData.nox || [],
          smooth: true,
          showSymbol: true,
          symbolSize: 5,
          lineStyle: { width: 2 },
          itemStyle: { color: "#06b6d4" },
          emphasis: { focus: "series" },
        },
        {
          name: "CO",
          type: "line",
          data: pollutantsData.co || [],
          smooth: true,
          showSymbol: true,
          symbolSize: 5,
          lineStyle: { width: 2 },
          itemStyle: { color: "#3b82f6" },
          emphasis: { focus: "series" },
        },
        {
          name: "SO2",
          type: "line",
          data: pollutantsData.so2 || [],
          smooth: true,
          showSymbol: true,
          symbolSize: 5,
          lineStyle: { width: 2 },
          itemStyle: { color: "#10b981" },
          emphasis: { focus: "series" },
        },
        {
          name: "O3",
          type: "line",
          data: pollutantsData.o3 || [],
          smooth: true,
          showSymbol: true,
          symbolSize: 5,
          lineStyle: { width: 2 },
          itemStyle: { color: "#ec4899" },
          emphasis: { focus: "series" },
        },
      ],
    };
  };

  const currentAQI = cityStats?.avg_aqi || 0;
  const maxAQI = cityStats?.max_aqi || 0;
  const minAQI = cityStats?.min_aqi || 0;
  const stdDev = cityStats?.std_aqi || 0;
  const dataPoints = cityStats?.data_points || 0;

  const avgAqiInfo = getAQICategory(currentAQI);
  const maxAqiInfo = getAQICategory(maxAQI);
  const minAqiInfo = getAQICategory(minAQI);

  // Get std deviation category
  const getStdDevInfo = (std) => {
    if (std < 30) {
      return {
        category: "Low",
        color: "#10b981",
        description: "Consistent",
      };
    } else if (std < 60) {
      return {
        category: "Moderate",
        color: "#eab308",
        description: "Variable",
      };
    } else {
      return {
        category: "High",
        color: "#f97316",
        description: "Unstable",
      };
    }
  };

  // Get data points category
  const getDataPointsInfo = (points) => {
    if (points < 100) {
      return { category: "Limited", color: "#f97316" };
    } else if (points < 500) {
      return { category: "Good", color: "#10b981" };
    } else {
      return { category: "Rich", color: "#3b82f6" };
    }
  };

  const stdDevInfo = getStdDevInfo(stdDev);
  const dataPointsInfo = getDataPointsInfo(dataPoints);

  if (loadingCities) {
    return (
      <div className="space-y-6">
        <Header
          title="Monitor Cities"
          description="Track AQI trends and pollutant levels over time for selected cities"
        />
        <LoadingState message="Loading cities..." />
      </div>
    );
  }

  if (errorCities) {
    return (
      <div className="space-y-6">
        <Header
          title="Monitor Cities"
          description="Track AQI trends and pollutant levels over time for selected cities"
        />
        <ErrorState
          message="Failed to load cities"
          onRetry={() => {
            setErrorCities(false);
            setLoadingCities(true);
            loadCities();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title="Monitor Cities"
        description="Track AQI trends and pollutant levels over time for selected cities"
      />

      {/* City Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Select City
        </label>
        <div className="relative w-full">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-4 py-2.5 pr-10 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none">
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
        </div>
      </div>

      {(loadingAQI || loadingPollutants) && !cityStats ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <StatCard
              icon={<Activity className="w-8 h-8" />}
              label="Avg AQI"
              value={currentAQI?.toFixed(2)}
              color="#fbbf24"
              category={avgAqiInfo.category}
              showCategory={true}
            />
            <StatCard
              icon={<TrendingDown className="w-8 h-8" />}
              label="Min AQI"
              value={cityStats?.min_aqi?.toFixed(2) || "N/A"}
              color="#10b981"
              category={minAqiInfo.category}
              showCategory={true}
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              label="Max AQI"
              value={cityStats?.max_aqi?.toFixed(2) || "N/A"}
              color="#ef4444"
              category={maxAqiInfo.category}
              showCategory={true}
            />
            {/* <StatCard
              icon={<AlertCircle className="w-6 h-6" />}
              label="Std Deviation"
              value={cityStats?.std_aqi?.toFixed(2) || "N/A"}
              color={stdDevInfo.color}
              category={stdDevInfo.category}
              showCategory={true}
            />
            <StatCard
              icon={<Calendar className="w-6 h-6" />}
              label="Data Points"
              value={cityStats?.data_points || 0}
              color={dataPointsInfo.color}
              category={dataPointsInfo.category}
              showCategory={true}
            /> */}
          </div>

          {/* AQI Trend Chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                AQI Trend
              </h3>
              <FilterDropdown
                value={selectedYearAQI}
                onChange={setSelectedYearAQI}
                options={[
                  // Only show "All Time" if there are multiple years
                  ...(availableYears.length > 1
                    ? [{ value: "all", label: "All Time" }]
                    : []),
                  ...availableYears.map((year) => ({
                    value: year.toString(),
                    label: `${year}`,
                  })),
                ]}
              />
            </div>
            {loadingAQI ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : aqiData && aqiData.aqi && aqiData.aqi.length > 0 ? (
              <ReactECharts
                option={getAQIChartOption()}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "canvas" }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">
                  No AQI data available for this selection
                </p>
              </div>
            )}
          </div>

          {/* Pollutants Chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Pollutant Levels
              </h3>
              <FilterDropdown
                value={selectedYearPollutants}
                onChange={setSelectedYearPollutants}
                options={[
                  // Only show "All Time" if there are multiple years
                  ...(availableYears.length > 1
                    ? [{ value: "all", label: "All Time" }]
                    : []),
                  ...availableYears.map((year) => ({
                    value: year.toString(),
                    label: `${year}`,
                  })),
                ]}
              />
            </div>
            {loadingPollutants ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pollutantsData &&
              pollutantsData.labels &&
              pollutantsData.labels.length > 0 ? (
              <ReactECharts
                option={getPollutantsChartOption()}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "canvas" }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">
                  No pollutant data available for this selection
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  category,
  showCategory = false,
}) {
  return (
    <div
      className="bg-card border border-border rounded-lg px-5 py-3 flex items-center gap-4 transition-shadow hover:shadow-lg"
      style={{ borderLeft: `3px solid ${color || "hsl(168,76%,42%)"}` }}>
      {/* Icon block */}
      <div
        className="flex-shrink-0 self-stretch flex items-center justify-center px-6 rounded-lg"
        style={{ background: `${color}22` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-3xl font-bold text-foreground leading-none">
          {value}
        </p>
        {showCategory && category && (
          <p
            className="text-xs font-semibold uppercase tracking-widest mt-1.5"
            style={{ color }}>
            {category}
          </p>
        )}
      </div>
    </div>
  );
}
