'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Eye, EyeOff, Copy, Check, AlertCircle, UserMinus, Shield, LogOut, Edit2, Trash2, Play, Pause } from 'lucide-react';
import { getAuthUrl, getAdminUrl, apiRequest } from '../../config/api';

interface Client {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  restaurants: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
  }>;
  nextPayment?: {
    id: string;
    amount: number;
    dueDate: string;
    status: string;
    type: string;
    description: string;
    referenceMonth?: string;
    isOverdue: boolean;
  } | null;
}

interface CreateClientData {
  email: string;
  password: string;
  name: string;
  restaurantName: string;
  restaurantAddress: string;
  phone: string;
  monthlyAmount: string;
  paymentDay: string;
}

interface EditClientData {
  name: string;
  email: string;
  restaurantName: string;
  restaurantAddress: string;
  phone: string;
  monthlyAmount: string;
  paymentDay: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [deactivatedClients, setDeactivatedClients] = useState<Client[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<{id: string, name: string} | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState<{ [key: string]: boolean }>({});
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState<any>({});
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    dueDate: '',
    type: 'MONTHLY',
    description: '',
    referenceMonth: ''
  });
  
  const [formData, setFormData] = useState<CreateClientData>({
    email: '',
    password: '',
    name: '',
    restaurantName: '',
    restaurantAddress: '',
    phone: '',
    monthlyAmount: '',
    paymentDay: ''
  });

  const [editFormData, setEditFormData] = useState<EditClientData>({
    name: '',
    email: '',
    restaurantName: '',
    restaurantAddress: '',
    phone: '',
    monthlyAmount: '',
    paymentDay: ''
  });

  const [lastCreatedCredentials, setLastCreatedCredentials] = useState<{
    email: string;
    password: string;
    loginUrl: string;
  } | null>(null);

  // Verificar autenticação e autorização
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (!token || !user) {
        console.log('❌ Token ou usuário não encontrado');
        router.push('/login');
        return;
      }

      const userData = JSON.parse(user);
      
      // Verificar se é ADMIN
      if (userData.role !== 'ADMIN') {
        alert('❌ Acesso negado! Apenas administradores podem acessar esta página.');
        router.push('/restaurants');
        return;
      }

      // Verificar se o token ainda é válido
      const response = await apiRequest('/api/auth/verify');

      if (!response.ok) {
        console.log('❌ Token inválido');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      setUserInfo({
        name: userData.name,
        email: userData.email
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro na verificação de auth:', error);
      router.push('/login');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Carregar lista de clientes
  const loadClients = async () => {
    try {
      const response = await apiRequest('/api/admin/clients');

      const data = await response.json();
      if (data.success) {
        setClients(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  // Carregar lista de clientes desativados
  const loadDeactivatedClients = async () => {
    try {
      const response = await apiRequest('/api/admin/clients/deactivated');

      const data = await response.json();
      if (data.success) {
        setDeactivatedClients(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes desativados:', error);
    }
  };

  // Carregar lista de pagamentos
  const loadPayments = async () => {
    try {
      const response = await apiRequest('/api/admin/payments');

      const data = await response.json();
      if (data.success) {
        setPayments(data.data);
        setPaymentStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    }
  };

  // Marcar pagamento como recebido
  const markPaymentAsPaid = async (paymentId: string, paymentMethod: string) => {
    setLoadingPayments(prev => ({ ...prev, [paymentId]: true }));
    
    try {
      const response = await apiRequest(`/api/admin/payments/${paymentId}/paid`, {
        method: 'PUT',
        body: JSON.stringify({
          paymentMethod,
          paidDate: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Pagamento marcado como recebido!' });
        await loadPayments();
        await loadClients();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao marcar pagamento' });
      }
    } catch (error) {
      console.error('Erro ao marcar pagamento como pago:', error);
      setMessage({ type: 'error', text: 'Erro ao marcar pagamento como pago' });
    } finally {
      setLoadingPayments(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  // Gerar pagamentos mensais
  const generateMonthlyPayments = async () => {
    const referenceMonth = prompt('Digite o mês de referência (YYYY-MM):');
    const monthlyAmount = prompt('Digite o valor mensal (ex: 49.90):');
    const dueDay = prompt('Digite o dia de vencimento (1-31):');

    if (!referenceMonth || !monthlyAmount || !dueDay) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/payments/generate-monthly', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          referenceMonth,
          monthlyAmount: parseFloat(monthlyAmount),
          dueDay: parseInt(dueDay)
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await loadPayments();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao gerar pagamentos' });
      }
    } catch (error) {
      console.error('Erro ao gerar pagamentos mensais:', error);
      setMessage({ type: 'error', text: 'Erro ao gerar pagamentos mensais' });
    }
  };

  // Atualizar pagamentos em atraso
  const updateOverduePayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/payments/update-overdue', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await loadPayments();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao atualizar pagamentos' });
      }
    } catch (error) {
      console.error('Erro ao atualizar pagamentos em atraso:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar pagamentos em atraso' });
    }
  };

  // Gerar senha forte
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  // Criar novo cliente
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setLastCreatedCredentials(null);

    try {
      const response = await apiRequest('/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Cliente criado com sucesso!' });
        setLastCreatedCredentials({
          email: data.data.user.email,
          password: '***REMOVIDO POR SEGURANÇA***',
          loginUrl: data.data.loginUrl
        });
        setShowCreateForm(false);
        setFormData({
          email: '',
          password: '',
          name: '',
          restaurantName: '',
          restaurantAddress: '',
          phone: '',
          monthlyAmount: '',
          paymentDay: ''
        });
        await loadClients();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao criar cliente' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copiar para clipboard
  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(text);
        setTimeout(() => setCopiedEmail(null), 2000);
      } else {
        setCopiedPassword(text);
        setTimeout(() => setCopiedPassword(null), 2000);
      }
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  // Desativar cliente
  const deactivateClient = async (clientId: string) => {
    if (!confirm('Tem certeza que deseja pausar este cliente? Ele não poderá fazer login até ser reativado.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/clients/${clientId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Cliente pausado com sucesso' });
        await loadClients();
        await loadDeactivatedClients();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao pausar cliente' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    }
  };

  // Reativar cliente
  const reactivateClient = async (clientId: string) => {
    if (!confirm('Tem certeza que deseja reativar este cliente?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/clients/${clientId}/reactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Cliente reativado com sucesso' });
        await loadClients();
        await loadDeactivatedClients();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao reativar cliente' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    }
  };

  // Excluir cliente permanentemente
  const deleteClient = async (clientId: string) => {
    const confirmDelete = confirm('⚠️ ATENÇÃO: Esta ação irá excluir permanentemente o cliente e TODOS os dados relacionados (restaurantes, contas, inventário, eventos).\n\nEsta ação NÃO PODE ser desfeita!\n\nTem certeza que deseja continuar?');
    if (!confirmDelete) return;

    const doubleConfirm = confirm('Digite "EXCLUIR" para confirmar a exclusão permanente:');
    if (!doubleConfirm) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Cliente excluído permanentemente' });
        await loadClients();
        await loadDeactivatedClients();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao excluir cliente' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    }
  };

  // Abrir modal de edição
  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setEditFormData({
      name: client.name,
      email: client.email,
      restaurantName: client.restaurants[0]?.name || '',
      restaurantAddress: client.restaurants[0]?.address || '',
      phone: client.restaurants[0]?.phone || '',
      monthlyAmount: client.nextPayment?.amount.toString() || '',
      paymentDay: client.nextPayment?.dueDate.split('-').pop() || ''
    });
    setShowEditForm(true);
  };

  // Editar cliente
  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Cliente atualizado com sucesso!' });
        setShowEditForm(false);
        setEditingClient(null);
        await loadClients();
        await loadDeactivatedClients();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao atualizar cliente' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Criar pagamento para cliente específico
  const openCreatePaymentModal = (clientId: string, clientName: string) => {
    setSelectedClientForPayment({ id: clientId, name: clientName });
    
    // Pré-preencher campos com valores padrão
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
    const referenceMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
    
    setPaymentFormData({
      amount: '49.90',
      dueDate: nextMonth.toISOString().split('T')[0],
      type: 'MONTHLY',
      description: `Mensalidade ${referenceMonth}`,
      referenceMonth: referenceMonth
    });
    
    setShowCreatePaymentModal(true);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForPayment) return;
    
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: selectedClientForPayment.id,
          amount: parseFloat(paymentFormData.amount),
          dueDate: new Date(paymentFormData.dueDate).toISOString(),
          type: paymentFormData.type,
          description: paymentFormData.description,
          referenceMonth: paymentFormData.type === 'MONTHLY' ? paymentFormData.referenceMonth : null
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Pagamento criado para ${selectedClientForPayment.name}!` });
        setShowCreatePaymentModal(false);
        setSelectedClientForPayment(null);
        setPaymentFormData({
          amount: '',
          dueDate: '',
          type: 'MONTHLY',
          description: '',
          referenceMonth: ''
        });
        await loadClients();
        await loadPayments();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao criar pagamento' });
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      setMessage({ type: 'error', text: 'Erro ao criar pagamento' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadClients();
      loadDeactivatedClients();
      loadPayments();
    }
  }, [isAuthenticated]);

  // Tela de carregamento
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, não renderizar nada (redirecionamento em andamento)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header com informações do admin */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-green-600" />
            Administração de Clientes
          </h1>
          <p className="text-gray-600">Gerencie os clientes do sistema de restaurantes</p>
          {userInfo && (
            <div className="mt-2 text-sm text-gray-500">
              Logado como: <span className="font-medium">{userInfo.name}</span> ({userInfo.email})
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Cliente
          </button>
          
          <button
            onClick={() => setShowDeactivated(!showDeactivated)}
            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showDeactivated 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {showDeactivated ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {showDeactivated ? 'Ver Ativos' : 'Ver Pausados'}
          </button>
          
          <button
            onClick={() => {
              setShowPayments(!showPayments);
              setShowDeactivated(false);
            }}
            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showPayments 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <span className="text-lg">💰</span>
            {showPayments ? 'Ver Clientes' : 'Pagamentos'}
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mensagens */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <AlertCircle className="w-5 h-5" />
          {message.text}
        </div>
      )}

      {/* Credenciais do último cliente criado */}
      {lastCreatedCredentials && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            ✅ Cliente criado! Envie essas credenciais:
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Email:</span>
              <code className="bg-blue-100 px-2 py-1 rounded">{lastCreatedCredentials.email}</code>
              <button
                onClick={() => copyToClipboard(lastCreatedCredentials.email, 'email')}
                className="text-blue-600 hover:text-blue-800"
              >
                {copiedEmail === lastCreatedCredentials.email ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Senha:</span>
              <code className="bg-blue-100 px-2 py-1 rounded">{lastCreatedCredentials.password}</code>
              <button
                onClick={() => copyToClipboard(lastCreatedCredentials.password, 'password')}
                className="text-blue-600 hover:text-blue-800"
              >
                {copiedPassword === lastCreatedCredentials.password ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">URL de Login:</span>
              <code className="bg-blue-100 px-2 py-1 rounded">{lastCreatedCredentials.loginUrl}</code>
              <button
                onClick={() => copyToClipboard(lastCreatedCredentials.loginUrl, 'email')}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setLastCreatedCredentials(null)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Lista de clientes */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            {showDeactivated 
              ? `Clientes Pausados (${deactivatedClients.length})`
              : `Clientes Ativos (${clients.length})`
            }
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {showDeactivated 
              ? 'Clientes que foram pausados e não podem fazer login'
              : 'Clientes ativos que podem acessar o sistema'
            }
          </p>
        </div>

        {/* Seção de Controle de Pagamentos */}
        {showPayments ? (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    Controle de Pagamentos
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Gerencie pagamentos de licenças e mensalidades dos clientes
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={generateMonthlyPayments}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <span>📅</span>
                    Gerar Mensalidades
                  </button>
                  <button
                    onClick={updateOverduePayments}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <span>⚠️</span>
                    Atualizar Vencidos
                  </button>
                </div>
              </div>
            </div>

            {/* Estatísticas de Pagamentos */}
            {paymentStats && (
              <div className="p-6 border-b bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800">Recebidos</h3>
                    <p className="text-2xl font-bold text-green-900">{paymentStats.paid || 0}</p>
                    <p className="text-sm text-green-700">€{(paymentStats.totalReceived || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-800">Pendentes</h3>
                    <p className="text-2xl font-bold text-yellow-900">{paymentStats.pending || 0}</p>
                    <p className="text-sm text-yellow-700">€{(paymentStats.totalPending || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-red-800">Vencidos</h3>
                    <p className="text-2xl font-bold text-red-900">{paymentStats.overdue || 0}</p>
                    <p className="text-sm text-red-700">€{(paymentStats.totalOverdue || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800">Total</h3>
                    <p className="text-2xl font-bold text-blue-900">{paymentStats.total || 0}</p>
                    <p className="text-sm text-blue-700">pagamentos</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Pagamentos */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.clientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.clientEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{payment.description}</div>
                        {payment.referenceMonth && (
                          <div className="text-xs text-gray-500">
                            Ref: {payment.referenceMonth}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          €{parseFloat(payment.amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'PAID' 
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status === 'PAID' ? 'Pago' : 
                           payment.status === 'OVERDUE' ? 'Vencido' : 'Pendente'}
                        </span>
                        {payment.paidDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Pago em: {new Date(payment.paidDate).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.status !== 'PAID' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => markPaymentAsPaid(payment.id, 'CASH')}
                              disabled={loadingPayments[payment.id]}
                              className="text-green-600 hover:text-green-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Marcar como pago em dinheiro"
                            >
                              {loadingPayments[payment.id] ? '⏳' : '💵'} Dinheiro
                            </button>
                            <button
                              onClick={() => markPaymentAsPaid(payment.id, 'BANK_TRANSFER')}
                              disabled={loadingPayments[payment.id]}
                              className="text-blue-600 hover:text-blue-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Marcar como pago por transferência"
                            >
                              {loadingPayments[payment.id] ? '⏳' : '🏦'} Transferência
                            </button>
                          </div>
                        )}
                        {payment.status === 'PAID' && payment.paymentMethod && (
                          <div className="text-xs text-gray-500">
                            via {payment.paymentMethod === 'CASH' ? 'Dinheiro' : 'Transferência'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">💳</span>
                  Nenhum pagamento encontrado
                </div>
              )}
            </div>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próximo Pagamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {(showDeactivated ? deactivatedClients : clients).map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                        <div className="text-xs text-gray-400">
                          Criado em: {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{client.restaurants[0]?.name}</div>
                      <div className="text-sm text-gray-500">{client.restaurants[0]?.address}</div>
                    </div>
                  </td>
                    <td className="px-6 py-4">
                      {client.nextPayment ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            €{parseFloat(client.nextPayment.amount.toString()).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Venc: {new Date(client.nextPayment.dueDate).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-xs text-gray-600">
                            {client.nextPayment.description}
                          </div>
                          {client.nextPayment.referenceMonth && (
                            <div className="text-xs text-gray-500">
                              Ref: {client.nextPayment.referenceMonth}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Nenhum pagamento pendente
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4">
                      {client.nextPayment ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          client.nextPayment.isOverdue
                            ? 'bg-red-100 text-red-800'
                            : client.nextPayment.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {client.nextPayment.isOverdue ? 'Vencido' : 
                           client.nextPayment.status === 'PENDING' ? 'Pendente' : 'Pago'}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Em dia
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!showDeactivated ? (
                          // Botões para clientes ativos
                          <>
                            {/* Botões de pagamento */}
                            {client.nextPayment && client.nextPayment.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => markPaymentAsPaid(client.nextPayment!.id, 'CASH')}
                                  disabled={loadingPayments[client.nextPayment.id]}
                                  className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Marcar como pago em dinheiro"
                                >
                                  {loadingPayments[client.nextPayment.id] ? '⏳' : '💵'} Dinheiro
                                </button>
                                <button
                                  onClick={() => markPaymentAsPaid(client.nextPayment!.id, 'BANK_TRANSFER')}
                                  disabled={loadingPayments[client.nextPayment.id]}
                                  className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Marcar como pago por transferência"
                                >
                                  {loadingPayments[client.nextPayment.id] ? '⏳' : '🏦'} Transfer.
                                </button>
                              </>
                            )}
                            
                            {/* Botão para criar novo pagamento */}
                            <button
                              onClick={() => openCreatePaymentModal(client.id, client.name)}
                              className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 rounded hover:bg-purple-50"
                              title="Criar novo pagamento para este cliente"
                            >
                              💰 + Pagamento
                            </button>
                            
                            <button
                              onClick={() => openEditModal(client)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
                              title="Editar cliente"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="hidden md:inline">Editar</span>
                            </button>
                    <button
                      onClick={() => deactivateClient(client.id)}
                              className="text-orange-600 hover:text-orange-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-50"
                              title="Pausar cliente (não poderá fazer login)"
                    >
                              <Pause className="w-4 h-4" />
                              <span className="hidden md:inline">Pausar</span>
                    </button>
                          </>
                        ) : (
                          // Botões para clientes pausados
                          <>
                            <button
                              onClick={() => reactivateClient(client.id)}
                              className="text-green-600 hover:text-green-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-green-50"
                              title="Reativar cliente"
                            >
                              <Play className="w-4 h-4" />
                              <span className="hidden md:inline">Reativar</span>
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
                          title="Excluir permanentemente"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden md:inline">Excluir</span>
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            
            {(showDeactivated ? deactivatedClients : clients).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {showDeactivated 
                  ? 'Nenhum cliente pausado encontrado'
                  : 'Nenhum cliente ativo encontrado'
                }
        </div>
            )}
          </div>
        )}
      </div>

      {/* Modal criar cliente */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Criar Novo Cliente</h3>
              
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-20"
                      required
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-blue-500 hover:text-blue-700 text-xs"
                        title="Gerar senha"
                      >
                        🎲
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Restaurante
                  </label>
                  <input
                    type="text"
                    value={formData.restaurantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço do Restaurante
                  </label>
                  <input
                    type="text"
                    value={formData.restaurantAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantAddress: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone (opcional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      💰 Valor Mensal (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monthlyAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyAmount: e.target.value }))}
                      placeholder="49.90"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📅 Dia de Vencimento
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.paymentDay}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentDay: e.target.value }))}
                      placeholder="15"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Cliente'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 text-gray-600 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar cliente */}
      {showEditForm && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Editar Cliente</h3>
              
              <form onSubmit={handleEditClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Restaurante
                  </label>
                  <input
                    type="text"
                    value={editFormData.restaurantName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço do Restaurante
                  </label>
                  <input
                    type="text"
                    value={editFormData.restaurantAddress}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, restaurantAddress: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone (opcional)
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      💰 Valor Mensal (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editFormData.monthlyAmount}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, monthlyAmount: e.target.value }))}
                      placeholder="49.90"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📅 Dia de Vencimento
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={editFormData.paymentDay}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, paymentDay: e.target.value }))}
                      placeholder="15"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingClient(null);
                    }}
                    className="px-6 py-3 text-gray-600 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal criar pagamento */}
      {showCreatePaymentModal && selectedClientForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Criar Novo Pagamento</h3>
              
              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.dueDate}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={paymentFormData.type}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="MONTHLY">Mensalidade</option>
                    <option value="LICENSE">Licença</option>
                    <option value="SETUP">Setup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.description}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Pagamento'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreatePaymentModal(false)}
                    className="px-6 py-3 text-gray-600 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 