import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import { api } from "../lib/api";
import { pollutantUnits, getAQICategory } from "../lib/constants";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Clock,
  Check,
  Lightbulb,
  HeartPulse,
  BuildingIcon,
  LucideDatabase,
  ChevronDown,
} from "lucide-react";
import Header from "../components/Header";
import { pollutantInfo } from "../data";

export default function Problems() {
  const location = useLocation();
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPollutant, setSelectedPollutant] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [dataSource, setDataSource] = useState("last"); // "last" | "history"
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Helper function to format pollutant names
  const formatPollutantName = (name) => {
    return name.replace(/_/g, ".");
  };

  const handleAnalyzePrediction = async (
    prediction,
    label = "Last Prediction",
  ) => {
    setLoading(true);
    try {
      const pollutantData = {
        PM2_5: prediction.pollutants.PM2_5,
        NO: prediction.pollutants.NO,
        NO2: prediction.pollutants.NO2,
        NOx: prediction.pollutants.NOx,
        CO: prediction.pollutants.CO,
        SO2: prediction.pollutants.SO2,
        O3: prediction.pollutants.O3,
        date: prediction.date || new Date().toISOString().split("T")[0],
        city: label,
      };

      const response = await api.analyzeProblems(pollutantData);

      const transformedProblems = (response.data.problems || [])
        .map((problem) => ({
          pollutant: problem.pollutant,
          current_value: problem.value,
          safe_limit: problem.limit,
          severity: problem.severity,
          excess: problem.excess,
        }))
        .sort((a, b) => b.excess - a.excess);

      const transformedResult = {
        problem_pollutants: transformedProblems,
        problem_count: response.data.problem_count || 0,
        city: label,
        date: pollutantData.date,
      };

      setAnalysisResult(transformedResult);

      if (transformedProblems.length > 0) {
        setSelectedPollutant(transformedProblems[0]);
        toast.custom((t) => (
          <div
            className={`${t.visible ? "animate-enter" : "animate-leave"} flex items-center gap-2 px-4 py-3 rounded-lg`}
            style={{
              background: "hsla(45, 93%, 47%, 0.2)",
              color: "hsl(45, 93%, 47%)",
              border: "1px solid hsla(45, 93%, 47%, 0.35)",
              backdropFilter: "blur(6px)",
              fontSize: "14px",
              fontWeight: "400",
            }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{`Found ${transformedProblems.length} ${transformedProblems.length === 1 ? "pollutant" : "pollutants"} exceeding limits`}</span>
          </div>
        ));
      } else {
        setSelectedPollutant(null);
        toast.success("All pollutant levels are within safe limits");
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

  const handleAnalyze = async () => {
    if (dataSource === "last") {
      try {
        const historyResponse = await api.getHistory(1);
        const lastPrediction = historyResponse.data.predictions[0];
        if (!lastPrediction) {
          toast.error("No prediction history available");
          return;
        }
        await handleAnalyzePrediction(lastPrediction, "Last Prediction");
      } catch (error) {
        console.error("Analysis error:", error);
        toast.error(
          "Failed to fetch prediction: " +
            (error.response?.data?.detail || error.message),
        );
      }
    } else {
      if (!selectedHistoryItem) {
        toast.error("Please select a prediction from history");
        return;
      }
      await handleAnalyzePrediction(
        selectedHistoryItem,
        new Date(selectedHistoryItem.timestamp).toLocaleString(),
      );
    }
  };

  const loadHistoryList = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.getHistory();
      setHistoryList(response.data.predictions || []);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDataSourceChange = (source) => {
    setDataSource(source);
    if (source === "history" && historyList.length === 0) {
      loadHistoryList();
    }
  };

  useEffect(() => {
    if (location.state?.prediction) {
      const pred = location.state.prediction;
      setDataSource("history");
      setSelectedHistoryItem(pred);
      loadHistoryList();
      handleAnalyzePrediction(pred, new Date(pred.timestamp).toLocaleString());
    }
  }, []);

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

    const pollutants = analysisResult.problem_pollutants.map((p) =>
      formatPollutantName(p.pollutant),
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
        left: "10%",
        right: "6%",
        bottom: "10%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        name: "Pollutant",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: {
          color: "#e5e7eb",
          fontSize: 13,
          fontWeight: "bold",
        },
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
        name: "Concentration",
        nameLocation: "middle",
        nameGap: 60,
        nameTextStyle: {
          color: "#e5e7eb",
          fontSize: 13,
          fontWeight: "bold",
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Header
        title="Problem Analysis"
        description="Identify problematic pollutants and assess their health impacts"
      />

      {/* Data Source Selection */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        {/* Row 1: Title + Analyze button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Analyze Pollutants
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a data source and run problem analysis
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={
              loading || (dataSource === "history" && !selectedHistoryItem)
            }
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>Analyze</>
            )}
          </button>
        </div>

        {/* Row 2: Data source toggle */}
        <div className="pt-4 space-y-2">
          <p className="text-sm text-muted-foreground font-medium">
            Data Source
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handleDataSourceChange("last")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl hover:opacity-90 ${
                dataSource === "last"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 border border-border text-foreground hover:bg-muted"
              }`}>
              <LucideDatabase className="w-4 h-4" />
              Last Prediction
            </button>
            <button
              onClick={() => handleDataSourceChange("history")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl hover:opacity-90 ${
                dataSource === "history"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 border border-border text-foreground hover:bg-muted"
              }`}>
              <Clock className="w-4 h-4" />
              Prediction History
            </button>
          </div>
        </div>

        {/* Row 3: History picker (only when source = history) */}
        {dataSource === "history" && (
          <div className="border-t border-border pt-4">
            {loadingHistory ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Loading history...
              </div>
            ) : historyList.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No prediction history available
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {historyList.map((item, i) => {
                  const aqiInfo = getAQICategory(item.aqi);
                  const dateStr = new Date(item.timestamp).toLocaleString();
                  const isSelected =
                    selectedHistoryItem === item ||
                    selectedHistoryItem?.timestamp === item.timestamp;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedHistoryItem(item)}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-all border ${
                        isSelected
                          ? "bg-primary/10 border-primary"
                          : "bg-secondary/30 hover:bg-muted border-transparent hover:border-border"
                      }`}>
                      <div
                        className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center rounded-lg"
                        style={{ background: `${aqiInfo.color}22` }}>
                        <span
                          className="text-base font-extrabold leading-none"
                          style={{ color: aqiInfo.color }}>
                          {item.aqi.toFixed(0)}
                        </span>
                        <span
                          className="text-[9px] font-semibold uppercase tracking-widest"
                          style={{ color: aqiInfo.color }}>
                          AQI
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">
                          {aqiInfo.emoji} {aqiInfo.category}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {dateStr}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      {analysisResult && (
        <>
          {/* Context Info */}
          <div className="bg-card border border-border rounded-lg py-5 px-10">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center p-2">
                  <LucideDatabase className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Data Source
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {analysisResult.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center p-2 ${analysisResult.problem_count > 0 ? "bg-yellow-500/20" : "bg-green-500/20"}`}>
                  <AlertTriangle
                    className={`w-8 h-8 ${analysisResult.problem_count > 0 ? "text-yellow-500" : "text-green-500"}`}
                  />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Status
                  </p>
                  <p
                    className={`text-base font-semibold ${analysisResult.problem_count > 0 ? "text-yellow-500" : "text-green-500"}`}>
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
              <Check className="w-11 h-11 text-green-500 mb-2" />
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
                      <div className="flex flex-col justify-center items-center mb-4">
                        <div className="w-full max-w-xs space-y-3">
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
