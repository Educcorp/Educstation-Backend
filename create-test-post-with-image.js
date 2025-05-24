const { pool } = require('./src/config/database');

async function createTestPostWithImages() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Imagen base64 de ejemplo (pequeña imagen de 1x1 pixel roja)
    const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8ABgAC/wGrqwAAAABJRU5ErkJggg==';
    
    // Contenido HTML con imagen base64 como lo generaría SimpleEditor
    const htmlContent = `<p>Este es un post de prueba creado con el SimpleEditor que contiene una imagen insertada:</p>
<p><img src="${sampleBase64Image}" alt="Imagen de prueba" style="max-width: 100%; height: auto;" /></p>
<p>El contenido arriba debería mostrar una pequeña imagen roja. Si ves la imagen, entonces el sistema está funcionando correctamente.</p>
<p>También vamos a incluir otra imagen para probar múltiples imágenes:</p>
<p><img src="${sampleBase64Image}" alt="Segunda imagen de prueba" style="max-width: 100%; height: auto; border: 2px solid blue;" /></p>
<p>¡Ambas imágenes deberían renderizarse en el post publicado!</p>`;

    // Imagen de portada base64 diferente (imagen verde de 1x1)
    const coverImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    console.log('Creando post de prueba con imágenes base64...');
    console.log(`Longitud del contenido HTML: ${htmlContent.length} caracteres`);
    console.log(`El contenido contiene ${(htmlContent.match(/<img/g) || []).length} imágenes`);
    
    // Insertar el post usando el endpoint createPublicacionFromHTML
    const postData = {
      titulo: 'Post de Prueba - SimpleEditor con Imágenes Base64',
      contenido: htmlContent,
      resumen: 'Un post de prueba que contiene múltiples imágenes base64 insertadas usando el SimpleEditor.',
      estado: 'publicado',
      Imagen_portada: coverImage,
      // Usar categoría ID 1 que debería existir
      categorias: [1]
    };
    
    const [result] = await connection.query(`
      INSERT INTO Publicaciones (
        Titulo, Contenido, Resumen, Estado, Imagen_portada, Fecha_creacion, ID_administrador
      ) VALUES (?, ?, ?, ?, ?, NOW(), 1)
    `, [
      postData.titulo,
      postData.contenido,
      postData.resumen,
      postData.estado,
      postData.Imagen_portada
    ]);
    
    const postId = result.insertId;
    console.log(`Post creado con ID: ${postId}`);
    
    // Asociar con categoría
    if (postData.categorias && postData.categorias.length > 0) {
      await connection.query(`
        INSERT INTO Publicaciones_Categorias (ID_publicaciones, ID_categoria)
        VALUES (?, ?)
      `, [postId, postData.categorias[0]]);
      console.log(`Post asociado con categoría ID: ${postData.categorias[0]}`);
    }
    
    // Verificar el post creado
    const [createdPost] = await connection.query(`
      SELECT ID_publicaciones, Titulo, LENGTH(Contenido) as contenido_length,
             Imagen_portada IS NOT NULL as tiene_imagen_portada,
             Estado, Fecha_creacion
      FROM Publicaciones 
      WHERE ID_publicaciones = ?
    `, [postId]);
    
    if (createdPost.length > 0) {
      const post = createdPost[0];
      console.log('\n=== POST CREADO EXITOSAMENTE ===');
      console.log(`ID: ${post.ID_publicaciones}`);
      console.log(`Título: ${post.Titulo}`);
      console.log(`Longitud del contenido: ${post.contenido_length} caracteres`);
      console.log(`Tiene imagen de portada: ${post.tiene_imagen_portada}`);
      console.log(`Estado: ${post.Estado}`);
      console.log(`Fecha de creación: ${post.Fecha_creacion}`);
      console.log(`\nPuedes acceder al post en: http://localhost:3000/blog/${post.ID_publicaciones}`);
    }
    
  } catch (error) {
    console.error('Error al crear el post de prueba:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

createTestPostWithImages()
  .then(() => {
    console.log('Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  }); 