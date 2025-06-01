import { Request, Response } from 'express';
import { authenticateUser, generateToken, verifyToken } from '../utils/auth';

// Login endpoint - Endpoint de login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input - Validar entrada
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email und Passwort sind erforderlich' // Email and password are required
      });
      return;
    }

    // Authenticate user - Autenticar usuário
    const user = await authenticateUser(email, password);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Ungültige Anmeldedaten' // Invalid credentials
      });
      return;
    }

    // Generate JWT token - Gerar token JWT
    const token = generateToken(user);

    // Return success response - Retornar resposta de sucesso
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      },
      message: 'Erfolgreich angemeldet' // Successfully logged in
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Serverfehler' // Internal server error
    });
  }
};

// Verify token endpoint - Endpoint de verificação de token
export const verifyTokenEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Token nicht bereitgestellt' // Token not provided
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Ungültiger oder abgelaufener Token' // Invalid or expired token
      });
      return;
    }

    // Return user data - Retornar dados do usuário
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        }
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Serverfehler' // Internal server error
    });
  }
};

// Logout endpoint (client-side token removal) - Endpoint de logout (remoção de token no cliente)
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Since we're using stateless JWT, logout is handled client-side
    // Como estamos usando JWT stateless, o logout é tratado no cliente
    res.status(200).json({
      success: true,
      message: 'Erfolgreich abgemeldet' // Successfully logged out
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Serverfehler' // Internal server error
    });
  }
};

// Get current user profile - Obter perfil do usuário atual
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Token nicht bereitgestellt' // Token not provided
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Ungültiger oder abgelaufener Token' // Invalid or expired token
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Serverfehler' // Internal server error
    });
  }
}; 