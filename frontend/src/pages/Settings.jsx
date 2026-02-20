import React, { useState, useEffect } from "react";
import { Brain, Target, BarChart3, Activity } from "lucide-react";
import ReactECharts from "echarts-for-react";
import Header from "../components/Header";
import { api } from "../lib/api";
import { toast } from "react-hot-toast";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function Settings() {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModelInfo();
  }, []);

  const loadModelInfo = async () => {
    try {
      setLoading(true);
      const response = await api.getModelInfo();
      console.log("Model Info Response:", response.data);
      setModelData(response.data);
    } catch (error) {
      console.error("Failed to load model info:", error);
      toast.error("Failed to load model information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Header
          title="Model Information"
          description="AQI prediction model performance metrics and configuration"
        />
        <LoadingState message="Loading model information..." />
      </div>
    );
  }

  if (!modelData) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Header
          title="Model Information"
          description="AQI prediction model performance metrics and configuration"
        />
        <ErrorState
          message="Failed to load model information"
          onRetry={() => loadModelInfo()}
        />
      </div>
    );
  }

  const {
    modelInfo,
    performanceMetrics,
    pollutantFeatures,
    modelDetails,
    predictionSamples,
  } = modelData;

  // Prepare scatter plot data
  const scatterData = predictionSamples?.scatterData || [];
  const minVal = Math.min(
    ...scatterData.map((p) => Math.min(p.actual, p.predicted)),
  );
  const maxVal = Math.max(
    ...scatterData.map((p) => Math.max(p.actual, p.predicted)),
  );

  // Scatter plot option — matches reference style
  const scatterOption = {
    backgroundColor: "transparent",
    title: {
      text: "Actual vs Predicted AQI with Prediction Line",
      textStyle: { color: "#d1d5db", fontSize: 16, fontWeight: "500" },
      left: "center",
      top: 8,
    },
    grid: { left: "10%", right: "5%", bottom: "12%", top: "14%" },
    xAxis: {
      type: "value",
      name: "Actual AQI",
      nameLocation: "middle",
      nameGap: 28,
      nameTextStyle: { color: "#9ca3af", fontSize: 12 },
      axisLabel: { color: "#9ca3af" },
      axisLine: { lineStyle: { color: "#4b5563" } },
      splitLine: { lineStyle: { color: "#374151" } },
    },
    yAxis: {
      type: "value",
      name: "Predicted AQI",
      nameLocation: "middle",
      nameGap: 40,
      nameTextStyle: { color: "#9ca3af", fontSize: 12 },
      axisLabel: { color: "#9ca3af" },
      axisLine: { lineStyle: { color: "#4b5563" } },
      splitLine: { lineStyle: { color: "#374151" } },
    },
    series: [
      {
        name: "Predictions",
        type: "scatter",
        data: scatterData.map((p) => [p.actual, p.predicted]),
        symbolSize: 7,
        itemStyle: { color: "#4d9de0", opacity: 0.65 },
      },
      {
        name: "Perfect fit",
        type: "line",
        data: [
          [minVal, minVal],
          [maxVal, maxVal],
        ],
        lineStyle: { color: "#ef4444", width: 2 },
        symbolSize: 0,
        silent: true,
      },
    ],
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(10,15,25,0.92)",
      borderColor: "#374151",
      textStyle: { color: "#f9fafb", fontSize: 12 },
      formatter: (params) => {
        if (params.seriesIndex === 0) {
          const diff = (params.value[1] - params.value[0]).toFixed(1);
          const sign = diff >= 0 ? "+" : "";
          return `<b>Actual:</b> ${params.value[0]}<br/><b>Predicted:</b> ${params.value[1]}<br/><b>Error:</b> ${sign}${diff}`;
        }
        return "";
      },
    },
  };

  // Residual errors option
  const residualData = predictionSamples?.residualErrors || [];
  const residualOption = {
    backgroundColor: "transparent",
    grid: { left: "12%", right: "8%", bottom: "15%", top: "10%" },
    xAxis: {
      type: "category",
      data: residualData.map((r) => r.sample),
      axisLabel: { color: "#9ca3af", fontSize: 10 },
      axisLine: { lineStyle: { color: "#4b5563" } },
    },
    yAxis: {
      type: "value",
      name: "Error",
      nameTextStyle: { color: "#9ca3af" },
      axisLabel: { color: "#9ca3af" },
      axisLine: { lineStyle: { color: "#4b5563" } },
      splitLine: {
        lineStyle: { color: "#374151", type: "dashed" },
      },
    },
    series: [
      {
        type: "bar",
        data: residualData.map((r) => r.error),
        itemStyle: {
          color: (params) => (params.value > 0 ? "#ef4444" : "#10b981"),
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: (params) => `Error: ${params[0].value} AQI`,
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Header
        title="Model Details"
        description="Model performance metrics and prediction accuracy"
      />

      {/* Row 1: Model Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-medium text-foreground">
            Model Information
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Model Name</span>
            <span className="text-foreground font-medium">
              {modelInfo?.modelName}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Algorithm</span>
            <span className="text-foreground font-medium">
              {modelInfo?.algorithm}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Problem Type</span>
            <span className="text-foreground font-medium">
              {modelInfo?.problemType}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Target Variable</span>
            <span className="text-foreground font-medium">
              {modelInfo?.targetVariable}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Training Records</span>
            <span className="text-foreground font-medium">
              {modelInfo?.trainingRecords?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Testing Records</span>
            <span className="text-foreground font-medium">
              {modelInfo?.testingRecords?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Cities Used</span>
            <span className="text-foreground font-medium">
              {modelInfo?.citiesUsed}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Columns Used</span>
            <span className="text-foreground font-medium">
              {modelInfo?.columnsUsed}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Performance Metrics */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-medium text-foreground">
            Performance Metrics
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">R² Score</p>
            <p className="text-3xl font-bold text-green-500">
              {performanceMetrics?.r2Score}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">MAE</p>
            <p className="text-3xl font-bold text-foreground">
              {performanceMetrics?.mae}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">MSE</p>
            <p className="text-3xl font-bold text-foreground">
              {performanceMetrics?.mse}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">RMSE</p>
            <p className="text-3xl font-bold text-foreground">
              {performanceMetrics?.rmse}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Row 3: Random Forest Model */}
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-cyan-500" />
          <h3 className="text-lg font-medium text-foreground">
            Random Forest Model Details
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Estimators",
              value: modelDetails?.numberOfTrees,
              color: "text-cyan-500",
            },
            {
              label: "Random State",
              value: modelDetails?.randomState,
              color: "text-foreground",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-secondary/50 border border-border rounded-lg px-4 py-3 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
              <span className={`text-3xl font-bold ${item.color}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Row 4: Prediction Behavior */}
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-medium text-foreground">
            Prediction Behavior
          </h3>
        </div>

        <div className="">
          <ReactECharts option={scatterOption} style={{ height: "420px" }} />
        </div>
      </div>
    </div>
  );
}
