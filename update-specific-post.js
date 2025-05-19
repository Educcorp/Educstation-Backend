const { pool } = require('./src/config/database');

// Obtener el ID del post como parámetro de línea de comandos
const postId = process.argv[2] || 32; // Valor por defecto 32 si no se proporciona

async function updateSpecificPost() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // HTML de ejemplo para una imagen
    const imagenHTML = `<img src="https://via.placeholder.com/800x400" alt="Imagen de prueba" data-image-type="html-encoded" style="max-width: 100%; height: auto;" />`;
    
    // Verificar si el post existe
    const [existingPost] = await connection.query(`
      SELECT ID_publicaciones, Titulo, Contenido
      FROM Publicaciones
      WHERE ID_publicaciones = ?
    `, [postId]);
    
    if (existingPost.length === 0) {
      console.log(`\nNo se encontró ningún post con ID ${postId}`);
      
      // Alternativamente, podemos buscar los IDs disponibles
      const [availablePosts] = await connection.query(`
        SELECT ID_publicaciones FROM Publicaciones LIMIT 10
      `);
      
      if (availablePosts.length > 0) {
        console.log('\nIDs de posts disponibles:');
        console.log(availablePosts.map(p => p.ID_publicaciones).join(', '));
        console.log('\nEjecuta el script con uno de estos IDs: node update-specific-post.js ID');
      } else {
        console.log('No hay posts disponibles en la base de datos.');
      }
      
      return;
    }
    
    console.log(`\nPost encontrado con ID ${postId}:`);
    console.log(`Título: ${existingPost[0].Titulo}`);
    
    // Actualizar el post con la imagen HTML
    console.log(`\nActualizando post ID ${postId} con una imagen HTML...`);
    const [result] = await connection.query(`
      UPDATE Publicaciones
      SET imagen_portada_html = ?
      WHERE ID_publicaciones = ?
    `, [imagenHTML, postId]);
    
    if (result.affectedRows > 0) {
      console.log(`Post ${postId} actualizado correctamente con imagen HTML`);
      
      // Verificar que la actualización se realizó correctamente
      const [post] = await connection.query(`
        SELECT ID_publicaciones, Titulo, imagen_portada_html
        FROM Publicaciones
        WHERE ID_publicaciones = ?
      `, [postId]);
      
      console.log('\nDetalles del post actualizado:');
      console.log(`ID: ${post[0].ID_publicaciones}`);
      console.log(`Título: ${post[0].Titulo}`);
      console.log(`Imagen HTML: ${post[0].imagen_portada_html ? 'PRESENTE' : 'NO PRESENTE'}`);
    }
    
  } catch (error) {
    console.error('Error al actualizar el post:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

updateSpecificPost()
  .then(() => console.log('Proceso completado'))
  .catch(err => console.error('Error general:', err)); 