const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = function(req, res, next) {
  // Obtener token del header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Formato: 'Bearer TOKEN'
  
  // También buscar en x-auth-token para mantener compatibilidad
  const legacyToken = req.header('x-auth-token');
  
  // Usar el token que esté disponible
  const finalToken = token || legacyToken;

  // Verificar si no hay token
  if (!finalToken) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(finalToken, config.jwtSecret);
    
    // Añadir usuario al request
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Error de autenticación:', err);
    res.status(401).json({ msg: 'Token no válido' });
  }
}; 