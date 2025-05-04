import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Scissors, Calendar, Clock, Star, MapPin, Phone, Loader2, CalendarDays, Mail, ChevronRight, ChevronLeft, InfoIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import ServiceService, { Service as ServiceType } from '@/services/api/ServiceService';
import AppointmentService, { Appointment, AppointmentStatusEnum, Service as AppointmentServiceType, AppointmentWithCustomer } from '@/services/api/AppointmentService';
import CompanyService, { Company } from '@/services/api/CompanyService';
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CustomerService, { Customer } from "@/services/api/CustomerService";

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

const ClientPortal = () => {
	const { slug } = useParams<{ slug: string }>();
	const navigate = useNavigate();
	const form = useForm();
	const [selectedServices, setSelectedServices] = useState<string[]>([]);
	const [selectedBarber, setSelectedBarber] = useState('');
	const [selectedDateOption, setSelectedDateOption] = useState<DateOption | null>(null);
	const [selectedTime, setSelectedTime] = useState('');
	const [services, setServices] = useState<ServiceType[]>([]);
	const [barbers, setBarbers] = useState<Barber[]>([]);
	const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
	const [visibleMonth, setVisibleMonth] = useState(format(new Date(), 'MMMM yyyy', { locale: ptBR }));
	const [showAvailableTimes, setShowAvailableTimes] = useState(false);
	const [customerName, setCustomerName] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [verifyingPhone, setVerifyingPhone] = useState(false);
	const [isExistingClient, setIsExistingClient] = useState(false);
	const [phoneVerified, setPhoneVerified] = useState(false);
	const [smsCode, setSmsCode] = useState("");
	const [userPhone, setUserPhone] = useState("");
	const [showNameInput, setShowNameInput] = useState(false);
	const [customerData, setCustomerData] = useState<Customer | null>(null);
	const [currentDatePage, setCurrentDatePage] = useState(0);
	const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
	const [isLoadingServices, setIsLoadingServices] = useState(true);
	const [isLoadingBarbers, setIsLoadingBarbers] = useState(true);
	const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
	const [isLoadingCompany, setIsLoadingCompany] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [company, setCompany] = useState<Company | null>(null);
	const [totalPrice, setTotalPrice] = useState(0);
	const [totalDuration, setTotalDuration] = useState(0);
	const [activeTab, setActiveTab] = useState("service");
	const [hasSavedClientData, setHasSavedClientData] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

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
			generateDateOptions();
			processCompanyMembers();
		}
	}, [company]);

	useEffect(() => {
		if (selectedBarber && selectedDateOption) {
			fetchAvailableTimeSlots();
		} else {
			setAvailableTimeSlots([]);
		}
	}, [selectedBarber, selectedDateOption]);

	const fetchCompanyBySlug = async () => {
		setIsLoadingCompany(true);
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
				// Redirecionar para uma página de erro
				navigate('/');
			}
		} catch (error) {
			toast.error('Erro ao carregar dados da empresa');
			navigate('/');
		} finally {
			setIsLoadingCompany(false);
		}
	};

	const fetchServices = async () => {
		if (!company?.id) return;

		setIsLoadingServices(true);
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
			setIsLoadingServices(false);
		}
	};

	const processCompanyMembers = () => {
		if (!company?.members) return;

		setIsLoadingBarbers(true);
		try {
			// Processar os membros da empresa para obter os barbeiros
			const barbersList = company.members
				.filter(member => member.user) // Garante que o usuário existe
				.map(member => ({
					id: member.user.id,
					name: member.user.name,
					image: member.user.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 30) + 30}.jpg`
				}));

			setBarbers(barbersList);
		} catch (error) {
			toast.error('Erro ao processar dados dos profissionais');
		} finally {
			setIsLoadingBarbers(false);
		}
	};

	const generateDateOptions = () => {
		const options: DateOption[] = [];
		const today = new Date();
		const threeMonthaLater = addMonths(today, 3);

		// Criar período de três meses
		const dateRange = eachDayOfInterval({
			start: today,
			end: threeMonthaLater
		});

		// Adicionar cada data no período como uma opção
		dateRange.forEach((date, index) => {
			const formattedDate = format(date, 'yyyy-MM-dd');

			let label;
			if (index === 0) {
				label = 'Hoje';
			} else if (index === 1) {
				label = 'Amanhã';
			} else {
				label = format(date, 'dd/MM', { locale: ptBR });
			}

			options.push({
				label,
				value: formattedDate,
				date
			});
		});

		setDateOptions(options);
		// Mostrar apenas as primeiras 14 datas inicialmente (2 semanas)
		updateVisibleDates(0, options);
	};

	// Função para mostrar apenas um subconjunto de datas (2 linhas de 7 dias)
	const updateVisibleDates = (page: number, allOptions?: DateOption[]) => {
		const optionsToUse = allOptions || dateOptions;
		const datesPerPage = 14; // 2 linhas de 7 dias
		const startIndex = page * datesPerPage;
		const endIndex = startIndex + datesPerPage;

		// Verificar se temos opções suficientes
		if (optionsToUse.length <= startIndex) {
			setCurrentDatePage(0);
		} else {
			setCurrentDatePage(page);
		}

		// Não atualizamos mais o dateOptions completo, apenas controlamos
		// quais datas são exibidas através do slice na renderização
	};

	const getCurrentMonthLabel = () => {
		if (dateOptions.length === 0) return '';

		// Calcular quais datas estão visíveis atualmente
		const datesPerPage = 14;
		const startIndex = currentDatePage * datesPerPage;
		const visibleDates = dateOptions.slice(startIndex, startIndex + datesPerPage);

		// Pegar o mês da primeira data visível
		if (visibleDates.length === 0) return '';
		return format(visibleDates[0].date, 'MMMM yyyy', { locale: ptBR });
	};

	const goToNextDatePage = () => {
		// Verificar se há mais datas para mostrar
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
		if (!selectedBarber || !selectedDateOption || !company?.id) return;

		setIsLoadingTimeSlots(true);
		setAvailableTimeSlots([]);
		setSelectedTime('');

		try {
			const response = await AppointmentService.getAvailableTimeSlots(
				parseInt(selectedBarber),
				company.id,
				selectedDateOption.value // Formato 'yyyy-MM-dd' esperado pela API
			);

			if (response.success && response.data) {
				setAvailableTimeSlots(response.data);

				// Auto-selecionar o primeiro horário disponível
				if (response.data.length > 0) {
					setSelectedTime(response.data[0]);
				}
			} else {
				toast.error(response.error || 'Erro ao carregar horários disponíveis');
			}
		} catch (error) {
			toast.error('Erro ao buscar horários disponíveis');
		} finally {
			setIsLoadingTimeSlots(false);
		}
	};

	const toggleServiceSelection = (serviceId: string) => {
		setSelectedServices(prev => {
			const isSelected = prev.includes(serviceId);
			if (isSelected) {
				// Remover serviço
				const updatedServices = prev.filter(id => id !== serviceId);
				updateTotals(updatedServices);
				return updatedServices;
			} else {
				// Adicionar serviço
				const updatedServices = [...prev, serviceId];
				updateTotals(updatedServices);
				return updatedServices;
			}
		});
	};

	const updateTotals = (selectedServiceIds: string[]) => {
		const selectedServicesData = services.filter(service =>
			selectedServiceIds.includes(String(service.id))
		);

		const price = selectedServicesData.reduce(
			(total, service) => total + service.price, 0
		);

		const duration = selectedServicesData.reduce(
			(total, service) => total + service.duration, 0
		);

		setTotalPrice(price);
		setTotalDuration(duration);
	};

	useEffect(() => {
		updateTotals(selectedServices);
	}, [selectedServices, services]);

	// Função para carregar dados do cliente do localStorage
	const loadClientDataFromLocalStorage = () => {
		try {
			const savedClientData = localStorage.getItem('clientData');
			if (savedClientData) {
				const clientData = JSON.parse(savedClientData);
				// Preencher o formulário com os dados salvos
				form.setValue('name', clientData.name || '');
				form.setValue('phone', clientData.phone || '');
				form.setValue('email', clientData.email || '');
				setHasSavedClientData(true);
			}
		} catch (error) {
			console.error('Erro ao carregar dados do cliente:', error);
		}
	};

	// Handler para verificação de telefone
	const handleVerifyPhone = async () => {
		if (!userPhone || userPhone.length < 10) {
			toast.error("Por favor, digite um número de telefone válido");
			return;
		}

		setVerifyingPhone(true);

		try {
			const response = await CustomerService.checkCustomerByPhone(userPhone);

			if (response.success && response.data) {
				setIsExistingClient(true);
				setCustomerData(response.data);
				toast.success(`Olá ${response.data.name}! Enviamos um código de verificação por SMS.`);
			} else {
				setIsExistingClient(false);
				setShowNameInput(true);
				toast.info("Você é um novo cliente. Por favor, informe seu nome para continuar.");
			}
		} catch (error) {
			toast.error("Erro ao verificar o telefone. Tente novamente.");
		} finally {
			setVerifyingPhone(false);
		}
	};

	// Handler para verificar o código SMS
	const handleVerifySmsCode = async () => {
		if (!smsCode || smsCode.length < 6) {
			toast.error("Por favor, digite o código de 6 dígitos enviado por SMS");
			return;
		}

		try {
			const response = await CustomerService.verifySmsCode(userPhone, smsCode);

			if (response.success && response.data?.verified) {
				setPhoneVerified(true);
				toast.success("Telefone verificado com sucesso!");

				// Se já tivermos os dados do cliente, use-os para o agendamento
				if (customerData) {
					setCustomerName(customerData.name);
					setCustomerEmail(customerData.email || "");
					setCustomerPhone(customerData.phone);
				}
			} else {
				toast.error("Código inválido. Tente novamente.");
			}
		} catch (error) {
			toast.error("Erro ao verificar o código. Tente novamente.");
		}
	};

	// Handler para criar um novo cliente e finalizar o agendamento
	const handleCreateCustomer = async () => {
		if (!customerName || customerName.length < 3) {
			toast.error("Por favor, digite seu nome completo");
			return;
		}

		if (!selectedServices.length || !selectedBarber || !selectedDateOption || !selectedTime || !company?.id) {
			toast.error("Por favor, complete todas as informações do agendamento");
			return;
		}

		setIsLoading(true);

		try {
			// Preparar os serviços selecionados
			const selectedServicesObj = services.filter(s => selectedServices.includes(String(s.id)));
			const servicesArray = selectedServicesObj.map(serviceObj => ({
				serviceId: serviceObj.id,
				quantity: 1
			}));

			// Preparar data e hora
			const [hours, minutes] = selectedTime.split(':').map(Number);
			const scheduledDate = new Date(selectedDateOption.date);
			scheduledDate.setHours(hours, minutes, 0, 0);

			// Criar objeto de agendamento
			const appointmentData: AppointmentWithCustomer = {
				companyId: company.id,
				userId: parseInt(selectedBarber),
				services: servicesArray,
				products: [],
				scheduledTime: scheduledDate.toISOString(),
				customerPhone: userPhone,
				customerName: customerName,
				customerEmail: customerEmail
			};

			const response = await AppointmentService.createClientAppointment(appointmentData);

			if (response.success) {
				setCustomerData({
					id: response.data.clientId,
					name: customerName,
					phone: userPhone,
					email: customerEmail
				});
				setPhoneVerified(true);
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

	if (isLoadingCompany) {
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
								const currentIndex = ["service", "barber", "date", "confirm"].indexOf(activeTab);
								const targetIndex = ["service", "barber", "date", "confirm"].indexOf(value);

								// Se estiver tentando voltar, permitir
								if (targetIndex < currentIndex) {
									setActiveTab(value);
									return;
								}

								// Verificar requisitos para avançar
								if (value === "barber" && selectedServices.length === 0) {
									toast.error("Selecione pelo menos um serviço antes de continuar");
									return;
								}

								if (value === "date" && selectedBarber === '') {
									toast.error("Selecione um profissional antes de continuar");
									return;
								}

								if (value === "confirm" && (!selectedDateOption || !selectedTime)) {
									if (!selectedDateOption) {
										toast.error("Selecione uma data antes de continuar");
									} else {
										toast.error("Selecione um horário antes de continuar");
									}
									return;
								}

								// Se passou por todas as validações, permitir a mudança
								setActiveTab(value);
							}}
							className="w-full"
						>
							<div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
								<TabsList className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-lg">
									<TabsTrigger
										value="service"
										className="data-[state=active]:bg-white data-[state=active]:text-barber-600 rounded-md py-2"
									>
										Serviços
									</TabsTrigger>
									<TabsTrigger
										value="barber"
										className={`data-[state=active]:bg-white data-[state=active]:text-barber-600 rounded-md py-2 ${selectedServices.length === 0 && activeTab !== "barber" ? "opacity-50" : ""
											}`}
									>
										Profissional
									</TabsTrigger>
									<TabsTrigger
										value="date"
										className={`data-[state=active]:bg-white data-[state=active]:text-barber-600 rounded-md py-2 ${(selectedBarber === '' && activeTab !== "date") ? "opacity-50" : ""
											}`}
									>
										Data/Hora
									</TabsTrigger>
									<TabsTrigger
										value="confirm"
										className={`data-[state=active]:bg-white data-[state=active]:text-barber-600 rounded-md py-2 ${((!selectedDateOption || !selectedTime) && activeTab !== "confirm") ? "opacity-50" : ""
											}`}
									>
										Confirmação
									</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent value="service" className="p-6 animate-in fade-in-50 duration-300">
								{isLoadingServices ? (
									<div className="flex justify-center items-center py-12">
										<Loader2 className="h-8 w-8 animate-spin text-barber-500" />
									</div>
								) : (
									<div className="space-y-6">
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											{services.map((service) => (
												<div
													key={service.id}
													className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${selectedServices.includes(String(service.id))
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

										{selectedServices.length > 0 && (
											<div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in-50 duration-300">
												<div className="flex justify-between items-center">
													<div>
														<p className="text-sm text-gray-500">Serviços selecionados</p>
														<p className="font-medium">
															{selectedServices.length} {selectedServices.length === 1 ? 'serviço' : 'serviços'}
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
																disabled={selectedServices.length === 0 || isLoadingServices}
																onClick={() => setActiveTab("barber")}
																className="bg-barber-500 hover:bg-barber-600"
															>
																Continuar
															</Button>
														</span>
													</TooltipTrigger>
													{selectedServices.length === 0 && (
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
								{isLoadingBarbers ? (
									<div className="flex justify-center items-center py-12">
										<Loader2 className="h-8 w-8 animate-spin text-barber-500" />
									</div>
								) : (
									<div className="space-y-6">
										<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
											{barbers.map((barber) => (
												<div
													key={barber.id}
													className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${selectedBarber === String(barber.id)
														? 'ring-2 ring-barber-500 bg-barber-50'
														: 'hover:border-barber-300'
														}`}
													onClick={() => {
														setSelectedBarber(String(barber.id));
														// Avançar automaticamente para a próxima etapa
														setTimeout(() => {
															setActiveTab("date");
														}, 300);
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
													className={`border rounded-lg p-3 text-center cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${selectedDateOption?.value === option.value
														? 'bg-barber-500 text-white ring-2 ring-barber-300'
														: 'hover:border-barber-300 bg-white'
														}`}
													onClick={() => setSelectedDateOption(option)}
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
										{isLoadingTimeSlots ? (
											<div className="flex justify-center items-center py-8">
												<Loader2 className="h-6 w-6 animate-spin text-barber-500" />
											</div>
										) : availableTimeSlots.length > 0 ? (
											<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 animate-in fade-in-50 duration-300">
												{availableTimeSlots.map((time, index) => (
													<div
														key={index}
														className={`border rounded-lg p-3 text-center cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${selectedTime === time
															? 'bg-barber-500 text-white ring-2 ring-barber-300'
															: 'hover:border-barber-300 bg-white'
															}`}
														onClick={() => {
															setSelectedTime(time);
														}}
													>
														<span className="text-sm font-medium">{time}</span>
													</div>
												))}
											</div>
										) : (
											<div className="py-8 bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-gray-200">
												{selectedDateOption ? (
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
															disabled={!selectedDateOption || !selectedTime || isLoadingTimeSlots}
															onClick={() => setActiveTab("confirm")}
															className="bg-barber-500 hover:bg-barber-600"
														>
															Continuar
														</Button>
													</span>
												</TooltipTrigger>
												{(!selectedDateOption || !selectedTime) && !isLoadingTimeSlots && (
													<TooltipContent className="bg-red-50 border border-red-200 text-red-700 p-2">
														<p>
															{!selectedDateOption
																? "Selecione uma data"
																: !selectedTime
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

							<TabsContent value="confirm" className="p-6 animate-in fade-in-50 duration-300">
								<div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
									<h3 className="font-semibold mb-4 text-barber-700">Resumo do agendamento</h3>

									<div className="space-y-4">
										<div>
											<p className="text-sm text-gray-500 mb-1">Serviços:</p>
											<div className="space-y-2">
												{selectedServices.map(serviceId => {
													const service = services.find(s => String(s.id) === serviceId);
													return service ? (
														<div key={serviceId} className="flex justify-between text-sm">
															<span className="font-medium">{service.name}</span>
															<span>R$ {service.price.toFixed(2)}</span>
														</div>
													) : null;
												})}

												<div className="flex justify-between pt-2 border-t border-gray-200 text-barber-600 font-medium">
													<span>Total:</span>
													<span>R$ {totalPrice.toFixed(2)}</span>
												</div>
											</div>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
											<div>
												<p className="text-sm text-gray-500 mb-1">Profissional:</p>
												<p className="font-medium">
													{barbers.find(b => String(b.id) === selectedBarber)?.name || 'Não selecionado'}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-500 mb-1">Duração:</p>
												<p className="font-medium">{totalDuration} minutos</p>
											</div>
											<div>
												<p className="text-sm text-gray-500 mb-1">Data:</p>
												<p className="font-medium">
													{selectedDateOption
														? format(selectedDateOption.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
														: 'Não selecionada'}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-500 mb-1">Horário:</p>
												<p className="font-medium">{selectedTime || 'Não selecionado'}</p>
											</div>
										</div>
									</div>
								</div>

								{!phoneVerified ? (
									<div className="space-y-4">
										<h3 className="font-semibold mb-4 text-barber-700">Suas informações</h3>

										{!isExistingClient && !showNameInput ? (
											<div>
												<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
													Seu número de celular
												</label>
												<div className="flex space-x-2">
													<Input
														id="phone"
														type="tel"
														placeholder="(11) 99999-9999"
														value={userPhone}
														onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ''))}
														className="flex-1"
														maxLength={11}
													/>
													<Button
														onClick={handleVerifyPhone}
														disabled={verifyingPhone || userPhone.length < 10}
														className="whitespace-nowrap">
														{verifyingPhone ? (
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

										{isExistingClient && (
											<div>
												<label htmlFor="smsCode" className="block text-sm font-medium text-gray-700 mb-1">
													Código SMS
												</label>
												<div className="flex space-x-2">
													<Input
														id="smsCode"
														type="text"
														placeholder="Digite o código recebido"
														value={smsCode}
														onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
														className="flex-1"
														maxLength={6}
													/>
													<Button
														onClick={handleVerifySmsCode}
														disabled={smsCode.length < 6}
														className="whitespace-nowrap">
														Confirmar
													</Button>
												</div>
												<p className="mt-1 text-sm text-gray-500">
													Enviamos um código de 6 dígitos para o seu telefone.
												</p>
											</div>
										)}

										{showNameInput && !isExistingClient && (
											<div className="space-y-4">
												<div>
													<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
														Seu nome completo
													</label>
													<Input
														id="name"
														type="text"
														placeholder="Digite seu nome completo"
														value={customerName}
														onChange={(e) => setCustomerName(e.target.value)}
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
														value={customerEmail}
														onChange={(e) => setCustomerEmail(e.target.value)}
														className="w-full"
													/>
												</div>

												<Button
													onClick={handleCreateCustomer}
													disabled={!customerName || customerName.length < 3 || isLoading}
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
												onClick={() => setActiveTab("date")}
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
											{customerData && (
												<div className="mt-2 space-y-1 text-green-600">
													<p className="font-medium">Olá, {customerData.name}!</p>
													<p className="text-sm">Seu agendamento foi confirmado para {selectedDateOption ? format(new Date(selectedDateOption.date), "dd 'de' MMMM", { locale: ptBR }) : ''} às {selectedTime}.</p>
													<p className="text-sm">Enviaremos um lembrete para seu telefone antes do horário.</p>
												</div>
											)}
										</div>

										<Button
											onClick={() => {
												// Reset do formulário
												setSelectedServices([]);
												setSelectedBarber('');
												setSelectedDateOption(null);
												setSelectedTime('');
												setTotalPrice(0);
												setTotalDuration(0);
												setActiveTab("service");
												setPhoneVerified(false);
												setIsExistingClient(false);
												setShowNameInput(false);
												setUserPhone('');
												setSmsCode('');
												setCustomerName('');
												setCustomerEmail('');
												navigate('/');
											}}
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