const { body } = require('express-validator');

// Validador para registro de usuario
const registerValidator = [
  body('username').trim().notEmpty().withMessage('El nombre de usuario es requerido'),
  body('email').isEmail().withMessage('Correo electrónico inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('first_name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('last_name').trim().notEmpty().withMessage('El apellido es requerido')
];

// Validador para inicio de sesión
const loginValidator = [
  body('username').trim().notEmpty().withMessage('El nombre de usuario es requerido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

// Validador para publicaciones
const publicacionValidator = [
  body('titulo')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ max: 100 }).withMessage('El título no puede exceder los 100 caracteres'),
  body('contenido')
    .trim()
    .notEmpty().withMessage('El contenido es requerido'),
  body('resumen')
    .trim()
    .isLength({ max: 500 }).withMessage('El resumen no puede exceder los 500 caracteres')
    .optional({ nullable: true }),
  body('estado')
    .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido')
    .optional({ nullable: true }),
  body('categorias')
    .isArray().withMessage('Las categorías deben ser un array')
    .optional({ nullable: true })
];

// Validador para publicaciones desde HTML
const htmlPublicacionValidator = [
  body('titulo')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ max: 100 }).withMessage('El título no puede exceder los 100 caracteres'),
  body('htmlContent')
    .trim()
    .notEmpty().withMessage('El contenido HTML es requerido'),
  body('resumen')
    .trim()
    .isLength({ max: 500 }).withMessage('El resumen no puede exceder los 500 caracteres')
    .optional({ nullable: true }),
  body('estado')
    .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido')
    .optional({ nullable: true }),
  body('categorias')
    .isArray().withMessage('Las categorías deben ser un array')
    .optional({ nullable: true })
];

module.exports = {
  registerValidator,
  loginValidator,
  publicacionValidator,
  htmlPublicacionValidator
};