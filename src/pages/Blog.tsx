
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight, Search } from 'lucide-react';
import ClientLayout from '@/components/layout/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const blogPosts = [
  {
    id: 1,
    slug: 'tendencias-cortes-masculinos',
    title: 'Tendências em cortes masculinos para 2024',
    excerpt: 'Descubra os cortes que estarão em alta no próximo ano e como adaptar cada estilo ao formato do seu rosto.',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '27 Out 2023',
    readTime: '5 min de leitura',
    category: 'Cortes'
  },
  {
    id: 2,
    slug: 'cuidados-barba',
    title: 'Guia completo de cuidados com a barba',
    excerpt: 'Aprenda a manter sua barba saudável e bem cuidada com dicas de especialistas e produtos recomendados.',
    image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '15 Out 2023',
    readTime: '7 min de leitura',
    category: 'Cuidados'
  },
  {
    id: 3,
    slug: 'gestao-barbearia',
    title: 'Como gerenciar sua barbearia com eficiência',
    excerpt: 'Estratégias e ferramentas para otimizar o gerenciamento do seu negócio e aumentar a produtividade.',
    image: 'https://images.unsplash.com/photo-1493256338651-d82f7272f427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '03 Out 2023',
    readTime: '10 min de leitura',
    category: 'Gestão'
  },
  {
    id: 4,
    slug: 'produtos-masculinos',
    title: 'Os melhores produtos para cabelo masculino',
    excerpt: 'Selecionamos os produtos mais eficientes para cada tipo de cabelo e estilo, com análises detalhadas.',
    image: 'https://images.unsplash.com/photo-1581002020936-bee66e056ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '24 Set 2023',
    readTime: '8 min de leitura',
    category: 'Produtos'
  },
  {
    id: 5,
    slug: 'historia-barbearias',
    title: 'A evolução das barbearias através dos tempos',
    excerpt: 'Um passeio pela história das barbearias, desde a antiguidade até os modernos espaços multifuncionais de hoje.',
    image: 'https://images.unsplash.com/photo-1521219252034-0f3e4b9c9a5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '10 Set 2023',
    readTime: '12 min de leitura',
    category: 'História'
  },
  {
    id: 6,
    slug: 'marketing-barbearias',
    title: 'Estratégias de marketing digital para barbearias',
    excerpt: 'Como usar as redes sociais e outras ferramentas digitais para atrair mais clientes para seu negócio.',
    image: 'https://images.unsplash.com/photo-1562714529-94d68daf92e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '05 Set 2023',
    readTime: '9 min de leitura',
    category: 'Marketing'
  },
];

const categories = [
  'Todos',
  'Cortes',
  'Cuidados',
  'Produtos',
  'Tendências',
  'Gestão',
  'Marketing',
  'História'
];

const Blog = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('Todos');

  return (
    <ClientLayout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog da BarberShop</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra dicas, tendências e informações sobre o mundo das barbearias
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Buscar artigos..." 
                className="pl-10 py-6 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                className={activeCategory === category ? "bg-barber-500 hover:bg-barber-600" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-barber-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    {post.category}
                  </div>
                </div>
                <CardContent className="pt-6">
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 hover:text-barber-500 transition-colors">
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  <Link to={`/blog/${post.slug}`} className="text-barber-500 font-medium inline-flex items-center hover:text-barber-600 transition-colors">
                    Ler mais <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Blog;
