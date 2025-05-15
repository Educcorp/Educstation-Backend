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
        rl.question('¿Qué tipo de cuenta deseas modificar? (1: Administrador, 2: Usuario): ', (option) => {
            if (option === '1') {
                rl.question('ID del administrador: ', (adminId) => {
                    rl.question('Ingrese nueva contraseña: ', (newPassword) => {
                        resolve({ type: 'admin', id: adminId, newPassword });
                        rl.close();
                    });
                });
            } else if (option === '2') {
                rl.question('Nombre de usuario o ID: ', (userIdentifier) => {
                    rl.question('Ingrese nueva contraseña: ', (newPassword) => {
                        resolve({ type: 'user', identifier: userIdentifier, newPassword });
                        rl.close();
                    });
                });
            } else {
                console.log('Opción inválida. Por favor selecciona 1 o 2.');
                promptInfo().then(resolve);
            }
        });
    });
};

// Función principal
async function resetPassword() {
    let connection;
    try {
        console.log('Conectando a la base de datos...');
        
        // Configuración de conexión
        connection = await mysql.createConnection({
            host: 'metro.proxy.rlwy.net',
            port: 58999,
            user: 'grego',
            password: 'Node2010',
            database: 'educcorp_educs'
        });

        console.log('Conexión establecida.');
        
        // Solicitar información
        const resetInfo = await promptInfo();
        
        // Generar hash de la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(resetInfo.newPassword, salt);
        
        if (resetInfo.type === 'admin') {
            // Verificar si el administrador existe
            const [adminRows] = await connection.execute(
                'SELECT * FROM Administrador WHERE ID_administrador = ?',
                [resetInfo.id]
            );
            
            if (adminRows.length === 0) {
                console.log(`No se encontró administrador con ID ${resetInfo.id}`);
                return;
            }
            
            console.log(`Restableciendo contraseña para administrador: ${adminRows[0].Nombre}`);
            
            // Actualizar la contraseña
            await connection.execute(
                'UPDATE Administrador SET Contraseña = ? WHERE ID_administrador = ?',
                [hashedPassword, resetInfo.id]
            );
        } else {
            // Determinar si se proporcionó un ID o nombre de usuario
            const isNumeric = /^\d+$/.test(resetInfo.identifier);
            let query, params;
            
            if (isNumeric) {
                query = 'SELECT * FROM auth_user WHERE id = ?';
                params = [resetInfo.identifier];
            } else {
                query = 'SELECT * FROM auth_user WHERE username = ?';
                params = [resetInfo.identifier];
            }
            
            // Verificar si el usuario existe
            const [userRows] = await connection.execute(query, params);
            
            if (userRows.length === 0) {
                console.log(`No se encontró usuario con ${isNumeric ? 'ID' : 'nombre de usuario'} ${resetInfo.identifier}`);
                return;
            }
            
            console.log(`Restableciendo contraseña para usuario: ${userRows[0].username} (${userRows[0].first_name} ${userRows[0].last_name})`);
            
            // Actualizar la contraseña
            await connection.execute(
                'UPDATE auth_user SET password = ? WHERE id = ?',
                [hashedPassword, userRows[0].id]
            );
        }
        
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

resetPassword(); 