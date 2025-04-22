import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { applyCurrencyMask, currencyToNumber } from '@/utils/currency';

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
		// Convert value to cents (integer)
		const cents = Math.round(value * 100);
		return applyCurrencyMask(cents.toString());
	});

	// Update display value when the actual value changes externally
	useEffect(() => {
		// Convert value to cents (integer)
		const cents = Math.round(value * 100);
		setDisplayValue(applyCurrencyMask(cents.toString()));
	}, [value]);

	// Handle input change
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;

		// Remove non-numeric characters
		const numericValue = inputValue.replace(/\D/g, '');

		// Apply the currency mask
		const maskedValue = applyCurrencyMask(numericValue);

		// Update the display state
		setDisplayValue(maskedValue);

		// Convert to number and call the onChange prop
		const numericAmount = currencyToNumber(maskedValue);
		onChange(numericAmount);
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
				onChange={handleChange}
				className={`${prefixSymbol ? 'pl-8' : ''} ${error ? 'border-red-500' : ''} ${className}`}
				disabled={disabled}
				{...props}
			/>
			{error && <p className="text-xs text-red-500 mt-1">{error}</p>}
		</div>
	);
}

export default CurrencyInput; 