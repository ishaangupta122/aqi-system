import { AlertCircle, ChevronDown } from "lucide-react";
import { AQI_MAX, categories, getCategory } from "../lib/constants";

// Titles are white and semibold; descriptions and notes are muted
const label = "text-sm font-semibold text-foreground";

// The hero and the row below it share these two columns so their edges line up
const columns = "grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-x-14 gap-y-8";

const ticks = [0, 100, 200, 300, 400, 500];
const position = (aqi) => `${Math.min(Math.max(aqi / AQI_MAX, 0), 1) * 100}%`;

// The AQI categories as one bar sized by their range, with a marker where the prediction falls
function Scale({ aqi, category }) {
  return (
    <div>
      <div className="relative h-4">
        <ChevronDown
          className="absolute bottom-0 w-4 h-4 -translate-x-1/2"
          strokeWidth={3}
          style={{ left: position(aqi), color: category.color }}
        />
      </div>
      <div className="flex gap-0.5 h-2">
        {categories.map((item, index) => {
          const previousMax = index === 0 ? 0 : categories[index - 1].max;
          return (
            <div
              key={item.name}
              className="rounded-full"
              style={{
                flexGrow: item.max - previousMax,
                flexBasis: 0,
                background: item.color,
                opacity: item.name === category.name ? 1 : 0.3,
              }}
            />
          );
        })}
      </div>
      <div className="relative h-4 mt-1.5 text-xs leading-4 text-muted-foreground tabular-nums">
        {ticks.map((tick, index) => (
          <span
            key={tick}
            className="absolute"
            style={{
              left: position(tick),
              transform: `translateX(-${(index / (ticks.length - 1)) * 100}%)`,
            }}>
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
}

function Fact({ name, value, color, note, className = "" }) {
  return (
    <div className={className}>
      <dt className={label}>{name}</dt>
      <dd
        className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-base font-semibold leading-none"
        style={{ color }}>
        {value}
        {note && (
          <span className="text-sm font-normal leading-snug text-muted-foreground">({note})</span>
        )}
      </dd>
    </div>
  );
}

export default function PredictionResult({ prediction }) {
  const category = getCategory(prediction.aqi);

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">Prediction Breakdown</h2>

      {/* The AQI on the left; the scale and the category, season and health on the right, same height */}
      <div className={`${columns} lg:gap-y-4`}>
        <div className="flex flex-col justify-between gap-2 lg:row-span-2">
          <p className={`${label} leading-5`}>AQI (Random Forest)</p>
          <p
            className="text-5xl lg:text-7xl font-bold leading-none tracking-tight tabular-nums"
            style={{ color: category.color }}>
            {prediction.aqi.toFixed(1)}
          </p>
        </div>
        <Scale aqi={prediction.aqi} category={category} />
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:flex-wrap sm:justify-between">
          <Fact name="Category" value={category.name} color={category.color} />
          <Fact name="Season" value={prediction.season} />
          <Fact
            name="Health"
            value={category.health.label}
            color={category.health.color}
            note={category.description}
            className="col-span-2 sm:col-span-1"
          />
        </dl>
      </div>

      <div className={`mt-10 ${columns} items-start`}>
        {/* Every model's result; the Random Forest is the one used for the AQI above */}
        <div>
          <h3 className={label}>Models</h3>
          <div className="mt-3 max-w-sm space-y-2">
            {prediction.model_predictions.map((model) => {
              const modelCategory = getCategory(model.aqi);
              return (
                <div
                  key={model.name}
                  className="grid grid-cols-[minmax(0,1fr)_3.5rem_6rem] gap-x-4 items-baseline text-sm leading-snug">
                  <span
                    className={`text-foreground ${model.name === "Random Forest" ? "font-semibold" : ""}`}>
                    {model.name}
                  </span>
                  <span
                    className="text-right font-semibold tabular-nums"
                    style={{ color: modelCategory.color }}>
                    {model.aqi.toFixed(1)}
                  </span>
                  <span style={{ color: modelCategory.color }}>{modelCategory.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Health advisory: neutral, with only the icon in the category colour */}
        <div>
          <h3 className={`${label} flex items-center gap-2`}>
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: category.color }} />
            Health Advisory
          </h3>
          <ul className="mt-3 space-y-2">
            {category.advice.map((action) => (
              <li
                key={action}
                className="text-sm leading-snug text-muted-foreground flex items-start gap-3">
                <span className="mt-[7px] w-1 h-1 rounded-full shrink-0 bg-muted-foreground" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
