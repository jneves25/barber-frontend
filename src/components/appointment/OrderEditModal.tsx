
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Minus, X, Check, DollarSign, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// Tipos de dados
interface Service {
  id: number;
  name: string;
  price: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  type: 'service' | 'product';
}

interface Appointment {
  id: number;
  clientName: string;
  service: string;
  price: number;
  barber: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'open';
  orderItems?: OrderItem[];
}

interface OrderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSave: (appointment: Appointment, items: OrderItem[]) => void;
}

const MOCK_SERVICES: Service[] = [
  { id: 1, name: 'Corte de Cabelo', price: 50 },
  { id: 2, name: 'Barba', price: 35 },
  { id: 3, name: 'Combo Completo', price: 80 },
  { id: 4, name: 'Corte Degradê', price: 60 },
  { id: 5, name: 'Hidratação', price: 45 },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Pomada Modeladora', price: 39.90 },
  { id: 2, name: 'Cera para Barba', price: 29.90 },
  { id: 3, name: 'Shampoo Anticaspa', price: 35.90 },
  { id: 4, name: 'Condicionador', price: 31.90 },
  { id: 5, name: 'Kit Completo', price: 129.90 },
];

export const OrderEditModal: React.FC<OrderEditModalProps> = ({ isOpen, onClose, appointment, onSave }) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showServiceList, setShowServiceList] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const { hasPermission } = useAuth();

  // Inicializar os itens do pedido quando o modal é aberto
  useEffect(() => {
    if (appointment && appointment.orderItems) {
      setOrderItems(appointment.orderItems);
    } else if (appointment) {
      // Se não tiver itens, adicionar o serviço principal como primeiro item
      setOrderItems([
        { 
          id: Date.now(), 
          name: appointment.service, 
          price: appointment.price, 
          quantity: 1, 
          type: 'service' 
        }
      ]);
    } else {
      setOrderItems([]);
    }
  }, [appointment]);

  // Verificar se o pedido pode ser editado
  const canEditOrder = (): boolean => {
    if (!appointment) return false;
    
    // Se estiver completado, só pode editar com permissão especial
    if (appointment.status === 'completed') {
      return hasPermission('manage_appointments');
    }
    
    // Se estiver aberto, qualquer um com acesso ao modal pode editar
    return appointment.status === 'open';
  };

  const addService = (service: Service) => {
    // Verificar se o serviço já existe no pedido
    const existingItem = orderItems.find(
      item => item.type === 'service' && item.name === service.name
    );

    if (existingItem) {
      // Incrementar a quantidade se já existir
      setOrderItems(orderItems.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Adicionar novo item ao pedido
      setOrderItems([
        ...orderItems, 
        { 
          id: Date.now(), 
          name: service.name, 
          price: service.price, 
          quantity: 1, 
          type: 'service' 
        }
      ]);
    }
    
    setShowServiceList(false);
  };

  const addProduct = (product: Product) => {
    // Verificar se o produto já existe no pedido
    const existingItem = orderItems.find(
      item => item.type === 'product' && item.name === product.name
    );

    if (existingItem) {
      // Incrementar a quantidade se já existir
      setOrderItems(orderItems.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Adicionar novo item ao pedido
      setOrderItems([
        ...orderItems, 
        { 
          id: Date.now(), 
          name: product.name, 
          price: product.price, 
          quantity: 1, 
          type: 'product' 
        }
      ]);
    }
    
    setShowProductList(false);
  };

  const removeItem = (itemId: number) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: number, delta: number) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const calculateTotal = (): number => {
    return orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const handleSave = () => {
    if (!appointment) return;
    
    onSave(appointment, orderItems);
    toast.success('Comanda atualizada com sucesso!');
    onClose();
  };

  // Se não tiver appointment ou não puder editar, não mostra o modal
  if (!appointment || (!canEditOrder() && !hasPermission('manage_appointments'))) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Comanda de {appointment.clientName} 
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({appointment.time} - {appointment.barber})
            </span>
          </DialogTitle>
          <DialogDescription>
            {canEditOrder() 
              ? 'Adicione ou remova serviços e produtos da comanda.'
              : 'Visualizando detalhes da comanda finalizada.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Itens da Comanda</h3>
              <div className="flex space-x-2">
                {canEditOrder() && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center" 
                      onClick={() => setShowServiceList(!showServiceList)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Serviço
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center" 
                      onClick={() => setShowProductList(!showProductList)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Produto
                    </Button>
                  </>
                )}
              </div>
            </div>

            {showServiceList && (
              <div className="border rounded-md p-3 bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Selecione um serviço:</h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {MOCK_SERVICES.map(service => (
                    <button
                      key={service.id}
                      className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md text-left"
                      onClick={() => addService(service)}
                    >
                      <span>{service.name}</span>
                      <span className="text-gray-600">R$ {service.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showProductList && (
              <div className="border rounded-md p-3 bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Selecione um produto:</h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {MOCK_PRODUCTS.map(product => (
                    <button
                      key={product.id}
                      className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md text-left"
                      onClick={() => addProduct(product)}
                    >
                      <span>{product.name}</span>
                      <span className="text-gray-600">R$ {product.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border rounded-md">
              {orderItems.length > 0 ? (
                <div className="divide-y">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            item.type === 'service' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.type === 'service' ? 'Serviço' : 'Produto'} - R$ {item.price.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {canEditOrder() && (
                          <button 
                            onClick={() => updateItemQuantity(item.id, -1)}
                            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                        
                        <span className="w-6 text-center">{item.quantity}</span>
                        
                        {canEditOrder() && (
                          <>
                            <button 
                              onClick={() => updateItemQuantity(item.id, 1)}
                              className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Nenhum item na comanda
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
            <div className="font-medium">Valor Total:</div>
            <div className="font-bold text-lg">R$ {calculateTotal().toFixed(2)}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {canEditOrder() && (
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              {appointment.status === 'open' ? 'Salvar Comanda' : 'Finalizar Atendimento'}
            </Button>
          )}
          {appointment.status === 'completed' && hasPermission('manage_appointments') && (
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Atualizar Comanda
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditModal;
