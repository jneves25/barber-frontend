
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Goal } from '@/services/api/GoalService';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '@/services/api/UserService';
import { useEffect } from 'react';

const MONTHS = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() + i - 1;
  return { value: year.toString(), label: year.toString() };
});

interface GoalFormProps {
  initialData?: Goal;
  onSubmit: (data: Partial<Goal>) => Promise<void>;
  onCancel: () => void;
}

interface User {
  id: number;
  name: string;
}

const GoalForm: React.FC<GoalFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { companySelected } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<Partial<Goal>>({
    userId: initialData?.userId || 0,
    companyId: companySelected?.id || 0,
    month: initialData?.month || new Date().getMonth() + 1,
    year: initialData?.year || new Date().getFullYear(),
    target: initialData?.target || 0,
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await UserService.getUsersByCompany(companySelected?.id || 0);
        if (response.success && response.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, [companySelected?.id]);

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user">Profissional</Label>
        <Select
          value={formData.userId?.toString()}
          onValueChange={(value) => handleChange('userId', parseInt(value))}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o profissional" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">Mês</Label>
          <Select
            value={formData.month?.toString()}
            onValueChange={(value) => handleChange('month', parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Ano</Label>
          <Select
            value={formData.year?.toString()}
            onValueChange={(value) => handleChange('year', parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target">Meta (R$)</Label>
        <Input
          id="target"
          type="number"
          value={formData.target || ''}
          onChange={(e) => handleChange('target', parseFloat(e.target.value))}
          placeholder="Valor da meta em R$"
          min="0"
          step="0.01"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : (initialData ? 'Atualizar' : 'Criar')}
        </Button>
      </div>
    </form>
  );
};

export default GoalForm;
