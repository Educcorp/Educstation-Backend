const express = require('express');
const router = express.Router();
const { handleChatbotMessage } = require('../controllers/chatbotController');

// Ruta para recibir mensajes del usuario y responder usando Anthropic
router.post('/message', handleChatbotMessage);

module.exports = router; 