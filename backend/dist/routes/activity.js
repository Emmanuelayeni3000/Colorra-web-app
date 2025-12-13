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
const auth_1 = require("../middleware/auth");
const activityController = __importStar(require("../controllers/activityController"));
const router = express_1.default.Router();
// Get global activity feed
router.get('/global', async (req, res, next) => {
    try {
        const { limit, offset } = req.query;
        const activities = await activityController.getGlobalFeed(limit ? parseInt(limit) : undefined, offset ? parseInt(offset) : undefined);
        res.json(activities);
    }
    catch (error) {
        next(error);
    }
});
// Get personalized activity feed
router.get('/me', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { limit, offset } = req.query;
        const userId = req.user.id;
        const activities = await activityController.getPersonalizedFeed(userId, limit ? parseInt(limit) : undefined, offset ? parseInt(offset) : undefined);
        res.json(activities);
    }
    catch (error) {
        next(error);
    }
});
// Delete an activity (only the owner can delete)
router.delete('/:activityId', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const userId = req.user.id;
        const result = await activityController.deleteActivity(activityId, userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=activity.js.map