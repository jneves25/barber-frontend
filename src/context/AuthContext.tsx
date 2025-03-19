import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Definição dos tipos
export type UserRole = 'admin' | 'barber' | 'receptionist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

// Mock de usuários para demonstração
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin Silva',
    email: 'admin@barbearia.com',
    password: 'admin123',
    role: 'admin' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    id: '2',
    name: 'Carlos Silva',
    email: 'carlos@barbearia.com',
    password: 'carlos123',
    role: 'barber' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '3',
    name: 'Ricardo Gomes',
    email: 'ricardo@barbearia.com',
    password: 'ricardo123',
    role: 'barber' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: '4',
    name: 'Maria Recepcionista',
    email: 'maria@barbearia.com',
    password: 'maria123',
    role: 'receptionist' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

// Permissões por papel
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'view_all_appointments',
    'manage_appointments',
    'view_all_clients',
    'manage_clients',
    'view_all_services',
    'manage_services',
    'view_all_products',
    'manage_products',
    'view_all_barbers',
    'manage_barbers',
    'view_all_commissions',
    'manage_commissions',
    'view_all_goals',
    'manage_goals',
    'view_all_revenue',
    'manage_settings',
    'manage_permissions',
  ],
  barber: [
    'view_own_appointments',
    'manage_own_appointments',
    'view_appointments',
    'view_own_clients',
    'view_own_commissions',
    'view_own_goals',
    'view_goals',
    'view_own_revenue',
    'view_revenue',
    'manage_user_settings',
  ],
  receptionist: [
    'view_appointments',
    'manage_appointments',
    'view_clients',
    'manage_clients',
    'view_services',
    'view_products',
    'manage_products',
  ],
};

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar se o usuário está logado ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('barber_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simular uma chamada API com delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Credenciais inválidas');
      }
      
      // Remover a senha antes de armazenar
      const { password: _, ...safeUser } = foundUser;
      setUser(safeUser);
      
      // Armazenar no localStorage
      localStorage.setItem('barber_user', JSON.stringify(safeUser));
      
      toast.success('Login realizado com sucesso!');
      navigate('/admin');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao realizar login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('barber_user');
    toast.info('Logout realizado com sucesso');
    navigate('/login');
  };

  // Verificar permissão
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin tem todas as permissões
    return ROLE_PERMISSIONS[user.role].includes(permission);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
