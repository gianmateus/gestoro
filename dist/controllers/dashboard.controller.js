"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventory = exports.getAccounts = exports.getDashboardData = exports.getDashboardStats = void 0;
const restaurants_1 = require("../utils/restaurants");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getRestaurantStatsFromDB = async (restaurantId) => {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
            accountsPayable: true,
            accountsReceivable: true,
            inventoryItems: true,
            calendarEvents: true
        }
    });
    if (!restaurant) {
        return {
            dailyRevenue: 0,
            orders: 0,
            appointments: 0,
            weeklyProfit: 0
        };
    }
    const totalReceivable = restaurant.accountsReceivable.reduce((sum, account) => sum + Number(account.amount), 0);
    const totalPayable = restaurant.accountsPayable.reduce((sum, account) => sum + Number(account.amount), 0);
    const upcomingEvents = restaurant.calendarEvents.filter(event => new Date(event.startDate) >= new Date()).length;
    return {
        dailyRevenue: totalReceivable,
        orders: restaurant.accountsReceivable.length,
        appointments: upcomingEvents,
        weeklyProfit: totalReceivable - totalPayable
    };
};
const getRestaurantAccountsFromDB = async (restaurantId) => {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
            accountsPayable: true,
            accountsReceivable: true
        }
    });
    if (!restaurant) {
        return { payable: [], receivable: [] };
    }
    return {
        payable: restaurant.accountsPayable.map(account => ({
            id: account.id,
            vendor: account.vendor || 'Unbekannt',
            amount: Number(account.amount),
            dueDate: account.dueDate.toISOString(),
            status: account.status,
            category: account.category,
            description: account.description
        })),
        receivable: restaurant.accountsReceivable.map(account => ({
            id: account.id,
            customer: account.customer || 'Unbekannt',
            amount: Number(account.amount),
            dueDate: account.dueDate.toISOString(),
            status: account.status,
            category: account.category,
            description: account.description
        }))
    };
};
const getRestaurantInventoryFromDB = async (restaurantId) => {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
            inventoryItems: true
        }
    });
    if (!restaurant) {
        return [];
    }
    return restaurant.inventoryItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: Number(item.quantity),
        unit: item.unit,
        minQuantity: Number(item.minQuantity),
        costPrice: Number(item.costPrice),
        supplier: item.supplier || 'Unbekannt'
    }));
};
const getRestaurantEventsFromDB = async (restaurantId) => {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
            calendarEvents: true
        }
    });
    if (!restaurant) {
        return [];
    }
    return restaurant.calendarEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        type: event.type,
        priority: event.priority
    }));
};
const getDashboardStats = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({
                success: false,
                message: 'Benutzer nicht authentifiziert'
            });
            return;
        }
        const { restaurantId } = req.params;
        const hasAccess = await (0, restaurants_1.validateRestaurantAccess)(restaurantId, authReq.user.id);
        if (!hasAccess) {
            console.log('❌ Access denied to restaurant:', {
                userId: authReq.user.id,
                restaurantId
            });
            res.status(403).json({
                success: false,
                message: 'Kein Zugriff auf dieses Restaurant'
            });
            return;
        }
        const stats = await getRestaurantStatsFromDB(restaurantId);
        console.log('✅ Returning stats for restaurant:', restaurantId);
        res.json({
            success: true,
            data: stats,
            message: 'Dashboard-Statistiken erfolgreich abgerufen'
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Abrufen der Dashboard-Statistiken'
        });
    }
};
exports.getDashboardStats = getDashboardStats;
const getDashboardData = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            console.log('❌ User not authenticated for dashboard data');
            res.status(401).json({
                success: false,
                message: 'Benutzer nicht authentifiziert'
            });
            return;
        }
        const { restaurantId } = req.params;
        console.log('🔍 Dashboard Data Request:', {
            userId: authReq.user.id,
            restaurantId,
            userEmail: authReq.user.email
        });
        const hasAccess = await (0, restaurants_1.validateRestaurantAccess)(restaurantId, authReq.user.id);
        if (!hasAccess) {
            console.log('❌ Access denied to restaurant for dashboard data:', {
                userId: authReq.user.id,
                restaurantId
            });
            res.status(403).json({
                success: false,
                message: 'Kein Zugriff auf dieses Restaurant'
            });
            return;
        }
        console.log('✅ Access granted, fetching data for restaurant:', restaurantId);
        const stats = await getRestaurantStatsFromDB(restaurantId);
        const accounts = await getRestaurantAccountsFromDB(restaurantId);
        const inventory = await getRestaurantInventoryFromDB(restaurantId);
        const events = await getRestaurantEventsFromDB(restaurantId);
        console.log('📊 Data fetched successfully:', {
            restaurantId,
            hasStats: !!stats,
            accountsCount: accounts.payable.length + accounts.receivable.length,
            inventoryCount: inventory.length
        });
        const pendingPayables = accounts.payable.filter(p => p.status === 'PENDING').length;
        const overduePayables = accounts.payable.filter(p => p.status === 'OVERDUE').length;
        const pendingReceivables = accounts.receivable.filter(r => r.status === 'PENDING').length;
        const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity).length;
        const pendingPurchases = 0;
        const upcomingEvents = events.filter(e => new Date(e.startDate) >= new Date()).length;
        const dashboardData = {
            stats,
            summary: {
                pendingPayables,
                overduePayables,
                pendingReceivables,
                lowStockItems,
                pendingPurchases,
                upcomingEvents
            },
            accounts: {
                payable: accounts.payable.slice(0, 5),
                receivable: accounts.receivable.slice(0, 5)
            },
            inventory: inventory.slice(0, 8),
            purchases: [],
            events: events.slice(0, 5)
        };
        res.json({
            success: true,
            data: dashboardData,
            message: 'Dashboard-Daten erfolgreich abgerufen'
        });
    }
    catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Abrufen der Dashboard-Daten'
        });
    }
};
exports.getDashboardData = getDashboardData;
const getAccounts = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({
                success: false,
                message: 'Benutzer nicht authentifiziert'
            });
            return;
        }
        const { restaurantId } = req.params;
        const hasAccess = await (0, restaurants_1.validateRestaurantAccess)(restaurantId, authReq.user.id);
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                message: 'Kein Zugriff auf dieses Restaurant'
            });
            return;
        }
        const accounts = await getRestaurantAccountsFromDB(restaurantId);
        res.json({
            success: true,
            data: accounts,
            message: 'Konten erfolgreich abgerufen'
        });
    }
    catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Abrufen der Konten'
        });
    }
};
exports.getAccounts = getAccounts;
const getInventory = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({
                success: false,
                message: 'Benutzer nicht authentifiziert'
            });
            return;
        }
        const { restaurantId } = req.params;
        const hasAccess = await (0, restaurants_1.validateRestaurantAccess)(restaurantId, authReq.user.id);
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                message: 'Kein Zugriff auf dieses Restaurant'
            });
            return;
        }
        const inventory = await getRestaurantInventoryFromDB(restaurantId);
        res.json({
            success: true,
            data: inventory,
            message: 'Inventar erfolgreich abgerufen'
        });
    }
    catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Abrufen des Inventars'
        });
    }
};
exports.getInventory = getInventory;
//# sourceMappingURL=dashboard.controller.js.map