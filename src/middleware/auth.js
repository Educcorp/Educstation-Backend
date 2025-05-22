const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = function(req, res, next) {
  // Obtener token del header
  const token = req.header('x-auth-token');

  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Añadir usuario al request
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Error de autenticación:', err);
    res.status(401).json({ msg: 'Token no válido' });
  }
}; 