import * as followService from '../services/followService';

export const followUser = async (followerId: string, followingId: string) => {
  return followService.followUser(followerId, followingId);
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  return followService.unfollowUser(followerId, followingId);
};

export const getFollowers = async (userId: string) => {
  return followService.getFollowers(userId);
};

export const getFollowing = async (userId: string) => {
  return followService.getFollowing(userId);
};