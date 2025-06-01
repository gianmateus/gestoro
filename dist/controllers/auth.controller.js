"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.logout = exports.verifyTokenEndpoint = exports.login = void 0;
const auth_1 = require("../utils/auth");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email und Passwort sind erforderlich'
            });
            return;
        }
        const user = await (0, auth_1.authenticateUser)(email, password);
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Ungültige Anmeldedaten'
            });
            return;
        }
        const token = (0, auth_1.generateToken)(user);
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            },
            message: 'Erfolgreich angemeldet'
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Interner Serverfehler'
        });
    }
};
exports.login = login;
const verifyTokenEndpoint = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Token nicht bereitgestellt'
            });
            return;
        }
        const token = authHeader.substring(7);
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            res.status(401).json({
                success: false,
                error: 'Ungültiger oder abgelaufener Token'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role
                }
            }
        });
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Interner Serverfehler'
        });
    }
};
exports.verifyTokenEndpoint = verifyTokenEndpoint;
const logout = async (_req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Erfolgreich abgemeldet'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Interner Serverfehler'
        });
    }
};
exports.logout = logout;
const getProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Token nicht bereitgestellt'
            });
            return;
        }
        const token = authHeader.substring(7);
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            res.status(401).json({
                success: false,
                error: 'Ungültiger oder abgelaufener Token'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role
                }
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Interner Serverfehler'
        });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=auth.controller.js.map