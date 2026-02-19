import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CarFront,
  Database,
  HardHat,
  History,
  Home,
  Lightbulb,
  Map,
  SettingsIcon,
  TreePine,
  TrendingUp,
} from "lucide-react";

export const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/predict", icon: Activity, label: "Predict AQI" },
  { path: "/map", icon: Map, label: "City Map" },
  { path: "/monitor-cities", icon: TrendingUp, label: "Monitor Cities" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/problems", icon: AlertTriangle, label: "Problems" },
  // { path: "/solutions", icon: Lightbulb, label: "Solutions" },
  { path: "/dataset", icon: Database, label: "Dataset" },
  { path: "/history", icon: History, label: "History" },
  { path: "/settings", icon: SettingsIcon, label: "Settings" },
];

export const policyData = {
  transportation: {
    name: "Transportation",
    priority: "CRITICAL",
    icon: CarFront,
    color: "#ef4444",
    budget: 10000,
    expectedImpact: "35-45%",
    immediate: [
      "Implement odd-even vehicle scheme",
      "Expand metro rail network",
      "Promote electric public transport",
      "Create dedicated bus lanes",
    ],
    longTerm: [
      "Develop comprehensive metro network",
      "Establish EV charging infrastructure",
      "Implement congestion pricing",
      "Create pedestrian-friendly zones",
    ],
  },
  industrial: {
    name: "Industrial Controls",
    priority: "HIGH",
    icon: Building2,
    color: "#f59e0b",
    budget: 5000,
    expectedImpact: "25-35%",
    immediate: [
      "Install emission monitoring systems",
      "Enforce pollution standards",
      "Mandate cleaner fuels",
      "Regular industry audits",
    ],
    longTerm: [
      "Transition to clean technologies",
      "Establish green industrial zones",
      "Implement carbon trading",
      "Develop circular economy",
    ],
  },
  construction: {
    name: "Construction & Dust",
    priority: "HIGH",
    icon: HardHat,
    color: "#10b981",
    budget: 3750,
    expectedImpact: "15-25%",
    immediate: [
      "Mandate dust suppression systems",
      "Regular water spraying",
      "Cover construction materials",
      "Restrict construction timing",
    ],
    longTerm: [
      "Green building standards",
      "Advanced dust control tech",
      "Sustainable construction practices",
      "Smart monitoring systems",
    ],
  },
  urbanForest: {
    name: "Urban Forestry",
    priority: "MEDIUM",
    icon: TreePine,
    color: "#06b6d4",
    budget: 3750,
    expectedImpact: "10-20%",
    immediate: [
      "Plant trees in hotspot areas",
      "Create green corridors",
      "Protect existing forests",
      "Community plantation drives",
    ],
    longTerm: [
      "Urban forest development",
      "Vertical gardens on buildings",
      "Green roof initiatives",
      "Biodiversity conservation",
    ],
  },
  renewable: {
    name: "Renewable Energy",
    priority: "MEDIUM",
    icon: Lightbulb,
    color: "#3b82f6",
    budget: 2500,
    expectedImpact: "8-15%",
    immediate: [
      "Solar panel installation program",
      "Subsidy for renewable energy",
      "Rooftop solar mandate",
      "Wind energy assessment",
    ],
    longTerm: [
      "100% renewable grid transition",
      "Energy storage systems",
      "Smart grid development",
      "Green hydrogen production",
    ],
  },
};

export const pollutantInfo = {
  PM2_5: {
    sources: [
      "Vehicle emissions",
      "Industrial activities",
      "Construction dust",
      "Biomass burning",
    ],
    health:
      "Penetrates deep into lungs causing respiratory and cardiovascular issues",
    solutions: [
      "Use public transport",
      "Reduce industrial emissions",
      "Control dust at construction sites",
    ],
  },
  PM10: {
    sources: [
      "Road dust",
      "Industrial processes",
      "Agriculture",
      "Construction",
    ],
    health: "Causes respiratory problems, aggravates asthma",
    solutions: ["Water spraying on roads", "Green barriers", "Paved roads"],
  },
  NO: {
    sources: ["Vehicle combustion", "Power plants", "Industrial boilers"],
    health: "Respiratory irritation, reduced lung function",
    solutions: ["Electric vehicles", "Catalytic converters", "Cleaner fuels"],
  },
  NO2: {
    sources: ["Vehicle combustion", "Power plants", "Industrial boilers"],
    health: "Respiratory irritation, reduced lung function",
    solutions: ["Electric vehicles", "Catalytic converters", "Cleaner fuels"],
  },
  SO2: {
    sources: ["Coal burning", "Oil refineries", "Metal smelting"],
    health: "Respiratory issues, bronchitis",
    solutions: ["Desulfurization", "Clean energy", "Emission controls"],
  },
  CO: {
    sources: ["Incomplete combustion", "Vehicles", "Fireplaces"],
    health: "Reduces oxygen delivery to organs",
    solutions: [
      "Vehicle maintenance",
      "Proper ventilation",
      "Emission standards",
    ],
  },
  O3: {
    sources: ["Formed by chemical reactions in sunlight (secondary pollutant)"],
    health: "Respiratory problems, chest pain",
    solutions: [
      "Reduce VOC emissions",
      "Limit outdoor activities during peak hours",
    ],
  },
  NOx: {
    sources: ["High temperature combustion", "Vehicles", "Industry"],
    health: "Respiratory irritation, acid rain contributor",
    solutions: ["SCR systems", "Low-NOx burners", "Clean fuels"],
  },
  NH3: {
    sources: ["Agricultural activities", "Fertilizers", "Animal waste"],
    health: "Respiratory irritation, forms particulate matter",
    solutions: ["Proper fertilizer management", "Waste treatment"],
  },
  Benzene: {
    sources: [
      "Petroleum products",
      "Vehicle emissions",
      "Industrial processes",
    ],
    health: "Carcinogenic, blood disorders",
    solutions: [
      "Reduce fuel evaporation",
      "Industrial controls",
      "Proper ventilation",
    ],
  },
};
