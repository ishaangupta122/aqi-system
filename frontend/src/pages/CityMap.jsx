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
import {
  MapPin,
  Layers,
  Home,
  Activity,
  TrendingUp,
  X,
  Search,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Header from "../components/Header";
import { cityCoordinates } from "../lib/constants";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TILE_LAYERS = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

const POLLUTANTS = [
  { key: "pm25", label: "PM2.5", unit: "µg/m³", color: "#ef4444", max: 250 },
  { key: "no2", label: "NO2", unit: "µg/m³", color: "#4ecdc4", max: 200 },
  { key: "nox", label: "NOx", unit: "µg/m³", color: "#8b5cf6", max: 200 },
  { key: "so2", label: "SO2", unit: "µg/m³", color: "#f59e0b", max: 150 },
  { key: "o3", label: "O3", unit: "µg/m³", color: "#3b82f6", max: 200 },
  { key: "co", label: "CO", unit: "µg/m³", color: "#10b981", max: 10 },
];

function MapControls({ mapStyle, setMapStyle }) {
  const map = useMap();
  const isDark = mapStyle === "dark";

  const btn = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    padding: "8px 12px",
    width: "100%",
    color: isDark ? "#e5e7eb" : "#1f2937",
    borderRadius: "6px",
    transition: "background 0.15s",
  };

  return (
    <div className="leaflet-bottom leaflet-right">
      <div
        className="leaflet-control"
        style={{
          background: isDark ? "rgba(17,24,39,0.95)" : "rgba(255,255,255,0.97)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`,
          borderRadius: "10px",
          padding: "4px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          marginRight: "10px",
          marginBottom: "10px",
        }}>
        <button
          onClick={() => setMapStyle(isDark ? "light" : "dark")}
          style={btn}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}>
          <Layers size={15} />
          <span>{isDark ? "Light" : "Dark"} Mode</span>
        </button>
        <div
          style={{
            height: "1px",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            margin: "2px 8px",
          }}
        />
        <button
          onClick={() => map.setView([20.5937, 78.9629], 5)}
          style={btn}
          title="Reset View">
          <Home size={15} />
          <span>Reset View</span>
        </button>
      </div>
    </div>
  );
}

function MapNavigator({ onMapReady }) {
  const map = useMap();
  React.useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map]);
  return null;
}

