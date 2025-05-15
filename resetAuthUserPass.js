const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const readline = require('readline');

dotenv.config();

// Crear interfaz para leer entradas del usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Preguntar por información del usuario
const promptInfo = () => {
    return new Promise((resolve) => {
        rl.question('Ingrese el nombre de usuario: ', (username) => {
            rl.question('Ingrese nueva contraseña: ', (newPassword) => {
                resolve({ username, newPassword });
                rl.close();
            });
        });
    });
};

// Función principal
async function resetUserPassword() {
    let connection;
    try {
        console.log('Conectando a la base de datos...');
        
        // Configuración de conexión
        if (process.env.MYSQL_URL) {
            connection = await mysql.createConnection(process.env.MYSQL_URL);
        } else {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'metro.proxy.rlwy.net',
                port: process.env.DB_PORT || 58999,
                user: process.env.DB_USER || 'grego',
                password: process.env.DB_PASSWORD || 'Node2010',
                database: process.env.DB_NAME || 'educcorp_educs'
            });
        }

        console.log('Conexión establecida.');
        
        // Solicitar información
        const { username, newPassword } = await promptInfo();
        
        // Verificar si el usuario existe
        const [userRows] = await connection.execute(
            'SELECT * FROM auth_user WHERE username = ?',
            [username]
        );
        
        if (userRows.length === 0) {
            console.log(`No se encontró usuario con nombre "${username}"`);
            return;
        }
        
        console.log(`Restableciendo contraseña para: ${username} (${userRows[0].first_name} ${userRows[0].last_name})`);
        
        // Generar hash de la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Actualizar la contraseña
        await connection.execute(
            'UPDATE auth_user SET password = ? WHERE username = ?',
            [hashedPassword, username]
        );
        
        console.log('¡Contraseña actualizada exitosamente!');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Conexión cerrada');
        }
    }
}

resetUserPassword(); 