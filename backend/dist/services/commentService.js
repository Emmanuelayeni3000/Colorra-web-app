"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.addCommentToPalette = exports.getCommentsForPalette = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma = new client_1.PrismaClient();
const getCommentsForPalette = async (paletteId) => {
    const comments = await prisma.comment.findMany({
        where: { paletteId },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc',
        },
    });
    return comments;
};
exports.getCommentsForPalette = getCommentsForPalette;
const addCommentToPalette = async (paletteId, authorId, content) => {
    // Check if palette exists
    const palette = await prisma.palette.findUnique({
        where: { id: paletteId },
    });
    if (!palette) {
        throw (0, errorHandler_1.createError)('Palette not found', 404);
    }
    const comment = await prisma.comment.create({
        data: {
            content,
            paletteId,
            authorId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });
    return comment;
};
exports.addCommentToPalette = addCommentToPalette;
const updateComment = async (commentId, userId, content) => {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });
    if (!comment) {
        throw (0, errorHandler_1.createError)('Comment not found', 404);
    }
    if (comment.authorId !== userId) {
        throw (0, errorHandler_1.createError)('Unauthorized to update this comment', 403);
    }
    const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });
    return updatedComment;
};
exports.updateComment = updateComment;
const deleteComment = async (commentId, userId) => {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });
    if (!comment) {
        throw (0, errorHandler_1.createError)('Comment not found', 404);
    }
    if (comment.authorId !== userId) {
        throw (0, errorHandler_1.createError)('Unauthorized to delete this comment', 403);
    }
    await prisma.comment.delete({
        where: { id: commentId },
    });
};
exports.deleteComment = deleteComment;
//# sourceMappingURL=commentService.js.map