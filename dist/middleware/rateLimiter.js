"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLimiter = exports.strictLimiter = exports.apiLimiter = exports.loginLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
    }
});
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Muitas requisições. Tente novamente em 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.path === '/health';
    }
});
exports.strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        error: 'Limite de ações sensíveis excedido. Tente novamente em 1 hora.',
        code: 'STRICT_RATE_LIMIT_EXCEEDED',
        retryAfter: 60 * 60
    },
    standardHeaders: true,
    legacyHeaders: false
});
exports.createLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: {
        error: 'Muitas operações de criação. Tente novamente em 10 minutos.',
        code: 'CREATE_RATE_LIMIT_EXCEEDED',
        retryAfter: 10 * 60
    },
    standardHeaders: true,
    legacyHeaders: false
});
//# sourceMappingURL=rateLimiter.js.map