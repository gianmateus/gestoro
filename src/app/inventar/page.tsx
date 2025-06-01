'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Package,
  ShoppingCart,
  Calendar,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  Scale,
  FileText
} from 'lucide-react';
import { useEventEmitter } from '../../hooks/useEventBus';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  weeklyNeed: number;
  minStock: number;
  lastUpdated: string;
  supplier?: string;
}

interface InventoryData {
  items: InventoryItem[];
  categories: string[];
  summary: {
    totalItems: number;
    lowStockItems: number;
    overstockedItems: number;
    needToBuy: number;
  };
}

export default function InventarPage() {
  const router = useRouter();
  const { emitInventoryLowStock, emitWarning, emitInfo } = useEventEmitter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNeedModal, setShowNeedModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
        fetchInventoryData(restaurantData.id);
      } catch (error) {
        console.error('Error parsing restaurant data:', error);
        router.push('/restaurants');
      }
    };

    checkAuth();
  }, [router]);

  const fetchInventoryData = async (restaurantId: string) => {
    try {
      // Mock data - em produção seria uma API call
      const mockData: InventoryData = {
        items: [
          {
            id: '1',
            name: 'Kartoffeln',
            category: 'Gemüse',
            unit: 'kg',
            currentStock: 5.5,
            weeklyNeed: 10.0,
            minStock: 3.0,
            lastUpdated: '2024-01-15',
            supplier: 'Gemüse Wagner'
          },
          {
            id: '2',
            name: 'San Marzano Tomaten',
            category: 'Gemüse',
            unit: 'kg',
            currentStock: 15.5,
            weeklyNeed: 8.0,
            minStock: 5.0,
            lastUpdated: '2024-01-14',
            supplier: 'Italien Import'
          },
          {
            id: '3',
            name: 'Parmigiano Reggiano',
            category: 'Käse',
            unit: 'kg',
            currentStock: 3.2,
            weeklyNeed: 2.5,
            minStock: 1.0,
            lastUpdated: '2024-01-13',
            supplier: 'Käse Meister'
          },
          {
            id: '4',
            name: 'Olivenöl Extra Vergine',
            category: 'Öle',
            unit: 'Liter',
            currentStock: 2.8,
            weeklyNeed: 4.0,
            minStock: 2.0,
            lastUpdated: '2024-01-12',
            supplier: 'Italien Import'
          },
          {
            id: '5',
            name: 'Basilikum frisch',
            category: 'Kräuter',
            unit: 'Bund',
            currentStock: 12,
            weeklyNeed: 20,
            minStock: 5,
            lastUpdated: '2024-01-15',
            supplier: 'Kräuter Franz'
          }
        ],
        categories: ['Gemüse', 'Käse', 'Öle', 'Kräuter', 'Fleisch', 'Fisch', 'Gewürze'],
        summary: {
          totalItems: 5,
          lowStockItems: 2,
          overstockedItems: 1,
          needToBuy: 3
        }
      };

      setInventoryData(mockData);
      
      // Check for low stock items and emit events
      const lowStockItems = mockData.items.filter(item => item.currentStock <= item.minStock);
      const needToBuyItems = mockData.items.filter(item => item.weeklyNeed > item.currentStock);
      
      if (lowStockItems.length > 0) {
        lowStockItems.forEach(item => {
          emitInventoryLowStock(item);
        });
        emitWarning(`${lowStockItems.length} Artikel haben niedrigen Bestand!`, 'Inventar');
      }
      
      if (needToBuyItems.length > 0) {
        emitInfo(`${needToBuyItems.length} Artikel müssen nachbestellt werden`, 'Inventar');
      }
      
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const getStockStatus = (item: InventoryItem) => {
    const needed = item.weeklyNeed - item.currentStock;
    if (item.currentStock <= item.minStock) return 'low';
    if (needed > 0) return 'need';
    if (item.currentStock > item.weeklyNeed * 1.5) return 'overstock';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-red-100 text-red-800';
      case 'need': return 'bg-yellow-100 text-yellow-800';
      case 'overstock': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'low': return 'Niedrig';
      case 'need': return 'Bedarf';
      case 'overstock': return 'Überbestand';
      case 'good': return 'Gut';
      default: return 'Unbekannt';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low': return <AlertTriangle className="w-4 h-4" />;
      case 'need': return <Clock className="w-4 h-4" />;
      case 'overstock': return <TrendingDown className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const filteredItems = inventoryData?.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.supplier?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Inventardaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventar & Lagerbestand</h1>
                <p className="text-gray-600">{restaurant?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowNeedModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Bedarf verwalten</span>
              </button>
              <button 
                onClick={() => setShowStockModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Bestand erfassen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Artikel gesamt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventoryData?.summary.totalItems || 0}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Niedriger Bestand</p>
                <p className="text-2xl font-bold text-red-600">
                  {inventoryData?.summary.lowStockItems || 0}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Kaufen erforderlich</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {inventoryData?.summary.needToBuy || 0}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Überbestand</p>
                <p className="text-2xl font-bold text-blue-600">
                  {inventoryData?.summary.overstockedItems || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Artikel durchsuchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Alle Kategorien</option>
                {inventoryData?.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Inventar Artikel</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artikel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktueller Bestand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wochenbedarf
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zu kaufen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  const needToBuy = Math.max(0, item.weeklyNeed - item.currentStock);
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.supplier && (
                          <div className="text-sm text-gray-500">
                            {item.supplier}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          Zuletzt: {new Date(item.lastUpdated).toLocaleDateString('de-DE')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.currentStock} {item.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {item.minStock} {item.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.weeklyNeed} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          needToBuy > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {needToBuy > 0 ? `${needToBuy.toFixed(1)} ${item.unit}` : 'Ausreichend'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="ml-1">{getStatusText(status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Need Management Modal */}
      {showNeedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Wochenbedarf verwalten</h3>
              </div>
              <button
                onClick={() => setShowNeedModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artikel Name
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. Kartoffeln, Tomaten..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Kategorie auswählen</option>
                    {inventoryData?.categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wochenbedarf
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="10.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Einheit
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="kg">Kilogramm (kg)</option>
                    <option value="g">Gramm (g)</option>
                    <option value="Liter">Liter</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="Stück">Stück</option>
                    <option value="Bund">Bund</option>
                    <option value="Packung">Packung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mindestbestand
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="3.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieferant (optional)
                </label>
                <input
                  type="text"
                  placeholder="Name des bevorzugten Lieferanten"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNeedModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Bedarf speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Recording Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Aktuellen Bestand erfassen</h3>
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 text-sm">
                Wählen Sie einen Artikel aus der Liste und tragen Sie den aktuellen Bestand ein:
              </p>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artikel auswählen
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="">Artikel auswählen...</option>
                  {inventoryData?.items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.unit}) - Aktuell: {item.currentStock} {item.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Neuer Bestand
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inventur Datum
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bemerkungen (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Notizen zur Inventur..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Bestand aktualisieren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 