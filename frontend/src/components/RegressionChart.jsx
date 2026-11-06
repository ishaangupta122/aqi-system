import { useEffect, useId, useState } from "react";
import Tag from "./Tag";

// Size of the drawing: the main graph is wide, the others smaller, and all narrow on phones
const SIZES = {
  wide: { width: 900, height: 300, left: 56 },
  square: { width: 440, height: 290, left: 40 },
  phone: { width: 320, height: 290, left: 40 },
};
const TOP = 8;
const MUTED = "hsl(var(--muted-foreground))";

// True on phones, where every graph is drawn narrow so its text stays readable
function useIsPhone() {
  const query = "(max-width: 639px)";
  const [phone, setPhone] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setPhone(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return phone;
}

// Actual vs predicted AQI of one model: dots close to the dashed line are good predictions
function Panel({ model, axisMax, best, size }) {
  const id = useId();
  const { width, height, left } = SIZES[size];
  const right = width - 18;
  const bottom = height - 38;
  const ticks = [];
  for (let tick = 0; tick <= axisMax; tick += 100) {
    ticks.push(tick);
  }
  const scale = (value) => Math.min(Math.max(value, 0), axisMax) / axisMax;
  const x = (value) => left + scale(value) * (right - left);
  const y = (value) => bottom - scale(value) * (bottom - TOP);
  const middle = (TOP + bottom) / 2;

  return (
    <figure className="bg-secondary/50 rounded-md p-4 space-y-2">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <span className="font-semibold text-foreground">
          {model.name}
          {best && (
            <Tag tone="success" className="ml-2 font-normal">
              Best
            </Tag>
          )}
        </span>
        <span className="text-xs text-muted-foreground">Avg error {Math.round(model.mae)}</span>
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-labelledby={id}>
        <title id={id}>{`Actual against predicted AQI for ${model.name}`}</title>

        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={left} x2={right} y1={y(tick)} y2={y(tick)} stroke="hsl(var(--border))" strokeWidth="0.5" />
            <text x={left - 6} y={y(tick) + 3} textAnchor="end" fontSize="10" fill={MUTED}>
              {tick}
            </text>
            <text x={x(tick)} y={bottom + 14} textAnchor="middle" fontSize="10" fill={MUTED}>
              {tick}
            </text>
          </g>
        ))}

        {/* Perfect prediction: predicted equals actual */}
        <line
          x1={x(0)}
          y1={y(0)}
          x2={x(axisMax)}
          y2={y(axisMax)}
          stroke="hsl(var(--danger))"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {model.points.map(([actual, predicted], index) => (
          <circle
            key={index}
            cx={x(actual)}
            cy={y(predicted)}
            r="2.4"
            fill="hsl(var(--primary))"
            fillOpacity="0.4"
          />
        ))}

        <text x={(left + right) / 2} y={bottom + 30} textAnchor="middle" fontSize="11" fill={MUTED}>
          Actual AQI
        </text>
        <text
          x="12"
          y={middle}
          textAnchor="middle"
          fontSize="11"
          fill={MUTED}
          transform={`rotate(-90 12 ${middle})`}>
          Predicted AQI
        </text>
      </svg>
    </figure>
  );
}

export default function RegressionChart({ models, best }) {
  const phone = useIsPhone();
  const main = models.find((model) => model.name === best);
  const others = models.filter((model) => model.name !== best);

  // One shared scale so the graphs can be compared by eye
  let highest = 0;
  for (const model of models) {
    for (const [actual, predicted] of model.points) {
      highest = Math.max(highest, actual, predicted);
    }
  }
  const axisMax = Math.min(500, Math.max(100, Math.ceil(highest / 100) * 100));

  return (
    <div className="space-y-3">
      <Panel model={main} axisMax={axisMax} best size={phone ? "phone" : "wide"} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {others.map((model) => (
          <Panel key={model.name} model={model} axisMax={axisMax} size={phone ? "phone" : "square"} />
        ))}
      </div>
    </div>
  );
}
