"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectRestaurant = exports.deleteRestaurantController = exports.updateRestaurant = exports.createNewRestaurant = exports.getRestaurant = exports.getAllRestaurants = void 0;
const restaurants_1 = require("../utils/restaurants");
const getAllRestaurants = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Benutzer nicht authentifiziert'
            });
            return;
        }
        console.log('🏪 Fetching restaurants for user:', req.user.id);
        const restaurants = await (0, restaurants_1.getRestaurantsForUser)(req.user.id);
        console.log('📋 Found restaurants:', restaurants.length);
        res.json({
            success: true,
            data: restaurants,
            message: `${restaurants.length} Restaurants gefunden`
        });
    }
    catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Abrufen der Restaurants'
        });
    }
};
exports.getAllRestaurants = getAllRestaurants;
const getRestaurant = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Benutzer nicht authentifiziert'
            });
            return;
        }
        const { restaurantId } = req.params;
        if (!restaurantId) {
            res.status(400).json({
                success: false,
                message: 'Restaurant-ID ist erforderlich'
            });
            return;
        }
        const restaurant = await (0, restaurants_1.getRestaurantById)(restaurantId, req.user.id);
        if (!restaurant) {
            res.status(404).json({
                success: false,
                message: 'Restaurant nicht gefunden'
            });
            return;
        }
        res.json({
            success: true,
            data: restaurant,
            message: 'Restaurant erfolgreich abgerufen'
        });
    }
    catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Abrufen des Restaurants'
        });
    }
};
exports.getRestaurant = getRestaurant;
const createNewRestaurant = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Benutzer nicht authentifiziert'
            });
            return;
        }
        const { name, description, address, phone, email, color } = req.body;
        if (!name || !address) {
            res.status(400).json({
                success: false,
                message: 'Name und Adresse sind erforderlich'
            });
            return;
        }
        const newRestaurant = await (0, restaurants_1.createRestaurant)({
            name,
            description,
            address,
            phone,
            email,
            color
        }, req.user.id);
        res.status(201).json({
            success: true,
            data: newRestaurant,
            message: 'Restaurant erfolgreich erstellt'
        });
    }
    catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Erstellen des Restaurants'
        });
    }
};
exports.createNewRestaurant = createNewRestaurant;
const updateRestaurant = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Benutzer nicht authentifiziert'
            });
            return;
        }
        const { restaurantId } = req.params;
        const { name, description, address, phone, email, color } = req.body;
        console.log('🔄 Updating restaurant:', { restaurantId, userId: req.user.id, name });
        if (!name || !address) {
            res.status(400).json({
                success: false,
                message: 'Name und Adresse sind erforderlich'
            });
            return;
        }
        const hasAccess = await (0, restaurants_1.validateRestaurantAccess)(restaurantId, req.user.id);
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                message: 'Kein Zugriff auf dieses Restaurant'
            });
            return;
        }
        const updatedRestaurant = await (0, restaurants_1.updateRestaurantData)(restaurantId, {
            name,
            description,
            address,
            phone,
            email,
            color
        }, req.user.id);
        if (!updatedRestaurant) {
            res.status(404).json({
                success: false,
                message: 'Restaurant nicht gefunden'
            });
            return;
        }
        console.log('✅ Restaurant updated successfully:', updatedRestaurant);
        res.json({
            success: true,
            data: updatedRestaurant,
            message: 'Restaurant erfolgreich aktualisiert'
        });
    }
    catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Aktualisieren des Restaurants'
        });
    }
};
exports.updateRestaurant = updateRestaurant;
const deleteRestaurantController = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Benutzer nicht authentifiziert'
            });
            return;
        }
        const { restaurantId } = req.params;
        if (!restaurantId) {
            res.status(400).json({
                success: false,
                message: 'Restaurant-ID ist erforderlich'
            });
            return;
        }
        console.log('🗑️ Deleting restaurant:', { restaurantId, userId: req.user.id });
        const hasAccess = await (0, restaurants_1.validateRestaurantAccess)(restaurantId, req.user.id);
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                message: 'Kein Zugriff auf dieses Restaurant'
            });
            return;
        }
        const result = await (0, restaurants_1.deleteRestaurant)(restaurantId, req.user.id);
        if (!result.success) {
            res.status(404).json({
                success: false,
                message: result.message
            });
            return;
        }
        console.log('✅ Restaurant deleted successfully:', restaurantId);
        res.json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        console.error('Error deleting restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Löschen des Restaurants'
        });
    }
};
exports.deleteRestaurantController = deleteRestaurantController;
const selectRestaurant = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Benutzer nicht authentifiziert'
            });
            return;
        }
        const { restaurantId } = req.body;
        if (!restaurantId) {
            res.status(400).json({
                success: false,
                message: 'Restaurant-ID ist erforderlich'
            });
            return;
        }
        const hasAccess = await (0, restaurants_1.validateRestaurantAccess)(restaurantId, req.user.id);
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                message: 'Kein Zugriff auf dieses Restaurant'
            });
            return;
        }
        const restaurant = await (0, restaurants_1.getRestaurantById)(restaurantId, req.user.id);
        res.json({
            success: true,
            data: {
                selectedRestaurant: restaurant,
                user: req.user
            },
            message: 'Restaurant erfolgreich ausgewählt'
        });
    }
    catch (error) {
        console.error('Error selecting restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Auswählen des Restaurants'
        });
    }
};
exports.selectRestaurant = selectRestaurant;
//# sourceMappingURL=restaurant.controller.js.map