const { pool } = require('./src/config/database');

async function checkImagePosts() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Revisar los posts con imágenes
    console.log('Revisando posts con imágenes...');
    const [posts] = await connection.query(`
      SELECT ID_publicaciones, Titulo, Contenido, Imagen_portada,
             LENGTH(Contenido) as contenido_length,
             LENGTH(Imagen_portada) as imagen_portada_length
      FROM Publicaciones 
      WHERE Contenido LIKE '%<img%' 
      ORDER BY Fecha_creacion DESC 
      LIMIT 2
    `);
    
    for (const post of posts) {
      console.log('\n' + '='.repeat(50));
      console.log(`POST ID: ${post.ID_publicaciones}`);
      console.log(`TÍTULO: ${post.Titulo}`);
      console.log(`LONGITUD CONTENIDO: ${post.contenido_length} caracteres`);
      console.log(`LONGITUD IMAGEN PORTADA: ${post.imagen_portada_length || 0} caracteres`);
      
      console.log('\n--- CONTENIDO COMPLETO ---');
      console.log(post.Contenido);
      
      if (post.Imagen_portada) {
        console.log('\n--- IMAGEN PORTADA (primeros 100 chars) ---');
        console.log(post.Imagen_portada.substring(0, 100) + '...');
      }
      
      // Análisis de imágenes en el contenido
      const hasImages = post.Contenido.includes('<img');
      const hasBase64Images = post.Contenido.includes('src="data:image');
      const imgMatches = post.Contenido.match(/<img[^>]*>/g);
      
      console.log('\n--- ANÁLISIS DE IMÁGENES ---');
      console.log(`Contiene <img>: ${hasImages}`);
      console.log(`Contiene base64: ${hasBase64Images}`);
      console.log(`Número de imágenes: ${imgMatches ? imgMatches.length : 0}`);
      
      if (imgMatches) {
        imgMatches.forEach((img, index) => {
          console.log(`\nImagen ${index + 1}:`);
          console.log(img.substring(0, 150) + (img.length > 150 ? '...' : ''));
        });
      }
    }
    
    // También revisar todos los posts para ver cuáles están disponibles
    console.log('\n' + '='.repeat(50));
    console.log('TODOS LOS POSTS DISPONIBLES:');
    const [allPosts] = await connection.query(`
      SELECT ID_publicaciones, Titulo, Estado, Fecha_creacion 
      FROM Publicaciones 
      ORDER BY ID_publicaciones DESC 
      LIMIT 10
    `);
    
    allPosts.forEach(post => {
      console.log(`ID ${post.ID_publicaciones}: ${post.Titulo} [${post.Estado}] - ${post.Fecha_creacion}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

checkImagePosts()
  .then(() => {
    console.log('Análisis completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  }); 