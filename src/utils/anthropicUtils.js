const fetch = require('node-fetch');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Prompt de sistema que define el comportamiento del chatbot - versión más flexible
const SYSTEM_PROMPT = `
Eres un asistente educativo amigable de EducStation, una plataforma dedicada a la educación.
Instrucciones:
1. Responde en español de forma natural y conversacional.
2. Eres experto en temas educativos, pedagogía, técnicas de estudio y aprendizaje.
3. Proporciona respuestas útiles y basadas en evidencia sobre cualquier tema educativo o académico.
4. Mantén un tono amable, cercano y motivador.
5. Puedes responder preguntas sobre cualquier materia académica: matemáticas, ciencias, historia, literatura, etc.
6. Está bien responder preguntas generales sobre cultura, tecnología, arte o temas de actualidad mientras tengan un enfoque educativo.
7. Solo evita responder a preguntas que promuevan:
   - Contenido explícitamente sexual
   - Violencia gráfica o daño a personas
   - Actividades claramente ilegales
8. Si no estás seguro si una pregunta es apropiada, asume que lo es y responde de manera educativa.
9. Limita tus respuestas a 2-3 párrafos para mantenerlas concisas y útiles.
10. Si la persona parece frustrada o confundida, sé especialmente amable y ofrece ayuda adicional.
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