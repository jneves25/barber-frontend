import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requiredPermission
}) => {
	const { isAuthenticated, isLoading, hasPermission, user } = useAuth();

	if (isLoading) {
		return <div className="flex h-screen items-center justify-center">Carregando...</div>;
	}

	// Verificar autenticação
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	// Verificar permissão específica (se fornecida)
	if (requiredPermission && !hasPermission(requiredPermission)) {
		return <Navigate to="/unauthorized" replace />;
	}

	return <>{children}</>;
};
