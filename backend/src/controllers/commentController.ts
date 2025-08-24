import * as commentService from '../services/commentService';
import { createError } from '../middleware/errorHandler';

export const getCommentsForPalette = async (paletteId: string) => {
  return commentService.getCommentsForPalette(paletteId);
};

export const addCommentToPalette = async (paletteId: string, authorId: string, content: string) => {
  return commentService.addCommentToPalette(paletteId, authorId, content);
};

export const updateComment = async (commentId: string, userId: string, content: string) => {
  return commentService.updateComment(commentId, userId, content);
};

export const deleteComment = async (commentId: string, userId: string) => {
  return commentService.deleteComment(commentId, userId);
};