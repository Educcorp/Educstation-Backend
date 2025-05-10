const { body } = require('express-validator');

// Validación para registro
const registerValidator = [
  body('username').trim().isEmail().withMessage('El nombre de usuario debe ser un email válido'),
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

// src/middleware/validators.js - Añadir estos validadores

const searchValidator = [
  query('term').trim().notEmpty().withMessage('El término de búsqueda es requerido'),
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('El límite debe ser un número entre 1 y 50')
];

const advancedSearchValidator = [
  query('term').optional().trim(),
  query('categorias').optional().custom((value) => {
    if (!value) return true;
    // Validar si es un array de números o un string con números separados por comas
    if (Array.isArray(value)) {
      return value.every(item => !isNaN(parseInt(item)));
    }
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').every(item => !isNaN(parseInt(item.trim())));
    }
    return !isNaN(parseInt(value));
  }).withMessage('Formato de categorías inválido'),
  query('fechaDesde').optional().isDate().withMessage('Formato de fecha inválido'),
  query('fechaHasta').optional().isDate().withMessage('Formato de fecha inválido'),
  query('estado').optional().isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),
  query('orderBy').optional().isIn(['Titulo', 'Fecha_creacion']).withMessage('Campo de ordenamiento inválido'),
  query('orderDir').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('Dirección de ordenamiento inválida')
];

module.exports = {
  registerValidator,
  loginValidator
};