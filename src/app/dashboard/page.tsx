'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Calculator, 
  Package, 
  TrendingUp, 
  Users, 
  Settings,
  LogOut,
  ArrowUpRight,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Clock,
  FileText
} from 'lucide-react';
import { useEventListener, useEventEmitter } from '../../hooks/useEventBus';

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  color?: string;
}

interface DashboardData {
  stats: {
    dailyRevenue: number;
    orders: number;
    appointments: number;
    weeklyProfit: number;
  };
  summary: {
    pendingPayables: number;
    overduePayables: number;
    pendingReceivables: number;
    lowStockItems: number;
    pendingPurchases: number;
    upcomingEvents: number;
  };
  accounts: {
    payable: any[];
    receivable: any[];
  };
  inventory: any[];
  purchases: any[];
  events: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { emitSuccess, emitError } = useEventEmitter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to restaurant selection events
  useEventListener('RESTAURANT_SELECTED', ({ restaurant }) => {
    console.log('🎯 Dashboard: Restaurante selecionado via EventBus', restaurant);
    setRestaurant(restaurant);
    if (restaurant.id) {
      fetchDashboardData(restaurant.id);
    }
  });

  // Listen to financial account events
  useEventListener('FINANCIAL_ACCOUNT_CREATED', ({ account }) => {
    console.log('💰 Dashboard: Nova conta financeira criada', account);
    emitSuccess('Dashboard aktualisiert nach neuer Kontenerstellung', 'Dashboard');
    // Refresh dashboard data
    if (restaurant?.id) {
      fetchDashboardData(restaurant.id);
    }
  });

  // Listen to employee events
  useEventListener('EMPLOYEE_CREATED', ({ employee }) => {
    console.log('👥 Dashboard: Novo funcionário criado', employee);
    emitSuccess('Dashboard aktualisiert nach Mitarbeiter-Hinzufügung', 'Dashboard');
    // Update employee count or refresh data
    if (restaurant?.id) {
      fetchDashboardData(restaurant.id);
    }
  });

  // Listen to calendar events
  useEventListener('CALENDAR_EVENT_CREATED', ({ event }) => {
    console.log('📅 Dashboard: Novo evento no calendário', event);
    emitSuccess('Dashboard aktualisiert nach Ereignis-Erstellung', 'Dashboard');
    // Update upcoming events count
    if (restaurant?.id) {
      fetchDashboardData(restaurant.id);
    }
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const selectedRestaurant = localStorage.getItem('selectedRestaurant');
      
      if (!token) {
        router.push('/login');
        return;
      }

      if (!selectedRestaurant) {
        router.push('/restaurants');
        return;
      }

      try {
        const restaurantData = JSON.parse(selectedRestaurant);
        setRestaurant(restaurantData);
        fetchDashboardData(restaurantData.id);
      } catch (error) {
        console.error('Error parsing restaurant data:', error);
        router.push('/restaurants');
      }
    };

    checkAuth();
  }, [router]);

  const fetchDashboardData = async (restaurantId: string) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fazendo requisição para dashboard:', { restaurantId, hasToken: !!token });
      
      const response = await fetch(`http://localhost:3001/api/dashboard/${restaurantId}/data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard data recebido:', data);
        setDashboardData(data.data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta do dashboard:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Se for erro 404 ou 403, vamos tentar redirecionar para seleção de restaurante
        if (response.status === 404 || response.status === 403) {
          console.log('🔄 Redirecionando para seleção de restaurante devido ao erro');
          localStorage.removeItem('selectedRestaurant');
          router.push('/restaurants');
          return;
        }
      }
    } catch (error) {
      console.error('❌ Erro de rede ao buscar dados do dashboard:', error);
      
      // Se há erro de rede, pode ser que o backend esteja fora do ar
      // Vamos tentar novamente em alguns segundos ou redirecionar para login
      setTimeout(() => {
        console.log('🔄 Tentando novamente...');
        fetchDashboardData(restaurantId);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRestaurant = () => {
    localStorage.removeItem('selectedRestaurant');
    router.push('/restaurants');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedRestaurant');
    router.push('/login');
  };

  const handleNavigateToKonten = () => {
    router.push('/konten');
  };

  const handleNavigateToInventar = () => {
    router.push('/inventar');
  };

  const handleNavigateToEinkaufe = () => {
    router.push('/einkaufe');
  };

  const handleNavigateToPersonal = () => {
    router.push('/personal');
  };

  const handleNavigateToCalendar = () => {
    router.push('/calendar');
  };

  const handleNavigateToSettings = () => {
    router.push('/settings');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!restaurant || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Fehler beim Laden der Daten
          </h2>
          <p className="text-gray-600 mb-6">
            {!restaurant 
              ? 'Restaurantdaten konnten nicht geladen werden.' 
              : 'Dashboard-Daten konnten nicht geladen werden.'
            }
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Seite neu laden
            </button>
            <button
              onClick={handleSwitchRestaurant}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Restaurant wechseln
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              Abmelden
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Öffnen Sie die Entwicklertools (F12) für weitere Details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Restaurant Info */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: restaurant.color || '#d96d62' }}
              >
                {restaurant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-gray-600 text-sm">{restaurant.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSwitchRestaurant}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Restaurant wechseln
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tagesumsatz</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.stats.dailyRevenue)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Bestellungen</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.orders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Termine</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.appointments}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Wochengewinn</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.stats.weeklyProfit)}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardData.summary.overduePayables > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="font-medium text-red-900">Überfällige Zahlungen</p>
                  <p className="text-sm text-red-700">{dashboardData.summary.overduePayables} Rechnung(en)</p>
                </div>
              </div>
            </div>
          )}

          {dashboardData.summary.lowStockItems > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="font-medium text-yellow-900">Niedriger Lagerbestand</p>
                  <p className="text-sm text-yellow-700">{dashboardData.summary.lowStockItems} Artikel</p>
                </div>
              </div>
            </div>
          )}

          {dashboardData.summary.upcomingEvents > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="font-medium text-blue-900">Anstehende Termine</p>
                  <p className="text-sm text-blue-700">{dashboardData.summary.upcomingEvents} Event(s)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            onClick={handleNavigateToCalendar}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Kalender</h3>
                <p className="text-gray-600 text-sm">Termine und Events verwalten</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleNavigateToKonten}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calculator className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Konten</h3>
                <p className="text-gray-600 text-sm">Finanzen und Buchhaltung</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleNavigateToInventar}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Inventar</h3>
                <p className="text-gray-600 text-sm">Lagerbestand verwalten</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleNavigateToEinkaufe}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <ShoppingCart className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Einkäufe</h3>
                <p className="text-gray-600 text-sm">Bestellungen und Lieferanten</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleNavigateToPersonal}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Personal</h3>
                <p className="text-gray-600 text-sm">Mitarbeiter verwalten</p>
              </div>
            </div>
          </div>

          <div 
            onClick={handleNavigateToSettings}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Settings className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Einstellungen</h3>
                <p className="text-gray-600 text-sm">System konfigurieren</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Data Preview */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Accounts */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Aktuelle Konten</h3>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {dashboardData.accounts.payable.slice(0, 3).map((account, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{account.description}</p>
                    <p className="text-xs text-gray-500">{account.vendor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(account.amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      account.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      account.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {account.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Lagerbestand</h3>
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {dashboardData.inventory.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{item.quantity} {item.unit}</p>
                    {item.quantity <= item.minQuantity && (
                      <span className="text-xs text-red-600">Niedrig</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 