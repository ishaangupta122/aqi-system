import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { TrendingUp, Activity, Calendar, BarChart4 } from "lucide-react";
import Header from "../components/Header";
import FilterDropdown from "../components/FilterDropdown";
import { months } from "../lib/constants";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trends");

  const [trendFilter, setTrendFilter] = useState("all_time");
  const [frequencyFilter, setFrequencyFilter] = useState("all_time");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [trendData, setTrendData] = useState(null);
  const [frequencyData, setFrequencyData] = useState(null);
  const [cityComparisonData, setCityComparisonData] = useState(null);
  const [seasonalData, setSeasonalData] = useState(null);
  const [correlationData, setCorrelationData] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    loadAnalytics();
    loadTrendData();
    loadFrequencyData();
    loadCityComparison();
    loadSeasonalData();
    loadCorrelationData();
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
  }, [categoryFilter]);

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
      const category = categoryFilter === "All" ? null : categoryFilter;
      const response = await api.getCityComparison(category, 20);
      setCityComparisonData(response.data);

      // Set available categories from first response
      if (
        response.data.available_categories &&
        availableCategories.length === 0
      ) {
        setAvailableCategories(response.data.available_categories);
      }
    } catch (error) {
      console.error("Failed to load city comparison data:", error);
      toast.error("Failed to load city comparison data");
    }
  };

  const loadSeasonalData = async () => {
    try {
      const response = await api.getSeasonalData();
      setSeasonalData(response.data);
    } catch (error) {
      console.error("Failed to load seasonal data:", error);
      toast.error("Failed to load seasonal data");
    }
  };

  const loadCorrelationData = async () => {
    try {
      const response = await api.getCorrelationData();
      setCorrelationData(response.data);
    } catch (error) {
      console.error("Failed to load correlation data:", error);
      toast.error("Failed to load correlation data");
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
          text: "City Comparison by Average AQI",
          textStyle: { color: "#e5e7eb", fontSize: 16, fontWeight: "bold" },
        },
        series: [{ type: "bar", data: [] }],
      };
    }

    const cities = cityComparisonData.cities;
    const avgAqi = cityComparisonData.avg_aqi;
    const categories = cityComparisonData.categories;

    return {
      backgroundColor: "transparent",
      title: {
        text:
          categoryFilter === "All"
            ? `Top Cities by Average AQI`
            : `${categoryFilter} Cities by Average AQI`,
        textStyle: { color: "#e5e7eb", fontSize: 16, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const idx = params[0].dataIndex;
          return `${cities[idx]}<br/>Avg AQI: ${avgAqi[idx].toFixed(2)}<br/>Category: ${categories[idx]}`;
        },
      },
      grid: {
        left: "10%",
        right: "10%",
        bottom: "10%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: "Avg AQI",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        axisLabel: { color: "#9ca3af" },
        axisLine: { lineStyle: { color: "#4b5563" } },
        splitLine: { lineStyle: { color: "#374151", type: "dashed" } },
      },
      yAxis: {
        type: "category",
        name: "City",
        nameLocation: "middle",
        nameGap: 80,
        nameTextStyle: { color: "#e5e7eb", fontSize: 13, fontWeight: "bold" },
        data: cities,
        axisLabel: { color: "#9ca3af", fontSize: 11 },
        axisLine: { lineStyle: { color: "#4b5563" } },
        inverse: true,
      },
      series: [
        {
          type: "bar",
          data: avgAqi.map((aqi, idx) => {
            // Color based on AQI category - calming colors
            const category = categories[idx];
            let color = "#6ee7b7"; // Good - soft mint
            if (category === "Satisfactory")
              color = "#a7f3d0"; // soft light green
            else if (category === "Moderate")
              color = "#fde68a"; // soft yellow
            else if (category === "Poor")
              color = "#fb923c"; // soft coral
            else if (category === "Very Poor")
              color = "#f87171"; // soft red
            else if (category === "Severe") color = "#dc2626"; // muted red

            return {
              value: parseFloat(aqi.toFixed(2)),
              itemStyle: { color },
            };
          }),
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

  const getPollutantCorrelationOption = () => {
    if (!correlationData) return {};

    const pollutants = correlationData.pollutants || [];
    const matrixData = correlationData.matrix || [];

    // Convert matrix data to ECharts format [x, y, value]
    const data = matrixData.map((item) => [item.x, item.y, item.value]);

    return {
      backgroundColor: "transparent",
      tooltip: {
        position: "top",
        formatter: (params) => {
          const row = pollutants[params.data[1]];
          const col = pollutants[params.data[0]];
          return `${row} vs ${col}<br/>Correlation: ${params.data[2]}`;
        },
      },
      grid: {
        left: "12%",
        right: "15%",
        top: "10%",
        bottom: "12%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: pollutants,
        axisLabel: {
          color: "#9ca3af",
          fontSize: 12,
          rotate: 0,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitArea: { show: false },
      },
      yAxis: {
        type: "category",
        data: pollutants,
        axisLabel: {
          color: "#9ca3af",
          fontSize: 12,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitArea: { show: false },
      },
      visualMap: {
        min: -1,
        max: 1,
        calculable: true,
        orient: "vertical",
        right: "2%",
        top: "center",
        text: ["1", "-1"],
        textStyle: {
          color: "#9ca3af",
          fontSize: 11,
        },
        textGap: 10,
        itemWidth: 20,
        itemHeight: 140,
        inRange: {
          color: [
            "#6ee7b7",
            "#86efac",
            "#a7f3d0",
            "#bef264",
            "#fef08a",
            "#fde047",
            "#fcd34d",
            "#fbbf24",
            "#fb923c",
            "#fca5a5",
            "#f87171",
            "#e57373",
          ],
        },
      },
      series: [
        {
          type: "heatmap",
          data: data,
          label: {
            show: true,
            color: "#000",
            fontSize: 11,
            fontWeight: "bold",
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: "#1f2937",
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
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
            ? "AQI Trend - Average by Year"
            : `AQI Trend - ${trendData.year} (Monthly Average)`,
        textStyle: { color: "#e5e7eb", fontSize: 16, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const label = params[0].name;
          const value =
            params[0].value !== null ? params[0].value.toFixed(2) : "N/A";
          return `${label}<br/>AQI: ${value}`;
        },
      },
      legend: {
        data: ["AQI"],
        textStyle: { color: "#9ca3af" },
        top: "12%",
      },
      grid: {
        left: "8%",
        right: "4%",
        bottom: "12%",
        top: "25%",
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

    return {
      backgroundColor: "transparent",
      title: [
        {
          text: "AQI Category Distribution",
          left: "center",
          top: "2%",
          textStyle: { color: "#e5e7eb", fontSize: 16, fontWeight: "bold" },
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
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#333",
        textStyle: { color: "#fff" },
        formatter: (params) => {
          return `${params.name} (${params.data.range})<br/>Frequency: ${params.value.toLocaleString()} records (${params.percent}%)`;
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

  const getSeasonalPolarOption = () => {
    // Use real seasonal data from backend - Indian seasons
    const seasons = ["Winter", "Summer", "Post-Monsoon", "Monsoon"];

    // Get data from seasonalData state or use empty defaults
    const seasonalValues = seasons.map((season) => {
      if (!seasonalData?.seasonal) return 0;
      const found = seasonalData.seasonal.find((s) => s.season === season);
      return found ? parseFloat(found.avg_aqi.toFixed(2)) : 0;
    });

    const seasonCategories = seasons.map((season) => {
      if (!seasonalData?.seasonal) return null;
      const found = seasonalData.seasonal.find((s) => s.season === season);
      return found?.category || null;
    });

    const maxAqi = Math.max(...seasonalValues.filter((v) => v > 0), 100);
    const indicatorMax = Math.ceil(maxAqi / 50) * 50 + 50;

    return {
      backgroundColor: "transparent",
      title: {
        text: "AQI by Season (Radar Chart)",
        left: "center",
        top: "5%",
        textStyle: { color: "#e5e7eb", fontSize: 16, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          let result = `<b>Seasonal AQI</b><br/>`;
          seasons.forEach((season, idx) => {
            const cat = seasonCategories[idx] || "N/A";
            result += `${season}: ${params.value[idx]} (${cat})<br/>`;
          });
          return result;
        },
      },
      radar: {
        indicator: seasons.map((season) => ({
          name: season,
          max: indicatorMax,
        })),
        shape: "circle",
        center: ["50%", "55%"],
        radius: "70%",
        splitNumber: 5,
        name: {
          textStyle: {
            color: "#9ca3af",
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        splitLine: {
          lineStyle: {
            color: "#374151",
            type: "solid",
          },
        },
        splitArea: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: "#4b5563",
          },
        },
      },
      series: [
        {
          type: "radar",
          data: [
            {
              value: seasonalValues,
              name: "Seasonal AQI",
              label: {
                show: true,
                formatter: (params) => {
                  const val = seasonalValues[params.dimensionIndex];
                  return val > 0 ? val.toFixed(1) : "";
                },
                color: "#e5e7eb",
                fontSize: 12,
                fontWeight: "bold",
                position: "outside",
                distance: 15,
              },
              areaStyle: {
                color: {
                  type: "radial",
                  x: 0.5,
                  y: 0.5,
                  r: 0.5,
                  colorStops: [
                    { offset: 0, color: "rgba(110, 231, 183, 0.8)" },
                    { offset: 1, color: "rgba(110, 231, 183, 0.3)" },
                  ],
                },
              },
              lineStyle: {
                color: "#6ee7b7",
                width: 2,
              },
              itemStyle: {
                color: "#6ee7b7",
                borderColor: "#fff",
                borderWidth: 2,
              },
              symbol: "circle",
              symbolSize: 8,
            },
          ],
        },
      ],
    };
  };

  const getMonthlyBarOption = () => {
    // Use real monthly data from backend
    const labels = seasonalData?.monthly?.labels || months;
    const values = seasonalData?.monthly?.values || Array(12).fill(0);
    const categories =
      seasonalData?.monthly?.categories || Array(12).fill(null);

    // Calming color scheme based on AQI category
    const getCategoryColor = (category) => {
      const colorMap = {
        Good: "#6ee7b7",
        Satisfactory: "#a7f3d0",
        Moderate: "#fde68a",
        Poor: "#fb923c",
        "Very Poor": "#f87171",
        Severe: "#dc2626",
      };
      return colorMap[category] || "#94a3b8";
    };

    const chartData = values.map((val, i) => ({
      value: val ? parseFloat(val.toFixed(2)) : 0,
      itemStyle: { color: getCategoryColor(categories[i]) },
    }));

    const maxVal = Math.max(...values.filter((v) => v !== null), 100);
    const yAxisMax = Math.ceil(maxVal / 50) * 50 + 50;

    return {
      backgroundColor: "transparent",
      title: {
        text: "Average AQI by Month",
        textStyle: { color: "#e5e7eb", fontSize: 16, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const idx = params[0].dataIndex;
          return `<b>${labels[idx]}</b><br/>AQI: ${params[0].value}<br/>Category: ${categories[idx] || "N/A"}`;
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
        description="Statistical analysis with trends, distribution, city comparisons, and correlations"
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="bg-card border border-border rounded-lg p-2">
            <div className="flex gap-2">
              {[
                { id: "trends", label: "Trends", icon: <BarChart4 /> },
                {
                  id: "correlations",
                  label: "Correlations",
                  icon: <TrendingUp />,
                },
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
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${
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

          {/* Correlations Tab */}
          {activeTab === "correlations" && (
            <div className="space-y-6">
              {/* Correlation Heatmap */}
              <div className="bg-card border border-border rounded-lg p-6">
                <ReactECharts
                  option={getPollutantCorrelationOption()}
                  style={{ height: "500px", width: "100%" }}
                  opts={{ renderer: "canvas" }}
                />
              </div>

              {/* Interpreting Correlations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-6 border-l-4 border-l-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-foreground">
                      +1
                    </span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                      POSITIVE
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Strong Positive Correlation
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Variables increase together
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 border-l-4 border-l-yellow-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-foreground">
                      0
                    </span>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">
                      NEUTRAL
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    No Correlation
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Variables are independent
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 border-l-4 border-l-red-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-foreground">
                      -1
                    </span>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                      NEGATIVE
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Strong Negative Correlation
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Variables move in opposite directions
                  </p>
                </div>
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
                    label="Category:"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={availableCategories.map((category) => ({
                      value: category,
                      label: category,
                    }))}
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
                {/* Polar Chart */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <ReactECharts
                    option={getSeasonalPolarOption()}
                    style={{ height: "500px", width: "100%" }}
                    opts={{ renderer: "canvas" }}
                  />
                </div>

                {/* Monthly Bar Chart */}
                <div className="bg-card border border-border rounded-lg p-6">
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
