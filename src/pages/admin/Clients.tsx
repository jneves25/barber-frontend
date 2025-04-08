
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Phone, Mail, User, Edit, Trash2, Loader2 } from 'lucide-react';
import ClientService, { Client, ClientRegisterRequest } from '@/services/api/ClientService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const AdminClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  // Add state for client form and modal
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<ClientRegisterRequest>({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await ClientService.getAll();
      if (response.success && response.data) {
        setClients(response.data);
      } else {
        toast.error(response.error || 'Erro ao carregar clientes');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side filter - could be replaced with a server-side search in a real app
    if (!searchTerm) {
      fetchClients();
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setIsDeleting(id);
      try {
        const response = await ClientService.deletePersonalAccount(id);
        if (response.success) {
          toast.success('Cliente excluído com sucesso');
          fetchClients();
        } else {
          toast.error(response.error || 'Erro ao excluir cliente');
        }
      } catch (error) {
        toast.error('Erro ao conectar com o servidor');
        console.error(error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Function to create a new client
  const handleAddClient = async () => {
    setIsSubmitting(true);
    try {
      // Validate client data on client-side before sending request
      if (!newClient.name || !newClient.email || !newClient.phone || !newClient.password) {
        toast.error('Preencha todos os campos obrigatórios');
        setIsSubmitting(false);
        return;
      }

      // Backend already has validation methods too
      const response = await ClientService.createClient(newClient);
      
      if (response.success && response.data) {
        setClients([...clients, response.data]);
        setNewClient({
          name: '',
          email: '',
          phone: '',
          password: ''
        });
        setIsAddDialogOpen(false);
        toast.success(`${response.data.name} foi adicionado com sucesso.`);
      } else {
        toast.error(response.error || 'Erro ao adicionar cliente');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to edit a client
  const handleEditClient = async () => {
    if (!selectedClient || !selectedClient.id) return;
    
    setIsSubmitting(true);
    try {
      const response = await ClientService.updatePersonalInfo(selectedClient.id, selectedClient);
      
      if (response.success && response.data) {
        const updatedClients = clients.map(c => 
          c.id === selectedClient.id ? response.data! : c
        );
        setClients(updatedClients);
        setSelectedClient(null);
        setIsEditDialogOpen(false);
        toast.success(`${response.data.name} foi atualizado com sucesso.`);
      } else {
        toast.error(response.error || 'Erro ao atualizar cliente');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setIsEditDialogOpen(true);
  };

  const filteredClients = searchTerm 
    ? clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : clients;

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <button 
            className="bg-barber-500 text-white px-4 py-2 rounded-md w-full sm:w-auto"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Novo Cliente
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="search"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-barber-500"
            />
          </div>
          <Button type="submit" variant="outline" className="w-full sm:w-auto">
            Buscar
          </Button>
        </form>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Gerencie todos os clientes da barbearia.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-barber-500" />
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                        <th className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                          <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            </td>
                            <td className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{client.phone}</div>
                            </td>
                            <td className="hidden md:table-cell px-3 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{client.email}</div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button 
                                  className="p-1 text-blue-500 hover:text-blue-700 transition-colors" 
                                  title="Editar"
                                  onClick={() => openEditDialog(client)}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors" 
                                  title="Excluir" 
                                  onClick={() => handleDeleteClient(client.id!)}
                                  disabled={isDeleting === client.id}
                                >
                                  {isDeleting === client.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                                <a 
                                  href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1 text-green-500 hover:text-green-700" 
                                  title="WhatsApp"
                                >
                                  <Phone className="h-4 w-4" />
                                </a>
                                <a 
                                  href={`mailto:${client.email}`}
                                  className="p-1 text-gray-500 hover:text-gray-700" 
                                  title="Email"
                                >
                                  <Mail className="h-4 w-4" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-3 py-8 text-center text-sm text-gray-500">
                            {searchTerm ? 'Nenhum cliente encontrado com este termo de busca.' : 'Nenhum cliente cadastrado.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">
                Clientes cadastrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">
                Clientes com cadastro ativo
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Dados insuficientes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do cliente abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                placeholder="+55 (00) 00000-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newClient.password}
                onChange={(e) => setNewClient({...newClient, password: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleAddClient} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : 'Adicionar Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do cliente abaixo.
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={selectedClient.name}
                  onChange={(e) => setSelectedClient({...selectedClient, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedClient.email}
                  onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={selectedClient.phone}
                  onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})}
                  placeholder="+55 (00) 00000-0000"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditClient} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminClients;
