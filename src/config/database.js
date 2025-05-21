const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Función para parsear la URL de MySQL de Railway si existe
function createConnectionConfig() {
  // Configuración común para ambos entornos
  const commonConfig = {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000, // 60 segundos
    acquireTimeout: 60000,
    // Configurar un max_allowed_packet más grande (100MB)
    maxAllowedPacket: 104857600,
    // Otras opciones para mejorar el manejo de grandes conjuntos de datos
    flags: ['-FOUND_ROWS']
  };

  // Si estamos en Railway (producción)
  if (process.env.MYSQL_URL) {
    // La URL tiene este formato: mysql://usuario:contraseña@host:puerto/nombrebd
    try {
      const url = new URL(process.env.MYSQL_URL);
      return {
        host: url.hostname,
        port: url.port,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1), // Eliminar el '/' inicial
        ...commonConfig
      };
    } catch (error) {
      console.error('Error al parsear MYSQL_URL:', error.message);
      console.error('Por favor verifica el formato de la URL de MySQL');
      process.exit(1);
    }
  }
  // Si estamos en desarrollo local
  else {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'educcorp_educs',
      ...commonConfig
    };
  }
}

// Creación del pool de conexiones con manejo de errores
let pool;
try {
  pool = mysql.createPool(createConnectionConfig());

  // Registrar eventos del pool
  pool.on('connection', (connection) => {
    console.log('Nueva conexión establecida con la base de datos');
    
    // Configurar variables de sesión para esta conexión
    connection.query('SET SESSION net_read_timeout = 600');
    connection.query('SET SESSION net_write_timeout = 600');
    connection.query('SET SESSION wait_timeout = 600');
    connection.query('SET SESSION sql_mode = "NO_ENGINE_SUBSTITUTION"');
  });

  pool.on('error', (err) => {
    console.error('Error en el pool de conexiones:', err.message);
    if (err.code === 'ETIMEDOUT') {
      console.error('Tiempo de conexión agotado. Verifica que el servidor MySQL esté accesible.');
    }
  });
} catch (error) {
  console.error('Error al crear el pool de conexiones:', error.message);
  process.exit(1);
}

// Función de prueba de conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a la base de datos establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);

    // Proporcionar información adicional según el tipo de error
    if (error.code === 'ETIMEDOUT') {
      console.error('Tiempo de espera agotado. Verifica:');
      console.error('1. Que el servidor MySQL esté en ejecución');
      console.error('2. Que la dirección y puerto sean correctos');
      console.error('3. Que no haya un firewall bloqueando la conexión');
      if (process.env.MYSQL_URL) {
        console.error('4. Si estás usando Railway, verifica que tu IP esté en la lista blanca');
      }
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Acceso denegado. Verifica tu nombre de usuario y contraseña.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Base de datos no encontrada. Ejecuta "npm run migrate" para crearla.');
    }

    return false;
  }
}

module.exports = {
  pool,
  testConnection
};