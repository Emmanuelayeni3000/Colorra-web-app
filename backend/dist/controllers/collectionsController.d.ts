import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createCollection: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserCollections: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addPaletteToCollection: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removePaletteFromCollection: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCollection: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCollectionValidation: import("express-validator").ValidationChain[];
export declare const addPaletteToCollectionValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=collectionsController.d.ts.map