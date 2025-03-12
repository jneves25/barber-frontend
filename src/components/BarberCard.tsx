
import React from 'react';
import { Star } from 'lucide-react';

export interface BarberProps {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  image?: string;
  onClick?: () => void;
  selected?: boolean;
}

const BarberCard = ({ 
  name, 
  specialty, 
  rating, 
  image, 
  onClick,
  selected = false
}: BarberProps) => {
  return (
    <div 
      className={`barber-card ${selected ? 'ring-2 ring-barber-400' : ''}`} 
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="mr-4">
          <img 
            src={image || "https://randomuser.me/api/portraits/men/32.jpg"} 
            alt={name} 
            className="w-16 h-16 rounded-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-gray-600 text-sm">{specialty}</p>
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
              />
            ))}
            <span className="text-sm ml-1 text-gray-600">({rating.toFixed(1)})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberCard;
