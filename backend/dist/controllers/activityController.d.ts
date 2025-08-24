export declare const createActivity: (type: string, userId: string, relatedIds?: {
    paletteId?: string;
    commentId?: string;
    targetUserId?: string;
}) => Promise<{
    id: string;
    type: string;
    userId: string;
    paletteId: string | null;
    commentId: string | null;
    targetUserId: string | null;
    createdAt: Date;
}>;
export declare const getGlobalFeed: (limit?: number, offset?: number) => Promise<(({
    user: {
        name: string | null;
        id: string;
        avatarUrl: string | null;
    };
    palette: {
        name: string;
        id: string;
        colors: string;
    } | null;
    comment: {
        id: string;
        content: string;
    } | null;
    targetUser: {
        name: string | null;
        id: string;
        avatarUrl: string | null;
    } | null;
} & {
    id: string;
    type: string;
    userId: string;
    paletteId: string | null;
    commentId: string | null;
    targetUserId: string | null;
    createdAt: Date;
}) | {
    palette: {
        colors: any;
        name: string;
        id: string;
    };
    user: {
        name: string | null;
        id: string;
        avatarUrl: string | null;
    };
    comment: {
        id: string;
        content: string;
    } | null;
    targetUser: {
        name: string | null;
        id: string;
        avatarUrl: string | null;
    } | null;
    id: string;
    type: string;
    userId: string;
    paletteId: string | null;
    commentId: string | null;
    targetUserId: string | null;
    createdAt: Date;
})[]>;
export declare const getPersonalizedFeed: (userId: string, limit?: number, offset?: number) => Promise<(({
    user: {
        name: string | null;
        id: string;
        avatarUrl: string | null;
    };
    palette: {
        name: string;
        id: string;
        colors: string;
    } | null;
    comment: {
        id: string;
        content: string;
    } | null;
    targetUser: {
        name: string | null;
        id: string;
        avatarUrl: string | null;
    } | null;
} & {
    id: string;
    type: string;
    userId: string;
    paletteId: string | null;
    commentId: string | null;
    targetUserId: string | null;
    createdAt: Date;
}) | {
    palette: {
        colors: any;
        name: string;
        id: string;
    };
    user: {
        name: string | null;
        id: string;
        avatarUrl: string | null;
    };
    comment: {
        id: string;
        content: string;
    } | null;
    targetUser: {
        name: string | null;
        id: string;
        avatarUrl: string | null;
    } | null;
    id: string;
    type: string;
    userId: string;
    paletteId: string | null;
    commentId: string | null;
    targetUserId: string | null;
    createdAt: Date;
})[]>;
//# sourceMappingURL=activityController.d.ts.map