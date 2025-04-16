
import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Service } from '@/services/api/ServiceService';
import { CommissionRule, CommissionModeEnum } from '@/services/api/CommissionService';

interface ServiceCommission {
	barberId: number;
	serviceId: number;
	percentage: number;
	fixedValue?: number;
	mode: CommissionModeEnum;
}

interface ServiceCommissionFormProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	barber: any; // Update this type based on your barber interface
	services: Service[];
	serviceCommissions: CommissionRule[];
	onSave: (barberId: number, serviceId: number, value: number, mode: CommissionModeEnum) => void;
}

const ServiceCommissionForm = ({
	isOpen,
	onOpenChange,
	barber,
	services,
	serviceCommissions,
	onSave
}: ServiceCommissionFormProps) => {
	const [editValues, setEditValues] = useState<Record<number, number>>({});
	const [commissionModes, setCommissionModes] = useState<Record<number, CommissionModeEnum>>({});
	const [errors, setErrors] = useState<Record<number, string | null>>({});

	// Initialize edit values with current values
	useEffect(() => {
		const initialValues: Record<number, number> = {};
		const initialModes: Record<number, CommissionModeEnum> = {};
		
		if (barber) {
			serviceCommissions.forEach(commission => {
				initialValues[commission.serviceId] = commission.percentage;
				initialModes[commission.serviceId] = commission.mode || CommissionModeEnum.PERCENTAGE;
			});

			// For services that don't have a commission defined yet, use 0 or default value
			services.forEach(service => {
				if (initialValues[service.id] === undefined) {
					initialValues[service.id] = 0;
				}
				if (initialModes[service.id] === undefined) {
					initialModes[service.id] = CommissionModeEnum.PERCENTAGE;
				}
			});

			setEditValues(initialValues);
			setCommissionModes(initialModes);
		}
	}, [barber, serviceCommissions, services]);

	const handleInputChange = (serviceId: number, value: string) => {
		const numValue = Number(value);
		setEditValues({
			...editValues,
			[serviceId]: numValue
		});
		validateCommission(serviceId, numValue, commissionModes[serviceId]);
	};

	const handleModeChange = (serviceId: number, mode: CommissionModeEnum) => {
		setCommissionModes({
			...commissionModes,
			[serviceId]: mode
		});
		validateCommission(serviceId, editValues[serviceId], mode);
	};

	const validateCommission = (serviceId: number, value: number, mode: CommissionModeEnum) => {
		let errorMessage: string | null = null;
		const service = services.find(s => s.id === serviceId);
		
		if (!service) return;

		if (mode === CommissionModeEnum.PERCENTAGE) {
			if (value < 0 || value > 100) {
				errorMessage = 'Porcentagem deve estar entre 0 e 100';
			}
		} else if (mode === CommissionModeEnum.FIXED) {
			if (value < 0) {
				errorMessage = 'Valor deve ser maior que 0';
			} else if (value > service.price) {
				errorMessage = `Valor não pode ser maior que R$ ${service.price.toFixed(2)}`;
			}
		}

		setErrors({
			...errors,
			[serviceId]: errorMessage
		});
	};

	const handleSave = (serviceId: number) => {
		if (barber && !errors[serviceId]) {
			onSave(
				barber.id, 
				serviceId, 
				editValues[serviceId],
				commissionModes[serviceId]
			);
		}
	};

	if (!barber) return null;

	// Function to get the commission for a specific service
	const getCommissionValue = (serviceId: number): number => {
		const commission = serviceCommissions.find(
			c => c.serviceId === serviceId
		);

		return commission ? commission.percentage : 0;
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[700px]">
				<DialogHeader>
					<DialogTitle>Comissões por Serviço</DialogTitle>
					<DialogDescription>
						Configure as comissões específicas por serviço para {barber?.user?.name}
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Serviço</TableHead>
								<TableHead>Preço (R$)</TableHead>
								<TableHead>Tipo</TableHead>
								<TableHead>Comissão</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{services.map((service) => (
								<TableRow key={service.id}>
									<TableCell className="font-medium">{service.name}</TableCell>
									<TableCell>R$ {service.price.toFixed(2)}</TableCell>
									<TableCell>
										<Select
											value={commissionModes[service.id] || CommissionModeEnum.PERCENTAGE}
											onValueChange={(value) => handleModeChange(service.id, value as CommissionModeEnum)}
										>
											<SelectTrigger className="w-[110px]">
												<SelectValue placeholder="Tipo" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={CommissionModeEnum.PERCENTAGE}>Porcentagem</SelectItem>
												<SelectItem value={CommissionModeEnum.FIXED}>Valor Fixo</SelectItem>
											</SelectContent>
										</Select>
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											<Input
												type="number"
												min={0}
												max={commissionModes[service.id] === CommissionModeEnum.PERCENTAGE ? 100 : service.price}
												value={editValues[service.id] || 0}
												onChange={(e) => handleInputChange(service.id, e.target.value)}
												className={`w-24 ${errors[service.id] ? 'border-red-500' : ''}`}
											/>
											<span>{commissionModes[service.id] === CommissionModeEnum.PERCENTAGE ? '%' : 'R$'}</span>
										</div>
										{errors[service.id] && (
											<p className="text-xs text-red-500 mt-1">{errors[service.id]}</p>
										)}
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleSave(service.id)}
											disabled={!!errors[service.id]}
										>
											Salvar
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				<DialogFooter>
					<Button onClick={() => onOpenChange(false)}>
						Fechar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ServiceCommissionForm;
