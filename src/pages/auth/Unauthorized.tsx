
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Unauthorized = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
			<ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
			<h1 className="text-3xl font-bold text-gray-900 mb-2">Acesso não autorizado</h1>
			<p className="text-gray-600 mb-6 max-w-md">
				Você não tem permissão para acessar esta página.
				{user?.role && (
					<span> Seu perfil atual ({user.role === 'ADMIN' ? 'Administrador' : user.role === 'USER' ? 'Funcionário' : 'Gerente'}) não possui as permissões necessárias.</span>
				)}
			</p>
			<div className="flex flex-col sm:flex-row gap-4">
				<Button
					variant="outline"
					onClick={() => navigate(-1)}
					className="flex items-center gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Voltar
				</Button>
				<Button
					onClick={() => navigate('/admin')}
				>
					Ir para o Dashboard
				</Button>
			</div>
		</div>
	);
};

export default Unauthorized;
