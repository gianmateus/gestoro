import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to get all restaurants for a user from database
// Função para obter todos os restaurantes para um usuário do banco de dados
export const getRestaurantsForUser = async (userId: string) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' }
    });
    return restaurants;
  } catch (error) {
    console.error('Error fetching restaurants for user:', error);
    return [];
  }
};

// Function to get a specific restaurant by ID from database
// Função para obter um restaurante específico por ID do banco de dados
export const getRestaurantById = async (restaurantId: string, userId: string) => {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: { 
        id: restaurantId,
        ownerId: userId 
      }
    });
    return restaurant;
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    return null;
  }
};

// Function to create a new restaurant in database
// Função para criar um novo restaurante no banco de dados
export const createRestaurant = async (restaurantData: {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  color?: string;
}, userId: string) => {
  try {
    const newRestaurant = await prisma.restaurant.create({
      data: {
        name: restaurantData.name,
        description: restaurantData.description || '',
        address: restaurantData.address,
        phone: restaurantData.phone || '',
        email: restaurantData.email || '',
        color: restaurantData.color || '#d96d62',
        ownerId: userId
      }
    });

    console.log('New restaurant created:', newRestaurant);
    return newRestaurant;
  } catch (error) {
    console.error('Error creating restaurant:', error);
    throw new Error('Fehler beim Erstellen des Restaurants');
  }
};

// Function to update restaurant data in database
// Função para atualizar dados do restaurante no banco de dados
export const updateRestaurantData = async (restaurantId: string, updateData: {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  color?: string;
}, userId: string) => {
  try {
    console.log('🔄 Updating restaurant data:', { restaurantId, updateData, userId });

    // Check if restaurant exists and belongs to user
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: { 
        id: restaurantId,
        ownerId: userId 
      }
    });

    if (!existingRestaurant) {
      console.log('❌ Restaurant not found or unauthorized:', restaurantId);
      return null;
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: updateData
    });

    console.log('✅ Updated restaurant:', updatedRestaurant);
    return updatedRestaurant;
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return null;
  }
};

// Function to delete restaurant from database
// Função para deletar restaurante do banco de dados
export const deleteRestaurant = async (restaurantId: string, userId: string) => {
  try {
    console.log('🗑️ Deleting restaurant:', { restaurantId, userId });

    // Check if restaurant exists and belongs to user
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: { 
        id: restaurantId,
        ownerId: userId 
      }
    });

    if (!existingRestaurant) {
      console.log('❌ Restaurant not found or unauthorized:', restaurantId);
      return { success: false, message: 'Restaurant nicht gefunden oder keine Berechtigung' };
    }

    // Delete the restaurant
    await prisma.restaurant.delete({
      where: { id: restaurantId }
    });

    console.log('✅ Restaurant deleted successfully:', restaurantId);
    return { success: true, message: 'Restaurant erfolgreich gelöscht' };
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return { success: false, message: 'Fehler beim Löschen des Restaurants' };
  }
};

// Function to validate restaurant access for user
// Função para validar acesso ao restaurante para usuário
export const validateRestaurantAccess = async (restaurantId: string, userId: string): Promise<boolean> => {
  try {
    console.log('🔍 Validating restaurant access:', { restaurantId, userId });
    
    const restaurant = await prisma.restaurant.findFirst({
      where: { 
        id: restaurantId,
        ownerId: userId 
      }
    });
    
    const hasAccess = restaurant !== null;
    
    console.log('🎯 Restaurant access result:', { 
      restaurantId, 
      userId, 
      hasAccess,
      restaurant: restaurant ? { id: restaurant.id, name: restaurant.name } : null
    });
    
    return hasAccess;
  } catch (error) {
    console.error('Error validating restaurant access:', error);
    return false;
  }
}; 