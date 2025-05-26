const { pool } = require('./src/config/database');

async function addContadorLikesColumn() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Verificar si la columna contador_likes ya existe
    console.log('Verificando si la columna contador_likes existe...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones WHERE Field = 'contador_likes'
    `);
    
    if (columns.length > 0) {
      console.log('✅ La columna contador_likes ya existe');
      console.log(`Tipo actual: ${columns[0].Type}`);
      return;
    }
    
    console.log('❌ La columna contador_likes NO existe. Agregándola...');
    
    // Agregar la columna contador_likes como INT DEFAULT 0
    await connection.query(`
      ALTER TABLE Publicaciones 
      ADD COLUMN contador_likes INT DEFAULT 0 
      AFTER Estado
    `);
    
    console.log('✅ Columna contador_likes agregada exitosamente como INT DEFAULT 0');
    
    // Verificar que se agregó correctamente
    const [newColumns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones WHERE Field = 'contador_likes'
    `);
    
    if (newColumns.length > 0) {
      console.log(`✅ Verificación exitosa. Tipo de columna: ${newColumns[0].Type}`);
    }
    
    // Inicializar todos los registros existentes con 0 likes
    console.log('Inicializando registros existentes con 0 likes...');
    const [updateResult] = await connection.query(`
      UPDATE Publicaciones 
      SET contador_likes = 0 
      WHERE contador_likes IS NULL
    `);
    
    console.log(`✅ Inicializados ${updateResult.affectedRows} registros con 0 likes`);
    
    // Mostrar la estructura actualizada de la tabla
    console.log('\n=== ESTRUCTURA ACTUALIZADA DE LA TABLA ===');
    const [allColumns] = await connection.query('SHOW COLUMNS FROM Publicaciones');
    allColumns.forEach((col, index) => {
      const isNew = col.Field === 'contador_likes' ? ' ⭐ NUEVA' : '';
      console.log(`${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${isNew}`);
    });
    
  } catch (error) {
    console.error('Error al agregar la columna contador_likes:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

addContadorLikesColumn()
  .then(() => {
    console.log('Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  }); 