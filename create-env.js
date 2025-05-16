const fs = require('fs');

// Verificar si el archivo .env ya existe
if (fs.existsSync('.env')) {
  console.log('¡Advertencia! El archivo .env ya existe.');
  console.log('Para evitar sobrescribir configuraciones existentes, este script se detendrá.');
  console.log('Si realmente deseas regenerar el archivo .env, elimínalo primero manualmente.');
  process.exit(1);
}

// Crear contenido del archivo .env
const envContent = `# URL de MySQL para Railway (producción)
MYSQL_URL=mysql://root:afHXYXrlbmdRYzFFfpSjNZNlRRiytxHU@metro.proxy.rlwy.net:58999/educcorp_educs

# Configuración de base de datos local (desarrollo)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Node2010
DB_NAME=educcorp_educs

# Configuración de JWT
JWT_SECRET=mysecretkey123456789
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=myrefreshsecretkey123456789
JWT_REFRESH_EXPIRES_IN=7d

# Puerto del servidor
PORT=3000

# Frontend URL (para enlaces en correos, etc.)
FRONTEND_URL=http://localhost:3002

# CORS
CORS_ORIGINS=http://localhost:3002,https://www.educstation.com,https://educstation.com
`;

// Escribir archivo .env
fs.writeFileSync('.env', envContent);

console.log('✅ Archivo .env creado exitosamente con valores predeterminados para pruebas.');
console.log('⚠️ Nota: Esta configuración es solo para pruebas locales.');
console.log('⚠️ En un entorno de producción, debes usar secretos más seguros.');
console.log('\nPara ejecutar el servidor:');
console.log('   npm run dev');
console.log('\nPara generar un token de prueba:');
console.log('   node test-token.js'); 