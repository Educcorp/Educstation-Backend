const { sendContactEmail } = require('../utils/emailUtils');
const { validationResult } = require('express-validator');

// Controlador para manejar envío de formulario de contacto
const sendContactMessage = async (req, res) => {
    try {
        // Validar errores de express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, subject, message } = req.body;

        // Validaciones adicionales
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de email inválido'
            });
        }

        console.log('Enviando mensaje de contacto:', {
            from: email,
            name: name,
            subject: subject
        });

        // Enviar el correo
        await sendContactEmail(email, name, subject, message);

        res.status(200).json({
            success: true,
            message: 'Mensaje enviado correctamente. Te responderemos pronto.'
        });

    } catch (error) {
        console.error('Error al enviar mensaje de contacto:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al enviar el mensaje. Inténtalo más tarde.'
        });
    }
};

module.exports = {
    sendContactMessage
};