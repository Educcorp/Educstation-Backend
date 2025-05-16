const { pool } = require('./src/config/database');

async function addImagePortadaHTMLColumn() {
  let connection;
  
  try {
    console.log('Iniciando la conexión a la base de datos...');
    connection = await pool.getConnection();
    
    // Verificar si la columna ya existe para evitar errores
    console.log('Verificando si la columna imagen_portada_html ya existe...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones LIKE 'imagen_portada_html'
    `);
    
    if (columns.length > 0) {
      console.log('La columna imagen_portada_html ya existe en la tabla Publicaciones.');
    } else {
      console.log('Añadiendo la columna imagen_portada_html a la tabla Publicaciones...');
      
      // Añadir la columna imagen_portada_html
      await connection.query(`
        ALTER TABLE Publicaciones
        ADD COLUMN imagen_portada_html MEDIUMTEXT NULL AFTER Resumen
      `);
      
      console.log('La columna imagen_portada_html se ha añadido correctamente.');
    }
  } catch (error) {
    console.error('Error al añadir la columna imagen_portada_html:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('Conexión cerrada');
    }
    
    // Cerrar el pool de conexiones
    pool.end();
  }
}

// Ejecutar la función
addImagePortadaHTMLColumn()
  .then(() => console.log('Proceso completado'))
  .catch(err => console.error('Error en el proceso principal:', err)); 