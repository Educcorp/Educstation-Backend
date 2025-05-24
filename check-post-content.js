const { pool } = require('./src/config/database');

async function checkPostContent() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Revisar el post con ID 74 que está causando problemas
    console.log('Revisando contenido del post ID 74...');
    const [posts] = await connection.query(`
      SELECT ID_publicaciones, Titulo, 
             LENGTH(Contenido) as contenido_length,
             LEFT(Contenido, 200) as contenido_preview,
             Imagen_portada IS NOT NULL as tiene_imagen_portada,
             LENGTH(Imagen_portada) as imagen_portada_length
      FROM Publicaciones 
      WHERE ID_publicaciones = 74
    `);
    
    if (posts.length > 0) {
      const post = posts[0];
      console.log('\n=== INFORMACIÓN DEL POST ===');
      console.log(`ID: ${post.ID_publicaciones}`);
      console.log(`Título: ${post.Titulo}`);
      console.log(`Longitud del contenido: ${post.contenido_length} caracteres`);
      console.log(`Tiene imagen de portada: ${post.tiene_imagen_portada}`);
      console.log(`Longitud imagen portada: ${post.imagen_portada_length || 0} caracteres`);
      console.log('\n=== PREVIEW DEL CONTENIDO ===');
      console.log(post.contenido_preview);
      
      // Verificar si el contenido contiene imágenes HTML
      const [fullContent] = await connection.query(`
        SELECT Contenido FROM Publicaciones WHERE ID_publicaciones = 74
      `);
      
      if (fullContent.length > 0) {
        const content = fullContent[0].Contenido;
        const hasImages = content.includes('<img');
        const hasBase64Images = content.includes('src="data:image');
        
        console.log('\n=== ANÁLISIS DE IMÁGENES ===');
        console.log(`Contiene etiquetas <img>: ${hasImages}`);
        console.log(`Contiene imágenes base64: ${hasBase64Images}`);
        
        if (hasImages) {
          // Contar las imágenes
          const imgMatches = content.match(/<img[^>]*>/g);
          console.log(`Número de imágenes encontradas: ${imgMatches ? imgMatches.length : 0}`);
          
          if (imgMatches && imgMatches.length > 0) {
            console.log('\n=== PRIMERA IMAGEN ENCONTRADA ===');
            console.log(imgMatches[0].substring(0, 100) + '...');
          }
        }
      }
    } else {
      console.log('No se encontró el post con ID 74');
    }
    
    // También revisar posts recientes con imágenes
    console.log('\n=== POSTS RECIENTES CON IMÁGENES ===');
    const [recentPosts] = await connection.query(`
      SELECT ID_publicaciones, Titulo, 
             LENGTH(Contenido) as contenido_length,
             Fecha_creacion
      FROM Publicaciones 
      WHERE Contenido LIKE '%<img%' 
      ORDER BY Fecha_creacion DESC 
      LIMIT 5
    `);
    
    console.log(`Encontrados ${recentPosts.length} posts con imágenes:`);
    recentPosts.forEach(post => {
      console.log(`- ID ${post.ID_publicaciones}: ${post.Titulo} (${post.contenido_length} chars) - ${post.Fecha_creacion}`);
    });
    
  } catch (error) {
    console.error('Error al revisar el contenido:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

checkPostContent()
  .then(() => {
    console.log('Revisión completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  }); 