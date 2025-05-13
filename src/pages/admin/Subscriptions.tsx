import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Check, X, Users, DollarSign, TrendingUp, Loader2, BarChart2, Calendar, ArrowUpRight, ArrowDownRight, Clock, CalendarDays, Star, AlertCircle, Search, ChevronRight, Settings, Tag, Filter, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from '@/utils/currency';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlan {
	id: number;
	name: string;
	price: number;
	description: string;
	isActive: boolean;
	services: string[];
	subscribers?: number;
	monthlyGrowth?: number;
	revenueHistory?: { month: string; value: number }[];
	activeUsers?: { total: number; new: number; churned: number };
	retentionRate?: number;
}

interface Subscriber {
	id: number;
	name: string;
	email: string;
	phone: string;
	plan: string;
	planId: number;
	startDate: string;
	status: 'active' | 'cancelled' | 'expired';
	lastVisit: string;
	nextVisit?: string;
	monthlyAppointments: number;
	totalAppointments: number;
	preferredServices: string[];
	visitFrequency: number; // média de visitas por mês
	lifetimeValue: number;
	lastPayment: string;
	paymentStatus: 'paid' | 'pending' | 'overdue';
	notes?: string;
}

// Dados simulados para demonstração
const mockRevenueHistory = [
	{ month: 'Jan', value: 15000 },
	{ month: 'Fev', value: 16500 },
	{ month: 'Mar', value: 18200 },
	{ month: 'Abr', value: 19500 },
	{ month: 'Mai', value: 21000 },
	{ month: 'Jun', value: 22500 },
];

const mockSubscribers: Subscriber[] = [
	{
		id: 1,
		name: "João Silva",
		email: "joao@email.com",
		phone: "(11) 99999-9999",
		plan: "Plano Mensal",
		planId: 1,
		startDate: "2024-01-15",
		status: "active",
		lastVisit: "2024-03-10",
		nextVisit: "2024-04-05",
		monthlyAppointments: 3,
		totalAppointments: 12,
		preferredServices: ["Corte", "Barba"],
		visitFrequency: 3.2,
		lifetimeValue: 2398.80,
		lastPayment: "2024-03-01",
		paymentStatus: "paid",
		notes: "Cliente fiel, sempre pontual"
	},
	{
		id: 2,
		name: "Pedro Santos",
		email: "pedro@email.com",
		phone: "(11) 98888-8888",
		plan: "Plano Premium",
		planId: 2,
		startDate: "2023-11-20",
		status: "active",
		lastVisit: "2024-03-15",
		nextVisit: "2024-04-12",
		monthlyAppointments: 4,
		totalAppointments: 18,
		preferredServices: ["Corte Premium", "Barba Premium", "Hidratação Premium"],
		visitFrequency: 4.1,
		lifetimeValue: 4198.60,
		lastPayment: "2024-03-01",
		paymentStatus: "paid",
		notes: "Gosta de experimentar novos serviços"
	},
	// Adicione mais assinantes conforme necessário
];

