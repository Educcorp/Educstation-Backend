const { pool } = require('./src/config/database');

(async () => {
  const connection = await pool.getConnection();
  try {
    const [posts] = await connection.query('SELECT * FROM Publicaciones WHERE ID_publicaciones = 4');
    if (posts.length > 0) {
      const post = posts[0];
      console.log('POST ID 4 CREADO EXITOSAMENTE:');
      console.log('ID:', post.ID_publicaciones);
      console.log('Título:', post.Titulo);
      console.log('Contenido length:', post.Contenido ? post.Contenido.length : 0);
      console.log('Tiene imágenes base64:', post.Contenido ? post.Contenido.includes('data:image') : false);
      console.log('Número de imágenes:', post.Contenido ? (post.Contenido.match(/<img/g) || []).length : 0);
      console.log('Estado:', post.Estado);
      console.log('\nPrimeros 200 caracteres del contenido:');
      console.log(post.Contenido ? post.Contenido.substring(0, 200) + '...' : 'Sin contenido');
      
      if (post.Imagen_portada) {
        console.log('\nTiene imagen de portada:', Buffer.isBuffer(post.Imagen_portada) ? 'Sí (Buffer)' : 'Sí (String)');
      }
    } else {
      console.log('Post ID 4 no encontrado');
    }
  } finally {
    connection.release();
    pool.end();
  }
})(); 