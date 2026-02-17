import { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import {
  Zap,
  TrendingDown,
  Calendar,
  CheckCircle,
  FileText,
  Target,
  ChevronDown,
  IndianRupee,
  LeafyGreen,
  Rocket,
  Lightbulb,
} from "lucide-react";
import Header from "../components/Header";
import { policyData } from "../data";

export default function Solutions() {
  const [scenarios, setScenarios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState("moderate");
  const [activeTab, setActiveTab] = useState("interventions");
  const [expandedPolicy, setExpandedPolicy] = useState(
    new Set(["transportation"]),
  );

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const response = await api.getSolutionScenarios();
      console.log("Solutions API response:", response.data);

      // Transform API data to expected format
      const apiData = response.data;
      const transformedScenarios = {
        moderate: {
          name: "Moderate Intervention",
          description:
            "Practical short-term measures with high feasibility and quick impact",
          expected_reduction: 20,
          timeline_months: 9,
          cost: apiData.moderate?.cost || "₹500-1000 Crores",
          difficulty: apiData.moderate?.feasibility || "HIGH",
          icon: LeafyGreen,
          actions: apiData.moderate?.actions || [],
          projection: {
            pm25: [150, 140, 125, 115, 105, 95],
            pm10: [250, 235, 210, 195, 180, 165],
            no2: [80, 75, 68, 62, 58, 54],
          },
        },
        aggressive: {
          name: "Aggressive Intervention",
          description:
            "Comprehensive medium-term strategy requiring significant investment",
          expected_reduction: 50,
          timeline_months: 18,
          cost: apiData.aggressive?.cost || "₹2000-5000 Crores",
          difficulty: apiData.aggressive?.feasibility || "MEDIUM",
          icon: Rocket,
          actions: apiData.aggressive?.actions || [],
          projection: {
            pm25: [150, 130, 105, 85, 70, 55],
            pm10: [250, 220, 180, 150, 125, 100],
            no2: [80, 70, 55, 45, 38, 32],
          },
        },
        transformative: {
          name: "Transformative Change",
          description:
            "Complete system overhaul for long-term sustainable air quality",
          expected_reduction: 100,
          timeline_months: 36,
          cost: apiData.transformative?.cost || "₹10,000-20,000 Crores",
          difficulty: apiData.transformative?.feasibility || "CHALLENGING",
          icon: Lightbulb,
          actions: apiData.transformative?.actions || [],
          projection: {
            pm25: [150, 120, 85, 60, 40, 25],
            pm10: [250, 200, 145, 105, 75, 50],
            no2: [80, 65, 45, 32, 22, 15],
          },
        },
      };

      setScenarios(transformedScenarios);
    } catch (error) {
      console.error("Solutions error:", error);
      toast.error("Failed to load solution scenarios");
    } finally {
      setLoading(false);
    }
  };

  const getImpactChartOption = () => {
    if (!scenarios) return {};

    const data = Object.entries(scenarios).map(([key, scenario]) => ({
      name: scenario.name,
      reduction: scenario.expected_reduction,
      timeline: scenario.timeline_months,
    }));

    return {
      backgroundColor: "transparent",
      title: {
        text: "Scenario Comparison",
        textStyle: { color: "#e5e7eb", fontSize: 16, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      legend: {
        data: ["Reduction %", "Timeline (months)"],
        textStyle: { color: "#9ca3af" },
        top: "12%",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "25%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.name),
        axisLabel: { color: "#9ca3af" },
        axisLine: { lineStyle: { color: "#4b5563" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#9ca3af" },
        axisLine: { lineStyle: { color: "#4b5563" } },
        splitLine: { lineStyle: { color: "#374151", type: "dashed" } },
      },
      series: [
        {
          name: "Reduction %",
          type: "bar",
          data: data.map((d) => d.reduction),
          itemStyle: { color: "#10b981" },
        },
        {
          name: "Timeline (months)",
          type: "bar",
          data: data.map((d) => d.timeline),
          itemStyle: { color: "#3b82f6" },
        },
      ],
    };
  };

  const getBudgetAllocationChart = () => {
    const categories = Object.values(policyData);
    const total = categories.reduce((sum, cat) => sum + cat.budget, 0);

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#333",
        textStyle: { color: "#fff" },
        formatter: (params) => {
          return `${params.name}<br/>₹${params.value} Cr (${params.percent}%)`;
        },
      },
      legend: {
        orient: "vertical",
        right: "10%",
        top: "center",
        textStyle: { color: "#9ca3af" },
        data: categories.map((cat) => cat.name),
      },
      series: [
        {
          name: "Budget",
          type: "pie",
          radius: ["30%", "70%"],
          center: ["35%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#1f2937",
            borderWidth: 2,
          },
          label: {
            show: true,
            position: "inside",
            formatter: "{d}%\n₹{c} Cr",
            color: "#1f2937",
            fontWeight: "bold",
            fontSize: 14,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
          },
          data: categories.map((cat) => ({
            name: cat.name,
            value: cat.budget,
            itemStyle: { color: cat.color },
          })),
        },
      ],
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Header
        title="Solutions & Planning"
        description="Explore intervention scenarios, policy recommendations, and action plans"
      />

      {/* Tab Navigation */}
      <div className="bg-card border border-border rounded-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("interventions")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "interventions"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-secondary/50"
            }`}>
            <Zap className="w-5 h-5" />
            Intervention Scenarios
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "policies"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-secondary/50"
            }`}>
            <FileText className="w-5 h-5" />
            Policy Recommendations
          </button>
        </div>
      </div>

      {loading && activeTab === "interventions" ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading scenarios...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Intervention Scenarios Tab */}
          {activeTab === "interventions" && (
            <>
              {/* Scenario Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarios &&
                  Object.entries(scenarios).map(([key, scenario]) => (
                    <ScenarioCard
                      key={key}
                      scenario={scenario}
                      isSelected={selectedScenario === key}
                      onClick={() => setSelectedScenario(key)}
                    />
                  ))}
              </div>

              {/* Scenario Details */}
              {scenarios && scenarios[selectedScenario] && (
                <>
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-2xl font-medium text-foreground mb-2">
                      {scenarios[selectedScenario].name}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {scenarios[selectedScenario].description}
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <MetricCard
                        icon={<TrendingDown className="w-6 h-6" />}
                        label="Expected Reduction"
                        value={`${scenarios[selectedScenario].expected_reduction}%`}
                        color="text-green-500"
                      />
                      <MetricCard
                        icon={<Calendar className="w-6 h-6" />}
                        label="Timeline"
                        value={`${scenarios[selectedScenario].timeline_months} months`}
                        color="text-blue-500"
                      />
                      <MetricCard
                        icon={<IndianRupee className="w-6 h-6" />}
                        label="Estimated Cost"
                        value={scenarios[selectedScenario].cost}
                        color="text-yellow-500"
                      />
                      <MetricCard
                        icon={<Zap className="w-6 h-6" />}
                        label="Feasibility"
                        value={scenarios[selectedScenario].difficulty}
                        color="text-purple-500"
                      />
                    </div>

                    {/* Actions */}
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Key Actions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {scenarios[selectedScenario].actions.map(
                          (action, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-green-500 mt-0.5">✓</span>
                              <span>{action}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Comparison Chart */}
              {scenarios && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <ReactECharts
                    option={getImpactChartOption()}
                    style={{ height: "400px", width: "100%" }}
                    opts={{ renderer: "canvas" }}
                  />
                </div>
              )}
            </>
          )}

          {/* Policy Recommendations Tab */}
          {activeTab === "policies" && (
            <>
              {/* Budget Allocation Chart */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-2xl font-medium text-foreground">
                  Recommended Budget Allocation (5-Year)
                </h2>
                <ReactECharts
                  option={getBudgetAllocationChart()}
                  style={{ height: "450px", width: "100%" }}
                  opts={{ renderer: "canvas" }}
                />
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-lg text-center font-medium text-foreground">
                    Total 5-Year Budget:{" "}
                    <span className="text-primary">
                      ₹
                      {Object.values(policyData)
                        .reduce((sum, cat) => sum + cat.budget, 0)
                        .toLocaleString()}{" "}
                      Crores
                    </span>
                  </p>
                </div>
              </div>

              {/* Policy Categories */}
              <div className="grid grid-cols-1 gap-6">
                {Object.entries(policyData).map(([key, policy]) => {
                  const Icon = policy.icon;

                  return (
                    <div
                      key={key}
                      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-4">
                        {/* Header Section - Clickable */}
                        <div
                          className="flex items-center gap-4 cursor-pointer"
                          onClick={() => {
                            const newExpanded = new Set(expandedPolicy);
                            if (newExpanded.has(key)) {
                              newExpanded.delete(key);
                            } else {
                              newExpanded.add(key);
                            }
                            setExpandedPolicy(newExpanded);
                          }}>
                          <Icon className="w-10 h-10 text-primary bg-primary/10 p-2 rounded-lg" />

                          <div className="flex-1">
                            <h3 className="text-2xl font-medium text-foreground">
                              {policy.name}
                            </h3>
                          </div>

                          <ChevronDown
                            className={`w-6 h-6 text-foreground/60 transition-transform duration-200 ${
                              expandedPolicy.has(key) ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        {/* Expanded Content */}
                        {expandedPolicy.has(key) && (
                          <>
                            {/* Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                              {/* Priority */}
                              <div className="bg-secondary/50 rounded-lg p-4 border-l-4 border-red-500">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                                  Priority Level
                                </p>
                                <span
                                  className={`text-lg font-medium ${
                                    policy.priority === "CRITICAL"
                                      ? "text-red-500"
                                      : policy.priority === "HIGH"
                                        ? "text-orange-500"
                                        : "text-yellow-500"
                                  }`}>
                                  {policy.priority}
                                </span>
                              </div>

                              {/* Budget */}
                              <div className="bg-secondary/50 rounded-lg p-4 border-l-4 border-blue-500">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                                  5-Year Budget
                                </p>
                                <span className="text-xl font-medium text-blue-500">
                                  ₹ {policy.budget.toLocaleString()} Cr
                                </span>
                              </div>

                              {/* Impact */}
                              <div className="bg-secondary/50 rounded-lg p-4 border-l-4 border-green-500">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                                  Expected Impact
                                </p>
                                <div className="flex items-center gap-2">
                                  <TrendingDown className="w-5 h-5 text-green-500" />
                                  <span className="text-lg font-medium text-green-500">
                                    {policy.expectedImpact}
                                  </span>
                                  <span className="text-xs font-medium text-green-500 mt-1">
                                    AQI Reduction
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Plans */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Immediate */}
                              <div className="bg-secondary/50 rounded-lg p-4">
                                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-orange-500" />
                                  Immediate Actions (0–12 months)
                                </h4>
                                <ul className="space-y-2">
                                  {policy.immediate.map((action, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <span className="text-orange-500 mt-0.5">
                                        ▸
                                      </span>
                                      <span>{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Long-term */}
                              <div className="bg-secondary/50 rounded-lg p-4">
                                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                  <Target className="w-4 h-4 text-blue-500" />
                                  Long-term Actions (1–5 years)
                                </h4>
                                <ul className="space-y-2">
                                  {policy.longTerm.map((action, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <span className="text-blue-500 mt-0.5">
                                        ▸
                                      </span>
                                      <span>{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ScenarioCard({ scenario, isSelected, onClick }) {
  const Icon = scenario.icon;

  return (
    <div
      onClick={onClick}
      className={`bg-card border rounded-lg p-6 cursor-pointer transition-all hover:border-primary ${
        isSelected
          ? "bg-primary/10 border-primary hover:border-primary shadow-lg"
          : "border-border"
      }`}>
      <div className="mb-3">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className={`text-lg font-medium text-foreground mb-2`}>
        {scenario.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {scenario.description}
      </p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-green-500 font-bold">
          - {scenario.expected_reduction}%
        </span>
        <span className="text-yellow-500 font-medium">
          {scenario.timeline_months} months
        </span>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-4">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-medium text-foreground">{value}</p>
    </div>
  );
}
