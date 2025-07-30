import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const requestPasswordReset: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const resetPassword: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requestPasswordResetValidation: import("express-validator").ValidationChain[];
export declare const resetPasswordValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=passwordResetController.d.ts.map