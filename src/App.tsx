
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ClientPortal from "./pages/ClientPortal";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import AdminAppointments from "./pages/admin/Appointments";
import AdminServices from "./pages/admin/Services";
import AdminClients from "./pages/admin/Clients";
import AdminCommissions from "./pages/admin/Commissions";
import AdminGoals from "./pages/admin/Goals";
import AdminRevenue from "./pages/admin/Revenue";
import AdminSettings from "./pages/admin/Settings";

// Client booking pages
import Services from "./pages/Services";
import Barbers from "./pages/Barbers";
import Schedule from "./pages/Schedule";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas do cliente - site institucional */}
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Portal do cliente para agendamentos */}
          <Route path="/portal" element={<ClientPortal />} />
          <Route path="/portal/services" element={<Services />} />
          <Route path="/portal/barbers" element={<Barbers />} />
          <Route path="/portal/schedule" element={<Schedule />} />
          
          {/* Rotas administrativas - dashboard */}
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
