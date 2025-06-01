import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to hash a password (for generating new hashes)
// Função para gerar hash de senha (para gerar novos hashes)
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Function to verify password against hash
// Função para verificar senha contra hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Function to authenticate user with database
// Função para autenticar usuário com banco de dados
export const authenticateUser = async (email: string, password: string) => {
  try {
    // Find user by email in database
    const user = await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase(),
        isActive: true
      }
    });
    
    if (!user) {
      return null;
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;

  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};

// Function to generate JWT token
// Função para gerar token JWT
export const generateToken = (user: { id: string; email: string; role: string }): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: '7d' }
  );
};

// Function to verify JWT token
// Função para verificar token JWT
export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';

  try {
    return jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: string;
      iat: number;
      exp: number;
    };
  } catch (error) {
    return null;
  }
};

// Function to get all users from database (without passwords) for admin purposes
// Função para obter todos os usuários do banco (sem senhas) para fins administrativos
export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// Helper function to generate new password hashes (for development)
// Função auxiliar para gerar novos hashes de senha (para desenvolvimento)
export const generatePasswordHash = async (password: string) => {
  console.log(`Password: ${password}`);
  console.log(`Hash: ${await hashPassword(password)}`);
}; 