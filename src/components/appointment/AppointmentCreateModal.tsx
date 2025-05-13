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
import { Loader2, Plus, Minus, Calendar as CalendarIcon, Package, ShoppingBag, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from '@/utils/currency';

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
import UserService, { User } from '@/services/api/UserService';

interface AppointmentCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void; // Callback to refresh the appointments list
	initialDate?: Date; // Initial date for the appointment
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
	onSuccess,
	initialDate
}) => {
	const { user, companySelected } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

	// Data states
	const [clients, setClients] = useState<Client[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [professionals, setProfessionals] = useState<User[]>([]);
	const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

	// Form states
	const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
	const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
	const [selectedTime, setSelectedTime] = useState<string>("09:00");
	const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
	const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
	const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);
	const [currentProductId, setCurrentProductId] = useState<number | null>(null);

	// Calculated total
	const [total, setTotal] = useState<number>(0);
	const [serviceTotal, setServiceTotal] = useState<number>(0);
	const [productTotal, setProductTotal] = useState<number>(0);

	// Validation states
	const [errors, setErrors] = useState({
		client: false,
		date: false,
		services: false,
		professional: false
	});

	// Reset form when modal is opened/closed
	useEffect(() => {
		if (!isOpen) {
			resetForm();
		}
	}, [isOpen]);

	// Fetch data on modal open
	useEffect(() => {
		if (!isOpen) return;
		fetchData();
	}, [isOpen, companySelected.id]);

	// Update selectedDate when initialDate changes
	useEffect(() => {
		if (initialDate) {
			setSelectedDate(initialDate);
		}
	}, [initialDate]);

	// Fetch available time slots when professional, date, and services change
	useEffect(() => {
		if (selectedProfessionalId && selectedDate && selectedServices.length > 0) {
			fetchAvailableTimeSlots();
		} else {
			// Clear time slots if any required fields are missing
			setAvailableTimeSlots([]);
		}
	}, [selectedProfessionalId, selectedDate, selectedServices]);

	const fetchData = async () => {
		setIsLoadingData(true);
		try {
			const [clientsRes, servicesRes, productsRes, professionalsRes] = await Promise.all([
				ClientService.getAll(companySelected.id),
				ServiceService.getAllServices(companySelected.id),
				ProductService.getAllProducts(companySelected.id),
				UserService.getUsersByCompany(companySelected.id)
			]);

			if (clientsRes.success && clientsRes.data) setClients(clientsRes.data);
			if (servicesRes.success && servicesRes.data) setServices(servicesRes.data as Service[]);
			if (productsRes.success && productsRes.data) setProducts(productsRes.data as Product[]);
			if (professionalsRes.success && professionalsRes.data) {
				setProfessionals(professionalsRes.data);
				if (user?.role === 'USER') {
					setSelectedProfessionalId(Number(user.id));
				}
			}
		} catch (error) {
			console.error("Error fetching data:", error);
			toast.error("Erro ao carregar dados necessários");
		} finally {
			setIsLoadingData(false);
		}
	};

	const fetchAvailableTimeSlots = async () => {
		if (!selectedProfessionalId || !selectedDate) return;

		setIsLoadingTimeSlots(true);
		// Clear previous available time slots while loading
		setAvailableTimeSlots([]);

		try {
			// Ensure we send the date in YYYY-MM-DD format in the user's local timezone
			// This avoids timezone issues where the backend might interpret the date differently
			const year = selectedDate.getFullYear();
			const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
			const day = String(selectedDate.getDate()).padStart(2, '0');
			const formattedDate = `${year}-${month}-${day}`;

			console.log(`Selected date: ${selectedDate.toISOString()}`);
			console.log(`Formatted date for API: ${formattedDate}`);
			console.log(`Fetching available slots for professional ${selectedProfessionalId} on ${formattedDate}`);

			const response = await AppointmentService.getAvailableTimeSlots(
				selectedProfessionalId,
				companySelected.id,
				formattedDate
			);

			if (response.success && response.data) {
				console.log(`Received ${response.data.length} available time slots:`, response.data);
				setAvailableTimeSlots(response.data);

				// If there are available slots and the current selection is not available
				// or there is no current selection, select the first available slot
				if (response.data.length > 0) {
					if (!selectedTime || !response.data.includes(selectedTime)) {
						setSelectedTime(response.data[0]);
					}
				} else {
					// Clear selected time if no slots are available
					setSelectedTime("");
				}
			} else {
				console.error("Error fetching available time slots:", response.error);
				toast.error(response.error || "Erro ao carregar horários disponíveis");
				setAvailableTimeSlots([]);
				setSelectedTime("");
			}
		} catch (error) {
			console.error("Error fetching available time slots:", error);
			toast.error("Erro ao carregar horários disponíveis");
			setAvailableTimeSlots([]);
			setSelectedTime("");
		} finally {
			setIsLoadingTimeSlots(false);
		}
	};

	// Calculate total whenever selected services or products change
	useEffect(() => {
		const servicesTotal = selectedServices.reduce((total, item) => {
			return total + (item.service.price * item.quantity);
		}, 0);

		const productsTotal = selectedProducts.reduce((total, item) => {
			return total + (item.product.price * item.quantity);
		}, 0);

		setServiceTotal(servicesTotal);
		setProductTotal(productsTotal);
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
			date: !selectedDate || !selectedTime,
			services: selectedServices.length === 0,
			professional: !selectedProfessionalId
		};

		setErrors(newErrors);
		return !Object.values(newErrors).some(error => error);
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			toast.error("Por favor, preencha todos os campos obrigatórios");
			return;
		}

		// Create the appointment start datetime
		const startDateTime = new Date(selectedDate);
		const [hours, minutes] = selectedTime.split(':');
		startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0); // Zerando segundos e milissegundos

		console.log("Frontend startDateTime:", startDateTime);
		console.log("Frontend startDateTime ISO:", startDateTime.toISOString());

		const newAppointment: Appointment = {
			clientId: selectedClientId,
			userId: selectedProfessionalId,
			companyId: companySelected.id,
			value: total,
			status: AppointmentStatusEnum.PENDING,
			createdAt: new Date().toISOString(),
			scheduledTime: startDateTime.toISOString(), // Enviar como string ISO
			completedAt: null,
			services: selectedServices.map(item => ({
				serviceId: item.serviceId,
				quantity: item.quantity,
				service: item.service
			})),
			products: selectedProducts.map(item => ({
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
		setSelectedProfessionalId(user?.role === 'USER' ? Number(user.id) : null);
		setSelectedDate(initialDate || new Date());
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
								Cliente <span className="text-red-500">*</span>
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

						{/* Profissional */}
						<div className="space-y-2">
							<Label htmlFor="professional" className={errors.professional ? "text-red-500" : ""}>
								Profissional <span className="text-red-500">*</span>
							</Label>
							<Select
								onValueChange={(value) => {
									setSelectedProfessionalId(Number(value));
									setErrors(prev => ({ ...prev, professional: false }));
								}}
								value={selectedProfessionalId?.toString() || ""}
								disabled={user?.role === 'USER'}
							>
								<SelectTrigger className={`w-full ${errors.professional ? "border-red-500" : ""}`}>
									<SelectValue placeholder="Selecione um profissional" />
								</SelectTrigger>
								<SelectContent>
									{professionals.map((prof) => (
										<SelectItem
											key={prof.id}
											value={prof.id!.toString()}
											className="cursor-pointer hover:bg-gray-100"
										>
											{prof.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.professional && (
								<p className="text-sm text-red-500">Selecione um profissional</p>
							)}
						</div>

						{/* Serviços */}
						<div className="space-y-4 border p-4 rounded-lg bg-gray-50">
							<div className="flex justify-between items-center">
								<div className="flex items-center">
									<Package className="h-5 w-5 mr-2 text-blue-600" />
									<Label className="font-medium text-blue-800">Serviços <span className="text-red-500">*</span></Label>
								</div>
								<div className="flex items-center space-x-2">
									<Select
										onValueChange={(value) => setCurrentServiceId(Number(value))}
										value={currentServiceId?.toString() || ""}
										disabled={!selectedProfessionalId}
									>
										<SelectTrigger className="w-[200px]">
											<SelectValue placeholder="Selecione um serviço" />
										</SelectTrigger>
										<SelectContent>
											{services.map((service) => (
												<SelectItem key={service.id} value={service.id!.toString()}>
													{service.name} - {formatCurrency(service.price)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										onClick={handleAddService}
										disabled={!currentServiceId}
										size="sm"
										className="bg-blue-600 hover:bg-blue-700"
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div className="space-y-2">
								{selectedServices.length === 0 ? (
									<p className="text-sm text-gray-500">
										{!selectedProfessionalId
											? "Selecione um profissional para adicionar serviços"
											: "Nenhum serviço selecionado"}
									</p>
								) : (
									<div className="space-y-2">
										{selectedServices.map((item) => (
											<div
												key={item.serviceId}
												className="flex items-center justify-between p-3 bg-white rounded-lg border"
											>
												<div>
													<p className="font-medium">{item.service.name}</p>
													<p className="text-sm text-gray-500">{formatCurrency(item.service.price)}</p>
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
														<X className="h-4 w-4" />
													</Button>
												</div>
											</div>
										))}
										<div className="text-right font-medium text-sm text-gray-700">
											Subtotal serviços: {formatCurrency(serviceTotal)}
										</div>
									</div>
								)}
								{errors.services && (
									<p className="text-sm text-red-500">Selecione pelo menos um serviço</p>
								)}
							</div>
						</div>

						{/* Produtos */}
						<div className="space-y-4 border p-4 rounded-lg bg-gray-50">
							<div className="flex justify-between items-center">
								<div className="flex items-center">
									<ShoppingBag className="h-5 w-5 mr-2 text-green-600" />
									<Label className="font-medium text-green-800">Produtos</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Select
										onValueChange={(value) => setCurrentProductId(Number(value))}
										value={currentProductId?.toString() || ""}
										disabled={!selectedProfessionalId}
									>
										<SelectTrigger className="w-[200px]">
											<SelectValue placeholder="Selecione um produto" />
										</SelectTrigger>
										<SelectContent>
											{products.map((product) => (
												<SelectItem key={product.id} value={product.id!.toString()}>
													{product.name} - {formatCurrency(product.price)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										onClick={handleAddProduct}
										disabled={!currentProductId}
										size="sm"
										className="bg-green-600 hover:bg-green-700"
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div className="space-y-2">
								{selectedProducts.length === 0 ? (
									<p className="text-sm text-gray-500">
										{!selectedProfessionalId
											? "Selecione um profissional para adicionar produtos"
											: "Nenhum produto selecionado"}
									</p>
								) : (
									<div className="space-y-2">
										{selectedProducts.map((item) => (
											<div
												key={item.productId}
												className="flex items-center justify-between p-3 bg-white rounded-lg border"
											>
												<div>
													<p className="font-medium">{item.product.name}</p>
													<p className="text-sm text-gray-500">{formatCurrency(item.product.price)}</p>
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
														<X className="h-4 w-4" />
													</Button>
												</div>
											</div>
										))}
										<div className="text-right font-medium text-sm text-gray-700">
											Subtotal produtos: {formatCurrency(productTotal)}
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Data e Hora - Movidos para depois dos serviços */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50">
							<div className="space-y-2">
								<Label className={errors.date ? "text-red-500" : ""}>
									Data <span className="text-red-500">*</span>
								</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={`w-full justify-start text-left ${errors.date ? "border-red-500" : ""}`}
											disabled={!selectedProfessionalId || selectedServices.length === 0}
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
								{(!selectedProfessionalId || selectedServices.length === 0) && (
									<p className="text-sm text-gray-500">
										{!selectedProfessionalId
											? "Selecione um profissional primeiro"
											: "Selecione pelo menos um serviço primeiro"}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="time">
									Horário <span className="text-red-500">*</span>
								</Label>
								<Select
									onValueChange={setSelectedTime}
									value={selectedTime}
									disabled={isLoadingTimeSlots || availableTimeSlots.length === 0 || !selectedProfessionalId || selectedServices.length === 0}
								>
									<SelectTrigger>
										{isLoadingTimeSlots ? (
											<div className="flex items-center">
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												<span>Carregando horários...</span>
											</div>
										) : !selectedProfessionalId ? (
											<span>Selecione um profissional</span>
										) : selectedServices.length === 0 ? (
											<span>Selecione um serviço</span>
										) : availableTimeSlots.length === 0 ? (
											<span>Sem horários disponíveis</span>
										) : (
											<SelectValue placeholder="Selecione o horário" />
										)}
									</SelectTrigger>
									<SelectContent>
										{availableTimeSlots.length > 0 ? (
											availableTimeSlots.map((time) => (
												<SelectItem key={time} value={time}>
													{time}
												</SelectItem>
											))
										) : (
											<div className="px-2 py-4 text-sm text-gray-500 text-center">
												Sem horários disponíveis
											</div>
										)}
									</SelectContent>
								</Select>
								{availableTimeSlots.length === 0 && !isLoadingTimeSlots && selectedProfessionalId && selectedServices.length > 0 && (
									<p className="text-sm text-red-500">
										Não há horários disponíveis para esta data e profissional
									</p>
								)}
							</div>
						</div>

						{/* Total */}
						<div className="border-t pt-4">
							<div className="flex justify-between items-center">
								<span className="font-medium">Total do Agendamento</span>
								<span className="text-2xl font-bold text-primary">
									{formatCurrency(total)}
								</span>
							</div>
							{selectedProducts.length > 0 && (
								<div className="flex justify-end mt-1">
									<span className="text-sm text-gray-600">
										(Serviços: {formatCurrency(serviceTotal)} + Produtos: {formatCurrency(productTotal)})
									</span>
								</div>
							)}
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
						className="bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium"
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
