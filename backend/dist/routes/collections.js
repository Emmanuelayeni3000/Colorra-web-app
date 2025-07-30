"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const collectionsController_1 = require("../controllers/collectionsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Create collection (protected route)
router.post('/', auth_1.authenticateToken, collectionsController_1.createCollectionValidation, collectionsController_1.createCollection);
// Get user collections (protected route)
router.get('/', auth_1.authenticateToken, collectionsController_1.getUserCollections);
// Add palette to collection (protected route)
router.post('/palette', auth_1.authenticateToken, collectionsController_1.addPaletteToCollectionValidation, collectionsController_1.addPaletteToCollection);
// Remove palette from collection (protected route)  
router.delete('/:collectionId/palette/:paletteId', auth_1.authenticateToken, collectionsController_1.removePaletteFromCollection);
// Delete collection (protected route)
router.delete('/:collectionId', auth_1.authenticateToken, collectionsController_1.deleteCollection);
exports.default = router;
//# sourceMappingURL=collections.js.map