import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthService from '@/services/api/AuthService';
import { User } from '@/services/api/UserService';
import { Company } from '@/services/api/CompanyService';

// Definição dos tipos
export type UserRole = 'admin' | 'barber' | 'receptionist';

interface AuthContextType {
	user: User | null;
	companySelected: Company;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	hasPermission: (permission: string) => boolean;
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthChecking, setIsAuthChecking] = useState(true);
	const navigate = useNavigate();
	const companySelected = user?.companies?.[0] || null;

	// Verificar se o usuário está logado ao iniciar
	useEffect(() => {
		const checkAuth = async () => {
			const token = localStorage.getItem('auth_token');
			if (token) {
				try {
					const response = await AuthService.getCurrentUser();
					if (response.success && response.data) {
						setUser(response.data);
					} else {
						localStorage.removeItem('auth_token');
						localStorage.removeItem('user_type');
						navigate('/login');
					}
				} catch (error) {
					// Em caso de erro (401 ou outros), o interceptor do axios já vai lidar com a limpeza do token
					console.error('Erro ao recuperar dados do usuário:', error);
				}
			} else {
				// Se não houver token e estiver em uma rota protegida, redirecionar para login
				const isProtectedRoute = window.location.pathname.startsWith('/admin');
				if (isProtectedRoute) {
					navigate('/login');
				}
			}
			setIsAuthChecking(false);
			setIsLoading(false);
		};

		checkAuth();
	}, [navigate]);

	// Login
	const login = async (email: string, password: string) => {
		setIsLoading(true);

		try {
			const response = await AuthService.login({ email, password });

			if (response.success && response.data) {
				if (response.data.token) {
					localStorage.setItem('auth_token', response.data.token);
				}

				if (response.data.user) {
					setUser(response.data.user);
					localStorage.setItem('user', JSON.stringify(response.data.user));
					localStorage.setItem('user_type', 'user');
				}

				toast.success('Login realizado com sucesso!');
				navigate('/admin/dashboard');
			} else {
				throw new Error(response.error || 'Erro ao realizar login');
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Falha ao realizar login');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Logout
	const logout = () => {
		localStorage.removeItem('auth_token');
		localStorage.removeItem('user_type');
		localStorage.removeItem('user');
		setUser(null);
		navigate('/login');
	};

	// Verificar permissões
	const hasPermission = (permission: string): boolean => {
		if (!user || !user.permissions) return false;
		return user.permissions[permission as keyof typeof user.permissions] || false;
	};

	const value = {
		user,
		companySelected,
		isAuthenticated: !!user,
		isLoading: isLoading || isAuthChecking,
		login,
		logout,
		hasPermission,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
