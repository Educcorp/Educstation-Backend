const { verifyAccessToken } = require('../utils/jwtUtils');

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
  
  req.userId = decoded.userId;
  next();
};

// Middleware para verificar rol de administrador
const isAdmin = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT is_staff FROM auth_user WHERE id = ?',
      [req.userId]
    );
    
    if (!rows.length || !rows[0].is_staff) {
      return res.status(403).json({ detail: 'Acceso denegado - Se requiere permisos de administrador' });
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar permisos de admin:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};