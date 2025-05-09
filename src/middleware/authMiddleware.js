const { verifyAccessToken } = require('../utils/jwtUtils');
const { pool } = require('../config/database');

// Middleware para verificar autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Formato: 'Bearer TOKEN'
  
  if (!token) {
    return res.status(401).json({ detail: 'No se proporcionó token de autenticación' });
  }
  
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ detail: 'Token inválido o expirado' });
  }
  
  // Establecer tanto req.user como req.userId para compatibilidad
  req.user = decoded;
  req.userId = decoded.userId;
  
  // Log para depuración
  console.log('Token decodificado:', decoded);
  console.log('req.user establecido como:', req.user);
  console.log('req.userId establecido como:', req.userId);
  
  next();
};

// Middleware para verificar rol de administrador
const isAdmin = async (req, res, next) => {
  try {
    // Log para depuración
    console.log('Verificando permisos de admin para userId:', req.userId);
    
    // Modificar para buscar en la tabla Administrador en lugar de auth_user
    const [rows] = await pool.execute(
      'SELECT * FROM Administrador WHERE ID_administrador = ?',
      [req.userId]
    );
    
    if (!rows.length) {
      console.log('No se encontró administrador con ID:', req.userId);
      return res.status(403).json({ detail: 'Acceso denegado - Se requiere permisos de administrador' });
    }
    
    console.log('Administrador encontrado:', rows[0]);
    next();
  } catch (error) {
    console.error('Error detallado al verificar permisos de admin:', error);
    res.status(500).json({ detail: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};