import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  ScaleControl,
  useMap,
} from "react-leaflet";
import { api } from "../lib/api";
import { getAQICategory } from "../lib/constants";
import toast from "react-hot-toast";
import { MapPin, Layers, Home, Activity, TrendingUp, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Header from "../components/Header";
import { cityCoordinates } from "../lib/constants";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Map Controls Component
function MapControls({ mapStyle, setMapStyle }) {
  const map = useMap();

  const resetView = () => {
    map.setView([20.5937, 78.9629], 5);
  };

  return (
    <div className="leaflet-bottom leaflet-right">
      <div
        className="leaflet-control leaflet-bar"
        style={{
          background: "rgba(17, 24, 39, 0.95)",
          border: "2px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          padding: "4px",
        }}>
        <button
          onClick={() => setMapStyle(mapStyle === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded transition-colors"
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
          }}
          title={`Switch to ${mapStyle === "dark" ? "Light" : "Dark"} Mode`}>
          <Layers className="w-4 h-4" />
          <span>{mapStyle === "dark" ? "Light" : "Dark"}</span>
        </button>
        <button
          onClick={resetView}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded transition-colors"
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            marginTop: "4px",
            paddingTop: "8px",
          }}
          title="Reset View">
          <Home className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}

// Map Navigator component to access map instance
function MapNavigator({ selectedCity, onMapReady }) {
  const map = useMap();

  React.useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
}

