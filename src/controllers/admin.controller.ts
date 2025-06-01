import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface for authenticated request - Interface para requisição autenticada
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Middleware para verificar se é ADMIN
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: any): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
    });
    return;
  }
  next();
};

// Criar novo cliente/usuário (APENAS ADMIN)
export const createClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Apenas administradores podem criar novos clientes'
      });
      return;
    }

    const { email, password, name, restaurantName, restaurantAddress, phone, monthlyAmount, paymentDay } = req.body;

    // Validar dados obrigatórios
    if (!email || !password || !name || !restaurantName || !restaurantAddress || !monthlyAmount || !paymentDay) {
      res.status(400).json({
        success: false,
        message: 'Email, senha, nome, nome do restaurante, endereço, valor mensal e dia de vencimento são obrigatórios'
      });
      return;
    }

    // Verificar se email já existe
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

    // Validar força da senha
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 8 caracteres'
      });
      return;
    }

    // Validar valor mensal e dia de pagamento
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

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name,
        role: 'USER',
        isActive: true
      }
    });

    // Criar restaurante padrão para o cliente
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

    // Criar primeiro pagamento mensal (próximo mês)
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

    // Log da criação
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

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar todos os clientes (APENAS ADMIN)
export const listAllClients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Processar dados para incluir informações de pagamento
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

  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Desativar cliente (APENAS ADMIN)
export const deactivateClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  } catch (error) {
    console.error('Erro ao desativar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Editar cliente (APENAS ADMIN)
export const updateClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Verificar se email já existe (se mudou)
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

    // Validar valor mensal e dia de pagamento se fornecidos
    let amount: number | undefined;
    let day: number | undefined;
    
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

    // Atualizar dados do usuário
    const updatedUser = await prisma.user.update({
      where: { id: clientId },
      data: {
        name: name || client.name,
        email: email ? email.toLowerCase() : client.email
      }
    });

    // Atualizar dados do restaurante (se fornecidos)
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

    // Atualizar configurações de pagamento (se fornecidas)
    if (amount !== undefined || day !== undefined) {
      // Atualizar pagamentos pendentes existentes
      const pendingPayments = await prisma.payment.findMany({
        where: {
          clientId: clientId,
          status: { in: ['PENDING', 'OVERDUE'] }
        }
      });

      for (const payment of pendingPayments) {
        const updateData: any = {};
        
        if (amount !== undefined) {
          updateData.amount = amount;
        }
        
        if (day !== undefined) {
          // Recalcular data de vencimento mantendo o mês/ano
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

  } catch (error) {
    console.error('Erro ao editar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Excluir cliente permanentemente (APENAS ADMIN)
export const deleteClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Excluir todos os dados relacionados ao cliente
    for (const restaurant of client.restaurants) {
      // Excluir dados financeiros
      await prisma.accountPayable.deleteMany({
        where: { restaurantId: restaurant.id }
      });
      await prisma.accountReceivable.deleteMany({
        where: { restaurantId: restaurant.id }
      });
      
      // Excluir inventário
      await prisma.inventoryItem.deleteMany({
        where: { restaurantId: restaurant.id }
      });
      
      // Excluir eventos do calendário
      await prisma.calendarEvent.deleteMany({
        where: { restaurantId: restaurant.id }
      });
      
      // Excluir restaurante
      await prisma.restaurant.delete({
        where: { id: restaurant.id }
      });
    }

    // Excluir usuário
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

  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Reativar cliente (APENAS ADMIN)
export const reactivateClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  } catch (error) {
    console.error('Erro ao reativar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar clientes desativados (APENAS ADMIN)
export const listDeactivatedClients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  } catch (error) {
    console.error('Erro ao listar clientes desativados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ========== CONTROLE DE PAGAMENTOS ==========

// Listar todos os pagamentos (APENAS ADMIN)
export const listAllPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Apenas administradores podem visualizar pagamentos'
      });
      return;
    }

    const { status, type, month } = req.query;
    
    const whereConditions: any = {};
    
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

    // Calcular estatísticas
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

  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar novo pagamento para cliente (APENAS ADMIN)
export const createPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Apenas administradores podem criar pagamentos'
      });
      return;
    }

    const { 
      clientId, 
      amount, 
      dueDate, 
      type, 
      description, 
      referenceMonth,
      notes 
    } = req.body;

    // Validar dados obrigatórios
    if (!clientId || !amount || !dueDate || !type || !description) {
      res.status(400).json({
        success: false,
        message: 'Cliente, valor, data de vencimento, tipo e descrição são obrigatórios'
      });
      return;
    }

    // Verificar se cliente existe
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

  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Marcar pagamento como recebido (APENAS ADMIN)
export const markPaymentAsPaid = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  } catch (error) {
    console.error('Erro ao marcar pagamento como pago:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Gerar pagamentos mensais automaticamente (APENAS ADMIN)
export const generateMonthlyPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Buscar todos os clientes ativos (não admin)
    const activeClients = await prisma.user.findMany({
      where: {
        role: { not: 'ADMIN' },
        isActive: true
      }
    });

    // Criar data de vencimento
    const [year, month] = referenceMonth.split('-');
    const dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(dueDay));

    const createdPayments = [];

    for (const client of activeClients) {
      // Verificar se já existe pagamento para este mês
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

  } catch (error) {
    console.error('Erro ao gerar pagamentos mensais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar status de pagamentos em atraso
export const updateOverduePayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  } catch (error) {
    console.error('Erro ao atualizar pagamentos em atraso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}; 