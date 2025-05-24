const { pool } = require('./src/config/database');

async function findProblematicPost() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Buscar el post exacto por título
    console.log('Buscando el post "Prueba imagenes"...');
    const [posts] = await connection.query(`
      SELECT * FROM Publicaciones 
      WHERE Titulo LIKE '%Prueba%' AND Titulo LIKE '%imagen%'
      ORDER BY Fecha_creacion DESC
    `);
    
    if (posts.length === 0) {
      console.log('❌ No se encontró ningún post con título "Prueba imagenes"');
      
      // Buscar posts que puedan haber sido creados recientemente
      const [recentPosts] = await connection.query(`
        SELECT ID_publicaciones, Titulo, Estado, Fecha_creacion,
               LENGTH(Contenido) as contenido_length
        FROM Publicaciones 
        ORDER BY Fecha_creacion DESC 
        LIMIT 10
      `);
      
      console.log('\n📅 POSTS MÁS RECIENTES:');
      recentPosts.forEach(post => {
        console.log(`ID: ${post.ID_publicaciones} | ${post.Titulo} | ${post.Estado} | ${post.Fecha_creacion}`);
      });
      
      return;
    }
    
    console.log(`✅ Encontrados ${posts.length} post(s) con título similar:`);
    
    for (const post of posts) {
      console.log('\n' + '='.repeat(60));
      console.log(`🔍 ANALIZANDO POST ID: ${post.ID_publicaciones}`);
      console.log(`📝 TÍTULO: ${post.Titulo}`);
      console.log(`📅 FECHA: ${post.Fecha_creacion}`);
      console.log(`📊 ESTADO: ${post.Estado}`);
      console.log(`📏 LONGITUD CONTENIDO: ${post.Contenido ? post.Contenido.length : 0} caracteres`);
      
      if (!post.Contenido) {
        console.log('❌ PROBLEMA: El post NO tiene contenido guardado');
        continue;
      }
      
      console.log('\n📋 CONTENIDO COMPLETO:');
      console.log(post.Contenido);
      
      // Análisis detallado de imágenes
      const imgMatches = post.Contenido.match(/<img[^>]*>/g);
      const numImages = imgMatches ? imgMatches.length : 0;
      
      console.log(`\n🖼️ ANÁLISIS DE IMÁGENES:`);
      console.log(`   Número de imágenes encontradas: ${numImages}`);
      
      if (imgMatches && imgMatches.length > 0) {
        console.log('\n📸 DETALLES DE CADA IMAGEN:');
        imgMatches.forEach((img, index) => {
          console.log(`\n   Imagen ${index + 1}:`);
          console.log(`   HTML: ${img}`);
          
          // Extraer SRC
          const srcMatch = img.match(/src="([^"]*)"/);
          if (srcMatch) {
            const src = srcMatch[1];
            console.log(`   SRC: ${src}`);
            console.log(`   Tipo: ${src.startsWith('data:image') ? 'Base64' : src.startsWith('http') ? 'URL Externa' : 'Relativa'}`);
            console.log(`   Longitud SRC: ${src.length} caracteres`);
            
            // Diagnóstico específico para URLs externas
            if (src.startsWith('http')) {
              console.log(`   ⚠️ PROBLEMA POTENCIAL: URL externa puede estar bloqueada por CORS o política de contenido`);
              console.log(`   💡 RECOMENDACIÓN: Convertir a imagen base64 o usar imagen local`);
            }
            
            // Verificar si es una imagen base64 válida
            if (src.startsWith('data:image')) {
              const isValidBase64 = src.includes('base64,') && src.split('base64,')[1].length > 0;
              console.log(`   ✅ Base64 válida: ${isValidBase64}`);
            }
          } else {
            console.log(`   ❌ PROBLEMA: No se encontró atributo SRC en la imagen`);
          }
          
          // Verificar otros atributos
          const altMatch = img.match(/alt="([^"]*)"/);
          const styleMatch = img.match(/style="([^"]*)"/);
          
          if (altMatch) {
            console.log(`   ALT: ${altMatch[1]}`);
          }
          if (styleMatch) {
            console.log(`   STYLE: ${styleMatch[1]}`);
          }
        });
      } else {
        console.log('   ❌ PROBLEMA: No se encontraron etiquetas <img> en el contenido');
        
        // Verificar si hay texto que sugiera que debería haber imágenes
        if (post.Contenido.toLowerCase().includes('imagen') || 
            post.Contenido.toLowerCase().includes('photo') ||
            post.Contenido.includes('picture')) {
          console.log('   ⚠️ El contenido menciona imágenes pero no contiene etiquetas <img>');
        }
      }
      
      // Verificar imagen de portada
      if (post.Imagen_portada) {
        console.log(`\n🖼️ IMAGEN DE PORTADA:`);
        console.log(`   Tipo: ${Buffer.isBuffer(post.Imagen_portada) ? 'Buffer' : 'String'}`);
        console.log(`   Longitud: ${post.Imagen_portada.length} bytes`);
        
        if (Buffer.isBuffer(post.Imagen_portada)) {
          const imageString = post.Imagen_portada.toString();
          console.log(`   Es Base64: ${imageString.startsWith('data:image')}`);
          if (imageString.startsWith('data:image')) {
            console.log(`   Preview: ${imageString.substring(0, 50)}...`);
          }
        }
      } else {
        console.log('\n📷 IMAGEN DE PORTADA: No tiene');
      }
      
      console.log('\n🔧 RECOMENDACIONES:');
      if (numImages === 0) {
        console.log('   1. El post no tiene imágenes en el contenido HTML');
        console.log('   2. Verificar que las imágenes se insertaron correctamente en el editor');
        console.log('   3. Revisar que el endpoint de creación guardó el contenido HTML completo');
      } else {
        imgMatches.forEach((img, index) => {
          const srcMatch = img.match(/src="([^"]*)"/);
          if (srcMatch && srcMatch[1].startsWith('http')) {
            console.log(`   ${index + 1}. Imagen ${index + 1}: Reemplazar URL externa por imagen base64 o local`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error al buscar el post:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

findProblematicPost()
  .then(() => {
    console.log('\nAnálisis completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  }); 