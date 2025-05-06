const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../middleware/validators');

// Rutas de autenticación - mantienen los mismos endpoints que tenías en Django
router.post('/register/', registerValidator, authController.register);
router.post('/token/', loginValidator, authController.login);
router.post('/token/refresh/', authController.refreshToken);
router.get('/user/', authenticateToken, authController.getUserDetails);

module.exports = router;