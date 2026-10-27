import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CheckCircle, AlertCircle } from "lucide-react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Predict from "./pages/Predict";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              padding: "12px 16px",
              fontSize: "14px",
            },
            success: { icon: <CheckCircle className="w-5 h-5 text-success" /> },
            error: { icon: <AlertCircle className="w-5 h-5 text-danger" /> },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
