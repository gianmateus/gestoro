import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes - Importar rotas
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import dashboardRoutes from './routes/dashboard.routes';
import adminRoutes from './routes/admin.routes';

// Load environment variables - Carrega variáveis de ambiente
dotenv.config();

// Create Express application - Cria aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware - Middleware de segurança
app.use(helmet());

// Rate limiting - Limitação de taxa
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Configuração CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3001',
    'file://'
  ],
  credentials: true
}));

// Body parsing middleware - Middleware de análise do corpo da requisição
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware - Middleware de log
app.use(morgan('combined'));

// Health check endpoint - Endpoint de verificação de saúde
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Restaurant Financial Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes - Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// API info endpoint - Endpoint de informações da API
app.get('/api', (_req, res) => {
  res.json({
    message: 'Restaurant Financial Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        verify: 'GET /api/auth/verify',
        profile: 'GET /api/auth/profile'
      },
      restaurants: {
        list: 'GET /api/restaurants',
        get: 'GET /api/restaurants/:id',
        create: 'POST /api/restaurants',
        select: 'POST /api/restaurants/select'
      },
      dashboard: {
        stats: 'GET /api/dashboard/:restaurantId/stats',
        data: 'GET /api/dashboard/:restaurantId/data',
        accounts: 'GET /api/dashboard/:restaurantId/accounts',
        inventory: 'GET /api/dashboard/:restaurantId/inventory'
      }
    }
  });
});

// 404 handler - Manipulador de erro 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler - Manipulador global de erros
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server - Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app; 