
import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Clock, User, DollarSign, Store, Calendar, Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

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

  const handleOpeningHoursChange = (index: number, field: 'isOpen' | 'openTime' | 'closeTime', value: any) => {
    const updatedHours = [...openingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value
    };
    setOpeningHours(updatedHours);
  };

  const handleSaveSettings = () => {
    toast.success('Configurações salvas com sucesso!');
  };

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
                  <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="BarberShop" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Endereço</label>
                  <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="Rua da Barbearia, 123" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefone</label>
                    <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="(11) 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">WhatsApp</label>
                    <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="(11) 99999-9999" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <input type="email" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="contato@barbershop.com" />
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
                      <input 
                        type="time" 
                        className={`w-full rounded-md border border-gray-300 px-3 py-2 ${!day.isOpen ? 'opacity-50' : ''}`}
                        value={day.openTime}
                        onChange={(e) => handleOpeningHoursChange(index, 'openTime', e.target.value)}
                        disabled={!day.isOpen}
                      />
                      <span className="flex items-center text-gray-500">até</span>
                      <input 
                        type="time" 
                        className={`w-full rounded-md border border-gray-300 px-3 py-2 ${!day.isOpen ? 'opacity-50' : ''}`}
                        value={day.closeTime}
                        onChange={(e) => handleOpeningHoursChange(index, 'closeTime', e.target.value)}
                        disabled={!day.isOpen}
                      />
                    </div>
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
                  <select className="w-full rounded-md border border-gray-300 px-3 py-2">
                    <option value="15">15 minutos</option>
                    <option value="30" selected>30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dias de Antecedência para Agendamento</label>
                  <input type="number" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tempo de Preparação entre Serviços (minutos)</label>
                  <input type="number" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="5" />
                </div>
                <div className="space-y-4 mt-4">
                  <h3 className="text-sm font-medium">Notificações</h3>
                  <div className="flex justify-between items-center">
                    <label className="text-sm">Enviar lembretes por WhatsApp</label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm">Confirmar agendamentos por WhatsApp</label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm">Avisar barbeiro sobre novos agendamentos</label>
                    <Switch defaultChecked />
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
                      <input type="checkbox" id="credit" defaultChecked />
                      <label htmlFor="credit" className="text-sm">Cartão de Crédito</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="debit" defaultChecked />
                      <label htmlFor="debit" className="text-sm">Cartão de Débito</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="cash" defaultChecked />
                      <label htmlFor="cash" className="text-sm">Dinheiro</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="pix" defaultChecked />
                      <label htmlFor="pix" className="text-sm">PIX</label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Porcentagem Padrão de Comissão (%)</label>
                  <input type="number" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="40" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Frequência de Pagamento de Comissões</label>
                  <select className="w-full rounded-md border border-gray-300 px-3 py-2">
                    <option>Diária</option>
                    <option>Semanal</option>
                    <option selected>Quinzenal</option>
                    <option>Mensal</option>
                  </select>
                </div>
                <div className="space-y-4 mt-4">
                  <h3 className="text-sm font-medium">Opções de Pagamento</h3>
                  <div className="flex justify-between items-center">
                    <label className="text-sm">Permitir pagamento antecipado online</label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm">Exigir depósito para confirmação</label>
                    <Switch />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm">Aplicar desconto para pagamento à vista</label>
                    <Switch />
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
