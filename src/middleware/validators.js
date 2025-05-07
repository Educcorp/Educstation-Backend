const { body } = require('express-validator');


const registerValidator = [
    body('username').trim().notEmpty().withMessage('El nombre de usuario es requerido'),
    body('email').trim().isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('password2').notEmpty().withMessage('Debe confirmar la contraseña')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      }),
    body('first_name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('last_name').trim().notEmpty().withMessage('El apellido es requerido')
  ];

module.exports = {
  registerValidator,
  loginValidator
};