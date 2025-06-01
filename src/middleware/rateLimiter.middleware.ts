import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Estender interface Request para incluir rateLimit e user
interface RateLimitRequest extends Request {
  rateLimit?: {
    resetTime: number;
  };
  user?: {
    email: string;
  };
}

// Rate limiter geral para todas as rotas
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela de tempo
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  handler: (req: RateLimitRequest, res) => {
    console.warn(`🚨 Rate limit excedido para IP: ${req.ip} - ${req.method} ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas. Tente novamente em 15 minutos.',
      retryAfter: req.rateLimit ? Math.round(req.rateLimit.resetTime / 1000) : 900
    });
  }
});

// Rate limiter específico para login (mais restritivo)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP por janela de tempo
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true, // Não conta requests bem-sucedidos
  handler: (req: RateLimitRequest, res) => {
    console.warn(`🚨 Login rate limit excedido para IP: ${req.ip} - Email: ${req.body?.email || 'N/A'}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      retryAfter: req.rateLimit ? Math.round(req.rateLimit.resetTime / 1000) : 900
    });
  }
});

// Rate limiter para criação de recursos (admin)
export const adminCreateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 criações por minuto
  message: {
    success: false,
    message: 'Muitas criações em pouco tempo. Aguarde 1 minuto.'
  },
  handler: (req: RateLimitRequest, res) => {
    console.warn(`🚨 Admin create rate limit excedido para IP: ${req.ip} - User: ${req.user?.email || 'N/A'}`);
    res.status(429).json({
      success: false,
      message: 'Muitas criações em pouco tempo. Aguarde 1 minuto.',
      retryAfter: req.rateLimit ? Math.round(req.rateLimit.resetTime / 1000) : 60
    });
  }
});

// Rate limiter para operações sensíveis de pagamento
export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo 20 operações de pagamento por 5 minutos
  message: {
    success: false,
    message: 'Muitas operações de pagamento. Aguarde 5 minutos.'
  },
  handler: (req: RateLimitRequest, res) => {
    console.warn(`🚨 Payment rate limit excedido para IP: ${req.ip} - User: ${req.user?.email || 'N/A'}`);
    res.status(429).json({
      success: false,
      message: 'Muitas operações de pagamento. Aguarde 5 minutos.',
      retryAfter: req.rateLimit ? Math.round(req.rateLimit.resetTime / 1000) : 300
    });
  }
}); 