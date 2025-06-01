"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOverduePayments = exports.generateMonthlyPayments = exports.markPaymentAsPaid = exports.createPayment = exports.listAllPayments = exports.listDeactivatedClients = exports.reactivateClient = exports.deleteClient = exports.updateClient = exports.deactivateClient = exports.listAllClients = exports.createClient = exports.requireAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const createClient = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem criar novos clientes'
            });
            return;
        }
        const { email, password, name, restaurantName, restaurantAddress, phone, monthlyAmount, paymentDay } = req.body;
        if (!email || !password || !name || !restaurantName || !restaurantAddress || !monthlyAmount || !paymentDay) {
            res.status(400).json({
                success: false,
                message: 'Email, senha, nome, nome do restaurante, endereço, valor mensal e dia de vencimento são obrigatórios'
            });
            return;
        }
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Email já está em uso'
            });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: 'Senha deve ter pelo menos 8 caracteres'
            });
            return;
        }
        const amount = parseFloat(monthlyAmount);
        const day = parseInt(paymentDay);
        if (isNaN(amount) || amount <= 0) {
            res.status(400).json({
                success: false,
                message: 'Valor mensal deve ser um número positivo'
            });
            return;
        }
        if (isNaN(day) || day < 1 || day > 31) {
            res.status(400).json({
                success: false,
                message: 'Dia de vencimento deve ser entre 1 e 31'
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const newUser = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name: name,
                role: 'USER',
                isActive: true
            }
        });
        const restaurant = await prisma.restaurant.create({
            data: {
                name: restaurantName,
                description: `Restaurante ${restaurantName}`,
                address: restaurantAddress,
                phone: phone || '',
                email: email.toLowerCase(),
                ownerId: newUser.id
            }
        });
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, day);
        const referenceMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
        const firstPayment = await prisma.payment.create({
            data: {
                clientId: newUser.id,
                clientName: newUser.name,
                clientEmail: newUser.email,
                amount: amount,
                dueDate: nextMonth,
                type: 'MONTHLY',
                description: `Mensalidade ${referenceMonth}`,
                referenceMonth: referenceMonth,
                status: 'PENDING'
            }
        });
        console.log(`🎉 Novo cliente criado pelo admin ${req.user.email}:`, {
            clientId: newUser.id,
            clientEmail: newUser.email,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            monthlyAmount: amount,
            paymentDay: day,
            firstPaymentId: firstPayment.id
        });
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role
                },
                restaurant: {
                    id: restaurant.id,
                    name: restaurant.name,
                    address: restaurant.address
                },
                paymentConfig: {
                    monthlyAmount: amount,
                    paymentDay: day
                },
                firstPayment: {
                    id: firstPayment.id,
                    amount: firstPayment.amount,
                    dueDate: firstPayment.dueDate,
                    referenceMonth: firstPayment.referenceMonth
                },
                loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
            },
            message: 'Cliente criado com sucesso e primeiro pagamento agendado'
        });
    }
    catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.createClient = createClient;
