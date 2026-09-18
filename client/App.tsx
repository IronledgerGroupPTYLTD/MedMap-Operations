import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { MedMapProvider } from "@/lib/medmap-store";
import { SupabaseAuthProvider } from "@/lib/supabase-auth";
import { AuthGate } from "@/components/medmap/AuthGate";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Finance from "./pages/Finance";
import People from "./pages/People";
import Operations from "./pages/Operations";
import DoctorAcquisition from "./pages/DoctorAcquisition";
import Meetings from "./pages/Meetings";
import KPIs from "./pages/KPIs";
import ModulePage from "./pages/ModulePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseAuthProvider>
        <MedMapProvider>
          <AuthGate>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/people" element={<People />} />
                <Route path="/operations" element={<Operations />} />
                <Route
                  path="/doctor-acquisition"
                  element={<DoctorAcquisition />}
                />
                <Route path="/meetings" element={<Meetings />} />
                <Route path="/kpis" element={<KPIs />} />
                <Route
                  path="/organization"
                  element={<ModulePage module="organization" />}
                />
                <Route
                  path="/ambassadors"
                  element={<ModulePage module="ambassadors" />}
                />
                <Route path="/sales" element={<ModulePage module="sales" />} />
                <Route
                  path="/customer-operations"
                  element={<ModulePage module="customer-operations" />}
                />
                <Route
                  path="/technology"
                  element={<ModulePage module="technology" />}
                />
                <Route path="/risk" element={<ModulePage module="risk" />} />
                <Route
                  path="/reports"
                  element={<ModulePage module="reports" />}
                />
                <Route path="/admin" element={<ModulePage module="admin" />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthGate>
        </MedMapProvider>
      </SupabaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
