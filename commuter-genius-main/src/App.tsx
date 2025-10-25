import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import MobileUserDashboard from "./pages/MobileUserDashboard";
import MobileAdminDashboard from "./pages/MobileAdminDashboard";
import DiagnosticTest from "./pages/DiagnosticTest";
import SafetyDashboard from "./pages/SafetyDashboard";
import OTPLogin from "./pages/OTPLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

console.log("🎯 App component loaded");

const App = () => {
  console.log("🎨 App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/test" element={<DiagnosticTest />} />
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<OTPLogin />} />
            <Route path="/mobile" element={<MobileUserDashboard />} />
            <Route path="/safety" element={<SafetyDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/mobile" element={<MobileAdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
