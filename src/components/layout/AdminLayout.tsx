
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const menuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/appointments', icon: Calendar, label: 'Agenda' },
    { path: '/admin/services', icon: Scissors, label: 'Serviços' },
    { path: '/admin/products', icon: Package, label: 'Produtos' },
    { path: '/admin/clients', icon: Users, label: 'Clientes' },
    { path: '/admin/commissions', icon: DollarSign, label: 'Comissões' },
    { path: '/admin/goals', icon: Target, label: 'Metas' },
    { path: '/admin/revenue', icon: BarChart, label: 'Faturamento' },
    { path: '/admin/settings', icon: Settings, label: 'Configurações' },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-barber-50 text-barber-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-barber-500'
                  }`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${
                    location.pathname === item.path ? 'text-barber-500' : 'text-gray-400'
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
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-barber-50 text-barber-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-barber-500'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${
                    location.pathname === item.path ? 'text-barber-500' : 'text-gray-400'
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
            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <img 
                src="https://randomuser.me/api/portraits/men/75.jpg" 
                alt="Admin" 
                className="w-10 h-10 rounded-full border-2 border-barber-400"
              />
            </div>
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
