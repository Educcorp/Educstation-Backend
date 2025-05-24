const { pool } = require('./src/config/database');

(async () => {
  const connection = await pool.getConnection();
  try {
    // Buscar posts que puedan ser el "Prueba imagenes" que mencionas
    const [allPosts] = await connection.query(`
      SELECT ID_publicaciones, Titulo, 
             LENGTH(Contenido) as len, 
             Contenido,
             Fecha_creacion 
      FROM Publicaciones 
      ORDER BY Fecha_creacion DESC
    `);
    
    console.log('TODOS LOS POSTS EN LA BASE DE DATOS:');
    console.log('=====================================');
    
    for (const post of allPosts) {
      console.log(`\nID: ${post.ID_publicaciones}`);
      console.log(`Título: ${post.Titulo}`);
      console.log(`Contenido: ${post.len} caracteres`);
      console.log(`Fecha: ${post.Fecha_creacion}`);
      
      // Contar imágenes si hay contenido
      if (post.Contenido) {
        const imgCount = (post.Contenido.match(/<img/g) || []).length;
        const hasBase64 = post.Contenido.includes('data:image');
        console.log(`Número de imágenes: ${imgCount}`);
        console.log(`Tiene base64: ${hasBase64}`);
        
        // Si tiene el título que parece ser el problema
        if (post.Titulo.toLowerCase().includes('prueba') && 
            post.Titulo.toLowerCase().includes('imagen')) {
          console.log('\n🔍 ESTE PARECE SER TU POST:');
          console.log('Contenido completo:');
          console.log(post.Contenido);
        }
      }
      
      console.log('-'.repeat(40));
    }
    
  } finally {
    connection.release();
    pool.end();
  }
})(); 