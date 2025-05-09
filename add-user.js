const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

// Crear interfaz para leer entradas del usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Preguntar por información del usuario
const promptUser = () => {
    return new Promise((resolve) => {
        rl.question('Ingrese nombre de usuario: ', (username) => {
            rl.question('Ingrese contraseña: ', (password) => {
                resolve({ username, password });
                rl.close();
            });
        });
    });
};

// Función principal
async function addDatabaseUser() {
    try {
        console.log('Agregando nuevo usuario a la base de datos...');

        const { username, password } = await promptUser();

        // Determinar el nombre de la base de datos
        const dbName = process.env.MYSQL_URL
            ? new URL(process.env.MYSQL_URL).pathname.substring(1)
            : (process.env.DB_NAME || 'educcorp_educs');

        console.log(`Usando base de datos: ${dbName}`);

        // Primero conectar sin especificar la base de datos
        let rootConnection;
        if (process.env.MYSQL_URL) {
            // Para Railway, conectamos sin la parte de la base de datos
            const urlObj = new URL(process.env.MYSQL_URL);
            rootConnection = await mysql.createConnection({
                host: urlObj.hostname,
                port: urlObj.port,
                user: urlObj.username,
                password: urlObj.password
            });
            console.log('Conectado a la base de datos de Railway (sin DB)');
        } else {
            // Para local
            rootConnection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || ''
            });
            console.log('Conectado a la base de datos local (sin DB)');
        }

        // Crear la base de datos si no existe
        console.log(`Verificando/creando base de datos ${dbName}...`);
        await rootConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`Base de datos ${dbName} verificada/creada.`);

        // Cerrar la conexión sin base de datos
        await rootConnection.end();

        // Ahora conectar especificando la base de datos
        let connection;
        if (process.env.MYSQL_URL) {
            connection = await mysql.createConnection(process.env.MYSQL_URL);
            console.log('Conectado a la base de datos de Railway (con DB)');
        } else {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: dbName
            });
            console.log('Conectado a la base de datos local (con DB)');
        }

        // Crear el usuario
        console.log(`Creando usuario ${username}...`);
        await connection.execute(`CREATE USER IF NOT EXISTS '${username}'@'%' IDENTIFIED BY '${password}'`);

        // Otorgar todos los permisos en la base de datos
        console.log(`Asignando permisos a ${username} en ${dbName}...`);
        await connection.execute(`GRANT ALL PRIVILEGES ON ${dbName}.* TO '${username}'@'%'`);

        // Aplicar cambios
        await connection.execute('FLUSH PRIVILEGES');

        console.log(`¡Usuario ${username} creado exitosamente con acceso a ${dbName}!`);

        // Instrucciones para el desarrollador
        console.log('\n--- Instrucciones para desarrolladores del equipo ---');
        console.log('1. Crea un archivo .env en tu proyecto local con lo siguiente:');
        console.log(`
DB_HOST=${process.env.MYSQL_URL ? new URL(process.env.MYSQL_URL).hostname : 'localhost'}
DB_PORT=${process.env.MYSQL_URL ? new URL(process.env.MYSQL_URL).port : '3306'}
DB_USER=${username}
DB_PASSWORD=${password}
DB_NAME=${dbName}
JWT_SECRET=${process.env.JWT_SECRET || 'your_jwt_secret'}
JWT_EXPIRES_IN=${process.env.JWT_EXPIRES_IN || '1h'}
JWT_REFRESH_SECRET=${process.env.JWT_REFRESH_SECRET || 'your_refresh_secret'}
JWT_REFRESH_EXPIRES_IN=${process.env.JWT_REFRESH_EXPIRES_IN || '7d'}
`);
        console.log('2. Ejecuta npm run dev');

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('No tienes permisos suficientes para crear usuarios.');
            console.error('Asegúrate de ejecutar este script con un usuario con privilegios de administrador.');
        }
    }
}

addDatabaseUser(); 