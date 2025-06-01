"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const restaurant_routes_1 = __importDefault(require("./routes/restaurant.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3001',
        'file://'
    ],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('combined'));
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Restaurant Financial Management API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/restaurants', restaurant_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
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
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/api`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map