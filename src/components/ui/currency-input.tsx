import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { currencyToNumber, handleCurrencyInputChange } from '@/utils/currency';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
	value: number;
	onChange: (value: number) => void;
	label?: string;
	prefixSymbol?: string;
	disabled?: boolean;
	error?: string;
}

/**
 * A reusable currency input component with built-in formatting
 */
export function CurrencyInput({
	value,
	onChange,
	prefixSymbol = 'R$',
	disabled = false,
	className = '',
	error,
	...props
}: CurrencyInputProps) {
	// Format the initial value
	const [displayValue, setDisplayValue] = useState(() => {
		return value.toLocaleString('pt-BR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	});

	// Update display value when the actual value changes externally
	useEffect(() => {
		setDisplayValue(value.toLocaleString('pt-BR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}));
	}, [value]);

	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleCurrencyInputChange(e, (value) => {
			onChange(value);
		});

		// Atualiza o valor mostrado
		setDisplayValue(e.target.value);
	};

	return (
		<div className="relative">
			{prefixSymbol && (
				<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
					{prefixSymbol}
				</div>
			)}
			<Input
				type="text"
				inputMode="numeric"
				value={displayValue}
				onChange={handleInputChange}
				className={`${prefixSymbol ? 'pl-8' : ''} ${error ? 'border-red-500' : ''} ${className}`}
				disabled={disabled}
				{...props}
			/>
			{error && <p className="text-xs text-red-500 mt-1">{error}</p>}
		</div>
	);
}

export default CurrencyInput; 