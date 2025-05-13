import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/utils/currency';
import {
	ArrowLeft,
	Save,
	Trash2,
	Settings,
	Users,
	DollarSign,
	Tag,
	Clock,
	Percent,
	Calendar,
	AlertCircle,
	CheckCircle2,
	XCircle,
	Plus,
	Minus,
	BarChart2,
	TrendingUp,
	Loader2
} from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
	// Novos campos
	benefits?: string[];
	limitations?: string[];
	discounts?: {
		service: string;
		percentage: number;
	}[];
	validityPeriod?: number; // em meses
	renewalDiscount?: number; // desconto na renovação
	cancellationPolicy?: string;
	gracePeriod?: number; // período de carência em dias
	minimumCommitment?: number; // compromisso mínimo em meses
	exclusiveServices?: string[];
	bonusServices?: {
		service: string;
		frequency: number; // a cada X meses
	}[];
}

const SubscriptionPlanDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("basico");

	// Simular carregamento do plano
	useEffect(() => {
		// Aqui você faria a chamada à API
		setTimeout(() => {
			setPlan({
				id: Number(id),
				name: "Plano Premium",
				price: 299.90,
				description: "Serviços premium com desconto",
				isActive: true,
				services: ["Corte Premium", "Barba Premium", "Hidratação Premium"],
				subscribers: 28,
				monthlyGrowth: 8,
				revenueHistory: [
					{ month: 'Jan', value: 15000 },
					{ month: 'Fev', value: 16500 },
					{ month: 'Mar', value: 18200 },
				],
				activeUsers: { total: 28, new: 5, churned: 1 },
				retentionRate: 97.2,
				benefits: [
					"Atendimento prioritário",
					"Produtos exclusivos",
					"Desconto em produtos"
				],
				limitations: [
					"Máximo de 4 visitas por mês",
					"Válido apenas para serviços listados"
				],
				discounts: [
					{ service: "Produtos", percentage: 15 },
					{ service: "Serviços Premium", percentage: 10 }
				],
				validityPeriod: 12,
				renewalDiscount: 5,
				cancellationPolicy: "Cancelamento com 30 dias de antecedência",
				gracePeriod: 7,
				minimumCommitment: 3,
				exclusiveServices: ["Tratamento Capilar Premium"],
				bonusServices: [
					{ service: "Hidratação Premium", frequency: 3 },
					{ service: "Limpeza de Pele", frequency: 6 }
				]
			});
			setIsLoading(false);
		}, 1000);
	}, [id]);

	const handleSave = async () => {
		setIsSaving(true);
		// Aqui você faria a chamada à API para salvar
		await new Promise(resolve => setTimeout(resolve, 1000));
		setIsSaving(false);
		navigate('/admin/subscriptions');
	};

	const handleDelete = async () => {
		// Aqui você faria a chamada à API para deletar
		await new Promise(resolve => setTimeout(resolve, 1000));
		navigate('/admin/subscriptions');
	};

	if (isLoading) {
		return (
			<AdminLayout>
				<div className="flex justify-center items-center h-[calc(100vh-4rem)]">
					<Loader2 className="h-8 w-8 animate-spin text-barber-500" />
				</div>
			</AdminLayout>
		);
	}

	if (!plan) {
		return (
			<AdminLayout>
				<div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
					<AlertCircle className="h-12 w-12 text-red-500 mb-4" />
					<h2 className="text-xl font-semibold text-gray-800">Plano não encontrado</h2>
					<p className="text-gray-500 mt-2">O plano que você está procurando não existe.</p>
					<Button
						variant="outline"
						className="mt-4"
						onClick={() => navigate('/admin/subscriptions')}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar para Planos
					</Button>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							onClick={() => navigate('/admin/subscriptions')}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Voltar
						</Button>
						<div>
							<h1 className="text-2xl font-bold text-gray-800">{plan.name}</h1>
							<p className="text-gray-500">Edite os detalhes do plano de assinatura</p>
						</div>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(true)}
							className="text-red-600 hover:text-red-700"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Excluir Plano
						</Button>
						<Button
							onClick={handleSave}
							disabled={isSaving}
							className="bg-barber-500 hover:bg-barber-600 text-white"
						>
							{isSaving ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							Salvar Alterações
						</Button>
					</div>
				</div>

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList>
						<TabsTrigger value="basico">
							<Settings className="h-4 w-4 mr-2" />
							Básico
						</TabsTrigger>
						<TabsTrigger value="servicos">
							<Tag className="h-4 w-4 mr-2" />
							Serviços
						</TabsTrigger>
						<TabsTrigger value="beneficios">
							<Percent className="h-4 w-4 mr-2" />
							Benefícios
						</TabsTrigger>
						<TabsTrigger value="politicas">
							<Clock className="h-4 w-4 mr-2" />
							Políticas
						</TabsTrigger>
						<TabsTrigger value="metricas">
							<BarChart2 className="h-4 w-4 mr-2" />
							Métricas
						</TabsTrigger>
					</TabsList>

					{/* Conteúdo das Tabs */}
					<TabsContent value="basico" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Informações Básicas</CardTitle>
								<CardDescription>Configure as informações principais do plano</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="name">Nome do Plano</Label>
										<Input
											id="name"
											value={plan.name}
											onChange={(e) => setPlan({ ...plan, name: e.target.value })}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="price">Preço Mensal</Label>
										<Input
											id="price"
											type="number"
											value={plan.price}
											onChange={(e) => setPlan({ ...plan, price: Number(e.target.value) })}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Descrição</Label>
									<Textarea
										id="description"
										value={plan.description}
										onChange={(e) => setPlan({ ...plan, description: e.target.value })}
										className="resize-none"
									/>
								</div>
								<div className="flex items-center space-x-2">
									<Switch
										id="active"
										checked={plan.isActive}
										onCheckedChange={(checked) => setPlan({ ...plan, isActive: checked })}
									/>
									<Label htmlFor="active">Plano Ativo</Label>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="servicos" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Serviços Inclusos</CardTitle>
								<CardDescription>Gerencie os serviços disponíveis no plano</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label>Serviços Principais</Label>
									<div className="flex flex-wrap gap-2">
										{plan.services.map((service, index) => (
											<Badge key={index} variant="secondary" className="bg-gray-100">
												{service}
												<button
													onClick={() => {
														setPlan({
															...plan,
															services: plan.services.filter((_, i) => i !== index)
														});
													}}
													className="ml-2 text-gray-500 hover:text-red-500"
												>
													<XCircle className="h-3 w-3" />
												</button>
											</Badge>
										))}
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												const newService = prompt("Nome do novo serviço:");
												if (newService) {
													setPlan({
														...plan,
														services: [...plan.services, newService]
													});
												}
											}}
										>
											<Plus className="h-4 w-4 mr-1" />
											Adicionar
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<Label>Serviços Exclusivos</Label>
									<div className="flex flex-wrap gap-2">
										{plan.exclusiveServices?.map((service, index) => (
											<Badge key={index} variant="default" className="bg-barber-500">
												{service}
												<button
													onClick={() => {
														setPlan({
															...plan,
															exclusiveServices: plan.exclusiveServices?.filter((_, i) => i !== index)
														});
													}}
													className="ml-2 text-white hover:text-red-200"
												>
													<XCircle className="h-3 w-3" />
												</button>
											</Badge>
										))}
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												const newService = prompt("Nome do serviço exclusivo:");
												if (newService) {
													setPlan({
														...plan,
														exclusiveServices: [...(plan.exclusiveServices || []), newService]
													});
												}
											}}
										>
											<Plus className="h-4 w-4 mr-1" />
											Adicionar
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<Label>Serviços Bônus</Label>
									<div className="space-y-2">
										{plan.bonusServices?.map((bonus, index) => (
											<div key={index} className="flex items-center gap-2">
												<Input
													value={bonus.service}
													onChange={(e) => {
														const newBonus = [...(plan.bonusServices || [])];
														newBonus[index] = { ...bonus, service: e.target.value };
														setPlan({ ...plan, bonusServices: newBonus });
													}}
													placeholder="Nome do serviço"
												/>
												<Input
													type="number"
													value={bonus.frequency}
													onChange={(e) => {
														const newBonus = [...(plan.bonusServices || [])];
														newBonus[index] = { ...bonus, frequency: Number(e.target.value) };
														setPlan({ ...plan, bonusServices: newBonus });
													}}
													placeholder="Frequência (meses)"
													className="w-32"
												/>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setPlan({
															...plan,
															bonusServices: plan.bonusServices?.filter((_, i) => i !== index)
														});
													}}
												>
													<Trash2 className="h-4 w-4 text-red-500" />
												</Button>
											</div>
										))}
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setPlan({
													...plan,
													bonusServices: [...(plan.bonusServices || []), { service: '', frequency: 3 }]
												});
											}}
										>
											<Plus className="h-4 w-4 mr-1" />
											Adicionar Serviço Bônus
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="beneficios" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Benefícios e Limitações</CardTitle>
								<CardDescription>Configure os benefícios e limitações do plano</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-2">
									<Label>Benefícios do Plano</Label>
									<div className="space-y-2">
										{plan.benefits?.map((benefit, index) => (
											<div key={index} className="flex items-center gap-2">
												<Input
													value={benefit}
													onChange={(e) => {
														const newBenefits = [...(plan.benefits || [])];
														newBenefits[index] = e.target.value;
														setPlan({ ...plan, benefits: newBenefits });
													}}
												/>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setPlan({
															...plan,
															benefits: plan.benefits?.filter((_, i) => i !== index)
														});
													}}
												>
													<Trash2 className="h-4 w-4 text-red-500" />
												</Button>
											</div>
										))}
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setPlan({
													...plan,
													benefits: [...(plan.benefits || []), '']
												});
											}}
										>
											<Plus className="h-4 w-4 mr-1" />
											Adicionar Benefício
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<Label>Limitações</Label>
									<div className="space-y-2">
										{plan.limitations?.map((limitation, index) => (
											<div key={index} className="flex items-center gap-2">
												<Input
													value={limitation}
													onChange={(e) => {
														const newLimitations = [...(plan.limitations || [])];
														newLimitations[index] = e.target.value;
														setPlan({ ...plan, limitations: newLimitations });
													}}
												/>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setPlan({
															...plan,
															limitations: plan.limitations?.filter((_, i) => i !== index)
														});
													}}
												>
													<Trash2 className="h-4 w-4 text-red-500" />
												</Button>
											</div>
										))}
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setPlan({
													...plan,
													limitations: [...(plan.limitations || []), '']
												});
											}}
										>
											<Plus className="h-4 w-4 mr-1" />
											Adicionar Limitação
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<Label>Descontos em Serviços</Label>
									<div className="space-y-2">
										{plan.discounts?.map((discount, index) => (
											<div key={index} className="flex items-center gap-2">
												<Input
													value={discount.service}
													onChange={(e) => {
														const newDiscounts = [...(plan.discounts || [])];
														newDiscounts[index] = { ...discount, service: e.target.value };
														setPlan({ ...plan, discounts: newDiscounts });
													}}
													placeholder="Nome do serviço"
												/>
												<Input
													type="number"
													value={discount.percentage}
													onChange={(e) => {
														const newDiscounts = [...(plan.discounts || [])];
														newDiscounts[index] = { ...discount, percentage: Number(e.target.value) };
														setPlan({ ...plan, discounts: newDiscounts });
													}}
													placeholder="Porcentagem"
													className="w-32"
												/>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setPlan({
															...plan,
															discounts: plan.discounts?.filter((_, i) => i !== index)
														});
													}}
												>
													<Trash2 className="h-4 w-4 text-red-500" />
												</Button>
											</div>
										))}
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setPlan({
													...plan,
													discounts: [...(plan.discounts || []), { service: '', percentage: 0 }]
												});
											}}
										>
											<Plus className="h-4 w-4 mr-1" />
											Adicionar Desconto
										</Button>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="renewalDiscount">Desconto na Renovação (%)</Label>
										<Input
											id="renewalDiscount"
											type="number"
											value={plan.renewalDiscount}
											onChange={(e) => setPlan({ ...plan, renewalDiscount: Number(e.target.value) })}
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="politicas" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Políticas do Plano</CardTitle>
								<CardDescription>Configure as políticas e regras do plano</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="validityPeriod">Período de Validade (meses)</Label>
										<Input
											id="validityPeriod"
											type="number"
											value={plan.validityPeriod}
											onChange={(e) => setPlan({ ...plan, validityPeriod: Number(e.target.value) })}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="minimumCommitment">Compromisso Mínimo (meses)</Label>
										<Input
											id="minimumCommitment"
											type="number"
											value={plan.minimumCommitment}
											onChange={(e) => setPlan({ ...plan, minimumCommitment: Number(e.target.value) })}
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="gracePeriod">Período de Carência (dias)</Label>
										<Input
											id="gracePeriod"
											type="number"
											value={plan.gracePeriod}
											onChange={(e) => setPlan({ ...plan, gracePeriod: Number(e.target.value) })}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="cancellationPolicy">Política de Cancelamento</Label>
									<Textarea
										id="cancellationPolicy"
										value={plan.cancellationPolicy}
										onChange={(e) => setPlan({ ...plan, cancellationPolicy: e.target.value })}
										className="resize-none"
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="metricas" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Métricas do Plano</CardTitle>
								<CardDescription>Visualize as métricas e estatísticas do plano</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-3 gap-4">
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium">Total de Assinantes</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">{plan.subscribers}</div>
											<div className="text-sm text-gray-500">
												{plan.activeUsers?.new} novos este mês
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">{plan.retentionRate?.toFixed(1)}%</div>
											<div className="text-sm text-gray-500">
												{plan.activeUsers?.churned} cancelamentos
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">
												{formatCurrency(plan.price * (plan.subscribers || 0))}
											</div>
											<div className="text-sm text-gray-500">
												{plan.monthlyGrowth}% de crescimento
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Histórico de Receita */}
								<div className="mt-6">
									<h3 className="text-lg font-medium mb-4">Histórico de Receita</h3>
									<div className="grid grid-cols-6 gap-4">
										{plan.revenueHistory?.map((month, index) => (
											<Card key={month.month}>
												<CardHeader className="pb-2">
													<CardTitle className="text-sm font-medium">{month.month}</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="text-lg font-bold">
														{formatCurrency(month.value)}
													</div>
													{index > 0 && (
														<div className={`text-sm ${month.value > (plan.revenueHistory?.[index - 1]?.value || 0)
																? 'text-green-600'
																: 'text-red-600'
															}`}>
															{month.value > (plan.revenueHistory?.[index - 1]?.value || 0) ? '+' : ''}
															{((month.value - (plan.revenueHistory?.[index - 1]?.value || 0)) /
																(plan.revenueHistory?.[index - 1]?.value || 1) * 100).toFixed(1)}%
														</div>
													)}
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Modal de Confirmação de Exclusão */}
				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Excluir Plano</DialogTitle>
							<DialogDescription>
								Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
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
								onClick={handleDelete}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Excluir Plano
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</AdminLayout>
	);
};

export default SubscriptionPlanDetails; 