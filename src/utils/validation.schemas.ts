import { z } from 'zod';

// Schema para login
export const loginSchema = z.object({
  email: z.string()
    .email('Email deve ter formato válido')
    .min(1, 'Email é obrigatório')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .max(255, 'Senha deve ter no máximo 255 caracteres')
});

// Schema para criação de cliente
export const createClientSchema = z.object({
  email: z.string()
    .email('Email deve ter formato válido')
    .min(1, 'Email é obrigatório')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(255, 'Senha deve ter no máximo 255 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  restaurantName: z.string()
    .min(2, 'Nome do restaurante deve ter pelo menos 2 caracteres')
    .max(255, 'Nome do restaurante deve ter no máximo 255 caracteres'),
  restaurantAddress: z.string()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(500, 'Endereço deve ter no máximo 500 caracteres'),
  phone: z.string()
    .optional()
    .refine((val: string | undefined) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), 'Telefone deve ter formato válido'),
  monthlyAmount: z.union([
    z.string().transform((val: string) => parseFloat(val)),
    z.number()
  ]).refine((val: number) => !isNaN(val) && val > 0, 'Valor mensal deve ser um número positivo'),
  paymentDay: z.union([
    z.string().transform((val: string) => parseInt(val)),
    z.number()
  ]).refine((val: number) => !isNaN(val) && val >= 1 && val <= 31, 'Dia de vencimento deve ser entre 1 e 31')
});

// Schema para atualização de cliente
export const updateClientSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .optional(),
  email: z.string()
    .email('Email deve ter formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .optional(),
  restaurantName: z.string()
    .min(2, 'Nome do restaurante deve ter pelo menos 2 caracteres')
    .max(255, 'Nome do restaurante deve ter no máximo 255 caracteres')
    .optional(),
  restaurantAddress: z.string()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(500, 'Endereço deve ter no máximo 500 caracteres')
    .optional(),
  phone: z.string()
    .optional()
    .refine((val: string | undefined) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), 'Telefone deve ter formato válido'),
  monthlyAmount: z.union([
    z.string().transform((val: string) => parseFloat(val)),
    z.number()
  ]).refine((val: number) => !isNaN(val) && val > 0, 'Valor mensal deve ser um número positivo')
    .optional(),
  paymentDay: z.union([
    z.string().transform((val: string) => parseInt(val)),
    z.number()
  ]).refine((val: number) => !isNaN(val) && val >= 1 && val <= 31, 'Dia de vencimento deve ser entre 1 e 31')
    .optional()
});

// Schema para criação de pagamento
export const createPaymentSchema = z.object({
  clientId: z.string()
    .min(1, 'ID do cliente é obrigatório'),
  amount: z.union([
    z.string().transform((val: string) => parseFloat(val)),
    z.number()
  ]).refine((val: number) => !isNaN(val) && val > 0, 'Valor deve ser um número positivo'),
  dueDate: z.string()
    .min(1, 'Data de vencimento é obrigatória')
    .refine((val: string) => !isNaN(Date.parse(val)), 'Data de vencimento deve ter formato válido'),
  type: z.enum(['MONTHLY', 'LICENSE', 'SETUP'], {
    errorMap: () => ({ message: 'Tipo deve ser MONTHLY, LICENSE ou SETUP' })
  }),
  description: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(255, 'Descrição deve ter no máximo 255 caracteres'),
  referenceMonth: z.string()
    .optional()
    .refine((val: string | undefined) => !val || /^\d{4}-\d{2}$/.test(val), 'Mês de referência deve ter formato YYYY-MM'),
  notes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
});

// Schema para marcar pagamento como pago
export const markPaymentAsPaidSchema = z.object({
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' })
  }),
  paidDate: z.string()
    .optional()
    .refine((val: string | undefined) => !val || !isNaN(Date.parse(val)), 'Data de pagamento deve ter formato válido'),
  receiptNumber: z.string()
    .max(100, 'Número do recibo deve ter no máximo 100 caracteres')
    .optional(),
  notes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
});

// Schema para geração de mensalidades
export const generateMonthlyPaymentsSchema = z.object({
  referenceMonth: z.string()
    .regex(/^\d{4}-\d{2}$/, 'Mês de referência deve ter formato YYYY-MM'),
  monthlyAmount: z.union([
    z.string().transform((val: string) => parseFloat(val)),
    z.number()
  ]).refine((val: number) => !isNaN(val) && val > 0, 'Valor mensal deve ser um número positivo'),
  dueDay: z.union([
    z.string().transform((val: string) => parseInt(val)),
    z.number()
  ]).refine((val: number) => !isNaN(val) && val >= 1 && val <= 31, 'Dia de vencimento deve ser entre 1 e 31')
});

// Tipos TypeScript derivados dos schemas
export type LoginData = z.infer<typeof loginSchema>;
export type CreateClientData = z.infer<typeof createClientSchema>;
export type UpdateClientData = z.infer<typeof updateClientSchema>;
export type CreatePaymentData = z.infer<typeof createPaymentSchema>;
export type MarkPaymentAsPaidData = z.infer<typeof markPaymentAsPaidSchema>;
export type GenerateMonthlyPaymentsData = z.infer<typeof generateMonthlyPaymentsSchema>; 