const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rutas de perfil de usuario
router.get('/profile', authenticateToken, userController.getUserProfile);
router.put('/avatar', authenticateToken, userController.updateUserAvatar);
router.put('/profile', authenticateToken, userController.updateUserProfile);

module.exports = router; 