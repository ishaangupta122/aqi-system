import { useState } from "react";
import { Activity } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { categoryByName, months, dayTypes, pollutants, presets } from "../lib/constants";
import Header from "../components/Header";
import SelectField from "../components/SelectField";
import PollutantSlider from "../components/PollutantSlider";
import PredictionResult from "../components/PredictionResult";

// The level of every pollutant, taken from getValue(pollutant)
function makeLevels(getValue) {
  const levels = {};
  for (const pollutant of pollutants) {
    levels[pollutant.name] = getValue(pollutant);
  }
  return levels;
}

// The server uses what it receives, so check the values here before sending them
function isValid(levels, month, dayType) {
  for (const { name, min, max } of pollutants) {
    const level = levels[name];
    if (!Number.isFinite(level) || level < min || level > max) return false;
  }
  const monthOk = months.some((option) => option.value === month);
  const dayTypeOk = dayTypes.some((option) => option.value === dayType);
  return monthOk && dayTypeOk;
}

export default function Prediction() {
  const [levels, setLevels] = useState(makeLevels((p) => p.default));
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [dayType, setDayType] = useState("weekday");
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const applyPreset = ({ name, values }) => {
    setLevels(makeLevels((p) => values[p.name]));
    setMonth(values.month);
    setDayType(values.day_type);
    toast.success(`Applied ${name} preset`);
  };

  const clearAll = () => {
    setLevels(makeLevels(() => 0));
    toast.success("Cleared all values");
  };

  const changeLevel = (name, value) =>
    setLevels((previous) => ({ ...previous, [name]: parseFloat(value) }));

  const predict = async () => {
    if (!isValid(levels, month, dayType)) {
      toast.error("Check the pollutant levels, the month and the day type");
      return;
    }
    setPredicting(true);
    try {
      const { data } = await api.predict({ ...levels, month, day_type: dayType });
      setPrediction(data);
      toast.success("AQI predicted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to predict AQI");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Inputs: the date settings, presets and pollutant levels */}
      <div className="space-y-9">
        <div className="space-y-6">
          <Header
            title="Real-Time AQI Prediction"
            description="Input pollutant levels and get instant air quality predictions"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <SelectField
              label="Month"
              value={month}
              onChange={(value) => setMonth(parseInt(value))}
              options={months}
            />
            <SelectField label="Day Type" value={dayType} onChange={setDayType} options={dayTypes} />
          </div>
        </div>

        <section>
          <div className="flex items-baseline justify-between gap-4 mb-4">
            <h2 className="text-base font-semibold text-foreground">Quick Presets</h2>
            <button
              onClick={clearAll}
              className="text-sm text-danger/80 hover:text-danger hover:underline underline-offset-4 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50">
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                style={{ "--c": categoryByName[preset.name].color }}
                className="preset-btn h-10 px-3 rounded-md text-sm font-medium flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {preset.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-4">Pollutant Levels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
            {pollutants.map((pollutant) => (
              <PollutantSlider
                key={pollutant.name}
                pollutant={pollutant}
                value={levels[pollutant.name]}
                onChange={changeLevel}
              />
            ))}
          </div>
        </section>

        <button
          onClick={predict}
          disabled={predicting}
          className="w-full h-11 bg-primary hover:bg-accent text-primary-foreground font-semibold tracking-wide rounded-md transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <Activity className={`w-5 h-5 ${predicting ? "animate-pulse" : ""}`} />
          {predicting ? "Predicting..." : "PREDICT AQI"}
        </button>
      </div>

      {prediction && <PredictionResult prediction={prediction} />}
    </div>
  );
}
