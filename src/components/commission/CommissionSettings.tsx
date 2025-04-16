
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommissionConfig, CommissionModeEnum } from '@/services/api/CommissionService';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CommissionSettingsProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	barber: CommissionConfig | null;
	onSave: (barberId: number, value: number, mode: CommissionModeEnum) => void;
}

const CommissionSettings = ({ isOpen, onOpenChange, barber, onSave }: CommissionSettingsProps) => {
	const [value, setValue] = useState<string>('');
	const [selectedType, setSelectedType] = useState<'R$' | '%'>('%');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (barber) {
			setValue(barber.commissionValue.toString());
			setSelectedType(barber.commissionMode === CommissionModeEnum.FIXED ? 'R$' : '%');
		}
		setError(null);
	}, [barber, isOpen]);

	const handleSave = () => {
		if (barber && value) {
			const numericValue = parseFloat(value);
			const mode = selectedType === 'R$' ? CommissionModeEnum.FIXED : CommissionModeEnum.PERCENTAGE;

			if (selectedType === '%' && (numericValue < 0 || numericValue > 100)) {
				setError('Porcentagem deve estar entre 0 e 100');
				return;
			}
			if (selectedType === 'R$' && numericValue < 0) {
				setError('Valor não pode ser negativo');
				return;
			}

			onSave(barber.id, numericValue, mode);
			onOpenChange(false);
		}
	};

	const handleTypeChange = (newType: 'R$' | '%') => {
		setSelectedType(newType);
		setValue('');
		setError(null);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Configurar Comissão Geral</DialogTitle>
					<DialogDescription>
						Defina o tipo e valor da comissão para {barber?.user.name}
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant="destructive" className="mb-4">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="type" className="text-right">
							Tipo
						</Label>
						<Select
							value={selectedType}
							onValueChange={(value: 'R$' | '%') => handleTypeChange(value)}
						>
							<SelectTrigger className="col-span-3">
								<SelectValue placeholder="Selecione o tipo" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="R$">Valor Fixo (R$)</SelectItem>
								<SelectItem value="%">Porcentagem (%)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="value" className="text-right">
							Valor
						</Label>
						<div className="col-span-3 relative">
							<Input
								id="value"
								type="number"
								value={value}
								onChange={(e) => {
									setValue(e.target.value);
									setError(null);
								}}
								className="pr-8"
								placeholder={selectedType === 'R$' ? "0.00" : "0"}
								step={selectedType === 'R$' ? "0.01" : "1"}
								min={0}
								max={selectedType === '%' ? 100 : undefined}
							/>
							<span className="absolute right-3 top-2 text-gray-500">
								{selectedType}
							</span>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button onClick={handleSave} className="bg-barber-500 hover:bg-barber-600">
						Salvar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CommissionSettings;
