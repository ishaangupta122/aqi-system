import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "../lib/api";
import { pollutantUnits } from "../lib/constants";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  MapPin,
  TrendingDown,
  Clock,
  ChevronDown,
  Check,
  Lightbulb,
  HeartPulse,
  BuildingIcon,
} from "lucide-react";
import Header from "../components/Header";
import { pollutantInfo } from "../data";

export default function Problems() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [dataSource, setDataSource] = useState("city");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPollutant, setSelectedPollutant] = useState(null);

  // Single filter state
  const [timeFilter, setTimeFilter] = useState("latest");
  const [availableYears, setAvailableYears] = useState([]);

  // Helper function to format pollutant names
  const formatPollutantName = (name) => {
    return name.replace(/_/g, ".");
  };

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    // Load available years when city is selected
    if (selectedCity && dataSource === "city") {
      loadAvailableYears();
    }
  }, [selectedCity, dataSource]);

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

  const loadAvailableYears = async () => {
    if (!selectedCity) return;

    try {
      // Fetch with latest to get available_years list
      const response = await api.getCityAggregatedData(selectedCity, "latest");
      if (response.data.available_years) {
        setAvailableYears(response.data.available_years);
      }
    } catch (error) {
      console.error("Failed to load available years:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedCity && dataSource === "city") {
      toast.error("Please select a city");
      return;
    }

    setLoading(true);
    try {
      let pollutantData;

      if (dataSource === "city") {
        // Parse timeFilter to determine filter_type and parameters
        let filterType = "latest";
        let year = null;
        let month = null;
        let season = null;

        if (timeFilter === "latest") {
          filterType = "latest";
        } else if (timeFilter === "all_time") {
          filterType = "all_time";
        } else if (timeFilter.startsWith("year_")) {
          filterType = "year";
          year = parseInt(timeFilter.replace("year_", ""));
        } else if (timeFilter.startsWith("season_")) {
          filterType = "season";
          season = timeFilter.replace("season_", "");
        }

        // Fetch aggregated data from city with filtering
        const aggregatedResponse = await api.getCityAggregatedData(
          selectedCity,
          filterType,
          year,
          month,
          season,
        );

        const data = aggregatedResponse.data;

        // Store available years for filter dropdown
        if (data.available_years) {
          setAvailableYears(data.available_years);
        }

        pollutantData = {
          PM2_5: data.pm25,
          NO: data.no || 0,
          NO2: data.no2,
          NOx: data.nox || 0,
          CO: data.co,
          SO2: data.so2,
          O3: data.o3,
          date:
            data.date ||
            (data.date_range
              ? `${data.date_range.start} to ${data.date_range.end}`
              : "N/A"),
          city: selectedCity,
          filter_info: {
            type: filterType,
            year: data.year,
            month: data.month,
            month_name: data.month_name,
            season: data.season,
            records: data.records,
          },
        };
      } else {
        // Get from last prediction
        const historyResponse = await api.getHistory(1);
        const lastPrediction = historyResponse.data.predictions[0];

        if (!lastPrediction) {
          toast.error("No prediction history available");
          setLoading(false);
          return;
        }

        pollutantData = {
          PM2_5: lastPrediction.pollutants.PM2_5,
          NO: lastPrediction.pollutants.NO,
          NO2: lastPrediction.pollutants.NO2,
          NOx: lastPrediction.pollutants.NOx,
          CO: lastPrediction.pollutants.CO,
          SO2: lastPrediction.pollutants.SO2,
          O3: lastPrediction.pollutants.O3,
          date: lastPrediction.date || new Date().toISOString().split("T")[0],
          city: lastPrediction.city || "Unknown",
        };
      }

      console.log("Analyzing pollutant data:", pollutantData);
      const response = await api.analyzeProblems(pollutantData);

      // Transform and sort by excess percentage (priority ranking)
      const transformedProblems = (response.data.problems || [])
        .map((problem) => ({
          pollutant: problem.pollutant,
          current_value: problem.value,
          safe_limit: problem.limit,
          severity: problem.severity,
          excess: problem.excess,
        }))
        .sort((a, b) => b.excess - a.excess); // Sort by excess descending

      const transformedResult = {
        problem_pollutants: transformedProblems,
        problem_count: response.data.problem_count || 0,
        city: pollutantData.city,
        date: pollutantData.date,
        filter_info: pollutantData.filter_info,
      };

      setAnalysisResult(transformedResult);

      // Select first pollutant if exists
      if (transformedProblems.length > 0) {
        setSelectedPollutant(transformedProblems[0]);
        toast.error(
          `Found ${transformedProblems.length} ${transformedProblems.length === 1 ? "pollutant" : "pollutants"} exceeding limits`,
        );
      } else {
        setSelectedPollutant(null);
        toast.success("All pollutant levels are within safe limits! 🎉");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(
        "Failed to analyze pollutants: " +
          (error.response?.data?.detail || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const getPollutantGauge = (pollutant) => {
    if (!pollutant) return {};

    // Dynamically set max value to accommodate current value
    const baseMax = pollutant.safe_limit * 3;
    const maxValue = Math.max(baseMax, pollutant.current_value * 1.2);

    // Determine color based on current value
    let valueColor = "#4ade80"; // Green
    if (pollutant.current_value > pollutant.safe_limit * 2) {
      valueColor = "#ef4444"; // Red
    } else if (pollutant.current_value > pollutant.safe_limit * 1.5) {
      valueColor = "#fb923c"; // Orange
    } else if (pollutant.current_value > pollutant.safe_limit) {
      valueColor = "#fbbf24"; // Amber
    }

    return {
      backgroundColor: "transparent",
      series: [
        {
          type: "gauge",
          min: 0,
          max: maxValue,
          splitNumber: 5,
          radius: "80%",
          axisLine: {
            lineStyle: {
              width: 20,
              color: [
                [pollutant.safe_limit / maxValue, "#4ade80"],
                [(pollutant.safe_limit * 1.5) / maxValue, "#fbbf24"],
                [(pollutant.safe_limit * 2) / maxValue, "#fb923c"],
                [1, "#ef4444"],
              ],
            },
          },
          pointer: {
            itemStyle: {
              color: "#ffffff",
            },
            width: 6,
            length: "70%",
          },
          axisTick: {
            distance: -22,
            length: 6,
            lineStyle: {
              color: "#6b7280",
              width: 1,
            },
          },
          splitLine: {
            distance: -30,
            length: 20,
            lineStyle: {
              color: "#9ca3af",
              width: 2,
            },
          },
          axisLabel: {
            color: "#d1d5db",
            distance: 30,
            fontSize: 12,
            fontWeight: "500",
            formatter: (value) => {
              return value >= 1000
                ? (value / 1000).toFixed(1) + "k"
                : value.toFixed(0);
            },
          },
          detail: {
            valueAnimation: true,
            formatter: "{value}",
            color: "#ffffff",
            fontSize: 36,
            fontWeight: "bold",
            offsetCenter: [0, "65%"],
          },
          data: [
            {
              value: pollutant.current_value,
              name: formatPollutantName(pollutant.pollutant),
              title: {
                offsetCenter: [0, "85%"],
                fontSize: 16,
                color: valueColor,
                fontWeight: "600",
              },
            },
          ],
          title: {
            fontSize: 16,
            color: valueColor,
            fontWeight: "600",
          },
        },
      ],
    };
  };

  const getComparisonBarChart = () => {
    if (!analysisResult || analysisResult.problem_pollutants.length === 0)
      return {};

    const pollutants = analysisResult.problem_pollutants.map(
      (p) => p.pollutant,
    );
    const currentValues = analysisResult.problem_pollutants.map(
      (p) => p.current_value,
    );
    const safeLimits = analysisResult.problem_pollutants.map(
      (p) => p.safe_limit,
    );

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#333",
        textStyle: {
          color: "#fff",
        },
      },
      legend: {
        data: ["Current Level", "Safe Limit"],
        textStyle: {
          color: "#9ca3af",
        },
        top: 10,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: pollutants,
        axisLabel: {
          color: "#9ca3af",
          rotate: 0,
        },
        axisLine: {
          lineStyle: {
            color: "#4b5563",
          },
        },
      },
      yAxis: {
        type: "value",
        name: "µg/m³",
        nameTextStyle: {
          color: "#9ca3af",
        },
        axisLabel: {
          color: "#9ca3af",
        },
        axisLine: {
          lineStyle: {
            color: "#4b5563",
          },
        },
        splitLine: {
          lineStyle: {
            color: "#374151",
            type: "dashed",
          },
        },
      },
      series: [
        {
          name: "Current Level",
          type: "bar",
          data: currentValues,
          itemStyle: {
            color: "#ef4444",
          },
          barWidth: "30%",
        },
        {
          name: "Safe Limit",
          type: "bar",
          data: safeLimits,
          itemStyle: {
            color: "#22c55e",
          },
          barWidth: "30%",
        },
      ],
    };
  };

  const getDifferenceBarChart = (pollutant) => {
    if (!pollutant) return {};

    const difference = pollutant.current_value - pollutant.safe_limit;

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#333",
        textStyle: {
          color: "#fff",
        },
        formatter: (params) => {
          const value = params[0].value;
          return `${params[0].name}<br/>${params[0].seriesName}: ${value.toFixed(1)} ${pollutantUnits[pollutant.pollutant.toLowerCase()] || "µg/m³"}`;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: ["Current Level", "Safe Limit", "Excess"],
        axisLabel: {
          color: "#9ca3af",
          rotate: 0,
          fontSize: 11,
        },
        axisLine: {
          lineStyle: {
            color: "#4b5563",
          },
        },
      },
      yAxis: {
        type: "value",
        name: pollutantUnits[pollutant.pollutant.toLowerCase()] || "µg/m³",
        nameTextStyle: {
          color: "#9ca3af",
        },
        axisLabel: {
          color: "#9ca3af",
        },
        axisLine: {
          lineStyle: {
            color: "#4b5563",
          },
        },
        splitLine: {
          lineStyle: {
            color: "#374151",
            type: "dashed",
          },
        },
      },
      series: [
        {
          name: "Value",
          type: "bar",
          data: [
            {
              value: pollutant.current_value,
              itemStyle: { color: "#ef4444" },
            },
            {
              value: pollutant.safe_limit,
              itemStyle: { color: "#22c55e" },
            },
            {
              value: difference,
              itemStyle: { color: "#f59e0b" },
            },
          ],
          barWidth: "50%",
          label: {
            show: true,
            position: "top",
            color: "#e5e7eb",
            fontSize: 12,
            fontWeight: "bold",
            formatter: (params) => {
              return params.value.toFixed(1);
            },
          },
        },
      ],
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Header
        title="Problem Analysis"
        description="Identify problematic pollutants and assess their health impacts by city"
      />

      {/* Data Source Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Analyze Pollutants
            </h2>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>Analyze</>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {/* Data Source Toggle */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Data Source
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setDataSource("prediction")}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all ${
                  dataSource === "prediction"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary/50 text-foreground hover:bg-muted border border-border"
                }`}>
                <span>Last Prediction</span>
              </button>
              <button
                onClick={() => setDataSource("city")}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all ${
                  dataSource === "city"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary/50 text-foreground hover:bg-muted border border-border"
                }`}>
                <span>City Data</span>
              </button>
            </div>
          </div>

          {/* Filters Row */}
          {dataSource === "city" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* City Selector */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Select City
                </label>
                <div className="relative">
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

              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Time Period
                </label>
                <div className="relative">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none">
                    <option value="latest">Latest Data</option>
                    <option value="all_time">All Time Average</option>

                    {availableYears.length > 0 && (
                      <optgroup label="Year Average">
                        {availableYears.map((year) => (
                          <option key={year} value={`year_${year}`}>
                            {year} Average
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <optgroup label="Season Average">
                      <option value="season_winter">Winter Average</option>
                      <option value="season_summer">Summer Average</option>
                      <option value="season_monsoon">Monsoon Average</option>
                      <option value="season_post_monsoon">
                        Post-Monsoon Average
                      </option>
                    </optgroup>
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {analysisResult && (
        <>
          {/* Context Info */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-base font-semibold text-foreground">
                    {analysisResult.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time Period</p>
                  <p className="text-base font-semibold text-foreground">
                    {analysisResult.filter_info
                      ? analysisResult.filter_info.type === "latest"
                        ? new Date(analysisResult.date).toLocaleDateString()
                        : analysisResult.filter_info.type === "season"
                          ? `${analysisResult.filter_info.season} (${analysisResult.filter_info.records} records)`
                          : analysisResult.filter_info.type === "month"
                            ? `${analysisResult.filter_info.month_name} ${analysisResult.filter_info.year}`
                            : analysisResult.filter_info.type === "year"
                              ? `Year ${analysisResult.filter_info.year}`
                              : analysisResult.filter_info.type === "all_time"
                                ? `All Time (${analysisResult.filter_info.records} records)`
                                : new Date(
                                    analysisResult.date,
                                  ).toLocaleDateString()
                      : new Date(analysisResult.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${analysisResult.problem_count > 0 ? "bg-red-500/10" : "bg-green-500/10"}`}>
                  <AlertTriangle
                    className={`w-5 h-5 ${analysisResult.problem_count > 0 ? "text-red-500" : "text-green-500"}`}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p
                    className={`text-base font-semibold ${analysisResult.problem_count > 0 ? "text-red-500" : "text-green-500"}`}>
                    {analysisResult.problem_count}{" "}
                    {analysisResult.problem_count === 1
                      ? "pollutant"
                      : "pollutants"}{" "}
                    exceeding limit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {analysisResult.problem_pollutants.length === 0 ? (
            <div className="flex flex-col items-center bg-card border border-border rounded-lg p-12 text-center">
              <Check className="w-12 h-12 text-green-500 mb-5" />
              <h3 className="text-xl font-medium text-green-500 mb-2">
                All pollutant levels are within safe limits!
              </h3>
              <p className="text-muted-foreground">
                Air quality is currently acceptable
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Priority Ranking - Horizontal */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-medium text-foreground mb-4 flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                  Priority Ranking
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {analysisResult.problem_pollutants.map((problem, index) => (
                    <div
                      key={problem.pollutant}
                      onClick={() => setSelectedPollutant(problem)}
                      className={`flex-shrink-0 w-48 p-3 rounded-lg cursor-pointer transition-all ${
                        selectedPollutant?.pollutant === problem.pollutant
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-secondary/50 hover:bg-muted border-2 border-transparent"
                      }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-medium text-foreground">
                          #{index + 1}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold ${
                            problem.severity === "CRITICAL"
                              ? "bg-red-500 text-white"
                              : problem.severity === "HIGH"
                                ? "bg-orange-500 text-white"
                                : "bg-yellow-500 text-black"
                          }`}>
                          {problem.severity}
                        </span>
                      </div>
                      <div className="font-medium text-foreground mb-1">
                        {formatPollutantName(problem.pollutant)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {problem.current_value.toFixed(1)} /{" "}
                          {problem.safe_limit.toFixed(1)}
                        </div>
                        <div className="text-xs font-medium text-red-500">
                          + {problem.excess.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed View */}
              {selectedPollutant && (
                <div className="space-y-6">
                  {/* Combined Section: Gauge, Breakdown, and Description */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-xl font-medium text-foreground mb-6">
                      {formatPollutantName(selectedPollutant.pollutant)} Level
                      Details
                    </h3>

                    {/* Gauge and Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Left: Gauge */}
                      <div>
                        <ReactECharts
                          option={getPollutantGauge(selectedPollutant)}
                          style={{ height: "300px", width: "100%" }}
                          opts={{ renderer: "canvas" }}
                        />
                      </div>

                      {/* Right: Metrics */}
                      <div className="space-y-3">
                        <MetricBox
                          label="Current"
                          value={selectedPollutant.current_value.toFixed(1)}
                          unit={
                            pollutantUnits[
                              selectedPollutant.pollutant.toLowerCase()
                            ] || "µg/m³"
                          }
                          color="text-red-500"
                        />
                        <MetricBox
                          label="Safe"
                          value={selectedPollutant.safe_limit.toFixed(1)}
                          unit={
                            pollutantUnits[
                              selectedPollutant.pollutant.toLowerCase()
                            ] || "µg/m³"
                          }
                          color="text-green-500"
                        />
                        <MetricBox
                          label="Excess"
                          value={`${selectedPollutant.excess.toFixed(0)}%`}
                          color="text-orange-500"
                        />
                      </div>
                    </div>

                    {/* Pollutant Information */}
                    {pollutantInfo[selectedPollutant.pollutant] && (
                      <div className="mt-6 pt-6 border-t border-border space-y-6">
                        {/* Sources */}
                        <div>
                          <h4 className="font-medium text-foreground text-lg mb-3 flex items-center gap-2">
                            <BuildingIcon className="w-5 h-5 text-blue-500" />
                            Primary Sources
                          </h4>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {pollutantInfo[
                              selectedPollutant.pollutant
                            ].sources.map((source, i) => (
                              <li key={i}>{source}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Health Impact */}
                        <div>
                          <h4 className="font-medium text-foreground text-lg mb-3 flex items-center gap-2">
                            <HeartPulse className="w-5 h-5 text-red-500" />
                            Health Impact
                          </h4>
                          <p className="text-muted-foreground">
                            {pollutantInfo[selectedPollutant.pollutant].health}
                          </p>
                        </div>

                        {/* Solutions */}
                        <div>
                          <h4 className="font-medium text-foreground text-lg mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Recommended Solutions
                          </h4>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {pollutantInfo[
                              selectedPollutant.pollutant
                            ].solutions.map((solution, i) => (
                              <li key={i}>{solution}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comparison Bar Chart */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-xl font-medium text-foreground mb-4">
                      Current vs Safe Levels Comparison
                    </h3>
                    <ReactECharts
                      option={getComparisonBarChart()}
                      style={{ height: "350px", width: "100%" }}
                      opts={{ renderer: "canvas" }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricBox({ label, value, unit, subtitle, color }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-4">
      <p className="uppercase text-sm font-medium text-muted-foreground mb-1">
        {label}
      </p>
      <div className={`text-2xl font-medium ${color}`}>
        {value}{" "}
        {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
      </div>
      {subtitle && (
        <p className="text-sm font-medium text-red-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
