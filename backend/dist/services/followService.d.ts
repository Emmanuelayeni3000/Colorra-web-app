export declare const followUser: (followerId: string, followingId: string) => Promise<{
    id: string;
    followerId: string;
    followingId: string;
    createdAt: Date;
}>;
export declare const unfollowUser: (followerId: string, followingId: string) => Promise<void>;
export declare const getFollowers: (userId: string) => Promise<{
    name: string | null;
    id: string;
    avatarUrl: string | null;
}[]>;
export declare const getFollowing: (userId: string) => Promise<{
    name: string | null;
    id: string;
    avatarUrl: string | null;
}[]>;
//# sourceMappingURL=followService.d.ts.map