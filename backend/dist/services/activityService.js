"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonalizedFeed = exports.getGlobalFeed = exports.createActivity = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma = new client_1.PrismaClient();
const createActivity = async (type, userId, relatedIds) => {
    try {
        const activity = await prisma.activity.create({
            data: {
                type,
                userId,
                paletteId: relatedIds?.paletteId,
                commentId: relatedIds?.commentId,
                targetUserId: relatedIds?.targetUserId,
            },
        });
        return activity;
    }
    catch (error) {
        console.error('Error creating activity:', error);
        // Depending on criticality, you might want to throw or just log
        throw (0, errorHandler_1.createError)('Failed to create activity', 500);
    }
};
exports.createActivity = createActivity;
const getGlobalFeed = async (limit = 20, offset = 0) => {
    const activities = await prisma.activity.findMany({
        take: limit,
        skip: offset,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
            palette: {
                select: {
                    id: true,
                    name: true,
                    colors: true,
                },
            },
            comment: {
                select: {
                    id: true,
                    content: true,
                },
            },
            targetUser: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });
    // Parse colors for palettes
    const parsedActivities = activities.map(activity => {
        if (activity.palette && typeof activity.palette.colors === 'string') {
            return {
                ...activity,
                palette: {
                    ...activity.palette,
                    colors: JSON.parse(activity.palette.colors),
                },
            };
        }
        return activity;
    });
    return parsedActivities;
};
exports.getGlobalFeed = getGlobalFeed;
const getPersonalizedFeed = async (userId, limit = 20, offset = 0) => {
    // Get users that the current user is following
    const followingUsers = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
    });
    const followingIds = followingUsers.map(f => f.followingId);
    const activities = await prisma.activity.findMany({
        where: {
            OR: [
                { userId: { in: followingIds } }, // Activities by users they follow
                { targetUserId: userId }, // Activities where the current user is the target (e.g., being followed)
                { userId: userId }, // Activities by the current user themselves
            ],
        },
        take: limit,
        skip: offset,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
            palette: {
                select: {
                    id: true,
                    name: true,
                    colors: true,
                },
            },
            comment: {
                select: {
                    id: true,
                    content: true,
                },
            },
            targetUser: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });
    // Parse colors for palettes
    const parsedActivities = activities.map(activity => {
        if (activity.palette && typeof activity.palette.colors === 'string') {
            return {
                ...activity,
                palette: {
                    ...activity.palette,
                    colors: JSON.parse(activity.palette.colors),
                },
            };
        }
        return activity;
    });
    return parsedActivities;
};
exports.getPersonalizedFeed = getPersonalizedFeed;
//# sourceMappingURL=activityService.js.map