const { body } = require('express-validator');

// Validación para registro
const registerValidator = [
  body('username').trim().notEmpty().withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres')
    .matches(/^[a-z0-9_.-]+$/).withMessage('Use solo letras minúsculas, números, punto y guion bajo'),
  body('email').trim().isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('password2').notEmpty().withMessage('Debe confirmar la contraseña'),
  body('first_name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('last_name').trim().notEmpty().withMessage('El apellido es requerido')
];

// Validación para login
const loginValidator = [
  body('username').trim().notEmpty().withMessage('El nombre de usuario es requerido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

module.exports = {
  registerValidator,
  loginValidator
};