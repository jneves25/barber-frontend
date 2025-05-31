import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Scissors, Calendar, Clock, Star, MapPin, Phone, Loader2, CalendarDays, Mail, ChevronRight, ChevronLeft, InfoIcon, Check, Package, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import ServiceService, { Service as ServiceType } from '@/services/api/ServiceService';
import ProductService, { Product as ProductType } from '@/services/api/ProductService';
import AppointmentService, { Appointment, AppointmentStatusEnum, Service as AppointmentServiceType, AppointmentWithCustomer } from '@/services/api/AppointmentService';
import CompanyService, { Company } from '@/services/api/CompanyService';
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CustomerService, { Customer } from "@/services/api/CustomerService";
import { cleanPhoneNumber, handlePhoneInputChange, validatePhoneNumber } from '@/utils/phone';

interface Barber {
	id: number;
	name: string;
	image?: string;
}

interface DateOption {
	label: string;
	value: string;
	date: Date;
}

interface SelectedProduct {
	id: number;
	name: string;
	price: number;
	quantity: number;
}

interface AppointmentState {
	selectedServices: string[];
	selectedBarber: string;
	selectedDateOption: DateOption | null;
	selectedTime: string;
	selectedProducts: SelectedProduct[];
	totalPrice: number;
	totalDuration: number;
	activeTab: 'service' | 'barber' | 'date' | 'products' | 'confirm';
}

interface CustomerState {
	name: string;
	email: string;
	phone: string;
	userPhone: string;
	smsCode: string;
	isExistingClient: boolean;
	phoneVerified: boolean;
	showNameInput: boolean;
	verifyingPhone: boolean;
	customerData: Customer | null;
}

interface LoadingState {
	services: boolean;
	barbers: boolean;
	timeSlots: boolean;
	company: boolean;
	submitting: boolean;
}

