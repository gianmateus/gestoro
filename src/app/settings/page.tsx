'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Building, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Palette, 
  Database, 
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Clock,
  Euro,
  FileText,
  Printer,
  Wifi,
  Monitor,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Settings,
  Users,
  Lock,
  Camera,
  Calendar,
  Star,
  AlertTriangle
} from 'lucide-react';

interface RestaurantSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  cuisine: string;
  capacity: number;
  logo?: string;
  images: string[];
}

interface UserSettings {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    financial: boolean;
    bookings: boolean;
    inventory: boolean;
  };
}

interface SystemSettings {
  currency: string;
  taxRate: number;
  fiscalYear: string;
  backupFrequency: string;
  theme: 'light' | 'dark' | 'auto';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  language: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('restaurant');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    openingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '12:00', close: '21:00', closed: false }
    },
    cuisine: '',
    capacity: 50,
    images: []
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: '',
    email: '',
    phone: '',
    role: 'manager',
    language: 'de',
    timezone: 'Europe/Berlin',
    notifications: {
      email: true,
      sms: false,
      push: true,
      financial: true,
      bookings: true,
      inventory: false
    }
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    currency: 'EUR',
    taxRate: 19,
    fiscalYear: '2024',
    backupFrequency: 'daily',
    theme: 'light',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    language: 'de'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
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
        loadSettings(restaurantData.id);
      } catch (error) {
        console.error('Error parsing restaurant data:', error);
        router.push('/restaurants');
      }
    };

    checkAuth();
  }, [router]);

  const loadSettings = async (restaurantId: string) => {
    try {
      // Mock data - in real app, fetch from API
      setRestaurantSettings({
        name: 'Bella Italia',
        description: 'Authentisches italienisches Restaurant mit traditionellen Gerichten',
        address: 'Musterstraße 123, 10115 Berlin',
        phone: '+49 30 12345678',
        email: 'info@bella-italia.de',
        website: 'www.bella-italia.de',
        openingHours: {
          monday: { open: '11:00', close: '22:00', closed: false },
          tuesday: { open: '11:00', close: '22:00', closed: false },
          wednesday: { open: '11:00', close: '22:00', closed: false },
          thursday: { open: '11:00', close: '22:00', closed: false },
          friday: { open: '11:00', close: '23:00', closed: false },
          saturday: { open: '12:00', close: '23:00', closed: false },
          sunday: { open: '12:00', close: '21:00', closed: false }
        },
        cuisine: 'Italienisch',
        capacity: 85,
        images: []
      });

      setUserSettings({
        name: 'Max Mustermann',
        email: 'max@bella-italia.de',
        phone: '+49 176 12345678',
        role: 'Geschäftsführer',
        language: 'de',
        timezone: 'Europe/Berlin',
        notifications: {
          email: true,
          sms: true,
          push: true,
          financial: true,
          bookings: true,
          inventory: true
        }
      });

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock save - in real app, send to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Einstellungen erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Fehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const tabs = [
    { id: 'restaurant', label: 'Restaurant', icon: Building },
    { id: 'user', label: 'Benutzer', icon: User },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'security', label: 'Sicherheit', icon: Shield },
    { id: 'integrations', label: 'Integrationen', icon: Smartphone }
  ];

  const weekdays = [
    { id: 'monday', label: 'Montag' },
    { id: 'tuesday', label: 'Dienstag' },
    { id: 'wednesday', label: 'Mittwoch' },
    { id: 'thursday', label: 'Donnerstag' },
    { id: 'friday', label: 'Freitag' },
    { id: 'saturday', label: 'Samstag' },
    { id: 'sunday', label: 'Sonntag' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Einstellungen...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
                <p className="text-gray-600">{restaurant?.name}</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Speichern...' : 'Speichern'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Restaurant Settings */}
            {activeTab === 'restaurant' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Informationen</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Restaurant Name
                      </label>
                      <input
                        type="text"
                        value={restaurantSettings.name}
                        onChange={(e) => setRestaurantSettings({...restaurantSettings, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Küche Art
                      </label>
                      <input
                        type="text"
                        value={restaurantSettings.cuisine}
                        onChange={(e) => setRestaurantSettings({...restaurantSettings, cuisine: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beschreibung
                      </label>
                      <textarea
                        value={restaurantSettings.description}
                        onChange={(e) => setRestaurantSettings({...restaurantSettings, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={restaurantSettings.address}
                        onChange={(e) => setRestaurantSettings({...restaurantSettings, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={restaurantSettings.phone}
                        onChange={(e) => setRestaurantSettings({...restaurantSettings, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-Mail
                      </label>
                      <input
                        type="email"
                        value={restaurantSettings.email}
                        onChange={(e) => setRestaurantSettings({...restaurantSettings, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={restaurantSettings.website}
                        onChange={(e) => setRestaurantSettings({...restaurantSettings, website: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kapazität (Personen)
                      </label>
                      <input
                        type="number"
                        value={restaurantSettings.capacity}
                        onChange={(e) => setRestaurantSettings({...restaurantSettings, capacity: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Öffnungszeiten</h3>
                  
                  <div className="space-y-4">
                    {weekdays.map((day) => (
                      <div key={day.id} className="flex items-center space-x-4">
                        <div className="w-24">
                          <span className="text-sm font-medium text-gray-700">{day.label}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!restaurantSettings.openingHours[day.id]?.closed}
                            onChange={(e) => setRestaurantSettings({
                              ...restaurantSettings,
                              openingHours: {
                                ...restaurantSettings.openingHours,
                                [day.id]: {
                                  ...restaurantSettings.openingHours[day.id],
                                  closed: !e.target.checked
                                }
                              }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">Geöffnet</span>
                        </div>

                        {!restaurantSettings.openingHours[day.id]?.closed && (
                          <>
                            <input
                              type="time"
                              value={restaurantSettings.openingHours[day.id]?.open || '09:00'}
                              onChange={(e) => setRestaurantSettings({
                                ...restaurantSettings,
                                openingHours: {
                                  ...restaurantSettings.openingHours,
                                  [day.id]: {
                                    ...restaurantSettings.openingHours[day.id],
                                    open: e.target.value
                                  }
                                }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-gray-500">bis</span>
                            <input
                              type="time"
                              value={restaurantSettings.openingHours[day.id]?.close || '22:00'}
                              onChange={(e) => setRestaurantSettings({
                                ...restaurantSettings,
                                openingHours: {
                                  ...restaurantSettings.openingHours,
                                  [day.id]: {
                                    ...restaurantSettings.openingHours[day.id],
                                    close: e.target.value
                                  }
                                }
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* User Settings */}
            {activeTab === 'user' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Persönliche Informationen</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={userSettings.name}
                        onChange={(e) => setUserSettings({...userSettings, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position
                      </label>
                      <input
                        type="text"
                        value={userSettings.role}
                        onChange={(e) => setUserSettings({...userSettings, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-Mail
                      </label>
                      <input
                        type="email"
                        value={userSettings.email}
                        onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={userSettings.phone}
                        onChange={(e) => setUserSettings({...userSettings, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sprache
                      </label>
                      <select
                        value={userSettings.language}
                        onChange={(e) => setUserSettings({...userSettings, language: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="de">Deutsch</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="it">Italiano</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zeitzone
                      </label>
                      <select
                        value={userSettings.timezone}
                        onChange={(e) => setUserSettings({...userSettings, timezone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Europe/Berlin">Berlin (UTC+1)</option>
                        <option value="Europe/London">London (UTC+0)</option>
                        <option value="Europe/Paris">Paris (UTC+1)</option>
                        <option value="Europe/Rome">Rom (UTC+1)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Einstellungen</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Währung
                      </label>
                      <select
                        value={systemSettings.currency}
                        onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="GBP">British Pound (£)</option>
                        <option value="CHF">Swiss Franc (Fr)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Steuersatz (%)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.taxRate}
                        onChange={(e) => setSystemSettings({...systemSettings, taxRate: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Design
                      </label>
                      <select
                        value={systemSettings.theme}
                        onChange={(e) => setSystemSettings({...systemSettings, theme: e.target.value as 'light' | 'dark' | 'auto'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="light">Hell</option>
                        <option value="dark">Dunkel</option>
                        <option value="auto">Automatisch</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Datumsformat
                      </label>
                      <select
                        value={systemSettings.dateFormat}
                        onChange={(e) => setSystemSettings({...systemSettings, dateFormat: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zeitformat
                      </label>
                      <select
                        value={systemSettings.timeFormat}
                        onChange={(e) => setSystemSettings({...systemSettings, timeFormat: e.target.value as '12h' | '24h'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="24h">24 Stunden</option>
                        <option value="12h">12 Stunden (AM/PM)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Frequenz
                      </label>
                      <select
                        value={systemSettings.backupFrequency}
                        onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="daily">Täglich</option>
                        <option value="weekly">Wöchentlich</option>
                        <option value="monthly">Monatlich</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Benachrichtigungen</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Benachrichtigungskanäle</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>E-Mail Benachrichtigungen</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={userSettings.notifications.email}
                          onChange={(e) => setUserSettings({
                            ...userSettings,
                            notifications: { ...userSettings.notifications, email: e.target.checked }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>SMS Benachrichtigungen</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={userSettings.notifications.sms}
                          onChange={(e) => setUserSettings({
                            ...userSettings,
                            notifications: { ...userSettings.notifications, sms: e.target.checked }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-4 h-4 text-gray-500" />
                          <span>Push Benachrichtigungen</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={userSettings.notifications.push}
                          onChange={(e) => setUserSettings({
                            ...userSettings,
                            notifications: { ...userSettings.notifications, push: e.target.checked }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Benachrichtigungstypen</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Euro className="w-4 h-4 text-gray-500" />
                          <span>Finanzielle Benachrichtigungen</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={userSettings.notifications.financial}
                          onChange={(e) => setUserSettings({
                            ...userSettings,
                            notifications: { ...userSettings.notifications, financial: e.target.checked }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>Buchungs Benachrichtigungen</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={userSettings.notifications.bookings}
                          onChange={(e) => setUserSettings({
                            ...userSettings,
                            notifications: { ...userSettings.notifications, bookings: e.target.checked }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Database className="w-4 h-4 text-gray-500" />
                          <span>Inventar Benachrichtigungen</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={userSettings.notifications.inventory}
                          onChange={(e) => setUserSettings({
                            ...userSettings,
                            notifications: { ...userSettings.notifications, inventory: e.target.checked }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Passwort ändern</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aktuelles Passwort
                      </label>
                      <input
                        type="password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Neues Passwort
                      </label>
                      <input
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passwort bestätigen
                      </label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Passwort aktualisieren
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Zwei-Faktor-Authentifizierung</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">2FA aktivieren</p>
                      <p className="text-sm text-gray-600">Zusätzliche Sicherheit für Ihr Konto</p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Aktivieren
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Verfügbare Integrationen</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Stripe</h4>
                          <p className="text-sm text-gray-600">Zahlungsabwicklung</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg">
                        Verbunden
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Lieferando</h4>
                          <p className="text-sm text-gray-600">Online-Bestellungen</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                        Verbinden
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">OpenTable</h4>
                          <p className="text-sm text-gray-600">Tischreservierungen</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                        Verbinden
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Star className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Google My Business</h4>
                          <p className="text-sm text-gray-600">Bewertungen und Listing</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                        Verbinden
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 