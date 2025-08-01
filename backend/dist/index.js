"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const palettes_1 = __importDefault(require("./routes/palettes"));
const profile_1 = __importDefault(require("./routes/profile"));
const search_1 = __importDefault(require("./routes/search"));
const passwordReset_1 = __importDefault(require("./routes/passwordReset"));
const upload_1 = __importDefault(require("./routes/upload"));
const sharing_1 = __importDefault(require("./routes/sharing"));
const collections_1 = __importDefault(require("./routes/collections"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://your-frontend-domain.com'
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.path.includes('/avatar')) {
        console.log('Avatar request headers:', req.headers);
        console.log('Avatar request file:', !!req.file);
    }
    next();
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files
const uploadsPath = path_1.default.resolve(__dirname, '../uploads');
console.log('Serving static files from:', uploadsPath);
app.use('/uploads', express_1.default.static(uploadsPath));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/palettes', palettes_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/search', search_1.default);
app.use('/api/password-reset', passwordReset_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/sharing', sharing_1.default);
app.use('/api/collections', collections_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Test upload directory
app.get('/api/test-uploads', (req, res) => {
    const uploadsPath = path_1.default.resolve(__dirname, '../uploads');
    const fs = require('fs');
    try {
        const files = fs.readdirSync(uploadsPath);
        res.json({
            status: 'OK',
            uploadsPath,
            files,
            message: 'Upload directory accessible'
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'ERROR',
            uploadsPath,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Upload directory not accessible'
        });
    }
});
// Test JWT token verification
app.get('/api/test-auth', (req, res) => {
    const jwt = require('jsonwebtoken');
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.json({
            status: 'NO_TOKEN',
            message: 'No authorization header or token found',
            authHeader
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            status: 'VALID_TOKEN',
            decoded,
            message: 'Token is valid',
            tokenStart: token.substring(0, 20)
        });
    }
    catch (error) {
        res.json({
            status: 'INVALID_TOKEN',
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Token verification failed',
            tokenStart: token.substring(0, 20),
            jwtSecret: !!process.env.JWT_SECRET
        });
    }
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
//# sourceMappingURL=index.js.map