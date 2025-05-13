import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import NotFound from "./components/NotFound";
import Login from "./pages/auth/Login";
import Unauthorized from "./pages/auth/Unauthorized";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import ClientService from '@/services/api/ClientService';
import { useEffect, useState } from 'react';

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
import AdminSubscriptions from './pages/admin/Subscriptions';
import SubscriptionPlanDetails from './pages/admin/SubscriptionPlanDetails';

// Portal pages
import ClientPortal from "./pages/portal/ClientPortal";
import Confirmation from "./pages/portal/Confirmation";
import Products from "./pages/portal/Products";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<BrowserRouter>
				<AuthProvider>
					<Routes>
						{/* Rotas de autenticação */}
						<Route path="/login" element={<Login />} />
						<Route path="/unauthorized" element={<Unauthorized />} />

						{/* Portal do cliente para agendamentos */}
						<Route path="/portal/:slug" element={<ClientPortal />} />
						<Route path="/portal/:slug/confirmation" element={<Confirmation />} />
						<Route path="/portal/:slug/products" element={<Products />} />

						{/* Rotas administrativas - dashboard */}
						<Route path="/admin" element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						} />
						<Route path="/admin/dashboard" element={
							< ProtectedRoute >
								<Dashboard />
							</ProtectedRoute>
						} />
						<Route path="/admin/appointments" element={
							<ProtectedRoute requiredPermission="viewAllAppointments">
								<AdminAppointments />
							</ProtectedRoute>
						} />
						<Route path="/admin/services" element={
							<ProtectedRoute requiredPermission="viewAllServices">
								<AdminServices />
							</ProtectedRoute>
						} />
						<Route path="/admin/clients" element={
							<ProtectedRoute requiredPermission="viewAllClients">
								<AdminClients />
							</ProtectedRoute>
						} />
						<Route path="/admin/commissions" element={
							<ProtectedRoute requiredPermission="viewAllCommissions">
								<AdminCommissions />
							</ProtectedRoute>
						} />
						<Route path="/admin/goals" element={
							<ProtectedRoute requiredPermission="viewAllGoals">
								<AdminGoals />
							</ProtectedRoute>
						} />
						<Route path="/admin/revenue" element={
							<ProtectedRoute requiredPermission="viewFullRevenue">
								<AdminRevenue />
							</ProtectedRoute>
						} />
						<Route path="/admin/settings" element={
							<ProtectedRoute requiredPermission="manageSettings">
								<AdminSettings />
							</ProtectedRoute>
						} />
						<Route path="/admin/products" element={
							<ProtectedRoute requiredPermission="viewAllProducts">
								<AdminProducts />
							</ProtectedRoute>
						} />
						<Route path="/admin/permissions" element={
							<ProtectedRoute requiredPermission="managePermissions">
								<Permissions />
							</ProtectedRoute>
						} />
						<Route path="/admin/subscriptions" element={
							<ProtectedRoute requiredPermission="managePermissions">
								<AdminSubscriptions />
							</ProtectedRoute>
						} />
						<Route path="/admin/subscriptions/plan/:id" element={
							<ProtectedRoute requiredPermission="managePermissions">
								<SubscriptionPlanDetails />
							</ProtectedRoute>
						} />

						{/* Rota de fallback */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</AuthProvider>
			</BrowserRouter>
		</TooltipProvider>
	</QueryClientProvider >
);

export default App;
