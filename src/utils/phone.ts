import React from 'react';

/**
 * Aplica máscara de telefone no formato (XX) XXXXX-XXXX
 * @param value - Valor do telefone a ser formatado
 * @returns Valor formatado com a máscara
 */
export const applyPhoneMask = (value: string): string => {
	// Remove todos os caracteres não numéricos
	const phoneNumber = value.replace(/\D/g, '');

	// Aplica a máscara de telefone brasileiro
	if (phoneNumber.length <= 2) {
		return phoneNumber;
	} else if (phoneNumber.length <= 7) {
		return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
	} else {
		return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
	}
};

/**
 * Manipulador de mudanças para campos de telefone
 * @param e - Evento de mudança do input
 * @param setter - Função para atualizar o estado
 */
export const handlePhoneInputChange = (
	e: React.ChangeEvent<HTMLInputElement>,
	setter: (value: string) => void
): void => {
	// Obtém o valor do input e aplica a máscara
	const maskedValue = applyPhoneMask(e.target.value);

	// Atualiza o valor do state com a máscara aplicada
	setter(maskedValue);
};

/**
 * Limpa a formatação do telefone, mantendo apenas os números
 * @param value - Valor do telefone formatado
 * @returns Apenas os dígitos do telefone
 */
export const cleanPhoneNumber = (value: string): string => {
	return value.replace(/\D/g, '').trim();
};

/**
 * Valida se o número de telefone está no formato correto
 * @param phone - Número de telefone (com ou sem formatação)
 * @returns null se válido, mensagem de erro se inválido
 */
export const validatePhoneNumber = (phone: string): string | null => {
	const cleaned = cleanPhoneNumber(phone);

	if (cleaned.length < 10 || cleaned.length > 11) {
		return 'Telefone deve ter entre 10 e 11 dígitos';
	}

	return null;
}; 