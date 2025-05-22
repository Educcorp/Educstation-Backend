
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { body } = require('express-validator');

// Validadores para el formulario de contacto
const contactValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),
    body('subject')
        .trim()
        .notEmpty().withMessage('El asunto es requerido')
        .isLength({ min: 3, max: 200 }).withMessage('El asunto debe tener entre 3 y 200 caracteres'),
    body('message')
        .trim()
        .notEmpty().withMessage('El mensaje es requerido')
        .isLength({ min: 10, max: 2000 }).withMessage('El mensaje debe tener entre 10 y 2000 caracteres')
];

// POST /api/contact - Enviar mensaje de contacto
router.post('/', contactValidator, contactController.sendContactMessage);

module.exports = router;