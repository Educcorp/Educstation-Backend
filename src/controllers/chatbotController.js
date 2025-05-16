const { getAnthropicResponse } = require('../utils/anthropicUtils');

// Controlador para manejar mensajes del chatbot
async function handleChatbotMessage(req, res) {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Mensaje requerido' });
        }
        const response = await getAnthropicResponse(message);
        res.json({ response });
    } catch (error) {
        console.error('Error en el chatbot:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = { handleChatbotMessage }; 