export default function CityMap() {
  const [citiesData, setCitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [pollutants, setPollutants] = useState(null);
  const [loadingPollutants, setLoadingPollutants] = useState(false);
  const [mapStyle, setMapStyle] = useState(
    () => localStorage.getItem("citymap-style") || "dark",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    loadCitiesData();
  }, []);

  useEffect(() => {
    localStorage.setItem("citymap-style", mapStyle);
  }, [mapStyle]);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      setSearchResults(
        citiesData.filter((c) => c.name.toLowerCase().includes(q)),
      );
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
      const results = await Promise.all(
        cityList
          .filter((c) => cityCoordinates[c])
          .map(async (c) => {
            try {
              const r = await api.getCityStats(c);
              return { name: c, coordinates: cityCoordinates[c], ...r.data };
            } catch {
              return null;
            }
          }),
      );
      setCitiesData(results.filter(Boolean));
    } catch {
      toast.error("Failed to load city data");
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = async (city, map) => {
    setSelectedCity(city);
    setPollutants(null);
    setSearchQuery("");
    setShowSearchResults(false);

    if (map) map.flyTo(city.coordinates, 8, { duration: 1.5 });

    setLoadingPollutants(true);
    try {
      const r = await api.getCityAggregatedData(city.name, "all_time");
      setPollutants(r.data);
    } catch {
      /* silently leave pollutants as null */
    } finally {
      setLoadingPollutants(false);
    }
  };

  const isDark = mapStyle === "dark";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Header
        title="City Map"
        description="Explore air quality across major cities in India"
      />
      {/* Search Section */}
      <div className="bg-card border border-border rounded-lg p-6 w-full">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Search City
        </label>
        <div className="relative w-full">
          {/* Search icon */}
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none h-5 w-5"
            color="#6b7280"
          />
          <input
            type="text"
            placeholder="Enter City Name ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 placeholder-[#6b7280] focus:ring-primary cursor-pointer appearance-none"
          />
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-3 w-full overflow-hidden max-h-64 overflow-y-auto bg-secondary/80 border border-border rounded-lg text-foreground z-[9999]">
              {searchResults.map((city) => {
                const info = getAQICategory(city.avg_aqi);
                return (
                  <button
                    key={city.name}
                    onClick={() => handleCitySelect(city, mapInstance)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }>
                    <div>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "#f9fafb" }}>
                        {city.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: info.color }}>
                        {info.emoji} {info.category}
                      </p>
                    </div>
                    <span
                      className="text-lg font-extrabold"
                      style={{ color: info.color }}>
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
      <div className="relative h-[90vh] border border-border rounded-xl overflow-hidden shadow-lg">
        {/* City Preview Card */}
        {selectedCity && (
          <div
            className="absolute top-3 left-3 z-[1000] w-[340px] rounded-2xl shadow-2xl animate-slide-in overflow-hidden"
            style={{
              background: "#0d1117",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
              <span className="text-sm font-semibold text-white/80 tracking-wide">
                Air Quality Map
              </span>
              <button
                onClick={() => {
                  setSelectedCity(null);
                  setPollutants(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.07)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.13)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
                }>
                <X size={14} color="white" />
              </button>
            </div>

            <div className="px-5 pb-5 pt-4 space-y-4 max-h-[calc(90vh-130px)] overflow-y-auto [&::-webkit-scrollbar]:hidden">
              {/* City name */}
              <div className="flex items-start gap-2.5">
                <MapPin
                  size={20}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: "hsl(168,76%,42%)" }}
                />
                <div>
                  <p
                    className="text-2xl font-bold leading-tight"
                    style={{ color: "hsl(168,76%,42%)" }}>
                    {selectedCity.name}
                  </p>
                  <p className="text-sm text-white/40 mt-0.5">India</p>
                </div>
              </div>

              {/* AQI Card */}
              {(() => {
                const cat = getAQICategory(selectedCity.avg_aqi);
                return (
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}>
                    <div className="flex items-center gap-1.5 text-white/40 text-xs mb-3">
                      <Activity size={12} />
                      <span>Air Quality Index</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p
                          className="text-6xl font-extrabold leading-none mb-2"
                          style={{ color: cat.color }}>
                          {Math.round(selectedCity.avg_aqi)}
                        </p>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: cat.color,
                            color: selectedCity.avg_aqi > 100 ? "#fff" : "#000",
                          }}>
                          {cat.category}
                        </span>
                      </div>
                      <span style={{ fontSize: 44, lineHeight: 1 }}>
                        {cat.emoji}
                      </span>
                    </div>
                    {/* AQI range bar */}
                    <div className="mt-4">
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.1)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((selectedCity.avg_aqi / 500) * 100, 100)}%`,
                            background: `linear-gradient(to right, ${cat.color}88, ${cat.color})`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-white/25 mt-1">
                        <span>0</span>
                        <span>Good</span>
                        <span>Moderate</span>
                        <span>500+</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Pollutant Bars */}
              {loadingPollutants ? (
                <div className="flex items-center justify-center py-4 gap-2 text-white/40 text-sm">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  Loading pollutants…
                </div>
              ) : pollutants ? (
                <div className="space-y-2">
                  {POLLUTANTS.map(({ key, label, unit, color, max }) => {
                    const val = pollutants[key];
                    if (val == null) return null;
                    const pct = Math.min((val / max) * 100, 100);
                    return (
                      <div
                        key={key}
                        className="rounded-xl px-4 py-3"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white/80 flex items-center gap-1.5">
                            {label}
                            <TrendingUp size={11} className="opacity-50" />
                          </span>
                          <span className="text-sm font-bold text-white">
                            {val.toFixed(1)}&nbsp;
                            <span className="text-[11px] font-normal text-white/40">
                              {unit}
                            </span>
                          </span>
                        </div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(to right, ${color}88, ${color})`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {/* Min / Max stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Max AQI", value: selectedCity.max_aqi },
                  { label: "Min AQI", value: selectedCity.min_aqi },
                ].map(({ label, value }) => {
                  const cat = getAQICategory(value);
                  return (
                    <div
                      key={label}
                      className="rounded-xl p-3"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                      <p className="text-[11px] text-white/35 mb-1">{label}</p>
                      <p
                        className="text-xl font-bold"
                        style={{ color: cat.color }}>
                        {Math.round(value)}
                      </p>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: cat.color + "99" }}>
                        {cat.category}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-full flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              <p className="mt-4 text-muted-foreground text-sm">
                Loading map data…
              </p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            minZoom={4}
            maxZoom={12}
            maxBounds={[
              [6, 65],
              [37, 100],
            ]}
            maxBoundsViscosity={1.0}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}>
            <TileLayer url={TILE_LAYERS[mapStyle]} />
            <ScaleControl position="bottomleft" imperial={false} />
            <MapControls mapStyle={mapStyle} setMapStyle={setMapStyle} />
            <MapNavigator onMapReady={setMapInstance} />

            {citiesData.map((city) => {
              const aqi = Math.round(city.avg_aqi);
              const info = getAQICategory(aqi);
              const textColor =
                info.category === "Good" || info.category === "Satisfactory"
                  ? "#1a1a1a"
                  : "#ffffff";

              const icon = L.divIcon({
                className: "",
                html: `
                  <div style="
                    position: relative;
                    width: 46px;
                    height: 46px;
                  ">
                    <!-- Subtle outer ring -->
                    <div style="
                      position: absolute; inset: -3px;
                      border-radius: 50%;
                      background: ${info.color}28;
                      border: 1.5px solid ${info.color}55;
                    "></div>
                    <!-- Main circle -->
                    <div style="
                      position: absolute; inset: 0;
                      border-radius: 50%;
                      background: ${info.color};
                      box-shadow: 0 2px 12px ${info.color}66, 0 1px 4px rgba(0,0,0,0.25);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: 800;
                      font-size: ${aqi >= 100 ? "13px" : "14px"};
                      color: ${textColor};
                      font-family: system-ui, -apple-system, sans-serif;
                      letter-spacing: -0.5px;
                      border: 2px solid rgba(255,255,255,0.55);
                    ">${aqi}</div>
                  </div>
                `,
                iconSize: [46, 46],
                iconAnchor: [23, 23],
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
  );
}
