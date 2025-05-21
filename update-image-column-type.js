const { pool } = require('./src/config/database');

// Esta función actualiza el tipo de columna Imagen_portada para soportar imágenes más grandes
async function updateImageColumnType() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Verificar el tipo actual de la columna
    console.log('Verificando tipo actual de la columna Imagen_portada...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones WHERE Field = 'Imagen_portada'
    `);
    
    if (columns.length > 0) {
      console.log(`Tipo actual de la columna: ${columns[0].Type}`);
      
      // Si el tipo actual es menor que MEDIUMTEXT, actualizarlo
      if (columns[0].Type.toLowerCase() === 'text') {
        console.log('Actualizando tipo de columna a MEDIUMTEXT (hasta 16MB)...');
        await connection.query(`
          ALTER TABLE Publicaciones
          MODIFY COLUMN Imagen_portada MEDIUMTEXT
        `);
        console.log('¡Columna Imagen_portada actualizada a MEDIUMTEXT!');
      } else if (columns[0].Type.toLowerCase() === 'mediumtext') {
        console.log('Actualizando tipo de columna a LONGTEXT (hasta 4GB)...');
        await connection.query(`
          ALTER TABLE Publicaciones
          MODIFY COLUMN Imagen_portada LONGTEXT
        `);
        console.log('¡Columna Imagen_portada actualizada a LONGTEXT!');
      } else if (columns[0].Type.toLowerCase() === 'longtext') {
        console.log('La columna ya es de tipo LONGTEXT, no es necesario actualizar.');
      } else {
        console.log(`Tipo de columna ${columns[0].Type} no reconocido. Se actualizará a LONGTEXT.`);
        await connection.query(`
          ALTER TABLE Publicaciones
          MODIFY COLUMN Imagen_portada LONGTEXT
        `);
        console.log('¡Columna Imagen_portada actualizada a LONGTEXT!');
      }
      
      // Verificar tipo después de la actualización
      const [updatedColumns] = await connection.query(`
        SHOW COLUMNS FROM Publicaciones WHERE Field = 'Imagen_portada'
      `);
      
      console.log(`Tipo de columna después de la actualización: ${updatedColumns[0].Type}`);
      
      // Información de límites de tamaño
      console.log('\nInformación de límites de tamaño de columnas TEXT en MySQL:');
      console.log('- TEXT: hasta 64KB (65,535 bytes)');
      console.log('- MEDIUMTEXT: hasta 16MB (16,777,215 bytes)');
      console.log('- LONGTEXT: hasta 4GB (4,294,967,295 bytes)');
      
    } else {
      console.log('No se encontró la columna Imagen_portada en la tabla Publicaciones.');
    }
    
  } catch (error) {
    console.error('Error al actualizar el tipo de columna:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

updateImageColumnType()
  .then(() => console.log('Proceso completado'))
  .catch(err => console.error('Error general:', err)); 