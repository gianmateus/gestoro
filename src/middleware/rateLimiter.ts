import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Rate limiter específico para login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Bloquear por IP específico
  keyGenerator: (req: Request): string => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

// Rate limiter geral para API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request): boolean => {
    // Pular rate limit para health check
    return req.path === '/health';
  }
});

// Rate limiter rigoroso para ações sensíveis
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Apenas 10 ações por hora
  message: {
    error: 'Limite de ações sensíveis excedido. Tente novamente em 1 hora.',
    code: 'STRICT_RATE_LIMIT_EXCEEDED',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para criação/modificação
export const createLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // 20 criações por 10 minutos
  message: {
    error: 'Muitas operações de criação. Tente novamente em 10 minutos.',
    code: 'CREATE_RATE_LIMIT_EXCEEDED',
    retryAfter: 10 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
}); 