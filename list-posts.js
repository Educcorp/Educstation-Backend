const { pool } = require('./src/config/database');

async function listPosts() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    console.log('Obteniendo lista de publicaciones...');
    const [posts] = await connection.query(`
      SELECT ID_publicaciones, Titulo, Resumen, Estado, Fecha_creacion
      FROM Publicaciones
      ORDER BY ID_publicaciones DESC
      LIMIT 20
    `);
    
    if (posts.length > 0) {
      console.log('\nPublicaciones disponibles:');
      console.log('------------------------');
      posts.forEach(post => {
        console.log(`ID: ${post.ID_publicaciones}`);
        console.log(`Título: ${post.Titulo}`);
        console.log(`Estado: ${post.Estado}`);
        console.log(`Fecha: ${new Date(post.Fecha_creacion).toLocaleString()}`);
        console.log('------------------------');
      });
    } else {
      console.log('No se encontraron publicaciones');
    }
    
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

listPosts()
  .then(() => console.log('Proceso completado'))
  .catch(err => console.error('Error general:', err)); 