import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import CityMap from "./pages/CityMap";
import Monitor from "./pages/Monitor";
import Analytics from "./pages/Analytics";
import Problems from "./pages/Problems";
import Solutions from "./pages/Solutions";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Dataset from "./pages/Dataset";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/map" element={<CityMap />} />
            <Route path="/monitor-cities" element={<Monitor />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/problems" element={<Problems />} />
            {/* <Route path="/solutions" element={<Solutions />} /> */}
            <Route path="/dataset" element={<Dataset />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsla(168, 76%, 42%, 0.2)",
              color: "hsl(168, 76%, 42%)",
              border: "1px solid hsla(168, 76%, 42%, 0.35)",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: "400",
              backdropFilter: "blur(6px)",
            },
            success: {
              style: {
                background: "hsla(168, 76%, 42%, 0.2)",
                color: "hsl(168, 76%, 42%)",
                border: "1px solid hsla(168, 76%, 42%, 0.35)",
              },
              icon: <CheckCircle className="w-5 h-5" />,
            },
            error: {
              style: {
                background: "hsla(0, 72%, 51%, 0.2)",
                color: "hsl(0, 72%, 51%)",
                border: "1px solid hsla(0, 72%, 51%, 0.35)",
              },
              icon: <AlertCircle className="w-5 h-5" />,
            },
            loading: {
              style: {
                background: "hsla(217, 91%, 60%, 0.2)",
                color: "hsl(217, 91%, 60%)",
                border: "1px solid hsla(217, 91%, 60%, 0.35)",
              },
              icon: <Info className="w-5 h-5" />,
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
