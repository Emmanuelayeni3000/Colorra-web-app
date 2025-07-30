"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserImages = exports.deleteImage = exports.uploadImage = void 0;
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const upload_1 = require("../middleware/upload");
const prisma = new client_1.PrismaClient();
// Server-side color extraction using a simple approach
// Note: In a production environment, you'd want to use a proper image processing library
const extractColorsFromImage = async (imagePath) => {
    // This is a simplified approach - in production you'd use libraries like:
    // - sharp with color extraction
    // - node-vibrant
    // - get-image-colors
    // For demo purposes, return some sample colors
    // In a real implementation, you'd process the image file
    const sampleColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    // Return random colors for demo (replace with actual color extraction)
    const shuffled = sampleColors.sort(() => 0.5 - Math.random());
    const selectedColors = shuffled.slice(0, 6);
    return {
        dominantColor: selectedColors[0],
        colors: selectedColors
    };
};
// Upload image and extract colors
const uploadImage = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Validate file upload
        const validation = (0, upload_1.validateFileUpload)(req.file);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.error });
        }
        const file = req.file;
        const filePath = path_1.default.join(__dirname, '../../uploads', file.filename);
        const fileUrl = (0, upload_1.getFileUrl)(file.filename);
        try {
            // Extract colors from image using our server-side approach
            const { dominantColor, colors } = await extractColorsFromImage(filePath);
            res.json({
                message: 'Image uploaded and colors extracted successfully',
                data: {
                    filename: file.filename,
                    url: fileUrl,
                    originalName: file.originalname,
                    size: file.size,
                    dominantColor,
                    colors
                }
            });
        }
        catch (colorExtractionError) {
            console.error('Color extraction error:', colorExtractionError);
            // Clean up uploaded file on error
            await (0, upload_1.deleteUploadedFile)(file.filename);
            res.status(500).json({
                message: 'Failed to extract colors from image',
                error: 'Color extraction failed'
            });
        }
    }
    catch (error) {
        console.error('Upload image error:', error);
        // Clean up uploaded file on error
        if (req.file) {
            await (0, upload_1.deleteUploadedFile)(req.file.filename);
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.uploadImage = uploadImage;
// Delete uploaded image
const deleteImage = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { filename } = req.params;
        if (!filename) {
            return res.status(400).json({ message: 'Filename is required' });
        }
        // Delete the file
        await (0, upload_1.deleteUploadedFile)(filename);
        res.json({ message: 'Image deleted successfully' });
    }
    catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteImage = deleteImage;
// Get user's uploaded images
const getUserImages = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // In a real application, you'd store image metadata in the database
        // For now, we'll return a simple response
        res.json({
            message: 'User images retrieved successfully',
            data: {
                images: [],
                note: 'Image metadata storage not implemented yet'
            }
        });
    }
    catch (error) {
        console.error('Get user images error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserImages = getUserImages;
//# sourceMappingURL=uploadController.js.map