'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  ShoppingCart,
  Package,
  Truck,
  Calendar,
  Check,
  X,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Download,
  Filter
} from 'lucide-react';
import { useEventEmitter } from '../../hooks/useEventBus';

// Declaração para o EventBus global
declare global {
  interface Window {
    eventBus?: any;
  }
}

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  neededAmount: number;
  currentStock: number;
  weeklyNeed: number;
  minStock: number;
  supplier?: string;
  supplierContact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  estimatedPrice?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'ordered' | 'delivered' | 'cancelled';
  orderDate?: string;
  expectedDelivery?: string;
  notes?: string;
  isCustom?: boolean;
}

interface Supplier {
  id: string;
  name: string;
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  categories: string[];
  rating: number;
  deliveryTime: string;
}

interface EinkaufeData {
  shoppingList: ShoppingItem[];
  suppliers: Supplier[];
  summary: {
    totalItems: number;
    urgentItems: number;
    estimatedCost: number;
    pendingOrders: number;
  };
}

export default function EinkaufePage() {
  const router = useRouter();
  const { emitSuccess, emitError } = useEventEmitter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [einkaufeData, setEinkaufeData] = useState<EinkaufeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Estados para o modal de novo produto
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    unit: 'kg',
    neededAmount: 1,
    supplier: '',
    estimatedPrice: 0,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: ''
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
        fetchEinkaufeData(restaurantData.id);
      } catch (error) {
        console.error('Error parsing restaurant data:', error);
        router.push('/restaurants');
      }
    };

    checkAuth();
  }, [router]);

  const fetchEinkaufeData = async (restaurantId: string) => {
    try {
      // Mock data baseado no inventário - em produção seria uma API call
      const mockData: EinkaufeData = {
        shoppingList: [
          {
            id: '1',
            name: 'Kartoffeln',
            category: 'Gemüse',
            unit: 'kg',
            neededAmount: 4.5,
            currentStock: 5.5,
            weeklyNeed: 10.0,
            minStock: 3.0,
            supplier: 'Gemüse Wagner',
            supplierContact: {
              phone: '+49 30 12345678',
              email: 'bestellung@gemuese-wagner.de',
              address: 'Marktstraße 15, 10115 Berlin'
            },
            estimatedPrice: 2.80,
            priority: 'medium',
            status: 'pending'
          },
          {
            id: '2',
            name: 'Basilikum frisch',
            category: 'Kräuter',
            unit: 'Bund',
            neededAmount: 8,
            currentStock: 12,
            weeklyNeed: 20,
            minStock: 5,
            supplier: 'Kräuter Franz',
            supplierContact: {
              phone: '+49 30 87654321',
              email: 'info@krauter-franz.de'
            },
            estimatedPrice: 1.50,
            priority: 'high',
            status: 'pending'
          },
          {
            id: '3',
            name: 'Olivenöl Extra Vergine',
            category: 'Öle',
            unit: 'Liter',
            neededAmount: 1.2,
            currentStock: 2.8,
            weeklyNeed: 4.0,
            minStock: 2.0,
            supplier: 'Italien Import',
            supplierContact: {
              phone: '+49 30 11223344',
              email: 'order@italien-import.de'
            },
            estimatedPrice: 15.90,
            priority: 'low',
            status: 'ordered',
            orderDate: '2024-01-14',
            expectedDelivery: '2024-01-16'
          },
          {
            id: '4',
            name: 'Mozzarella di Bufala',
            category: 'Käse',
            unit: 'kg',
            neededAmount: 2.0,
            currentStock: 0.5,
            weeklyNeed: 2.5,
            minStock: 1.0,
            supplier: 'Käse Meister',
            estimatedPrice: 12.50,
            priority: 'urgent',
            status: 'pending',
            notes: 'Bestand sehr niedrig!'
          }
        ],
        suppliers: [
          {
            id: '1',
            name: 'Gemüse Wagner',
            contact: {
              phone: '+49 30 12345678',
              email: 'bestellung@gemuese-wagner.de',
              address: 'Marktstraße 15, 10115 Berlin'
            },
            categories: ['Gemüse', 'Obst'],
            rating: 4.5,
            deliveryTime: '1-2 Tage'
          },
          {
            id: '2',
            name: 'Kräuter Franz',
            contact: {
              phone: '+49 30 87654321',
              email: 'info@krauter-franz.de'
            },
            categories: ['Kräuter', 'Gewürze'],
            rating: 4.8,
            deliveryTime: '1 Tag'
          },
          {
            id: '3',
            name: 'Italien Import',
            contact: {
              phone: '+49 30 11223344',
              email: 'order@italien-import.de'
            },
            categories: ['Öle', 'Pasta', 'Käse'],
            rating: 4.3,
            deliveryTime: '2-3 Tage'
          },
          {
            id: '4',
            name: 'Käse Meister',
            contact: {
              phone: '+49 30 55667788',
              email: 'bestellung@kaese-meister.de'
            },
            categories: ['Käse', 'Molkereiprodukte'],
            rating: 4.7,
            deliveryTime: '1-2 Tage'
          }
        ],
        summary: {
          totalItems: 4,
          urgentItems: 1,
          estimatedCost: 56.20,
          pendingOrders: 3
        }
      };

      setEinkaufeData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching einkaufe data:', error);
      emitError('Fehler beim Laden der Einkaufsdaten', 'Einkäufe');
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleExportPDF = () => {
    // Would implement PDF export functionality
    // Würde PDF-Export-Funktionalität implementieren
    console.log('Exporting PDF...');
    alert('PDF-Export-Funktion würde hier implementiert werden');
  };

  // Nova função para adicionar produto personalizado
  const handleAddCustomProduct = () => {
    try {
      // Validação básica
      if (!newProduct.name.trim()) {
        emitError('Produktname ist erforderlich', 'Einkäufe');
        return;
      }

      if (!newProduct.category.trim()) {
        emitError('Kategorie ist erforderlich', 'Einkäufe');
        return;
      }

      if (newProduct.neededAmount <= 0) {
        emitError('Menge muss größer als 0 sein', 'Einkäufe');
        return;
      }

      // Criar novo produto
      const customProduct: ShoppingItem = {
        id: Date.now().toString(),
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        unit: newProduct.unit,
        neededAmount: newProduct.neededAmount,
        currentStock: 0,
        weeklyNeed: newProduct.neededAmount,
        minStock: 0,
        supplier: newProduct.supplier.trim() || 'Lieferant nicht angegeben',
        estimatedPrice: newProduct.estimatedPrice,
        priority: newProduct.priority,
        status: 'pending',
        notes: newProduct.notes.trim(),
        isCustom: true // Marca como produto customizado
      };

      // Atualizar a lista de compras
      if (einkaufeData) {
        const updatedShoppingList = [...einkaufeData.shoppingList, customProduct];
        
        // Atualizar estatísticas
        const updatedSummary = {
          ...einkaufeData.summary,
          totalItems: einkaufeData.summary.totalItems + 1,
          urgentItems: einkaufeData.summary.urgentItems + (newProduct.priority === 'urgent' ? 1 : 0),
          estimatedCost: einkaufeData.summary.estimatedCost + (newProduct.estimatedPrice * newProduct.neededAmount)
        };

        setEinkaufeData({
          ...einkaufeData,
          shoppingList: updatedShoppingList,
          summary: updatedSummary
        });
      }

      // Resetar formulário
      setNewProduct({
        name: '',
        category: '',
        unit: 'kg',
        neededAmount: 1,
        supplier: '',
        estimatedPrice: 0,
        priority: 'medium',
        notes: ''
      });

      // Fechar modal
      setShowAddProductModal(false);

      // Emitir eventos de sucesso
      emitSuccess(`Neues Produkt "${newProduct.name}" zur Einkaufsliste hinzugefügt`, 'Einkäufe');
      
      // Emitir evento personalizado para produtos customizados
      if (window.eventBus) {
        window.eventBus.emit('CUSTOM_PRODUCT_ADDED', {
          product: customProduct,
          category: newProduct.category,
          priority: newProduct.priority,
          totalCost: newProduct.estimatedPrice * newProduct.neededAmount,
          restaurantId: restaurant?.id,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('🛒 Produto customizado adicionado:', customProduct);

    } catch (error) {
      console.error('Error adding custom product:', error);
      emitError('Fehler beim Hinzufügen des Produkts: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'), 'Einkäufe');
    }
  };

  const handleBestellenOrder = () => {
    // Teste inicial para verificar se a função está sendo chamada
    console.log('🛒 FUNÇÃO BESTELLEN CHAMADA!');
    
    try {
      console.log('Botão Bestellen clicado!');
      console.log('Selected items:', selectedItems);
      console.log('Einkaufe data:', einkaufeData);

      if (selectedItems.length === 0) {
        alert('Bitte wählen Sie mindestens einen Artikel zum Bestellen aus!');
        return;
      }

      // Get all shopping list items for debugging
      const allItems = einkaufeData?.shoppingList || [];
      console.log('All items:', allItems);

      const itemsToOrder = allItems.filter(item => {
        const isSelected = selectedItems.includes(item.id);
        const isPending = item.status === 'pending';
        console.log(`Item ${item.name}: selected=${isSelected}, status=${item.status}, isPending=${isPending}`);
        return isSelected && isPending;
      });

      console.log('Items to order:', itemsToOrder);

      if (itemsToOrder.length === 0) {
        // Show more specific error message
        const selectedItemsDetails = allItems.filter(item => selectedItems.includes(item.id));
        if (selectedItemsDetails.length === 0) {
          alert('Keine Artikel ausgewählt!');
        } else {
          const nonPendingItems = selectedItemsDetails.filter(item => item.status !== 'pending');
          if (nonPendingItems.length > 0) {
            alert(`Ausgewählte Artikel können nicht bestellt werden:\n${nonPendingItems.map(item => `• ${item.name} (Status: ${getStatusText(item.status)})`).join('\n')}\n\nNur Artikel mit Status "Ausstehend" können bestellt werden.`);
          } else {
            alert('Keine bestellbaren Artikel ausgewählt! (Nur ausstehende Artikel können bestellt werden)');
          }
        }
        return;
      }

      // Group items by supplier
      const ordersBySupplier: { [supplier: string]: ShoppingItem[] } = {};
      itemsToOrder.forEach(item => {
        const supplier = item.supplier || 'Unbekannter Lieferant';
        if (!ordersBySupplier[supplier]) {
          ordersBySupplier[supplier] = [];
        }
        ordersBySupplier[supplier].push(item);
      });

      // Calculate totals
      const totalItems = itemsToOrder.length;
      const totalCost = itemsToOrder.reduce((sum, item) => sum + ((item.estimatedPrice || 0) * item.neededAmount), 0);
      const suppliersCount = Object.keys(ordersBySupplier).length;

      // Create order summary
      let orderSummary = `🛒 BESTELLUNG BESTÄTIGT\n\n`;
      orderSummary += `📋 Zusammenfassung:\n`;
      orderSummary += `• Artikel: ${totalItems}\n`;
      orderSummary += `• Lieferanten: ${suppliersCount}\n`;
      orderSummary += `• Geschätzte Kosten: ${formatCurrency(totalCost)}\n\n`;

      orderSummary += `📦 Bestellungen nach Lieferant:\n\n`;
      
      Object.entries(ordersBySupplier).forEach(([supplier, items]) => {
        const supplierTotal = items.reduce((sum, item) => sum + ((item.estimatedPrice || 0) * item.neededAmount), 0);
        orderSummary += `🏪 ${supplier}:\n`;
        items.forEach(item => {
          orderSummary += `  • ${item.name}: ${item.neededAmount.toFixed(1)} ${item.unit}`;
          if (item.estimatedPrice) {
            orderSummary += ` (${formatCurrency(item.estimatedPrice * item.neededAmount)})`;
          }
          orderSummary += `\n`;
        });
        orderSummary += `  💰 Summe: ${formatCurrency(supplierTotal)}\n\n`;
      });

      orderSummary += `📅 Nächste Schritte:\n`;
      orderSummary += `• Status wurde auf "Bestellt" aktualisiert\n`;
      orderSummary += `• Lieferanten werden automatisch benachrichtigt\n`;
      orderSummary += `• Liefertermine werden verfolgt\n\n`;

      // Update item statuses to 'ordered'
      if (einkaufeData) {
        const updatedShoppingList = einkaufeData.shoppingList.map(item => {
          if (selectedItems.includes(item.id) && item.status === 'pending') {
            return {
              ...item,
              status: 'ordered' as const,
              orderDate: new Date().toISOString().split('T')[0],
              expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +2 days
            };
          }
          return item;
        });

        // Calculate new summary
        const newPendingItems = updatedShoppingList.filter(item => item.status === 'pending').length;
        const newOrderedItems = updatedShoppingList.filter(item => item.status === 'ordered').length;

        const updatedSummary = {
          ...einkaufeData.summary,
          totalItems: newPendingItems,
          pendingOrders: newOrderedItems
        };

        setEinkaufeData({
          ...einkaufeData,
          shoppingList: updatedShoppingList,
          summary: updatedSummary
        });

        console.log('Updated data:', { updatedShoppingList, updatedSummary });
      }

      // Clear selections
      setSelectedItems([]);

      // Emit events instead of alert
      emitSuccess(`Bestellung erfolgreich aufgegeben: ${totalItems} Artikel von ${suppliersCount} Lieferanten`, 'Einkäufe');
      
      // Emit purchase order created event
      const orderData = {
        id: Date.now().toString(),
        items: itemsToOrder,
        suppliers: Object.keys(ordersBySupplier),
        totalCost,
        totalItems,
        orderDate: new Date().toISOString()
      };
      
      // You could emit a custom event here for purchase orders
      console.log('📦 Pedido criado:', orderData);

    } catch (error) {
      console.error('Order error:', error);
      emitError('Fehler beim Verarbeiten der Bestellung: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'), 'Einkäufe');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Dringend';
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
      default: return 'Unbekannt';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'ordered': return 'Bestellt';
      case 'delivered': return 'Geliefert';
      case 'cancelled': return 'Storniert';
      default: return 'Unbekannt';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredItems = einkaufeData?.shoppingList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.supplier?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Einkaufsdaten...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Einkäufe & Bestellungen</h1>
                <p className="text-gray-600">{restaurant?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExportPDF}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportieren</span>
              </button>
              <button 
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Produto</span>
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
                <p className="text-gray-600 text-sm">Artikel zu kaufen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {einkaufeData?.summary.totalItems || 0}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Dringende Artikel</p>
                <p className="text-2xl font-bold text-red-600">
                  {einkaufeData?.summary.urgentItems || 0}
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
                <p className="text-gray-600 text-sm">Geschätzte Kosten</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(einkaufeData?.summary.estimatedCost || 0)}
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
                <p className="text-gray-600 text-sm">Offene Bestellungen</p>
                <p className="text-2xl font-bold text-blue-600">
                  {einkaufeData?.summary.pendingOrders || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600" />
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
                  placeholder="Artikel oder Lieferant durchsuchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Alle Prioritäten</option>
                <option value="urgent">Dringend</option>
                <option value="high">Hoch</option>
                <option value="medium">Mittel</option>
                <option value="low">Niedrig</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Alle Status</option>
                <option value="pending">Ausstehend</option>
                <option value="ordered">Bestellt</option>
                <option value="delivered">Geliefert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shopping List Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Einkaufsliste</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredItems.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artikel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Benötigt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieferant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kosten
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorität
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
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemSelect(item.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.isCustom && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            <Package className="w-3 h-3 mr-1" />
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.category}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-red-600 mt-1">
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.neededAmount.toFixed(1)} {item.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Aktuell: {item.currentStock} {item.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Bedarf: {item.weeklyNeed} {item.unit}/Woche
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.supplier || 'Kein Lieferant'}
                      </div>
                      {item.supplierContact?.phone && (
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {item.supplierContact.phone}
                        </div>
                      )}
                      {item.supplierContact?.email && (
                        <div className="text-xs text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {item.supplierContact.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.estimatedPrice ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.estimatedPrice * item.neededAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(item.estimatedPrice)}/{item.unit}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Preis unbekannt</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                        {getPriorityText(item.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                      {item.expectedDelivery && (
                        <div className="text-xs text-gray-500 mt-1">
                          Lieferung: {new Date(item.expectedDelivery).toLocaleDateString('de-DE')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for adding new product */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Novo Produto Personalizado</h2>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">Adicione um produto não típico à lista de compras</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome do Produto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Equipamento especial, Item decorativo..."
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Equipamentos">Equipamentos</option>
                    <option value="Utensílios">Utensílios</option>
                    <option value="Decoração">Decoração</option>
                    <option value="Limpeza Especial">Limpeza Especial</option>
                    <option value="Eletrônicos">Eletrônicos</option>
                    <option value="Mobiliário">Mobiliário</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                {/* Unidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidade
                  </label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="Stück">Stück (Peça)</option>
                    <option value="kg">kg</option>
                    <option value="Liter">Liter</option>
                    <option value="Meter">Meter</option>
                    <option value="Paket">Paket (Pacote)</option>
                    <option value="Box">Box</option>
                    <option value="Set">Set</option>
                  </select>
                </div>

                {/* Quantidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade Necessária *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="1"
                    value={newProduct.neededAmount}
                    onChange={(e) => setNewProduct({ ...newProduct, neededAmount: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Preço Estimado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Estimado (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newProduct.estimatedPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, estimatedPrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Fornecedor */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fornecedor Preferido
                  </label>
                  <input
                    type="text"
                    placeholder="Nome da empresa ou fornecedor..."
                    value={newProduct.supplier}
                    onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Prioridade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={newProduct.priority}
                    onChange={(e) => setNewProduct({ ...newProduct, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="low">🟢 Niedrig (Baixa)</option>
                    <option value="medium">🟡 Mittel (Média)</option>
                    <option value="high">🟠 Hoch (Alta)</option>
                    <option value="urgent">🔴 Dringend (Urgente)</option>
                  </select>
                </div>

                {/* Total Estimado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custo Total Estimado
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-lg font-semibold text-gray-900">
                    {formatCurrency(newProduct.estimatedPrice * newProduct.neededAmount)}
                  </div>
                </div>

                {/* Notas */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionais
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Informações adicionais sobre o produto, especificações, urgência..."
                    value={newProduct.notes}
                    onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer com botões */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddCustomProduct}
                  disabled={!newProduct.name.trim() || !newProduct.category.trim() || newProduct.neededAmount <= 0}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Produto Hinzufügen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 