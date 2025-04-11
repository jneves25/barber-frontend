
import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Minus, X, Check, DollarSign, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Appointment, ServiceAppointment, ProductAppointment } from '@/services/api/AppointmentService';

interface OrderEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	appointment: Appointment | null;
	onSave: (appointment: Appointment) => Promise<void>;
}

export const OrderEditModal: React.FC<OrderEditModalProps> = ({ isOpen, onClose, appointment, onSave }) => {
	const [editedAppointment, setEditedAppointment] = useState<Appointment | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { hasPermission } = useAuth();

	useEffect(() => {
		if (appointment) {
			setEditedAppointment({ ...appointment });
		}
	}, [appointment]);

	const handleServiceQuantityChange = (serviceId: number, quantity: number) => {
		if (!editedAppointment) return;

		const updatedServices = editedAppointment.services.map(service => {
			if (service.serviceId === serviceId) {
				return { ...service, quantity };
			}
			return service;
		});

		setEditedAppointment({
			...editedAppointment,
			services: updatedServices,
			value: updatedServices.reduce((total, service) =>
				total + (service.service.price * service.quantity), 0
			)
		});
	};

	const handleProductQuantityChange = (productId: number, quantity: number) => {
		if (!editedAppointment) return;

		const updatedProducts = editedAppointment.products.map(product => {
			if (product.productId === productId) {
				return { ...product, quantity };
			}
			return product;
		});

		setEditedAppointment({
			...editedAppointment,
			products: updatedProducts,
			value: updatedProducts.reduce((total, product) =>
				total + (product.product?.price || 0) * product.quantity,
				editedAppointment.services.reduce((total, service) =>
					total + (service.service.price * service.quantity), 0
				)
			)
		});
	};

	const handleSave = async () => {
		if (!editedAppointment) return;

		setIsSubmitting(true);
		try {
			await onSave(editedAppointment);
			toast.success('Comanda atualizada com sucesso');
			onClose();
		} catch (error) {
			toast.error('Erro ao atualizar comanda');
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!editedAppointment) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						Comanda de {editedAppointment.client.name}
						<span className="ml-2 text-sm font-normal text-gray-500">
							({new Date(editedAppointment.scheduledTime).toLocaleTimeString()} - {editedAppointment.user.name})
						</span>
					</DialogTitle>
					<DialogDescription>
						Atualize os serviços e produtos da comanda.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Serviços */}
					<div className="space-y-4">
						<h3 className="font-medium">Serviços</h3>
						{editedAppointment.services.map((serviceAppointment) => (
							<div key={serviceAppointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div>
									<p className="font-medium">{serviceAppointment.service.name}</p>
									<p className="text-sm text-gray-500">R$ {serviceAppointment.service.price.toFixed(2)}</p>
								</div>
								<div className="flex items-center space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleServiceQuantityChange(serviceAppointment.serviceId, serviceAppointment.quantity - 1)}
										disabled={serviceAppointment.quantity <= 1}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<span className="w-8 text-center">{serviceAppointment.quantity}</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleServiceQuantityChange(serviceAppointment.serviceId, serviceAppointment.quantity + 1)}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>

					{/* Produtos */}
					<div className="space-y-4">
						<h3 className="font-medium">Produtos</h3>
						{editedAppointment.products.length > 0 ? (
							editedAppointment.products.map((productAppointment) => (
								<div key={productAppointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<div>
										<p className="font-medium">{productAppointment.product?.name}</p>
										<p className="text-sm text-gray-500">R$ {productAppointment.product?.price.toFixed(2)}</p>
									</div>
									<div className="flex items-center space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleProductQuantityChange(productAppointment.productId, productAppointment.quantity - 1)}
											disabled={productAppointment.quantity <= 1}
										>
											<Minus className="h-4 w-4" />
										</Button>
										<span className="w-8 text-center">{productAppointment.quantity}</span>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleProductQuantityChange(productAppointment.productId, productAppointment.quantity + 1)}
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))
						) : (
							<p className="text-sm text-gray-500">Nenhum produto adicionado</p>
						)}
					</div>

					{/* Total */}
					<div className="border-t pt-4">
						<div className="flex justify-between items-center">
							<span className="font-medium">Total</span>
							<span className="text-xl font-bold">R$ {editedAppointment.value.toFixed(2)}</span>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isSubmitting}>
						Cancelar
					</Button>
					<Button onClick={handleSave} disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Salvando...
							</>
						) : (
							'Salvar Alterações'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default OrderEditModal;
