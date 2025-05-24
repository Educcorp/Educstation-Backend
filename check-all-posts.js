const { pool } = require('./src/config/database');

async function checkAllPosts() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Revisar todos los posts ordenados por fecha
    console.log('Revisando todos los posts disponibles...');
    const [posts] = await connection.query(`
      SELECT ID_publicaciones, Titulo, 
             LENGTH(Contenido) as contenido_length,
             Contenido,
             Estado, Fecha_creacion
      FROM Publicaciones 
      ORDER BY Fecha_creacion DESC
    `);
    
    console.log(`\n=== ENCONTRADOS ${posts.length} POSTS ===\n`);
    
    for (const post of posts) {
      console.log(`POST ID: ${post.ID_publicaciones}`);
      console.log(`TÍTULO: ${post.Titulo}`);
      console.log(`ESTADO: ${post.Estado}`);
      console.log(`LONGITUD CONTENIDO: ${post.contenido_length} caracteres`);
      console.log(`FECHA: ${post.Fecha_creacion}`);
      
      // Análisis de imágenes si hay contenido
      if (post.Contenido) {
        const hasImages = post.Contenido.includes('<img');
        const hasBase64Images = post.Contenido.includes('src="data:image');
        const imgMatches = post.Contenido.match(/<img[^>]*>/g);
        const numImages = imgMatches ? imgMatches.length : 0;
        
        console.log(`CONTIENE IMÁGENES: ${hasImages}`);
        console.log(`IMÁGENES BASE64: ${hasBase64Images}`);
        console.log(`NÚMERO DE IMÁGENES: ${numImages}`);
        
        // Si es el post "Prueba imagenes", mostrar más detalles
        if (post.Titulo.toLowerCase().includes('prueba') && post.Titulo.toLowerCase().includes('imagen')) {
          console.log('\n🔍 ANÁLISIS DETALLADO DEL POST "Prueba imagenes":');
          console.log('Contenido completo:');
          console.log(post.Contenido);
          
          if (imgMatches && imgMatches.length > 0) {
            console.log('\n📸 IMÁGENES ENCONTRADAS:');
            imgMatches.forEach((img, index) => {
              console.log(`\nImagen ${index + 1}:`);
              // Mostrar solo los primeros 100 caracteres de cada imagen
              console.log(img.substring(0, 100) + (img.length > 100 ? '...' : ''));
              
              // Verificar si la imagen tiene src válida
              const srcMatch = img.match(/src="([^"]*)"/);
              if (srcMatch) {
                const src = srcMatch[1];
                console.log(`SRC: ${src.substring(0, 50)}${src.length > 50 ? '...' : ''}`);
                console.log(`ES BASE64: ${src.startsWith('data:image')}`);
                console.log(`LONGITUD SRC: ${src.length} caracteres`);
              }
            });
          }
        }
      } else {
        console.log('SIN CONTENIDO');
      }
      
      console.log('-'.repeat(50));
    }
    
  } catch (error) {
    console.error('Error al revisar los posts:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

checkAllPosts()
  .then(() => {
    console.log('Análisis completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  }); 