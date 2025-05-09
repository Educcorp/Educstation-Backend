const fs = require('fs');
const crypto = require('crypto');

// Leer el archivo .env actual
let envContent = fs.readFileSync('.env', 'utf8');

// Generar nuevos secretos
const jwtSecret = crypto.randomBytes(32).toString('hex');
const refreshSecret = crypto.randomBytes(32).toString('hex');

// Reemplazar los valores de marcador de posición con secretos reales
envContent = envContent.replace('tu_clave_secreta_jwt_aqui', jwtSecret);
envContent = envContent.replace('tu_clave_secreta_refresh_aqui', refreshSecret);

// Guardar el archivo .env actualizado
fs.writeFileSync('.env.new', envContent);

console.log('⚠️ Por seguridad, no se ha sobrescrito tu archivo .env actual.');
console.log('✅ Se ha creado un nuevo archivo .env.new con secretos JWT seguros.');
console.log('\nPara usar el nuevo archivo:');
console.log('1. Verifica el contenido de .env.new');
console.log('2. Renómbralo a .env para activar los nuevos secretos');
console.log('3. Reinicia tu servidor');

// Generar un token con los nuevos secretos
console.log('\nPara generar un nuevo token después de actualizar .env:');
console.log('   node test-token.js'); 