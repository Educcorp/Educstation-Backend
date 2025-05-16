const fetch = require('node-fetch');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Prompt de sistema que define el comportamiento del chatbot
const SYSTEM_PROMPT = `
Eres un asistente educativo de EducStation, una plataforma dedicada a la educación.
Instrucciones:
1. SIEMPRE responde en español.
2. Eres experto en temas educativos, pedagogía, técnicas de estudio y aprendizaje.
3. Proporciona respuestas útiles, precisas y basadas en evidencia sobre temas educativos.
4. Mantén un tono profesional, amable y motivador.
5. Si no conoces la respuesta a una pregunta, admítelo y sugiere fuentes confiables.
6. NUNCA respondas a preguntas sobre:
   - Contenido sexual o inapropiado
   - Violencia o contenido que promueva daño
   - Actividades ilegales o no éticas
   - Temas políticos controvertidos
   - Cualquier contenido que no sea adecuado para un entorno educativo
7. Si recibes preguntas sobre estos temas prohibidos, responde: "Lo siento, como asistente educativo solo puedo responder preguntas relacionadas con la educación y el aprendizaje."
8. Limita tus respuestas a un máximo de 3-4 párrafos para mantenerlas concisas y útiles.
`;

async function getAnthropicResponse(message) {
    if (!ANTHROPIC_API_KEY) {
        console.error('Error: ANTHROPIC_API_KEY no está configurada en las variables de entorno');
        throw new Error('Clave de API de Anthropic no configurada');
    }
    
    console.log('Enviando mensaje a Anthropic:', message.substring(0, 50) + '...');
    
    try {
        const body = {
            model: 'claude-3-haiku-20240307', // Modelo más ligero y rápido
            max_tokens: 500,
            system: SYSTEM_PROMPT,
            messages: [
                { role: 'user', content: message }
            ]
        };
        
        console.log('Realizando petición a Anthropic API con modelo:', body.model);
        
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
            const errorText = await response.text();
            console.error('Error de Anthropic API:', response.status, errorText);
            throw new Error(`Error al comunicarse con Anthropic: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Respuesta recibida de Anthropic');
        
        // Extraer el texto de la respuesta según la estructura de la API
        return data.content?.[0]?.text || 'No se pudo obtener respuesta del asistente.';
    } catch (error) {
        console.error('Error en la comunicación con Anthropic:', error);
        throw new Error(`Error al procesar la respuesta: ${error.message}`);
    }
}

module.exports = { getAnthropicResponse }; 