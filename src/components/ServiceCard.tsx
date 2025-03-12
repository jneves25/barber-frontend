
import React from 'react';
import { Clock } from 'lucide-react';

export interface ServiceProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  onClick?: () => void;
  selected?: boolean;
}

const ServiceCard = ({ 
  name, 
  description, 
  price, 
  duration, 
  image, 
  onClick,
  selected = false
}: ServiceProps) => {
  return (
    <div 
      className={`service-card ${selected ? 'ring-2 ring-barber-400' : ''}`} 
      onClick={onClick}
    >
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
    </div>
  );
};

export default ServiceCard;
