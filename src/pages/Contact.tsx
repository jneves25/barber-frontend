
import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import ClientLayout from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem enviada",
      description: "Entraremos em contato em breve!",
    });
  };
  
  return (
    <ClientLayout>
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Entre em contato</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos aqui para ajudar com qualquer dúvida sobre nossa plataforma para barbearias.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" placeholder="Seu nome completo" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="seu@email.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" placeholder="(00) 00000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Assunto</Label>
                        <Input id="subject" placeholder="Qual o motivo do contato?" required />
                      </div>
                    </div>
                    <div className="space-y-2 mb-6">
                      <Label htmlFor="message">Mensagem</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Como podemos ajudar você?" 
                        rows={5}
                        required 
                      />
                    </div>
                    <Button type="submit" className="w-full md:w-auto">Enviar mensagem</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="bg-barber-50 border-none mb-6">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Informações de contato</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-barber-500 mt-1 mr-3" />
                      <div>
                        <p className="font-medium">Endereço</p>
                        <p className="text-gray-600">Av. Paulista, 1000, São Paulo - SP</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-barber-500 mt-1 mr-3" />
                      <div>
                        <p className="font-medium">Telefone</p>
                        <p className="text-gray-600">(11) 3000-0000</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-barber-500 mt-1 mr-3" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">contato@barbershop.com</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Horário de atendimento</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Segunda a Sexta</span>
                      <span>9h às 18h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado</span>
                      <span>9h às 13h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo</span>
                      <span>Fechado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Contact;
