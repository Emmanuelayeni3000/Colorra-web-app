"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passwordResetController_1 = require("../controllers/passwordResetController");
const router = express_1.default.Router();
// Request password reset
router.post('/request', passwordResetController_1.requestPasswordResetValidation, passwordResetController_1.requestPasswordReset);
// Reset password with token
router.post('/reset', passwordResetController_1.resetPasswordValidation, passwordResetController_1.resetPassword);
exports.default = router;
//# sourceMappingURL=passwordReset.js.map