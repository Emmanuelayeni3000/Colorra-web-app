"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadController_1 = require("../controllers/uploadController");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Upload image (protected route)
router.post('/image', auth_1.authenticateToken, upload_1.upload.single('image'), uploadController_1.uploadImage);
// Delete image (protected route)
router.delete('/image/:filename', auth_1.authenticateToken, uploadController_1.deleteImage);
// Get user images (protected route)
router.get('/images', auth_1.authenticateToken, uploadController_1.getUserImages);
exports.default = router;
//# sourceMappingURL=upload.js.map