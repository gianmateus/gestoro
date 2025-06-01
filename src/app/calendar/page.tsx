'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Bell,
  CreditCard,
  Receipt,
  Banknote,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useEventEmitter } from '../../hooks/useEventBus';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'income' | 'expense' | 'payment' | 'reminder' | 'appointment';
  amount?: number;
  category?: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  isRecurring?: boolean;
  recurringInfo?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // every X days/weeks/months/years
    endDate?: string;
    totalOccurrences?: number;
    currentOccurrence?: number;
  };
  vendor?: string;
  paymentMethod?: string;
  reference?: string;
}

interface DaySummary {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  eventCount: number;
  hasOverdue: boolean;
}

export default function CalendarPage() {
  const router = useRouter();
  const { emitCalendarEventCreated, emitSuccess, emitError } = useEventEmitter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [loading, setLoading] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    date: '',
    time: '',
    amount: '',
    status: 'pending',
    vendor: '',
    paymentMethod: '',
    reference: '',
    frequency: 'monthly',
    interval: 1,
    endDate: ''
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
        fetchCalendarData(restaurantData.id);
      } catch (error) {
        console.error('Error parsing restaurant data:', error);
        router.push('/restaurants');
      }
    };

    checkAuth();
  }, [router]);

  // Reset form when modal opens
  useEffect(() => {
    if (showAddEventModal && !selectedEvent) {
      setEventFormData({
        title: '',
        description: '',
        type: '',
        category: '',
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        time: '',
        amount: '',
        status: 'pending',
        vendor: '',
        paymentMethod: '',
        reference: '',
        frequency: 'monthly',
        interval: 1,
        endDate: ''
      });
      setIsRecurring(false);
    }
  }, [showAddEventModal, selectedEvent, selectedDate]);

  const fetchCalendarData = async (restaurantId: string) => {
    try {
      // Mock data para o calendário - distribuindo eventos pelo mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Finanzierung Restaurant',
          description: 'Monatliche Finanzierungsrate',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
          time: '09:00',
          type: 'payment',
          amount: 2500.00,
          category: 'Finanzierung',
          status: 'pending',
          isRecurring: true,
          recurringInfo: {
            frequency: 'monthly',
            interval: 1,
            totalOccurrences: 24,
            currentOccurrence: 12
          },
          vendor: 'Banco Santander',
          paymentMethod: 'Lastschrift',
          reference: 'FINANC-001'
        },
        {
          id: '2',
          title: 'Miete',
          description: 'Monatliche Restaurantmiete',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-05`,
          time: '10:00',
          type: 'payment',
          amount: 3200.00,
          category: 'Miete',
          status: 'completed',
          isRecurring: true,
          recurringInfo: {
            frequency: 'monthly',
            interval: 1
          },
          vendor: 'Immobilien Central',
          paymentMethod: 'Überweisung',
          reference: 'MIETE-001'
        },
        {
          id: '3',
          title: 'Mittagsverkäufe',
          description: 'Umsatz Mittagszeit',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
          time: '14:30',
          type: 'income',
          amount: 850.00,
          category: 'Verkäufe',
          status: 'completed'
        },
        {
          id: '4',
          title: 'Zutaten Einkauf',
          description: 'Italienischer Lieferant GmbH',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
          time: '08:00',
          type: 'expense',
          amount: 450.00,
          category: 'Zutaten',
          status: 'completed',
          vendor: 'Italienischer Lieferant GmbH'
        },
        {
          id: '5',
          title: 'Stromrechnung',
          description: 'Strom - Fälligkeit',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-20`,
          time: '23:59',
          type: 'payment',
          amount: 380.00,
          category: 'Nebenkosten',
          status: 'pending',
          vendor: 'Energisa',
          reference: 'STROM-001'
        },
        {
          id: '6',
          title: 'Versicherung',
          description: 'Brandversicherung - vierteljährlich',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-25`,
          time: '10:00',
          type: 'payment',
          amount: 675.00,
          category: 'Versicherungen',
          status: 'pending',
          isRecurring: true,
          recurringInfo: {
            frequency: 'monthly',
            interval: 3,
            totalOccurrences: 4,
            currentOccurrence: 1
          },
          vendor: 'Versicherung XYZ'
        },
        {
          id: '7',
          title: 'Abendverkäufe',
          description: 'Umsatz Abendzeit',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-18`,
          time: '22:00',
          type: 'income',
          amount: 1200.00,
          category: 'Verkäufe',
          status: 'completed'
        },
        {
          id: '8',
          title: 'Weinlieferant',
          description: 'Monatlicher Weineinkauf',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-12`,
          time: '15:00',
          type: 'expense',
          amount: 320.00,
          category: 'Getränke',
          status: 'completed',
          vendor: 'Weinkellerei Premium'
        },
        {
          id: '9',
          title: 'Catering Event',
          description: 'Catering-Service für Hochzeit',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-22`,
          time: '16:00',
          type: 'income',
          amount: 2800.00,
          category: 'Catering',
          status: 'pending'
        },
        {
          id: '10',
          title: 'Ausrüstung Kauf',
          description: 'Neuer Ofen für Küche',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-10`,
          time: '11:00',
          type: 'expense',
          amount: 1500.00,
          category: 'Ausrüstung',
          status: 'completed',
          vendor: 'Gastro Ausrüstung GmbH'
        },
        {
          id: '11',
          title: 'Lieferservice',
          description: 'Wöchentlicher Lieferservice-Umsatz',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-29`,
          time: '20:00',
          type: 'income',
          amount: 950.00,
          category: 'Lieferservice',
          status: 'completed'
        },
        {
          id: '12',
          title: 'Personal Gehälter',
          description: 'Monatliche Gehaltszahlung',
          date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-30`,
          time: '09:00',
          type: 'expense',
          amount: 4200.00,
          category: 'Personal',
          status: 'pending'
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const resetForm = () => {
    setEventFormData({
      title: '',
      description: '',
      type: '',
      category: '',
      date: '',
      time: '',
      amount: '',
      status: 'pending',
      vendor: '',
      paymentMethod: '',
      reference: '',
      frequency: 'monthly',
      interval: 1,
      endDate: ''
    });
    setIsRecurring(false);
  };

  const handleNavigateToKonten = () => {
    router.push('/konten');
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getDaySummary = (date: Date): DaySummary => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = events.filter(event => event.date === dateStr);
    
    const totalIncome = dayEvents
      .filter(event => event.type === 'income')
      .reduce((sum, event) => sum + (event.amount || 0), 0);
    
    const totalExpense = dayEvents
      .filter(event => event.type === 'expense' || event.type === 'payment')
      .reduce((sum, event) => sum + (event.amount || 0), 0);
    
    const hasOverdue = dayEvents.some(event => 
      event.status === 'overdue' || 
      (event.status === 'pending' && new Date(event.date) < new Date())
    );

    return {
      date: dateStr,
      totalIncome,
      totalExpense,
      netFlow: totalIncome - totalExpense,
      eventCount: dayEvents.length,
      hasOverdue
    };
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'expense': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'reminder': return <Bell className="w-4 h-4 text-orange-600" />;
      case 'appointment': return <CalendarIcon className="w-4 h-4 text-purple-600" />;
      default: return <CalendarIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Abgeschlossen';
      case 'pending': return 'Ausstehend';
      case 'overdue': return 'Überfällig';
      case 'cancelled': return 'Storniert';
      default: return 'Unbekannt';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Kalender...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Kalender & Events</h1>
                <p className="text-gray-600">{restaurant?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleNavigateToKonten}
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Zahlungen verwalten</span>
              </button>
              <button 
                onClick={() => {
                  setSelectedEvent(null);
                  setShowAddEventModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Event hinzufügen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Heute
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Weekday Headers */}
            {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {getCalendarDays().map((day, index) => {
              const daySummary = getDaySummary(day);
              const dayEvents = getEventsForDate(day);
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedDate(day);
                    setShowDayModal(true);
                  }}
                  className={`
                    min-h-[120px] p-2 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors
                    ${!isCurrentMonth(day) ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                    ${isToday(day) ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : ''}`}>
                      {day.getDate()}
                    </span>
                    {daySummary.hasOverdue && (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                  
                  {/* Financial Flow Indicators */}
                  {daySummary.eventCount > 0 && (
                    <div className="space-y-1">
                      {/* Income (Entradas) */}
                      {daySummary.totalIncome > 0 && (
                        <div className="text-xs px-1 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                          +{formatCurrency(daySummary.totalIncome)}
                        </div>
                      )}
                      
                      {/* Expenses (Saídas) */}
                      {daySummary.totalExpense > 0 && (
                        <div className="text-xs px-1 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                          -{formatCurrency(daySummary.totalExpense)}
                        </div>
                      )}
                      
                      {/* Event Indicators (only if space allows) */}
                      {dayEvents.length <= 2 && (
                        <div className="space-y-0.5 mt-1">
                          {dayEvents.map((event) => (
                            <div key={event.id} className="flex items-center space-x-1">
                              {getEventTypeIcon(event.type)}
                              <span className="text-xs truncate">
                                {event.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {dayEvents.length} Events
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Events diesen Monat</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => new Date(e.date).getMonth() === currentDate.getMonth()).length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ausstehende Zahlungen</p>
                <p className="text-2xl font-bold text-orange-600">
                  {events.filter(e => e.type === 'payment' && e.status === 'pending').length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Einnahmen diesen Monat</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    events
                      .filter(e => e.type === 'income' && new Date(e.date).getMonth() === currentDate.getMonth())
                      .reduce((sum, e) => sum + (e.amount || 0), 0)
                  )}
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
                <p className="text-gray-600 text-sm">Ausgaben diesen Monat</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    events
                      .filter(e => (e.type === 'expense' || e.type === 'payment') && new Date(e.date).getMonth() === currentDate.getMonth())
                      .reduce((sum, e) => sum + (e.amount || 0), 0)
                  )}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Kommende Events</h3>
            <button className="text-blue-600 text-sm hover:text-blue-700">Alle anzeigen</button>
          </div>
          
          <div className="space-y-3">
            {events
              .filter(event => new Date(event.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getEventTypeIcon(event.type)}
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString('de-DE')}
                        {event.time && ` - ${event.time}`}
                        {event.vendor && ` • ${event.vendor}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {event.amount && (
                      <span className={`font-medium ${
                        event.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                    {event.isRecurring && (
                      <span className="text-blue-600">Wiederkehrend</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Day Modal */}
      {showDayModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Events - {selectedDate.toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setShowDayModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {getEventsForDate(selectedDate).map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getEventTypeIcon(event.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          {event.time && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {event.time}
                            </span>
                          )}
                          {event.vendor && (
                            <span>{event.vendor}</span>
                          )}
                          {event.isRecurring && (
                            <span className="text-blue-600">Wiederkehrend</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {event.amount && (
                        <span className={`font-medium ${
                          event.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                        </span>
                      )}
                      <div className="mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                          {getStatusText(event.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>Keine Ereignisse an diesem Tag</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDayModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Schließen
              </button>
              <button 
                onClick={() => {
                  setShowDayModal(false);
                  setSelectedEvent(null);
                  setShowAddEventModal(true);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Event hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedEvent ? 'Event bearbeiten' : 'Neues Event erstellen'}
              </h3>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              console.log('Event Data:', { ...eventFormData, isRecurring });
              
              // Simulate saving
              const newEvent: CalendarEvent = {
                id: Date.now().toString(),
                title: eventFormData.title,
                description: eventFormData.description,
                date: eventFormData.date,
                time: eventFormData.time,
                type: eventFormData.type as any,
                amount: eventFormData.amount ? parseFloat(eventFormData.amount) : undefined,
                category: eventFormData.category,
                status: eventFormData.status as any,
                vendor: eventFormData.vendor,
                paymentMethod: eventFormData.paymentMethod,
                reference: eventFormData.reference,
                isRecurring,
                recurringInfo: isRecurring ? {
                  frequency: eventFormData.frequency as any,
                  interval: eventFormData.interval,
                  endDate: eventFormData.endDate
                } : undefined
              };
              
              // Add to events list
              setEvents(prev => [...prev, newEvent]);
              
              // Reset form and close modal
              resetForm();
              setShowAddEventModal(false);
              
              alert('Evento adicionado com sucesso!');
              
              // Emit calendar event
              emitCalendarEventCreated(newEvent);
              emitSuccess('Evento erfolgreich hinzugefügt!', 'Calendar');
            }}>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titel *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventFormData.title}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Event Titel eingeben..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beschreibung
                    </label>
                    <textarea
                      rows={3}
                      value={eventFormData.description}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Zusätzliche Details..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Typ *
                    </label>
                    <select
                      required
                      value={eventFormData.type}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Typ auswählen...</option>
                      <option value="income">Einnahme</option>
                      <option value="expense">Ausgabe</option>
                      <option value="payment">Zahlung</option>
                      <option value="reminder">Erinnerung</option>
                      <option value="appointment">Termin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategorie
                    </label>
                    <select 
                      value={eventFormData.category}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Kategorie auswählen...</option>
                      <option value="Verkäufe">Verkäufe</option>
                      <option value="Zutaten">Zutaten</option>
                      <option value="Getränke">Getränke</option>
                      <option value="Personal">Personal</option>
                      <option value="Miete">Miete</option>
                      <option value="Nebenkosten">Nebenkosten</option>
                      <option value="Ausrüstung">Ausrüstung</option>
                      <option value="Versicherungen">Versicherungen</option>
                      <option value="Catering">Catering</option>
                      <option value="Lieferservice">Lieferservice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datum *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventFormData.date || (selectedDate ? selectedDate.toISOString().split('T')[0] : '')}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Uhrzeit
                    </label>
                    <input
                      type="time"
                      value={eventFormData.time}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Betrag (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={eventFormData.amount}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select 
                      value={eventFormData.status}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Ausstehend</option>
                      <option value="completed">Abgeschlossen</option>
                      <option value="overdue">Überfällig</option>
                      <option value="cancelled">Storniert</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Anbieter/Kunde
                    </label>
                    <input
                      type="text"
                      value={eventFormData.vendor}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, vendor: e.target.value }))}
                      placeholder="z.B. Lieferant XYZ, Kunde ABC..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zahlungsmethode
                    </label>
                    <select 
                      value={eventFormData.paymentMethod}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Methode auswählen...</option>
                      <option value="cash">Bargeld</option>
                      <option value="card">Karte</option>
                      <option value="transfer">Überweisung</option>
                      <option value="direct_debit">Lastschrift</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referenz
                    </label>
                    <input
                      type="text"
                      value={eventFormData.reference}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="Rechnungsnummer, Bestellnummer..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Recurring Settings */}
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                      Wiederkehrendes Event
                    </label>
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${!isRecurring ? 'opacity-50' : ''}`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequenz
                      </label>
                      <select 
                        disabled={!isRecurring}
                        value={eventFormData.frequency}
                        onChange={(e) => setEventFormData(prev => ({ ...prev, frequency: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="daily">Täglich</option>
                        <option value="weekly">Wöchentlich</option>
                        <option value="monthly">Monatlich</option>
                        <option value="yearly">Jährlich</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intervall
                      </label>
                      <input
                        type="number"
                        min="1"
                        disabled={!isRecurring}
                        value={eventFormData.interval}
                        onChange={(e) => setEventFormData(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enddatum
                      </label>
                      <input
                        type="date"
                        disabled={!isRecurring}
                        value={eventFormData.endDate}
                        onChange={(e) => setEventFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedEvent ? 'Event aktualisieren' : 'Event erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 