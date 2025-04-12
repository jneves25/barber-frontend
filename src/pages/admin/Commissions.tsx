
import React, { useState } from 'react';
import { format } from 'date-fns';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, Scissors, BarChart, Edit, Eye, Settings, UserPlus } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import CommissionSettings from '@/components/commission/CommissionSettings';
import ServiceCommissionForm from '@/components/commission/ServiceCommissionForm';
import UserService, { RoleEnum } from '@/services/api/UserService';
import { cn } from '@/lib/utils';

// Dados de exemplo para comissões dos barbeiros
const initialCommissions = [
  { id: 1, barber: 'Carlos Silva', services: 42, revenue: 2100, commission: 840, percentage: 40, commissionType: 'geral' },
  { id: 2, barber: 'Ricardo Gomes', services: 38, revenue: 1900, commission: 760, percentage: 40, commissionType: 'geral' },
  { id: 3, barber: 'André Santos', services: 45, revenue: 2250, commission: 900, percentage: 40, commissionType: 'geral' },
  { id: 4, barber: 'Felipe Costa', services: 36, revenue: 1800, commission: 720, percentage: 40, commissionType: 'por_servico' }
];

// Dados de exemplo para serviços
const services = [
  { id: 1, name: 'Corte de Cabelo', price: 50 },
  { id: 2, name: 'Barba', price: 35 },
  { id: 3, name: 'Combo Completo', price: 80 },
  { id: 4, name: 'Corte Degradê', price: 60 },
  { id: 5, name: 'Sobrancelha', price: 20 }
];

// Dados de exemplo para comissões por serviço
const initialServiceCommissions = [
  { barberId: 4, serviceId: 1, percentage: 45 },
  { barberId: 4, serviceId: 2, percentage: 40 },
  { barberId: 4, serviceId: 3, percentage: 35 },
  { barberId: 4, serviceId: 4, percentage: 50 },
  { barberId: 4, serviceId: 5, percentage: 30 }
];

