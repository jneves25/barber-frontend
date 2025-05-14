import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { toast } from 'sonner';
import { Product, ProductService } from '@/services/api/ProductService';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, handleCurrencyInputChange, currencyToNumber } from '@/utils/currency';


interface ProductForm {
	id?: number;
	name: string;
	description: string;
	price: number;
	imageUrl: string;
	stock: number;
	companyId: number;
}


const Products = () => {
	const { companySelected, hasPermission } = useAuth();
	const canManageProducts = hasPermission('manageProducts');
	const productService = new ProductService();
	const [products, setProducts] = useState<Product[]>([]);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [newProduct, setNewProduct] = useState<ProductForm>({
		name: '',
		description: '',
		price: 0,
		imageUrl: '',
		stock: 0,
		companyId: companySelected.id
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState<number | null>(null);
	const [errors, setErrors] = useState<{
		name?: string;
		price?: string;
		stock?: string;
	}>({});

	useEffect(() => {
		fetchProducts();
	}, []);

	const fetchProducts = async () => {
		setIsLoading(true);
		try {
			const response = await productService.getAllProducts(companySelected.id);

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

	const handleAddProduct = async () => {
		setIsSubmitting(true);
		// Reset errors
		setErrors({});

		// Validate form
		let hasErrors = false;
		const newErrors: {
			name?: string;
			price?: string;
			stock?: string;
		} = {};

		if (!newProduct.name.trim()) {
			newErrors.name = "O nome do produto é obrigatório";
			hasErrors = true;
		}

		if (!newProduct.price || newProduct.price <= 0) {
			newErrors.price = "O preço deve ser maior que zero";
			hasErrors = true;
		}

		if (newProduct.stock < 0) {
			newErrors.stock = "O estoque não pode ser negativo";
			hasErrors = true;
		}

		if (hasErrors) {
			setErrors(newErrors);
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await productService.createProduct(newProduct);

			if (response.success && response.data) {
				setProducts([...products, response.data]);
				setNewProduct({
					name: '',
					description: '',
					price: 0,
					imageUrl: '',
					stock: 0,
					companyId: companySelected.id
				});
				setIsAddDialogOpen(false);
				toast.success(`${response.data.name} foi adicionado com sucesso.`);
			} else {
				toast.error(response.error || 'Erro ao adicionar produto');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditProduct = async () => {
		if (!selectedProduct) return;

		setIsSubmitting(true);
		// Reset errors
		setErrors({});

		// Validate form
		let hasErrors = false;
		const newErrors: {
			name?: string;
			price?: string;
			stock?: string;
		} = {};

		if (!selectedProduct.name.trim()) {
			newErrors.name = "O nome do produto é obrigatório";
			hasErrors = true;
		}

		if (!selectedProduct.price || selectedProduct.price <= 0) {
			newErrors.price = "O preço deve ser maior que zero";
			hasErrors = true;
		}

		if (selectedProduct.stock < 0) {
			newErrors.stock = "O estoque não pode ser negativo";
			hasErrors = true;
		}

		if (hasErrors) {
			setErrors(newErrors);
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await productService.updateProduct(selectedProduct.id!, selectedProduct);

			if (response.success && response.data) {
				const updatedProducts = products.map(p =>
					p.id === selectedProduct.id ? response.data : p
				);
				setProducts(updatedProducts);
				setSelectedProduct(null);
				setIsAddDialogOpen(false);
				toast.success(`${response.data.name} foi atualizado com sucesso.`);
			} else {
				toast.error(response.error || 'Erro ao atualizar produto');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteProduct = async () => {
		if (!selectedProduct) return;

		setIsDeleting(selectedProduct.id!);
		try {
			const response = await productService.deleteProduct(selectedProduct.id!);

			if (response.success) {
				setProducts(products.filter(p => p.id !== selectedProduct.id));
				setIsDeleteDialogOpen(false);
				setSelectedProduct(null);
				toast.success('O produto foi removido com sucesso.');
			} else {
				toast.error(response.error || 'Erro ao remover produto');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsDeleting(null);
		}
	};

	const openEditDialog = (product: Product) => {
		setSelectedProduct(product);
		setIsAddDialogOpen(true);
	};

	const openDeleteDialog = (product: Product) => {
		setSelectedProduct(product);
		setIsDeleteDialogOpen(true);
	};

	return (
		<AdminLayout>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-800">Gestão de Produtos</h1>
				{canManageProducts && (
					<Button
						onClick={() => {
							setSelectedProduct(null);
							setNewProduct({
								name: '',
								description: '',
								price: 0,
								imageUrl: '',
								stock: 0,
								companyId: companySelected.id
							});
							setIsAddDialogOpen(true);
						}}
						className="bg-[#1776D2] hover:bg-[#1776D2]/90 text-white"
					>
						<Plus className="mr-2 h-4 w-4" /> Adicionar Produto
					</Button>
				)}
			</div>

			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<h2 className="text-lg font-semibold mb-4">Produtos Disponíveis</h2>
				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-barber-500" />
					</div>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Imagem</TableHead>
									<TableHead>Nome</TableHead>
									<TableHead>Preço</TableHead>
									<TableHead>Estoque</TableHead>
									{canManageProducts && (
										<TableHead className="text-right">Ações</TableHead>
									)}
								</TableRow>
							</TableHeader>
							<TableBody>
								{products.length > 0 ? products.map((product) => (
									<TableRow key={product.id}>
										<TableCell>
											{product.imageUrl ? (
												<img
													src={product.imageUrl}
													alt={product.name}
													className="w-10 h-10 object-cover rounded-md"
												/>
											) : (
												<div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
													<span className="text-gray-500 text-xs">Sem imagem</span>
												</div>
											)}
										</TableCell>
										<TableCell className="font-medium whitespace-nowrap">{product.name}</TableCell>
										<TableCell>R$ {product.price.toFixed(2)}</TableCell>
										<TableCell>{product.stock} unid.</TableCell>
										{canManageProducts && (
											<TableCell className="text-right">
												<div className="flex justify-end space-x-2">
													<Button size="sm" variant="ghost" onClick={() => openEditDialog(product)}>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => openDeleteDialog(product)}
														disabled={isDeleting === product.id}
													>
														{isDeleting === product.id ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<Trash2 className="h-4 w-4 text-destructive" />
														)}
													</Button>
												</div>
											</TableCell>
										)}
									</TableRow>
								)) : (
									<TableRow>
										<TableCell colSpan={canManageProducts ? 5 : 4} className="text-center py-4">
											Nenhum produto encontrado.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				)}
			</div>

			<div className="bg-white rounded-lg shadow p-6">
				<h2 className="text-lg font-semibold mb-4">Visualização do Cliente</h2>
				<p className="text-gray-600 mb-4">
					Esta é uma prévia de como os produtos serão exibidos para os clientes na vitrine.
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{products.map((product) => (
						<ProductCard
							key={product.id}
							id={String(product.id)}
							name={product.name}
							description={product.description}
							price={product.price}
							image={product.imageUrl}
							stock={product.stock}
							viewOnly
						/>
					))}
				</div>
			</div>

			{canManageProducts && (
				<>
					<Dialog open={isAddDialogOpen} onOpenChange={(open) => {
						setIsAddDialogOpen(open);
						if (!open) {
							setSelectedProduct(null);
							setErrors({});
						}
					}}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{selectedProduct ? 'Editar Produto' : 'Adicionar Produto'}
								</DialogTitle>
								<DialogDescription>
									{selectedProduct
										? 'Atualize as informações do produto existente'
										: 'Adicione um novo produto ao seu inventário'}
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="product-name">
										Nome <span className="text-red-500">*</span>
									</Label>
									<Input
										id="product-name"
										value={selectedProduct ? selectedProduct.name : newProduct.name}
										onChange={(e) => {
											if (selectedProduct) {
												setSelectedProduct({
													...selectedProduct,
													name: e.target.value
												});
											} else {
												setNewProduct({
													...newProduct,
													name: e.target.value
												});
											}
											if (errors.name) setErrors({ ...errors, name: undefined });
										}}
										className={errors.name ? "border-red-500" : ""}
									/>
									{errors.name && (
										<p className="text-sm text-red-500">{errors.name}</p>
									)}
								</div>
								<div className="grid gap-2">
									<Label htmlFor="product-description">Descrição</Label>
									<Textarea
										id="product-description"
										rows={3}
										value={selectedProduct ? selectedProduct.description : newProduct.description}
										onChange={(e) => {
											if (selectedProduct) {
												setSelectedProduct({
													...selectedProduct,
													description: e.target.value
												});
											} else {
												setNewProduct({
													...newProduct,
													description: e.target.value
												});
											}
										}}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="grid gap-2">
										<Label htmlFor="product-price">
											Preço (R$) <span className="text-red-500">*</span>
										</Label>
										<Input
											id="product-price"
											type="text"
											inputMode="decimal"
											value={selectedProduct
												? selectedProduct.price.toLocaleString('pt-BR', {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2
												})
												: newProduct.price.toLocaleString('pt-BR', {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2
												})
											}
											onChange={(e) => {
												// Use the utility function to handle all currency formatting
												handleCurrencyInputChange(e, (value) => {
													if (selectedProduct) {
														setSelectedProduct({
															...selectedProduct,
															price: value
														});
													} else {
														setNewProduct({
															...newProduct,
															price: value
														});
													}
													if (errors.price) setErrors({ ...errors, price: undefined });
												});
											}}
											className={errors.price ? "border-red-500" : ""}
										/>
										{errors.price && (
											<p className="text-sm text-red-500">{errors.price}</p>
										)}
									</div>
									<div className="grid gap-2">
										<Label htmlFor="product-stock">
											Estoque
										</Label>
										<Input
											id="product-stock"
											type="number"
											min="0"
											value={selectedProduct ? selectedProduct.stock : newProduct.stock}
											onChange={(e) => {
												const value = parseInt(e.target.value);
												if (selectedProduct) {
													setSelectedProduct({
														...selectedProduct,
														stock: value
													});
												} else {
													setNewProduct({
														...newProduct,
														stock: value
													});
												}
												if (errors.stock) setErrors({ ...errors, stock: undefined });
											}}
											className={errors.stock ? "border-red-500" : ""}
										/>
										{errors.stock && (
											<p className="text-sm text-red-500">{errors.stock}</p>
										)}
									</div>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="product-image">URL da Imagem</Label>
									<Input
										id="product-image"
										type="text"
										placeholder="https://exemplo.com/imagem.jpg"
										value={selectedProduct ? selectedProduct.imageUrl : newProduct.imageUrl}
										onChange={(e) => {
											if (selectedProduct) {
												setSelectedProduct({
													...selectedProduct,
													imageUrl: e.target.value
												});
											} else {
												setNewProduct({
													...newProduct,
													imageUrl: e.target.value
												});
											}
										}}
									/>
									<p className="text-xs text-muted-foreground">
										Deixe em branco para usar uma imagem padrão
									</p>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => {
										setIsAddDialogOpen(false);
										setSelectedProduct(null);
										setErrors({});
									}}
									className="font-medium"
								>
									Cancelar
								</Button>
								<Button
									onClick={selectedProduct ? handleEditProduct : handleAddProduct}
									disabled={isSubmitting}
									className="bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{selectedProduct ? 'Salvando...' : 'Adicionando...'}
										</>
									) : (
										<>{selectedProduct ? 'Salvar Alterações' : 'Adicionar Produto'}</>
									)}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Confirmar Exclusão</DialogTitle>
								<DialogDescription>
									Tem certeza que deseja excluir o produto "{selectedProduct?.name}"?
									Esta ação não pode ser desfeita.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting !== null} className="font-medium">
									Cancelar
								</Button>
								<Button variant="destructive" onClick={handleDeleteProduct} disabled={isDeleting !== null} className="font-medium">
									{isDeleting !== null ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Excluindo...
										</>
									) : 'Excluir'}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</>
			)}
		</AdminLayout>
	);
};

export default Products;
