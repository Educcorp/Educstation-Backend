const { pool } = require('./src/config/database');

(async () => {
  const connection = await pool.getConnection();
  try {
    const [posts] = await connection.query('SELECT * FROM Publicaciones WHERE ID_publicaciones = 3');
    if (posts.length > 0) {
      console.log('POST ID 3:');
      console.log('Título:', posts[0].Titulo);
      console.log('Contenido length:', posts[0].Contenido.length);
      console.log('Contenido completo:');
      console.log(posts[0].Contenido);
      console.log('\nTiene imágenes base64:', posts[0].Contenido.includes('data:image'));
      
      if (posts[0].Imagen_portada) {
        console.log('\nImagen portada tipo:', typeof posts[0].Imagen_portada);
        console.log('Imagen portada length:', posts[0].Imagen_portada.length);
        
        // Si es Buffer, convertir a string
        if (Buffer.isBuffer(posts[0].Imagen_portada)) {
          const imageString = posts[0].Imagen_portada.toString();
          console.log('Imagen portada preview (string):', imageString.substring(0, 100));
          console.log('Es base64:', imageString.startsWith('data:image'));
        } else {
          console.log('Imagen portada preview:', posts[0].Imagen_portada.substring(0, 100));
        }
      }
    } else {
      console.log('Post ID 3 no encontrado');
    }
  } finally {
    connection.release();
    pool.end();
  }
})(); 