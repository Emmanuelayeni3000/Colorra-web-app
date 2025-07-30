import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export interface SearchFilters {
    colors?: string[];
    dateFrom?: string;
    dateTo?: string;
    favorites?: boolean;
    sortBy?: 'name' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}
export declare const searchPalettes: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getColorSuggestions: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPopularColors: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=searchController.d.ts.map