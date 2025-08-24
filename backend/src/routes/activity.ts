import express, { Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import * as activityController from '../controllers/activityController';

const router = express.Router();

// Get global activity feed
router.get('/global', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = req.query;
    const activities = await activityController.getGlobalFeed(
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined
    );
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// Get personalized activity feed
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = req.query;
    const userId = req.user!.id;
    const activities = await activityController.getPersonalizedFeed(
      userId,
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined
    );
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

export default router;