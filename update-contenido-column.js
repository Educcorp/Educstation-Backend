const { pool } = require('./src/config/database');

// Esta función actualiza el tipo de columna Contenido para soportar contenido HTML más grande
async function updateContenidoColumnType() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Verificar el tipo actual de la columna Contenido
    console.log('Verificando tipo actual de la columna Contenido...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones WHERE Field = 'Contenido'
    `);
    
    if (columns.length > 0) {
      console.log(`Tipo actual de la columna Contenido: ${columns[0].Type}`);
      
      // Si el tipo actual es TEXT, actualizarlo a LONGTEXT
      if (columns[0].Type.toLowerCase() === 'text') {
        console.log('Actualizando tipo de columna Contenido a LONGTEXT (hasta 4GB)...');
        await connection.query(`
          ALTER TABLE Publicaciones
          MODIFY COLUMN Contenido LONGTEXT NOT NULL
        `);
        console.log('¡Columna Contenido actualizada a LONGTEXT!');
      } else if (columns[0].Type.toLowerCase() === 'longtext') {
        console.log('La columna Contenido ya es de tipo LONGTEXT, no es necesario actualizar.');
      } else {
        console.log(`Tipo de columna ${columns[0].Type} detectado. Se actualizará a LONGTEXT.`);
        await connection.query(`
          ALTER TABLE Publicaciones
          MODIFY COLUMN Contenido LONGTEXT NOT NULL
        `);
        console.log('¡Columna Contenido actualizada a LONGTEXT!');
      }
      
      // Verificar tipo después de la actualización
      const [updatedColumns] = await connection.query(`
        SHOW COLUMNS FROM Publicaciones WHERE Field = 'Contenido'
      `);
      
      console.log(`Tipo de columna Contenido después de la actualización: ${updatedColumns[0].Type}`);
      
      // Información de límites de tamaño
      console.log('\nInformación de límites de tamaño de columnas TEXT en MySQL:');
      console.log('- TEXT: hasta 64KB (65,535 bytes)');
      console.log('- MEDIUMTEXT: hasta 16MB (16,777,215 bytes)');
      console.log('- LONGTEXT: hasta 4GB (4,294,967,295 bytes)');
      
      console.log('\nEsto permitirá guardar contenido HTML con imágenes base64 grandes sin problemas.');
      
    } else {
      console.log('No se encontró la columna Contenido en la tabla Publicaciones.');
    }
    
  } catch (error) {
    console.error('Error al actualizar el tipo de columna Contenido:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

// Ejecutar la función
updateContenidoColumnType()
  .then(() => {
    console.log('Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  }); 