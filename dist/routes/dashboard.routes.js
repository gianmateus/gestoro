"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get('/:restaurantId/stats', dashboard_controller_1.getDashboardStats);
router.get('/:restaurantId/data', dashboard_controller_1.getDashboardData);
router.get('/:restaurantId/accounts', dashboard_controller_1.getAccounts);
router.get('/:restaurantId/inventory', dashboard_controller_1.getInventory);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map