
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import ServiceService from '@/services/api/ServiceService';
import ProductService from '@/services/api/ProductService';

interface OrderEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	appointment: Appointment | null;
	onSave: (appointment: Appointment) => Promise<void>;
}

export const OrderEditModal: React.FC<OrderEditModalProps> = ({ isOpen, onClose, appointment, onSave }) => {
	const [editedAppointment, setEditedAppointment] = useState<Appointment | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { hasPermission, companySelected } = useAuth();
	const [allServices, setAllServices] = useState<Array<{id: number, name: string, price: number}>>([]);
	const [allProducts, setAllProducts] = useState<Array<{id: number, name: string, price: number, stock: number}>>([]);
	const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
	const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch available services and products when the modal opens
	useEffect(() => {
		if (isOpen && companySelected?.id) {
			fetchServicesAndProducts();
		}
	}, [isOpen, companySelected?.id]);

	const fetchServicesAndProducts = async () => {
		setIsLoading(true);
		try {
			const [servicesRes, productsRes] = await Promise.all([
				ServiceService.getAllServices(companySelected.id),
				ProductService.getAllProducts(companySelected.id)
			]);

			if (servicesRes.success && servicesRes.data) {
				setAllServices(servicesRes.data);
			}
			
			if (productsRes.success && productsRes.data) {
				setAllProducts(productsRes.data);
			}
		} catch (error) {
			toast.error('Erro ao carregar serviços e produtos');
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

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

		updateAppointmentValue(updatedServices, editedAppointment.products);
	};

	const handleProductQuantityChange = (productId: number, quantity: number) => {
		if (!editedAppointment) return;

		const updatedProducts = editedAppointment.products.map(product => {
			if (product.productId === productId) {
				return { ...product, quantity };
			}
			return product;
		});

		updateAppointmentValue(editedAppointment.services, updatedProducts);
	};

	const updateAppointmentValue = (services: ServiceAppointment[], products: ProductAppointment[]) => {
		if (!editedAppointment) return;
		
		const servicesTotal = services.reduce((total, service) => 
			total + (service.service.price * service.quantity), 0);
		
		const productsTotal = products.reduce((total, product) => 
			total + (product.product?.price || 0) * product.quantity, 0);
		
		setEditedAppointment({
			...editedAppointment,
			services,
			products,
			value: servicesTotal + productsTotal
		});
	};

	const handleAddService = () => {
		if (!editedAppointment || !selectedServiceId) return;
		
		// Check if service is already in the appointment
		const existingService = editedAppointment.services.find(s => s.serviceId === selectedServiceId);
		if (existingService) {
			// Increase quantity of existing service
			handleServiceQuantityChange(selectedServiceId, existingService.quantity + 1);
			toast.info('Quantidade do serviço atualizada');
			setSelectedServiceId(null);
			return;
		}
		
		// Find the service details
		const serviceToAdd = allServices.find(s => s.id === selectedServiceId);
		if (!serviceToAdd) return;
		
		// Create new service appointment
		const newServiceAppointment: ServiceAppointment = {
			id: 0, // Will be assigned by API
			appointmentId: editedAppointment.id,
			serviceId: selectedServiceId,
			quantity: 1,
			service: {
				id: serviceToAdd.id,
				name: serviceToAdd.name,
				price: serviceToAdd.price,
				duration: 30, // Default duration
				description: '',
				companyId: companySelected.id
			}
		};
		
		const updatedServices = [...editedAppointment.services, newServiceAppointment];
		updateAppointmentValue(updatedServices, editedAppointment.products);
		
		setSelectedServiceId(null);
		toast.success('Serviço adicionado');
	};

	const handleAddProduct = () => {
		if (!editedAppointment || !selectedProductId) return;
		
		// Check if product is already in the appointment
		const existingProduct = editedAppointment.products.find(p => p.productId === selectedProductId);
		if (existingProduct) {
			// Increase quantity of existing product
			handleProductQuantityChange(selectedProductId, existingProduct.quantity + 1);
			toast.info('Quantidade do produto atualizada');
			setSelectedProductId(null);
			return;
		}
		
		// Find the product details
		const productToAdd = allProducts.find(p => p.id === selectedProductId);
		if (!productToAdd) return;
		
		// Create new product appointment
		const newProductAppointment: ProductAppointment = {
			id: 0, // Will be assigned by API
			appointmentId: editedAppointment.id,
			productId: selectedProductId,
			quantity: 1,
			product: {
				id: productToAdd.id,
				name: productToAdd.name,
				price: productToAdd.price,
				stock: productToAdd.stock,
				description: '',
				imageUrl: '',
				companyId: companySelected.id
			}
		};
		
		const updatedProducts = [...editedAppointment.products, newProductAppointment];
		updateAppointmentValue(editedAppointment.services, updatedProducts);
		
		setSelectedProductId(null);
		toast.success('Produto adicionado');
	};

	const handleRemoveService = (serviceId: number) => {
		if (!editedAppointment) return;
		
		const updatedServices = editedAppointment.services.filter(service => service.serviceId !== serviceId);
		updateAppointmentValue(updatedServices, editedAppointment.products);
		toast.info('Serviço removido');
	};

	const handleRemoveProduct = (productId: number) => {
		if (!editedAppointment) return;
		
		const updatedProducts = editedAppointment.products.filter(product => product.productId !== productId);
		updateAppointmentValue(editedAppointment.services, updatedProducts);
		toast.info('Produto removido');
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

	// Filter out services and products that are already in the appointment
	const availableServices = allServices.filter(service => 
		!editedAppointment.services.some(s => s.serviceId === service.id)
	);
	
	const availableProducts = allProducts.filter(product => 
		!editedAppointment.products.some(p => p.productId === product.id)
	);

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
						<div className="flex items-center justify-between">
							<h3 className="font-medium">Serviços</h3>
							<div className="flex items-center space-x-2">
								<Select
									value={selectedServiceId?.toString() || ""}
									onValueChange={(value) => setSelectedServiceId(Number(value))}
									disabled={isLoading}
								>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Selecionar serviço" />
									</SelectTrigger>
									<SelectContent>
										{availableServices.map(service => (
											<SelectItem key={service.id} value={service.id.toString()}>
												{service.name} (R$ {service.price.toFixed(2)})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Button 
									size="sm" 
									onClick={handleAddService} 
									disabled={!selectedServiceId || isLoading}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>
						{editedAppointment.services.map((serviceAppointment) => (
							<div key={serviceAppointment.id || serviceAppointment.serviceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleRemoveService(serviceAppointment.serviceId)}
									>
										<X className="h-4 w-4 text-red-500" />
									</Button>
								</div>
							</div>
						))}
						{editedAppointment.services.length === 0 && (
							<p className="text-sm text-gray-500">Nenhum serviço adicionado</p>
						)}
					</div>

					{/* Produtos */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="font-medium">Produtos</h3>
							<div className="flex items-center space-x-2">
								<Select
									value={selectedProductId?.toString() || ""}
									onValueChange={(value) => setSelectedProductId(Number(value))}
									disabled={isLoading}
								>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Selecionar produto" />
									</SelectTrigger>
									<SelectContent>
										{availableProducts.map(product => (
											<SelectItem key={product.id} value={product.id.toString()}>
												{product.name} (R$ {product.price.toFixed(2)})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Button 
									size="sm" 
									onClick={handleAddProduct} 
									disabled={!selectedProductId || isLoading}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>
						{editedAppointment.products.length > 0 ? (
							editedAppointment.products.map((productAppointment) => (
								<div key={productAppointment.id || productAppointment.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleRemoveProduct(productAppointment.productId)}
										>
											<X className="h-4 w-4 text-red-500" />
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
