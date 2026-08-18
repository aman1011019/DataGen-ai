import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import CreateDatasetPage from "./pages/CreateDatasetPage";
import MyDatasetsPage from "./pages/MyDatasetsPage";
import DatasetDetailPage from "./pages/DatasetDetailPage";
import TemplatesPage from "./pages/TemplatesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import AgentMonitorPage from "./pages/AgentMonitorPage";
import ValidationReportPage from "./pages/ValidationReportPage";
import BiasAnalysisPage from "./pages/BiasAnalysisPage";
import ExportPage from "./pages/ExportPage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SubscriptionProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-right" />
              <ErrorBoundary>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Public-Only Auth Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicOnlyRoute>
                        <RegisterPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <PublicOnlyRoute>
                        <RegisterPage />
                      </PublicOnlyRoute>
                    }
                  />

                  {/* Protected Workspace Dashboard Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="generate" element={<CreateDatasetPage />} />
                    <Route path="datasets" element={<MyDatasetsPage />} />
                    <Route path="datasets/:id" element={<DatasetDetailPage />} />
                    <Route path="templates" element={<TemplatesPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="agents" element={<AgentMonitorPage />} />
                    <Route path="validation" element={<ValidationReportPage />} />
                    <Route path="bias" element={<BiasAnalysisPage />} />
                    <Route path="export" element={<ExportPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  {/* Fallback 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </TooltipProvider>
          </SubscriptionProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
