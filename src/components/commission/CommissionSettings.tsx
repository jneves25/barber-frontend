
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CommissionSettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  barber: {
    id: number;
    barber: string;
    percentage: number;
  } | null;
  onSave: (barberId: number, percentage: number) => void;
}

const CommissionSettings = ({ isOpen, onOpenChange, barber, onSave }: CommissionSettingsProps) => {
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    if (barber) {
      setPercentage(barber.percentage);
    }
  }, [barber]);

  const handleSave = () => {
    if (barber) {
      onSave(barber.id, percentage);
      onOpenChange(false);
    }
  };

  if (!barber) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Comissão Geral</DialogTitle>
          <DialogDescription>
            Defina a porcentagem de comissão geral para {barber.barber}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="percentage" className="text-right">
              Porcentagem
            </Label>
            <div className="col-span-3 flex items-center">
              <Input
                id="percentage"
                type="number"
                min={0}
                max={100}
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full"
              />
              <span className="ml-2">%</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommissionSettings;
