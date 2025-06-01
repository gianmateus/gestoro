import { Request, Response } from 'express';
import { validateRestaurantAccess } from '../utils/restaurants';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface for authenticated request - Interface para requisição autenticada
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Get restaurant stats from database
const getRestaurantStatsFromDB = async (restaurantId: string) => {
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

  // Calculate stats from real data
  const totalReceivable = restaurant.accountsReceivable.reduce((sum, account) => 
    sum + Number(account.amount), 0);
  const totalPayable = restaurant.accountsPayable.reduce((sum, account) => 
    sum + Number(account.amount), 0);
  const upcomingEvents = restaurant.calendarEvents.filter(event => 
    new Date(event.startDate) >= new Date()).length;

  return {
    dailyRevenue: totalReceivable, // Use receivables as daily revenue
    orders: restaurant.accountsReceivable.length,
    appointments: upcomingEvents,
    weeklyProfit: totalReceivable - totalPayable
  };
};

// Get accounts from database
const getRestaurantAccountsFromDB = async (restaurantId: string) => {
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

// Get inventory from database
const getRestaurantInventoryFromDB = async (restaurantId: string) => {
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

// Get events from database
const getRestaurantEventsFromDB = async (restaurantId: string) => {
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

// Get dashboard stats for a specific restaurant
// Obter estatísticas do dashboard para um restaurante específico
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const { restaurantId } = req.params;

    // Validate restaurant access
    // Validar acesso ao restaurante
    const hasAccess = await validateRestaurantAccess(restaurantId, authReq.user.id);
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
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Abrufen der Dashboard-Statistiken' 
    });
  }
};

// Get complete dashboard data for a restaurant
// Obter dados completos do dashboard para um restaurante
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
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

    // Validate restaurant access
    // Validar acesso ao restaurante
    const hasAccess = await validateRestaurantAccess(restaurantId, authReq.user.id);
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

    // Get all data for the restaurant
    // Obter todos os dados para o restaurante
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

    // Calculate additional metrics
    // Calcular métricas adicionais
    const pendingPayables = accounts.payable.filter(p => p.status === 'PENDING').length;
    const overduePayables = accounts.payable.filter(p => p.status === 'OVERDUE').length;
    const pendingReceivables = accounts.receivable.filter(r => r.status === 'PENDING').length;
    const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity).length;
    const pendingPurchases = 0; // Assuming no purchases are tracked in the database
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
        payable: accounts.payable.slice(0, 5), // Latest 5
        receivable: accounts.receivable.slice(0, 5) // Latest 5
      },
      inventory: inventory.slice(0, 8), // Top 8 items
      purchases: [], // No purchases tracked in the database
      events: events.slice(0, 5) // Next 5 events
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard-Daten erfolgreich abgerufen'
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Abrufen der Dashboard-Daten' 
    });
  }
};

// Get accounts for a specific restaurant
// Obter contas para um restaurante específico
export const getAccounts = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const { restaurantId } = req.params;

    // Validate restaurant access
    // Validar acesso ao restaurante
    const hasAccess = await validateRestaurantAccess(restaurantId, authReq.user.id);
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
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Abrufen der Konten' 
    });
  }
};

// Get inventory for a specific restaurant
// Obter inventário para um restaurante específico
export const getInventory = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Benutzer nicht authentifiziert' 
      });
      return;
    }

    const { restaurantId } = req.params;

    // Validate restaurant access
    // Validar acesso ao restaurante
    const hasAccess = await validateRestaurantAccess(restaurantId, authReq.user.id);
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
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Abrufen des Inventars' 
    });
  }
}; 