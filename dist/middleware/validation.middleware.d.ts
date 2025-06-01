import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare const validateData: (schema: ZodSchema, source?: "body" | "params" | "query") => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateId: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map