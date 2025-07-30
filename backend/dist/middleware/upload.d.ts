import multer from 'multer';
export declare const upload: multer.Multer;
export declare const deleteUploadedFile: (filename: string) => Promise<void>;
export declare const getFileUrl: (filename: string) => string;
export declare const validateFileUpload: (file: Express.Multer.File | undefined) => {
    isValid: boolean;
    error: string;
} | {
    isValid: boolean;
    error: null;
};
//# sourceMappingURL=upload.d.ts.map