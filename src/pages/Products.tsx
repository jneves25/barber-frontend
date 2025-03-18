
import React, { useState } from 'react';
import ClientLayout from '@/components/layout/ClientLayout';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Mock data - in a real app, this would come from an API
// Updated to include stock property
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

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user, hasPermission } = useAuth();
  
  // Determinar se o usuário pode ver o estoque
  const canViewStock = user && (user.role === 'admin' || hasPermission('manage_products'));
  
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ClientLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Produtos da Barbearia</h1>
        
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Buscar produtos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                image={product.image}
                stock={product.stock}
                viewOnly={!canViewStock}
              />
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default ProductsPage;