const AdminCommissions = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [commissions, setCommissions] = useState(initialCommissions);
  const [serviceCommissions, setServiceCommissions] = useState(initialServiceCommissions);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: RoleEnum.USER
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCommissionTypeChange = (barberId: number, type: 'geral' | 'por_servico') => {
    setCommissions(prev => 
      prev.map(barber => 
        barber.id === barberId 
          ? { ...barber, commissionType: type }
          : barber
      )
    );
    
    toast({
      title: "Tipo de comissão alterado",
      description: `Tipo de comissão alterado para ${type === 'geral' ? 'geral' : 'por serviço'}`
    });
  };

  const handleOpenSettings = (barberId: number) => {
    setSelectedBarber(barberId);
    setIsSettingsOpen(true);
  };

  const handleOpenServiceForm = (barberId: number) => {
    setSelectedBarber(barberId);
    setIsServiceFormOpen(true);
  };

  const getBarberById = (id: number) => {
    return commissions.find(barber => barber.id === id);
  };

  const getServiceCommissionsForBarber = (barberId: number) => {
    return serviceCommissions.filter(commission => commission.barberId === barberId);
  };

  const updateServiceCommission = (barberId: number, serviceId: number, percentage: number) => {
    // Verifica se já existe uma comissão para este barbeiro e serviço
    const exists = serviceCommissions.some(
      commission => commission.barberId === barberId && commission.serviceId === serviceId
    );

    if (exists) {
      // Atualiza a comissão existente
      setServiceCommissions(prev => 
        prev.map(commission => 
          commission.barberId === barberId && commission.serviceId === serviceId
            ? { ...commission, percentage }
            : commission
        )
      );
    } else {
      // Adiciona uma nova comissão
      setServiceCommissions(prev => [
        ...prev,
        { barberId, serviceId, percentage }
      ]);
    }

    toast({
      title: "Comissão atualizada",
      description: `Comissão do serviço atualizada para ${percentage}%`
    });
  };

  const updateBarberGeneralCommission = (barberId: number, percentage: number) => {
    setCommissions(prev => 
      prev.map(barber => 
        barber.id === barberId 
          ? { ...barber, percentage }
          : barber
      )
    );

    toast({
      title: "Comissão geral atualizada",
      description: `Comissão geral atualizada para ${percentage}%`
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setNewUser(prev => ({ 
      ...prev, 
      role: value === 'MANAGER' ? RoleEnum.MANAGER : RoleEnum.USER 
    }));
  };

  const handleCreateUser = async () => {
    setIsLoading(true);
    try {
      // Validar campos
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos",
          variant: "destructive"
        });
        return;
      }

      // Criar usuário
      const response = await UserService.create({
        ...newUser,
        id: 0,
        permissions: {}
      });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso"
        });
        setIsUserModalOpen(false);
        // Reset form
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: RoleEnum.USER
        });
      } else {
        toast({
          title: "Erro",
          description: response.error || "Erro ao criar usuário",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar usuário",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Comissões da Equipe</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : <span>Data inicial</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <span>até</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : <span>Data final</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={() => setIsUserModalOpen(true)} className="bg-barber-500 hover:bg-barber-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Membro
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 8.050,00</div>
              <p className="text-xs text-muted-foreground">
                +12% comparado ao período anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 3.220,00</div>
              <p className="text-xs text-muted-foreground">
                40% do faturamento total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
              <Scissors className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">161</div>
              <p className="text-xs text-muted-foreground">
                +8% comparado ao período anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">% Média Comissão</CardTitle>
              <BarChart className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">40%</div>
              <p className="text-xs text-muted-foreground">
                Configurável por membro e serviço
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comissões da Equipe</CardTitle>
            <CardDescription>
              Dados do período selecionado: {startDate && format(startDate, 'dd/MM/yyyy')} até {endDate && format(endDate, 'dd/MM/yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissional</th>
                      <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviços</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comissão</th>
                      <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commissions.map(commission => (
                      <tr key={commission.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{commission.barber}</div>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{commission.services}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">R$ {commission.revenue.toFixed(2)}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">R$ {commission.commission.toFixed(2)}</div>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {commission.commissionType === 'geral' 
                              ? 'Geral' 
                              : 'Por serviço'}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {commission.commissionType === 'geral' 
                              ? `${commission.percentage}%`
                              : 'Variado'}
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button 
                              className="p-1 text-blue-500 hover:text-blue-700 transition-colors" 
                              title="Detalhes"
                              onClick={() => handleOpenServiceForm(commission.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-green-500 hover:text-green-700 transition-colors" 
                              title="Pagar"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                                  <Settings className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-56">
                                <DropdownMenuGroup>
                                  <DropdownMenuItem onClick={() => handleCommissionTypeChange(commission.id, 'geral')}>
                                    Usar comissão geral
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleCommissionTypeChange(commission.id, 'por_servico')}>
                                    Usar comissão por serviço
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenSettings(commission.id)}>
                                    Configurar comissão
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-3 py-3 whitespace-nowrap">Total</td>
                      <td className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">161</td>
                      <td className="px-3 py-3 whitespace-nowrap">R$ 8.050,00</td>
                      <td className="px-3 py-3 whitespace-nowrap">R$ 3.220,00</td>
                      <td className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">-</td>
                      <td className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">Variado</td>
                      <td className="px-3 py-3 whitespace-nowrap"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para configuração de comissão geral */}
      <CommissionSettings 
        isOpen={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen}
        barber={selectedBarber ? getBarberById(selectedBarber) : null}
        onSave={updateBarberGeneralCommission}
      />

      {/* Dialog para visualização e edição de comissões por serviço */}
      <ServiceCommissionForm
        isOpen={isServiceFormOpen}
        onOpenChange={setIsServiceFormOpen}
        barber={selectedBarber ? getBarberById(selectedBarber) : null}
        services={services}
        serviceCommissions={selectedBarber ? getServiceCommissionsForBarber(selectedBarber) : []}
        onSave={updateServiceCommission}
      />

      {/* Dialog para cadastro de novo usuário */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Membro</DialogTitle>
            <DialogDescription>
              Preencha os dados para cadastrar um novo membro à equipe.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Função
              </Label>
              <Select 
                onValueChange={handleRoleChange} 
                defaultValue={newUser.role === RoleEnum.MANAGER ? 'MANAGER' : 'USER'}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Funcionário</SelectItem>
                  <SelectItem value="MANAGER">Gerência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCommissions;
