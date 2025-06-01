"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_schemas_1 = require("../utils/validation.schemas");
const router = (0, express_1.Router)();
router.post('/login', rateLimiter_middleware_1.loginLimiter, (0, validation_middleware_1.validateData)(validation_schemas_1.loginSchema), auth_controller_1.login);
router.post('/logout', rateLimiter_middleware_1.generalLimiter, auth_controller_1.logout);
router.get('/verify', rateLimiter_middleware_1.generalLimiter, auth_controller_1.verifyTokenEndpoint);
router.get('/profile', rateLimiter_middleware_1.generalLimiter, auth_controller_1.getProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map