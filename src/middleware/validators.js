const { body } = require('express-validator');

// Validador para registro de usuario
const registerValidator = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('El nombre de usuario debe tener al menos 3 caracteres')
    .matches(/^[a-z0-9._]+$/)
    .withMessage('El nombre de usuario solo puede contener letras minúsculas, números, punto y guion bajo'),
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('password2')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
];

// Validador para inicio de sesión
const loginValidator = [
  body('username')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validador para solicitud de restablecimiento de contraseña
const passwordResetRequestValidator = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
];

// Validador para confirmación de restablecimiento de contraseña
const passwordResetConfirmValidator = [
  body('token')
    .notEmpty()
    .withMessage('El token es requerido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
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

// Validador para creación de categorías
const categoriaCreateValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre de la categoría es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/)
    .withMessage('El nombre solo puede contener letras, números y espacios')
    .customSanitizer(value => {
      // Capitalizar primera letra de cada palabra
      return value.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }),
  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 255 }).withMessage('La descripción debe tener entre 10 y 255 caracteres')
];

// Validador para actualización de categorías
const categoriaUpdateValidator = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre de la categoría es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/)
    .withMessage('El nombre solo puede contener letras, números y espacios')
    .customSanitizer(value => {
      // Capitalizar primera letra de cada palabra
      return value.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }),
  body('descripcion')
    .optional()
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 255 }).withMessage('La descripción debe tener entre 10 y 255 caracteres')
];

module.exports = {
  registerValidator,
  loginValidator,
  passwordResetRequestValidator,
  passwordResetConfirmValidator,
  publicacionValidator,
  htmlPublicacionValidator,
  categoriaCreateValidator,
  categoriaUpdateValidator
};