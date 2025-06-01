import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}
export declare const getAllRestaurants: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getRestaurant: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createNewRestaurant: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateRestaurant: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteRestaurantController: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const selectRestaurant: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=restaurant.controller.d.ts.map