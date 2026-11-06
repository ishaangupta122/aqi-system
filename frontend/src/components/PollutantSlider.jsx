import { categoryByName } from "../lib/constants";

const COLOR_SAFE = categoryByName.Good.color;
const COLOR_WARN = categoryByName.Moderate.color;
const COLOR_DANGER = categoryByName.Poor.color;
const COLOR_TRACK = "#45423d"; // unfilled track

// A slider whose bar is green up to the safe limit, amber up to twice the limit and red above
export default function PollutantSlider({ pollutant, value, onChange }) {
  const { safeLimit, max } = pollutant;
  const percent = (amount) => Math.min((amount / max) * 100, 100);
  const safePercent = percent(safeLimit);
  const warnPercent = percent(safeLimit * 2);
  const currentPercent = percent(value);

  // The thumb and the value take the colour of the zone the value is in
  let thumbColor = COLOR_DANGER;
  if (value <= safeLimit) {
    thumbColor = COLOR_SAFE;
  } else if (value <= safeLimit * 2) {
    thumbColor = COLOR_WARN;
  }

  // Fill the bar up to the value with the colours of the zones it has passed
  const zones = [
    { color: COLOR_SAFE, start: 0, end: safePercent },
    { color: COLOR_WARN, start: safePercent, end: warnPercent },
    { color: COLOR_DANGER, start: warnPercent, end: 100 },
  ];
  const stops = [];
  for (const zone of zones) {
    const filledTo = Math.min(currentPercent, zone.end);
    if (filledTo > zone.start) {
      stops.push(`${zone.color} ${zone.start}%`);
      stops.push(`${zone.color} ${filledTo}%`);
    }
  }
  stops.push(`${COLOR_TRACK} ${currentPercent}%`);
  stops.push(`${COLOR_TRACK} 100%`);

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-foreground">{pollutant.name}</label>
        <span className="text-sm tabular-nums">
          <span className="font-semibold" style={{ color: thumbColor }}>
            {value.toFixed(1)}
          </span>{" "}
          <span className="text-xs text-muted-foreground">{pollutant.unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={pollutant.min}
        max={max}
        step={pollutant.step}
        value={value}
        onChange={(e) => onChange(pollutant.name, e.target.value)}
        aria-label={pollutant.name}
        className="aqi-range w-full"
        style={{
          background: `linear-gradient(to right, ${stops.join(", ")})`,
          "--thumb": thumbColor,
        }}
      />
      <p className="text-xs text-muted-foreground">
        Safe limit: {safeLimit} {pollutant.unit}
      </p>
    </div>
  );
}
