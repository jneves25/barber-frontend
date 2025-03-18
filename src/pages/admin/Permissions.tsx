
import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { User, Shield, Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth, UserRole, User as UserType } from '@/context/AuthContext';

// Mock inicial de usuários
const initialUsers = [
  {
    id: '1',
    name: 'Admin Silva',
    email: 'admin@barbearia.com',
    role: 'admin' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    id: '2',
    name: 'Carlos Barbeiro',
    email: 'carlos@barbearia.com',
    role: 'barber' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '3',
    name: 'Ricardo Gomes',
    email: 'ricardo@barbearia.com',
    role: 'barber' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: '4',
    name: 'Maria Recepcionista',
    email: 'maria@barbearia.com',
    role: 'receptionist' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

// Todas as permissões disponíveis no sistema
const allPermissions = [
  { id: 'view_all_appointments', name: 'Ver todos os agendamentos', description: 'Acesso para visualizar agendamentos de todos os barbeiros' },
  { id: 'manage_appointments', name: 'Gerenciar agendamentos', description: 'Criar, editar e excluir agendamentos' },
  { id: 'view_own_appointments', name: 'Ver próprios agendamentos', description: 'Acesso para visualizar apenas seus próprios agendamentos' },
  { id: 'view_all_clients', name: 'Ver todos os clientes', description: 'Acesso para visualizar todos os clientes cadastrados' },
  { id: 'manage_clients', name: 'Gerenciar clientes', description: 'Criar, editar e excluir clientes' },
  { id: 'view_own_clients', name: 'Ver próprios clientes', description: 'Acesso para visualizar apenas seus próprios clientes' },
  { id: 'view_all_services', name: 'Ver todos os serviços', description: 'Acesso para visualizar todos os serviços disponíveis' },
  { id: 'manage_services', name: 'Gerenciar serviços', description: 'Criar, editar e excluir serviços' },
  { id: 'view_services', name: 'Ver serviços', description: 'Acesso para visualizar serviços disponíveis' },
  { id: 'view_all_products', name: 'Ver todos os produtos', description: 'Acesso para visualizar todos os produtos disponíveis' },
  { id: 'manage_products', name: 'Gerenciar produtos', description: 'Criar, editar e excluir produtos' },
  { id: 'view_products', name: 'Ver produtos', description: 'Acesso para visualizar produtos disponíveis' },
  { id: 'view_all_barbers', name: 'Ver todos os barbeiros', description: 'Acesso para visualizar todos os barbeiros' },
  { id: 'manage_barbers', name: 'Gerenciar barbeiros', description: 'Criar, editar e excluir barbeiros' },
  { id: 'view_all_commissions', name: 'Ver todas as comissões', description: 'Acesso para visualizar comissões de todos os barbeiros' },
  { id: 'manage_commissions', name: 'Gerenciar comissões', description: 'Configurar e ajustar comissões' },
  { id: 'view_own_commissions', name: 'Ver próprias comissões', description: 'Acesso para visualizar apenas suas próprias comissões' },
  { id: 'view_all_goals', name: 'Ver todas as metas', description: 'Acesso para visualizar metas de todos os barbeiros' },
  { id: 'manage_goals', name: 'Gerenciar metas', description: 'Definir e ajustar metas' },
  { id: 'view_own_goals', name: 'Ver próprias metas', description: 'Acesso para visualizar apenas suas próprias metas' },
  { id: 'view_all_revenue', name: 'Ver faturamento completo', description: 'Acesso para visualizar todo o faturamento da barbearia' },
  { id: 'view_own_revenue', name: 'Ver próprio faturamento', description: 'Acesso para visualizar apenas sua contribuição no faturamento' },
  { id: 'manage_settings', name: 'Gerenciar configurações', description: 'Acesso para alterar configurações do sistema' },
  { id: 'manage_permissions', name: 'Gerenciar permissões', description: 'Acesso para configurar permissões de usuários' },
];

// Componente principal
const Permissions = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser, hasPermission } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'barber' as UserRole,
  });

  // Filtragem dos usuários
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Edição de usuário
  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
  };

  // Exclusão de usuário
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Você não pode excluir seu próprio usuário');
      return;
    }
    
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast.success('Usuário excluído com sucesso');
  };

  // Salvar edição de usuário
  const handleSaveUserEdit = (editedUser: UserType) => {
    setUsers(prev => prev.map(user => 
      user.id === editedUser.id ? editedUser : user
    ));
    setSelectedUser(null);
    toast.success('Permissões do usuário atualizadas com sucesso');
  };

  // Adicionar novo usuário
  const handleAddUser = () => {
    // Validação básica
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const newUserWithId = {
      ...newUser,
      id: `${users.length + 1}`,
      avatar: `https://randomuser.me/api/portraits/${newUser.role === 'receptionist' ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`,
    };

    setUsers(prev => [...prev, newUserWithId]);
    setIsAddDialogOpen(false);
    setNewUser({ name: '', email: '', role: 'barber' });
    toast.success('Usuário adicionado com sucesso');
  };

  // Verificar acesso
  if (!hasPermission('manage_permissions')) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Shield className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Acesso restrito</h2>
          <p className="text-gray-500 text-center max-w-md">
            Você não tem permissão para acessar o módulo de gerenciamento de permissões.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Gerenciamento de Permissões</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Preencha os campos abaixo para adicionar um novo usuário ao sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select 
                      value={newUser.role}
                      onValueChange={(value: UserRole) => setNewUser({...newUser, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="barber">Barbeiro</SelectItem>
                        <SelectItem value="receptionist">Recepcionista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddUser}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários e Permissões</CardTitle>
            <CardDescription>
              Gerencie os usuários e suas permissões de acesso ao sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-2 text-left font-medium text-xs uppercase tracking-wider">Usuário</th>
                    <th className="py-3 px-2 text-left font-medium text-xs uppercase tracking-wider">Email</th>
                    <th className="py-3 px-2 text-left font-medium text-xs uppercase tracking-wider">Função</th>
                    <th className="py-3 px-2 text-right font-medium text-xs uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                            <img 
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} 
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-600">{user.email}</td>
                      <td className="py-3 px-2">
                        <Badge 
                          className={
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                              : user.role === 'barber'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }
                        >
                          {user.role === 'admin' 
                            ? 'Administrador' 
                            : user.role === 'barber' 
                              ? 'Barbeiro' 
                              : 'Recepcionista'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-2">Editar</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-2">Excluir</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        <User className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog para editar permissões */}
        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>Editar Permissões</span>
                  <Badge 
                    className={
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 ml-2' 
                        : selectedUser.role === 'barber'
                          ? 'bg-blue-100 text-blue-800 ml-2'
                          : 'bg-green-100 text-green-800 ml-2'
                    }
                  >
                    {selectedUser.role === 'admin' 
                      ? 'Administrador' 
                      : selectedUser.role === 'barber' 
                        ? 'Barbeiro' 
                        : 'Recepcionista'}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                      <img 
                        src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}`} 
                        alt={selectedUser.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{selectedUser.name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="mb-4">
                  <Label htmlFor="role">Função</Label>
                  <Select 
                    value={selectedUser.role}
                    onValueChange={(value: UserRole) => setSelectedUser({...selectedUser, role: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="barber">Barbeiro</SelectItem>
                      <SelectItem value="receptionist">Recepcionista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-4">Permissões disponíveis</h3>
                  <div className="mt-2 space-y-4">
                    {allPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3 py-2">
                        <Checkbox 
                          id={`perm-${permission.id}`}
                          // Desabilitar checkbox se for admin (admin tem todas as permissões)
                          disabled={selectedUser.role === 'admin'}
                          // Checked se for admin ou se a permissão estiver na lista de permissões do papel
                          checked={selectedUser.role === 'admin' || true}
                        />
                        <div className="space-y-1">
                          <Label 
                            htmlFor={`perm-${permission.id}`}
                            className="font-medium"
                          >
                            {permission.name}
                          </Label>
                          <p className="text-sm text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancelar</Button>
                <Button onClick={() => handleSaveUserEdit(selectedUser)}>Salvar Alterações</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default Permissions;