const AdminSubscriptions = () => {
	const navigate = useNavigate();
	const [plans, setPlans] = useState<SubscriptionPlan[]>([
		{
			id: 1,
			name: "Plano Mensal",
			price: 199.90,
			description: "Acesso a todos os serviços básicos",
			isActive: true,
			services: ["Corte", "Barba", "Hidratação"],
			subscribers: 45,
			monthlyGrowth: 12,
			revenueHistory: mockRevenueHistory,
			activeUsers: { total: 45, new: 8, churned: 2 },
			retentionRate: 95.5
		},
		{
			id: 2,
			name: "Plano Premium",
			price: 299.90,
			description: "Serviços premium com desconto",
			isActive: true,
			services: ["Corte Premium", "Barba Premium", "Hidratação Premium", "Produtos exclusivos"],
			subscribers: 28,
			monthlyGrowth: 8,
			revenueHistory: mockRevenueHistory.map(h => ({ ...h, value: h.value * 1.5 })),
			activeUsers: { total: 28, new: 5, churned: 1 },
			retentionRate: 97.2
		}
	]);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("planos");
	const [subscribers, setSubscribers] = useState<Subscriber[]>(mockSubscribers);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
	const [isSubscriberDialogOpen, setIsSubscriberDialogOpen] = useState(false);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

	const handleEdit = (plan: SubscriptionPlan) => {
		setEditingPlan(plan);
		setIsDialogOpen(true);
	};

	const handleDelete = (planId: number) => {
		setPlans(plans.filter(plan => plan.id !== planId));
	};

	const handleToggleStatus = async (plan: SubscriptionPlan) => {
		setIsLoading(true);
		// Aqui você faria a chamada à API
		await new Promise(resolve => setTimeout(resolve, 1000));
		setIsLoading(false);
	};

	const handleSave = (plan: Partial<SubscriptionPlan>) => {
		if (editingPlan) {
			setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...plan } : p));
		} else {
			setPlans([...plans, { ...plan, id: Math.max(...plans.map(p => p.id)) + 1, subscribers: 0 } as SubscriptionPlan]);
		}
		setIsDialogOpen(false);
		setEditingPlan(null);
	};

	// Estatísticas
	const totalSubscribers = plans.reduce((sum, plan) => sum + (plan.subscribers || 0), 0);
	const totalRevenue = plans.reduce((sum, plan) => sum + (plan.price * (plan.subscribers || 0)), 0);
	const activePlans = plans.filter(plan => plan.isActive).length;
	const averageRetentionRate = plans.reduce((sum, plan) => sum + (plan.retentionRate || 0), 0) / plans.length;
	const totalNewUsers = plans.reduce((sum, plan) => sum + (plan.activeUsers?.new || 0), 0);
	const totalChurnedUsers = plans.reduce((sum, plan) => sum + (plan.activeUsers?.churned || 0), 0);

	// Filtros e cálculos para assinantes
	const filteredSubscribers = subscribers.filter(sub =>
		sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		sub.phone.includes(searchTerm)
	);

	const activeSubscribers = subscribers.filter(sub => sub.status === 'active').length;
	const averageVisitFrequency = subscribers.reduce((sum, sub) => sum + sub.visitFrequency, 0) / subscribers.length;
	const totalLifetimeValue = subscribers.reduce((sum, sub) => sum + sub.lifetimeValue, 0);
	const averageLifetimeValue = totalLifetimeValue / subscribers.length;

	const handleEditDetails = (planId: number) => {
		navigate(`/admin/subscriptions/plan/${planId}`);
	};

	const handleCreatePlan = async () => {
		setIsLoading(true);
		// Aqui você faria a chamada à API
		await new Promise(resolve => setTimeout(resolve, 1000));
		setIsLoading(false);
		setIsCreateDialogOpen(false);
	};

	const handleDeletePlan = async () => {
		if (!selectedPlan) return;
		setIsLoading(true);
		// Aqui você faria a chamada à API
		await new Promise(resolve => setTimeout(resolve, 1000));
		setIsLoading(false);
		setIsDeleteDialogOpen(false);
		setSelectedPlan(null);
	};

	return (
		<AdminLayout>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Planos de Assinatura</h1>
						<p className="text-gray-500">Gerencie os planos disponíveis para seus clientes</p>
					</div>
					<Button
						onClick={() => {
							setEditingPlan(null);
							setIsDialogOpen(true);
						}}
						className="bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium"
					>
						<Plus className="mr-2 h-4 w-4" /> Novo Plano
					</Button>
				</div>

				<Tabs defaultValue="planos" className="space-y-4">
					<TabsList>
						<TabsTrigger value="planos">Planos</TabsTrigger>
						<TabsTrigger value="assinantes">Assinantes</TabsTrigger>
						<TabsTrigger value="avancado">Avançado</TabsTrigger>
					</TabsList>

					<TabsContent value="planos" className="space-y-4">
						{/* Cards de Estatísticas */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Card className="border-0 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-gray-800">Total de Assinantes</CardTitle>
									<Users className="h-4 w-4 text-barber-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-800">{totalSubscribers}</div>
									<p className="text-xs text-gray-500">
										Clientes ativos em planos
									</p>
								</CardContent>
							</Card>

							<Card className="border-0 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-gray-800">Receita Mensal</CardTitle>
									<DollarSign className="h-4 w-4 text-barber-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</div>
									<p className="text-xs text-gray-500">
										Total em assinaturas
									</p>
								</CardContent>
							</Card>

							<Card className="border-0 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-gray-800">Planos Ativos</CardTitle>
									<TrendingUp className="h-4 w-4 text-barber-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-800">{activePlans}</div>
									<p className="text-xs text-gray-500">
										De {plans.length} planos cadastrados
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Lista de Planos - Nova Visualização */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{plans.map((plan) => (
								<Card key={plan.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
									<CardHeader className="pb-2">
										<div className="flex justify-between items-start">
											<div>
												<CardTitle className="text-xl text-gray-800 flex items-center gap-2">
													{plan.name}
													{plan.isActive ? (
														<Badge variant="default" className="bg-green-500">Ativo</Badge>
													) : (
														<Badge variant="secondary">Inativo</Badge>
													)}
												</CardTitle>
												<CardDescription className="mt-1">{plan.description}</CardDescription>
											</div>
											<div className="flex gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEditDetails(plan.id)}
													className="text-barber-500 hover:text-barber-600"
												>
													<Settings className="h-4 w-4 mr-1" />
													Detalhes
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleToggleStatus(plan)}
													className={plan.isActive ? "text-green-600" : "text-red-600"}
												>
													{plan.isActive ? (
														<Check className="h-4 w-4" />
													) : (
														<X className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-4">
												<div>
													<div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
														<DollarSign className="h-4 w-4" />
														<span>Preço Mensal</span>
													</div>
													<div className="text-2xl font-bold text-gray-800">
														{formatCurrency(plan.price)}
													</div>
												</div>
												<div>
													<div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
														<Users className="h-4 w-4" />
														<span>Assinantes</span>
													</div>
													<div className="text-2xl font-bold text-gray-800">
														{plan.subscribers || 0}
													</div>
													{plan.monthlyGrowth && (
														<div className="text-sm text-green-600 flex items-center gap-1">
															<ArrowUpRight className="h-4 w-4" />
															+{plan.monthlyGrowth}% este mês
														</div>
													)}
												</div>
											</div>
											<div className="space-y-4">
												<div>
													<div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
														<BarChart2 className="h-4 w-4" />
														<span>Retenção</span>
													</div>
													<div className="text-2xl font-bold text-gray-800">
														{plan.retentionRate?.toFixed(1)}%
													</div>
													<div className="text-sm text-gray-500">
														Taxa de permanência
													</div>
												</div>
												<div>
													<div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
														<TrendingUp className="h-4 w-4" />
														<span>Receita Mensal</span>
													</div>
													<div className="text-2xl font-bold text-gray-800">
														{formatCurrency(plan.price * (plan.subscribers || 0))}
													</div>
												</div>
											</div>
										</div>

										<div className="mt-4">
											<div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
												<Tag className="h-4 w-4" />
												<span>Serviços Inclusos</span>
											</div>
											<div className="flex flex-wrap gap-2">
												{plan.services.map((service, index) => (
													<Badge key={index} variant="secondary" className="bg-gray-100">
														{service}
													</Badge>
												))}
											</div>
										</div>
									</CardContent>
									<CardFooter className="border-t pt-4">
										<div className="w-full flex justify-between items-center">
											<div className="flex items-center gap-4">
												<div className="flex items-center gap-1 text-sm text-gray-500">
													<Users className="h-4 w-4" />
													<span>+{plan.activeUsers?.new || 0} novos</span>
												</div>
												<div className="flex items-center gap-1 text-sm text-red-500">
													<ArrowDownRight className="h-4 w-4" />
													<span>-{plan.activeUsers?.churned || 0} cancelados</span>
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleEditDetails(plan.id)}
												className="text-barber-500 hover:text-barber-600"
											>
												Ver detalhes
												<ChevronRight className="h-4 w-4 ml-1" />
											</Button>
										</div>
									</CardFooter>
								</Card>
							))}

							{/* Card para Novo Plano */}
							<Card className="border-2 border-dashed border-gray-200 hover:border-barber-500 transition-colors cursor-pointer"
								onClick={() => {
									setEditingPlan(null);
									setIsDialogOpen(true);
								}}
							>
								<CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
									<div className="rounded-full bg-barber-100 p-3 mb-4">
										<Plus className="h-6 w-6 text-barber-500" />
									</div>
									<h3 className="text-lg font-medium text-gray-800 mb-2">Criar Novo Plano</h3>
									<p className="text-sm text-gray-500">
										Adicione um novo plano de assinatura para seus clientes
									</p>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="assinantes" className="space-y-4">
						{/* Métricas de Assinantes */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<Card className="border-0 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-gray-800">Assinantes Ativos</CardTitle>
									<Users className="h-4 w-4 text-barber-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-800">{activeSubscribers}</div>
									<p className="text-xs text-gray-500">
										De {subscribers.length} assinantes
									</p>
								</CardContent>
							</Card>

							<Card className="border-0 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-gray-800">Frequência Média</CardTitle>
									<CalendarDays className="h-4 w-4 text-barber-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-800">{averageVisitFrequency.toFixed(1)}</div>
									<p className="text-xs text-gray-500">
										Visitas por mês
									</p>
								</CardContent>
							</Card>

							<Card className="border-0 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-gray-800">Valor Médio</CardTitle>
									<DollarSign className="h-4 w-4 text-barber-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-800">{formatCurrency(averageLifetimeValue)}</div>
									<p className="text-xs text-gray-500">
										Por assinante
									</p>
								</CardContent>
							</Card>

							<Card className="border-0 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-gray-800">Valor Total</CardTitle>
									<Star className="h-4 w-4 text-barber-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-800">{formatCurrency(totalLifetimeValue)}</div>
									<p className="text-xs text-gray-500">
										Em assinaturas
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Lista de Assinantes */}
						<Card className="border-0 shadow-sm">
							<CardHeader>
								<div className="flex justify-between items-center">
									<div>
										<CardTitle className="text-xl text-gray-800">Assinantes</CardTitle>
										<CardDescription>Gerencie e visualize os assinantes dos planos</CardDescription>
									</div>
									<div className="relative w-64">
										<Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
										<Input
											placeholder="Buscar assinante..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-8"
										/>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Assinante</TableHead>
												<TableHead>Plano</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Última Visita</TableHead>
												<TableHead>Próxima Visita</TableHead>
												<TableHead>Frequência</TableHead>
												<TableHead>Valor Total</TableHead>
												<TableHead className="text-right">Ações</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredSubscribers.map((subscriber) => (
												<TableRow key={subscriber.id} className="hover:bg-gray-50">
													<TableCell>
														<div>
															<div className="font-medium">{subscriber.name}</div>
															<div className="text-sm text-gray-500">{subscriber.email}</div>
														</div>
													</TableCell>
													<TableCell>{subscriber.plan}</TableCell>
													<TableCell>
														<Badge
															variant={
																subscriber.status === 'active' ? 'default' :
																	subscriber.status === 'cancelled' ? 'destructive' :
																		'secondary'
															}
														>
															{subscriber.status === 'active' ? 'Ativo' :
																subscriber.status === 'cancelled' ? 'Cancelado' :
																	'Expirado'}
														</Badge>
													</TableCell>
													<TableCell>{new Date(subscriber.lastVisit).toLocaleDateString()}</TableCell>
													<TableCell>
														{subscriber.nextVisit ?
															new Date(subscriber.nextVisit).toLocaleDateString() :
															'-'
														}
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-2">
															<span>{subscriber.visitFrequency.toFixed(1)}</span>
															<span className="text-gray-500 text-sm">/mês</span>
														</div>
													</TableCell>
													<TableCell>{formatCurrency(subscriber.lifetimeValue)}</TableCell>
													<TableCell className="text-right">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setSelectedSubscriber(subscriber);
																setIsSubscriberDialogOpen(true);
															}}
														>
															<Edit2 className="h-4 w-4" />
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="avancado" className="space-y-4">
						{/* Métricas Avançadas */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<Card className="border-0 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-gray-800">Taxa de Retenção</CardTitle>
									<BarChart2 className="h-4 w-4 text-barber-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-800">{averageRetentionRate.toFixed(1)}%</div>
									<p className="text-xs text-gray-500">
										Média de retenção dos planos
									</p>
								</CardContent>
							</Card>

							<Card className="border-0 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-gray-800">Novos Assinantes</CardTitle>
									<ArrowUpRight className="h-4 w-4 text-green-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-800">+{totalNewUsers}</div>
									<p className="text-xs text-gray-500">
										Este mês
									</p>
								</CardContent>
							</Card>

							<Card className="border-0 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-gray-800">Cancelamentos</CardTitle>
									<ArrowDownRight className="h-4 w-4 text-red-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-800">-{totalChurnedUsers}</div>
									<p className="text-xs text-gray-500">
										Este mês
									</p>
								</CardContent>
							</Card>

							<Card className="border-0 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium text-gray-800">Crescimento</CardTitle>
									<TrendingUp className="h-4 w-4 text-barber-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-800">
										{((totalNewUsers - totalChurnedUsers) / totalSubscribers * 100).toFixed(1)}%
									</div>
									<p className="text-xs text-gray-500">
										Taxa de crescimento líquido
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Análise Detalhada por Plano */}
						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-xl text-gray-800">Análise por Plano</CardTitle>
								<CardDescription>Métricas detalhadas de cada plano de assinatura</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Plano</TableHead>
												<TableHead>Assinantes</TableHead>
												<TableHead>Receita Mensal</TableHead>
												<TableHead>Crescimento</TableHead>
												<TableHead>Retenção</TableHead>
												<TableHead>Novos</TableHead>
												<TableHead>Cancelados</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{plans.map((plan) => (
												<TableRow key={plan.id} className="hover:bg-gray-50">
													<TableCell className="font-medium">{plan.name}</TableCell>
													<TableCell>{plan.subscribers}</TableCell>
													<TableCell>{formatCurrency(plan.price * (plan.subscribers || 0))}</TableCell>
													<TableCell>
														<span className={`inline-flex items-center ${plan.monthlyGrowth && plan.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
															{plan.monthlyGrowth && plan.monthlyGrowth > 0 ? '+' : ''}{plan.monthlyGrowth}%
														</span>
													</TableCell>
													<TableCell>{plan.retentionRate?.toFixed(1)}%</TableCell>
													<TableCell className="text-green-600">+{plan.activeUsers?.new}</TableCell>
													<TableCell className="text-red-600">-{plan.activeUsers?.churned}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>

						{/* Histórico de Receita */}
						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-xl text-gray-800">Histórico de Receita</CardTitle>
								<CardDescription>Evolução da receita dos últimos 6 meses</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Mês</TableHead>
												{plans.map(plan => (
													<TableHead key={plan.id}>{plan.name}</TableHead>
												))}
												<TableHead>Total</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{mockRevenueHistory.map((month, index) => (
												<TableRow key={month.month} className="hover:bg-gray-50">
													<TableCell className="font-medium">{month.month}</TableCell>
													{plans.map(plan => (
														<TableCell key={plan.id}>
															{formatCurrency(plan.revenueHistory?.[index]?.value || 0)}
														</TableCell>
													))}
													<TableCell className="font-medium">
														{formatCurrency(plans.reduce((sum, plan) =>
															sum + (plan.revenueHistory?.[index]?.value || 0), 0
														))}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Modal de Cadastro/Edição */}
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
							<DialogDescription>
								{editingPlan ? 'Atualize as informações do plano' : 'Preencha as informações para criar um novo plano'}
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="name">Nome do Plano</Label>
								<Input
									id="name"
									defaultValue={editingPlan?.name}
									placeholder="Ex: Plano Mensal"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="price">Preço Mensal</Label>
								<Input
									id="price"
									type="number"
									defaultValue={editingPlan?.price}
									placeholder="0.00"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="description">Descrição</Label>
								<Textarea
									id="description"
									defaultValue={editingPlan?.description}
									placeholder="Descreva os benefícios do plano"
									className="resize-none"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="services">Serviços Inclusos</Label>
								<Input
									id="services"
									defaultValue={editingPlan?.services.join(", ")}
									placeholder="Corte, Barba, Hidratação (separados por vírgula)"
								/>
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id="active"
									defaultChecked={editingPlan?.isActive ?? true}
								/>
								<Label htmlFor="active">Plano Ativo</Label>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
								Cancelar
							</Button>
							<Button onClick={() => handleSave({})}>
								{editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Modal de Detalhes do Assinante */}
				<Dialog open={isSubscriberDialogOpen} onOpenChange={setIsSubscriberDialogOpen}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Detalhes do Assinante</DialogTitle>
							<DialogDescription>
								Informações detalhadas e histórico do assinante
							</DialogDescription>
						</DialogHeader>
						{selectedSubscriber && (
							<div className="grid gap-6">
								{/* Informações Básicas */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<h3 className="font-medium mb-2">Informações Pessoais</h3>
										<div className="space-y-2">
											<div>
												<Label className="text-sm text-gray-500">Nome</Label>
												<div className="font-medium">{selectedSubscriber.name}</div>
											</div>
											<div>
												<Label className="text-sm text-gray-500">Email</Label>
												<div className="font-medium">{selectedSubscriber.email}</div>
											</div>
											<div>
												<Label className="text-sm text-gray-500">Telefone</Label>
												<div className="font-medium">{selectedSubscriber.phone}</div>
											</div>
										</div>
									</div>
									<div>
										<h3 className="font-medium mb-2">Informações do Plano</h3>
										<div className="space-y-2">
											<div>
												<Label className="text-sm text-gray-500">Plano Atual</Label>
												<div className="font-medium">{selectedSubscriber.plan}</div>
											</div>
											<div>
												<Label className="text-sm text-gray-500">Data de Início</Label>
												<div className="font-medium">
													{new Date(selectedSubscriber.startDate).toLocaleDateString()}
												</div>
											</div>
											<div>
												<Label className="text-sm text-gray-500">Status do Pagamento</Label>
												<Badge
													variant={
														selectedSubscriber.paymentStatus === 'paid' ? 'default' :
															selectedSubscriber.paymentStatus === 'pending' ? 'secondary' :
																'destructive'
													}
												>
													{selectedSubscriber.paymentStatus === 'paid' ? 'Pago' :
														selectedSubscriber.paymentStatus === 'pending' ? 'Pendente' :
															'Atrasado'}
												</Badge>
											</div>
										</div>
									</div>
								</div>

								{/* Métricas de Uso */}
								<div>
									<h3 className="font-medium mb-4">Métricas de Uso</h3>
									<div className="grid grid-cols-3 gap-4">
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="text-2xl font-bold">{selectedSubscriber.totalAppointments}</div>
												<div className="text-sm text-gray-500">
													{selectedSubscriber.monthlyAppointments} este mês
												</div>
											</CardContent>
										</Card>
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-sm font-medium">Frequência</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="text-2xl font-bold">
													{selectedSubscriber.visitFrequency.toFixed(1)}
												</div>
												<div className="text-sm text-gray-500">visitas por mês</div>
											</CardContent>
										</Card>
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-sm font-medium">Valor Total</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="text-2xl font-bold">
													{formatCurrency(selectedSubscriber.lifetimeValue)}
												</div>
												<div className="text-sm text-gray-500">desde o início</div>
											</CardContent>
										</Card>
									</div>
								</div>

								{/* Serviços Preferidos */}
								<div>
									<h3 className="font-medium mb-2">Serviços Preferidos</h3>
									<div className="flex flex-wrap gap-2">
										{selectedSubscriber.preferredServices.map((service, index) => (
											<Badge key={index} variant="secondary">
												{service}
											</Badge>
										))}
									</div>
								</div>

								{/* Próximos Agendamentos */}
								<div>
									<h3 className="font-medium mb-2">Próximos Agendamentos</h3>
									{selectedSubscriber.nextVisit ? (
										<div className="flex items-center gap-2 text-sm">
											<Calendar className="h-4 w-4 text-gray-500" />
											<span>
												Próxima visita: {new Date(selectedSubscriber.nextVisit).toLocaleDateString()}
											</span>
										</div>
									) : (
										<div className="flex items-center gap-2 text-sm text-gray-500">
											<AlertCircle className="h-4 w-4" />
											<span>Nenhum agendamento futuro</span>
										</div>
									)}
								</div>

								{/* Observações */}
								<div>
									<h3 className="font-medium mb-2">Observações</h3>
									<div className="text-sm text-gray-600">
										{selectedSubscriber.notes || "Nenhuma observação registrada."}
									</div>
								</div>
							</div>
						)}
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsSubscriberDialogOpen(false)}>
								Fechar
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Modal de Criação */}
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Criar Novo Plano</DialogTitle>
							<DialogDescription>
								Preencha os detalhes do novo plano de assinatura
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="name">Nome do Plano</Label>
								<Input id="name" placeholder="Ex: Plano Premium" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="price">Preço Mensal</Label>
								<Input id="price" type="number" placeholder="0.00" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Descrição</Label>
								<Textarea
									id="description"
									placeholder="Descreva os benefícios do plano..."
									className="resize-none"
								/>
							</div>
							<div className="flex items-center space-x-2">
								<Switch id="active" defaultChecked />
								<Label htmlFor="active">Plano Ativo</Label>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsCreateDialogOpen(false)}
							>
								Cancelar
							</Button>
							<Button
								onClick={handleCreatePlan}
								disabled={isLoading}
								className="bg-barber-500 hover:bg-barber-600 text-white"
							>
								{isLoading ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Plus className="h-4 w-4 mr-2" />
								)}
								Criar Plano
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Modal de Exclusão */}
				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Excluir Plano</DialogTitle>
							<DialogDescription>
								Tem certeza que deseja excluir o plano "{selectedPlan?.name}"? Esta ação não pode ser desfeita.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsDeleteDialogOpen(false)}
							>
								Cancelar
							</Button>
							<Button
								variant="destructive"
								onClick={handleDeletePlan}
								disabled={isLoading}
							>
								{isLoading ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Trash2 className="h-4 w-4 mr-2" />
								)}
								Excluir Plano
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</AdminLayout>
	);
};

export default AdminSubscriptions; 