const listAllClients = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem listar clientes'
            });
            return;
        }
        const clients = await prisma.user.findMany({
            where: {
                role: { not: 'ADMIN' },
                isActive: true
            },
            include: {
                restaurants: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        phone: true
                    }
                },
                payments: {
                    where: {
                        OR: [
                            { status: 'PENDING' },
                            { status: 'OVERDUE' }
                        ]
                    },
                    orderBy: { dueDate: 'asc' },
                    take: 1,
                    select: {
                        id: true,
                        amount: true,
                        dueDate: true,
                        status: true,
                        type: true,
                        description: true,
                        referenceMonth: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const clientsWithPaymentInfo = clients.map(client => {
            const nextPayment = client.payments[0] || null;
            const isOverdue = nextPayment && new Date(nextPayment.dueDate) < new Date() && nextPayment.status !== 'PAID';
            return {
                id: client.id,
                email: client.email,
                name: client.name,
                role: client.role,
                createdAt: client.createdAt,
                restaurants: client.restaurants,
                nextPayment: nextPayment ? {
                    id: nextPayment.id,
                    amount: nextPayment.amount,
                    dueDate: nextPayment.dueDate,
                    status: nextPayment.status,
                    type: nextPayment.type,
                    description: nextPayment.description,
                    referenceMonth: nextPayment.referenceMonth,
                    isOverdue
                } : null
            };
        });
        res.json({
            success: true,
            data: clientsWithPaymentInfo,
            count: clientsWithPaymentInfo.length,
            message: `${clientsWithPaymentInfo.length} clientes encontrados`
        });
    }
    catch (error) {
        console.error('Erro ao listar clientes:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.listAllClients = listAllClients;
const deactivateClient = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem desativar clientes'
            });
            return;
        }
        const { clientId } = req.params;
        const client = await prisma.user.findUnique({
            where: { id: clientId }
        });
        if (!client) {
            res.status(404).json({
                success: false,
                message: 'Cliente não encontrado'
            });
            return;
        }
        if (client.role === 'ADMIN') {
            res.status(400).json({
                success: false,
                message: 'Não é possível desativar administradores'
            });
            return;
        }
        await prisma.user.update({
            where: { id: clientId },
            data: { isActive: false }
        });
        console.log(`🚫 Cliente desativado pelo admin ${req.user.email}:`, {
            clientId: client.id,
            clientEmail: client.email
        });
        res.json({
            success: true,
            message: 'Cliente desativado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao desativar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.deactivateClient = deactivateClient;
const updateClient = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem editar clientes'
            });
            return;
        }
        const { clientId } = req.params;
        const { name, email, restaurantName, restaurantAddress, phone, monthlyAmount, paymentDay } = req.body;
        const client = await prisma.user.findUnique({
            where: { id: clientId },
            include: { restaurants: true }
        });
        if (!client) {
            res.status(404).json({
                success: false,
                message: 'Cliente não encontrado'
            });
            return;
        }
        if (client.role === 'ADMIN') {
            res.status(400).json({
                success: false,
                message: 'Não é possível editar administradores'
            });
            return;
        }
        if (email && email.toLowerCase() !== client.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'Email já está em uso'
                });
                return;
            }
        }
        let amount;
        let day;
        if (monthlyAmount) {
            amount = parseFloat(monthlyAmount);
            if (isNaN(amount) || amount <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Valor mensal deve ser um número positivo'
                });
                return;
            }
        }
        if (paymentDay) {
            day = parseInt(paymentDay);
            if (isNaN(day) || day < 1 || day > 31) {
                res.status(400).json({
                    success: false,
                    message: 'Dia de vencimento deve ser entre 1 e 31'
                });
                return;
            }
        }
        const updatedUser = await prisma.user.update({
            where: { id: clientId },
            data: {
                name: name || client.name,
                email: email ? email.toLowerCase() : client.email
            }
        });
        if (restaurantName || restaurantAddress || phone !== undefined) {
            const restaurant = client.restaurants[0];
            if (restaurant) {
                await prisma.restaurant.update({
                    where: { id: restaurant.id },
                    data: {
                        name: restaurantName || restaurant.name,
                        address: restaurantAddress || restaurant.address,
                        phone: phone !== undefined ? phone : restaurant.phone,
                        email: email ? email.toLowerCase() : restaurant.email
                    }
                });
            }
        }
        if (amount !== undefined || day !== undefined) {
            const pendingPayments = await prisma.payment.findMany({
                where: {
                    clientId: clientId,
                    status: { in: ['PENDING', 'OVERDUE'] }
                }
            });
            for (const payment of pendingPayments) {
                const updateData = {};
                if (amount !== undefined) {
                    updateData.amount = amount;
                }
                if (day !== undefined) {
                    const currentDueDate = new Date(payment.dueDate);
                    const newDueDate = new Date(currentDueDate.getFullYear(), currentDueDate.getMonth(), day);
                    updateData.dueDate = newDueDate;
                }
                if (Object.keys(updateData).length > 0) {
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: updateData
                    });
                }
            }
            console.log(`💰 Configurações de pagamento atualizadas pelo admin ${req.user.email}:`, {
                clientId: updatedUser.id,
                clientEmail: updatedUser.email,
                newAmount: amount,
                newPaymentDay: day,
                updatedPayments: pendingPayments.length
            });
        }
        console.log(`✏️ Cliente editado pelo admin ${req.user.email}:`, {
            clientId: updatedUser.id,
            clientEmail: updatedUser.email
        });
        res.json({
            success: true,
            message: 'Cliente atualizado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao editar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.updateClient = updateClient;
const deleteClient = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem excluir clientes'
            });
            return;
        }
        const { clientId } = req.params;
        const client = await prisma.user.findUnique({
            where: { id: clientId },
            include: { restaurants: true }
        });
        if (!client) {
            res.status(404).json({
                success: false,
                message: 'Cliente não encontrado'
            });
            return;
        }
        if (client.role === 'ADMIN') {
            res.status(400).json({
                success: false,
                message: 'Não é possível excluir administradores'
            });
            return;
        }
        for (const restaurant of client.restaurants) {
            await prisma.accountPayable.deleteMany({
                where: { restaurantId: restaurant.id }
            });
            await prisma.accountReceivable.deleteMany({
                where: { restaurantId: restaurant.id }
            });
            await prisma.inventoryItem.deleteMany({
                where: { restaurantId: restaurant.id }
            });
            await prisma.calendarEvent.deleteMany({
                where: { restaurantId: restaurant.id }
            });
            await prisma.restaurant.delete({
                where: { id: restaurant.id }
            });
        }
        await prisma.user.delete({
            where: { id: clientId }
        });
        console.log(`🗑️ Cliente excluído permanentemente pelo admin ${req.user.email}:`, {
            clientId: client.id,
            clientEmail: client.email
        });
        res.json({
            success: true,
            message: 'Cliente e todos os dados relacionados foram excluídos permanentemente'
        });
    }
    catch (error) {
        console.error('Erro ao excluir cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.deleteClient = deleteClient;
const reactivateClient = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem reativar clientes'
            });
            return;
        }
        const { clientId } = req.params;
        const client = await prisma.user.findUnique({
            where: { id: clientId }
        });
        if (!client) {
            res.status(404).json({
                success: false,
                message: 'Cliente não encontrado'
            });
            return;
        }
        if (client.role === 'ADMIN') {
            res.status(400).json({
                success: false,
                message: 'Administradores não podem ser desativados/reativados'
            });
            return;
        }
        await prisma.user.update({
            where: { id: clientId },
            data: { isActive: true }
        });
        console.log(`✅ Cliente reativado pelo admin ${req.user.email}:`, {
            clientId: client.id,
            clientEmail: client.email
        });
        res.json({
            success: true,
            message: 'Cliente reativado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao reativar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.reactivateClient = reactivateClient;
const listDeactivatedClients = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem listar clientes desativados'
            });
            return;
        }
        const clients = await prisma.user.findMany({
            where: {
                role: { not: 'ADMIN' },
                isActive: false
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                restaurants: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: clients,
            count: clients.length,
            message: `${clients.length} clientes desativados encontrados`
        });
    }
    catch (error) {
        console.error('Erro ao listar clientes desativados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.listDeactivatedClients = listDeactivatedClients;
const listAllPayments = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem visualizar pagamentos'
            });
            return;
        }
        const { status, type, month } = req.query;
        const whereConditions = {};
        if (status) {
            whereConditions.status = status;
        }
        if (type) {
            whereConditions.type = type;
        }
        if (month) {
            whereConditions.referenceMonth = month;
        }
        const payments = await prisma.payment.findMany({
            where: whereConditions,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isActive: true
                    }
                }
            },
            orderBy: { dueDate: 'desc' }
        });
        const totalReceived = payments
            .filter(p => p.status === 'PAID')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const totalPending = payments
            .filter(p => p.status === 'PENDING')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const totalOverdue = payments
            .filter(p => p.status === 'OVERDUE')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        res.json({
            success: true,
            data: payments,
            stats: {
                total: payments.length,
                paid: payments.filter(p => p.status === 'PAID').length,
                pending: payments.filter(p => p.status === 'PENDING').length,
                overdue: payments.filter(p => p.status === 'OVERDUE').length,
                totalReceived,
                totalPending,
                totalOverdue
            },
            message: 'Pagamentos listados com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao listar pagamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.listAllPayments = listAllPayments;
const createPayment = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem criar pagamentos'
            });
            return;
        }
        const { clientId, amount, dueDate, type, description, referenceMonth, notes } = req.body;
        if (!clientId || !amount || !dueDate || !type || !description) {
            res.status(400).json({
                success: false,
                message: 'Cliente, valor, data de vencimento, tipo e descrição são obrigatórios'
            });
            return;
        }
        const client = await prisma.user.findUnique({
            where: { id: clientId }
        });
        if (!client) {
            res.status(404).json({
                success: false,
                message: 'Cliente não encontrado'
            });
            return;
        }
        if (client.role === 'ADMIN') {
            res.status(400).json({
                success: false,
                message: 'Não é possível criar pagamentos para administradores'
            });
            return;
        }
        const payment = await prisma.payment.create({
            data: {
                clientId,
                clientName: client.name,
                clientEmail: client.email,
                amount: parseFloat(amount),
                dueDate: new Date(dueDate),
                type,
                description,
                referenceMonth,
                notes,
                status: 'PENDING'
            }
        });
        console.log(`💰 Pagamento criado pelo admin ${req.user.email}:`, {
            paymentId: payment.id,
            clientEmail: client.email,
            amount: payment.amount,
            type: payment.type
        });
        res.json({
            success: true,
            data: payment,
            message: 'Pagamento criado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao criar pagamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.createPayment = createPayment;
const markPaymentAsPaid = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem marcar pagamentos como recebidos'
            });
            return;
        }
        const { paymentId } = req.params;
        const { paymentMethod, paidDate, receiptNumber, notes } = req.body;
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId }
        });
        if (!payment) {
            res.status(404).json({
                success: false,
                message: 'Pagamento não encontrado'
            });
            return;
        }
        if (payment.status === 'PAID') {
            res.status(400).json({
                success: false,
                message: 'Este pagamento já foi marcado como pago'
            });
            return;
        }
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'PAID',
                paidDate: paidDate ? new Date(paidDate) : new Date(),
                paymentMethod,
                receiptNumber,
                notes: notes || payment.notes
            }
        });
        console.log(`✅ Pagamento marcado como pago pelo admin ${req.user.email}:`, {
            paymentId: payment.id,
            clientEmail: payment.clientEmail,
            amount: payment.amount,
            paymentMethod
        });
        res.json({
            success: true,
            data: updatedPayment,
            message: 'Pagamento marcado como recebido com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao marcar pagamento como pago:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.markPaymentAsPaid = markPaymentAsPaid;
const generateMonthlyPayments = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem gerar pagamentos mensais'
            });
            return;
        }
        const { referenceMonth, monthlyAmount, dueDay } = req.body;
        if (!referenceMonth || !monthlyAmount || !dueDay) {
            res.status(400).json({
                success: false,
                message: 'Mês de referência, valor mensal e dia de vencimento são obrigatórios'
            });
            return;
        }
        const activeClients = await prisma.user.findMany({
            where: {
                role: { not: 'ADMIN' },
                isActive: true
            }
        });
        const [year, month] = referenceMonth.split('-');
        const dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(dueDay));
        const createdPayments = [];
        for (const client of activeClients) {
            const existingPayment = await prisma.payment.findFirst({
                where: {
                    clientId: client.id,
                    referenceMonth,
                    type: 'MONTHLY'
                }
            });
            if (!existingPayment) {
                const payment = await prisma.payment.create({
                    data: {
                        clientId: client.id,
                        clientName: client.name,
                        clientEmail: client.email,
                        amount: parseFloat(monthlyAmount),
                        dueDate,
                        type: 'MONTHLY',
                        description: `Mensalidade ${referenceMonth}`,
                        referenceMonth,
                        status: 'PENDING'
                    }
                });
                createdPayments.push(payment);
            }
        }
        console.log(`📅 Pagamentos mensais gerados pelo admin ${req.user.email}:`, {
            referenceMonth,
            clientsCount: activeClients.length,
            paymentsCreated: createdPayments.length
        });
        res.json({
            success: true,
            data: createdPayments,
            message: `${createdPayments.length} pagamentos mensais gerados para ${referenceMonth}`
        });
    }
    catch (error) {
        console.error('Erro ao gerar pagamentos mensais:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.generateMonthlyPayments = generateMonthlyPayments;
const updateOverduePayments = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Apenas administradores podem atualizar status de pagamentos'
            });
            return;
        }
        const today = new Date();
        const overduePayments = await prisma.payment.updateMany({
            where: {
                status: 'PENDING',
                dueDate: {
                    lt: today
                }
            },
            data: {
                status: 'OVERDUE'
            }
        });
        res.json({
            success: true,
            data: { updatedCount: overduePayments.count },
            message: `${overduePayments.count} pagamentos marcados como em atraso`
        });
    }
    catch (error) {
        console.error('Erro ao atualizar pagamentos em atraso:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.updateOverduePayments = updateOverduePayments;
//# sourceMappingURL=admin.controller.js.map