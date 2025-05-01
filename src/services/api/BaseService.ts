import apiClient from './apiClient';
import { AxiosResponse, AxiosError } from 'axios';

export interface ApiResponse<T> {
	data?: T;
	error?: string;
	status: number;
	success: boolean;
}

// Mapping from English field names to Portuguese
const fieldNameMapping: Record<string, string> = {
	name: 'nome',
	description: 'descrição',
	price: 'preço',
	duration: 'duração',
	stock: 'estoque',
	imageUrl: 'URL da imagem',
	companyId: 'ID da empresa',
};

export class BaseService {
	protected endpoint: string;

	constructor(endpoint: string) {
		this.endpoint = endpoint;
	}

	// Helper method to handle API responses
	protected async handleResponse<T>(promise: Promise<AxiosResponse>): Promise<ApiResponse<T>> {
		try {
			const response = await promise;
			return {
				data: response.data,
				status: response.status,
				success: true
			};
		} catch (error) {
			const axiosError = error as AxiosError;
			console.log('Erro da API:', axiosError.response?.data);

			let errorMessage: string;

			if (axiosError.response?.data) {
				const errorData = axiosError.response.data as any;
				// Verificar se a resposta contém um objeto com campo message ou uma string direta
				if (typeof errorData === 'object' && errorData.message) {
					errorMessage = errorData.message;
				} else if (typeof errorData === 'string') {
					errorMessage = errorData;
				} else {
					errorMessage = JSON.stringify(errorData);
				}
			} else {
				errorMessage = axiosError.message || 'Erro desconhecido na comunicação com o servidor';
			}

			return {
				error: errorMessage,
				status: axiosError.response?.status || 500,
				success: false
			};
		}
	}

	// Generic validation method to check if an object has required fields
	protected validateRequired<T>(data: T, requiredFields: (keyof T)[]): string | null {
		for (const field of requiredFields) {
			if (data[field] === undefined || data[field] === null || data[field] === '') {
				const fieldName = fieldNameMapping[String(field)] || String(field);
				return `O campo ${fieldName} é obrigatório`;
			}
		}
		return null;
	}

	// Generic validation method for email format
	protected validateEmail(email: string): string | null {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email) ? null : 'E-mail não é válido';
	}
}
