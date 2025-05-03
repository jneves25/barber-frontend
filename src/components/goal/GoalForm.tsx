import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Goal } from '@/services/api/GoalService';
import { useAuth } from '@/context/AuthContext';
import UserService from '@/services/api/UserService';
import { useEffect } from 'react';
import CurrencyInput from '@/components/ui/currency-input';

const MONTHS = [
	{ value: '1', label: 'Janeiro' },
	{ value: '2', label: 'Fevereiro' },
	{ value: '3', label: 'Março' },
	{ value: '4', label: 'Abril' },
	{ value: '5', label: 'Maio' },
	{ value: '6', label: 'Junho' },
	{ value: '7', label: 'Julho' },
	{ value: '8', label: 'Agosto' },
	{ value: '9', label: 'Setembro' },
	{ value: '10', label: 'Outubro' },
	{ value: '11', label: 'Novembro' },
	{ value: '12', label: 'Dezembro' },
];

const YEARS = Array.from({ length: 5 }, (_, i) => {
	const year = new Date().getFullYear() + i - 1;
	return { value: year.toString(), label: year.toString() };
});

interface GoalFormProps {
	initialData?: Goal;
	onSubmit: (data: Partial<Goal>) => Promise<void>;
	onCancel: () => void;
}

interface User {
	id: number;
	name: string;
}

const GoalForm: React.FC<GoalFormProps> = ({
	initialData,
	onSubmit,
	onCancel,
}) => {
	const { companySelected } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [users, setUsers] = useState<User[]>([]);
	const [formData, setFormData] = useState<Partial<Goal>>({
		userId: initialData?.userId || 0,
		companyId: companySelected?.id || 0,
		month: initialData?.month || new Date().getMonth() + 1,
		year: initialData?.year || new Date().getFullYear(),
		target: initialData?.target || 0,
	});
	const [errors, setErrors] = useState<{
		userId?: string;
		month?: string;
		year?: string;
		target?: string;
	}>({});

	// Added to check if editing mode
	const isEditing = !!initialData;

	useEffect(() => {
		const loadUsers = async () => {
			try {
				if (!companySelected?.id) return;

				// Use the new endpoint to get users by company
				const response = await UserService.getUsersByCompany(companySelected.id);

				if (response.success && response.data) {
					// Transform to the User interface
					const usersList = response.data.map(user => ({
						id: user.id || 0,
						name: user.name
					}));

					setUsers(usersList);
				}
			} catch (error) {
				console.error('Error loading users:', error);
			}
		};

		loadUsers();
	}, [companySelected?.id]);

	const handleChange = (field: string, value: any) => {
		setFormData({
			...formData,
			[field]: value,
		});

		// Limpar erro quando o campo é alterado
		if (errors[field as keyof typeof errors]) {
			setErrors({
				...errors,
				[field]: undefined
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Validar formulário
		let hasErrors = false;
		const newErrors: {
			userId?: string;
			month?: string;
			year?: string;
			target?: string;
		} = {};

		if (!formData.userId || formData.userId <= 0) {
			newErrors.userId = "Selecione um profissional";
			hasErrors = true;
		}

		if (!formData.month || formData.month <= 0) {
			newErrors.month = "Selecione um mês";
			hasErrors = true;
		}

		if (!formData.year || formData.year <= 0) {
			newErrors.year = "Selecione um ano";
			hasErrors = true;
		}

		if (!formData.target || formData.target <= 0) {
			newErrors.target = "A meta deve ser maior que zero";
			hasErrors = true;
		}

		if (hasErrors) {
			setErrors(newErrors);
			setIsLoading(false);
			return;
		}

		try {
			await onSubmit(formData);
		} catch (error) {
			console.error('Error submitting form:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="user">
					Profissional <span className="text-red-500">*</span>
				</Label>
				<Select
					value={formData.userId?.toString()}
					onValueChange={(value) => handleChange('userId', parseInt(value))}
					disabled={isLoading || isEditing} // Disable when editing
				>
					<SelectTrigger className={errors.userId ? "border-red-500" : ""}>
						<SelectValue placeholder="Selecione o profissional" />
					</SelectTrigger>
					<SelectContent>
						{users.map((user) => (
							<SelectItem key={user.id} value={user.id.toString()}>
								{user.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors.userId && (
					<p className="text-sm text-red-500">{errors.userId}</p>
				)}
				{isEditing && (
					<p className="text-sm text-gray-500 mt-1">
						Não é possível alterar o profissional ao editar uma meta.
					</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="month">
						Mês <span className="text-red-500">*</span>
					</Label>
					<Select
						value={formData.month?.toString()}
						onValueChange={(value) => handleChange('month', parseInt(value))}
						disabled={isLoading}
					>
						<SelectTrigger className={errors.month ? "border-red-500" : ""}>
							<SelectValue placeholder="Selecione o mês" />
						</SelectTrigger>
						<SelectContent>
							{MONTHS.map((month) => (
								<SelectItem key={month.value} value={month.value}>
									{month.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.month && (
						<p className="text-sm text-red-500">{errors.month}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="year">
						Ano <span className="text-red-500">*</span>
					</Label>
					<Select
						value={formData.year?.toString()}
						onValueChange={(value) => handleChange('year', parseInt(value))}
						disabled={isLoading}
					>
						<SelectTrigger className={errors.year ? "border-red-500" : ""}>
							<SelectValue placeholder="Selecione o ano" />
						</SelectTrigger>
						<SelectContent>
							{YEARS.map((year) => (
								<SelectItem key={year.value} value={year.value}>
									{year.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.year && (
						<p className="text-sm text-red-500">{errors.year}</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="target">
					Meta (R$) <span className="text-red-500">*</span>
				</Label>
				<CurrencyInput
					id="target"
					value={formData.target || 0}
					onChange={(value) => handleChange('target', value)}
					placeholder="0,00"
					disabled={isLoading}
					className={errors.target ? "border-red-500" : ""}
				/>
				{errors.target && (
					<p className="text-sm text-red-500">{errors.target}</p>
				)}
				<p className="text-xs text-gray-500">
					Insira o valor da meta (ex: 1.000,00)
				</p>
			</div>

			<div className="flex justify-end gap-2 mt-4">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isLoading}
				>
					Cancelar
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? 'Salvando...' : (initialData ? 'Atualizar' : 'Criar')}
				</Button>
			</div>
		</form>
	);
};

export default GoalForm;
