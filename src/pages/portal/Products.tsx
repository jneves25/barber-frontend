
import React, { useState, useEffect } from 'react';
import ClientLayout from '@/components/layout/ClientLayout';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Product, ProductService } from '@/services/api/ProductService';

const productService = new ProductService();

const ProductsPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const { user, hasPermission, companySelected } = useAuth();
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Determinar se o usuário pode ver o estoque
	const canViewStock = user && (user.role === 'ADMIN' || hasPermission('manageProducts'));

	useEffect(() => {
		fetchProducts();
	}, []);

	const fetchProducts = async () => {
		setIsLoading(true);
		try {
			const response = await productService.getAllProducts(companySelected.id);

			console.log("passei aq")

			if (response.success && response.data) {
				setProducts(response.data);
			} else {
				toast.error(response.error || 'Erro ao carregar produtos');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const filteredProducts = products.filter(product =>
		product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		product.description.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<ClientLayout>
			<div className="container mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">Produtos da Barbearia</h1>

				<div className="relative mb-8">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search className="h-5 w-5 text-gray-400" />
					</div>
					<Input
						type="search"
						placeholder="Buscar produtos..."
						className="pl-10"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-barber-500" />
					</div>
				) : filteredProducts.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredProducts.map((product) => (
							<ProductCard
								key={product.id}
								id={String(product.id)}
								name={product.name}
								description={product.description}
								price={product.price}
								image={product.imageUrl}
								stock={product.stock}
								viewOnly={!canViewStock}
							/>
						))}
					</div>
				)}
			</div>
		</ClientLayout>
	);
};

export default ProductsPage;
