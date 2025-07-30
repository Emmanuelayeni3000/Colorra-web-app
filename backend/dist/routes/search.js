"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const searchController_1 = require("../controllers/searchController");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// All search routes require authentication
router.use(auth_1.authenticateToken);
// GET /api/search/palettes - Advanced palette search
router.get('/palettes', [
    (0, express_validator_1.query)('query').optional().isString().trim().isLength({ max: 100 }),
    (0, express_validator_1.query)('colors').optional().isString(),
    (0, express_validator_1.query)('dateFrom').optional().isISO8601(),
    (0, express_validator_1.query)('dateTo').optional().isISO8601(),
    (0, express_validator_1.query)('favorites').optional().isBoolean(),
    (0, express_validator_1.query)('sortBy').optional().isIn(['name', 'createdAt', 'updatedAt']),
    (0, express_validator_1.query)('sortOrder').optional().isIn(['asc', 'desc']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 })
], searchController_1.searchPalettes);
// GET /api/search/colors/suggestions - Get color suggestions for autocomplete
router.get('/colors/suggestions', [
    (0, express_validator_1.query)('query').isString().trim().isLength({ min: 1, max: 20 })
], searchController_1.getColorSuggestions);
// GET /api/search/colors/popular - Get popular colors from user's palettes
router.get('/colors/popular', searchController_1.getPopularColors);
exports.default = router;
//# sourceMappingURL=search.js.map