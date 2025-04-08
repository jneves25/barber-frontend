
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ShoppingCart, Package, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ServiceProductService, { Product } from '@/services/api/ServiceProductService';

interface OrderItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderManagerProps {
  clientName?: string;
  appointmentId?: string;
}

const OrderManager = ({ clientName = 'Cliente' }: OrderManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load products when the order dialog is opened
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Using company ID 1 for demonstration - in a real app, this would come from a context or prop
      const companyId = 1;
      const response = await ServiceProductService.getAllProducts(companyId);
      
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        toast({
          title: "Erro",
          description: response.error || "Não foi possível carregar os produtos"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os produtos"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOrder = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleAddToOrder = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsAddProductOpen(true);
  };

  const confirmAddToOrder = () => {
    if (!selectedProduct) return;
    
    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setOrderItems(updatedItems);
    } else {
      const newItem: OrderItem = {
        id: Math.random().toString(36).substring(2, 9),
        productId: selectedProduct.id!,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: quantity
      };
      setOrderItems([...orderItems, newItem]);
    }
    
    setIsAddProductOpen(false);
    setSelectedProduct(null);
    toast({
      title: "Produto adicionado",
      description: `${selectedProduct.name} foi adicionado à comanda.`
    });
  };

  const removeFromOrder = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
    toast({
      title: "Produto removido",
      description: "O produto foi removido da comanda."
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(value > 0 ? value : 1);
  };

  const handleFinishOrder = () => {
    toast({
      title: "Comanda finalizada",
      description: `Comanda de ${clientName} finalizada no valor de R$ ${totalOrder.toFixed(2)}.`
    });
    setOrderItems([]);
    setIsOpen(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Comanda ({orderItems.length})
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Comanda de {clientName}</SheetTitle>
            <SheetDescription>
              Adicione produtos à comanda do cliente.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <div className="flex justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddProductOpen(true)}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
            </div>
            
            {orderItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">
                  Nenhum produto na comanda.
                </p>
              </div>
            ) : (
              <>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromOrder(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>R$ {totalOrder.toFixed(2)}</span>
                  </div>
                  
                  <Button className="w-full" onClick={handleFinishOrder}>
                    Finalizar Comanda
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <Label htmlFor="search-products">Buscar produtos</Label>
              <Input
                id="search-products"
                placeholder="Nome do produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow 
                        key={product.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleAddToOrder(product)}
                      >
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">
                          R$ {product.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isAddProductOpen && selectedProduct !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddProductOpen(false);
            setSelectedProduct(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {selectedProduct && (
              <div className="flex items-center gap-4 mb-4">
                {selectedProduct.imageUrl && (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-gray-500 text-sm">{selectedProduct.description}</p>
                  <p className="font-bold mt-1">R$ {selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>
            
            <div className="font-semibold flex justify-between">
              <span>Total:</span>
              <span>
                R$ {selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmAddToOrder}>
              Adicionar à Comanda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderManager;
