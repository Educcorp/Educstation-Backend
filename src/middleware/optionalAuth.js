const { verifyAccessToken } = require('../utils/jwtUtils');

// Middleware para autenticación opcional
// Permite acceso público pero proporciona información del usuario si está autenticado
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Formato: 'Bearer TOKEN'
  
  if (!token) {
    // No hay token, continuar sin autenticación
    req.user = null;
    req.userId = null;
    req.isAuthenticated = false;
    return next();
  }
  
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    // Token inválido, continuar sin autenticación
    req.user = null;
    req.userId = null;
    req.isAuthenticated = false;
    return next();
  }
  
  // Token válido, establecer información del usuario
  req.user = decoded;
  req.userId = decoded.userId;
  req.isAuthenticated = true;
  
  console.log('Autenticación opcional - Usuario autenticado:', {
    userId: req.userId,
    isAuthenticated: req.isAuthenticated
  });
  
  next();
};

module.exports = {
  optionalAuth
}; 