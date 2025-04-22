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
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (barber) {
			setValue(barber.commissionValue.toString());
		}
		setError(null);
	}, [barber, isOpen]);

	const handleSave = () => {
		if (barber && value) {
			const numericValue = parseFloat(value);

			if (numericValue < 0 || numericValue > 100) {
				setError('Porcentagem deve estar entre 0 e 100');
				return;
			}

			onSave(barber.id, numericValue, CommissionModeEnum.DIVERSE);
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Configurar Comissão Geral</DialogTitle>
					<DialogDescription>
						Defina a porcentagem da comissão para {barber?.user.name}
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
						<Label htmlFor="value" className="text-right">
							Porcentagem
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
								placeholder="0"
								step="1"
								min={0}
								max={100}
							/>
							<span className="absolute right-3 top-2 text-gray-500">
								%
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
