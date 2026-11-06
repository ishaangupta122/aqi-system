import { useState, useEffect } from "react";
import { Database, Eraser, Layers, Brain, Target, Zap, ArrowRight, ChartScatter } from "lucide-react";
import { api } from "../lib/api";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import Step from "../components/Step";
import Stat from "../components/Stat";
import Tag from "../components/Tag";
import InfoCard from "../components/InfoCard";
import { Chip, ChipGroup } from "../components/Chips";
import RegressionChart from "../components/RegressionChart";

const format = (number) => number.toLocaleString("en-US");

// Wording of each cleaning rule; the amounts are counted by the server
const cleaningRules = [
  { key: "empty_aqi", label: "Missing AQI", unit: "removed", detail: "Rows with no AQI value, the target" },
  { key: "aqi_above_500", label: "AQI above 500", unit: "removed", detail: "Outside the AQI scale" },
  { key: "impossible_readings", label: "Impossible readings", unit: "removed", detail: "Negative or unrealistically high pollutant values" },
  { key: "mostly_empty_rows", label: "3+ pollutants missing", unit: "removed", detail: "Missing 3 or more of the 7 pollutants" },
  { key: "filled_values", label: "Median-filled gaps", unit: "filled", detail: "Filled with the median, as readings are skewed" },
];

const transformations = [
  { name: "Month", text: "1 to 12, from the date" },
  { name: "Weekend flag", text: "1 for Saturday and Sunday, else 0" },
  { name: "Season", tag: "one-hot", text: "Winter, Summer, Post-monsoon (0/1)" },
];

const modelCards = [
  { name: "Random Forest", tag: "Decision trees", text: "Averages 500 trees; no scaling needed." },
  { name: "Multiple Linear Regression", tag: "Linear", text: "Straight-line equation on scaled inputs." },
  { name: "Polynomial Regression", tag: "Curved terms", text: "Polynomial terms on scaled inputs." },
];

const scaledNote = "Scaled inputs have a mean of 0 and a standard deviation of 1";

// How the models turn the inputs into an AQI, in order
const predictionFlow = [
  "7 pollutants + month + day type",
  "12 features built",
  "3 models predict AQI",
  "AQI clipped to 0 - 500",
  "Category + advice",
];

// Green marks the best value of a column, red the weakest
const metrics = [
  { key: "r2", label: "R² test", better: "high", digits: 3 },
  { key: "train_r2", label: "R² train", digits: 3 },
  { key: "mae", label: "MAE", better: "low", digits: 1 },
  { key: "rmse", label: "RMSE", better: "low", digits: 1 },
];

function cellTone(metric, row, rows) {
  // a train R² far above the test R² means overfitting
  if (!metric.better) return row.train_r2 - row.r2 > 0.05 ? "text-warning font-semibold" : "text-foreground";

  const values = rows.map((item) => item[metric.key]);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const best = metric.better === "high" ? highest : lowest;
  const worst = metric.better === "high" ? lowest : highest;
  if (row[metric.key] === best) return "text-success font-bold";
  if (row[metric.key] === worst) return "text-danger";
  return "text-foreground";
}

const headCell = "px-1 md:px-4 py-2 text-xs md:text-sm font-semibold text-foreground whitespace-nowrap";

