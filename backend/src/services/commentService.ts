import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getCommentsForPalette = async (paletteId: string) => {
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

export const addCommentToPalette = async (paletteId: string, authorId: string, content: string) => {
  // Check if palette exists
  const palette = await prisma.palette.findUnique({
    where: { id: paletteId },
  });

  if (!palette) {
    throw createError('Palette not found', 404);
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

export const updateComment = async (commentId: string, userId: string, content: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  if (comment.authorId !== userId) {
    throw createError('Unauthorized to update this comment', 403);
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

export const deleteComment = async (commentId: string, userId: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  if (comment.authorId !== userId) {
    throw createError('Unauthorized to delete this comment', 403);
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });
};