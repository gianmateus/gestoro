"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const restaurant_controller_1 = require("../controllers/restaurant.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get('/', restaurant_controller_1.getAllRestaurants);
router.get('/:restaurantId', restaurant_controller_1.getRestaurant);
router.post('/', restaurant_controller_1.createNewRestaurant);
router.put('/:restaurantId', restaurant_controller_1.updateRestaurant);
router.delete('/:restaurantId', restaurant_controller_1.deleteRestaurantController);
router.post('/select', restaurant_controller_1.selectRestaurant);
exports.default = router;
//# sourceMappingURL=restaurant.routes.js.map