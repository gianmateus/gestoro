"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentLimiter = exports.adminCreateLimiter = exports.loginLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Muitas tentativas. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`🚨 Rate limit excedido para IP: ${req.ip} - ${req.method} ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Muitas tentativas. Tente novamente em 15 minutos.',
            retryAfter: req.rateLimit ? Math.round(req.rateLimit.resetTime / 1000) : 900
        });
    }
});
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    },
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        console.warn(`🚨 Login rate limit excedido para IP: ${req.ip} - Email: ${req.body?.email || 'N/A'}`);
        res.status(429).json({
            success: false,
            message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
            retryAfter: req.rateLimit ? Math.round(req.rateLimit.resetTime / 1000) : 900
        });
    }
});
exports.adminCreateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Muitas criações em pouco tempo. Aguarde 1 minuto.'
    },
    handler: (req, res) => {
        console.warn(`🚨 Admin create rate limit excedido para IP: ${req.ip} - User: ${req.user?.email || 'N/A'}`);
        res.status(429).json({
            success: false,
            message: 'Muitas criações em pouco tempo. Aguarde 1 minuto.',
            retryAfter: req.rateLimit ? Math.round(req.rateLimit.resetTime / 1000) : 60
        });
    }
});
exports.paymentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Muitas operações de pagamento. Aguarde 5 minutos.'
    },
    handler: (req, res) => {
        console.warn(`🚨 Payment rate limit excedido para IP: ${req.ip} - User: ${req.user?.email || 'N/A'}`);
        res.status(429).json({
            success: false,
            message: 'Muitas operações de pagamento. Aguarde 5 minutos.',
            retryAfter: req.rateLimit ? Math.round(req.rateLimit.resetTime / 1000) : 300
        });
    }
});
//# sourceMappingURL=rateLimiter.middleware.js.map