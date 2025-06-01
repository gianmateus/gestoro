'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔧 Iniciando verificação de autenticação...');
      
      const token = localStorage.getItem('token');
      const selectedRestaurant = localStorage.getItem('selectedRestaurant');
      const userData = localStorage.getItem('user');
      
      console.log('📋 Estado atual:', {
        hasToken: !!token,
        hasRestaurant: !!selectedRestaurant,
        hasUserData: !!userData
      });
      
      if (!token) {
        // No authentication token, redirect to login
        // Sem token de autenticação, redirecionar para login
        console.log('❌ Sem token, redirecionando para login');
        setIsChecking(false);
        router.push('/login');
        return;
      }

      // Check user role first from localStorage (faster)
      // Verificar role do usuário primeiro do localStorage (mais rápido)
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log('👤 Dados do usuário:', user);
          
          // If user is ADMIN, redirect to admin panel immediately
          // Se usuário é ADMIN, redirecionar para painel de administração imediatamente
          if (user.role === 'ADMIN') {
            console.log('🔑 Usuário é ADMIN, redirecionando para /admin');
            setIsChecking(false);
            router.push('/admin');
            return;
          }
        } catch (parseError) {
          console.error('❌ Erro ao analisar dados do usuário:', parseError);
        }
      }

      // Validate if token is still valid by making a request to verify endpoint
      // Validar se o token ainda é válido fazendo uma requisição para o endpoint de verificação
      try {
        console.log('🔍 Verificando token...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
        
        const response = await fetch('http://localhost:3001/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          console.log('❌ Token inválido, limpando dados...');
          // Token is invalid, clear localStorage and redirect to login
          // Token é inválido, limpar localStorage e redirecionar para login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('selectedRestaurant');
          setIsChecking(false);
          router.push('/login');
          return;
        }

        console.log('✅ Token válido, verificando role...');

        // For non-admin users, check restaurant selection
        // Para usuários não-admin, verificar seleção de restaurante
        if (!selectedRestaurant) {
          // Authenticated but no restaurant selected, redirect to restaurant selection
          // Autenticado mas sem restaurante selecionado, redirecionar para seleção de restaurante
          setIsChecking(false);
          router.push('/restaurants');
        } else {
          // Authenticated and restaurant selected, redirect to dashboard
          // Autenticado e restaurante selecionado, redirecionar para dashboard
          setIsChecking(false);
          router.push('/dashboard');
        }
      } catch (error: any) {
        // Network error or server down, clear localStorage and redirect to login
        // Erro de rede ou servidor fora do ar, limpar localStorage e redirecionar para login
        console.error('❌ Erro na validação do token:', error);
        
        if (error.name === 'AbortError') {
          console.log('⏰ Timeout na verificação de token');
        }
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedRestaurant');
        setIsChecking(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // This should never be reached, but just in case
  // Isso nunca deveria ser alcançado, mas apenas por precaução
  return null;
} 