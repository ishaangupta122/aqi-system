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
  Check,
  Lightbulb,
  HeartPulse,
  BuildingIcon,
  LucideDatabase,
} from "lucide-react";
import Header from "../components/Header";
import { pollutantInfo } from "../data";

export default function Problems() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPollutant, setSelectedPollutant] = useState(null);

  // Helper function to format pollutant names
  const formatPollutantName = (name) => {
    return name.replace(/_/g, ".");
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Get from last prediction
      const historyResponse = await api.getHistory(1);
      const lastPrediction = historyResponse.data.predictions[0];

      if (!lastPrediction) {
        toast.error("No prediction history available");
        setLoading(false);
        return;
      }

      const pollutantData = {
        PM2_5: lastPrediction.pollutants.PM2_5,
        NO: lastPrediction.pollutants.NO,
        NO2: lastPrediction.pollutants.NO2,
        NOx: lastPrediction.pollutants.NOx,
        CO: lastPrediction.pollutants.CO,
        SO2: lastPrediction.pollutants.SO2,
        O3: lastPrediction.pollutants.O3,
        date: lastPrediction.date || new Date().toISOString().split("T")[0],
        city: "Last Prediction",
      };

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
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Analyze Pollutants
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze pollutant levels from the last prediction
            </p>
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
              <>Analyze Last Prediction</>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {analysisResult && (
        <>
          {/* Context Info */}
          <div className="bg-card border border-border rounded-lg py-5 px-10">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <LucideDatabase className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data Source</p>
                  <p className="text-base font-semibold text-foreground">
                    {analysisResult.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${analysisResult.problem_count > 0 ? "bg-red-500/10" : "bg-green-500/10"}`}>
                  <AlertTriangle
                    className={`w-8 h-8 ${analysisResult.problem_count > 0 ? "text-red-500" : "text-green-500"}`}
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
