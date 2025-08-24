import express, { Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import * as commentController from '../controllers/commentController';
import { createActivity } from '../services/activityService'; // Will create this next

const router = express.Router();

// Get all comments for a specific palette
router.get('/:paletteId/comments', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paletteId } = req.params;
    const comments = await commentController.getCommentsForPalette(paletteId);
    res.json(comments);
  } catch (error) {
    next(error);
  }
});

// Add a comment to a palette
router.post('/:paletteId/comments',
  authenticateToken,
  [
    body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment content must be between 1 and 500 characters.'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { paletteId } = req.params;
      const { content } = req.body;
      const authorId = req.user!.id;

      const comment = await commentController.addCommentToPalette(paletteId, authorId, content);

      // Create activity for comment added
      await createActivity("COMMENT_ADDED", authorId, { paletteId, commentId: comment.id });

      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }
);

// Update a comment
router.put('/:commentId',
  authenticateToken,
  [
    body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment content must be between 1 and 500 characters.'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user!.id; // User making the request

      const updatedComment = await commentController.updateComment(commentId, userId, content);
      res.json(updatedComment);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a comment
router.delete('/:commentId', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id; // User making the request

    await commentController.deleteComment(commentId, userId);
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    next(error);
  }
});

export default router;