const { pool } = require('./src/config/database');

async function insertAdmin() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Insertar administrador
    const [result] = await pool.query(
      `INSERT INTO Administrador (Nombre, Correo_electronico, Contraseña) 
       VALUES (?, ?, ?)`,
      ['Gregorio Sanchez', 'gregosz3333@gmail.com', 'PasswordHashDemo']
    );
    
    console.log('Administrador creado exitosamente:');
    console.log('ID insertado:', result.insertId);
    console.log('Filas afectadas:', result.affectedRows);
    
    // Cerrar la conexión
    await pool.end();
    console.log('Conexión cerrada');
  } catch (error) {
    console.error('Error al insertar administrador:', error.message);
    if (pool) await pool.end();
  }
}

// Ejecutar la función
insertAdmin(); 