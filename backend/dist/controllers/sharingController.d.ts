import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const sharePalette: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSharedPalettes: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMySharedPalettes: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removePaletteShare: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sharePaletteValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=sharingController.d.ts.map