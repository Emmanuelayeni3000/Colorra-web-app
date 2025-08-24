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
const errorHandler_1 = require("../middleware/errorHandler");
const followController = __importStar(require("../controllers/followController"));
const activityService_1 = require("../services/activityService");
const router = express_1.default.Router();
// Follow a user
router.post('/:id/follow', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { id: followingId } = req.params;
        const followerId = req.user.id;
        if (followerId === followingId) {
            throw (0, errorHandler_1.createError)('Cannot follow yourself', 400);
        }
        const follow = await followController.followUser(followerId, followingId);
        // Create activity for user follow
        await (0, activityService_1.createActivity)("USER_FOLLOWED", followerId, { targetUserId: followingId });
        res.status(201).json(follow);
    }
    catch (error) {
        next(error);
    }
});
// Unfollow a user
router.delete('/:id/follow', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { id: followingId } = req.params;
        const followerId = req.user.id;
        await followController.unfollowUser(followerId, followingId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// Get followers of a user
router.get('/:id/followers', async (req, res, next) => {
    try {
        const { id } = req.params;
        const followers = await followController.getFollowers(id);
        res.json(followers);
    }
    catch (error) {
        next(error);
    }
});
// Get users a user is following
router.get('/:id/following', async (req, res, next) => {
    try {
        const { id } = req.params;
        const following = await followController.getFollowing(id);
        res.json(following);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=follows.js.map