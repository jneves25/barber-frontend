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
import { CommissionModeEnum, CommissionRuleTypeEnum } from '@/services/api/CommissionService';

interface CommissionRule {
	id: number;
	configId: number;
	serviceId: number;
	serviceType: CommissionRuleTypeEnum;
	percentage: number;
}

interface ServiceCommissionFormProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	barber: any; // Update this type based on your barber interface
	services: Service[];
	serviceCommissions: CommissionRule[];
	onSave: (barberId: number, serviceId: number, value: number, serviceType: CommissionRuleTypeEnum) => void;
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
	const [commissionTypes, setCommissionTypes] = useState<Record<number, CommissionRuleTypeEnum>>({});
	const [errors, setErrors] = useState<Record<number, string | null>>({});
	const [originalValues, setOriginalValues] = useState<Record<number, { value: number, type: CommissionRuleTypeEnum }>>({});

	useEffect(() => {
		const initialValues: Record<number, number> = {};
		const initialTypes: Record<number, CommissionRuleTypeEnum> = {};
		const originalData: Record<number, { value: number, type: CommissionRuleTypeEnum }> = {};

		if (barber && services) {
			services.forEach(service => {
				const existingCommission = serviceCommissions.find(
					commission => commission.serviceId === service.id
				);

				initialValues[service.id] = existingCommission ? existingCommission.percentage : 0;
				initialTypes[service.id] = existingCommission?.serviceType || CommissionRuleTypeEnum.PERCENTAGE;
				originalData[service.id] = {
					value: existingCommission ? existingCommission.percentage : 0,
					type: existingCommission?.serviceType || CommissionRuleTypeEnum.PERCENTAGE
				};
			});

			setEditValues(initialValues);
			setCommissionTypes(initialTypes);
			setOriginalValues(originalData);
		}
	}, [barber, serviceCommissions, services]);

	const handleInputChange = (serviceId: number, value: string) => {
		const numValue = Number(value);
		setEditValues(prev => ({
			...prev,
			[serviceId]: numValue
		}));
		validateCommission(serviceId, numValue, commissionTypes[serviceId]);
	};

	const handleTypeChange = (serviceId: number, type: CommissionRuleTypeEnum) => {
		setCommissionTypes(prev => ({
			...prev,
			[serviceId]: type
		}));
		validateCommission(serviceId, editValues[serviceId], type);
	};

	const validateCommission = (serviceId: number, value: number, type: CommissionRuleTypeEnum) => {
		let errorMessage: string | null = null;
		const service = services.find(s => s.id === serviceId);

		if (!service) return;

		if (type === CommissionRuleTypeEnum.PERCENTAGE) {
			if (value < 0 || value > 100) {
				errorMessage = 'Porcentagem deve estar entre 0 e 100';
			}
		} else {
			if (value < 0) {
				errorMessage = 'Valor deve ser maior que 0';
			} else if (value > service.price) {
				errorMessage = `Valor não pode ser maior que R$ ${service.price.toFixed(2)}`;
			}
		}

		setErrors(prev => ({
			...prev,
			[serviceId]: errorMessage
		}));
	};

	const handleSave = (serviceId: number) => {
		if (barber && !errors[serviceId]) {
			onSave(
				barber.id,
				serviceId,
				editValues[serviceId],
				commissionTypes[serviceId]
			);

			setOriginalValues(prev => ({
				...prev,
				[serviceId]: {
					value: editValues[serviceId],
					type: commissionTypes[serviceId]
				}
			}));
		}
	};

	const hasChanges = (serviceId: number) => {
		const original = originalValues[serviceId];
		return original?.value !== editValues[serviceId] ||
			original?.type !== commissionTypes[serviceId];
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
								<TableHead className="text-right">Ação</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{services.map((service) => (
								<TableRow key={service.id}>
									<TableCell className="font-medium">{service.name}</TableCell>
									<TableCell>R$ {service.price.toFixed(2)}</TableCell>
									<TableCell>
										<Select
											value={commissionTypes[service.id]}
											onValueChange={(value) => handleTypeChange(service.id, value as CommissionRuleTypeEnum)}
										>
											<SelectTrigger className="w-[110px]">
												<SelectValue placeholder="Tipo" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={CommissionRuleTypeEnum.PERCENTAGE}>Porcentagem</SelectItem>
												<SelectItem value={CommissionRuleTypeEnum.MONEY}>Valor Fixo</SelectItem>
											</SelectContent>
										</Select>
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											<Input
												type="number"
												min={0}
												max={service.price}
												value={editValues[service.id]}
												onChange={(e) => handleInputChange(service.id, e.target.value)}
												className={`w-24 ${errors[service.id] ? 'border-red-500' : ''}`}
											/>
											<span>{commissionTypes[service.id] === CommissionRuleTypeEnum.PERCENTAGE ? '%' : 'R$'}</span>
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
											disabled={!!errors[service.id] || !hasChanges(service.id)}
										>
											Alterar
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
