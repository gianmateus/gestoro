import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: any) => void;
export declare const createClient: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const listAllClients: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deactivateClient: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateClient: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteClient: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const reactivateClient: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const listDeactivatedClients: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const listAllPayments: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createPayment: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const markPaymentAsPaid: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const generateMonthlyPayments: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateOverduePayments: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=admin.controller.d.ts.map