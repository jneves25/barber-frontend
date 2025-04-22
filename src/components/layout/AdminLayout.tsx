import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
	Calendar,
	Clipboard,
	DollarSign,
	Home,
	Scissors,
	Settings,
	Target,
	Users,
	Menu,
	X,
	BarChart,
	Edit,
	Trash2,
	Package,
	Shield,
	LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminLayoutProps {
	children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const { user, logout, hasPermission } = useAuth();

	// Menu items com checagem de permissão
	const menuItems = [
		{ path: '/admin', icon: Home, label: 'Dashboard', permission: null },
		{ path: '/admin/appointments', icon: Calendar, label: 'Agenda', permission: 'viewAllAppointments' },
		{ path: '/admin/services', icon: Scissors, label: 'Serviços', permission: 'viewAllServices' },
		{ path: '/admin/products', icon: Package, label: 'Produtos', permission: 'viewAllProducts' },
		{ path: '/admin/clients', icon: Users, label: 'Clientes', permission: 'viewAllClients' },
		{ path: '/admin/commissions', icon: DollarSign, label: 'Equipe', permission: 'viewAllCommissions' },
		{ path: '/admin/goals', icon: Target, label: 'Metas', permission: 'viewAllGoals' },
		{ path: '/admin/revenue', icon: BarChart, label: 'Faturamento', permission: 'viewFullRevenue' },
		{ path: '/admin/permissions', icon: Shield, label: 'Permissões', permission: 'managePermissions' },
		{ path: '/admin/settings', icon: Settings, label: 'Configurações', permission: 'manageSettings' },
	];

	// Filtrar itens de menu baseado em permissões
	const filteredMenuItems = menuItems.filter(item =>
		item.permission === null || hasPermission(item.permission)
	);

	const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

	const handleLogout = () => {
		logout();
	};

	// Verificar se o usuário está autenticado
	if (!user) {
		navigate('/login');
		return null;
	}

	return (
		<div className="min-h-screen flex bg-gray-50">
			{/* Sidebar para desktop */}
			<aside className="hidden lg:block w-64 bg-white shadow-sm h-screen fixed left-0 top-0 z-40 transition-all duration-300 border-r border-gray-100">
				<div className="p-5 border-b border-gray-100">
					<Link to="/" className="flex items-center space-x-2">
						<Scissors className="h-6 w-6 text-barber-500" />
						<span className="font-bold text-xl text-barber-500">BarberShop</span>
					</Link>
				</div>
				<nav className="p-4">
					<ul className="space-y-1">
						{filteredMenuItems.map((item) => (
							<li key={item.path}>
								<Link
									to={item.path}
									className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${location.pathname === item.path
										? 'bg-barber-50 text-barber-600 font-medium'
										: 'text-gray-600 hover:bg-gray-50 hover:text-barber-500'
										}`}
								>
									<item.icon className={`h-5 w-5 flex-shrink-0 ${location.pathname === item.path ? 'text-barber-500' : 'text-gray-400'
										}`} />
									<span>{item.label}</span>
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</aside>

			{/* Sidebar móvel */}
			<aside
				className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
					} transition-transform duration-300 ease-in-out`}
			>
				<div className="flex justify-between items-center p-5 border-b border-gray-100">
					<Link to="/" className="flex items-center space-x-2">
						<Scissors className="h-6 w-6 text-barber-500" />
						<span className="font-bold text-xl text-barber-500">BarberShop</span>
					</Link>
					<button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
						<X className="h-6 w-6" />
					</button>
				</div>
				<nav className="p-4">
					<ul className="space-y-1">
						{filteredMenuItems.map((item) => (
							<li key={item.path}>
								<Link
									to={item.path}
									className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${location.pathname === item.path
										? 'bg-barber-50 text-barber-600 font-medium'
										: 'text-gray-600 hover:bg-gray-50 hover:text-barber-500'
										}`}
									onClick={() => setSidebarOpen(false)}
								>
									<item.icon className={`h-5 w-5 flex-shrink-0 ${location.pathname === item.path ? 'text-barber-500' : 'text-gray-400'
										}`} />
									<span>{item.label}</span>
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</aside>

			{/* Conteúdo principal */}
			<div className="flex-1 transition-all duration-300 lg:ml-64 w-full">
				<header className="bg-white shadow-sm h-16 flex items-center px-4">
					<button
						onClick={toggleSidebar}
						className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
						aria-label="Toggle menu"
					>
						<Menu className="h-6 w-6" />
					</button>
					<h1 className="text-xl font-semibold text-gray-800 truncate">
						{filteredMenuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
					</h1>
					<div className="ml-auto flex items-center space-x-4">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="flex items-center space-x-2 focus:outline-none">
									<div className="relative">
										<img
											src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}`}
											alt={user?.name || "Usuário"}
											className="w-10 h-10 rounded-full border-2 border-barber-400"
										/>
									</div>
									<div className="hidden md:block text-left">
										<p className="text-sm font-medium">{user?.name}</p>
										<p className="text-xs text-gray-500 capitalize">{user?.role}</p>
									</div>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="cursor-pointer">
									<Edit className="mr-2 h-4 w-4" />
									<span>Editar Perfil</span>
								</DropdownMenuItem>
								{hasPermission('manage_user_settings') && (
									<DropdownMenuItem className="cursor-pointer">
										<Settings className="mr-2 h-4 w-4" />
										<span>Configurações</span>
									</DropdownMenuItem>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Sair</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</header>
				<main className="p-4 md:p-6 overflow-x-hidden">{children}</main>
			</div>

			{/* Overlay para fechar o menu no mobile */}
			{sidebarOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={toggleSidebar}
				/>
			)}
		</div>
	);
};

export default AdminLayout;
