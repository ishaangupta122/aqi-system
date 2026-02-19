import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import {
  Database,
  Table,
  AlertTriangle,
  FileType,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

export default function Dataset() {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState({
    preview: true,
    columns: true,
    statistics: true,
  });

  // Helper functions to identify column types
  const isPollutant = (colName) => {
    const pollutants = ["PM2.5", "NO", "NO2", "NOx", "CO", "SO2", "O3"];
    return pollutants.includes(colName);
  };

  const isDroppedPollutant = (colName) => {
    const droppedPollutants = ["PM10", "NH3", "Benzene", "Toluene", "Xylene"];
    return droppedPollutants.includes(colName);
  };

  const isFeatureEngineering = (colName) => {
    const featureColumns = [
      "month",
      "is_weekend",
      "season_Winter",
      "season_Summer",
      "season_Monsoon",
      "season_PostMonsoon",
    ];
    return featureColumns.includes(colName) || colName.startsWith("season_");
  };

  useEffect(() => {
    loadDatasetInfo();
  }, []);

  const loadDatasetInfo = async () => {
    try {
      setLoading(true);
      const response = await api.getDatasetInfo();
      console.log("Dataset API Response:", response.data);
      setDatasetInfo(response.data);
    } catch (error) {
      console.error("Failed to load dataset info:", error);
      toast.error("Failed to load dataset information");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            Loading dataset information...
          </p>
        </div>
      </div>
    );
  }

  if (!datasetInfo) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Failed to load dataset information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Header
        title="Dataset Information"
        description="Comprehensive view of AQI dataset statistics and properties"
      />

      {/* Dataset Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dataset Shape */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-md bg-secondary/50 text-blue-500">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Dataset Shape
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Rows:</span>
              <span className="text-xl font-bold text-primary">
                {datasetInfo?.shape?.rows?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Columns:</span>
              <span className="text-xl font-bold text-primary">
                {datasetInfo?.shape?.columns || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Cells:</span>
              <span className="inline-flex px-3 py-1 text-sm font-semibold bg-primary/20 text-primary rounded-md">
                {datasetInfo?.shape?.totalCells?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Missing Values */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-md bg-secondary/50 text-yellow-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Missing Values
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cells Missing:</span>
              <span className="text-xl font-bold text-yellow-500">
                {datasetInfo?.missingValues?.total?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Percentage:</span>
              <span className="text-xl font-bold text-yellow-500">
                {datasetInfo?.missingValues?.percentage?.toFixed(2) || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Completeness:</span>
              <span className="text-xl font-bold text-green-500">
                {(100 - (datasetInfo?.missingValues?.percentage || 0)).toFixed(
                  2,
                )}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Data Types */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-md bg-secondary/50 text-green-500">
              <FileType className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Data Types
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Numeric:</span>
              <span className="text-xl font-bold text-green-500">
                {datasetInfo?.dataTypes?.numeric || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Object:</span>
              <span className="text-xl font-bold text-green-500">
                {datasetInfo?.dataTypes?.object || 0}
              </span>
            </div>
            {datasetInfo?.dataTypes?.datetime > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Datetime:</span>
                <span className="text-xl font-bold text-green-500">
                  {datasetInfo.dataTypes.datetime}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dataset Preview */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection("preview")}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50/50 transition-colors">
          <div className="flex items-center gap-3">
            <Table className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              Dataset Preview
            </h3>
          </div>
          {expandedSection.preview ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {expandedSection.preview &&
          datasetInfo?.preview &&
          datasetInfo.preview.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-y border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      #
                    </th>
                    {Object.keys(datasetInfo.preview[0]).map((key) => (
                      <th
                        key={key}
                        className={`px-4 py-3 whitespace-nowrap ${
                          key === "City" ||
                          key === "Date" ||
                          key === "AQI_Bucket"
                            ? "text-left"
                            : "text-right"
                        } text-xs font-semibold text-muted-foreground uppercase tracking-wider`}>
                        {key === "PM2_5" ? "PM2.5" : key.replace("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {datasetInfo.preview.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-secondary/50/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {idx + 1}
                      </td>
                      {Object.entries(row).map(([key, value]) => (
                        <td
                          key={key}
                          className={`px-4 py-3 whitespace-nowrap ${
                            key === "City"
                              ? "text-left font-semibold text-blue-400"
                              : key === "Date"
                                ? "text-left"
                                : key === "AQI"
                                  ? "text-right font-bold text-purple-400"
                                  : key === "AQI_Bucket"
                                    ? "text-left"
                                    : isPollutant(key)
                                      ? "text-right font-semibold text-green-500"
                                      : isDroppedPollutant(key)
                                        ? "text-right font-semibold text-red-500"
                                        : isFeatureEngineering(key)
                                          ? "text-right font-semibold text-primary"
                                          : "text-right text-foreground"
                          }`}>
                          {value === null || value === undefined ? (
                            <span className="inline-flex px-2 py-1 text-xs font-mono bg-gray-500/20 text-gray-400 rounded">
                              null
                            </span>
                          ) : key === "Date" ? (
                            <span className="inline-flex px-2 py-1 text-xs font-mono bg-orange-500/20 text-orange-500 rounded">
                              {value}
                            </span>
                          ) : key === "AQI_Bucket" ? (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                                value === "Severe"
                                  ? "bg-red-900/20 text-red-900"
                                  : value === "Very Poor"
                                    ? "bg-red-500/20 text-red-500"
                                    : value === "Poor"
                                      ? "bg-fuchsia-600/20 text-fuchsia-600"
                                      : value === "Moderate"
                                        ? "bg-pink-400/20 text-pink-400"
                                        : value === "Satisfactory"
                                          ? "bg-yellow-400/20 text-yellow-400"
                                          : value === "Good"
                                            ? "bg-green-500/20 text-green-500"
                                            : "bg-green-500/20 text-green-500"
                              }`}>
                              {value}
                            </span>
                          ) : typeof value === "number" ? (
                            value.toFixed(2)
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Column Details */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection("columns")}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              Column Details
            </h3>
          </div>
          {expandedSection.columns ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {expandedSection.columns && (
          <div className="overflow-x-auto">
            {datasetInfo?.columnDetails &&
            datasetInfo.columnDetails.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-y border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Column
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Used
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Importance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Non-Null
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Null
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {datasetInfo.columnDetails
                    .sort((a, b) => {
                      // Prioritize used features first
                      if (a.used && !b.used) return -1;
                      if (!a.used && b.used) return 1;

                      // Within used features, sort by importance
                      if (a.used && b.used) {
                        return b.importance - a.importance;
                      }

                      // Within unused features: AQI_Bucket first, then Date, then others
                      if (!a.used && !b.used) {
                        if (a.name === "AQI_Bucket") return -1;
                        if (b.name === "AQI_Bucket") return 1;
                        if (a.name === "Date") return -1;
                        if (b.name === "Date") return 1;
                      }

                      return 0;
                    })
                    .map((col, idx) => {
                      // Color code based on importance
                      let importanceColor = "text-muted-foreground";
                      if (col.importance >= 15) {
                        importanceColor = "text-green-500 font-bold";
                      } else if (col.importance >= 8) {
                        importanceColor = "text-yellow-500 font-semibold";
                      } else if (col.importance > 0) {
                        importanceColor = "text-orange-500";
                      }

                      return (
                        <tr
                          key={idx}
                          className="hover:bg-secondary/50/30 transition-colors">
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 text-blue-400 font-semibold whitespace-nowrap">
                            {col.name === "PM2_5" ? "PM2.5" : col.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-mono bg-orange-500/20 text-orange-500 rounded">
                              {col.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-left text-muted-foreground whitespace-nowrap">
                            {col.unit || "-"}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${col.used ? "bg-green-500" : "bg-red-500"}`}></span>
                          </td>
                          <td
                            className={`px-6 py-4 text-right whitespace-nowrap ${importanceColor}`}>
                            {col.importance > 0 ? `${col.importance}%` : "-"}
                          </td>
                          <td className="px-6 py-4 text-right text-green-500 font-semibold whitespace-nowrap">
                            {col.nonNull.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            {col.null === 0 ? (
                              <span className="text-muted-foreground">
                                {col.null}
                              </span>
                            ) : (
                              <span className="text-red-500 font-semibold">
                                {col.null.toLocaleString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center text-muted-foreground">
                No column details available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistical Summary */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection("statistics")}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50/50 transition-colors">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              Statistical Summary
            </h3>
          </div>
          {expandedSection.statistics ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {expandedSection.statistics && (
          <div className="overflow-x-auto">
            {datasetInfo?.statistics && datasetInfo.statistics.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-y border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-0 bg-secondary/50 whitespace-nowrap">
                      Column
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Count
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Mean
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Std
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Min
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      25%
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      50%
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      75%
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Max
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {datasetInfo.statistics.map((stat, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-secondary/50/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-blue-400 font-semibold sticky left-0 bg-card whitespace-nowrap">
                        {stat.column === "PM2_5" ? "PM2.5" : stat.column}
                      </td>
                      <td className="px-4 py-3 text-right text-cyan-500 whitespace-nowrap">
                        {stat.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-indigo-400 whitespace-nowrap">
                        {stat.mean.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-pink-400 whitespace-nowrap">
                        {stat.std.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-500 font-semibold whitespace-nowrap">
                        {stat.min.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-lime-400 whitespace-nowrap">
                        {stat.q25.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-yellow-500 font-semibold whitespace-nowrap">
                        {stat.q50.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-500 whitespace-nowrap">
                        {stat.q75.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-500 font-semibold whitespace-nowrap">
                        {stat.max.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center text-muted-foreground">
                No statistical data available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
