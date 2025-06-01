import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Middleware genérico para validação com Zod
export const validateData = (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = source === 'body' ? req.body : 
                           source === 'params' ? req.params : 
                           req.query;

      const validatedData = schema.parse(dataToValidate);
      
      // Substituir os dados originais pelos validados (com transformações aplicadas)
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'params') {
        req.params = validatedData;
      } else {
        req.query = validatedData;
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        console.warn(`🚨 Validação falhou para ${req.method} ${req.path}:`, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          errors: errorMessages
        });

        res.status(400).json({
          success: false,
          message: 'Dados inválidos fornecidos',
          errors: errorMessages,
          details: 'Verifique os campos destacados e tente novamente'
        });
      } else {
        console.error('Erro inesperado na validação:', error);
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor durante validação'
        });
      }
    }
  };
};

// Middleware específico para validação de ID
export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  const id = req.params.id || req.params.clientId || req.params.paymentId;
  
  if (!id) {
    res.status(400).json({
      success: false,
      message: 'ID é obrigatório'
    });
    return;
  }

  // Validar formato de ID (assumindo cuid() do Prisma)
  if (!/^[a-z0-9]{25}$/.test(id)) {
    res.status(400).json({
      success: false,
      message: 'Formato de ID inválido'
    });
    return;
  }

  next();
}; 