import express, { Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import * as followController from '../controllers/followController';
import { createActivity } from '../services/activityService';

const router = express.Router();

// Follow a user
router.post('/:id/follow', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: followingId } = req.params;
    const followerId = req.user!.id;

    if (followerId === followingId) {
      throw createError('Cannot follow yourself', 400);
    }

    const follow = await followController.followUser(followerId, followingId);

    // Create activity for user follow
    await createActivity("USER_FOLLOWED", followerId, { targetUserId: followingId });

    res.status(201).json(follow);
  } catch (error) {
    next(error);
  }
});

// Unfollow a user
router.delete('/:id/follow', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: followingId } = req.params;
    const followerId = req.user!.id;

    await followController.unfollowUser(followerId, followingId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get followers of a user
router.get('/:id/followers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const followers = await followController.getFollowers(id);
    res.json(followers);
  } catch (error) {
    next(error);
  }
});

// Get users a user is following
router.get('/:id/following', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const following = await followController.getFollowing(id);
    res.json(following);
  } catch (error) {
    next(error);
  }
});

export default router;