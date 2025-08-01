"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader);
        const token = authHeader && authHeader.split(' ')[1];
        console.log('Extracted token:', token ? `${token.substring(0, 20)}...` : 'null');
        if (!token) {
            console.log('No token provided');
            throw (0, errorHandler_1.createError)('Access token required', 401);
        }
        console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', { userId: decoded.userId, email: decoded.email });
        req.user = { id: decoded.userId, email: decoded.email };
        next();
    }
    catch (error) {
        console.error('Auth error:', error instanceof Error ? error.message : error);
        next((0, errorHandler_1.createError)('Invalid or expired token', 401));
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map