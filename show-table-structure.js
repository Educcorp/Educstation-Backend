const { pool } = require('./src/config/database');

(async () => {
  const connection = await pool.getConnection();
  try {
    const [columns] = await connection.query('SHOW COLUMNS FROM Publicaciones');
    console.log('Columnas de la tabla Publicaciones:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
  } finally {
    connection.release();
    pool.end();
  }
})(); 