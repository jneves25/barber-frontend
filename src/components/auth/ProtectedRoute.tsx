import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredPermission?: string | string[];
	customPermissionCheck?: () => boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requiredPermission,
	customPermissionCheck
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
	if (requiredPermission) {
		if (Array.isArray(requiredPermission)) {
			// Se for um array, verifica se o usuário possui pelo menos uma das permissões
			const hasAnyPermission = requiredPermission.some(permission => hasPermission(permission));
			if (!hasAnyPermission) {
				return <Navigate to="/unauthorized" replace />;
			}
		} else if (!hasPermission(requiredPermission)) {
			// Se for uma string e o usuário não tiver a permissão, redireciona
			return <Navigate to="/unauthorized" replace />;
		}
	}

	// Verificar função de permissão customizada (se fornecida)
	if (customPermissionCheck && !customPermissionCheck()) {
		return <Navigate to="/unauthorized" replace />;
	}

	return <>{children}</>;
};
