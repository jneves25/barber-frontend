
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

// Define an interface for the error response structure
interface ErrorResponse {
	message?: string;
	[key: string]: any;
}

// Base API configuration
const apiClient: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'https://backend-proud-moon-9701.fly.dev/api',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('auth_token');
		if (token && config.headers) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		const status = error.response?.status;

		// Handle 401 Unauthorized errors (expired or invalid tokens)
		if (status === 401) {
			localStorage.removeItem('auth_token');
			localStorage.removeItem('user_type');

			// Check if we're already on the login page to avoid redirect loops
			const isLoginPage = window.location.pathname === '/login' ||
				window.location.pathname === '/client/login';

			if (!isLoginPage) {
				const isClient = localStorage.getItem('user_type') === 'client';
				const redirectPath = isClient ? '/client/login' : '/login';

				toast.error('Sua sessão expirou. Por favor, faça login novamente.');
				window.location.href = redirectPath;
			}
		}
		// Handle 403 Forbidden errors (permission issues)
		else if (status === 403) {
			toast.error('Você não tem permissão para realizar esta operação');
		}
		// Handle 500 and other server errors
		else if (status && status >= 500) {
			toast.error('Erro no servidor. Por favor, tente novamente mais tarde.');
		}
		// Handle other client errors with custom messages
		else if (error.response?.data) {
			// Cast the data to our error response interface
			const errorData = error.response.data as ErrorResponse | string;
			const errorMessage = typeof errorData === 'string'
				? errorData
				: errorData.message || 'Ocorreu um erro na requisição';
			toast.error(errorMessage);
		}

		return Promise.reject(error);
	}
);

export default apiClient;
