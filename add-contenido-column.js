const { pool } = require('./src/config/database');

async function addContenidoColumn() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Verificar si la columna Contenido ya existe
    console.log('Verificando si la columna Contenido existe...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones WHERE Field = 'Contenido'
    `);
    
    if (columns.length > 0) {
      console.log('✅ La columna Contenido ya existe');
      console.log(`Tipo actual: ${columns[0].Type}`);
      return;
    }
    
    console.log('❌ La columna Contenido NO existe. Agregándola...');
    
    // Agregar la columna Contenido como LONGTEXT después de Resumen
    await connection.query(`
      ALTER TABLE Publicaciones 
      ADD COLUMN Contenido LONGTEXT NULL 
      AFTER Resumen
    `);
    
    console.log('✅ Columna Contenido agregada exitosamente como LONGTEXT');
    
    // Verificar que se agregó correctamente
    const [newColumns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones WHERE Field = 'Contenido'
    `);
    
    if (newColumns.length > 0) {
      console.log(`✅ Verificación exitosa. Tipo de columna: ${newColumns[0].Type}`);
    }
    
    // Mostrar la estructura actualizada de la tabla
    console.log('\n=== ESTRUCTURA ACTUALIZADA DE LA TABLA ===');
    const [allColumns] = await connection.query('SHOW COLUMNS FROM Publicaciones');
    allColumns.forEach((col, index) => {
      const isNew = col.Field === 'Contenido' ? ' ⭐ NUEVA' : '';
      console.log(`${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${isNew}`);
    });
    
  } catch (error) {
    console.error('Error al agregar la columna Contenido:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

addContenidoColumn()
  .then(() => {
    console.log('Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  }); 