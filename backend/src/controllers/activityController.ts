import * as activityService from '../services/activityService';

export const createActivity = async (
  type: string,
  userId: string,
  relatedIds?: { paletteId?: string; commentId?: string; targetUserId?: string }
) => {
  return activityService.createActivity(type, userId, relatedIds);
};

export const getGlobalFeed = async (limit?: number, offset?: number) => {
  return activityService.getGlobalFeed(limit, offset);
};

export const getPersonalizedFeed = async (userId: string, limit?: number, offset?: number) => {
  return activityService.getPersonalizedFeed(userId, limit, offset);
};