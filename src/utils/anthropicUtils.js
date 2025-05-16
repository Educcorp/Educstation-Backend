const fetch = require('node-fetch');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

async function getAnthropicResponse(message) {
    if (!ANTHROPIC_API_KEY) {
        throw new Error('Clave de API de Anthropic no configurada');
    }
    const body = {
        model: 'claude-3-opus-20240229', // Puedes cambiar el modelo si tienes otro disponible
        max_tokens: 256,
        messages: [
            { role: 'user', content: message }
        ]
    };
    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error('Error al comunicarse con Anthropic');
    }
    const data = await response.json();
    // El formato puede variar según la respuesta de Anthropic
    return data.content?.[0]?.text || 'No se pudo obtener respuesta del sabio.';
}

module.exports = { getAnthropicResponse }; 