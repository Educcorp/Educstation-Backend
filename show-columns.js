const { pool } = require('./src/config/database');

async function showTableColumns() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    console.log('Mostrando columnas de la tabla Publicaciones:');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones
    `);
    
    // Imprimir los resultados en un formato tabular
    console.log('\nColumnas de la tabla Publicaciones:');
    console.log('----------------------------------');
    columns.forEach((column, index) => {
      console.log(`${index + 1}. ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });
    
  } catch (error) {
    console.error('Error al obtener columnas de la tabla:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

showTableColumns()
  .then(() => console.log('Proceso completado'))
  .catch(err => console.error('Error general:', err)); 