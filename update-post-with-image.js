const { pool } = require('./src/config/database');

async function updatePostWithImageHTML() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // ID del post que quieres actualizar (basado en la imagen que mostraste)
    const postId = 32; // Ajusta este ID según tu caso
    
    // HTML de ejemplo para una imagen
    const imagenHTML = `<img src="https://via.placeholder.com/800x400" alt="Imagen de muestra" data-image-type="html-encoded" style="max-width: 100%; height: auto;" />`;
    
    console.log(`Actualizando post ID ${postId} con una imagen HTML...`);
    
    // Actualizar el post con la imagen HTML
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
    } else {
      console.log(`No se encontró ningún post con ID ${postId}`);
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

updatePostWithImageHTML()
  .then(() => console.log('Proceso completado'))
  .catch(err => console.error('Error general:', err)); 