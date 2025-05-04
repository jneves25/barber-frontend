import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Clock, User, DollarSign, Store, Calendar, Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import CompanySettingsService, { CompanySettings, WorkingHours } from '@/services/api/CompanySettingsService';
import CompanyService from '@/services/api/CompanyService';
import { useAuth } from '@/context/AuthContext';

const daysOfWeek = [
	{ id: 'monday', label: 'Segunda-feira' },
	{ id: 'tuesday', label: 'Terça-feira' },
	{ id: 'wednesday', label: 'Quarta-feira' },
	{ id: 'thursday', label: 'Quinta-feira' },
	{ id: 'friday', label: 'Sexta-feira' },
	{ id: 'saturday', label: 'Sábado' },
	{ id: 'sunday', label: 'Domingo' },
];

const AdminSettings = () => {
	const { companySelected } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [settings, setSettings] = useState<CompanySettings | null>(null);
	const [company, setCompany] = useState<any>(null);
	const [logoPreview, setLogoPreview] = useState<string>('https://placehold.co/400x200/e2e8f0/1e293b?text=Barbershop');
	const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>('https://placehold.co/800x400/e2e8f0/1e293b?text=Cover+Photo');
	const [openingHours, setOpeningHours] = useState(
		daysOfWeek.map(day => ({
			day: day.id,
			label: day.label,
			isOpen: day.id !== 'sunday',
			openTime: '09:00',
			closeTime: day.id === 'saturday' ? '18:00' : '19:00'
		}))
	);
	const [timeErrors, setTimeErrors] = useState<{ [key: string]: boolean }>({});

	useEffect(() => {
		if (companySelected?.id) {
			loadSettings();
			loadCompany();
		}
	}, [companySelected]);

	const loadCompany = async () => {
		try {
			const response = await CompanyService.getById(companySelected!.id);
			if (response.success && response.data) {
				setCompany(response.data);
				setLogoPreview(response.data.logo || 'https://placehold.co/400x200/e2e8f0/1e293b?text=Barbershop');
				setCoverPhotoPreview(response.data.backgroundImage || 'https://placehold.co/800x400/e2e8f0/1e293b?text=Cover+Photo');
			}
		} catch (error) {
			toast.error('Erro ao carregar dados da empresa');
		}
	};

	const loadSettings = async () => {
		setIsLoading(true);
		try {
			const response = await CompanySettingsService.getSettingsByCompanyId(companySelected!.id);
			if (response.success && response.data) {
				setSettings(response.data);
				const workingHours = response.data.workingHours;
				if (workingHours) {
					setOpeningHours(daysOfWeek.map(day => ({
						day: day.id,
						label: day.label,
						isOpen: true,
						openTime: workingHours[`${day.id}Open` as keyof WorkingHours] as string,
						closeTime: workingHours[`${day.id}Close` as keyof WorkingHours] as string
					})));
				}
			} else {
				toast.error('Erro ao carregar configurações');
			}
		} catch (error) {
			toast.error('Erro ao carregar configurações');
		} finally {
			setIsLoading(false);
		}
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				if (type === 'logo') {
					setLogoPreview(e.target?.result as string);
				} else {
					setCoverPhotoPreview(e.target?.result as string);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const validateTime = (openTime: string, closeTime: string) => {
		const open = new Date(`2000-01-01T${openTime}`);
		const close = new Date(`2000-01-01T${closeTime}`);
		return open < close;
	};

	const handleOpeningHoursChange = (index: number, field: 'isOpen' | 'openTime' | 'closeTime', value: any) => {
		const updatedHours = [...openingHours];
		updatedHours[index] = {
			...updatedHours[index],
			[field]: value
		};

		// Validar horários quando ambos estiverem preenchidos
		if (field === 'openTime' || field === 'closeTime') {
			const day = updatedHours[index];
			if (day.openTime && day.closeTime) {
				const isValid = validateTime(day.openTime, day.closeTime);
				setTimeErrors(prev => ({
					...prev,
					[`${day.day}`]: !isValid
				}));
			}
		}

		setOpeningHours(updatedHours);
	};

	const handleSaveSettings = async () => {
		if (!companySelected?.id || !settings?.id) {
			toast.error('Dados da empresa não encontrados');
			return;
		}

		try {
			// Update company data
			const companyData = {
				ownerId: company.ownerId,
				name: (document.querySelector<HTMLInputElement>('[name="companyName"]')?.value || ''),
				address: (document.querySelector<HTMLInputElement>('[name="address"]')?.value || ''),
				phone: (document.querySelector<HTMLInputElement>('[name="phone"]')?.value || ''),
				whatsapp: (document.querySelector<HTMLInputElement>('[name="whatsapp"]')?.value || ''),
				email: (document.querySelector<HTMLInputElement>('[name="email"]')?.value || ''),
				logo: logoPreview,
				backgroundImage: coverPhotoPreview
			};

			const companyResponse = await CompanyService.update(companySelected.id, companyData);
			if (!companyResponse.success) {
				toast.error(companyResponse.error || 'Erro ao atualizar dados da empresa');
				return;
			}

			// Atualiza o state da company com os dados retornados
			setCompany(companyResponse.data);

			// Update settings
			const workingHoursData = openingHours.reduce((acc, day) => {
				if (day.isOpen) {
					const openTime = new Date(`2000-01-01T${day.openTime}`);
					const closeTime = new Date(`2000-01-01T${day.closeTime}`);

					if (openTime >= closeTime) {
						throw new Error(`O horário de abertura não pode ser maior ou igual ao de fechamento para ${day.label}`);
					}

					return {
						...acc,
						[`${day.day}Open`]: day.openTime,
						[`${day.day}Close`]: day.closeTime
					};
				}
				return acc;
			}, {} as WorkingHours);

			const updatedSettings: Partial<CompanySettings> = {
				companyId: companySelected.id,
				appointmentIntervalMinutes: parseInt(document.querySelector<HTMLSelectElement>('[name="appointmentInterval"]')?.value || '30'),
				advanceNoticeDays: parseInt(document.querySelector<HTMLInputElement>('[name="advanceNoticeDays"]')?.value || '30'),
				preparationTimeMinutes: parseInt(document.querySelector<HTMLInputElement>('[name="preparationTime"]')?.value || '5'),
				sendReminderWhatsApp: document.querySelector<HTMLInputElement>('[name="sendReminder"]')?.checked || false,
				confirmAppointmentWhatsApp: document.querySelector<HTMLInputElement>('[name="confirmAppointment"]')?.checked || false,
				notifyBarberNewAppointments: document.querySelector<HTMLInputElement>('[name="notifyBarber"]')?.checked || false,
				acceptedPaymentMethods: JSON.stringify(Array.from(document.querySelectorAll<HTMLInputElement>('[name="paymentMethods"]:checked')).map(el => el.value)),
				commissionPercentage: parseInt(document.querySelector<HTMLInputElement>('[name="commissionPercentage"]')?.value || '40'),
				commissionPaymentFrequency: document.querySelector<HTMLSelectElement>('[name="commissionFrequency"]')?.value || 'quinzenal',
				allowEarlyPaymentOnline: document.querySelector<HTMLInputElement>('[name="allowEarlyPayment"]')?.checked || false,
				requireDepositConfirmation: document.querySelector<HTMLInputElement>('[name="requireDeposit"]')?.checked || false,
				applyDiscountForCashPayment: document.querySelector<HTMLInputElement>('[name="applyDiscount"]')?.checked || false,
				workingHours: {
					update: workingHoursData
				}
			};

			const settingsResponse = await CompanySettingsService.updateSettings(settings.id, updatedSettings);

			if (settingsResponse.success) {
				// Atualiza o state das settings com os dados retornados
				setSettings(settingsResponse.data);
				toast.success('Configurações salvas com sucesso!');
			} else {
				toast.error(settingsResponse.error || 'Erro ao salvar configurações');
			}
		} catch (error) {
			toast.error('Erro ao salvar configurações');
		}
	};

	if (isLoading) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center h-screen">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="space-y-4">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h1 className="text-2xl font-bold">Configurações</h1>
					<Button
						onClick={handleSaveSettings}
						className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
					>
						Salvar Alterações
					</Button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center space-x-4">
							<Store className="h-6 w-6 text-blue-500" />
							<div>
								<CardTitle>Dados da Barbearia</CardTitle>
								<CardDescription>Informações gerais do estabelecimento</CardDescription>
							</div>
						</CardHeader>
						<CardContent>
							<form className="space-y-6">
								<div className="space-y-4">
									<label className="text-sm font-medium">Logo da Barbearia</label>
									<div className="flex flex-col items-center gap-4 sm:flex-row">
										<div className="relative w-32 h-32 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
											<img
												src={logoPreview}
												alt="Logo da Barbearia"
												className="max-w-full max-h-full object-contain"
											/>
											{logoPreview !== 'https://placehold.co/400x200/e2e8f0/1e293b?text=Barbershop' && (
												<button
													type="button"
													onClick={() => setLogoPreview('https://placehold.co/400x200/e2e8f0/1e293b?text=Barbershop')}
													className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
												>
													<X className="h-3 w-3" />
												</button>
											)}
										</div>
										<div className="flex-1">
											<Button
												type="button"
												variant="outline"
												className="w-full"
												onClick={() => document.getElementById('logo-upload')?.click()}
											>
												<Upload className="h-4 w-4 mr-2" /> Enviar Logo
											</Button>
											<input
												id="logo-upload"
												type="file"
												accept="image/*"
												className="hidden"
												onChange={(e) => handleImageUpload(e, 'logo')}
											/>
											<p className="text-xs text-gray-500 mt-2">
												Formato recomendado: PNG ou JPG, máximo 2MB
											</p>
										</div>
									</div>
								</div>

								<div className="space-y-4">
									<label className="text-sm font-medium">Foto de Capa</label>
									<div className="border rounded-lg overflow-hidden">
										<div className="relative w-full h-40 bg-gray-50">
											<img
												src={coverPhotoPreview}
												alt="Foto de Capa"
												className="w-full h-full object-cover"
											/>
											{coverPhotoPreview !== 'https://placehold.co/800x400/e2e8f0/1e293b?text=Cover+Photo' && (
												<button
													type="button"
													onClick={() => setCoverPhotoPreview('https://placehold.co/800x400/e2e8f0/1e293b?text=Cover+Photo')}
													className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
												>
													<X className="h-4 w-4" />
												</button>
											)}
											<div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 flex justify-center">
												<Button
													type="button"
													variant="ghost"
													className="text-white hover:bg-black hover:bg-opacity-30"
													onClick={() => document.getElementById('cover-upload')?.click()}
												>
													<Camera className="h-4 w-4 mr-2" /> Alterar Foto de Capa
												</Button>
												<input
													id="cover-upload"
													type="file"
													accept="image/*"
													className="hidden"
													onChange={(e) => handleImageUpload(e, 'cover')}
												/>
											</div>
										</div>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium">Nome da Barbearia</label>
									<input
										type="text"
										name="companyName"
										className="w-full rounded-md border border-gray-300 px-3 py-2"
										defaultValue={company?.name || ''}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Endereço</label>
									<input
										type="text"
										name="address"
										className="w-full rounded-md border border-gray-300 px-3 py-2"
										defaultValue={company?.address || ''}
									/>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-medium">Telefone</label>
										<input
											type="text"
											name="phone"
											className="w-full rounded-md border border-gray-300 px-3 py-2"
											defaultValue={company?.phone || ''}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">WhatsApp</label>
										<input
											type="text"
											name="whatsapp"
											className="w-full rounded-md border border-gray-300 px-3 py-2"
											defaultValue={company?.whatsapp || ''}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">E-mail</label>
									<input
										type="email"
										name="email"
										className="w-full rounded-md border border-gray-300 px-3 py-2"
										defaultValue={company?.email || ''}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Url de agendamentos</label>
									<input
										disabled
										type="slug"
										name="slug"
										className="w-full rounded-md border border-gray-300 px-3 py-2"
										defaultValue={company?.slug || ''}
									/>
								</div>
							</form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center space-x-4">
							<Clock className="h-6 w-6 text-blue-500" />
							<div>
								<CardTitle>Horário de Funcionamento</CardTitle>
								<CardDescription>Configure os dias e horários de atendimento</CardDescription>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{openingHours.map((day, index) => (
									<div key={day.day} className="space-y-2 pb-3 border-b last:border-b-0 last:pb-0">
										<div className="flex justify-between items-center">
											<label className="text-sm font-medium">{day.label}</label>
											<div className="flex items-center space-x-2">
												<span className="text-sm text-gray-500">{day.isOpen ? 'Aberto' : 'Fechado'}</span>
												<Switch
													checked={day.isOpen}
													onCheckedChange={(checked) => handleOpeningHoursChange(index, 'isOpen', checked)}
												/>
											</div>
										</div>
										<div className="flex space-x-2">
											<div className="flex-1">
												<input
													type="time"
													className={`w-full rounded-md border px-3 py-2 ${!day.isOpen ? 'opacity-50' : ''} ${timeErrors[day.day] ? 'border-red-500' : 'border-gray-300'}`}
													value={day.openTime}
													onChange={(e) => handleOpeningHoursChange(index, 'openTime', e.target.value)}
													disabled={!day.isOpen}
												/>
											</div>
											<span className="flex items-center text-gray-500">até</span>
											<div className="flex-1">
												<input
													type="time"
													className={`w-full rounded-md border px-3 py-2 ${!day.isOpen ? 'opacity-50' : ''} ${timeErrors[day.day] ? 'border-red-500' : 'border-gray-300'}`}
													value={day.closeTime}
													onChange={(e) => handleOpeningHoursChange(index, 'closeTime', e.target.value)}
													disabled={!day.isOpen}
												/>
											</div>
										</div>
										{timeErrors[day.day] && (
											<p className="text-sm text-red-500">O horário de abertura não pode ser maior ou igual ao de fechamento</p>
										)}
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center space-x-4">
							<Calendar className="h-6 w-6 text-blue-500" />
							<div>
								<CardTitle>Configurações de Agendamento</CardTitle>
								<CardDescription>Preferências para o sistema de agendamento</CardDescription>
							</div>
						</CardHeader>
						<CardContent>
							<form className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">Intervalo de Agendamento (minutos)</label>
									<select
										name="appointmentInterval"
										className="w-full rounded-md border border-gray-300 px-3 py-2"
										defaultValue={settings?.appointmentIntervalMinutes || 30}
									>
										<option value="15">15 minutos</option>
										<option value="30">30 minutos</option>
										<option value="45">45 minutos</option>
										<option value="60">60 minutos</option>
									</select>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Dias de Antecedência para Agendamento</label>
									<input
										type="number"
										name="advanceNoticeDays"
										className="w-full rounded-md border border-gray-300 px-3 py-2"
										defaultValue={settings?.advanceNoticeDays || 30}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Tempo de Preparação entre Serviços (minutos)</label>
									<input
										type="number"
										name="preparationTime"
										className="w-full rounded-md border border-gray-300 px-3 py-2"
										defaultValue={settings?.preparationTimeMinutes || 5}
									/>
								</div>
								<div className="space-y-4 mt-4">
									<h3 className="text-sm font-medium">Notificações</h3>
									<div className="flex justify-between items-center">
										<label className="text-sm">Enviar lembretes por WhatsApp</label>
										<Switch
											name="sendReminder"
											defaultChecked={settings?.sendReminderWhatsApp || false}
										/>
									</div>
									<div className="flex justify-between items-center">
										<label className="text-sm">Confirmar agendamentos por WhatsApp</label>
										<Switch
											name="confirmAppointment"
											defaultChecked={settings?.confirmAppointmentWhatsApp || false}
										/>
									</div>
									<div className="flex justify-between items-center">
										<label className="text-sm">Avisar barbeiro sobre novos agendamentos</label>
										<Switch
											name="notifyBarber"
											defaultChecked={settings?.notifyBarberNewAppointments || false}
										/>
									</div>
								</div>
							</form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center space-x-4">
							<DollarSign className="h-6 w-6 text-blue-500" />
							<div>
								<CardTitle>Configurações Financeiras</CardTitle>
								<CardDescription>Ajustes para pagamentos e comissões</CardDescription>
							</div>
						</CardHeader>
						<CardContent>
							<form className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">Formas de Pagamento Aceitas</label>
									<div className="grid grid-cols-2 gap-2">
										<div className="flex items-center space-x-2">
											<input type="checkbox" id="credit" name="paymentMethods" defaultChecked={settings?.acceptedPaymentMethods?.includes('credit') || false} />
											<label htmlFor="credit" className="text-sm">Cartão de Crédito</label>
										</div>
										<div className="flex items-center space-x-2">
											<input type="checkbox" id="debit" name="paymentMethods" defaultChecked={settings?.acceptedPaymentMethods?.includes('debit') || false} />
											<label htmlFor="debit" className="text-sm">Cartão de Débito</label>
										</div>
										<div className="flex items-center space-x-2">
											<input type="checkbox" id="cash" name="paymentMethods" defaultChecked={settings?.acceptedPaymentMethods?.includes('cash') || false} />
											<label htmlFor="cash" className="text-sm">Dinheiro</label>
										</div>
										<div className="flex items-center space-x-2">
											<input type="checkbox" id="pix" name="paymentMethods" defaultChecked={settings?.acceptedPaymentMethods?.includes('pix') || false} />
											<label htmlFor="pix" className="text-sm">PIX</label>
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Porcentagem Padrão de Comissão (%)</label>
									<input
										type="number"
										name="commissionPercentage"
										className="w-full rounded-md border border-gray-300 px-3 py-2"
										defaultValue={settings?.commissionPercentage || 40}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Frequência de Pagamento de Comissões</label>
									<select
										name="commissionFrequency"
										className="w-full rounded-md border border-gray-300 px-3 py-2"
										defaultValue={settings?.commissionPaymentFrequency || 'quinzenal'}
									>
										<option>Diária</option>
										<option>Semanal</option>
										<option>Quinzenal</option>
										<option>Mensal</option>
									</select>
								</div>
								<div className="space-y-4 mt-4">
									<h3 className="text-sm font-medium">Opções de Pagamento</h3>
									<div className="flex justify-between items-center">
										<label className="text-sm">Permitir pagamento antecipado online</label>
										<Switch
											name="allowEarlyPayment"
											defaultChecked={settings?.allowEarlyPaymentOnline || false}
										/>
									</div>
									<div className="flex justify-between items-center">
										<label className="text-sm">Exigir depósito para confirmação</label>
										<Switch
											name="requireDeposit"
											defaultChecked={settings?.requireDepositConfirmation || false}
										/>
									</div>
									<div className="flex justify-between items-center">
										<label className="text-sm">Aplicar desconto para pagamento à vista</label>
										<Switch
											name="applyDiscount"
											defaultChecked={settings?.applyDiscountForCashPayment || false}
										/>
									</div>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminSettings;
