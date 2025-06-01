import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

// Interface for authenticated request - Interface para requisição autenticada
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Middleware to authenticate JWT tokens
// Middleware para autenticar tokens JWT
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: 'Zugangstoken erforderlich' 
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      res.status(403).json({ 
        success: false, 
        message: 'Ungültiges Token' 
      });
      return;
    }

    // Map the token payload to our user interface
    // Mapear o payload do token para nossa interface de usuário
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.email.split('@')[0], // Use email prefix as name for now
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Ungültiges oder abgelaufenes Token' 
    });
    return;
  }
}; 