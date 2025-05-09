const jwt = require('jsonwebtoken');

// Usar directamente el secreto JWT del archivo .env
const JWT_SECRET = 'tu_clave_secreta_jwt_aqui';
const JWT_EXPIRES_IN = '24h';

// Generar token para administrador con ID 10
const userId = 10;
const token = jwt.sign(
  { userId },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
);

console.log('Token JWT generado (válido por 24 horas):');
console.log(token);

// Decodificar token para verificar contenido
const decoded = jwt.verify(token, JWT_SECRET);
console.log('\nContenido del token (decodificado):');
console.log(decoded);

console.log('\nPara usar este token en Postman:');
console.log('1. En la pestaña Headers, agrega:');
console.log('   Key: Authorization');
console.log('   Value: Bearer ' + token);
console.log('\n2. O si prefieres, en la pestaña Authorization:');
console.log('   Type: Bearer Token');
console.log('   Token: ' + token); 