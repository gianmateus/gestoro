import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
    password?: string;
}, {
    email?: string;
    password?: string;
}>;
export declare const createClientSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    restaurantName: z.ZodString;
    restaurantAddress: z.ZodString;
    phone: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    monthlyAmount: z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>;
    paymentDay: z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>;
}, "strip", z.ZodTypeAny, {
    email?: string;
    password?: string;
    name?: string;
    restaurantName?: string;
    restaurantAddress?: string;
    phone?: string;
    monthlyAmount?: number;
    paymentDay?: number;
}, {
    email?: string;
    password?: string;
    name?: string;
    restaurantName?: string;
    restaurantAddress?: string;
    phone?: string;
    monthlyAmount?: string | number;
    paymentDay?: string | number;
}>;
export declare const updateClientSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    restaurantName: z.ZodOptional<z.ZodString>;
    restaurantAddress: z.ZodOptional<z.ZodString>;
    phone: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    monthlyAmount: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>>;
    paymentDay: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>>;
}, "strip", z.ZodTypeAny, {
    email?: string;
    name?: string;
    restaurantName?: string;
    restaurantAddress?: string;
    phone?: string;
    monthlyAmount?: number;
    paymentDay?: number;
}, {
    email?: string;
    name?: string;
    restaurantName?: string;
    restaurantAddress?: string;
    phone?: string;
    monthlyAmount?: string | number;
    paymentDay?: string | number;
}>;
export declare const createPaymentSchema: z.ZodObject<{
    clientId: z.ZodString;
    amount: z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>;
    dueDate: z.ZodEffects<z.ZodString, string, string>;
    type: z.ZodEnum<["MONTHLY", "LICENSE", "SETUP"]>;
    description: z.ZodString;
    referenceMonth: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    clientId?: string;
    type?: "MONTHLY" | "LICENSE" | "SETUP";
    amount?: number;
    dueDate?: string;
    description?: string;
    referenceMonth?: string;
    notes?: string;
}, {
    clientId?: string;
    type?: "MONTHLY" | "LICENSE" | "SETUP";
    amount?: string | number;
    dueDate?: string;
    description?: string;
    referenceMonth?: string;
    notes?: string;
}>;
export declare const markPaymentAsPaidSchema: z.ZodObject<{
    paymentMethod: z.ZodEnum<["CASH", "BANK_TRANSFER", "PIX", "CREDIT_CARD", "DEBIT_CARD"]>;
    paidDate: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    receiptNumber: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string;
    paymentMethod?: "CASH" | "BANK_TRANSFER" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD";
    paidDate?: string;
    receiptNumber?: string;
}, {
    notes?: string;
    paymentMethod?: "CASH" | "BANK_TRANSFER" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD";
    paidDate?: string;
    receiptNumber?: string;
}>;
export declare const generateMonthlyPaymentsSchema: z.ZodObject<{
    referenceMonth: z.ZodString;
    monthlyAmount: z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>;
    dueDay: z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>;
}, "strip", z.ZodTypeAny, {
    monthlyAmount?: number;
    referenceMonth?: string;
    dueDay?: number;
}, {
    monthlyAmount?: string | number;
    referenceMonth?: string;
    dueDay?: string | number;
}>;
export type LoginData = z.infer<typeof loginSchema>;
export type CreateClientData = z.infer<typeof createClientSchema>;
export type UpdateClientData = z.infer<typeof updateClientSchema>;
export type CreatePaymentData = z.infer<typeof createPaymentSchema>;
export type MarkPaymentAsPaidData = z.infer<typeof markPaymentAsPaidSchema>;
export type GenerateMonthlyPaymentsData = z.infer<typeof generateMonthlyPaymentsSchema>;
//# sourceMappingURL=validation.schemas.d.ts.map