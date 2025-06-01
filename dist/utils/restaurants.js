"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRestaurantAccess = exports.deleteRestaurant = exports.updateRestaurantData = exports.createRestaurant = exports.getRestaurantById = exports.getRestaurantsForUser = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getRestaurantsForUser = async (userId) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: 'desc' }
        });
        return restaurants;
    }
    catch (error) {
        console.error('Error fetching restaurants for user:', error);
        return [];
    }
};
exports.getRestaurantsForUser = getRestaurantsForUser;
const getRestaurantById = async (restaurantId, userId) => {
    try {
        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: restaurantId,
                ownerId: userId
            }
        });
        return restaurant;
    }
    catch (error) {
        console.error('Error fetching restaurant by ID:', error);
        return null;
    }
};
exports.getRestaurantById = getRestaurantById;
const createRestaurant = async (restaurantData, userId) => {
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
    }
    catch (error) {
        console.error('Error creating restaurant:', error);
        throw new Error('Fehler beim Erstellen des Restaurants');
    }
};
exports.createRestaurant = createRestaurant;
const updateRestaurantData = async (restaurantId, updateData, userId) => {
    try {
        console.log('🔄 Updating restaurant data:', { restaurantId, updateData, userId });
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
    }
    catch (error) {
        console.error('Error updating restaurant:', error);
        return null;
    }
};
exports.updateRestaurantData = updateRestaurantData;
const deleteRestaurant = async (restaurantId, userId) => {
    try {
        console.log('🗑️ Deleting restaurant:', { restaurantId, userId });
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
        await prisma.restaurant.delete({
            where: { id: restaurantId }
        });
        console.log('✅ Restaurant deleted successfully:', restaurantId);
        return { success: true, message: 'Restaurant erfolgreich gelöscht' };
    }
    catch (error) {
        console.error('Error deleting restaurant:', error);
        return { success: false, message: 'Fehler beim Löschen des Restaurants' };
    }
};
exports.deleteRestaurant = deleteRestaurant;
const validateRestaurantAccess = async (restaurantId, userId) => {
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
    }
    catch (error) {
        console.error('Error validating restaurant access:', error);
        return false;
    }
};
exports.validateRestaurantAccess = validateRestaurantAccess;
//# sourceMappingURL=restaurants.js.map