
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors } from 'lucide-react';

interface ClientLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

const ClientLayout = ({ children, hideHeader = false }: ClientLayoutProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideHeader && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Scissors className="h-6 w-6 text-barber-400" />
              <span className="font-bold text-xl text-barber-500">BarberShop</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`${isActive("/") ? "text-barber-500" : "text-gray-700"} hover:text-barber-500 transition-colors`}
              >
                Início
              </Link>
              <Link 
                to="/pricing" 
                className={`${isActive("/pricing") ? "text-barber-500" : "text-gray-700"} hover:text-barber-500 transition-colors`}
              >
                Planos
              </Link>
              <Link 
                to="/about" 
                className={`${isActive("/about") ? "text-barber-500" : "text-gray-700"} hover:text-barber-500 transition-colors`}
              >
                Sobre
              </Link>
              <Link 
                to="/contact" 
                className={`${isActive("/contact") ? "text-barber-500" : "text-gray-700"} hover:text-barber-500 transition-colors`}
              >
                Contato
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="text-gray-700 hover:text-barber-500 transition-colors">
                Demo
              </Link>
              <Link to="/admin" className="bg-barber-400 text-white px-4 py-2 rounded-md hover:bg-barber-500 transition-colors">
                Entrar
              </Link>
            </div>
          </div>
        </header>
      )}
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-100 py-8 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="flex items-center space-x-2">
                <Scissors className="h-5 w-5 text-barber-400" />
                <span className="font-bold text-lg text-barber-500">BarberShop</span>
              </Link>
              <p className="text-gray-600 mt-2">A melhor plataforma para gestão de barbearias.</p>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Links rápidos</h4>
                <ul className="space-y-2">
                  <li><Link to="/pricing" className="text-gray-600 hover:text-barber-500">Planos</Link></li>
                  <li><Link to="/about" className="text-gray-600 hover:text-barber-500">Sobre nós</Link></li>
                  <li><Link to="/contact" className="text-gray-600 hover:text-barber-500">Contato</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contato</h4>
                <p className="text-gray-600">contato@barbershop.com</p>
                <p className="text-gray-600">(11) 99999-9999</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Endereço</h4>
                <p className="text-gray-600">Rua da Barbearia, 123</p>
                <p className="text-gray-600">São Paulo, SP</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-300 text-center text-gray-500">
            <p>© {new Date().getFullYear()} BarberShop. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
