import {
  Database,
  Eraser,
  Layers,
  SlidersHorizontal,
  Split,
  Brain,
  Target,
  Zap,
  ArrowRight,
} from "lucide-react";
import { getAQICategory } from "../lib/constants";

// Numbers come from the latest run of backend/model/model.py
const pollutantFeatures = ["PM2.5", "NO", "NO2", "NOx", "CO", "SO2", "O3"];
const timeFeatures = [
  "month",
  "is_weekend",
  "season_Winter",
  "season_Summer",
  "season_PostMonsoon",
];
const droppedColumns = ["PM10", "NH3", "Benzene", "Toluene", "Xylene", "City"];

const finalFeatures = [
  ...pollutantFeatures.map((name) => ({ name, tone: "green" })),
  ...timeFeatures.map((name) => ({ name, tone: "primary" })),
];
const unusedColumns = droppedColumns.map((name) => ({ name, tone: "red" }));

const dataFacts = [
  { value: "29,531", label: "daily records" },
  { value: "26", label: "cities" },
  { value: "2015 - 2020", label: "Jan 2015 to Jul 2020" },
  { value: "AQI", label: "target (0 - 500)" },
];

const cleaningRules = [
  { rule: "Empty AQI", why: "Target value is missing", amount: "4,681", unit: "rows removed" },
  { rule: "AQI above 500", why: "Outside the AQI scale", amount: "543", unit: "rows removed" },
  { rule: "Impossible readings", why: "Negative or impossibly high values", amount: "6", unit: "rows removed" },
  { rule: "Mostly empty rows", why: "3 or more of the 7 pollutants missing", amount: "383", unit: "rows removed" },
  { rule: "Missing values", why: "Remaining gaps filled with the median", amount: "3,653", unit: "values filled", filled: true },
];

// Highlighted words inside a description
const highlightTones = {
  primary: "text-primary font-medium",
  success: "text-success font-medium",
  danger: "text-danger font-medium",
};

function Hl({ tone = "primary", children }) {
  return <span className={highlightTones[tone]}>{children}</span>;
}

const transformations = [
  {
    name: "Month (1 - 12)",
    why: (
      <>
        Shows the yearly pattern: AQI is <Hl tone="danger">highest from Nov to Jan</Hl>{" "}
        and <Hl tone="success">lowest from Jul to Sep</Hl>.
      </>
    ),
    size: "1 column",
  },
  {
    name: "Weekend flag (0 / 1)",
    why: (
      <>
        Marks <Hl>Saturday and Sunday as 1</Hl> and other days as 0, so the model
        can compare weekends with weekdays.
      </>
    ),
    size: "1 column",
  },
  {
    name: "Season (one-hot)",
    why: (
      <>
        Winter (Dec - Feb), Summer (Mar - May) and Post-monsoon (Oct - Nov) each
        get a <Hl>0/1 column</Hl>. Monsoon (Jun - Sep) is the <Hl>baseline</Hl>,
        with all three at 0.
      </>
    ),
    size: "3 columns",
  },
];

const models = [
  {
    name: "Random Forest",
    type: "Ensemble of decision trees",
    text: "500 trees; the AQI is the average of their answers.",
  },
  {
    name: "Multiple Linear Regression",
    type: "Linear model",
    text: "One straight-line equation over the 12 features.",
  },
  {
    name: "Polynomial Regression",
    type: "Linear model on curved terms",
    text: "Linear regression on squared and interaction terms (91 terms).",
  },
];

const results = [
  { name: "Random Forest", r2: 0.908, trainR2: 0.988, mae: 19.6, mse: 966.7, rmse: 31.1, best: true },
  { name: "Polynomial", r2: 0.882, trainR2: 0.886, mae: 23.9, mse: 1237.8, rmse: 35.2 },
  { name: "Multiple Linear", r2: 0.836, trainR2: 0.833, mae: 27.9, mse: 1723.2, rmse: 41.5 },
];

// Green marks the best value of a column, red the weakest
const metricColumns = [
  { key: "r2", label: "R² test", better: "high" },
  { key: "trainR2", label: "R² train" },
  { key: "mae", label: "MAE", better: "low" },
  { key: "mse", label: "MSE", better: "low" },
  { key: "rmse", label: "RMSE", better: "low" },
];

const cellTone = (column, row) => {
  if (!column.better) {
    // a train R² far above the test R² means overfitting
    return row.trainR2 - row.r2 > 0.05
      ? "text-warning font-semibold"
      : "text-foreground";
  }
  const values = results.map((item) => item[column.key]);
  const best = column.better === "high" ? Math.max(...values) : Math.min(...values);
  const worst = column.better === "high" ? Math.min(...values) : Math.max(...values);
  if (row[column.key] === best) return "text-success font-bold";
  if (row[column.key] === worst) return "text-danger";
  return "text-foreground";
};

const predictionFlow = [
  "7 pollutants + month + day type",
  "12 features",
  "Random Forest",
  "AQI (0 - 500)",
  "Category + health advice",
];

const categories = [
  { range: "0 - 50", aqi: 25 },
  { range: "51 - 100", aqi: 75 },
  { range: "101 - 200", aqi: 150 },
  { range: "201 - 300", aqi: 250 },
  { range: "301 - 400", aqi: 350 },
  { range: "400+", aqi: 450 },
];

const chipTones = {
  green: "bg-success/10 text-success border-success/30",
  primary: "bg-primary/10 text-primary border-primary/30",
  red: "bg-danger/10 text-danger border-danger/30",
};

