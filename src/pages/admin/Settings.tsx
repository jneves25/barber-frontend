
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Clock, User, DollarSign, Store, Calendar } from 'lucide-react';

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Configurações</h1>
          <button className="bg-barber-500 text-white px-4 py-2 rounded-md">
            Salvar Alterações
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-4">
              <Store className="h-6 w-6 text-barber-500" />
              <div>
                <CardTitle>Dados da Barbearia</CardTitle>
                <CardDescription>Informações gerais do estabelecimento</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Barbearia</label>
                  <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="BarberShop" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Endereço</label>
                  <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="Rua da Barbearia, 123" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="(11) 99999-9999" />
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
              <Clock className="h-6 w-6 text-barber-500" />
              <div>
                <CardTitle>Horário de Funcionamento</CardTitle>
                <CardDescription>Configure os dias e horários de atendimento</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Segunda a Sexta</label>
                    <div className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm">Aberto</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <input type="time" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="09:00" />
                    <span className="flex items-center">-</span>
                    <input type="time" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="19:00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Sábado</label>
                    <div className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm">Aberto</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <input type="time" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="09:00" />
                    <span className="flex items-center">-</span>
                    <input type="time" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="18:00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Domingo</label>
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Aberto</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <input type="time" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="10:00" disabled />
                    <span className="flex items-center">-</span>
                    <input type="time" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="16:00" disabled />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-4">
              <Calendar className="h-6 w-6 text-barber-500" />
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
                <div className="flex items-center space-x-2 mt-4">
                  <input type="checkbox" id="notification" defaultChecked />
                  <label htmlFor="notification" className="text-sm">Enviar lembretes por WhatsApp</label>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-4">
              <DollarSign className="h-6 w-6 text-barber-500" />
              <div>
                <CardTitle>Configurações Financeiras</CardTitle>
                <CardDescription>Ajustes para pagamentos e comissões</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Formas de Pagamento Aceitas</label>
                  <div className="space-y-2">
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
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
