export declare const getCommentsForPalette: (paletteId: string) => Promise<({
    author: {
        name: string | null;
        id: string;
        avatarUrl: string | null;
    };
} & {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    paletteId: string;
})[]>;
export declare const addCommentToPalette: (paletteId: string, authorId: string, content: string) => Promise<{
    author: {
        name: string | null;
        id: string;
        avatarUrl: string | null;
    };
} & {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    paletteId: string;
}>;
export declare const updateComment: (commentId: string, userId: string, content: string) => Promise<{
    author: {
        name: string | null;
        id: string;
        avatarUrl: string | null;
    };
} & {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    paletteId: string;
}>;
export declare const deleteComment: (commentId: string, userId: string) => Promise<void>;
//# sourceMappingURL=commentService.d.ts.map