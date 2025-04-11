"use client";

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Minus, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

import AppointmentService, {
	Appointment,
	AppointmentStatusEnum,
	Client,
	Product,
	Service
} from '@/services/api/AppointmentService';
import ClientService from '@/services/api/ClientService';
import ServiceService from '@/services/api/ServiceService';
import ProductService from '@/services/api/ProductService';

interface AppointmentCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void; // Callback to refresh the appointments list
}

interface ServiceItem {
	serviceId: number;
	quantity: number;
	service: Service;
}

interface ProductItem {
	productId: number;
	quantity: number;
	product: Product;
}

export const AppointmentCreateModal: React.FC<AppointmentCreateModalProps> = ({
	isOpen,
	onClose,
	onSuccess
}) => {
	const { user, companySelected } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);

	// Data states
	const [clients, setClients] = useState<Client[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [products, setProducts] = useState<Product[]>([]);

	// Form states
	const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [selectedTime, setSelectedTime] = useState<string>("09:00");
	const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
	const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
	const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);
	const [currentProductId, setCurrentProductId] = useState<number | null>(null);

	// Calculated total
	const [total, setTotal] = useState<number>(0);

	// Validation states
	const [errors, setErrors] = useState({
		client: false,
		date: false,
		services: false
	});

	// Fetch data on modal open
	useEffect(() => {
		if (!isOpen) return;
		fetchData();
	}, [isOpen, companySelected.id]);

	const fetchData = async () => {
		setIsLoadingData(true);
		try {
			const [clientsRes, servicesRes, productsRes] = await Promise.all([
				ClientService.getAll(companySelected.id),
				ServiceService.getAllServices(companySelected.id),
				ProductService.getAllProducts(companySelected.id)
			]);

			if (clientsRes.success && clientsRes.data) setClients(clientsRes.data);
			if (servicesRes.success && servicesRes.data) setServices(servicesRes.data);
			if (productsRes.success && productsRes.data) setProducts(productsRes.data);
		} catch (error) {
			console.error("Error fetching data:", error);
			toast.error("Erro ao carregar dados necessários");
		} finally {
			setIsLoadingData(false);
		}
	};

	// Calculate total whenever selected services or products change
	useEffect(() => {
		let servicesTotal = selectedServices.reduce((total, item) => {
			return total + (item.service.price * item.quantity);
		}, 0);

		let productsTotal = selectedProducts.reduce((total, item) => {
			return total + (item.product.price * item.quantity);
		}, 0);

		setTotal(servicesTotal + productsTotal);
	}, [selectedServices, selectedProducts]);

	const handleAddService = () => {
		if (!currentServiceId) return;

		const serviceToAdd = services.find(s => s.id === currentServiceId);
		if (!serviceToAdd) return;

		setSelectedServices([
			...selectedServices,
			{
				serviceId: serviceToAdd.id!,
				quantity: 1,
				service: serviceToAdd
			}
		]);

		setCurrentServiceId(null);
	};

	const handleAddProduct = () => {
		if (!currentProductId) return;

		const productToAdd = products.find(p => p.id === currentProductId);
		if (!productToAdd) return;

		setSelectedProducts([
			...selectedProducts,
			{
				productId: productToAdd.id!,
				quantity: 1,
				product: productToAdd
			}
		]);

		setCurrentProductId(null);
	};

	const handleServiceQuantityChange = (serviceId: number, quantity: number) => {
		if (quantity < 1) return;

		setSelectedServices(selectedServices.map(item => {
			if (item.serviceId === serviceId) {
				return { ...item, quantity };
			}
			return item;
		}));
	};

	const handleProductQuantityChange = (productId: number, quantity: number) => {
		if (quantity < 1) return;

		setSelectedProducts(selectedProducts.map(item => {
			if (item.productId === productId) {
				return { ...item, quantity };
			}
			return item;
		}));
	};

	const handleRemoveService = (serviceId: number) => {
		setSelectedServices(selectedServices.filter(item => item.serviceId !== serviceId));
	};

	const handleRemoveProduct = (productId: number) => {
		setSelectedProducts(selectedProducts.filter(item => item.productId !== productId));
	};

	const validateForm = (): boolean => {
		const newErrors = {
			client: !selectedClientId,
			date: !selectedDate,
			services: selectedServices.length === 0
		};

		setErrors(newErrors);
		return !Object.values(newErrors).some(error => error);
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			toast.error("Por favor, preencha todos os campos obrigatórios");
			return;
		}

		const dateTime = new Date(selectedDate);
		const [hours, minutes] = selectedTime.split(':');
		dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

		const newAppointment: Appointment = {
			id: 0, // Will be assigned by the API
			clientId: selectedClientId,
			userId: Number(user?.id),
			companyId: companySelected.id,
			value: total,
			status: AppointmentStatusEnum.PENDING,
			createdAt: new Date().toISOString(),
			scheduledTime: dateTime.toISOString(),
			completedAt: null,
			client: clients.find(c => c.id === selectedClientId)!,
			user: {
				id: Number(user?.id),
				name: user?.name || '',
				email: user?.email || ''
			},
			services: selectedServices.map(item => ({
				id: 0, // Will be assigned by the API
				appointmentId: 0, // Will be assigned by the API
				serviceId: item.serviceId,
				quantity: item.quantity,
				service: item.service
			})),
			products: selectedProducts.map(item => ({
				id: 0, // Will be assigned by the API
				appointmentId: 0, // Will be assigned by the API
				productId: item.productId,
				quantity: item.quantity,
				product: item.product
			}))
		};

		setIsLoading(true);
		try {
			const response = await AppointmentService.create(newAppointment);

			if (response.success) {
				toast.success("Agendamento criado com sucesso!");
				onSuccess();
				resetForm();
				onClose();
			} else {
				toast.error(response.error || "Erro ao criar agendamento");
			}
		} catch (error) {
			console.error("Error creating appointment:", error);
			toast.error("Erro ao conectar com o servidor");
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setSelectedClientId(null);
		setSelectedDate(new Date());
		setSelectedTime("09:00");
		setSelectedServices([]);
		setSelectedProducts([]);
		setCurrentServiceId(null);
		setCurrentProductId(null);
	};

	const timeOptions = [];
	for (let hour = 8; hour <= 20; hour++) {
		for (let minute = 0; minute < 60; minute += 30) {
			const formattedHour = hour.toString().padStart(2, '0');
			const formattedMinute = minute.toString().padStart(2, '0');
			timeOptions.push(`${formattedHour}:${formattedMinute}`);
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
				<DialogHeader className="space-y-2">
					<DialogTitle className="text-2xl font-bold">Criar Novo Agendamento</DialogTitle>
					<DialogDescription className="text-gray-500">
						Preencha os dados para criar um novo agendamento
					</DialogDescription>
				</DialogHeader>

				{isLoadingData ? (
					<div className="flex justify-center items-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : (
					<div className="space-y-6 py-4">
						{/* Cliente */}
						<div className="space-y-2">
							<Label htmlFor="client" className={errors.client ? "text-red-500" : ""}>
								Cliente *
							</Label>
							<Select
								onValueChange={(value) => {
									setSelectedClientId(Number(value));
									setErrors(prev => ({ ...prev, client: false }));
								}}
								value={selectedClientId?.toString() || ""}
							>
								<SelectTrigger className={`w-full ${errors.client ? "border-red-500" : ""}`}>
									<SelectValue placeholder="Selecione um cliente" />
								</SelectTrigger>
								<SelectContent>
									{clients.map((client) => (
										<SelectItem
											key={client.id}
											value={client.id!.toString()}
											className="cursor-pointer hover:bg-gray-100"
										>
											{client.name} ({client.phone})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.client && (
								<p className="text-sm text-red-500">Selecione um cliente</p>
							)}
						</div>

						{/* Data e Hora */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className={errors.date ? "text-red-500" : ""}>Data *</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={`w-full justify-start text-left ${errors.date ? "border-red-500" : ""
												}`}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{selectedDate ? (
												format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
											) : (
												<span>Selecione uma data</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={selectedDate}
											onSelect={(date) => {
												date && setSelectedDate(date);
												setErrors(prev => ({ ...prev, date: false }));
											}}
											initialFocus
											disabled={(date) => date < new Date()}
											className="rounded-md border"
										/>
									</PopoverContent>
								</Popover>
							</div>

							<div className="space-y-2">
								<Label htmlFor="time">Horário</Label>
								<Select
									onValueChange={setSelectedTime}
									value={selectedTime}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecione o horário" />
									</SelectTrigger>
									<SelectContent>
										{timeOptions.map((time) => (
											<SelectItem key={time} value={time}>
												{time}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Serviços */}
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<Label>Serviços</Label>
								<div className="flex items-center space-x-2">
									<Select
										onValueChange={(value) => setCurrentServiceId(Number(value))}
										value={currentServiceId?.toString() || ""}
									>
										<SelectTrigger className="w-[200px]">
											<SelectValue placeholder="Selecione um serviço" />
										</SelectTrigger>
										<SelectContent>
											{services.map((service) => (
												<SelectItem key={service.id} value={service.id!.toString()}>
													{service.name} - R$ {service.price.toFixed(2)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										onClick={handleAddService}
										disabled={!currentServiceId}
										size="sm"
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div className="space-y-2">
								{selectedServices.length === 0 ? (
									<p className="text-sm text-gray-500">Nenhum serviço selecionado</p>
								) : (
									<div className="space-y-2">
										{selectedServices.map((item) => (
											<div
												key={item.serviceId}
												className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
											>
												<div>
													<p className="font-medium">{item.service.name}</p>
													<p className="text-sm text-gray-500">R$ {item.service.price.toFixed(2)}</p>
												</div>
												<div className="flex items-center space-x-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleServiceQuantityChange(item.serviceId, item.quantity - 1)}
														disabled={item.quantity <= 1}
													>
														<Minus className="h-4 w-4" />
													</Button>
													<span className="w-8 text-center">{item.quantity}</span>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleServiceQuantityChange(item.serviceId, item.quantity + 1)}
													>
														<Plus className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleRemoveService(item.serviceId)}
														className="text-red-500 hover:text-red-700"
													>
														×
													</Button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Produtos */}
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<Label>Produtos</Label>
								<div className="flex items-center space-x-2">
									<Select
										onValueChange={(value) => setCurrentProductId(Number(value))}
										value={currentProductId?.toString() || ""}
									>
										<SelectTrigger className="w-[200px]">
											<SelectValue placeholder="Selecione um produto" />
										</SelectTrigger>
										<SelectContent>
											{products.map((product) => (
												<SelectItem key={product.id} value={product.id!.toString()}>
													{product.name} - R$ {product.price.toFixed(2)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										onClick={handleAddProduct}
										disabled={!currentProductId}
										size="sm"
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div className="space-y-2">
								{selectedProducts.length === 0 ? (
									<p className="text-sm text-gray-500">Nenhum produto selecionado</p>
								) : (
									<div className="space-y-2">
										{selectedProducts.map((item) => (
											<div
												key={item.productId}
												className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
											>
												<div>
													<p className="font-medium">{item.product.name}</p>
													<p className="text-sm text-gray-500">R$ {item.product.price.toFixed(2)}</p>
												</div>
												<div className="flex items-center space-x-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleProductQuantityChange(item.productId, item.quantity - 1)}
														disabled={item.quantity <= 1}
													>
														<Minus className="h-4 w-4" />
													</Button>
													<span className="w-8 text-center">{item.quantity}</span>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleProductQuantityChange(item.productId, item.quantity + 1)}
													>
														<Plus className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleRemoveProduct(item.productId)}
														className="text-red-500 hover:text-red-700"
													>
														×
													</Button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Total */}
						<div className="border-t pt-4">
							<div className="flex justify-between items-center">
								<span className="font-medium">Total</span>
								<span className="text-2xl font-bold text-primary">
									R$ {total.toFixed(2)}
								</span>
							</div>
						</div>
					</div>
				)}

				<DialogFooter className="space-x-2">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isLoading}
						className="w-full sm:w-auto"
					>
						Cancelar
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isLoading || isLoadingData}
						className="w-full sm:w-auto bg-primary hover:bg-primary/90"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Salvando...
							</>
						) : (
							"Criar Agendamento"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AppointmentCreateModal;
