import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Send from "@/pages/Send";
import Receive from "@/pages/Receive";
import Swap from "@/pages/Swap";
import Convert from "@/pages/Convert";
import Settings from "@/pages/Settings";
import HistoryPage from "@/pages/HistoryPage";
import InternalTransfer from "@/pages/InternalTransfer";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import { WalletProvider } from "@/context/WalletContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading && !user) { 
    return (
      <div className="min-h-screen flex items-center justify-center bg-background bg-mesh text-foreground">
        <p>Initializing App...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background bg-mesh text-foreground">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <WalletProvider>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/send" element={<Send />} />
                    <Route path="/internal-transfer" element={<InternalTransfer />} />
                    <Route path="/receive" element={<Receive />} />
                    <Route path="/swap" element={<Swap />} />
                    <Route path="/convert" element={<Convert />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </WalletProvider>
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster />
    </div>
  );
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;