import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const changePassword: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProfileValidation: import("express-validator").ValidationChain[];
export declare const changePasswordValidation: import("express-validator").ValidationChain[];
export declare const uploadAvatar: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=profileController.d.ts.map