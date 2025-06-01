"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePasswordHash = exports.getAllUsers = exports.verifyToken = exports.generateToken = exports.authenticateUser = exports.verifyPassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hash) => {
    return await bcryptjs_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
const authenticateUser = async (email, password) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email.toLowerCase(),
                isActive: true
            }
        });
        if (!user) {
            return null;
        }
        const isValidPassword = await (0, exports.verifyPassword)(password, user.password);
        if (!isValidPassword) {
            return null;
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    catch (error) {
        console.error('Error authenticating user:', error);
        return null;
    }
};
exports.authenticateUser = authenticateUser;
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role
    }, secret, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
const getAllUsers = async () => {
    try {
        const users = await prisma.user.findMany({
            where: { isActive: true },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return users;
    }
    catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
};
exports.getAllUsers = getAllUsers;
const generatePasswordHash = async (password) => {
    console.log(`Password: ${password}`);
    console.log(`Hash: ${await (0, exports.hashPassword)(password)}`);
};
exports.generatePasswordHash = generatePasswordHash;
//# sourceMappingURL=auth.js.map