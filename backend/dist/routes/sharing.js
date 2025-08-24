"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sharingController_1 = require("../controllers/sharingController");
const auth_1 = require("../middleware/auth"); // Fixed import name
const router = express_1.default.Router();
// Share a palette with another user
router.post('/:paletteId/share', auth_1.authenticateToken, sharingController_1.sharePalette);
// Get palettes shared with the authenticated user
router.get('/shared-with-me', auth_1.authenticateToken, sharingController_1.getSharedPalettes);
// Search for users
router.get('/search-users', auth_1.authenticateToken, sharingController_1.searchUsers);
exports.default = router;
//# sourceMappingURL=sharing.js.map