function Chip({ tone, children }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-mono border ${chipTones[tone]}`}>
      {children}
    </span>
  );
}

function Stat({ value, label }) {
  return (
    <div className="bg-secondary/50 border border-border rounded-lg p-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function ChipGroup({ title, chips }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Chip key={chip.name} tone={chip.tone}>
            {chip.name}
          </Chip>
        ))}
      </div>
    </div>
  );
}

const tableHead =
  "px-2 md:px-4 py-3 text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap";

// One full-width step of the timeline
function Step({ number, icon, title, subtitle, last, children }) {
  const Icon = icon;
  return (
    <div className="flex gap-3 md:gap-6">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center">
          {number}
        </div>
        {!last && <div className="flex-1 w-px bg-border mt-2" />}
      </div>
      <div
        className={`flex-1 min-w-0 bg-card border border-border rounded-lg p-5 md:p-6 space-y-4 ${last ? "" : "mb-6"}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/15 text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          How this system was built
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="text-primary font-semibold">
            Supervised regression
          </span>
          : the models learn from past readings with a known AQI and predict
          the AQI of new readings.
        </p>
      </div>

      <div>
        <Step
          number={1}
          icon={Database}
          title="Data Collection"
          subtitle="Daily air quality readings by city">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dataFacts.map((fact) => (
              <Stat key={fact.label} value={fact.value} label={fact.label} />
            ))}
          </div>
        </Step>

        <Step
          number={2}
          icon={Eraser}
          title="Data Cleaning"
          subtitle={
            <>
              29,531 rows became{" "}
              <span className="text-success font-semibold">23,918</span>
            </>
          }>
          <div className="divide-y divide-border border-y border-border">
            {cleaningRules.map((item) => (
              <div
                key={item.rule}
                className="py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{item.rule}</p>
                  <p className="text-sm text-muted-foreground">{item.why}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`font-semibold ${item.filled ? "text-success" : "text-danger"}`}>
                    {item.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </Step>

        <Step
          number={3}
          icon={Layers}
          title="Data Transformation"
          subtitle="The date becomes month, weekend flag and season">
          <div className="divide-y divide-border border-y border-border">
            {transformations.map((item) => (
              <div
                key={item.name}
                className="py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.why}</p>
                </div>
                <p className="text-sm font-semibold text-primary shrink-0">
                  {item.size}
                </p>
              </div>
            ))}
          </div>
          <ChipGroup title="Final features (12)" chips={finalFeatures} />
          <ChipGroup title="Columns not used" chips={unusedColumns} />
        </Step>

        <Step
          number={4}
          icon={SlidersHorizontal}
          title="Feature Scaling"
          subtitle="Standardization for the two regression models">
          <p className="text-sm text-muted-foreground">
            Every feature is rescaled to a{" "}
            <span className="text-primary font-medium">
              mean of 0 and a standard deviation of 1
            </span>
            , so no feature dominates because of its units. Random Forest does
            not need it.
          </p>
        </Step>

        <Step
          number={5}
          icon={Split}
          title="Train / Test Split"
          subtitle="Unseen rows to check the models">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat value="19,134" label="training rows (80%)" />
            <Stat value="4,784" label="testing rows (20%)" />
            <Stat value="Random" label="split, seed 42" />
          </div>
        </Step>

        <Step
          number={6}
          icon={Brain}
          title="Model Training"
          subtitle="Three regression models on the same data">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <div
                key={model.name}
                className="bg-secondary/50 border border-border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-foreground">{model.name}</h4>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary">
                  {model.type}
                </span>
                <p className="text-sm text-muted-foreground">{model.text}</p>
              </div>
            ))}
          </div>
        </Step>

        <Step
          number={7}
          icon={Target}
          title="Evaluation"
          subtitle="Scores on the testing rows">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-secondary/50 border-y border-border">
                <tr>
                  <th className={`${tableHead} text-left`}>Model</th>
                  {metricColumns.map((column) => (
                    <th key={column.key} className={`${tableHead} text-right`}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((row) => (
                  <tr key={row.name}>
                    <td className="px-2 md:px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      {row.name}
                      {row.best && (
                        <span className="hidden sm:inline ml-2 px-2 py-0.5 text-xs rounded-full bg-success/15 text-success">
                          Best
                        </span>
                      )}
                    </td>
                    {metricColumns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-2 md:px-4 py-3 text-right ${cellTone(column, row)}`}>
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            R² closer to 1 is better; for MAE, MSE and RMSE lower is better.
            Random Forest scores best, so it gives the main prediction.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span>
              <span className="text-success font-bold">Green</span> best
            </span>
            <span>
              <span className="text-danger font-bold">Red</span> weakest
            </span>
            <span>
              <span className="text-warning font-bold">Amber</span> overfitting
              (train R² far above test R²)
            </span>
          </div>
        </Step>

        <Step
          number={8}
          icon={Zap}
          title="Prediction"
          subtitle="What happens when you press Predict AQI"
          last>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {predictionFlow.map((item, index) => (
              <span key={item} className="flex items-center gap-2">
                {index > 0 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-foreground">
                  {item}
                </span>
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            The other two models are shown beside Random Forest for comparison.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {categories.map((item) => {
              const info = getAQICategory(item.aqi);
              return (
                <div
                  key={info.category}
                  className="rounded-lg border border-border p-3"
                  style={{ borderLeft: `3px solid ${info.color}` }}>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: info.color }}
                    />
                    {info.category}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.range}</p>
                </div>
              );
            })}
          </div>
        </Step>
      </div>
    </div>
  );
}
