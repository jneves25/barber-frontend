
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import ClientLayout from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const blogPosts = [
  {
    id: 1,
    slug: 'tendencias-cortes-masculinos',
    title: 'Tendências em cortes masculinos para 2024',
    excerpt: 'Descubra os cortes que estarão em alta no próximo ano e como adaptar cada estilo ao formato do seu rosto.',
    content: `
      <p>O mundo dos cortes masculinos está sempre em evolução, com novas tendências surgindo a cada temporada. Para 2024, esperamos ver uma mistura interessante de estilos clássicos reinventados e abordagens contemporâneas ousadas.</p>
      
      <h2>1. Fade Texturizado</h2>
      <p>O fade continua sendo uma das técnicas mais populares, mas em 2024 veremos mais textura na parte superior. A combinação de um fade limpo nas laterais com muito movimento no topo cria um visual equilibrado que funciona para ocasiões formais e informais.</p>
      
      <h2>2. Cortes Médios Estruturados</h2>
      <p>Os comprimentos médios ganham mais estrutura e definição. Em vez de apenas deixar o cabelo crescer, a tendência é criar camadas estratégicas que dão forma e movimento ao cabelo, mesmo sem uso excessivo de produtos.</p>
      
      <h2>3. Modern Mullet Refinado</h2>
      <p>O mullet moderno continua evoluindo para uma versão mais sutil e refinada. Menos radical que suas versões anteriores, o modern mullet de 2024 apresenta uma transição mais suave entre as diferentes áreas de comprimento.</p>
      
      <h2>4. Crew Cut Revisitado</h2>
      <p>O clássico crew cut ganha uma atualização com mais comprimento no topo e técnicas de texturização que trazem um visual menos rígido e mais contemporâneo a este corte atemporal.</p>
      
      <h2>Como escolher o corte ideal para seu formato de rosto</h2>
      <p>Lembre-se que a tendência mais importante é a que valoriza suas características. Aqui estão algumas dicas para diferentes formatos de rosto:</p>
      
      <ul>
        <li><strong>Rosto oval:</strong> Considerado o formato "ideal", praticamente todos os estilos funcionam bem.</li>
        <li><strong>Rosto redondo:</strong> Opte por cortes com mais volume no topo e laterais mais curtas para alongar visualmente o rosto.</li>
        <li><strong>Rosto quadrado:</strong> Cortes com textura no topo e comprimento médio nas laterais suavizam os ângulos marcados.</li>
        <li><strong>Rosto retangular:</strong> Evite excessos de altura no topo e prefira cortes com volume nas laterais para equilibrar as proporções.</li>
        <li><strong>Rosto triangular:</strong> Mais volume nas laterais ajuda a balancear uma testa mais estreita com um queixo mais largo.</li>
      </ul>
      
      <p>Independentemente da tendência do momento, o corte ideal é aquele que se adapta ao seu estilo de vida, tipo de cabelo e personalidade. Converse sempre com seu barbeiro sobre suas preferências e necessidades específicas.</p>
    `,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    date: '27 Out 2023',
    readTime: '5 min de leitura',
    category: 'Cortes',
    author: {
      name: 'Carlos Oliveira',
      role: 'Barbeiro Master',
      image: 'https://randomuser.me/api/portraits/men/35.jpg'
    },
    relatedPosts: [2, 4, 5]
  },
  {
    id: 2,
    slug: 'cuidados-barba',
    title: 'Guia completo de cuidados com a barba',
    excerpt: 'Aprenda a manter sua barba saudável e bem cuidada com dicas de especialistas e produtos recomendados.',
    content: `
      <p>Cultivar uma barba bem cuidada vai muito além de simplesmente deixá-la crescer. Assim como os cabelos, a barba exige atenção e cuidados específicos para se manter saudável e com boa aparência.</p>
      
      <h2>Higiene diária</h2>
      <p>O primeiro passo para uma barba saudável é mantê-la limpa. Use um shampoo específico para barba, que limpa sem ressecar os pelos e a pele. A frequência ideal de lavagem depende de vários fatores, como seu tipo de pele, estilo de vida e comprimento da barba, mas geralmente uma ou duas vezes por dia é suficiente.</p>
      
      <h2>Hidratação é fundamental</h2>
      <p>Após a limpeza, a hidratação é essencial. Os condicionadores e óleos para barba ajudam a manter os pelos macios e a pele hidratada, prevenindo o ressecamento e a irritação. Aplique o óleo quando a barba ainda estiver levemente úmida para melhor absorção.</p>
      
      <h2>Escovação regular</h2>
      <p>Escovar a barba diariamente ajuda a distribuir os óleos naturais, remover sujeiras e células mortas, e treinar os pelos para crescerem na direção desejada. Use uma escova de cerdas naturais ou um pente de madeira para evitar a eletricidade estática.</p>
      
      <h2>Aparando e modelando</h2>
      <p>Mesmo quem deseja uma barba longa precisa aparar regularmente para manter o formato e remover pontas duplas. Invista em uma boa tesoura de barba e um aparador elétrico de qualidade para manutenções em casa. Para trabalhos mais precisos, visite seu barbeiro preferido a cada 3-4 semanas.</p>
      
      <h2>Produtos recomendados</h2>
      <p>Cada barba é única e pode exigir produtos específicos, mas algumas recomendações gerais incluem:</p>
      
      <ul>
        <li><strong>Shampoo para barba:</strong> Opte por fórmulas sem sulfatos para uma limpeza suave.</li>
        <li><strong>Óleo de barba:</strong> Ideal para barbas de todos os comprimentos, mas especialmente importante para barbas mais longas e peles secas.</li>
        <li><strong>Bálsamo de barba:</strong> Oferece hidratação e fixação leve, ajudando a modelar a barba.</li>
        <li><strong>Cera de barba:</strong> Para um controle mais firme, especialmente útil para estilos mais elaborados.</li>
      </ul>
      
      <h2>Cuidados com a pele sob a barba</h2>
      <p>Não se esqueça que sob sua barba existe pele que também precisa de atenção. Esfoliações suaves semanais ajudam a remover células mortas e prevenir a formação de pelos encravados. Produtos com ingredientes anti-inflamatórios como aloe vera e tea tree são ótimos para acalmar irritações.</p>
      
      <p>Lembre-se que paciência é a palavra-chave quando se trata de cultivar uma barba impressionante. Siga esses cuidados diariamente e você notará uma melhora significativa na aparência e saúde da sua barba.</p>
    `,
    image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    date: '15 Out 2023',
    readTime: '7 min de leitura',
    category: 'Cuidados',
    author: {
      name: 'Ricardo Gomes',
      role: 'Especialista em Barbas',
      image: 'https://randomuser.me/api/portraits/men/22.jpg'
    },
    relatedPosts: [1, 4, 6]
  },
  {
    id: 3,
    slug: 'gestao-barbearia',
    title: 'Como gerenciar sua barbearia com eficiência',
    excerpt: 'Estratégias e ferramentas para otimizar o gerenciamento do seu negócio e aumentar a produtividade.',
    image: 'https://images.unsplash.com/photo-1493256338651-d82f7272f427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '03 Out 2023',
    readTime: '10 min de leitura',
    category: 'Gestão',
    author: {
      name: 'André Santos',
      role: 'Consultor de Negócios',
      image: 'https://randomuser.me/api/portraits/men/45.jpg'
    }
  },
  {
    id: 4,
    slug: 'produtos-masculinos',
    title: 'Os melhores produtos para cabelo masculino',
    excerpt: 'Selecionamos os produtos mais eficientes para cada tipo de cabelo e estilo, com análises detalhadas.',
    image: 'https://images.unsplash.com/photo-1581002020936-bee66e056ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '24 Set 2023',
    readTime: '8 min de leitura',
    category: 'Produtos',
    author: {
      name: 'Marcos Silva',
      role: 'Especialista em Produtos',
      image: 'https://randomuser.me/api/portraits/men/55.jpg'
    }
  },
  {
    id: 5,
    slug: 'historia-barbearias',
    title: 'A evolução das barbearias através dos tempos',
    excerpt: 'Um passeio pela história das barbearias, desde a antiguidade até os modernos espaços multifuncionais de hoje.',
    image: 'https://images.unsplash.com/photo-1521219252034-0f3e4b9c9a5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '10 Set 2023',
    readTime: '12 min de leitura',
    category: 'História',
    author: {
      name: 'Paulo Mendes',
      role: 'Historiador',
      image: 'https://randomuser.me/api/portraits/men/65.jpg'
    }
  },
  {
    id: 6,
    slug: 'marketing-barbearias',
    title: 'Estratégias de marketing digital para barbearias',
    excerpt: 'Como usar as redes sociais e outras ferramentas digitais para atrair mais clientes para seu negócio.',
    image: 'https://images.unsplash.com/photo-1562714529-94d68daf92e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '05 Set 2023',
    readTime: '9 min de leitura',
    category: 'Marketing',
    author: {
      name: 'Carla Oliveira',
      role: 'Especialista em Marketing Digital',
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    }
  }
];

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Artigo não encontrado</h1>
          <p className="text-gray-600 mb-8">O artigo que você está procurando não existe ou foi removido.</p>
          <Link to="/blog">
            <Button>Voltar para o blog</Button>
          </Link>
        </div>
      </ClientLayout>
    );
  }

  const relatedPosts = post.relatedPosts 
    ? blogPosts.filter(p => post.relatedPosts?.includes(p.id))
    : [];

  return (
    <ClientLayout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Link to="/blog" className="inline-flex items-center text-barber-500 hover:text-barber-600 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o blog
          </Link>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span className="bg-barber-500 text-white px-2 py-1 rounded text-xs font-medium">{post.category}</span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {post.date}
              </span>
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {post.readTime}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
            
            {post.author && (
              <div className="flex items-center mb-8">
                <img 
                  src={post.author.image} 
                  alt={post.author.name} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-semibold">{post.author.name}</h3>
                  <p className="text-sm text-gray-500">{post.author.role}</p>
                </div>
              </div>
            )}
            
            <div className="rounded-lg overflow-hidden mb-8">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-auto object-cover"
              />
            </div>
            
            <div 
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
            />
            
            <div className="flex items-center justify-between py-6 border-t border-b border-gray-200 mb-8">
              <div className="text-gray-600 font-medium">Compartilhar este artigo:</div>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {relatedPosts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Artigos relacionados</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map(relatedPost => (
                    <Card key={relatedPost.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={relatedPost.image} 
                          alt={relatedPost.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold hover:text-barber-500 transition-colors">
                          <Link to={`/blog/${relatedPost.slug}`}>
                            {relatedPost.title}
                          </Link>
                        </h3>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{relatedPost.readTime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link to="/blog">
                <Button className="bg-barber-500 hover:bg-barber-600">
                  Ver mais artigos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default BlogPost;
