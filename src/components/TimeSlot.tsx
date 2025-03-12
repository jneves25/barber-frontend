
import React from 'react';
import { cn } from '@/lib/utils';

interface TimeSlotProps {
  time: string;
  available: boolean;
  selected?: boolean;
  onClick?: () => void;
}

const TimeSlot = ({ time, available, selected = false, onClick }: TimeSlotProps) => {
  return (
    <button 
      className={cn(
        "h-10 w-full rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-barber-500 focus:ring-offset-2",
        selected 
          ? "bg-barber-500 text-white hover:bg-barber-600" 
          : available 
            ? "bg-white border border-gray-200 text-gray-700 hover:bg-barber-50" 
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
      )}
      onClick={available ? onClick : undefined}
      disabled={!available}
    >
      {time}
    </button>
  );
};

export default TimeSlot;
