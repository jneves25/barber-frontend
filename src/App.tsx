
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import Barbers from "./pages/Barbers";
import Schedule from "./pages/Schedule";
import ContactInfo from "./pages/ContactInfo";
import Confirmation from "./pages/Confirmation";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import AdminAppointments from "./pages/admin/Appointments";
import AdminServices from "./pages/admin/Services";
import AdminClients from "./pages/admin/Clients";
import AdminCommissions from "./pages/admin/Commissions";
import AdminGoals from "./pages/admin/Goals";
import AdminRevenue from "./pages/admin/Revenue";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas do cliente */}
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/barbers" element={<Barbers />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/contact-info" element={<ContactInfo />} />
          <Route path="/confirmation" element={<Confirmation />} />
          
          {/* Rotas administrativas */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/clients" element={<AdminClients />} />
          <Route path="/admin/commissions" element={<AdminCommissions />} />
          <Route path="/admin/goals" element={<AdminGoals />} />
          <Route path="/admin/revenue" element={<AdminRevenue />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          {/* Rota de fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
