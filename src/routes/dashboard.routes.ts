import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getDashboardData,
  getAccounts,
  getInventory
} from '../controllers/dashboard.controller';

const router = Router();

// All dashboard routes require authentication
// Todas as rotas do dashboard requerem autenticação
router.use(authenticateToken);

// GET /api/dashboard/:restaurantId/stats - Get dashboard stats for restaurant
// GET /api/dashboard/:restaurantId/stats - Obter estatísticas do dashboard para restaurante
router.get('/:restaurantId/stats', getDashboardStats);

// GET /api/dashboard/:restaurantId/data - Get complete dashboard data for restaurant
// GET /api/dashboard/:restaurantId/data - Obter dados completos do dashboard para restaurante
router.get('/:restaurantId/data', getDashboardData);

// GET /api/dashboard/:restaurantId/accounts - Get accounts for restaurant
// GET /api/dashboard/:restaurantId/accounts - Obter contas para restaurante
router.get('/:restaurantId/accounts', getAccounts);

// GET /api/dashboard/:restaurantId/inventory - Get inventory for restaurant
// GET /api/dashboard/:restaurantId/inventory - Obter inventário para restaurante
router.get('/:restaurantId/inventory', getInventory);

export default router; 