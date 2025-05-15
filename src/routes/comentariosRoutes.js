const express = require('express');
const router = express.Router();
const comentariosController = require('../controllers/comentariosController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Validadores
const comentarioValidator = [
  body('contenido')
    .trim()
    .notEmpty().withMessage('El contenido es requerido')
    .isLength({ min: 3, max: 1000 }).withMessage('El comentario debe tener entre 3 y 1000 caracteres')
    .escape() // Previene XSS sanitizando el contenido
];

// Rutas
router.get('/publicacion/:publicacionId', comentariosController.getComentariosByPublicacion);
router.post('/publicacion/:publicacionId', authenticateToken, comentarioValidator, comentariosController.createComentario);
router.delete('/:comentarioId', authenticateToken, comentariosController.deleteComentario);

module.exports = router;