const { pool } = require('./src/config/database');

async function testPostDisplay() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Obtener el post específico con imágenes
    const [posts] = await connection.query(`
      SELECT ID_publicaciones, Titulo, Contenido, Imagen_portada,
             LENGTH(Contenido) as contenido_length
      FROM Publicaciones 
      WHERE ID_publicaciones = 4
    `);
    
    if (posts.length === 0) {
      console.log('❌ No se encontró el post ID 4');
      return;
    }
    
    const post = posts[0];
    console.log('\n📋 INFORMACIÓN DEL POST:');
    console.log(`ID: ${post.ID_publicaciones}`);
    console.log(`Título: ${post.Titulo}`);
    console.log(`Longitud Contenido: ${post.contenido_length} caracteres`);
    
    console.log('\n🔍 CONTENIDO HTML COMPLETO:');
    console.log(post.Contenido);
    
    // Análisis de imágenes
    const imgMatches = post.Contenido.match(/<img[^>]*>/g);
    console.log(`\n📸 NÚMERO DE IMÁGENES ENCONTRADAS: ${imgMatches ? imgMatches.length : 0}`);
    
    if (imgMatches && imgMatches.length > 0) {
      imgMatches.forEach((img, index) => {
        console.log(`\n   Imagen ${index + 1}:`);
        console.log(`   HTML completo: ${img}`);
        
        // Extraer SRC
        const srcMatch = img.match(/src="([^"]*)"/);
        if (srcMatch) {
          const src = srcMatch[1];
          console.log(`   SRC length: ${src.length} caracteres`);
          console.log(`   Es Base64: ${src.startsWith('data:image')}`);
          console.log(`   Primeros 100 chars: ${src.substring(0, 100)}...`);
          
          // Verificar la validez del Base64
          if (src.startsWith('data:image')) {
            const base64Part = src.split('base64,')[1];
            if (base64Part && base64Part.length > 0) {
              console.log(`   ✅ Base64 válido con ${base64Part.length} caracteres de datos`);
            } else {
              console.log(`   ❌ Base64 inválido`);
            }
          }
        }
      });
    }
    
    console.log('\n🎯 SIMULACIÓN DE CÓMO SE RENDERIZARÍA EN EL FRONTEND:');
    console.log('El contenido se insertaría en un iframe con este HTML:');
    console.log('=====================================');
    console.log(`<!DOCTYPE html>
<html>
<body>
  <div class="post-container">
    ${post.Contenido}
  </div>
</body>
</html>`);
    console.log('=====================================');
    
    console.log('\n💡 DIAGNÓSTICO:');
    if (imgMatches && imgMatches.length > 0) {
      const validImages = imgMatches.filter(img => {
        const srcMatch = img.match(/src="([^"]*)"/);
        return srcMatch && srcMatch[1].startsWith('data:image');
      });
      
      console.log(`✅ ${validImages.length} imágenes Base64 válidas`);
      console.log(`❌ ${imgMatches.length - validImages.length} imágenes con problemas`);
      
      if (validImages.length === imgMatches.length) {
        console.log('\n🎉 CONCLUSIÓN: Las imágenes DEBERÍAN mostrarse correctamente');
        console.log('Si no se ven, el problema puede estar en:');
        console.log('1. El navegador bloqueando contenido Base64 en iframes');
        console.log('2. Políticas de seguridad del iframe (sandbox)');
        console.log('3. CSS que oculta las imágenes');
        console.log('4. JavaScript que interfiere con la renderización');
      }
    } else {
      console.log('❌ No hay imágenes en el contenido');
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\n🔌 Conexión cerrada');
    }
    pool.end();
  }
}

testPostDisplay(); 