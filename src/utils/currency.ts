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
 * Convert a masked currency value to a number
 * @param maskedValue - Masked currency value
 * @returns Numeric value
 */
export const currencyToNumber = (maskedValue: string): number => {
	// Se o valor estiver vazio, retorna 0
	if (!maskedValue || maskedValue === '') {
		return 0;
	}

	// Remove separadores de milhar (.) e converte vírgula para ponto decimal
	const cleaned = maskedValue.replace(/\./g, '').replace(',', '.');

	// Converter para número
	const num = parseFloat(cleaned);

	// Se for NaN, retorna 0
	if (isNaN(num)) {
		return 0;
	}

	return num;
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
	// Obtém o valor do input
	const value = e.target.value;

	// Remove todos os caracteres não numéricos
	const numericValue = value.replace(/\D/g, '');

	// Converte para um valor numérico (em centavos)
	const cents = parseInt(numericValue || '0', 10);

	// Converte centavos para um valor decimal (ex: 1234 -> 12.34)
	const floatValue = cents / 100;

	// Atualiza o input com o valor formatado
	e.target.value = floatValue.toLocaleString('pt-BR', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	// Atualiza o estado com o valor numérico
	setter(floatValue);
}; 