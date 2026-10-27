import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "../components/Header";
import HowItWorks from "../components/HowItWorks";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-4">
        <Header
          title="Air Quality Index Prediction"
          description="Predicts the AQI from pollutant levels, the month and the type of day."
        />
        <Link
          to="/predict"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-accent transition-colors">
          Open the predictor
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <HowItWorks />
    </div>
  );
}
