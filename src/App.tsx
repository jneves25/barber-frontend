
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
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import AdminAppointments from "./pages/admin/Appointments";
import AdminServices from "./pages/admin/Services";
import AdminClients from "./pages/admin/Clients";
import AdminCommissions from "./pages/admin/Commissions";
import AdminGoals from "./pages/admin/Goals";
import AdminRevenue from "./pages/admin/Revenue";
import AdminSettings from "./pages/admin/Settings";
import AdminProducts from "./pages/admin/Products";
import Permissions from "./pages/admin/Permissions";

// Client booking pages
import Services from "./pages/Services";
import Barbers from "./pages/Barbers";
import Schedule from "./pages/Schedule";
import Products from "./pages/Products";

// Blog pages
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Blog routes */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* Portal do cliente para agendamentos */}
            <Route path="/portal" element={<ClientPortal />} />
            <Route path="/portal/services" element={<Services />} />
            <Route path="/portal/barbers" element={<Barbers />} />
            <Route path="/portal/schedule" element={<Schedule />} />
            <Route path="/portal/products" element={<Products />} />
            
            {/* Rotas administrativas - dashboard */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/appointments" element={
              <ProtectedRoute requiredPermission="view_appointments">
                <AdminAppointments />
              </ProtectedRoute>
            } />
            <Route path="/admin/services" element={
              <ProtectedRoute requiredPermission="view_services">
                <AdminServices />
              </ProtectedRoute>
            } />
            <Route path="/admin/clients" element={
              <ProtectedRoute requiredPermission="view_clients">
                <AdminClients />
              </ProtectedRoute>
            } />
            <Route path="/admin/commissions" element={
              <ProtectedRoute requiredPermission="view_commissions">
                <AdminCommissions />
              </ProtectedRoute>
            } />
            <Route path="/admin/goals" element={
              <ProtectedRoute requiredPermission="view_goals">
                <AdminGoals />
              </ProtectedRoute>
            } />
            <Route path="/admin/revenue" element={
              <ProtectedRoute requiredPermission="view_all_revenue">
                <AdminRevenue />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredPermission="manage_user_settings">
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute requiredPermission="view_products">
                <AdminProducts />
              </ProtectedRoute>
            } />
            <Route path="/admin/permissions" element={
              <ProtectedRoute requiredPermission="manage_permissions">
                <Permissions />
              </ProtectedRoute>
            } />
            
            {/* Rota de fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