const ClientPortal = () => {
	const { slug } = useParams<{ slug: string }>();
	const navigate = useNavigate();
	const form = useForm();

	// Estados consolidados
	const [appointment, setAppointment] = useState<AppointmentState>({
		selectedServices: [],
		selectedBarber: '',
		selectedDateOption: null,
		selectedTime: '',
		selectedProducts: [],
		totalPrice: 0,
		totalDuration: 0,
		activeTab: 'service'
	});

	const [customer, setCustomer] = useState<CustomerState>({
		name: '',
		email: '',
		phone: '',
		userPhone: '',
		smsCode: '',
		isExistingClient: false,
		phoneVerified: false,
		showNameInput: false,
		verifyingPhone: false,
		customerData: null
	});

	const [loading, setLoading] = useState<LoadingState>({
		services: true,
		barbers: true,
		timeSlots: false,
		company: true,
		submitting: false
	});

	const [company, setCompany] = useState<Company | null>(null);
	const [services, setServices] = useState<ServiceType[]>([]);
	const [products, setProducts] = useState<ProductType[]>([]);
	const [barbers, setBarbers] = useState<Barber[]>([]);
	const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
	const [visibleMonth, setVisibleMonth] = useState(format(new Date(), 'MMMM yyyy', { locale: ptBR }));
	const [showAvailableTimes, setShowAvailableTimes] = useState(false);
	const [currentDatePage, setCurrentDatePage] = useState(0);
	const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
	const [hasSavedClientData, setHasSavedClientData] = useState(false);
	const [totalPrice, setTotalPrice] = useState(0);
	const [totalDuration, setTotalDuration] = useState(0);
	const [activeTab, setActiveTab] = useState("service");
	const [isLoading, setIsLoading] = useState(false);

	// Funções auxiliares para atualizar estados
	const updateAppointment = (updates: Partial<AppointmentState>) => {
		setAppointment(prev => ({ ...prev, ...updates }));
	};

	const updateCustomer = (updates: Partial<CustomerState>) => {
		setCustomer(prev => ({ ...prev, ...updates }));
	};

	const updateLoading = (updates: Partial<LoadingState>) => {
		setLoading(prev => ({ ...prev, ...updates }));
	};

	// Efeitos
	useEffect(() => {
		if (!slug) {
			toast.error('URL inválida');
			return;
		}
		fetchCompanyBySlug();
		loadClientDataFromLocalStorage();
	}, [slug]);

	useEffect(() => {
		if (company) {
			fetchServices();
			fetchProducts();
			generateDateOptions();
			processCompanyMembers();
		}
	}, [company]);

	useEffect(() => {
		if (appointment.selectedBarber && appointment.selectedDateOption) {
			fetchAvailableTimeSlots();
		} else {
			setAvailableTimeSlots([]);
		}
	}, [appointment.selectedBarber, appointment.selectedDateOption]);

	useEffect(() => {
		updateTotals(appointment.selectedServices, appointment.selectedProducts);
	}, [appointment.selectedServices, appointment.selectedProducts, services, products]);

	// Funções de busca de dados
	const fetchCompanyBySlug = async () => {
		updateLoading({ company: true });
		try {
			if (!slug) {
				toast.error('URL inválida');
				return;
			}

			const response = await CompanyService.getCompanyBySlug(slug);
			if (response.success && response.data) {
				setCompany(response.data);
			} else {
				toast.error(response.error || 'Empresa não encontrada');
				navigate('/');
			}
		} catch (error) {
			toast.error('Erro ao carregar dados da empresa');
			navigate('/');
		} finally {
			updateLoading({ company: false });
		}
	};

	const fetchServices = async () => {
		if (!company?.id) return;

		updateLoading({ services: true });
		try {
			const response = await ServiceService.getServicesByCompanySlug(slug || '');
			if (response.success && response.data) {
				setServices(response.data);
			} else {
				toast.error(response.error || 'Erro ao carregar serviços');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
		} finally {
			updateLoading({ services: false });
		}
	};

	const fetchProducts = async () => {
		if (!slug) return;

		try {
			const response = await ProductService.getProductsByCompanySlug(slug);
			if (response.success && response.data) {
				setProducts(response.data);
			} else {
				console.log('Nenhum produto encontrado ou erro:', response.error);
			}
		} catch (error) {
			console.error('Erro ao carregar produtos:', error);
		}
	};

	const processCompanyMembers = () => {
		if (!company?.members) return;

		updateLoading({ barbers: true });
		try {
			const barbersList = company.members
				.filter(member => member.user)
				.map(member => ({
					id: member.user.id,
					name: member.user.name,
					image: member.user.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 30) + 30}.jpg`
				}));

			setBarbers(barbersList);
		} catch (error) {
			toast.error('Erro ao processar dados dos profissionais');
		} finally {
			updateLoading({ barbers: false });
		}
	};

	const generateDateOptions = () => {
		const options: DateOption[] = [];
		const today = new Date();
		const threeMonthsLater = addMonths(today, 3);

		const dateRange = eachDayOfInterval({
			start: today,
			end: threeMonthsLater
		});

		dateRange.forEach((date, index) => {
			const formattedDate = format(date, 'yyyy-MM-dd');
			let label = index === 0 ? 'Hoje' :
				index === 1 ? 'Amanhã' :
					format(date, 'dd/MM', { locale: ptBR });

			options.push({ label, value: formattedDate, date });
		});

		setDateOptions(options);
		updateVisibleDates(0, options);
	};

	const updateVisibleDates = (page: number, allOptions?: DateOption[]) => {
		const optionsToUse = allOptions || dateOptions;
		const datesPerPage = 14;
		const startIndex = page * datesPerPage;

		if (optionsToUse.length <= startIndex) {
			setCurrentDatePage(0);
		} else {
			setCurrentDatePage(page);
		}
	};

	const getCurrentMonthLabel = () => {
		if (dateOptions.length === 0) return '';

		const datesPerPage = 14;
		const startIndex = currentDatePage * datesPerPage;
		const visibleDates = dateOptions.slice(startIndex, startIndex + datesPerPage);

		if (visibleDates.length === 0) return '';
		return format(visibleDates[0].date, 'MMMM yyyy', { locale: ptBR });
	};

	const goToNextDatePage = () => {
		const datesPerPage = 14;
		const nextStartIndex = (currentDatePage + 1) * datesPerPage;

		if (nextStartIndex < dateOptions.length) {
			updateVisibleDates(currentDatePage + 1);
		}
	};

	const goToPrevDatePage = () => {
		if (currentDatePage > 0) {
			updateVisibleDates(currentDatePage - 1);
		}
	};

	const fetchAvailableTimeSlots = async () => {
		if (!appointment.selectedBarber || !appointment.selectedDateOption || !company?.id) return;

		updateLoading({ timeSlots: true });
		setAvailableTimeSlots([]);
		updateAppointment({ selectedTime: '' });

		try {
			const response = await AppointmentService.getAvailableTimeSlots(
				parseInt(appointment.selectedBarber),
				company.id,
				appointment.selectedDateOption.value
			);

			if (response.success && response.data) {
				setAvailableTimeSlots(response.data);
				if (response.data.length > 0) {
					updateAppointment({ selectedTime: response.data[0] });
				}
			} else {
				toast.error(response.error || 'Erro ao carregar horários disponíveis');
			}
		} catch (error) {
			toast.error('Erro ao buscar horários disponíveis');
		} finally {
			updateLoading({ timeSlots: false });
		}
	};

	const toggleServiceSelection = (serviceId: string) => {
		setAppointment(prev => {
			const isSelected = prev.selectedServices.includes(serviceId);
			const updatedServices = isSelected
				? prev.selectedServices.filter(id => id !== serviceId)
				: [...prev.selectedServices, serviceId];

			updateTotals(updatedServices, prev.selectedProducts);
			return { ...prev, selectedServices: updatedServices };
		});
	};

	const updateTotals = (selectedServiceIds: string[], selectedProducts: SelectedProduct[]) => {
		const selectedServicesData = services.filter(service =>
			selectedServiceIds.includes(String(service.id))
		);

		const servicesPrice = selectedServicesData.reduce((total, service) => total + service.price, 0);
		const servicesDuration = selectedServicesData.reduce((total, service) => total + service.duration, 0);

		const productsPrice = selectedProducts.reduce((total, product) => total + (product.price * product.quantity), 0);

		const totalPrice = servicesPrice + productsPrice;

		updateAppointment({ totalPrice, totalDuration: servicesDuration });
	};

	const addProductToSelection = (product: ProductType) => {
		setAppointment(prev => {
			const existingProduct = prev.selectedProducts.find(p => p.id === product.id);
			let updatedProducts: SelectedProduct[];

			if (existingProduct) {
				updatedProducts = prev.selectedProducts.map(p =>
					p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
				);
			} else {
				updatedProducts = [...prev.selectedProducts, {
					id: product.id!,
					name: product.name,
					price: product.price,
					quantity: 1
				}];
			}

			updateTotals(prev.selectedServices, updatedProducts);
			return { ...prev, selectedProducts: updatedProducts };
		});
	};

	const removeProductFromSelection = (productId: number) => {
		setAppointment(prev => {
			const existingProduct = prev.selectedProducts.find(p => p.id === productId);
			let updatedProducts: SelectedProduct[];

			if (existingProduct && existingProduct.quantity > 1) {
				updatedProducts = prev.selectedProducts.map(p =>
					p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
				);
			} else {
				updatedProducts = prev.selectedProducts.filter(p => p.id !== productId);
			}

			updateTotals(prev.selectedServices, updatedProducts);
			return { ...prev, selectedProducts: updatedProducts };
		});
	};

	const getProductQuantity = (productId: number): number => {
		const product = appointment.selectedProducts.find(p => p.id === productId);
		return product ? product.quantity : 0;
	};

	// Funções de cliente
	const loadClientDataFromLocalStorage = () => {
		try {
			const savedClientData = localStorage.getItem('clientData');
			if (savedClientData) {
				const clientData = JSON.parse(savedClientData);
				form.setValue('name', clientData.name || '');
				form.setValue('phone', clientData.phone || '');
				form.setValue('email', clientData.email || '');
				setHasSavedClientData(true);
			}
		} catch (error) {
			console.error('Erro ao carregar dados do cliente:', error);
		}
	};

	const handleVerifyPhone = async () => {
		const phoneError = validatePhoneNumber(customer.userPhone);
		if (phoneError) {
			toast.error(phoneError);
			return;
		}

		updateCustomer({ verifyingPhone: true });

		try {
			const cleanedPhone = cleanPhoneNumber(customer.userPhone);
			const response = await CustomerService.checkCustomerByPhone(cleanedPhone);

			if (response.success && response.data) {
				updateCustomer({
					isExistingClient: true,
					customerData: response.data,
					verifyingPhone: false
				});
				toast.success(`Olá ${response.data.name}! Enviamos um código de verificação por SMS.`);
			} else {
				updateCustomer({
					isExistingClient: false,
					showNameInput: true,
					verifyingPhone: false
				});
				toast.info("Você é um novo cliente. Por favor, informe seu nome para continuar.");
			}
		} catch (error) {
			toast.error("Erro ao verificar o telefone. Tente novamente.");
			updateCustomer({ verifyingPhone: false });
		}
	};

	const handleVerifySmsCode = async () => {
		if (!customer.smsCode || customer.smsCode.length < 6) {
			toast.error("Por favor, digite o código de 6 dígitos enviado por SMS");
			return;
		}

		try {
			const response = await CustomerService.verifySmsCode(customer.userPhone, customer.smsCode);

			if (response.success && response.data?.verified) {
				updateCustomer({
					phoneVerified: true,
					verifyingPhone: false
				});
				toast.success("Telefone verificado com sucesso!");

				if (customer.customerData) {
					updateCustomer({
						name: customer.customerData.name,
						email: customer.customerData.email || "",
						phone: customer.customerData.phone
					});
				}
			} else {
				toast.error("Código inválido. Tente novamente.");
			}
		} catch (error) {
			toast.error("Erro ao verificar o código. Tente novamente.");
		}
	};

	const handleCreateCustomer = async () => {
		if (!customer.name || customer.name.length < 3) {
			toast.error("Por favor, digite seu nome completo");
			return;
		}

		if (!appointment.selectedServices.length || !appointment.selectedBarber ||
			!appointment.selectedDateOption || !appointment.selectedTime || !company?.id) {
			toast.error("Por favor, complete todas as informações do agendamento");
			return;
		}

		setIsLoading(true);

		try {
			const selectedServicesObj = services.filter(s =>
				appointment.selectedServices.includes(String(s.id))
			);
			const servicesArray = selectedServicesObj.map(serviceObj => ({
				serviceId: serviceObj.id,
				quantity: 1
			}));

			const productsArray = appointment.selectedProducts.map(product => ({
				productId: product.id,
				quantity: product.quantity
			}));

			const [hours, minutes] = appointment.selectedTime.split(':').map(Number);
			const scheduledDate = new Date(appointment.selectedDateOption.date);
			scheduledDate.setHours(hours, minutes, 0, 0);

			const cleanedPhone = cleanPhoneNumber(customer.userPhone);

			const appointmentData: AppointmentWithCustomer = {
				companyId: company.id,
				userId: parseInt(appointment.selectedBarber),
				services: servicesArray,
				products: productsArray,
				scheduledTime: scheduledDate.toISOString(),
				customerPhone: cleanedPhone,
				customerName: customer.name,
				customerEmail: customer.email
			};

			const response = await AppointmentService.createClientAppointment(appointmentData);

			if (response.success) {
				updateCustomer({
					customerData: {
						id: response.data.clientId,
						name: customer.name,
						phone: cleanedPhone,
						email: customer.email
					},
					phoneVerified: true
				});
				toast.success("Seus dados foram salvos e seu agendamento foi confirmado!");
			} else {
				toast.error(response.error || "Erro ao finalizar o agendamento");
			}
		} catch (error) {
			console.error("Erro ao criar cliente:", error);
			toast.error("Erro ao finalizar o agendamento. Tente novamente.");
		} finally {
			setIsLoading(false);
		}
	};

	const resetAppointment = () => {
		updateAppointment({
			selectedServices: [],
			selectedBarber: '',
			selectedDateOption: null,
			selectedTime: '',
			selectedProducts: [],
			totalPrice: 0,
			totalDuration: 0,
			activeTab: 'service'
		});

		updateCustomer({
			name: '',
			email: '',
			phone: '',
			userPhone: '',
			smsCode: '',
			isExistingClient: false,
			phoneVerified: false,
			showNameInput: false,
			verifyingPhone: false,
			customerData: null
		});

		setActiveTab("service");

		navigate(`/portal/${slug}`);
	};

	if (loading.company) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="h-12 w-12 animate-spin text-barber-500 mx-auto mb-4" />
					<p className="text-lg text-gray-600">Carregando...</p>
				</div>
			</div>
		);
	}

	if (!company) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center max-w-md px-4">
					<div className="bg-red-50 p-4 rounded-lg mb-4">
						<h2 className="text-lg font-semibold text-red-600">Empresa não encontrada</h2>
						<p className="text-sm text-red-500">Verifique o link e tente novamente</p>
					</div>
					<Button onClick={() => navigate('/')} className="bg-barber-500 hover:bg-barber-600">
						Voltar para página inicial
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b border-gray-100 shadow-sm">
				<div className="container mx-auto py-4 px-4 flex justify-between items-center">
					<div className="flex items-center space-x-3">
						{company?.logo ? (
							<img src={company.logo} alt={company.name} className="h-8 w-8 object-contain" />
						) : (
							<Scissors className="h-6 w-6 text-barber-500" />
						)}
						<span className="font-bold text-lg text-gray-800">{company?.name}</span>
					</div>
					<div className="flex items-center space-x-4">
						{company?.phone && (
							<a href={`tel:${company.phone}`} className="hidden md:flex items-center text-gray-600 hover:text-barber-600 transition-colors">
								<Phone className="h-4 w-4 mr-2" />
								{company.phone}
							</a>
						)}
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="max-w-3xl mx-auto">
					<div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
						<div className="p-6 border-b border-gray-100">
							<h1 className="text-xl font-semibold text-gray-800">Agendamento online</h1>
							<p className="text-gray-500 text-sm mt-1">Escolha os serviços, profissional e horário de sua preferência</p>
						</div>

						<Tabs
							value={activeTab}
							onValueChange={(value) => {
								if (customer.phoneVerified) {
									return;
								}

								const currentIndex = ["service", "barber", "date", "products", "confirm"].indexOf(activeTab);
								const targetIndex = ["service", "barber", "date", "products", "confirm"].indexOf(value);

								if (targetIndex < currentIndex && !customer.phoneVerified) {
									setActiveTab(value);
									return;
								}

								if (value === "barber" && appointment.selectedServices.length === 0) {
									toast.error("Selecione pelo menos um serviço antes de continuar");
									return;
								}

								if (value === "date" && appointment.selectedBarber === '') {
									toast.error("Selecione um profissional antes de continuar");
									return;
								}

								if (value === "products" && (!appointment.selectedDateOption || !appointment.selectedTime)) {
									if (!appointment.selectedDateOption) {
										toast.error("Selecione uma data antes de continuar");
									} else {
										toast.error("Selecione um horário antes de continuar");
									}
									return;
								}

								if (value === "confirm" && (!appointment.selectedDateOption || !appointment.selectedTime)) {
									if (!appointment.selectedDateOption) {
										toast.error("Selecione uma data antes de continuar");
									} else {
										toast.error("Selecione um horário antes de continuar");
									}
									return;
								}

								setActiveTab(value);
							}}
							className="w-full"
						>
							<div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
								<TabsList
									className={`grid grid-cols-5 gap-1 p-1 bg-gray-100 rounded-lg ${customer.phoneVerified ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
										}`}
								>
									<TabsTrigger
										value="service"
										className={`data-[state=active]:bg-white data-[state=active]:text-barber-600 rounded-md py-2 ${customer.phoneVerified ? 'pointer-events-none opacity-50' : ''
											}`}
										disabled={customer.phoneVerified}
									>
										Serviços
									</TabsTrigger>
									<TabsTrigger
										value="barber"
										className={`data-[state=active]:bg-white data-[state=active]:text-barber-600 rounded-md py-2 ${(appointment.selectedServices.length === 0 && activeTab !== "barber") || customer.phoneVerified
											? "opacity-50 pointer-events-none"
											: ""
											}`}
										disabled={customer.phoneVerified}
									>
										Profissional
									</TabsTrigger>
									<TabsTrigger
										value="date"
										className={`data-[state=active]:bg-white data-[state=active]:text-barber-600 rounded-md py-2 ${(appointment.selectedBarber === '' && activeTab !== "date") || customer.phoneVerified
											? "opacity-50 pointer-events-none"
											: ""
											}`}
										disabled={customer.phoneVerified}
									>
										Data/Hora
									</TabsTrigger>
									<TabsTrigger
										value="products"
										className={`data-[state=active]:bg-white data-[state=active]:text-barber-600 rounded-md py-2 ${((!appointment.selectedDateOption || !appointment.selectedTime) && activeTab !== "products") || customer.phoneVerified
											? "opacity-50 pointer-events-none"
											: ""
											}`}
										disabled={customer.phoneVerified}
									>
										Produtos
									</TabsTrigger>
									<TabsTrigger
										value="confirm"
										className={`data-[state=active]:bg-white data-[state=active]:text-barber-600 rounded-md py-2 ${((!appointment.selectedDateOption || !appointment.selectedTime) && activeTab !== "confirm") || customer.phoneVerified
											? "opacity-50 pointer-events-none"
											: ""
											}`}
										disabled={customer.phoneVerified}
									>
										Confirmação
									</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent value="service" className="p-6 animate-in fade-in-50 duration-300">
								{loading.services ? (
									<div className="flex justify-center items-center py-12">
										<Loader2 className="h-8 w-8 animate-spin text-barber-500" />
									</div>
								) : (
									<div className="space-y-6">
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											{services.map((service) => (
												<div
													key={service.id}
													className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${appointment.selectedServices.includes(String(service.id))
														? 'ring-2 ring-barber-500 bg-barber-50'
														: 'hover:border-barber-300'
														}`}
													onClick={() => toggleServiceSelection(String(service.id))}
												>
													<div className="p-4 flex flex-row items-start gap-3">
														<div className="rounded-full bg-barber-100 p-2 flex-shrink-0">
															<Scissors className="h-5 w-5 text-barber-500" />
														</div>
														<div className="flex-1">
															<div className="flex justify-between items-start">
																<h3 className="font-medium text-gray-900">{service.name}</h3>
																<span className="font-semibold text-barber-600">R$ {service.price.toFixed(2)}</span>
															</div>
															<div className="flex items-center text-gray-500 text-sm mt-1">
																<Clock className="h-3.5 w-3.5 mr-1" />
																<span>{service.duration} min</span>
															</div>
															{service.description && (
																<p className="text-sm text-gray-500 mt-2 line-clamp-2">{service.description}</p>
															)}
														</div>
													</div>
												</div>
											))}
										</div>

										{appointment.selectedServices.length > 0 && (
											<div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in-50 duration-300">
												<div className="flex justify-between items-center">
													<div>
														<p className="text-sm text-gray-500">Serviços selecionados</p>
														<p className="font-medium">
															{appointment.selectedServices.length} {appointment.selectedServices.length === 1 ? 'serviço' : 'serviços'}
														</p>
													</div>
													<div className="text-right">
														<p className="text-sm text-gray-500">Tempo total</p>
														<p className="font-medium">{totalDuration} min</p>
													</div>
													<div className="text-right">
														<p className="text-sm text-gray-500">Valor total</p>
														<p className="font-medium text-barber-600">R$ {totalPrice.toFixed(2)}</p>
													</div>
												</div>
											</div>
										)}

										<div className="mt-6 flex justify-end">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span>
															<Button
																disabled={appointment.selectedServices.length === 0 || loading.services}
																onClick={() => setActiveTab("barber")}
																className="bg-barber-500 hover:bg-barber-600"
															>
																Continuar
															</Button>
														</span>
													</TooltipTrigger>
													{appointment.selectedServices.length === 0 && (
														<TooltipContent className="bg-red-50 border border-red-200 text-red-700 p-2">
															<p>Selecione pelo menos um serviço para continuar</p>
														</TooltipContent>
													)}
												</Tooltip>
											</TooltipProvider>
										</div>
									</div>
								)}
							</TabsContent>

							<TabsContent value="barber" className="p-6 animate-in fade-in-50 duration-300">
								{loading.barbers ? (
									<div className="flex justify-center items-center py-12">
										<Loader2 className="h-8 w-8 animate-spin text-barber-500" />
									</div>
								) : (
									<div className="space-y-6">
										<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
											{barbers.map((barber) => (
												<div
													key={barber.id}
													className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${appointment.selectedBarber === String(barber.id)
														? 'ring-2 ring-barber-500 bg-barber-50'
														: 'hover:border-barber-300'
														}`}
													onClick={() => {
														setActiveTab("date");
														updateAppointment({ selectedBarber: String(barber.id) });
													}}
												>
													<div className="w-16 h-16 rounded-full overflow-hidden mb-3">
														<img
															src={barber.image}
															alt={barber.name}
															className="w-full h-full object-cover"
														/>
													</div>
													<h3 className="font-medium text-center text-sm">{barber.name}</h3>
												</div>
											))}
										</div>

										<div className="mt-6 flex justify-between">
											<Button
												variant="outline"
												onClick={() => setActiveTab("service")}
											>
												Voltar
											</Button>
										</div>
									</div>
								)}
							</TabsContent>

							<TabsContent value="date" className="p-6 animate-in fade-in-50 duration-300">
								<div className="space-y-6">
									<div>
										<div className="flex justify-between items-center mb-3">
											<div className="flex flex-col">
												<label className="block text-sm font-medium">Escolha a data</label>
												<span className="text-xs text-gray-500 capitalize">{getCurrentMonthLabel()}</span>
											</div>
											<div className="flex items-center space-x-2">
												<button
													onClick={goToPrevDatePage}
													disabled={currentDatePage === 0}
													className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
													type="button"
												>
													<ChevronLeft className="h-5 w-5 text-gray-600" />
												</button>
												<button
													onClick={goToNextDatePage}
													className="p-1 rounded-full hover:bg-gray-100"
													type="button"
												>
													<ChevronRight className="h-5 w-5 text-gray-600" />
												</button>
											</div>
										</div>
										<div className="grid grid-cols-7 gap-2">
											{dateOptions.slice(currentDatePage * 14, currentDatePage * 14 + 14).map((option, index) => (
												<div
													key={index}
													className={`border rounded-lg p-3 text-center cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${appointment.selectedDateOption?.value === option.value
														? 'bg-barber-500 text-white ring-2 ring-barber-300'
														: 'hover:border-barber-300 bg-white'
														}`}
													onClick={() => updateAppointment({ selectedDateOption: option })}
												>
													<div className="flex flex-col items-center">
														<span className="text-sm font-medium">
															{option.label === 'Hoje' || option.label === 'Amanhã'
																? option.label
																: format(option.date, 'dd', { locale: ptBR })}
														</span>
														{option.label !== 'Hoje' && option.label !== 'Amanhã' && (
															<span className="text-xs opacity-80 mt-1">
																{format(option.date, 'EEE', { locale: ptBR })}
															</span>
														)}
													</div>
												</div>
											))}
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium mb-3">Escolha o horário</label>
										{loading.timeSlots ? (
											<div className="flex justify-center items-center py-8">
												<Loader2 className="h-6 w-6 animate-spin text-barber-500" />
											</div>
										) : availableTimeSlots.length > 0 ? (
											<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 animate-in fade-in-50 duration-300">
												{availableTimeSlots.map((time, index) => (
													<div
														key={index}
														className={`border rounded-lg p-3 text-center cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${appointment.selectedTime === time
															? 'bg-barber-500 text-white ring-2 ring-barber-300'
															: 'hover:border-barber-300 bg-white'
															}`}
														onClick={() => {
															updateAppointment({ selectedTime: time });
														}}
													>
														<span className="text-sm font-medium">{time}</span>
													</div>
												))}
											</div>
										) : (
											<div className="py-8 bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-gray-200">
												{appointment.selectedDateOption ? (
													<>
														<CalendarDays className="h-10 w-10 mb-3 text-gray-400" />
														<p className="text-gray-600 font-medium">Sem horários disponíveis para esta data</p>
														<p className="text-sm mt-1 text-gray-500">Por favor, selecione outra data</p>
													</>
												) : (
													<p className="text-gray-600">Selecione uma data para ver os horários disponíveis</p>
												)}
											</div>
										)}
									</div>

									<div className="mt-6 flex justify-between">
										<Button
											variant="outline"
											onClick={() => setActiveTab("barber")}
										>
											Voltar
										</Button>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span>
														<Button
															disabled={!appointment.selectedDateOption || !appointment.selectedTime || loading.timeSlots}
															onClick={() => setActiveTab("products")}
															className="bg-barber-500 hover:bg-barber-600"
														>
															Continuar
														</Button>
													</span>
												</TooltipTrigger>
												{(!appointment.selectedDateOption || !appointment.selectedTime) && !loading.timeSlots && (
													<TooltipContent className="bg-red-50 border border-red-200 text-red-700 p-2">
														<p>
															{!appointment.selectedDateOption
																? "Selecione uma data"
																: !appointment.selectedTime
																	? "Selecione um horário"
																	: "Selecione data e horário"}
														</p>
													</TooltipContent>
												)}
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="products" className="p-6 animate-in fade-in-50 duration-300">
								<div className="space-y-6">
									<div className="mb-4">
										<h3 className="text-lg font-semibold text-gray-800 mb-2">Produtos disponíveis</h3>
										<p className="text-sm text-gray-500">Selecione produtos adicionais para seu agendamento (opcional)</p>
									</div>

									{products.length === 0 ? (
										<div className="py-8 bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-gray-200">
											<Package className="h-10 w-10 mb-3 text-gray-400" />
											<p className="text-gray-600 font-medium">Nenhum produto disponível</p>
											<p className="text-sm mt-1 text-gray-500">Esta empresa não possui produtos cadastrados</p>
										</div>
									) : (
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											{products.map((product) => {
												const quantity = getProductQuantity(product.id!);
												return (
													<div
														key={product.id}
														className="border rounded-lg overflow-hidden transition-all duration-200"
													>
														<div className="p-4">
															<div className="flex items-start gap-3">
																<div className="rounded-full bg-blue-100 p-2 flex-shrink-0">
																	<Package className="h-5 w-5 text-blue-500" />
																</div>
																<div className="flex-1">
																	<div className="flex justify-between items-start mb-2">
																		<h3 className="font-medium text-gray-900">{product.name}</h3>
																		<span className="font-semibold text-blue-600">R$ {product.price.toFixed(2)}</span>
																	</div>
																	{product.description && (
																		<p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
																	)}
																	<div className="flex items-center justify-between">
																		<span className="text-xs text-gray-400">Estoque: {product.stock}</span>
																		<div className="flex items-center space-x-2">
																			{quantity > 0 && (
																				<Button
																					variant="outline"
																					size="sm"
																					onClick={() => removeProductFromSelection(product.id!)}
																					className="h-8 w-8 p-0"
																				>
																					<Minus className="h-4 w-4" />
																				</Button>
																			)}
																			{quantity > 0 && (
																				<span className="text-sm font-medium min-w-[20px] text-center">{quantity}</span>
																			)}
																			<Button
																				variant="outline"
																				size="sm"
																				onClick={() => addProductToSelection(product)}
																				disabled={product.stock === 0 || quantity >= product.stock}
																				className="h-8 w-8 p-0"
																			>
																				<Plus className="h-4 w-4" />
																			</Button>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
												);
											})}
										</div>
									)}

									{appointment.selectedProducts.length > 0 && (
										<div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-in fade-in-50 duration-300">
											<h4 className="font-medium text-blue-800 mb-3">Produtos selecionados</h4>
											<div className="space-y-2">
												{appointment.selectedProducts.map((product) => (
													<div key={product.id} className="flex justify-between items-center text-sm">
														<span className="font-medium">{product.name} x{product.quantity}</span>
														<span className="text-blue-600">R$ {(product.price * product.quantity).toFixed(2)}</span>
													</div>
												))}
												<div className="flex justify-between pt-2 border-t border-blue-200 text-blue-800 font-medium">
													<span>Total produtos:</span>
													<span>R$ {appointment.selectedProducts.reduce((total, p) => total + (p.price * p.quantity), 0).toFixed(2)}</span>
												</div>
											</div>
										</div>
									)}

									<div className="mt-6 flex justify-between">
										<Button
											variant="outline"
											onClick={() => setActiveTab("date")}
										>
											Voltar
										</Button>
										<Button
											onClick={() => setActiveTab("confirm")}
											className="bg-barber-500 hover:bg-barber-600"
										>
											Continuar
										</Button>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="confirm" className="p-6 animate-in fade-in-50 duration-300">
								<div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
									<h3 className="font-semibold mb-4 text-barber-700">Resumo do agendamento</h3>

									<div className="space-y-4">
										<div>
											<p className="text-sm text-gray-500 mb-1">Serviços:</p>
											<div className="space-y-2">
												{appointment.selectedServices.map(serviceId => {
													const service = services.find(s => String(s.id) === serviceId);
													return service ? (
														<div key={serviceId} className="flex justify-between text-sm">
															<span className="font-medium">{service.name}</span>
															<span>R$ {service.price.toFixed(2)}</span>
														</div>
													) : null;
												})}
											</div>
										</div>

										{appointment.selectedProducts.length > 0 && (
											<div>
												<p className="text-sm text-gray-500 mb-1">Produtos:</p>
												<div className="space-y-2">
													{appointment.selectedProducts.map(product => (
														<div key={product.id} className="flex justify-between text-sm">
															<span className="font-medium">{product.name} x{product.quantity}</span>
															<span>R$ {(product.price * product.quantity).toFixed(2)}</span>
														</div>
													))}
												</div>
											</div>
										)}

										<div className="flex justify-between pt-2 border-t border-gray-200 text-barber-600 font-medium">
											<span>Total:</span>
											<span>R$ {appointment.totalPrice.toFixed(2)}</span>
										</div>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
										<div>
											<p className="text-sm text-gray-500 mb-1">Profissional:</p>
											<p className="font-medium">
												{barbers.find(b => String(b.id) === appointment.selectedBarber)?.name || 'Não selecionado'}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Duração:</p>
											<p className="font-medium">{appointment.totalDuration} minutos</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Data:</p>
											<p className="font-medium">
												{appointment.selectedDateOption
													? format(appointment.selectedDateOption.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
													: 'Não selecionada'}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Horário:</p>
											<p className="font-medium">{appointment.selectedTime || 'Não selecionado'}</p>
										</div>
									</div>
								</div>

								{!customer.phoneVerified ? (
									<div className="space-y-4">
										<h3 className="font-semibold mb-4 text-barber-700">Suas informações</h3>

										{!customer.isExistingClient && !customer.showNameInput ? (
											<div>
												<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
													Seu número de celular
												</label>
												<div className="flex space-x-2">
													<Input
														id="phone"
														type="tel"
														placeholder="(11) 99999-9999"
														value={customer.userPhone}
														onChange={(e) => handlePhoneInputChange(e, (value) => updateCustomer({ userPhone: value }))}
														className="flex-1"
														maxLength={15}
													/>
													<Button
														onClick={handleVerifyPhone}
														disabled={customer.verifyingPhone || customer.userPhone.length < 10}
														className="whitespace-nowrap">
														{customer.verifyingPhone ? (
															<>
																<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																Verificando...
															</>
														) : (
															"Verificar"
														)}
													</Button>
												</div>
											</div>
										) : null}

										{customer.isExistingClient && (
											<div>
												<label htmlFor="smsCode" className="block text-sm font-medium text-gray-700 mb-1">
													Código SMS
												</label>
												<div className="flex space-x-2">
													<Input
														id="smsCode"
														type="text"
														placeholder="Digite o código recebido"
														value={customer.smsCode}
														onChange={(e) => updateCustomer({ smsCode: e.target.value.replace(/\D/g, '') })}
														className="flex-1"
														maxLength={6}
													/>
													<Button
														onClick={handleVerifySmsCode}
														disabled={customer.smsCode.length < 6}
														className="whitespace-nowrap">
														Confirmar
													</Button>
												</div>
												<p className="mt-1 text-sm text-gray-500">
													Enviamos um código de 6 dígitos para o seu telefone.
												</p>
											</div>
										)}

										{customer.showNameInput && !customer.isExistingClient && (
											<div className="space-y-4">
												<div>
													<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
														Seu nome completo
													</label>
													<Input
														id="name"
														type="text"
														placeholder="Digite seu nome completo"
														value={customer.name}
														onChange={(e) => updateCustomer({ name: e.target.value })}
														className="w-full"
													/>
												</div>

												<div>
													<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
														Seu email (opcional)
													</label>
													<Input
														id="email"
														type="email"
														placeholder="exemplo@email.com"
														value={customer.email}
														onChange={(e) => updateCustomer({ email: e.target.value })}
														className="w-full"
													/>
												</div>

												<Button
													onClick={handleCreateCustomer}
													disabled={!customer.name || customer.name.length < 3 || isLoading}
													className="w-full">
													{isLoading ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Finalizando...
														</>
													) : (
														'Finalizar Agendamento'
													)}
												</Button>
											</div>
										)}

										<div className="mt-6 flex justify-between">
											<Button
												type="button"
												variant="outline"
												onClick={() => setActiveTab("products")}
											>
												Voltar
											</Button>
										</div>
									</div>
								) : (
									<div>
										<div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
											<div className="flex items-center text-green-700">
												<Check className="h-5 w-5 mr-2" />
												<p className="font-medium">Agendamento confirmado com sucesso!</p>
											</div>
											{customer.customerData && (
												<div className="mt-2 space-y-1 text-green-600">
													<p className="font-medium">Olá, {customer.customerData.name}!</p>
													<p className="text-sm">Seu agendamento foi confirmado para {appointment.selectedDateOption ? format(new Date(appointment.selectedDateOption.date), "dd 'de' MMMM", { locale: ptBR }) : ''} às {appointment.selectedTime}.</p>
													<p className="text-sm">Enviaremos um lembrete para seu telefone antes do horário.</p>
												</div>
											)}
										</div>

										<Button
											onClick={resetAppointment}
											className="w-full bg-barber-500 hover:bg-barber-600">
											Fazer Novo Agendamento
										</Button>
									</div>
								)}
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</main>

			<footer className="bg-white py-6 border-t border-gray-100 mt-12">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<div className="flex items-center space-x-2 mb-4 md:mb-0">
							{company?.logo ? (
								<img src={company.logo} alt={company.name} className="h-5 w-5 object-contain" />
							) : (
								<Scissors className="h-5 w-5 text-barber-500" />
							)}
							<span className="font-medium text-gray-700">{company?.name}</span>
						</div>
						<div className="text-sm text-gray-500">
							© {new Date().getFullYear()} {company?.name} - Todos os direitos reservados
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default ClientPortal;