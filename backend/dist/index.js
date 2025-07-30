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
        : 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
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