export const DEFAULT_PERMISSIONS = {
	manageCompany: false,
	viewCompanys: false,
	addMember: false,
	managePermissions: false,
	viewPermissions: false,
	viewAllAppointments: false,
	manageAppointments: false,
	viewOwnAppointments: true,
	viewAllClients: false,
	manageClients: false,
	viewOwnClients: true,
	viewAllServices: true,
	manageServices: false,
	viewServices: true,
	viewAllProducts: true,
	manageProducts: false,
	viewProducts: true,
	viewAllBarbers: false,
	manageBarbers: false,
	viewAllCommissions: false,
	manageCommissions: false,
	viewOwnCommissions: true,
	viewAllGoals: false,
	manageGoals: false,
	viewOwnGoals: true,
	viewFullRevenue: false,
	viewOwnRevenue: true,
	manageSettings: false,
	viewUsers: false,
	manageUsers: false,
	viewSubscriptions: false,
	manageSubscriptions: false,
	viewFullStatistics: false,
	viewOwnStatistics: true,
};

export const allPermissions = [
	{ id: 'manageCompany', name: 'Gerenciar empresa', description: 'Acesso para gerenciar dados da empresa' },
	{ id: 'viewCompanys', name: 'Ver times', description: 'Acesso para visualizar os times cadastrados' },
	{ id: 'addMember', name: 'Adicionar membro', description: 'Acesso para adicionar novos membros aos times' },
	{ id: 'managePermissions', name: 'Gerenciar permissões', description: 'Acesso para configurar permissões dos usuários' },
	{ id: 'viewPermissions', name: 'Ver permissões', description: 'Acesso para visualizar permissões dos usuários' },

	// Agendamentos
	{ id: 'viewAllAppointments', name: 'Ver todos os agendamentos', description: 'Acesso para visualizar agendamentos de todos os barbeiros' },
	{ id: 'manageAppointments', name: 'Gerenciar agendamentos', description: 'Criar, editar e excluir agendamentos' },
	{ id: 'viewOwnAppointments', name: 'Ver próprios agendamentos', description: 'Acesso para visualizar apenas seus próprios agendamentos' },

	// Clientes
	{ id: 'viewAllClients', name: 'Ver todos os clientes', description: 'Acesso para visualizar todos os clientes cadastrados' },
	{ id: 'manageClients', name: 'Gerenciar clientes', description: 'Criar, editar e excluir clientes' },
	{ id: 'viewOwnClients', name: 'Ver próprios clientes', description: 'Acesso para visualizar apenas seus próprios clientes' },

	// Serviços
	{ id: 'viewAllServices', name: 'Ver todos os serviços', description: 'Acesso para visualizar todos os serviços disponíveis' },
	{ id: 'manageServices', name: 'Gerenciar serviços', description: 'Criar, editar e excluir serviços' },
	{ id: 'viewServices', name: 'Ver serviços', description: 'Acesso para visualizar serviços disponíveis' },

	// Produtos
	{ id: 'viewAllProducts', name: 'Ver todos os produtos', description: 'Acesso para visualizar todos os produtos disponíveis' },
	{ id: 'manageProducts', name: 'Gerenciar produtos', description: 'Criar, editar e excluir produtos' },
	{ id: 'viewProducts', name: 'Ver produtos', description: 'Acesso para visualizar produtos disponíveis' },

	// Barbeiros
	{ id: 'viewAllBarbers', name: 'Ver todos os barbeiros', description: 'Acesso para visualizar todos os barbeiros' },
	{ id: 'manageBarbers', name: 'Gerenciar barbeiros', description: 'Criar, editar e excluir barbeiros' },

	// Comissões
	{ id: 'viewAllCommissions', name: 'Ver todas as comissões', description: 'Acesso para visualizar comissões de todos os barbeiros' },
	{ id: 'manageCommissions', name: 'Gerenciar comissões', description: 'Configurar e ajustar comissões' },
	{ id: 'viewOwnCommissions', name: 'Ver próprias comissões', description: 'Acesso para visualizar apenas suas próprias comissões' },

	// Metas
	{ id: 'viewAllGoals', name: 'Ver todas as metas', description: 'Acesso para visualizar metas de todos os barbeiros' },
	{ id: 'manageGoals', name: 'Gerenciar metas', description: 'Definir e ajustar metas' },
	{ id: 'viewOwnGoals', name: 'Ver próprias metas', description: 'Acesso para visualizar apenas suas próprias metas' },

	// Faturamento
	{ id: 'viewFullRevenue', name: 'Ver faturamento completo', description: 'Acesso para visualizar todo o faturamento da barbearia' },
	{ id: 'viewOwnRevenue', name: 'Ver próprio faturamento', description: 'Acesso para visualizar apenas sua contribuição no faturamento' },

	// Configurações
	{ id: 'manageSettings', name: 'Gerenciar configurações', description: 'Acesso para alterar configurações do sistema' },

	// Usuários
	{ id: 'viewUsers', name: 'Ver usuários', description: 'Acesso para visualizar todos os usuários do sistema' },
	{ id: 'manageUsers', name: 'Gerenciar usuários', description: 'Criar, editar e excluir usuários' },

	// Assinaturas
	{ id: 'viewSubscriptions', name: 'Ver assinaturas', description: 'Acesso para visualizar planos e assinaturas' },
	{ id: 'manageSubscriptions', name: 'Gerenciar assinaturas', description: 'Criar, editar e excluir planos de assinatura' },

	// Estatísticas
	{ id: 'viewFullStatistics', name: 'Ver todas as estatísticas', description: 'Permite visualizar estatísticas de todo o estabelecimento' },
	{ id: 'viewOwnStatistics', name: 'Ver estatísticas próprias', description: 'Permite visualizar apenas estatísticas relacionadas ao próprio usuário' },
];