function ScoreTable({ models, best }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs md:text-sm">
        <thead className="border-b border-border/60">
          <tr>
            <th className={`${headCell} text-left pl-0 md:pl-0`}>Model</th>
            {metrics.map((metric) => (
              <th key={metric.key} className={`${headCell} text-right`}>
                {metric.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {models.map((row) => (
            <tr key={row.name}>
              <td className="px-1 md:px-4 pl-0 md:pl-0 py-2 font-semibold text-foreground whitespace-nowrap">
                {row.name}
                {row.name === best && (
                  <Tag tone="success" className="hidden sm:inline ml-2">
                    Best
                  </Tag>
                )}
              </td>
              {metrics.map((metric) => (
                <td
                  key={metric.key}
                  className={`px-1 md:px-4 py-2 text-right ${cellTone(metric, row, models)}`}>
                  {row[metric.key].toFixed(metric.digits)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// The seven steps, from the numbers calculated by the server
function Steps({ data }) {
  const { cleaning, models, best } = data;
  const usableRows = data.train_rows + data.test_rows;

  const chips = [];
  for (const name of data.features) {
    chips.push({ name });
  }
  chips.push({ name: "AQI", tone: "primary" });

  return (
    <div>
      <Step
        number={1}
        icon={Database}
        title="Data Collection"
        tag="Source: Kaggle"
        subtitle="Daily air readings with a known AQI">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Stat value={format(data.raw_rows)} label="records, before cleaning" />
          <Stat value={data.raw_columns.length} label="columns" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.raw_columns.map((name) => (
            <Chip key={name}>{name}</Chip>
          ))}
        </div>
      </Step>

      <Step
        number={2}
        icon={Eraser}
        title="Data Cleaning"
        tag="Row removal + imputation"
        subtitle={
          <>
            {format(cleaning.rows_before)} rows became{" "}
            <span className="text-success font-semibold">{format(cleaning.rows_after)}</span> (
            {format(cleaning.rows_before - cleaning.rows_after)} removed)
          </>
        }>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {cleaningRules.map((rule) => (
            <Stat
              key={rule.key}
              value={format(cleaning[rule.key])}
              unit={rule.unit}
              label={rule.label}
              title={rule.detail}
              tone={rule.unit === "filled" ? "text-success" : "text-danger"}
            />
          ))}
        </div>
      </Step>

      <Step
        number={3}
        icon={Layers}
        title="Data Transformation"
        tag="Date → feature engineering"
        subtitle="The date becomes month, weekend flag and season">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {transformations.map((item) => (
            <InfoCard key={item.name} {...item} />
          ))}
        </div>
        <ChipGroup title="Inputs and target" chips={chips} />
      </Step>

      <Step
        number={4}
        icon={Brain}
        title="Model Training"
        tag="Supervised regression"
        subtitle="Three models learn from a random 80% of the rows">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat value={format(usableRows)} label="total rows" />
          <Stat value={format(data.train_rows)} label="training rows (80%)" />
          <Stat value={format(data.test_rows)} label="testing rows (20%)" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {modelCards.map((card) => (
            <InfoCard key={card.name} {...card} title={scaledNote} />
          ))}
        </div>
      </Step>

      <Step
        number={5}
        icon={Target}
        title="Evaluation"
        tag="Higher R², lower errors"
        subtitle={`Scores on the ${format(data.test_rows)} testing rows`}>
        <ScoreTable models={models} best={best} />
      </Step>

      <Step
        number={6}
        icon={Zap}
        title="Prediction"
        tag={`Main model: ${best}`}
        subtitle="How the models turn inputs into an AQI">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
          {predictionFlow.map((item, index) => (
            <span key={item} className="flex items-center gap-2">
              <span className="px-4 py-3 rounded-md bg-secondary/50 text-foreground">{item}</span>
              {index < predictionFlow.length - 1 && (
                <ArrowRight className="w-4 h-4 shrink-0 text-muted-foreground" />
              )}
            </span>
          ))}
        </div>
      </Step>

      <Step
        number={7}
        icon={ChartScatter}
        title="Model Comparison"
        tag="Closer to the line is better"
        subtitle="How close each model gets to the real AQI"
        last>
        <RegressionChart models={models} best={best} />
      </Step>
    </div>
  );
}

export default function ModelInfo() {
  // Scores, row counts and graph points are calculated by the server from the saved models
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  const load = () =>
    api
      .getModelComparison()
      .then((response) => setData(response.data))
      .catch(() => setFailed(true));

  function retry() {
    setFailed(false);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  let content = <LoadingState message="Loading the model results..." />;
  if (data) {
    content = <Steps data={data} />;
  } else if (failed) {
    content = <ErrorState message="Failed to load the model results" onRetry={retry} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Header
        title="Model Overview"
        description={
          <>
            <span className="text-primary font-medium">Supervised regression</span>: three models
            learn from labelled readings to predict air quality.
          </>
        }
      />
      {content}
    </div>
  );
}
