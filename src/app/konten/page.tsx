'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter,
  Download,
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Receipt,
  Banknote,
  FileText,
  RefreshCw,
  Bell,
  ChevronDown,
  Building,
  User,
  MoreVertical
} from 'lucide-react';
import { useEventEmitter } from '../../hooks/useEventBus';

interface FinancialAccount {
  id: string;
  type: 'payable' | 'receivable';
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
  vendor?: string; // para contas a pagar
  customer?: string; // para contas a receber
  category: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoiceNumber?: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  attachments?: string[];
}

interface RecurringPayment {
  id: string;
  title: string;
  description?: string;
  amount: number;
  vendor: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every X days/weeks/months/years
  startDate: string;
  endDate?: string;
  totalOccurrences?: number;
  currentOccurrence: number;
  nextDueDate: string;
  lastPaidDate?: string;
  paymentMethod: string;
  isActive: boolean;
  reference?: string;
  notes?: string;
}

interface FinancialSummary {
  totalPayable: number;
  totalReceivable: number;
  overduePayable: number;
  overdueReceivable: number;
  monthlyRecurring: number;
  netFlow: number;
}

export default function KontenPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payable');
  const [payableAccounts, setPayableAccounts] = useState<FinancialAccount[]>([]);
  const [receivableAccounts, setReceivableAccounts] = useState<FinancialAccount[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<FinancialAccount | RecurringPayment | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountFormData, setAccountFormData] = useState({
    type: 'payable' as 'payable' | 'receivable',
    title: '',
    description: '',
    amount: '',
    dueDate: '',
    vendor: '',
    customer: '',
    category: '',
    status: 'pending' as 'pending' | 'paid' | 'overdue' | 'cancelled',
    invoiceNumber: '',
    paymentMethod: '',
    reference: '',
    notes: ''
  });

  const { emitFinancialAccountCreated, emitSuccess, emitError } = useEventEmitter();

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
        fetchFinancialData(restaurantData.id);
      } catch (error) {
        console.error('Error parsing restaurant data:', error);
        router.push('/restaurants');
      }
    };

    checkAuth();
  }, [router]);

  // Reset form when modal opens
  useEffect(() => {
    if (showAccountModal && !selectedAccount) {
      resetAccountForm();
    }
  }, [showAccountModal, selectedAccount, activeTab]);

  const fetchFinancialData = async (restaurantId: string) => {
    try {
      // Mock data para sistema financeiro
      const mockPayableAccounts: FinancialAccount[] = [
        {
          id: '1',
          type: 'payable',
          title: 'Fornecedor Italiano Ltda',
          description: 'Ingredientes frescos - Janeiro',
          amount: 2480.00,
          dueDate: '2024-01-25',
          vendor: 'Fornecedor Italiano Ltda',
          category: 'Ingredientes',
          status: 'pending',
          invoiceNumber: 'FI-2024-001',
          paymentMethod: 'Transferência',
          reference: 'COMPRA-001',
          notes: 'Prazo de pagamento: 30 dias'
        },
        {
          id: '2',
          type: 'payable',
          title: 'Energia Elétrica',
          description: 'Conta de luz - Janeiro 2024',
          amount: 380.00,
          dueDate: '2024-01-20',
          vendor: 'Energisa',
          category: 'Utilities',
          status: 'overdue',
          invoiceNumber: 'ENG-2024-001',
          paymentMethod: 'Débito automático',
          reference: 'ENERGIA-001'
        },
        {
          id: '3',
          type: 'payable',
          title: 'Seguradora XYZ',
          description: 'Seguro contra incêndio - Trimestral',
          amount: 675.00,
          dueDate: '2024-01-15',
          vendor: 'Seguradora XYZ',
          category: 'Seguros',
          status: 'paid',
          invoiceNumber: 'SEG-2024-001',
          paymentMethod: 'PIX',
          reference: 'SEGURO-001'
        }
      ];

      const mockReceivableAccounts: FinancialAccount[] = [
        {
          id: '4',
          type: 'receivable',
          title: 'Evento Corporativo ABC',
          description: 'Catering para 50 pessoas',
          amount: 3200.00,
          dueDate: '2024-01-30',
          customer: 'Empresa ABC Ltda',
          category: 'Catering',
          status: 'pending',
          invoiceNumber: 'REC-2024-001',
          reference: 'EVENTO-001'
        },
        {
          id: '5',
          type: 'receivable',
          title: 'Delivery Mensal',
          description: 'Contrato delivery empresa XYZ',
          amount: 1850.00,
          dueDate: '2024-01-25',
          customer: 'Empresa XYZ',
          category: 'Delivery',
          status: 'pending',
          invoiceNumber: 'REC-2024-002',
          reference: 'DELIVERY-001'
        }
      ];

      const mockRecurringPayments: RecurringPayment[] = [
        {
          id: 'R1',
          title: 'Financiamento Restaurante',
          description: 'Financiamento para reforma e equipamentos',
          amount: 2500.00,
          vendor: 'Banco Santander',
          category: 'Financiamento',
          frequency: 'monthly',
          interval: 1,
          startDate: '2023-01-01',
          totalOccurrences: 24,
          currentOccurrence: 12,
          nextDueDate: '2024-02-01',
          lastPaidDate: '2024-01-01',
          paymentMethod: 'Débito automático',
          isActive: true,
          reference: 'FINANC-001',
          notes: 'Restam 12 parcelas de 24'
        },
        {
          id: 'R2',
          title: 'Aluguel',
          description: 'Aluguel mensal do restaurante',
          amount: 3200.00,
          vendor: 'Imobiliária Central',
          category: 'Aluguel',
          frequency: 'monthly',
          interval: 1,
          startDate: '2023-01-01',
          currentOccurrence: 12,
          nextDueDate: '2024-02-05',
          lastPaidDate: '2024-01-05',
          paymentMethod: 'Transferência',
          isActive: true,
          reference: 'ALUGUEL-001'
        },
        {
          id: 'R3',
          title: 'Software POS',
          description: 'Sistema de PDV - assinatura anual',
          amount: 450.00,
          vendor: 'TechPOS Solutions',
          category: 'Software',
          frequency: 'yearly',
          interval: 1,
          startDate: '2023-03-15',
          currentOccurrence: 1,
          nextDueDate: '2024-03-15',
          lastPaidDate: '2023-03-15',
          paymentMethod: 'Cartão de crédito',
          isActive: true,
          reference: 'SOFTWARE-001'
        }
      ];

      const mockSummary: FinancialSummary = {
        totalPayable: mockPayableAccounts.filter(a => a.status !== 'paid').reduce((sum, a) => sum + a.amount, 0),
        totalReceivable: mockReceivableAccounts.filter(a => a.status !== 'paid').reduce((sum, a) => sum + a.amount, 0),
        overduePayable: mockPayableAccounts.filter(a => a.status === 'overdue').reduce((sum, a) => sum + a.amount, 0),
        overdueReceivable: mockReceivableAccounts.filter(a => a.status === 'overdue').reduce((sum, a) => sum + a.amount, 0),
        monthlyRecurring: mockRecurringPayments.filter(r => r.isActive && r.frequency === 'monthly').reduce((sum, r) => sum + r.amount, 0),
        netFlow: 0
      };
      mockSummary.netFlow = mockSummary.totalReceivable - mockSummary.totalPayable;

      setPayableAccounts(mockPayableAccounts);
      setReceivableAccounts(mockReceivableAccounts);
      setRecurringPayments(mockRecurringPayments);
      setSummary(mockSummary);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleExport = () => {
    try {
      // Prepare data for export based on active tab
      let dataToExport: any[] = [];
      let filename = '';

      if (activeTab === 'payable') {
        dataToExport = payableAccounts.map(account => ({
          'Titel': account.title,
          'Lieferant': account.vendor,
          'Betrag': account.amount,
          'Fälligkeit': new Date(account.dueDate).toLocaleDateString('de-DE'),
          'Kategorie': account.category,
          'Status': getStatusText(account.status),
          'Rechnungsnummer': account.invoiceNumber,
          'Zahlungsmethode': account.paymentMethod,
          'Referenz': account.reference,
          'Notizen': account.notes
        }));
        filename = 'verbindlichkeiten';
      } else if (activeTab === 'receivable') {
        dataToExport = receivableAccounts.map(account => ({
          'Titel': account.title,
          'Kunde': account.customer,
          'Betrag': account.amount,
          'Fälligkeit': new Date(account.dueDate).toLocaleDateString('de-DE'),
          'Kategorie': account.category,
          'Status': getStatusText(account.status),
          'Rechnungsnummer': account.invoiceNumber,
          'Referenz': account.reference,
          'Notizen': account.notes
        }));
        filename = 'forderungen';
      } else {
        dataToExport = recurringPayments.map(payment => ({
          'Titel': payment.title,
          'Lieferant': payment.vendor,
          'Betrag': payment.amount,
          'Frequenz': getFrequencyText(payment.frequency, payment.interval),
          'Nächste Fälligkeit': new Date(payment.nextDueDate).toLocaleDateString('de-DE'),
          'Kategorie': payment.category,
          'Status': payment.isActive ? 'Aktiv' : 'Inaktiv',
          'Zahlungsmethode': payment.paymentMethod,
          'Referenz': payment.reference,
          'Notizen': payment.notes
        }));
        filename = 'wiederkehrende-zahlungen';
      }

      // Convert to CSV
      const headers = Object.keys(dataToExport[0] || {});
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes in CSV
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Daten erfolgreich exportiert!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Fehler beim Exportieren der Daten');
    }
  };

  const resetAccountForm = () => {
    setAccountFormData({
      type: activeTab === 'receivable' ? 'receivable' : 'payable',
      title: '',
      description: '',
      amount: '',
      dueDate: '',
      vendor: '',
      customer: '',
      category: '',
      status: 'pending',
      invoiceNumber: '',
      paymentMethod: '',
      reference: '',
      notes: ''
    });
  };

  const handleAddAccount = () => {
    setSelectedAccount(null);
    resetAccountForm();
    setShowAccountModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Bezahlt';
      case 'pending': return 'Ausstehend';
      case 'overdue': return 'Überfällig';
      case 'cancelled': return 'Storniert';
      default: return 'Unbekannt';
    }
  };

  const getFrequencyText = (frequency: string, interval: number) => {
    switch (frequency) {
      case 'daily': return interval === 1 ? 'Täglich' : `Alle ${interval} Tage`;
      case 'weekly': return interval === 1 ? 'Wöchentlich' : `Alle ${interval} Wochen`;
      case 'monthly': return interval === 1 ? 'Monatlich' : `Alle ${interval} Monate`;
      case 'yearly': return interval === 1 ? 'Jährlich' : `Alle ${interval} Jahre`;
      default: return 'Benutzerdefiniert';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const filteredAccounts = () => {
    let accounts: FinancialAccount[] = [];
    
    if (activeTab === 'payable') {
      accounts = payableAccounts;
    } else if (activeTab === 'receivable') {
      accounts = receivableAccounts;
    }

    return accounts.filter(account => {
      const matchesSearch = 
        account.title.toLowerCase().includes(search.toLowerCase()) ||
        (account.vendor?.toLowerCase().includes(search.toLowerCase()) || false) ||
        (account.customer?.toLowerCase().includes(search.toLowerCase()) || false) ||
        (account.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || false);
      
      const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredRecurringPayments = recurringPayments.filter(payment => {
    return payment.title.toLowerCase().includes(search.toLowerCase()) ||
           payment.vendor.toLowerCase().includes(search.toLowerCase()) ||
           payment.category.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Finanzdaten...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Konten & Finanzen</h1>
                <p className="text-gray-600">{restaurant?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExport}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportieren</span>
              </button>
              <button 
                onClick={handleAddAccount}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Neues Konto</span>
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
                <p className="text-gray-600 text-sm">Verbindlichkeiten</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary?.totalPayable || 0)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Forderungen</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.totalReceivable || 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Netto-Cashflow</p>
                <p className={`text-2xl font-bold ${
                  (summary?.netFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary?.netFlow || 0)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                (summary?.netFlow || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <DollarSign className={`w-6 h-6 ${
                  (summary?.netFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Wiederkehrende Zahlungen</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary?.monthlyRecurring || 0)}
                </p>
                <p className="text-xs text-gray-500">pro Monat</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('payable')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'payable'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Verbindlichkeiten
            </button>
            <button
              onClick={() => setActiveTab('receivable')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'receivable'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Forderungen
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'recurring'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Wiederkehrende Zahlungen
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Konten durchsuchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            {activeTab !== 'recurring' && (
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Alle Status</option>
                  <option value="pending">Ausstehend</option>
                  <option value="paid">Bezahlt</option>
                  <option value="overdue">Überfällig</option>
                  <option value="cancelled">Storniert</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'recurring' ? (
          /* Recurring Payments */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Wiederkehrende Zahlungen</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zahlung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Betrag
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Häufigkeit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nächste Fälligkeit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fortschritt
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
                  {filteredRecurringPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <RefreshCw className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{payment.title}</div>
                            <div className="text-sm text-gray-500">{payment.vendor}</div>
                            <div className="text-xs text-gray-400">{payment.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-xs text-gray-500">{payment.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getFrequencyText(payment.frequency, payment.interval)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.nextDueDate).toLocaleDateString('de-DE')}
                        </div>
                        {isOverdue(payment.nextDueDate) && (
                          <div className="text-xs text-red-600 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Überfällig
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.totalOccurrences ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {payment.currentOccurrence} de {payment.totalOccurrences}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(payment.currentOccurrence / payment.totalOccurrences) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Unbegrenzt</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.isActive ? 'Aktiv' : 'Inaktiv'}
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
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Regular Accounts */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {activeTab === 'payable' ? 'Verbindlichkeiten' : 'Forderungen'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'payable' ? 'Lieferant' : 'Kunde'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Betrag
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fälligkeit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategorie
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
                  {filteredAccounts().map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            activeTab === 'payable' ? 'bg-red-100' : 'bg-green-100'
                          }`}>
                            {activeTab === 'payable' 
                              ? <Building className={`w-5 h-5 text-red-600`} />
                              : <User className={`w-5 h-5 text-green-600`} />
                            }
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{account.title}</div>
                            <div className="text-sm text-gray-500">
                              {activeTab === 'payable' ? account.vendor : account.customer}
                            </div>
                            <div className="text-xs text-gray-400">{account.invoiceNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(account.amount)}
                        </div>
                        <div className="text-xs text-gray-500">{account.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(account.dueDate).toLocaleDateString('de-DE')}
                        </div>
                        {isOverdue(account.dueDate) && account.status !== 'paid' && (
                          <div className="text-xs text-red-600 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Überfällig
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{account.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                          {getStatusText(account.status)}
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
                          {account.status === 'pending' && (
                            <button className="text-purple-600 hover:text-purple-900">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedAccount ? 'Konto bearbeiten' : 'Neues Konto erstellen'}
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              console.log('Account Data:', accountFormData);
              
              // Create new account
              const newAccount: FinancialAccount = {
                id: Date.now().toString(),
                type: accountFormData.type,
                title: accountFormData.title,
                description: accountFormData.description,
                amount: parseFloat(accountFormData.amount),
                dueDate: accountFormData.dueDate,
                vendor: accountFormData.vendor,
                customer: accountFormData.customer,
                category: accountFormData.category,
                status: accountFormData.status,
                invoiceNumber: accountFormData.invoiceNumber,
                paymentMethod: accountFormData.paymentMethod,
                reference: accountFormData.reference,
                notes: accountFormData.notes
              };

              // Add to appropriate list
              if (accountFormData.type === 'payable') {
                setPayableAccounts(prev => [...prev, newAccount]);
              } else {
                setReceivableAccounts(prev => [...prev, newAccount]);
              }

              // Reset and close
              resetAccountForm();
              setShowAccountModal(false);
              alert('Konto erfolgreich erstellt!');

              // Emit event
              emitFinancialAccountCreated(newAccount);
              emitSuccess('Konto erfolgreich erstellt!', 'Konten');
            }}>
              <div className="space-y-6">
                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konto-Typ *
                  </label>
                  <select
                    required
                    value={accountFormData.type}
                    onChange={(e) => setAccountFormData(prev => ({ ...prev, type: e.target.value as 'payable' | 'receivable' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="payable">Verbindlichkeit (zu zahlen)</option>
                    <option value="receivable">Forderung (zu erhalten)</option>
                  </select>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titel *
                    </label>
                    <input
                      type="text"
                      required
                      value={accountFormData.title}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="z.B. Lieferant ABC, Rechnung Januar..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beschreibung
                    </label>
                    <textarea
                      rows={3}
                      value={accountFormData.description}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Zusätzliche Details..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {accountFormData.type === 'payable' ? 'Lieferant' : 'Kunde'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={accountFormData.type === 'payable' ? accountFormData.vendor : accountFormData.customer}
                      onChange={(e) => setAccountFormData(prev => ({ 
                        ...prev, 
                        [accountFormData.type === 'payable' ? 'vendor' : 'customer']: e.target.value 
                      }))}
                      placeholder={accountFormData.type === 'payable' ? 'Lieferant eingeben...' : 'Kunde eingeben...'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Betrag (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={accountFormData.amount}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fälligkeitsdatum *
                    </label>
                    <input
                      type="date"
                      required
                      value={accountFormData.dueDate}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategorie *
                    </label>
                    <select
                      required
                      value={accountFormData.category}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Kategorie auswählen...</option>
                      {accountFormData.type === 'payable' ? (
                        <>
                          <option value="Zutaten">Zutaten</option>
                          <option value="Getränke">Getränke</option>
                          <option value="Personal">Personal</option>
                          <option value="Miete">Miete</option>
                          <option value="Nebenkosten">Nebenkosten</option>
                          <option value="Ausrüstung">Ausrüstung</option>
                          <option value="Versicherungen">Versicherungen</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Wartung">Wartung</option>
                          <option value="Sonstiges">Sonstiges</option>
                        </>
                      ) : (
                        <>
                          <option value="Catering">Catering</option>
                          <option value="Delivery">Delivery</option>
                          <option value="Verkäufe">Verkäufe</option>
                          <option value="Events">Events</option>
                          <option value="Vermietung">Vermietung</option>
                          <option value="Sonstiges">Sonstiges</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={accountFormData.status}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="pending">Ausstehend</option>
                      <option value="paid">Bezahlt</option>
                      <option value="overdue">Überfällig</option>
                      <option value="cancelled">Storniert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zahlungsmethode
                    </label>
                    <select
                      value={accountFormData.paymentMethod}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Methode auswählen...</option>
                      <option value="Bargeld">Bargeld</option>
                      <option value="Karte">Karte</option>
                      <option value="Überweisung">Überweisung</option>
                      <option value="Lastschrift">Lastschrift</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Scheck">Scheck</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rechnungsnummer
                    </label>
                    <input
                      type="text"
                      value={accountFormData.invoiceNumber}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      placeholder="z.B. INV-2024-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referenz
                    </label>
                    <input
                      type="text"
                      value={accountFormData.reference}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="Bestellnummer, Vertragsnummer..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notizen
                    </label>
                    <textarea
                      rows={3}
                      value={accountFormData.notes}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Zusätzliche Notizen..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {selectedAccount ? 'Konto aktualisieren' : 'Konto erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 