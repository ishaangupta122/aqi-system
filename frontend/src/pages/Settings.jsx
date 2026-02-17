import React, { useState, useEffect } from "react";
import {
  Brain,
  Target,
  BarChart3,
  Activity,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import ReactECharts from "echarts-for-react";
import Header from "../components/Header";
import { api } from "../lib/api";
import { toast } from "react-hot-toast";

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
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading model information...</p>
        </div>
      </div>
    );
  }

  if (!modelData) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Failed to load model information
          </p>
        </div>
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

  // Scatter plot option
  const scatterOption = {
    backgroundColor: "transparent",
    grid: { left: "12%", right: "8%", bottom: "15%", top: "10%" },
    xAxis: {
      type: "value",
      name: "Actual AQI",
      nameTextStyle: { color: "#9ca3af" },
      axisLabel: { color: "#9ca3af" },
      axisLine: { lineStyle: { color: "#4b5563" } },
      splitLine: {
        lineStyle: { color: "#374151", type: "dashed" },
      },
    },
    yAxis: {
      type: "value",
      name: "Predicted",
      nameTextStyle: { color: "#9ca3af" },
      axisLabel: { color: "#9ca3af" },
      axisLine: { lineStyle: { color: "#4b5563" } },
      splitLine: {
        lineStyle: { color: "#374151", type: "dashed" },
      },
    },
    series: [
      {
        type: "scatter",
        data: scatterData.map((p) => [p.actual, p.predicted]),
        symbolSize: 10,
        itemStyle: { color: "#8b5cf6" },
      },
      {
        type: "line",
        data: [
          [minVal, minVal],
          [maxVal, maxVal],
        ],
        lineStyle: { color: "#10b981", type: "dashed", width: 2 },
        symbolSize: 0,
        silent: true,
      },
    ],
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (params.seriesIndex === 0) {
          return `Actual: ${params.value[0]}<br/>Predicted: ${params.value[1]}`;
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
        title="AQI Prediction Model Overview"
        description="View model performance metrics, feature importance, and prediction accuracy"
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
            <span className="text-muted-foreground">Version</span>
            <span className="text-foreground font-medium">
              {modelInfo?.version}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Last Trained</span>
            <span className="text-foreground font-medium">
              {modelInfo?.lastTrained}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Training Records</span>
            <span className="text-foreground font-medium">
              {modelInfo?.trainingRecords?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Cities Used</span>
            <span className="text-foreground font-medium">
              {modelInfo?.citiesUsed}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Performance Metrics */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-medium text-foreground">
            Performance Metrics
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">RMSE</p>
            <p className="text-3xl font-bold text-foreground">
              {performanceMetrics?.rmse}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">MAE</p>
            <p className="text-3xl font-bold text-foreground">
              {performanceMetrics?.mae}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">R² Score</p>
            <p className="text-3xl font-bold text-green-500">
              {performanceMetrics?.r2Score}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">MAPE</p>
            <p className="text-3xl font-bold text-foreground">
              {performanceMetrics?.mape}%
            </p>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <p className="text-sm text-primary">
            Average prediction deviation is around ±{performanceMetrics?.mae}–
            {performanceMetrics?.rmse} AQI points
          </p>
        </div>
      </div>

      {/* Row 3: Prediction Behavior */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-medium text-foreground">
            Prediction Behavior
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scatter Plot - Predicted vs Actual */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Predicted vs Actual
            </h4>
            <ReactECharts option={scatterOption} style={{ height: "250px" }} />
          </div>

          {/* Residual Error Plot */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Residual Errors
            </h4>
            <ReactECharts option={residualOption} style={{ height: "250px" }} />
          </div>
        </div>
      </div>

      {/* Row 4: Random Forest Model Details */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-cyan-500" />
          <h3 className="text-lg font-medium text-foreground">
            Random Forest Model Details
          </h3>
        </div>
        <div className="space-y-4">
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground text-sm">
                Number of Trees
              </span>
              <span className="text-3xl font-bold text-cyan-500">
                {modelDetails?.numberOfTrees}
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full"
                style={{
                  width: `${(modelDetails?.numberOfTrees / 500) * 100}%`,
                }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Max Depth</p>
              <p className="text-3xl font-bold text-blue-400">
                {modelDetails?.maxDepth}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Min Samples Leaf
              </p>
              <p className="text-3xl font-bold text-purple-400">
                {modelDetails?.minSamplesLeaf}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">OOB Score</p>
              <p className="text-3xl font-bold text-green-500">
                {modelDetails?.oobScore}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Training Time
              </p>
              <p className="text-3xl font-bold text-orange-400">
                {modelDetails?.trainingTime}
              </p>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Features per Split
            </p>
            <p className="text-2xl font-bold text-indigo-400">
              √n ({modelDetails?.featuresPerSplit})
            </p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-primary">
              Random Forest uses ensemble learning with multiple decision trees
              to achieve robust predictions and avoid overfitting
            </p>
          </div>
        </div>
      </div>

      {/* Row 5: Pollutant Features Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">
          Pollutant Features
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-muted-foreground font-medium text-sm whitespace-nowrap">
                  Feature
                </th>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium text-sm whitespace-nowrap">
                  Unit
                </th>
                <th className="text-center py-2 px-2 text-muted-foreground font-medium text-sm whitespace-nowrap">
                  Used
                </th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium text-sm whitespace-nowrap">
                  Importance
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pollutantFeatures
                ?.sort((a, b) => b.used - a.used)
                .map((feature, index) => {
                  // Color code based on importance
                  let importanceColor = "text-muted-foreground";
                  if (feature.importance >= 15) {
                    importanceColor = "text-green-500 font-bold";
                  } else if (feature.importance >= 8) {
                    importanceColor = "text-yellow-500 font-semibold";
                  } else if (feature.importance > 0) {
                    importanceColor = "text-orange-500";
                  }

                  return (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 px-2 text-blue-400 font-medium whitespace-nowrap">
                        {feature.name}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">
                        {feature.unit}
                      </td>
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${feature.used ? "bg-green-500" : "bg-red-500"}`}></span>
                      </td>
                      <td
                        className={`py-3 px-2 text-right whitespace-nowrap ${importanceColor}`}>
                        {feature.importance > 0
                          ? `${feature.importance}%`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
