
import React from 'react';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export interface ServiceProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  onClick?: () => void;
  selected?: boolean;
  isLoading?: boolean;
}

const ServiceCard = ({ 
  name, 
  description, 
  price, 
  duration, 
  image, 
  onClick,
  selected = false,
  isLoading = false
}: ServiceProps) => {
  if (isLoading) {
    return (
      <Card className={`cursor-pointer transition-all hover:shadow-md ${selected ? 'ring-2 ring-barber-400' : ''}`}>
        <CardContent className="pt-6">
          <Skeleton className="mb-4 h-40 w-full rounded-md" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${selected ? 'ring-2 ring-barber-400' : ''}`} 
      onClick={onClick}
    >
      <CardContent className="pt-6">
        {image && (
          <div className="mb-4 h-40 overflow-hidden rounded-md">
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <p className="text-gray-600 mt-1 text-sm line-clamp-2">{description}</p>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center text-barber-500">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">{duration} min</span>
          </div>
          <span className="font-bold text-barber-500">R$ {price.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
