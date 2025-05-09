require('dotenv').config();
const jwt = require('jsonwebtoken');

// Verifica que las variables de entorno necesarias estén definidas
if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
  console.error('Error: Las variables de entorno JWT_SECRET y JWT_EXPIRES_IN son requeridas.');
  console.log('Por favor, agrega estas variables en tu archivo .env:');
  console.log('JWT_SECRET=<tu_secreto_jwt>');
  console.log('JWT_EXPIRES_IN=<tiempo_expiracion_como_24h>');
  process.exit(1);
}

// Genera un token para el administrador con ID 10
const userId = 10;
const token = jwt.sign(
  { userId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

console.log('Token JWT generado:');
console.log(token);

// Decodifica el token para verificar su contenido
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log('\nContenido del token (decodificado):');
console.log(decoded);

console.log('\nPara usar este token en Postman:');
console.log('1. Agregar header Authorization: Bearer ' + token);
console.log('2. Este token expirará en:', process.env.JWT_EXPIRES_IN); 