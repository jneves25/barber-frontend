
import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useToast } from '@/hooks/use-toast';

// Mock data for products
const mockProducts = [
  {
    id: '1',
    name: 'Pomada Modeladora',
    description: 'Pomada modeladora para cabelo com fixação forte',
    price: 45.90,
    image: 'https://images.unsplash.com/photo-1581075487814-fbcaa48eb06b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 24
  },
  {
    id: '2',
    name: 'Shampoo Anti-queda',
    description: 'Shampoo especial para combater a queda de cabelo',
    price: 38.50,
    image: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 18
  },
  {
    id: '3',
    name: 'Óleo para Barba',
    description: 'Óleo hidratante para barba com aroma de madeira',
    price: 29.90,
    image: 'https://images.unsplash.com/photo-1533484211272-98ffdb2a0cc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 32
  },
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    stock: 0
  });
  const { toast } = useToast();

  const handleAddProduct = () => {
    const id = Math.random().toString(36).substring(2, 9);
    const productToAdd = { ...newProduct, id };
    setProducts([...products, productToAdd]);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      image: '',
      stock: 0
    });
    setIsAddDialogOpen(false);
    toast({
      title: "Produto adicionado",
      description: `${productToAdd.name} foi adicionado com sucesso.`,
    });
  };

  const handleEditProduct = () => {
    if (selectedProduct) {
      const updatedProducts = products.map(p => 
        p.id === selectedProduct.id ? selectedProduct : p
      );
      setProducts(updatedProducts);
      setSelectedProduct(null);
      setIsAddDialogOpen(false);
      toast({
        title: "Produto atualizado",
        description: `${selectedProduct.name} foi atualizado com sucesso.`,
      });
    }
  };

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Produto removido",
        description: `O produto foi removido com sucesso.`,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsAddDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Produtos</h1>
        <Button 
          onClick={() => {
            setSelectedProduct(null);
            setNewProduct({
              name: '',
              description: '',
              price: 0,
              image: '',
              stock: 0
            });
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Produtos Disponíveis</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Sem imagem</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                  <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock} unid.</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openDeleteDialog(product)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Visualização do Cliente</h2>
        <p className="text-gray-600 mb-4">
          Esta é uma prévia de como os produtos serão exibidos para os clientes na vitrine.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              image={product.image}
              viewOnly
            />
          ))}
        </div>
      </div>

      {/* Dialog para adicionar/editar produto */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? `Editar ${selectedProduct.name}` : 'Adicionar Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes do produto abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={selectedProduct ? selectedProduct.name : newProduct.name}
                onChange={(e) => selectedProduct 
                  ? setSelectedProduct({...selectedProduct, name: e.target.value})
                  : setNewProduct({...newProduct, name: e.target.value})
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={selectedProduct ? selectedProduct.description : newProduct.description}
                onChange={(e) => selectedProduct 
                  ? setSelectedProduct({...selectedProduct, description: e.target.value})
                  : setNewProduct({...newProduct, description: e.target.value})
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={selectedProduct ? selectedProduct.price : newProduct.price}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    selectedProduct 
                      ? setSelectedProduct({...selectedProduct, price: value || 0})
                      : setNewProduct({...newProduct, price: value || 0});
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={selectedProduct ? selectedProduct.stock : newProduct.stock}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    selectedProduct 
                      ? setSelectedProduct({...selectedProduct, stock: value || 0})
                      : setNewProduct({...newProduct, stock: value || 0});
                  }}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                value={selectedProduct ? (selectedProduct.image || '') : (newProduct.image || '')}
                onChange={(e) => selectedProduct 
                  ? setSelectedProduct({...selectedProduct, image: e.target.value})
                  : setNewProduct({...newProduct, image: e.target.value})
                }
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={selectedProduct ? handleEditProduct : handleAddProduct}>
              {selectedProduct ? 'Salvar Alterações' : 'Adicionar Produto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o produto "{selectedProduct?.name}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Products;
