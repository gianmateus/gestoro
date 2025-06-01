// API Configuration - Configuração da API
const API_CONFIG = {
  // Base URL para API calls
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://gestoro.onrender.com',
  
  // Endpoints principais
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      VERIFY: '/api/auth/verify',
      REFRESH: '/api/auth/refresh'
    },
    ADMIN: {
      CLIENTS: '/api/admin/clients',
      CLIENTS_DEACTIVATED: '/api/admin/clients/deactivated',
      PAYMENTS: '/api/admin/payments',
      PAYMENTS_GENERATE: '/api/admin/payments/generate-monthly',
      PAYMENTS_UPDATE_OVERDUE: '/api/admin/payments/update-overdue'
    },
    RESTAURANTS: '/api/restaurants',
    DASHBOARD: '/api/dashboard'
  }
};

// Helper functions para construir URLs completas
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getAuthUrl = (action: keyof typeof API_CONFIG.ENDPOINTS.AUTH): string => {
  return getApiUrl(API_CONFIG.ENDPOINTS.AUTH[action]);
};

export const getAdminUrl = (action: keyof typeof API_CONFIG.ENDPOINTS.ADMIN): string => {
  return getApiUrl(API_CONFIG.ENDPOINTS.ADMIN[action]);
};

// Função para fazer requests com configuração padrão
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  return fetch(getApiUrl(endpoint), config);
};

export default API_CONFIG; 
