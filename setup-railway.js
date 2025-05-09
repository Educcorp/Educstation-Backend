const fs = require('fs');
const readline = require('readline');
const { spawn } = require('child_process');

// Crear interfaz para leer entradas del usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Preguntar por información del usuario
const promptUser = () => {
    return new Promise((resolve) => {
        rl.question('Ingrese la URL de conexión MySQL de Railway (provista por el administrador): ', (mysqlUrl) => {
            rl.question('Ingrese la clave JWT_SECRET (provista por el administrador): ', (jwtSecret) => {
                rl.question('Ingrese la clave JWT_REFRESH_SECRET (provista por el administrador): ', (jwtRefreshSecret) => {
                    resolve({ mysqlUrl, jwtSecret, jwtRefreshSecret });
                    rl.close();
                });
            });
        });
    });
};

// Ejecutar migraciones
const runMigrations = () => {
    return new Promise((resolve, reject) => {
        console.log('Ejecutando migraciones...');

        const migrate = spawn('npm', ['run', 'migrate'], {
            stdio: 'inherit',
            shell: true
        });

        migrate.on('close', (code) => {
            if (code === 0) {
                console.log('Migraciones completadas con éxito');
                resolve();
            } else {
                console.error('Error al ejecutar migraciones');
                reject(new Error('Fallo en migraciones'));
            }
        });
    });
};

// Función principal
async function setupRailway() {
    try {
        console.log('Configurando proyecto para Railway...');

        const { mysqlUrl, jwtSecret, jwtRefreshSecret } = await promptUser();

        // Crear o actualizar archivo .env
        const envContent = `# URL de MySQL para Railway
MYSQL_URL=${mysqlUrl}

# Configuración de JWT
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_REFRESH_EXPIRES_IN=7d

# Puerto del servidor
PORT=3000
`;

        fs.writeFileSync('.env', envContent);
        console.log('Archivo .env creado correctamente');

        // Preguntar si desea ejecutar migraciones
        rl.question('¿Desea ejecutar las migraciones para crear las tablas? (s/n): ', async (answer) => {
            if (answer.toLowerCase() === 's') {
                try {
                    await runMigrations();
                } catch (error) {
                    console.error('Hubo un problema con las migraciones:', error.message);
                }
            }

            console.log('Configuración completada. Ahora puedes ejecutar npm install y luego npm run dev');
            rl.close();
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

setupRailway(); 