export default function CityMap() {
  const [cities, setCities] = useState([]);
  const [citiesData, setCitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [mapStyle, setMapStyle] = useState("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    loadCitiesData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = citiesData.filter((city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, citiesData]);

  const loadCitiesData = async () => {
    try {
      const response = await api.getCities();
      const cityList = response.data.cities;

      // Load stats for each city that has coordinates
      const citiesWithData = await Promise.all(
        cityList
          .filter((city) => cityCoordinates[city])
          .map(async (city) => {
            try {
              const statsResponse = await api.getCityStats(city);
              return {
                name: city,
                coordinates: cityCoordinates[city],
                ...statsResponse.data,
              };
            } catch (error) {
              return null;
            }
          }),
      );

      const validCities = citiesWithData.filter((city) => city !== null);
      setCitiesData(validCities);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load city data");
      setLoading(false);
    }
  };

  const handleCitySelect = (city, map) => {
    setSelectedCity(city);
    setSearchQuery("");
    setShowSearchResults(false);

    // Navigate map to selected city
    if (map) {
      map.flyTo(city.coordinates, 8, {
        duration: 1.5,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <Header
        title="City Map"
        description="Explore air quality across major cities in India"
      />

      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        {/* AQI Categories Legend */}
        <span className="text-sm text-muted-foreground">Categories:</span>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1 border border-gray-700">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#00ff00" }}></div>
            <span className="text-xs font-medium text-foreground">
              Good (0-50)
            </span>
          </div>
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1 border border-gray-700">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#90ee90" }}></div>
            <span className="text-xs font-medium text-foreground">
              Satisfactory (51-100)
            </span>
          </div>
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1 border border-gray-700">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#ffff00" }}></div>
            <span className="text-xs font-medium text-foreground">
              Moderate (101-200)
            </span>
          </div>
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1 border border-gray-700">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#ffa500" }}></div>
            <span className="text-xs font-medium text-foreground">
              Poor (201-300)
            </span>
          </div>
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1 border border-gray-700">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#ff0000" }}></div>
            <span className="text-xs font-medium text-foreground">
              Very Poor (301-400)
            </span>
          </div>
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1 border border-gray-700">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#990099" }}></div>
            <span className="text-xs font-medium text-foreground">
              Severe (400+)
            </span>
          </div>
        </div>
      </div>

      {/* Map Container with Overlay */}
      <div className="relative h-[90vh]">
        <div className="h-full border border-gray-700 rounded-xl overflow-hidden">
          {/* City Details Overlay */}
          {selectedCity && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-[1000] w-[calc(100%-1rem)] sm:w-[380px] md:w-[400px] bg-gray-900 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl animate-slide-in border border-gray-700">
              <div className="p-4 md:p-6 space-y-3 md:space-y-4 max-h-[calc(80vh-2rem)] overflow-y-auto scrollbar-custom [&::-webkit-scrollbar]:hidden">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCity(null)}
                  className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors z-10">
                  <X className="w-4 h-4 text-foreground" />
                </button>

                {/* Title */}
                <div className="border-b border-gray-800 pb-3">
                  <h2 className="text-lg md:text-xl font-bold text-foreground">
                    Air Quality Map
                  </h2>
                </div>

                {/* City Header */}
                <div>
                  <div className="flex items-start gap-2 text-primary">
                    <MapPin className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xl">
                        {selectedCity.name}
                      </p>
                      <p className="text-sm text-muted-foreground">India</p>
                    </div>
                  </div>
                </div>
                <>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      Air Quality Index
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-5xl font-bold mb-2"
                          style={{
                            color: getAQICategory(selectedCity.avg_aqi).color,
                          }}>
                          {Math.round(selectedCity.avg_aqi)}
                        </p>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: getAQICategory(
                              selectedCity.avg_aqi,
                            ).color,
                            color:
                              selectedCity.avg_aqi > 100 ? "white" : "black",
                          }}>
                          {getAQICategory(selectedCity.avg_aqi).category}
                        </span>
                      </div>
                      <div className="text-4xl">
                        {getAQICategory(selectedCity.avg_aqi).emoji}
                      </div>
                    </div>
                  </div>

                  {/* Pollutant Details */}
                  <div className="space-y-2">
                    <PollutantBar
                      label="PM2.5"
                      value={120}
                      max={250}
                      unit="μg/m³"
                      color="#ff6b6b"
                    />
                    <PollutantBar
                      label="PM10"
                      value={185}
                      max={350}
                      unit="μg/m³"
                      color="#ffa500"
                    />
                    <PollutantBar
                      label="NO2"
                      value={45}
                      max={200}
                      unit="ppb"
                      color="#4ecdc4"
                    />
                    <PollutantBar
                      label="O3"
                      value={68}
                      max={180}
                      unit="ppb"
                      color="#95e1d3"
                    />
                    <PollutantBar
                      label="CO"
                      value={1.2}
                      max={10}
                      unit="mg/m³"
                      color="#a8e6cf"
                    />
                  </div>

                  {/* City Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 border border-gray-700">
                      <p className="text-xs text-muted-foreground mb-1">
                        Max AQI
                      </p>
                      <p
                        className="text-lg md:text-xl font-bold"
                        style={{
                          color: getAQICategory(selectedCity.max_aqi).color,
                        }}>
                        {Math.round(selectedCity.max_aqi)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 border border-gray-700">
                      <p className="text-xs text-muted-foreground mb-1">
                        Min AQI
                      </p>
                      <p
                        className="text-lg md:text-xl font-bold"
                        style={{
                          color: getAQICategory(selectedCity.min_aqi).color,
                        }}>
                        {Math.round(selectedCity.min_aqi)}
                      </p>
                    </div>
                  </div>
                </>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 z-[1000] w-[calc(100%-1rem)] sm:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Search city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/95 border border-gray-700 rounded-lg px-4 py-2.5 pl-10 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
              />
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-900/95 border border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm max-h-60 overflow-y-auto">
                  {searchResults.map((city) => {
                    const aqiInfo = getAQICategory(city.avg_aqi);
                    return (
                      <button
                        key={city.name}
                        onClick={() => handleCitySelect(city, mapInstance)}
                        className="w-full px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-between text-left border-b border-gray-800 last:border-b-0">
                        <div>
                          <p className="font-medium text-foreground">
                            {city.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {aqiInfo.emoji} {aqiInfo.category}
                          </p>
                        </div>
                        <span
                          className="text-xl font-bold"
                          style={{ color: aqiInfo.color }}>
                          {Math.round(city.avg_aqi)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          {loading ? (
            <div className="h-full flex items-center justify-center bg-gray-950">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading map data...
                </p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              zoomControl={true}
              style={{ height: "100%", width: "100%" }}
              className="z-0 bg-gray-950">
              <TileLayer
                url={
                  mapStyle === "dark"
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
              />
              <ScaleControl position="bottomleft" imperial={true} />
              <MapControls mapStyle={mapStyle} setMapStyle={setMapStyle} />
              <MapNavigator onMapReady={setMapInstance} />
              {citiesData.map((city) => {
                const aqiInfo = getAQICategory(city.avg_aqi);
                const aqi = Math.round(city.avg_aqi);

                // Determine text color based on AQI level and background
                const getTextColor = (aqiValue) => {
                  if (aqiValue <= 50) return "#000";
                  if (aqiValue <= 100) return "#000";
                  return "#fff";
                };

                // Create custom divIcon with AQI number
                const icon = L.divIcon({
                  className: "custom-marker",
                  html: `
                  <div style="
                    background: ${aqiInfo.color};
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid rgba(255, 255, 255, 0.9);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.2);
                    font-weight: 900;
                    font-size: 15px;
                    color: ${getTextColor(aqi)};
                    font-family: system-ui, -apple-system, sans-serif;
                    text-shadow: ${aqi > 100 ? "0 1px 2px rgba(0,0,0,0.3)" : "0 1px 2px rgba(255,255,255,0.3)"};
                  ">
                    ${aqi}
                  </div>
                `,
                  iconSize: [50, 50],
                  iconAnchor: [25, 25],
                });

                return (
                  <Marker
                    key={city.name}
                    position={city.coordinates}
                    icon={icon}
                    eventHandlers={{
                      click: () => handleCitySelect(city, mapInstance),
                    }}
                  />
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function PollutantBar({ label, value, max, unit, color }) {
  const percentage = (value / max) * 100;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground flex items-center gap-2">
          {label}
          <TrendingUp className="w-3 h-3" />
        </span>
        <span className="text-sm font-bold text-foreground">
          {value} <span className="text-xs text-muted-foreground">{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            background: `linear-gradient(to right, ${color}, ${color}dd)`,
          }}
        />
      </div>
    </div>
  );
}

function LegendItem({ color, label, range }) {
  return (
    <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 border border-border/50 hover:border-border transition-colors">
      <div
        className="w-5 h-5 rounded-full border-2 border-white shadow-md"
        style={{ backgroundColor: color }}
      />
      <div className="text-xs">
        <div className="font-medium text-foreground">{label}</div>
        <div className="text-muted-foreground">{range}</div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-4 border border-border hover:border-primary/50 transition-all">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color: color || "#fff" }}>
        {value}
      </p>
    </div>
  );
}
