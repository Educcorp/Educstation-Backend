require('dotenv').config();

console.log('====== VARIABLES DE ENTORNO ======');
console.log('MYSQL_URL:', process.env.MYSQL_URL ? 'DEFINIDO' : 'NO DEFINIDO');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'DEFINIDO' : 'NO DEFINIDO');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || 'NO DEFINIDO');
console.log('===============================');

// Verificar problemas críticos
if (!process.env.JWT_SECRET) {
  console.log('⚠️ ¡ADVERTENCIA! JWT_SECRET no está definido. La autenticación no funcionará.');
}

// Verificar si las variables JWT necesarias están definidas
if (!process.env.JWT_EXPIRES_IN) {
  console.log('⚠️ ¡ADVERTENCIA! JWT_EXPIRES_IN no está definido. Esto puede causar problemas con la autenticación.');
}

// Verificar si están definidas las variables de conexión a la base de datos
if (!process.env.MYSQL_URL && (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD)) {
  console.log('⚠️ ¡ADVERTENCIA! No hay suficientes variables de conexión a la base de datos definidas.');
} 