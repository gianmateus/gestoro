"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const auth_1 = require("../utils/auth");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Zugangstoken erforderlich'
        });
        return;
    }
    try {
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            res.status(403).json({
                success: false,
                message: 'Ungültiges Token'
            });
            return;
        }
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.email.split('@')[0],
            role: decoded.role
        };
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({
            success: false,
            message: 'Ungültiges oder abgelaufenes Token'
        });
        return;
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.middleware.js.map