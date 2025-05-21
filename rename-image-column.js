const { pool } = require('./src/config/database');

async function renameImagePortadaColumn() {
  let connection;
  
  try {
    console.log('Iniciando la conexión a la base de datos...');
    connection = await pool.getConnection();
    
    // Verificar si la columna imagen_portada_html existe
    console.log('Verificando si la columna imagen_portada_html existe...');
    const [oldColumns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones LIKE 'imagen_portada_html'
    `);
    
    // Verificar si la columna Imagen_portada ya existe
    console.log('Verificando si la columna Imagen_portada ya existe...');
    const [newColumns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones LIKE 'Imagen_portada'
    `);
    
    if (oldColumns.length > 0 && newColumns.length === 0) {
      console.log('La columna imagen_portada_html existe y será renombrada a Imagen_portada...');
      
      // Renombrar la columna
      await connection.query(`
        ALTER TABLE Publicaciones
        CHANGE COLUMN imagen_portada_html Imagen_portada MEDIUMTEXT NULL
      `);
      
      console.log('La columna ha sido renombrada correctamente a Imagen_portada.');
    } else if (newColumns.length > 0) {
      console.log('La columna Imagen_portada ya existe en la tabla Publicaciones.');
      
      // Si ambas columnas existen, transferir datos y eliminar la antigua
      if (oldColumns.length > 0) {
        console.log('La columna imagen_portada_html también existe. Copiando datos a Imagen_portada...');
        
        await connection.query(`
          UPDATE Publicaciones
          SET Imagen_portada = imagen_portada_html
          WHERE Imagen_portada IS NULL AND imagen_portada_html IS NOT NULL
        `);
        
        console.log('Eliminando la columna antigua imagen_portada_html...');
        await connection.query(`
          ALTER TABLE Publicaciones
          DROP COLUMN imagen_portada_html
        `);
        
        console.log('La columna antigua ha sido eliminada.');
      }
    } else {
      console.log('La columna imagen_portada_html no existe en la tabla Publicaciones.');
      console.log('Creando la columna Imagen_portada...');
      
      // Crear la nueva columna
      await connection.query(`
        ALTER TABLE Publicaciones
        ADD COLUMN Imagen_portada MEDIUMTEXT NULL AFTER Resumen
      `);
      
      console.log('La columna Imagen_portada ha sido creada correctamente.');
    }
    
    // Verificar el estado final
    const [finalColumns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones LIKE 'Imagen_portada'
    `);
    
    if (finalColumns.length > 0) {
      console.log('Verificación: La columna Imagen_portada existe en la tabla.');
    } else {
      console.log('¡Error! La columna Imagen_portada no existe después de las operaciones.');
    }
    
  } catch (error) {
    console.error('Error al trabajar con las columnas:', error);
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
renameImagePortadaColumn()
  .then(() => console.log('Proceso completado'))
  .catch(err => console.error('Error en el proceso principal:', err)); 