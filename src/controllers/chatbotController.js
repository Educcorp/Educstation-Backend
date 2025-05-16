const { getAnthropicResponse } = require('../utils/anthropicUtils');

// Controlador para manejar mensajes del chatbot
async function handleChatbotMessage(req, res) {
    console.log('Recibida petición al chatbot:', req.method, req.url);
    
    try {
        // Verificar que el cuerpo de la petición es válido
        if (!req.body) {
            console.error('Error: Cuerpo de la petición vacío');
            return res.status(400).json({ error: 'Cuerpo de la petición vacío' });
        }
        
        const { message } = req.body;
        console.log('Mensaje recibido:', message ? message.substring(0, 50) + '...' : 'undefined');
        
        if (!message) {
            console.error('Error: Mensaje requerido no proporcionado');
            return res.status(400).json({ error: 'Mensaje requerido' });
        }
        
        console.log('Enviando mensaje a Anthropic...');
        const response = await getAnthropicResponse(message);
        
        console.log('Respuesta obtenida, enviando al cliente');
        res.json({ response });
    } catch (error) {
        console.error('Error en el chatbot:', error.message, error.stack);
        
        // Enviar respuesta apropiada según el tipo de error
        if (error.message.includes('API de Anthropic no configurada')) {
            return res.status(500).json({ 
                error: 'Error de configuración del servidor',
                details: 'La API del chatbot no está correctamente configurada' 
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = { handleChatbotMessage }; 