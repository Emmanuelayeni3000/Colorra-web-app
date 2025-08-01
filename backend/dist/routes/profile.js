"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const profileController_1 = require("../controllers/profileController");
const router = express_1.default.Router();
// All profile routes require authentication
router.use(auth_1.authenticateToken);
// GET /api/profile - Get user profile
router.get('/', profileController_1.getProfile);
// PUT /api/profile - Update user profile  
router.put('/', profileController_1.updateProfileValidation, profileController_1.updateProfile);
// PUT /api/profile/password - Change password
router.put('/password', profileController_1.changePasswordValidation, profileController_1.changePassword);
// POST /api/profile/avatar - Upload avatar
router.post('/avatar', upload_1.upload.single('avatar'), profileController_1.uploadAvatar);
exports.default = router;
//# sourceMappingURL=profile.js.map