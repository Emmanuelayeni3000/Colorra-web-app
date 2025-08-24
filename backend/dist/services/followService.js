"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowing = exports.getFollowers = exports.unfollowUser = exports.followUser = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma = new client_1.PrismaClient();
const followUser = async (followerId, followingId) => {
    // Check if users exist
    const follower = await prisma.user.findUnique({ where: { id: followerId } });
    const following = await prisma.user.findUnique({ where: { id: followingId } });
    if (!follower || !following) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });
    if (existingFollow) {
        throw (0, errorHandler_1.createError)('Already following this user', 400);
    }
    const follow = await prisma.follow.create({
        data: {
            followerId,
            followingId,
        },
    });
    return follow;
};
exports.followUser = followUser;
const unfollowUser = async (followerId, followingId) => {
    const follow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });
    if (!follow) {
        throw (0, errorHandler_1.createError)('Not following this user', 400);
    }
    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });
};
exports.unfollowUser = unfollowUser;
const getFollowers = async (userId) => {
    const followers = await prisma.follow.findMany({
        where: { followingId: userId },
        include: {
            follower: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });
    return followers.map(f => f.follower);
};
exports.getFollowers = getFollowers;
const getFollowing = async (userId) => {
    const following = await prisma.follow.findMany({
        where: { followerId: userId },
        include: {
            following: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });
    return following.map(f => f.following);
};
exports.getFollowing = getFollowing;
//# sourceMappingURL=followService.js.map