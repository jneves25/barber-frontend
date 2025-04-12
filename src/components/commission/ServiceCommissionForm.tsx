import React, { useState } from 'react';
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
import { Service } from '@/services/api/ServiceService';
import { CommissionRule } from '@/services/api/CommissionService';

interface ServiceCommission {
	barberId: number;
	serviceId: number;
	percentage: number;
}

interface ServiceCommissionFormProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	barber: any; // Update this type based on your barber interface
	services: Service[];
	serviceCommissions: CommissionRule[];
	onSave: (barberId: number, serviceId: number, percentage: number) => void;
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

	// Inicializa os valores de edição com os valores atuais
	React.useEffect(() => {
		const initialValues: Record<number, number> = {};
		if (barber) {
			serviceCommissions.forEach(commission => {
				initialValues[commission.serviceId] = commission.percentage;
			});

			// Para serviços que ainda não têm comissão definida, usar 0 ou um valor padrão
			services.forEach(service => {
				if (initialValues[service.id] === undefined) {
					initialValues[service.id] = 0;
				}
			});

			setEditValues(initialValues);
		}
	}, [barber, serviceCommissions, services]);

	const handleInputChange = (serviceId: number, value: string) => {
		setEditValues({
			...editValues,
			[serviceId]: Number(value)
		});
	};

	const handleSave = (serviceId: number) => {
		if (barber) {
			onSave(barber.id, serviceId, editValues[serviceId]);
		}
	};

	if (!barber) return null;

	// Função para obter a porcentagem de comissão para um serviço específico
	const getCommissionPercentage = (serviceId: number): number => {
		const commission = serviceCommissions.find(
			c => c.serviceId === serviceId
		);

		return commission ? commission.percentage : 0;
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Comissões por Serviço</DialogTitle>
					<DialogDescription>
						{barber.commissionType === 'por_servico'
							? `Configure as comissões específicas por serviço para ${barber.barber}`
							: `Visualize as comissões por serviço para ${barber.barber} (comissão geral ativa)`}
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Serviço</TableHead>
								<TableHead>Preço (R$)</TableHead>
								<TableHead>Comissão (%)</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{services.map((service) => (
								<TableRow key={service.id}>
									<TableCell className="font-medium">{service.name}</TableCell>
									<TableCell>R$ {service.price.toFixed(2)}</TableCell>
									<TableCell>
										{barber.commissionType === 'por_servico' ? (
											<div className="flex items-center space-x-2">
												<Input
													type="number"
													min={0}
													max={100}
													value={editValues[service.id] || 0}
													onChange={(e) => handleInputChange(service.id, e.target.value)}
													className="w-20"
												/>
												<span>%</span>
											</div>
										) : (
											<span>{getCommissionPercentage(service.id)}%</span>
										)}
									</TableCell>
									<TableCell className="text-right">
										{barber.commissionType === 'por_servico' && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleSave(service.id)}
											>
												Salvar
											</Button>
										)}
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
