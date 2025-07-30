"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileUpload = exports.getFileUrl = exports.deleteUploadedFile = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const promises_1 = __importDefault(require("fs/promises"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        // Create uploads directory if it doesn't exist
        try {
            await promises_1.default.access(uploadDir);
        }
        catch {
            await promises_1.default.mkdir(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
};
// Configure multer
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Single file upload
    }
});
// Utility function to delete uploaded file
const deleteUploadedFile = async (filename) => {
    try {
        const filePath = path_1.default.join(__dirname, '../../uploads', filename);
        await promises_1.default.unlink(filePath);
    }
    catch (error) {
        console.error('Error deleting file:', error);
    }
};
exports.deleteUploadedFile = deleteUploadedFile;
// Utility function to get file URL
const getFileUrl = (filename) => {
    return `http://localhost:5000/uploads/${filename}`;
};
exports.getFileUrl = getFileUrl;
// Validate file upload
const validateFileUpload = (file) => {
    if (!file) {
        return { isValid: false, error: 'No file uploaded' };
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        return { isValid: false, error: 'Only image files are allowed' };
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { isValid: false, error: 'File size must be less than 5MB' };
    }
    return { isValid: true, error: null };
};
exports.validateFileUpload = validateFileUpload;
//# sourceMappingURL=upload.js.map