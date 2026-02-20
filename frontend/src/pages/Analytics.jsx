import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { Activity, Calendar, BarChart4 } from "lucide-react";
import Header from "../components/Header";
import FilterDropdown from "../components/FilterDropdown";
import { months, getAQICategory } from "../lib/constants";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorAnalytics, setErrorAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState("trends");

  const [trendFilter, setTrendFilter] = useState("all_time");
  const [frequencyFilter, setFrequencyFilter] = useState("all_time");
  const [cityComparisonFilter, setCityComparisonFilter] = useState("all_time");
  const [seasonalFilter, setSeasonalFilter] = useState("all_time");
  const [monthlyFilter, setMonthlyFilter] = useState("all_time");
  const [trendData, setTrendData] = useState(null);
  const [frequencyData, setFrequencyData] = useState(null);
  const [cityComparisonData, setCityComparisonData] = useState(null);
  const [seasonalData, setSeasonalData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    loadAnalytics();
    loadTrendData();
    loadFrequencyData();
    loadCityComparison();
    loadSeasonalData();
    loadMonthlyData();
  }, []);

  // Load trend data when filter changes
  useEffect(() => {
    if (!loading) {
      loadTrendData();
    }
  }, [trendFilter]);

  // Load frequency data when filter changes
  useEffect(() => {
    if (!loading) {
      loadFrequencyData();
    }
  }, [frequencyFilter]);

  // Load city comparison when filter changes
  useEffect(() => {
    if (!loading) {
      loadCityComparison();
    }
  }, [cityComparisonFilter]);

  // Load seasonal data when filter changes
  useEffect(() => {
    if (!loading) {
      loadSeasonalData();
    }
  }, [seasonalFilter]);

  // Load monthly data when filter changes
  useEffect(() => {
    if (!loading) {
      loadMonthlyData();
    }
  }, [monthlyFilter]);

  // Load frequency data when filter changes
  useEffect(() => {
    if (!loading) {
      loadFrequencyData();
    }
  }, [frequencyFilter]);

  const loadTrendData = async () => {
    try {
      const year = trendFilter === "all_time" ? null : parseInt(trendFilter);
      const response = await api.getAQITrend(year);
      setTrendData(response.data);

      // Set available years from first response
      if (response.data.available_years && availableYears.length === 0) {
        setAvailableYears(response.data.available_years);
      }
    } catch (error) {
      console.error("Failed to load trend data:", error);
      toast.error("Failed to load trend data");
    }
  };

  const loadFrequencyData = async () => {
    try {
      const year =
        frequencyFilter === "all_time" ? null : parseInt(frequencyFilter);
      const response = await api.getAQIFrequency(year, 50);
      setFrequencyData(response.data);

      // Set available years from first response
      if (response.data.available_years && availableYears.length === 0) {
        setAvailableYears(response.data.available_years);
      }
    } catch (error) {
      console.error("Failed to load frequency data:", error);
      toast.error("Failed to load frequency data");
    }
  };

  const loadCityComparison = async () => {
    try {
      const year =
        cityComparisonFilter === "all_time"
          ? null
          : parseInt(cityComparisonFilter);
      const response = await api.getCityComparison(year, 100);
      setCityComparisonData(response.data);

      // Set available years from first response
      if (response.data.available_years && availableYears.length === 0) {
        setAvailableYears(response.data.available_years);
      }
    } catch (error) {
      console.error("Failed to load city comparison data:", error);
      toast.error("Failed to load city comparison data");
    }
  };

  const loadSeasonalData = async () => {
    try {
      const year =
        seasonalFilter === "all_time" ? null : parseInt(seasonalFilter);
      const response = await api.getSeasonalData(year);
      setSeasonalData(response.data);

      // Set available years from first response
      if (response.data.available_years && availableYears.length === 0) {
        setAvailableYears(response.data.available_years);
      }
    } catch (error) {
      console.error("Failed to load seasonal data:", error);
      toast.error("Failed to load seasonal data");
    }
  };

  const loadMonthlyData = async () => {
    try {
      const year =
        monthlyFilter === "all_time" ? null : parseInt(monthlyFilter);
      const response = await api.getSeasonalData(year);
      setMonthlyData(response.data);

      // Set available years from first response
      if (response.data.available_years && availableYears.length === 0) {
        setAvailableYears(response.data.available_years);
      }
    } catch (error) {
      console.error("Failed to load monthly data:", error);
      toast.error("Failed to load monthly data");
    }
  };

  const loadAnalytics = async () => {
    try {
      const [analyticsResponse, citiesResponse] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getCities(),
      ]);

      console.log("Analytics API response:", analyticsResponse.data);
      console.log("Cities API response:", citiesResponse.data);

      // Transform API data to expected format
      const apiData = analyticsResponse.data;
      const citiesData = citiesResponse.data;

      // Get all cities with their stats
      const allCityStats = {};
      const cityList = Array.isArray(citiesData)
        ? citiesData
        : citiesData.cities || [];

      // Fetch time series data from the first city for trends
      let timeSeriesData = null;
      if (cityList.length > 0) {
        try {
          const timeSeriesResponse = await api.getCityTimeseries(
            cityList[0],
            2000,
          );
          timeSeriesData = timeSeriesResponse.data;
          console.log("Time series data:", timeSeriesData);
        } catch (err) {
          console.error(`Failed to fetch time series data:`, err);
        }

        // Fetch stats for each city
        for (const city of cityList.slice(0, 30)) {
          // Limit to 30 cities to avoid too many requests
          try {
            const cityStatsResponse = await api.getCityStats(city);
            if (cityStatsResponse.data && cityStatsResponse.data.avg_aqi) {
              allCityStats[city] = { avg_aqi: cityStatsResponse.data.avg_aqi };
            }
          } catch (err) {
            console.error(`Failed to fetch stats for ${city}:`, err);
          }
        }
      }

      const transformedData = {
        total_records: apiData.total_records,
        overall_avg_aqi: apiData.avg_aqi,
        max_aqi: apiData.max_aqi,
        min_aqi: apiData.min_aqi,
        date_range: "Historical Data",
        // Use all city stats if available, otherwise fall back to top_polluted_cities
        city_stats:
          Object.keys(allCityStats).length > 0
            ? allCityStats
            : Object.fromEntries(
                Object.entries(apiData.top_polluted_cities || {}).map(
                  ([city, aqi]) => [city, { avg_aqi: aqi }],
                ),
              ),
        // Transform monthly_average to monthly_trends format
        monthly_trends: apiData.monthly_average || {},
        category_distribution: apiData.category_distribution || {},
        // Add time series data if available
        time_series: timeSeriesData,
      };

      console.log("Transformed analytics data:", transformedData);
      console.log(
        "Total cities loaded:",
        Object.keys(transformedData.city_stats).length,
      );
      setAnalyticsData(transformedData);
    } catch (error) {
      toast.error("Failed to load analytics");
      console.error("Analytics error:", error);
      setErrorAnalytics(true);
    } finally {
      setLoading(false);
    }
  };

  const getCityComparisonOption = () => {
    if (
      !cityComparisonData ||
      !cityComparisonData.cities ||
      cityComparisonData.cities.length === 0
    ) {
      return {
        backgroundColor: "transparent",
        title: {
          text: "Top Cities AQI - No Data Available",
          textStyle: { color: "#e5e7eb", fontSize: 16, fontWeight: "bold" },
        },
        grid: {
          left: "8%",
          right: "18%",
          bottom: 80,
          top: 80,
          containLabel: true,
        },
        series: [{ type: "bar", data: [] }],
      };
    }

    const cities = cityComparisonData.cities;
    const avgAqi = cityComparisonData.avg_aqi;
    const categories = cityComparisonData.categories;

    const totalCities = cityComparisonData.count || cities.length;

    const titleText =
      cityComparisonFilter === "all_time"
        ? `Top Cities AQI {filter|- All Time (Yearly Average)} {count|[${totalCities} cities]}`
        : `Top Cities AQI {filter|- ${cityComparisonFilter} (Monthly Average)} {count|[${totalCities} cities]}`;

    return {
      backgroundColor: "transparent",
      title: {
        text: titleText,
        textStyle: {
          color: "#e5e7eb",
          fontSize: 16,
          fontWeight: "bold",
          rich: {
            count: {
              color: "hsl(168, 76%, 42%)",
              fontWeight: "bold",
            },
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
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(10, 15, 25, 0.92)",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 0,
        formatter: (params) => {
          const idx = params[0].dataIndex;
          const aqi = avgAqi[idx];
          const cat = getAQICategory(aqi);
          const rank = idx + 1;
          return `
            <div style="padding:12px 16px; min-width:200px; font-family:inherit;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; border-bottom:1px solid #374151; padding-bottom:8px;">
                <span style="font-size:18px;">${cat.emoji}</span>
                <span style="color:#f9fafb; font-weight:700; font-size:14px;">${cities[idx]}</span>
                <span style="margin-left:auto; background:#1f2937; color:#9ca3af; font-size:11px; padding:2px 6px; border-radius:4px;">#${rank}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="color:#9ca3af; font-size:12px;">Avg AQI</span>
                <span style="color:${cat.color}; font-weight:700; font-size:16px;">${aqi.toFixed(1)}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="color:#9ca3af; font-size:12px;">Category</span>
                <span style="color:${cat.color}; font-weight:600; font-size:12px;">${cat.category}</span>
              </div>
              <div style="background:#1f2937; border-radius:6px; padding:6px 8px; font-size:11px; color:#d1d5db; border-left: 3px solid ${cat.color};">
                ${cat.description}
              </div>
            </div>`;
        },
      },
      grid: {
        left: "8%",
        right: "18%",
        bottom: 80,
        top: 80,
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: "Avg AQI",
        nameLocation: "middle",
        nameGap: 40,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        axisLabel: { color: "#9ca3af" },
        axisLine: { lineStyle: { color: "#4b5563" } },
        splitLine: { lineStyle: { color: "#374151", type: "dashed" } },
      },
      yAxis: {
        type: "category",
        name: "City",
        nameLocation: "middle",
        nameGap: 100,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        data: cities,
        axisLabel: { color: "#9ca3af", fontSize: 11 },
        axisLine: { lineStyle: { color: "#4b5563" } },
        inverse: true,
      },
      series: [
        {
          type: "bar",
          data: avgAqi.map((aqi, idx) => ({
            value: parseFloat(aqi.toFixed(2)),
            itemStyle: { color: getAQICategory(aqi).color },
          })),
          label: {
            show: true,
            position: "right",
            color: "#e5e7eb",
            formatter: "{c}",
          },
        },
      ],
    };
  };

  const getAQITimeSeriesOption = () => {
    // Use data from backend API
    if (!trendData || !trendData.labels || !trendData.values) {
      return {
        backgroundColor: "transparent",
        title: {
          text: "AQI Trend",
          textStyle: { color: "#e5e7eb", fontSize: 16, fontWeight: "bold" },
        },
        series: [{ type: "line", data: [] }],
      };
    }

    const labels = trendData.labels;
    const values = trendData.values;

    return {
      backgroundColor: "transparent",
      title: {
        text:
          trendData.filter === "all_time"
            ? "AQI Trend {filter|- All Time (Yearly Average)}"
            : `AQI Trend {filter|- ${trendData.year} (Monthly Average)}`,
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
          const aqi = params[0].value;
          if (aqi == null) return "";
          const cat = getAQICategory(aqi);
          const label = params[0].name;
          const prevVal = idx > 0 ? trendData.values[idx - 1] : null;
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
        bottom: "12%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        name: trendData.filter === "all_time" ? "Year" : "Month",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        data: labels,
        axisLabel: {
          color: "#9ca3af",
          fontSize: 11,
          interval: 0,
        },
        axisLine: { lineStyle: { color: "#4b5563" } },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: "value",
        name: "Average AQI",
        nameLocation: "middle",
        nameGap: 50,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        axisLabel: { color: "#9ca3af" },
        axisLine: { lineStyle: { color: "#4b5563" } },
        splitLine: { lineStyle: { color: "#374151", type: "dashed" } },
      },
      series: [
        {
          name: "AQI",
          type: "line",
          data: values,
          lineStyle: { color: "#6ee7b7", width: 3 },
          itemStyle: { color: "#6ee7b7" },
          symbol: "circle",
          symbolSize: 8,
          smooth: true,
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
        },
      ],
    };
  };

  const getAQIPieChartOption = () => {
    if (!frequencyData || !frequencyData.labels || !frequencyData.frequencies) {
      return {
        backgroundColor: "transparent",
        series: [{ type: "pie", data: [] }],
      };
    }

    // Group data by AQI categories (Good+Satisfactory, Moderate, Poor+VeryPoor, Severe)
    const categories = {
      Good: { name: "Good", range: "0-100", color: "#22c55e", frequency: 0 },
      Moderate: {
        name: "Moderate",
        range: "101-200",
        color: "#eab308",
        frequency: 0,
      },
      Poor: { name: "Poor", range: "201-400", color: "#f97316", frequency: 0 },
      Severe: { name: "Severe", range: "400+", color: "#ef4444", frequency: 0 },
    };

    frequencyData.labels.forEach((label, idx) => {
      const frequency = frequencyData.frequencies[idx];
      const rangeStart = idx * frequencyData.bin_size;

      if (rangeStart >= 400) {
        categories.Severe.frequency += frequency;
      } else if (rangeStart >= 200) {
        categories.Poor.frequency += frequency;
      } else if (rangeStart >= 100) {
        categories.Moderate.frequency += frequency;
      } else {
        categories.Good.frequency += frequency;
      }
    });

    // Filter out categories with zero frequency and prepare data
    const pieData = Object.values(categories)
      .filter((cat) => cat.frequency > 0)
      .map((cat) => ({
        name: cat.name,
        range: cat.range,
        value: cat.frequency,
        itemStyle: { color: cat.color },
      }));

    const totalRecords = pieData.reduce((sum, item) => sum + item.value, 0);

    const distTitle =
      frequencyFilter === "all_time"
        ? "AQI Category Distribution {filter|- All Time (Yearly Average)}"
        : `AQI Category Distribution {filter|- ${frequencyFilter} (Monthly Average)}`;

    return {
      backgroundColor: "transparent",
      title: [
        {
          text: distTitle,
          left: "center",
          top: "2%",
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
        {
          text: `Total Records: ${totalRecords.toLocaleString()}`,
          left: "center",
          top: "7%",
          textStyle: { color: "#9ca3af", fontSize: 13 },
        },
      ],
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(10, 15, 25, 0.92)",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 0,
        formatter: (params) => {
          const catInfo = getAQICategory(
            params.name === "Good"
              ? 30
              : params.name === "Moderate"
                ? 150
                : params.name === "Poor"
                  ? 280
                  : 450,
          );
          const pct = params.percent.toFixed(1);
          return `
            <div style="padding:12px 16px; min-width:200px; font-family:inherit;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; border-bottom:1px solid #374151; padding-bottom:8px;">
                <span style="font-size:18px;">${catInfo.emoji}</span>
                <span style="color:#f9fafb; font-weight:700; font-size:14px;">${params.name}</span>
                <span style="margin-left:auto; color:#9ca3af; font-size:11px;">${params.data.range}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="color:#9ca3af; font-size:12px;">Records</span>
                <span style="color:#f9fafb; font-weight:700; font-size:13px;">${params.value.toLocaleString()}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="color:#9ca3af; font-size:12px;">Share</span>
                <span style="color:${params.color}; font-weight:700; font-size:13px;">${pct}%</span>
              </div>
              <div style="background:#1f2937; border-radius:6px; padding:6px 8px; font-size:11px; color:#d1d5db; border-left:3px solid ${params.color};">
                ${catInfo.description}
              </div>
            </div>`;
        },
      },
      legend: {
        orient: "vertical",
        right: "10%",
        top: "center",
        textStyle: { color: "#9ca3af", fontSize: 12 },
        formatter: (name) => {
          const item = pieData.find((d) => d.name === name);
          return item ? `${name} (${item.range})` : name;
        },
      },
      series: [
        {
          name: "AQI Category",
          type: "pie",
          radius: ["0%", "60%"],
          center: ["35%", "55%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#1f2937",
            borderWidth: 2,
          },
          label: {
            show: true,
            position: "outside",
            formatter: (params) => {
              const percentage = ((params.value / totalRecords) * 100).toFixed(
                1,
              );
              return `{name|${params.name}}\n{range|${params.data.range}}\n{records|${params.value.toLocaleString()} records (${percentage}%)}`;
            },
            rich: {
              name: {
                color: "#e5e7eb",
                fontSize: 14,
                fontWeight: "bold",
                lineHeight: 22,
              },
              range: {
                color: "#a3a3a3",
                fontSize: 12,
                lineHeight: 18,
              },
              records: {
                color: "#9ca3af",
                fontSize: 11,
                lineHeight: 16,
              },
            },
          },
          labelLine: {
            show: true,
            length: 35,
            length2: 30,
            lineStyle: {
              color: "#6b7280",
              width: 2,
            },
          },
          emphasis: {
            scale: true,
            scaleSize: 5,
            label: {
              show: true,
              fontSize: 15,
              fontWeight: "bold",
            },
            labelLine: {
              show: true,
              lineStyle: {
                width: 3,
                color: "#9ca3af",
              },
            },
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          data: pieData.map((item, index) => ({
            name: item.name,
            value: item.value,
            range: item.range,
            itemStyle: item.itemStyle,
            label: {
              show: true,
              formatter: (params) => {
                const percentage = (
                  (params.value / totalRecords) *
                  100
                ).toFixed(1);
                return `{name|${params.name}}\n{range|${params.data.range}}\n{records|${params.value.toLocaleString()} records (${percentage}%)}`;
              },
              rich: {
                name: {
                  color: "#e5e7eb",
                  fontSize: 16,
                  fontWeight: "bold",
                  lineHeight: 22,
                },
                range: {
                  color: "#a3a3a3",
                  fontSize: 14,
                  lineHeight: 18,
                },
                records: {
                  color: "#9ca3af",
                  fontSize: 14,
                  lineHeight: 16,
                },
              },
            },
            labelLine: {
              show: true,
              length: 35,
              length2: 30,
              lineStyle: {
                color: "#6b7280",
                width: 2,
              },
            },
          })),
        },
      ],
    };
  };

  const getSeasonalPieChartOption = () => {
    if (!seasonalData?.seasonal || seasonalData.seasonal.length === 0) {
      return {
        backgroundColor: "transparent",
        series: [{ type: "pie", data: [] }],
      };
    }

    const pieData = seasonalData.seasonal.map((s) => ({
      name: s.season,
      value: parseFloat(s.avg_aqi.toFixed(2)),
      category: s.category,
      itemStyle: { color: getAQICategory(s.avg_aqi).color },
    }));

    const totalAQI = pieData.reduce((sum, item) => sum + item.value, 0);
    const avgAQI = (totalAQI / pieData.length).toFixed(2);

    const seasonalTitle =
      seasonalFilter === "all_time"
        ? "AQI by Season {filter|- All Time (Yearly Average)}"
        : `AQI by Season {filter|- ${seasonalFilter} (Monthly Average)}`;

    return {
      backgroundColor: "transparent",
      title: [
        {
          text: seasonalTitle,
          left: "center",
          top: "2%",
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
        {
          text: `Average AQI: ${avgAQI}`,
          left: "center",
          top: "7%",
          textStyle: { color: "#9ca3af", fontSize: 13 },
        },
      ],
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(10, 15, 25, 0.92)",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 0,
        formatter: (params) => {
          const cat = getAQICategory(params.value);
          const pct = params.percent.toFixed(1);
          return `
            <div style="padding:12px 16px; min-width:200px; font-family:inherit;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; border-bottom:1px solid #374151; padding-bottom:8px;">
                <span style="font-size:18px;">${cat.emoji}</span>
                <span style="color:#f9fafb; font-weight:700; font-size:14px;">${params.name}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="color:#9ca3af; font-size:12px;">Avg AQI</span>
                <span style="color:${cat.color}; font-weight:700; font-size:16px;">${params.value}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="color:#9ca3af; font-size:12px;">Category</span>
                <span style="color:${cat.color}; font-weight:600; font-size:12px;">${cat.category}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="color:#9ca3af; font-size:12px;">Share</span>
                <span style="color:#f9fafb; font-weight:600; font-size:12px;">${pct}%</span>
              </div>
              <div style="background:#1f2937; border-radius:6px; padding:6px 8px; font-size:11px; color:#d1d5db; border-left:3px solid ${cat.color};">
                ${cat.description}
              </div>
            </div>`;
        },
      },
      legend: {
        orient: "vertical",
        right: "10%",
        top: "center",
        textStyle: { color: "#9ca3af", fontSize: 12 },
        formatter: (name) => {
          const item = pieData.find((d) => d.name === name);
          return item ? `${name} (${item.category})` : name;
        },
      },
      series: [
        {
          name: "Seasonal AQI",
          type: "pie",
          radius: ["0%", "60%"],
          center: ["35%", "55%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#1f2937",
            borderWidth: 2,
          },
          label: {
            show: true,
            position: "outside",
            formatter: (params) => {
              const percentage = ((params.value / totalAQI) * 100).toFixed(1);
              return `{name|${params.name}}\n{category|${params.data.category}}\n{aqi|AQI: ${params.value} (${percentage}%)}`;
            },
            rich: {
              name: {
                color: "#e5e7eb",
                fontSize: 14,
                fontWeight: "bold",
                lineHeight: 22,
              },
              category: {
                color: "#a3a3a3",
                fontSize: 12,
                lineHeight: 18,
              },
              aqi: {
                color: "#9ca3af",
                fontSize: 11,
                lineHeight: 16,
              },
            },
          },
          labelLine: {
            show: true,
            length: 35,
            length2: 30,
            lineStyle: {
              color: "#6b7280",
              width: 2,
            },
          },
          emphasis: {
            scale: true,
            scaleSize: 5,
            label: {
              show: true,
              fontSize: 15,
              fontWeight: "bold",
            },
            labelLine: {
              show: true,
              lineStyle: {
                width: 3,
                color: "#9ca3af",
              },
            },
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          data: pieData.map((item) => ({
            name: item.name,
            value: item.value,
            category: item.category,
            itemStyle: item.itemStyle,
            label: {
              show: true,
              formatter: (params) => {
                const percentage = ((params.value / totalAQI) * 100).toFixed(1);
                return `{name|${params.name}}\n{category|${params.data.category}}\n{aqi|AQI: ${params.value} (${percentage}%)}`;
              },
              rich: {
                name: {
                  color: "#e5e7eb",
                  fontSize: 16,
                  fontWeight: "bold",
                  lineHeight: 22,
                },
                category: {
                  color: "#a3a3a3",
                  fontSize: 14,
                  lineHeight: 18,
                },
                aqi: {
                  color: "#9ca3af",
                  fontSize: 14,
                  lineHeight: 16,
                },
              },
            },
            labelLine: {
              show: true,
              length: 35,
              length2: 30,
              lineStyle: {
                color: "#6b7280",
                width: 2,
              },
            },
          })),
        },
      ],
    };
  };

  const getMonthlyBarOption = () => {
    // Use real monthly data from backend
    const labels = monthlyData?.monthly?.labels || months;
    const values = monthlyData?.monthly?.values || Array(12).fill(0);
    const categories = monthlyData?.monthly?.categories || Array(12).fill(null);

    const chartData = values.map((val, i) => ({
      value: val ? parseFloat(val.toFixed(2)) : 0,
      itemStyle: { color: getAQICategory(val || 0).color },
    }));

    const maxVal = Math.max(...values.filter((v) => v !== null), 100);
    const yAxisMax = Math.ceil(maxVal / 50) * 50 + 50;

    const monthlyTitle =
      monthlyFilter === "all_time"
        ? "Monthly AQI {filter|- All Time (Yearly Average)}"
        : `Monthly AQI {filter|- ${monthlyFilter} (Monthly Average)}`;

    return {
      backgroundColor: "transparent",
      title: {
        text: monthlyTitle,
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
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(10, 15, 25, 0.92)",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 0,
        formatter: (params) => {
          const idx = params[0].dataIndex;
          const aqi = params[0].value;
          const cat = getAQICategory(aqi);
          const rawVal = values[idx];
          const prevVal = idx > 0 ? values[idx - 1] : null;
          const delta = prevVal !== null ? (rawVal - prevVal).toFixed(1) : null;
          const deltaStr =
            delta !== null
              ? `<span style="color:${parseFloat(delta) <= 0 ? "#6ee7b7" : "#f87171"}; font-size:11px; margin-left:4px;">${parseFloat(delta) > 0 ? "+" : ""}${delta}</span>`
              : "";
          return `
            <div style="padding:12px 16px; min-width:190px; font-family:inherit;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; border-bottom:1px solid #374151; padding-bottom:8px;">
                <span style="font-size:18px;">${cat.emoji}</span>
                <span style="color:#f9fafb; font-weight:700; font-size:14px;">${labels[idx]}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="color:#9ca3af; font-size:12px;">Avg AQI</span>
                <span style="color:${cat.color}; font-weight:700; font-size:16px;">${aqi}${deltaStr}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="color:#9ca3af; font-size:12px;">Category</span>
                <span style="color:${cat.color}; font-weight:600; font-size:12px;">${cat.category}</span>
              </div>
              <div style="background:#1f2937; border-radius:6px; padding:6px 8px; font-size:11px; color:#d1d5db; border-left: 3px solid ${cat.color};">
                ${cat.description}
              </div>
            </div>`;
        },
      },
      grid: {
        left: "10%",
        right: "4%",
        bottom: "12%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        name: "Month",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        data: labels,
        axisLabel: { color: "#9ca3af" },
        axisLine: { lineStyle: { color: "#4b5563" } },
      },
      yAxis: {
        type: "value",
        name: "AQI",
        nameLocation: "middle",
        nameGap: 50,
        max: yAxisMax,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        axisLabel: { color: "#9ca3af" },
        axisLine: { lineStyle: { color: "#4b5563" } },
        splitLine: { lineStyle: { color: "#374151", type: "dashed" } },
      },
      series: [
        {
          name: "AQI",
          type: "bar",
          data: chartData,
          barWidth: "60%",
          label: {
            show: true,
            position: "top",
            formatter: (params) =>
              params.value > 0 ? params.value.toFixed(1) : "",
            color: "#e5e7eb",
            fontSize: 10,
            fontWeight: "bold",
          },
        },
      ],
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Header
        title="Analytics"
        description="Statistical analysis with trends, distribution, and city comparisons"
      />

      {loading ? (
        <LoadingState message="Loading analytics..." />
      ) : errorAnalytics ? (
        <ErrorState
          message="Failed to load analytics"
          onRetry={() => {
            setErrorAnalytics(false);
            setLoading(true);
            loadAnalytics();
          }}
        />
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="bg-card border border-border rounded-lg p-2">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "trends", label: "Trends", icon: <BarChart4 /> },
                { id: "cities", label: "City Comparison", icon: <Activity /> },
                {
                  id: "seasonal",
                  label: "Seasonal Patterns",
                  icon: <Calendar />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-secondary/50"
                  }`}>
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trends Tab */}
          {activeTab === "trends" && (
            <div className="space-y-6">
              {/* Time Series Chart with Filter */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-foreground">
                    AQI Trend
                  </h3>
                  <FilterDropdown
                    value={trendFilter}
                    onChange={setTrendFilter}
                    options={[
                      { value: "all_time", label: "All Time" },
                      ...availableYears.map((year) => ({
                        value: year.toString(),
                        label: year.toString(),
                      })),
                    ]}
                  />
                </div>
                <ReactECharts
                  option={getAQITimeSeriesOption()}
                  style={{ height: "400px", width: "100%" }}
                  opts={{ renderer: "canvas" }}
                />
              </div>

              {/* Category Distribution Pie Chart */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    AQI Category Distribution
                  </h3>
                  <FilterDropdown
                    value={frequencyFilter}
                    onChange={setFrequencyFilter}
                    options={[
                      { value: "all_time", label: "All Time" },
                      ...availableYears.map((year) => ({
                        value: year.toString(),
                        label: year.toString(),
                      })),
                    ]}
                  />
                </div>
                <ReactECharts
                  option={getAQIPieChartOption()}
                  style={{ height: "550px", width: "100%" }}
                  opts={{ renderer: "canvas" }}
                />
              </div>
            </div>
          )}

          {/* City Comparison Tab */}
          {activeTab === "cities" && (
            <div className="space-y-6">
              {/* City Comparison Chart with Filters */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-foreground">
                    City Comparison by Average AQI
                  </h3>
                  <FilterDropdown
                    value={cityComparisonFilter}
                    onChange={setCityComparisonFilter}
                    options={[
                      { value: "all_time", label: "All Time" },
                      ...availableYears.map((year) => ({
                        value: year.toString(),
                        label: year.toString(),
                      })),
                    ]}
                  />
                </div>

                <ReactECharts
                  option={getCityComparisonOption()}
                  style={{
                    height: `${Math.max(400, (cityComparisonData?.count || 10) * 40)}px`,
                    width: "100%",
                  }}
                  opts={{ renderer: "canvas" }}
                />
              </div>
            </div>
          )}

          {/* Seasonal Patterns Tab */}
          {activeTab === "seasonal" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Seasonal Pie Chart */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      AQI by Season
                    </h3>
                    <FilterDropdown
                      value={seasonalFilter}
                      onChange={setSeasonalFilter}
                      options={[
                        { value: "all_time", label: "All Time" },
                        ...availableYears.map((year) => ({
                          value: year.toString(),
                          label: year.toString(),
                        })),
                      ]}
                    />
                  </div>
                  <ReactECharts
                    option={getSeasonalPieChartOption()}
                    style={{ height: "550px", width: "100%" }}
                    opts={{ renderer: "canvas" }}
                  />
                </div>

                {/* Monthly Bar Chart */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-foreground">
                      Monthly AQI
                    </h3>
                    <FilterDropdown
                      value={monthlyFilter}
                      onChange={setMonthlyFilter}
                      options={[
                        { value: "all_time", label: "All Time" },
                        ...availableYears.map((year) => ({
                          value: year.toString(),
                          label: year.toString(),
                        })),
                      ]}
                    />
                  </div>
                  <ReactECharts
                    option={getMonthlyBarOption()}
                    style={{ height: "400px", width: "100%" }}
                    opts={{ renderer: "canvas" }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
