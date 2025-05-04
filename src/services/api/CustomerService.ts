import apiClient from './apiClient';
import { BaseService, ApiResponse } from './BaseService';

export interface Customer {
	id: number;
	name: string;
	phone: string;
	email: string;
}

class CustomerService extends BaseService {
	constructor() {
		super('customer');
	}

	// Verifica se um cliente existe pelo telefone
	async checkCustomerByPhone(phone: string): Promise<ApiResponse<Customer>> {
		try {
			// Simula um tempo de resposta de API
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Lista de clientes fictícios para teste
			const existingCustomers = [
				{ id: 1, name: 'João Silva', phone: '11999999999', email: 'joao@gmail.com' },
				{ id: 2, name: 'Maria Souza', phone: '11988888888', email: 'maria@gmail.com' },
				{ id: 3, name: 'Pedro Santos', phone: '11977777777', email: 'pedro@gmail.com' }
			];

			const customer = existingCustomers.find(c => c.phone === phone);

			if (customer) {
				console.log(`Cliente encontrado: ${customer.name}`);
				// Simula o envio de SMS
				console.log(`SMS enviado para ${phone} com código de verificação`);
				return {
					data: customer,
					status: 200,
					success: true
				};
			} else {
				return {
					status: 404,
					success: false,
					error: 'Cliente não encontrado'
				};
			}
		} catch (error) {
			return {
				status: 500,
				success: false,
				error: 'Erro ao verificar cliente'
			};
		}
	}

	// Verifica o código SMS
	async verifySmsCode(phone: string, code: string): Promise<ApiResponse<{ verified: boolean }>> {
		try {
			// Simula um tempo de resposta de API
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Código válido para teste
			const validCode = '123456';

			if (code === validCode) {
				return {
					data: { verified: true },
					status: 200,
					success: true
				};
			} else {
				return {
					data: { verified: false },
					status: 400,
					success: false,
					error: 'Código de verificação inválido'
				};
			}
		} catch (error) {
			return {
				status: 500,
				success: false,
				error: 'Erro ao verificar código SMS'
			};
		}
	}

	// Cria um novo cliente
	async createCustomer(customer: Omit<Customer, 'id'>): Promise<ApiResponse<Customer>> {
		try {
			// Simula um tempo de resposta de API
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Gera um ID fictício para o novo cliente
			const newCustomer: Customer = {
				...customer,
				id: Math.floor(Math.random() * 1000) + 4 // ID aleatório a partir de 4
			};

			return {
				data: newCustomer,
				status: 201,
				success: true
			};
		} catch (error) {
			return {
				status: 500,
				success: false,
				error: 'Erro ao criar cliente'
			};
		}
	}
}

export default new CustomerService(); 