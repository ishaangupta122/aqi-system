import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import Layout from "./components/Layout";
import Prediction from "./pages/Prediction";
import ModelInfo from "./pages/ModelInfo";

const toastOptions = {
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
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Layout>
          <Routes>
            <Route path="/" element={<Prediction />} />
            <Route path="/model-info" element={<ModelInfo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>

        {/* Messages appear at the bottom right and can be closed */}
        <Toaster position="bottom-right" gutter={8} toastOptions={toastOptions}>
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <>
                  {icon}
                  {message}
                  {t.type !== "loading" && (
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      aria-label="Dismiss"
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </ToastBar>
          )}
        </Toaster>
      </div>
    </BrowserRouter>
  );
}
