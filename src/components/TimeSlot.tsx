
import React from 'react';

interface TimeSlotProps {
  time: string;
  available: boolean;
  selected?: boolean;
  onClick?: () => void;
}

const TimeSlot = ({ time, available, selected = false, onClick }: TimeSlotProps) => {
  const className = `time-slot ${selected ? 'active' : ''} ${!available ? 'disabled' : ''}`;
  
  return (
    <button 
      className={className}
      onClick={available ? onClick : undefined}
      disabled={!available}
    >
      {time}
    </button>
  );
};

export default TimeSlot;
