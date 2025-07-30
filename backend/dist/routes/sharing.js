"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sharingController_1 = require("../controllers/sharingController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Share a palette (protected route)
router.post('/share', auth_1.authenticateToken, sharingController_1.sharePaletteValidation, sharingController_1.sharePalette);
// Get palettes shared with me (protected route)
router.get('/received', auth_1.authenticateToken, sharingController_1.getSharedPalettes);
// Get palettes I've shared (protected route)
router.get('/sent', auth_1.authenticateToken, sharingController_1.getMySharedPalettes);
// Remove palette share (protected route)
router.delete('/:shareId', auth_1.authenticateToken, sharingController_1.removePaletteShare);
exports.default = router;
//# sourceMappingURL=sharing.js.map