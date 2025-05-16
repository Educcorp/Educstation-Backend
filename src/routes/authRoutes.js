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

// Eliminar cuenta del usuario autenticado
router.delete('/user/', authenticateToken, authController.deleteAccount);

module.exports = router;