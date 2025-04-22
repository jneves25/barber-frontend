/**
 * Format a number as Brazilian currency (R$)
 * @param value - Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		minimumFractionDigits: 2,
	}).format(value);
};

/**
 * Apply a currency mask to an input value
 * @param value - Value to mask
 * @returns Masked value
 */
export const applyCurrencyMask = (value: string): string => {
	// Remove all non-numeric characters
	let numericValue = value.replace(/\D/g, '');

	// Add leading zeros if needed to ensure proper decimal placement
	if (numericValue.length === 0) {
		return '0,00';
	}

	// Convert to a string and pad with leading zeros if needed
	while (numericValue.length < 3) {
		numericValue = '0' + numericValue;
	}

	// Extract the integer and decimal parts
	const integerPart = numericValue.slice(0, -2);
	const decimalPart = numericValue.slice(-2);

	// Convert to number for proper formatting
	const intValue = parseInt(integerPart || '0', 10);

	// Format with the Brazilian locale (thousands separator)
	const formattedInteger = intValue.toLocaleString('pt-BR');

	// Combine with the decimal part
	return `${formattedInteger},${decimalPart}`;
};

/**
 * Convert a masked currency value to a number
 * @param maskedValue - Masked currency value
 * @returns Numeric value
 */
export const currencyToNumber = (maskedValue: string): number => {
	// Remove thousand separators (.) and convert decimal separator (,) to dot (.)
	const cleaned = maskedValue.replace(/\./g, '').replace(',', '.');
	// Parse the resulting string to a float
	return parseFloat(cleaned) || 0;
};

/**
 * Custom handler for currency input changes
 * @param e - Input change event
 * @param setter - State setter function
 */
export const handleCurrencyInputChange = (
	e: React.ChangeEvent<HTMLInputElement>,
	setter: (value: number) => void
): void => {
	// Get the raw input value
	const inputValue = e.target.value;

	// Remove formatting and non-numeric characters
	const numericValue = inputValue.replace(/\D/g, '');

	// Convert to currency format
	const formattedValue = applyCurrencyMask(numericValue);

	// Update the input value with the masked format
	e.target.value = formattedValue;

	// Convert back to number and update state
	setter(currencyToNumber(formattedValue));
}; 