
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock?: number;
  viewOnly?: boolean;
  onClick?: () => void;
  onAddToOrder?: () => void;
}

export const ProductCard = ({
  name,
  description,
  price,
  image,
  viewOnly = false,
  onAddToOrder
}: ProductCardProps) => {
  const { toast } = useToast();

  const handleAddToOrder = () => {
    if (onAddToOrder) {
      onAddToOrder();
    } else {
      // Demo functionality when no callback is provided
      toast({
        title: "Produto adicionado",
        description: `${name} foi adicionado à comanda.`,
      });
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="h-48 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Sem imagem</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-barber-500">R$ {price.toFixed(2)}</span>
          {!viewOnly && (
            <Button size="sm" onClick={handleAddToOrder}>
              <ShoppingCart className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          )}
          {viewOnly && (
            <Button size="sm" variant="outline">
              <Eye className="mr-1 h-4 w-4" />
              Visualizar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
