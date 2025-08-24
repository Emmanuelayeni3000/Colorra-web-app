"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const commentController = __importStar(require("../controllers/commentController"));
const activityService_1 = require("../services/activityService"); // Will create this next
const router = express_1.default.Router();
// Get all comments for a specific palette
router.get('/:paletteId/comments', async (req, res, next) => {
    try {
        const { paletteId } = req.params;
        const comments = await commentController.getCommentsForPalette(paletteId);
        res.json(comments);
    }
    catch (error) {
        next(error);
    }
});
// Add a comment to a palette
router.post('/:paletteId/comments', auth_1.authenticateToken, [
    (0, express_validator_1.body)('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment content must be between 1 and 500 characters.'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const { paletteId } = req.params;
        const { content } = req.body;
        const authorId = req.user.id;
        const comment = await commentController.addCommentToPalette(paletteId, authorId, content);
        // Create activity for comment added
        await (0, activityService_1.createActivity)("COMMENT_ADDED", authorId, { paletteId, commentId: comment.id });
        res.status(201).json(comment);
    }
    catch (error) {
        next(error);
    }
});
// Update a comment
router.put('/:commentId', auth_1.authenticateToken, [
    (0, express_validator_1.body)('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment content must be between 1 and 500 characters.'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id; // User making the request
        const updatedComment = await commentController.updateComment(commentId, userId, content);
        res.json(updatedComment);
    }
    catch (error) {
        next(error);
    }
});
// Delete a comment
router.delete('/:commentId', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id; // User making the request
        await commentController.deleteComment(commentId, userId);
        res.status(204).send(); // No content on successful deletion
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=comments.js.map