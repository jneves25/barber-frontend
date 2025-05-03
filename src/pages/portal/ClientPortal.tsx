import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Calendar, Clock, Star, MapPin, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ServiceProductService, { Service } from '@/services/api/ServiceProductService';
import AppointmentService, { Appointment, AppointmentStatusEnum, ServiceAppointment } from '@/services/api/AppointmentService';
import CompanyService from '@/services/api/CompanyService';
import ClientLayout from '@/components/layout/ClientLayout';

const BARBERS = [
	{ id: '1', name: 'Carlos', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
	{ id: '2', name: 'Fernando', image: 'https://randomuser.me/api/portraits/men/35.jpg' },
	{ id: '3', name: 'Ricardo', image: 'https://randomuser.me/api/portraits/men/33.jpg' }
];

const TIME_SLOTS = [
	'09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const ClientPortal = () => {
	const navigate = useNavigate();
	const form = useForm();
	const [selectedService, setSelectedService] = useState('');
	const [selectedBarber, setSelectedBarber] = useState('');
	const [selectedDate, setSelectedDate] = useState('');
	const [selectedTime, setSelectedTime] = useState('');
	const [services, setServices] = useState<Service[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [companyId, setCompanyId] = useState<number>(1);

	useEffect(() => {
		fetchServices();
	}, []);

	const fetchServices = async () => {
		setIsLoading(true);
		try {
			const response = await ServiceProductService.getAllServices(companyId);
			if (response.success && response.data) {
				setServices(response.data);
			} else {
				toast.error(response.error || 'Erro ao carregar serviços');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
		} finally {
			setIsLoading(false);
		}
	};

	const clickTabTrigger = (value: string) => {
		const element = document.querySelector(`[data-value="${value}"]`) as HTMLElement | null;
		if (element) {
			element.click();
		}
	};

	const handleSubmit = async (data: any) => {
		if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
			toast.error("Por favor, preencha todas as informações do agendamento");
			return;
		}

		setIsSubmitting(true);

		const selectedServiceObj = services.find(s => s.id === parseInt(selectedService));

		if (!selectedServiceObj) {
			toast.error("Serviço não encontrado");
			setIsSubmitting(false);
			return;
		}

		try {
			const appointmentData: Appointment = {
				clientId: 1,
				userId: parseInt(selectedBarber),
				companyId: companyId,
				services: [{
					serviceId: parseInt(selectedService),
					quantity: 1
				}],
				products: [],
				value: selectedServiceObj.price,
				status: AppointmentStatusEnum.PENDING
			};

			const response = await AppointmentService.createClientAppointment(appointmentData);

			if (response.success) {
				toast.success("Agendamento realizado com sucesso!");
				form.reset();
				setSelectedService('');
				setSelectedBarber('');
				setSelectedDate('');
				setSelectedTime('');
				clickTabTrigger("service");
			} else {
				toast.error(response.error || "Erro ao realizar agendamento");
			}
		} catch (error) {
			toast.error("Erro ao processar o agendamento");
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b border-gray-200">
				<div className="container mx-auto py-4 px-4 flex justify-between items-center">
					<div className="flex items-center space-x-2">
						<Scissors className="h-6 w-6 text-barber-500" />
						<span className="font-bold text-xl text-barber-500">Cousens Barbershop</span>
					</div>
					<div className="flex items-center space-x-4">
						<a href="tel:+5511999999999" className="hidden md:flex items-center text-gray-700">
							<Phone className="h-4 w-4 mr-2" />
							(11) 99999-9999
						</a>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					<div className="bg-white p-6 rounded-lg shadow-sm mb-8">
						<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
							<div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
								<Scissors className="h-8 w-8 text-barber-500" />
							</div>
							<div className="flex-grow">
								<h1 className="text-2xl font-bold text-gray-900">Cousens Barbershop</h1>
								<div className="flex items-center text-yellow-500 mt-1">
									<Star className="h-4 w-4 fill-current" />
									<Star className="h-4 w-4 fill-current" />
									<Star className="h-4 w-4 fill-current" />
									<Star className="h-4 w-4 fill-current" />
									<Star className="h-4 w-4 fill-current" />
									<span className="ml-2 text-gray-700 text-sm">5.0 (48 avaliações)</span>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3">
									<div className="flex items-center text-gray-700">
										<MapPin className="h-4 w-4 mr-1" />
										<span className="text-sm">Rua da Barbearia, 123</span>
									</div>
									<div className="flex items-center text-gray-700">
										<Clock className="h-4 w-4 mr-1" />
										<span className="text-sm">Seg-Sáb: 9h às 19h</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm mb-8">
						<div className="p-6 border-b border-gray-200">
							<h2 className="text-xl font-semibold">Agende seu horário</h2>
							<p className="text-gray-600 text-sm mt-1">Escolha o serviço, profissional e horário</p>
						</div>

						<Tabs defaultValue="service" className="w-full">
							<TabsList className="w-full grid grid-cols-4 rounded-none border-b">
								<TabsTrigger value="service">Serviço</TabsTrigger>
								<TabsTrigger value="barber">Profissional</TabsTrigger>
								<TabsTrigger value="date">Data</TabsTrigger>
								<TabsTrigger value="confirm">Confirmar</TabsTrigger>
							</TabsList>

							<TabsContent value="service" className="p-6">
								{isLoading ? (
									<div className="flex justify-center items-center py-12">
										<Loader2 className="h-8 w-8 animate-spin text-barber-500" />
									</div>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{services.map((service) => (
											<div
												key={service.id}
												className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${selectedService === String(service.id) ? 'ring-2 ring-barber-500' : 'hover:border-barber-300'
													}`}
												onClick={() => setSelectedService(String(service.id))}
											>
												<div className="h-32 overflow-hidden bg-gray-100 flex items-center justify-center">
													<Scissors className="h-12 w-12 text-barber-300" />
												</div>
												<div className="p-4">
													<h3 className="font-medium">{service.name}</h3>
													<div className="flex justify-between items-center mt-2">
														<div className="flex items-center text-gray-600">
															<Clock className="h-4 w-4 mr-1" />
															<span className="text-sm">{service.duration} min</span>
														</div>
														<span className="font-bold">R$ {service.price.toFixed(2)}</span>
													</div>
													<p className="text-sm text-gray-500 mt-2 line-clamp-2">{service.description}</p>
												</div>
											</div>
										))}
									</div>
								)}

								<div className="mt-6 flex justify-end">
									<Button
										disabled={!selectedService || isLoading}
										onClick={() => clickTabTrigger("barber")}
										className="bg-barber-500 hover:bg-barber-600"
									>
										Continuar
									</Button>
								</div>
							</TabsContent>

							<TabsContent value="barber" className="p-6">
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
									{BARBERS.map((barber) => (
										<div
											key={barber.id}
											className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${selectedBarber === barber.id ? 'ring-2 ring-barber-500' : 'hover:border-barber-300'
												}`}
											onClick={() => setSelectedBarber(barber.id)}
										>
											<div className="w-20 h-20 rounded-full overflow-hidden mb-3">
												<img
													src={barber.image}
													alt={barber.name}
													className="w-full h-full object-cover"
												/>
											</div>
											<h3 className="font-medium text-center">{barber.name}</h3>
										</div>
									))}
								</div>

								<div className="mt-6 flex justify-between">
									<Button
										variant="outline"
										onClick={() => clickTabTrigger("service")}
									>
										Voltar
									</Button>
									<Button
										disabled={!selectedBarber}
										onClick={() => clickTabTrigger("date")}
										className="bg-barber-500 hover:bg-barber-600"
									>
										Continuar
									</Button>
								</div>
							</TabsContent>

							<TabsContent value="date" className="p-6">
								<div className="space-y-6">
									<div>
										<label className="block text-sm font-medium mb-2">Escolha a data</label>
										<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
											{['Hoje', 'Amanhã', '05/08', '06/08', '07/08'].map((date, index) => (
												<div
													key={index}
													className={`border rounded-md p-3 text-center cursor-pointer transition-all ${selectedDate === date ? 'bg-barber-500 text-white' : 'hover:border-barber-300'
														}`}
													onClick={() => setSelectedDate(date)}
												>
													{date}
												</div>
											))}
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium mb-2">Escolha o horário</label>
										<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
											{TIME_SLOTS.map((time, index) => (
												<div
													key={index}
													className={`border rounded-md p-3 text-center cursor-pointer transition-all ${selectedTime === time ? 'bg-barber-500 text-white' : 'hover:border-barber-300'
														}`}
													onClick={() => setSelectedTime(time)}
												>
													{time}
												</div>
											))}
										</div>
									</div>
								</div>

								<div className="mt-6 flex justify-between">
									<Button
										variant="outline"
										onClick={() => clickTabTrigger("barber")}
									>
										Voltar
									</Button>
									<Button
										disabled={!selectedDate || !selectedTime}
										onClick={() => clickTabTrigger("confirm")}
										className="bg-barber-500 hover:bg-barber-600"
									>
										Continuar
									</Button>
								</div>
							</TabsContent>

							<TabsContent value="confirm" className="p-6">
								<form onSubmit={form.handleSubmit(handleSubmit)}>
									<div className="mb-6 p-4 bg-gray-50 rounded-md">
										<h3 className="font-semibold mb-3">Resumo do agendamento</h3>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div>
												<p className="text-sm text-gray-500">Serviço:</p>
												<p className="font-medium">
													{services.find(s => String(s.id) === selectedService)?.name || 'Não selecionado'}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">Profissional:</p>
												<p className="font-medium">
													{BARBERS.find(b => b.id === selectedBarber)?.name || 'Não selecionado'}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">Data:</p>
												<p className="font-medium">{selectedDate || 'Não selecionada'}</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">Horário:</p>
												<p className="font-medium">{selectedTime || 'Não selecionado'}</p>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium mb-2">Nome completo</label>
												<Input {...form.register('name')} placeholder="Seu nome" />
											</div>
											<div>
												<label className="block text-sm font-medium mb-2">Telefone</label>
												<Input {...form.register('phone')} placeholder="(99) 99999-9999" />
											</div>
										</div>

										<div>
											<label className="block text-sm font-medium mb-2">E-mail</label>
											<Input {...form.register('email')} type="email" placeholder="seu@email.com" />
										</div>

										<div>
											<label className="block text-sm font-medium mb-2">Observações (opcional)</label>
											<Input {...form.register('notes')} placeholder="Alguma observação para o atendimento?" />
										</div>
									</div>

									<div className="mt-6 flex justify-between">
										<Button
											type="button"
											variant="outline"
											onClick={() => clickTabTrigger("date")}
											disabled={isSubmitting}
										>
											Voltar
										</Button>
										<Button
											type="submit"
											className="bg-barber-500 hover:bg-barber-600"
											disabled={isSubmitting}
										>
											{isSubmitting ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Processando...
												</>
											) : (
												'Confirmar agendamento'
											)}
										</Button>
									</div>
								</form>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</main>

			<footer className="bg-white py-6 border-t border-gray-200">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<div className="flex items-center space-x-2 mb-4 md:mb-0">
							<Scissors className="h-5 w-5 text-barber-500" />
							<span className="font-semibold text-barber-500">Cousens Barbershop</span>
						</div>
						<div className="text-sm text-gray-500">
							© {new Date().getFullYear()} Cousens Barbershop - Todos os direitos reservados
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default ClientPortal;
