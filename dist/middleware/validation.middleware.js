"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateId = exports.validateData = void 0;
const zod_1 = require("zod");
const validateData = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const dataToValidate = source === 'body' ? req.body :
                source === 'params' ? req.params :
                    req.query;
            const validatedData = schema.parse(dataToValidate);
            if (source === 'body') {
                req.body = validatedData;
            }
            else if (source === 'params') {
                req.params = validatedData;
            }
            else {
                req.query = validatedData;
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
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
            }
            else {
                console.error('Erro inesperado na validação:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor durante validação'
                });
            }
        }
    };
};
exports.validateData = validateData;
const validateId = (req, res, next) => {
    const id = req.params.id || req.params.clientId || req.params.paymentId;
    if (!id) {
        res.status(400).json({
            success: false,
            message: 'ID é obrigatório'
        });
        return;
    }
    if (!/^[a-z0-9]{25}$/.test(id)) {
        res.status(400).json({
            success: false,
            message: 'Formato de ID inválido'
        });
        return;
    }
    next();
};
exports.validateId = validateId;
//# sourceMappingURL=validation.middleware.js.map