import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

export interface Product {
	id?: number;
	name: string;
	description: string;
	price: number;
	stock: number;
	imageUrl: string;
	companyId: number;
}

export class ProductService extends BaseService {
	constructor() {
		super(''); // Base endpoint will be set in specific methods
	}

	validateProduct(product: Product): string | null {
		const requiredError = this.validateRequired(product, [
			'name', 'description', 'price', 'stock', 'imageUrl', 'companyId'
		]);
		if (requiredError) return requiredError;

		if (product.price < 0) {
			return 'Price must be positive';
		}

		return null;
	}

	async getAllProducts(companyId: number): Promise<ApiResponse<Product[]>> {
		const params = {
			companyId
		}

		return this.handleResponse<Product[]>(apiClient.get(`/product`, { params }));
	}

	async getProductsByCompanySlug(slug: string): Promise<ApiResponse<Product[]>> {
		return this.handleResponse<Product[]>(apiClient.get(`/product/company/${slug}`));
	}

	async getProductById(id: number): Promise<ApiResponse<Product>> {
		return this.handleResponse<Product>(apiClient.get(`/product/${id}`));
	}

	async createProduct(product: Product): Promise<ApiResponse<Product>> {
		const validationError = this.validateProduct(product);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		return this.handleResponse<Product>(apiClient.post('/product', product));
	}

	async updateProduct(id: number, product: Product): Promise<ApiResponse<Product>> {
		const validationError = this.validateProduct(product);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		return this.handleResponse<Product>(apiClient.put(`/product/${id}`, product));
	}

	async deleteProduct(id: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(apiClient.delete(`/product/${id}`));
	}

	async updateProductStock(id: number, quantity: number): Promise<ApiResponse<Product>> {
		if (quantity < 0) {
			return { error: 'Quantity must be positive', status: 400, success: false };
		}

		return this.handleResponse<Product>(
			apiClient.patch(`/product/${id}/stock`, { stock: quantity })
		);
	}
}

export default new ProductService(); 