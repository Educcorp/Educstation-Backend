const { pool } = require('./src/config/database');

async function checkAdmins() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Consultar administradores
    const [rows] = await pool.query('SELECT * FROM Administrador');
    
    console.log('Administradores encontrados:', rows.length);
    
    if (rows.length > 0) {
      console.log('Lista de administradores:');
      rows.forEach(admin => {
        console.log(`ID: ${admin.ID_administrador}, Nombre: ${admin.Nombre}, Email: ${admin.Correo_electronico}`);
      });
    } else {
      console.log('No hay administradores registrados');
    }
    
    // Cerrar la conexión
    await pool.end();
    console.log('Conexión cerrada');
  } catch (error) {
    console.error('Error al consultar administradores:', error.message);
    if (pool) await pool.end();
  }
}

// Ejecutar la función
checkAdmins(); 