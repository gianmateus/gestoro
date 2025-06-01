'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MapPin, Phone, Mail, Loader2, Edit, X, Trash2 } from 'lucide-react';
import { useEventEmitter } from '../../hooks/useEventBus';
import { eventBus } from '../../utils/eventBus';

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  color?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function RestaurantSelectionPage() {
  const router = useRouter();
  const { emitRestaurantSelected, emitSuccess, emitError } = useEventEmitter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    color: '#d96d62'
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRestaurant, setDeletingRestaurant] = useState<Restaurant | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        router.push('/login');
        return;
      }

      try {
        setUser(JSON.parse(userData));
        fetchRestaurants();
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Reset form when modal opens
  useEffect(() => {
    if (showCreateForm) {
      resetForm();
    }
  }, [showCreateForm]);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/restaurants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRestaurants(data.data);
      } else {
        console.error('Failed to fetch restaurants');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSelect = async (restaurantId: string) => {
    console.log('🎯 Selecionando restaurante:', restaurantId);
    setSelectedRestaurant(restaurantId);
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token para seleção:', token ? 'Presente' : 'Ausente');
      
      const response = await fetch('http://localhost:3001/api/restaurants/select', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ restaurantId }),
      });

      console.log('📡 Response status da seleção:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Restaurante selecionado com sucesso:', data);
        
        localStorage.setItem('selectedRestaurant', JSON.stringify(data.data.selectedRestaurant));
        console.log('💾 Restaurante salvo no localStorage');
        
        // Emit restaurant selected event
        emitRestaurantSelected(data.data.selectedRestaurant);
        emitSuccess('Restaurant erfolgreich ausgewählt!', 'RestaurantSelection');
        
        console.log('🚀 Redirecionando para dashboard...');
        router.push('/dashboard');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao selecionar restaurante:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Mostrar mensagem de erro para o usuário
        alert(`Erro ao selecionar restaurante: ${errorData.message || 'Erro desconhecido'}`);
        setSelectedRestaurant(null);
      }
    } catch (error) {
      console.error('❌ Erro de rede ao selecionar restaurante:', error);
      alert('Erro de conexão. Verifique se o backend está funcionando.');
      setSelectedRestaurant(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedRestaurant');
    router.push('/login');
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/restaurants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Restaurant erstellt:', data);
        
        // Refresh the restaurants list
        await fetchRestaurants();
        
        // Reset form and close modal
        resetForm();
        setShowCreateForm(false);
        
        // Emit restaurant created event
        emitSuccess('Restaurant erfolgreich erstellt!', 'RestaurantSelection');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Fehler beim Erstellen des Restaurants:', errorData);
        emitError(`Fehler beim Erstellen: ${errorData.message || 'Unbekannter Fehler'}`, 'RestaurantSelection');
      }
    } catch (error) {
      console.error('❌ Netzwerk-Fehler beim Erstellen:', error);
      emitError('Verbindungsfehler. Bitte versuchen Sie es erneut.', 'RestaurantSelection');
    } finally {
      setCreateLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      color: '#d96d62'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRandomColor = () => {
    const colors = [
      '#d96d62', '#e74c3c', '#f39c12', '#f1c40f', 
      '#27ae60', '#2ecc71', '#3498db', '#9b59b6', 
      '#e67e22', '#95a5a6', '#34495e', '#16a085'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleEditRestaurant = (restaurant: Restaurant, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering restaurant selection
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description || '',
      address: restaurant.address,
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      color: restaurant.color || '#d96d62'
    });
    setShowEditForm(true);
  };

  const handleUpdateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant) return;
    
    setEditLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/restaurants/${editingRestaurant.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Restaurant aktualisiert:', data);
        
        // Refresh the restaurants list
        await fetchRestaurants();
        
        // Reset form and close modal
        resetForm();
        setShowEditForm(false);
        setEditingRestaurant(null);
        
        // Emit restaurant updated event
        emitSuccess('Restaurant erfolgreich aktualisiert!', 'RestaurantSelection');
        eventBus.emit('RESTAURANT_UPDATED', { restaurant: data.data });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Fehler beim Aktualisieren des Restaurants:', errorData);
        emitError(`Fehler beim Aktualisieren: ${errorData.message || 'Unbekannter Fehler'}`, 'RestaurantSelection');
      }
    } catch (error) {
      console.error('❌ Netzwerk-Fehler beim Aktualisieren:', error);
      emitError('Verbindungsfehler. Bitte versuchen Sie es erneut.', 'RestaurantSelection');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingRestaurant(null);
    resetForm();
  };

  // Handle delete restaurant
  const handleDeleteRestaurant = (restaurant: Restaurant, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering restaurant selection
    setDeletingRestaurant(restaurant);
    setShowDeleteModal(true);
  };

  const confirmDeleteRestaurant = async () => {
    if (!deletingRestaurant) return;
    
    setDeleteLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/restaurants/${deletingRestaurant.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Restaurant gelöscht:', data);
        
        // Remove from restaurants list
        setRestaurants(prev => prev.filter(r => r.id !== deletingRestaurant.id));
        
        // Close modal and reset state
        setShowDeleteModal(false);
        setDeletingRestaurant(null);
        
        // Emit restaurant deleted event
        emitSuccess('Restaurant erfolgreich gelöscht!', 'RestaurantSelection');
        eventBus.emit('RESTAURANT_DELETED', { restaurantId: deletingRestaurant.id });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Fehler beim Löschen des Restaurants:', errorData);
        emitError(`Fehler beim Löschen: ${errorData.message || 'Unbekannter Fehler'}`, 'RestaurantSelection');
      }
    } catch (error) {
      console.error('❌ Netzwerk-Fehler beim Löschen:', error);
      emitError('Verbindungsfehler. Bitte versuchen Sie es erneut.', 'RestaurantSelection');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingRestaurant(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Lade Restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant auswählen</h1>
              <p className="text-gray-600">Willkommen zurück, {user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Existing Restaurants */}
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => handleRestaurantSelect(restaurant.id)}
              className={`relative group cursor-pointer transition-all duration-300 ${
                selectedRestaurant === restaurant.id ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-orange-200">
                {/* Restaurant Avatar */}
                <div 
                  className="h-32 flex items-center justify-center text-white text-4xl font-bold relative"
                  style={{ backgroundColor: restaurant.color || '#d96d62' }}
                >
                  {restaurant.name.charAt(0).toUpperCase()}
                  
                  {/* Edit and Delete Buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleEditRestaurant(restaurant, e)}
                      className="p-2 bg-black bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-all duration-200"
                      title="Restaurant bearbeiten"
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteRestaurant(restaurant, e)}
                      className="p-2 bg-red-600 bg-opacity-80 hover:bg-opacity-100 rounded-lg transition-all duration-200"
                      title="Restaurant löschen"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                
                {/* Restaurant Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {restaurant.name}
                  </h3>
                  
                  {restaurant.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                    
                    {restaurant.phone && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{restaurant.phone}</span>
                      </div>
                    )}
                    
                    {restaurant.email && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="truncate">{restaurant.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Loading Overlay */}
                {selectedRestaurant === restaurant.id && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add New Restaurant Card */}
          <div
            onClick={() => setShowCreateForm(true)}
            className="group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-dashed border-gray-300 hover:border-orange-400">
              <div className="h-32 flex items-center justify-center bg-gray-50 group-hover:bg-orange-50 transition-colors">
                <Plus className="w-16 h-16 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </div>
              
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-600 group-hover:text-orange-600 transition-colors">
                  Neues Restaurant
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Klicken Sie hier, um ein neues Restaurant hinzuzufügen
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {restaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <MapPin className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Keine Restaurants gefunden</h3>
              <p className="text-gray-600 mb-6">
                Es wurden noch keine Restaurants zu Ihrem Konto hinzugefügt.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Erstes Restaurant erstellen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Restaurant Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'R'}
                </div>
                <h3 className="text-xl font-bold text-gray-900">Neues Restaurant erstellen</h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={createLoading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-6">
              {/* Restaurant Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="z.B. La Bella Vista"
                  disabled={createLoading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Kurze Beschreibung des Restaurants..."
                  disabled={createLoading}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Straße, Hausnummer, PLZ Stadt"
                  disabled={createLoading}
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+49 30 12345678"
                    disabled={createLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="kontakt@restaurant.de"
                    disabled={createLoading}
                  />
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme-Farbe
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    disabled={createLoading}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newColor = getRandomColor();
                      setFormData(prev => ({ ...prev, color: newColor }));
                    }}
                    className="px-4 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                    disabled={createLoading}
                  >
                    Zufällige Farbe
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={createLoading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !formData.name.trim() || !formData.address.trim()}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center ${
                    createLoading || !formData.name.trim() || !formData.address.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Wird erstellt...
                    </>
                  ) : (
                    'Restaurant erstellen'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'R'}
                </div>
                <h3 className="text-xl font-bold text-gray-900">Restaurant bearbeiten</h3>
              </div>
              <button
                onClick={handleCloseEditForm}
                className="text-gray-400 hover:text-gray-600"
                disabled={editLoading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRestaurant} className="space-y-6">
              {/* Restaurant Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="z.B. La Bella Vista"
                  disabled={editLoading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Kurze Beschreibung des Restaurants..."
                  disabled={editLoading}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Straße, Hausnummer, PLZ Stadt"
                  disabled={editLoading}
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+49 30 12345678"
                    disabled={editLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="kontakt@restaurant.de"
                    disabled={editLoading}
                  />
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme-Farbe
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    disabled={editLoading}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newColor = getRandomColor();
                      setFormData(prev => ({ ...prev, color: newColor }));
                    }}
                    className="px-4 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                    disabled={editLoading}
                  >
                    Zufällige Farbe
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseEditForm}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={editLoading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={editLoading || !formData.name.trim() || !formData.address.trim()}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center ${
                    editLoading || !formData.name.trim() || !formData.address.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Wird aktualisiert...
                    </>
                  ) : (
                    'Restaurant aktualisieren'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Restaurant löschen</h3>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={deleteLoading}
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                <strong>Sind Sie absolut sicher, dass Sie das Restaurant "{deletingRestaurant.name}" löschen möchten?</strong>
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-400 mr-3">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-800 mb-1">
                      Achtung: Diese Aktion kann nicht rückgängig gemacht werden!
                    </h4>
                    <p className="text-sm text-red-700">
                      Alle Daten, Einstellungen, Finanzdaten und Berichte dieses Restaurants werden dauerhaft gelöscht und können nicht wiederhergestellt werden.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={deleteLoading}
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDeleteRestaurant}
                disabled={deleteLoading}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center ${
                  deleteLoading
                    ? 'bg-red-400 text-white cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Wird gelöscht...
                  </>
                ) : (
                  'Ja, Restaurant löschen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 