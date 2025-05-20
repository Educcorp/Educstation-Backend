const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Ruta para registro de usuarios
router.post('/register', userController.register);

// Ruta para login de usuarios
router.post('/login', userController.login);

// Ruta para obtener usuario actual (protegida)
router.get('/current', auth, userController.getCurrentUser);

// Ruta para actualizar avatar (protegida)
router.put('/avatar', auth, userController.updateAvatar);

module.exports = router; 