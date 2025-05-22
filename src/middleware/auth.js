const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = function(req, res, next) {
  console.log('⭐ Auth middleware iniciado ⭐');
  console.log('Headers de autenticación:', {
    authorization: req.headers.authorization ? 'Presente' : 'No presente',
    xAuthToken: req.header('x-auth-token') ? 'Presente' : 'No presente'
  });
  
  // Obtener token del header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Formato: 'Bearer TOKEN'
  
  // También buscar en x-auth-token para mantener compatibilidad
  const legacyToken = req.header('x-auth-token');
  
  // Usar el token que esté disponible
  const finalToken = token || legacyToken;

  // Verificar si hay token y registrar información
  if (!finalToken) {
    console.log('❌ No se encontró token en ningún formato');
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }
  
  console.log('✅ Token encontrado:', {
    fuente: token ? 'Authorization header' : 'x-auth-token header',
    longitud: finalToken.length
  });

  try {
    // Verificar token
    const decoded = jwt.verify(finalToken, config.jwtSecret);
    console.log('✅ Token verificado correctamente:', {
      id: decoded.id,
      is_staff: decoded.is_staff,
      is_superuser: decoded.is_superuser
    });
    
    // Añadir usuario al request
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ Error de autenticación:', err);
    console.error('Detalles del error:', {
      name: err.name,
      message: err.message,
      expiredAt: err.expiredAt
    });
    res.status(401).json({ msg: 'Token no válido' });
  }
}; 