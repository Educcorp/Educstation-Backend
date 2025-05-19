const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { 
  registerValidator, 
  loginValidator, 
  passwordResetRequestValidator, 
  passwordResetConfirmValidator 
} = require('../middleware/validators');

// Rutas de autenticación - mantienen los mismos endpoints que tenías en Django
router.post('/register/', registerValidator, authController.register);
router.post('/token/', loginValidator, authController.login);
router.post('/token/refresh/', authController.refreshToken);
router.get('/user/', authenticateToken, authController.getUserDetails);
router.get('/user/:username/check', authController.checkUsernameAvailability);

// Rutas para restablecimiento de contraseña
router.post('/password-reset/', passwordResetRequestValidator, authController.requestPasswordReset);
router.post('/password-reset/confirm/', passwordResetConfirmValidator, authController.resetPassword);

// Nueva ruta para verificar token de restablecimiento
router.get('/password-reset/verify/:token', (req, res) => {
  try {
    const { token } = req.params;
    const jwt = require('jsonwebtoken');
    
    // Verificar que el token sea válido
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar que sea un token específico para restablecer contraseña
      if (decoded.action !== 'password_reset') {
        return res.status(400).json({ detail: 'Token inválido' });
      }
      
      return res.status(200).json({ detail: 'Token válido', valid: true });
    } catch (err) {
      return res.status(400).json({ detail: 'Token inválido o expirado' });
    }
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(500).json({ detail: 'Error al verificar token' });
  }
});

// Eliminar cuenta del usuario autenticado
router.delete('/user/', authenticateToken, authController.deleteAccount);

module.exports = router;