"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMonthlyPaymentsSchema = exports.markPaymentAsPaidSchema = exports.createPaymentSchema = exports.updateClientSchema = exports.createClientSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Email deve ter formato válido')
        .min(1, 'Email é obrigatório')
        .max(255, 'Email deve ter no máximo 255 caracteres'),
    password: zod_1.z.string()
        .min(1, 'Senha é obrigatória')
        .max(255, 'Senha deve ter no máximo 255 caracteres')
});
exports.createClientSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Email deve ter formato válido')
        .min(1, 'Email é obrigatório')
        .max(255, 'Email deve ter no máximo 255 caracteres'),
    password: zod_1.z.string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .max(255, 'Senha deve ter no máximo 255 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
    name: zod_1.z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
    restaurantName: zod_1.z.string()
        .min(2, 'Nome do restaurante deve ter pelo menos 2 caracteres')
        .max(255, 'Nome do restaurante deve ter no máximo 255 caracteres'),
    restaurantAddress: zod_1.z.string()
        .min(5, 'Endereço deve ter pelo menos 5 caracteres')
        .max(500, 'Endereço deve ter no máximo 500 caracteres'),
    phone: zod_1.z.string()
        .optional()
        .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), 'Telefone deve ter formato válido'),
    monthlyAmount: zod_1.z.union([
        zod_1.z.string().transform((val) => parseFloat(val)),
        zod_1.z.number()
    ]).refine((val) => !isNaN(val) && val > 0, 'Valor mensal deve ser um número positivo'),
    paymentDay: zod_1.z.union([
        zod_1.z.string().transform((val) => parseInt(val)),
        zod_1.z.number()
    ]).refine((val) => !isNaN(val) && val >= 1 && val <= 31, 'Dia de vencimento deve ser entre 1 e 31')
});
exports.updateClientSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
        .optional(),
    email: zod_1.z.string()
        .email('Email deve ter formato válido')
        .max(255, 'Email deve ter no máximo 255 caracteres')
        .optional(),
    restaurantName: zod_1.z.string()
        .min(2, 'Nome do restaurante deve ter pelo menos 2 caracteres')
        .max(255, 'Nome do restaurante deve ter no máximo 255 caracteres')
        .optional(),
    restaurantAddress: zod_1.z.string()
        .min(5, 'Endereço deve ter pelo menos 5 caracteres')
        .max(500, 'Endereço deve ter no máximo 500 caracteres')
        .optional(),
    phone: zod_1.z.string()
        .optional()
        .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), 'Telefone deve ter formato válido'),
    monthlyAmount: zod_1.z.union([
        zod_1.z.string().transform((val) => parseFloat(val)),
        zod_1.z.number()
    ]).refine((val) => !isNaN(val) && val > 0, 'Valor mensal deve ser um número positivo')
        .optional(),
    paymentDay: zod_1.z.union([
        zod_1.z.string().transform((val) => parseInt(val)),
        zod_1.z.number()
    ]).refine((val) => !isNaN(val) && val >= 1 && val <= 31, 'Dia de vencimento deve ser entre 1 e 31')
        .optional()
});
exports.createPaymentSchema = zod_1.z.object({
    clientId: zod_1.z.string()
        .min(1, 'ID do cliente é obrigatório'),
    amount: zod_1.z.union([
        zod_1.z.string().transform((val) => parseFloat(val)),
        zod_1.z.number()
    ]).refine((val) => !isNaN(val) && val > 0, 'Valor deve ser um número positivo'),
    dueDate: zod_1.z.string()
        .min(1, 'Data de vencimento é obrigatória')
        .refine((val) => !isNaN(Date.parse(val)), 'Data de vencimento deve ter formato válido'),
    type: zod_1.z.enum(['MONTHLY', 'LICENSE', 'SETUP'], {
        errorMap: () => ({ message: 'Tipo deve ser MONTHLY, LICENSE ou SETUP' })
    }),
    description: zod_1.z.string()
        .min(3, 'Descrição deve ter pelo menos 3 caracteres')
        .max(255, 'Descrição deve ter no máximo 255 caracteres'),
    referenceMonth: zod_1.z.string()
        .optional()
        .refine((val) => !val || /^\d{4}-\d{2}$/.test(val), 'Mês de referência deve ter formato YYYY-MM'),
    notes: zod_1.z.string()
        .max(1000, 'Observações devem ter no máximo 1000 caracteres')
        .optional()
});
exports.markPaymentAsPaidSchema = zod_1.z.object({
    paymentMethod: zod_1.z.enum(['CASH', 'BANK_TRANSFER', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD'], {
        errorMap: () => ({ message: 'Método de pagamento inválido' })
    }),
    paidDate: zod_1.z.string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), 'Data de pagamento deve ter formato válido'),
    receiptNumber: zod_1.z.string()
        .max(100, 'Número do recibo deve ter no máximo 100 caracteres')
        .optional(),
    notes: zod_1.z.string()
        .max(1000, 'Observações devem ter no máximo 1000 caracteres')
        .optional()
});
exports.generateMonthlyPaymentsSchema = zod_1.z.object({
    referenceMonth: zod_1.z.string()
        .regex(/^\d{4}-\d{2}$/, 'Mês de referência deve ter formato YYYY-MM'),
    monthlyAmount: zod_1.z.union([
        zod_1.z.string().transform((val) => parseFloat(val)),
        zod_1.z.number()
    ]).refine((val) => !isNaN(val) && val > 0, 'Valor mensal deve ser um número positivo'),
    dueDay: zod_1.z.union([
        zod_1.z.string().transform((val) => parseInt(val)),
        zod_1.z.number()
    ]).refine((val) => !isNaN(val) && val >= 1 && val <= 31, 'Dia de vencimento deve ser entre 1 e 31')
});
//# sourceMappingURL=validation.schemas.js.map