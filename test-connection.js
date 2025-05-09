const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function testConnection() {
    console.log('Verificando conexión a MySQL...');

    // Mostrar la configuración (sin mostrar contraseñas completas)
    if (process.env.MYSQL_URL) {
        const url = new URL(process.env.MYSQL_URL);
        console.log('Usando URL de conexión:');
        console.log(`- Host: ${url.hostname}`);
        console.log(`- Puerto: ${url.port}`);
        console.log(`- Usuario: ${url.username}`);
        console.log(`- Password: ${'*'.repeat(url.password.length)}`);
        console.log(`- Base de datos: ${url.pathname.substring(1)}`);
    } else {
        console.log('Usando configuración local:');
        console.log(`- Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`- Puerto: ${process.env.DB_PORT || '3306'}`);
        console.log(`- Usuario: ${process.env.DB_USER || 'root'}`);
        console.log(`- Password: ${'*'.repeat((process.env.DB_PASSWORD || '').length)}`);
        console.log(`- Base de datos: ${process.env.DB_NAME || 'educcorp_educs'}`);
    }

    try {
        // Primero intentar conectar sin especificar base de datos
        console.log('\nIntentando conectar al servidor MySQL (sin DB)...');
        let connection;

        if (process.env.MYSQL_URL) {
            const url = new URL(process.env.MYSQL_URL);
            connection = await mysql.createConnection({
                host: url.hostname,
                port: url.port,
                user: url.username,
                password: url.password,
                connectTimeout: 10000, // 10 segundos
            });
        } else {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                connectTimeout: 10000, // 10 segundos
            });
        }

        console.log('✅ Conexión al servidor MySQL exitosa!');

        // Obtener las bases de datos disponibles
        console.log('\nBases de datos disponibles:');
        const [databases] = await connection.query('SHOW DATABASES');
        databases.forEach(db => {
            console.log(`- ${db.Database}`);
        });

        // Verificar permisos del usuario
        console.log('\nVerificando permisos del usuario:');
        try {
            const [grants] = await connection.query('SHOW GRANTS');
            grants.forEach(grant => {
                console.log(`- ${Object.values(grant)[0]}`);
            });
        } catch (error) {
            console.log('⚠️ No se pudo obtener información de permisos.');
        }

        await connection.end();

        // Intentar conectar con base de datos específica
        const dbName = process.env.MYSQL_URL
            ? new URL(process.env.MYSQL_URL).pathname.substring(1)
            : (process.env.DB_NAME || 'educcorp_educs');

        console.log(`\nIntentando conectar a la base de datos '${dbName}'...`);

        try {
            let dbConnection;
            if (process.env.MYSQL_URL) {
                dbConnection = await mysql.createConnection(process.env.MYSQL_URL);
            } else {
                dbConnection = await mysql.createConnection({
                    host: process.env.DB_HOST || 'localhost',
                    port: process.env.DB_PORT || 3306,
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASSWORD || '',
                    database: dbName,
                    connectTimeout: 10000, // 10 segundos
                });
            }

            console.log(`✅ Conexión a la base de datos '${dbName}' exitosa!`);
            await dbConnection.end();
        } catch (error) {
            console.log(`❌ Error al conectar a la base de datos '${dbName}': ${error.message}`);
            if (error.code === 'ER_BAD_DB_ERROR') {
                console.log(`\n🔧 La base de datos '${dbName}' no existe. Intentando crearla...`);
                try {
                    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
                    console.log(`✅ Base de datos '${dbName}' creada exitosamente!`);
                } catch (createError) {
                    console.log(`❌ No se pudo crear la base de datos: ${createError.message}`);
                }
            }
        }

        return true;
    } catch (error) {
        console.log('\n❌ Error de conexión a MySQL:');
        console.log(`- Código: ${error.code || 'Desconocido'}`);
        console.log(`- Mensaje: ${error.message}`);
        console.log(`- Errno: ${error.errno || 'Desconocido'}`);

        // Sugerencias específicas para cada error
        if (error.code === 'ETIMEDOUT') {
            console.log('\n🔍 Posibles soluciones para ETIMEDOUT:');
            console.log('1. Verifica que el servidor MySQL esté activo y aceptando conexiones');
            console.log('2. Comprueba que la dirección IP y el puerto sean correctos');
            console.log('3. Revisa si hay un firewall bloqueando la conexión');
            console.log('4. Asegúrate de que el host permita conexiones remotas');
            console.log('5. Si usas Railway, verifica que tu IP esté en la lista de permitidas');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n🔍 Posibles soluciones para ER_ACCESS_DENIED_ERROR:');
            console.log('1. Verifica que el nombre de usuario sea correcto');
            console.log('2. Comprueba que la contraseña sea correcta');
            console.log('3. Asegúrate de que el usuario tenga permisos para conectarse desde tu ubicación');
        }

        return false;
    }
}

// Ejecutar la prueba
testConnection().then(success => {
    console.log('\n' + (success ? '✅ Prueba completada con éxito.' : '❌ Prueba fallida.'));
    process.exit(success ? 0 : 1);
}); 