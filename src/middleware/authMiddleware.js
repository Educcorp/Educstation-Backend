const { verifyAccessToken } = require('../utils/jwtUtils');
const { pool } = require('../config/database');
const Administrador = require('../models/adminModel');

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
    
    // Verificar si el usuario es superusuario en auth_user
    const isAdminUser = await Administrador.isAdmin(req.userId);
    
    if (!isAdminUser) {
      console.log('El usuario no tiene permisos de administrador:', req.userId);
      return res.status(403).json({ detail: 'Acceso denegado - Se requiere permisos de administrador' });
    }
    
    // Buscar o crear el registro en la tabla Administrador
    const admin = await Administrador.findByUserId(req.userId);
    
    if (!admin) {
      console.log('No se pudo crear/encontrar administrador para el usuario:', req.userId);
      return res.status(403).json({ detail: 'Error al verificar permisos de administrador' });
    }
    
    // Guardar el ID de administrador para usarlo en los controladores
    req.adminId = admin.ID_administrador;
    console.log('Administrador encontrado/creado:', admin);
    
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