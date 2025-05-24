const { pool } = require('./src/config/database');

// Imágenes base64 predefinidas para reemplazar URLs problemáticas
const REPLACEMENT_IMAGES = {
  // Imagen de ejemplo genérica (rectángulo azul con texto)
  default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzQ5OGRiIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gZGUgRWplbXBsbzwvdGV4dD4KICA8dGV4dCB4PSI1MCUiIHk9IjcwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjgwMCB4IDQwMDwvdGV4dD4KPC9zdmc+',
  
  // Imagen educativa (libro abierto)
  education: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjBmOGZmO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlMGY3ZmE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQwMCwyMDApIj4KICAgIDxyZWN0IHg9Ii0xMDAiIHk9Ii02MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiMyZDNhOGMiIHJ4PSI1Ii8+CiAgICA8cmVjdCB4PSItOTUiIHk9Ii01NSIgd2lkdGg9IjE5MCIgaGVpZ2h0PSIxMTAiIGZpbGw9IndoaXRlIiByeD0iMyIvPgogICAgPGxpbmUgeDE9IjAiIHkxPSItNTUiIHgyPSIwIiB5Mj0iNTUiIHN0cm9rZT0iI2RkZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8IS0tIExpbmVhcyBkZSB0ZXh0byAtLT4KICAgIDxsaW5lIHgxPSItODAiIHkxPSItMzAiIHgyPSItMTAiIHkyPSItMzAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8bGluZSB4MT0iLTgwIiB5MT0iLTEwIiB4Mj0iLTIwIiB5Mj0iLTEwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgPGxpbmUgeDE9Ii04MCIgeTE9IjEwIiB4Mj0iLTE1IiB5Mj0iMTAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8bGluZSB4MT0iMTAiIHkxPSItMzAiIHgyPSI4MCIgeTI9Ii0zMCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxsaW5lIHgxPSIxMCIgeTE9Ii0xMCIgeDI9IjcwIiB5Mj0iLTEwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgPGxpbmUgeDE9IjEwIiB5MT0iMTAiIHgyPSI3NSIgeTI9IjEwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIvPgogIDwvZz4KICA8dGV4dCB4PSI1MCUiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjMmQzYThjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Db250ZW5pZG8gRWR1Y2F0aXZvPC90ZXh0Pgo8L3N2Zz4=',
  
  // Imagen de tecnología
  tech: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0idGVjaEJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzBmMTQxOTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMWUyOTNiO3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN0ZWNoQmcpIi8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAwLDIwMCkiPgogICAgPCEtLSBNb25pdG9yIC0tPgogICAgPHJlY3QgeD0iLTEyMCIgeT0iLTgwIiB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iIzM0OThhYiIgc3Ryb2tlPSIjMmQ3OWE0IiBzdHJva2Utd2lkdGg9IjMiIHJ4PSI4Ii8+CiAgICA8cmVjdCB4PSItMTEwIiB5PSItNzAiIHdpZHRoPSIyMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMGYxNDE5Ii8+CiAgICA8IS0tIFBhbnRhbGxhIC0tPgogICAgPHJlY3QgeD0iLTEwMCIgeT0iLTYwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFmMjkzNyIvPgogICAgPCEtLSBDb2RlIGxpbmVzIC0tPgogICAgPHRleHQgeD0iLTkwIiB5PSItMzUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2NGZmZGEiPiZsdDtodG1sJmd0OzwvdGV4dD4KICAgIDx0ZXh0IHg9Ii05MCIgeT0iLTE1IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZmY3MDk5Ij4gICZsdDtoMSZndDtFZHVjYWNpw7NuJmx0Oy9oMSZndDs8L3RleHQ+CiAgICA8dGV4dCB4PSItOTAiIHk9IjUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2NGZmZGEiPiZsdDsvcHAmZ3Q7PC90ZXh0PgogICAgPHRleHQgeD0iLTkwIiB5PSIyNSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY0ZmZkYSI+Jmx0Oy9odG1sJmd0OzwvdGV4dD4KICAgIDwhLS0gQmFzZSAtLT4KICAgIDxyZWN0IHg9Ii0zMCIgeT0iNjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzM0OThhYiIgcng9IjMiLz4KICA8L2c+CiAgPHRleHQgeD0iNTAlIiB5PSIzNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY0ZmZkYSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29udGVuaWRvIERpZ2l0YWw8L3RleHQ+Cjwvc3ZnPg=='
};

// Función para convertir URLs de imágenes problemáticas a base64 en el contenido HTML
const convertExternalImagesToBase64 = async (htmlContent) => {
  console.log('Procesando contenido HTML...');
  
  // Buscar todas las etiquetas <img> con src de URL externa
  const imgRegex = /<img([^>]*)\ssrc="(https?:\/\/[^"]*)"([^>]*)>/gi;
  const matches = [];
  let match;
  
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    matches.push({
      fullMatch: match[0],
      beforeSrc: match[1],
      url: match[2],
      afterSrc: match[3]
    });
  }
  
  if (matches.length === 0) {
    console.log('No se encontraron imágenes con URLs externas');
    return htmlContent;
  }
  
  console.log(`Encontradas ${matches.length} imagen(es) con URLs externas`);
  
  let processedContent = htmlContent;
  let convertedCount = 0;
  
  for (const imageMatch of matches) {
    try {
      console.log(`Reemplazando: ${imageMatch.url}`);
      
      // Seleccionar una imagen de reemplazo apropiada
      let replacementImage = REPLACEMENT_IMAGES.default;
      
      if (imageMatch.url.includes('placeholder')) {
        replacementImage = REPLACEMENT_IMAGES.default;
      } else if (imageMatch.url.includes('education') || imageMatch.url.includes('libro') || imageMatch.url.includes('curso')) {
        replacementImage = REPLACEMENT_IMAGES.education;
      } else if (imageMatch.url.includes('tech') || imageMatch.url.includes('codigo') || imageMatch.url.includes('programming')) {
        replacementImage = REPLACEMENT_IMAGES.tech;
      }
      
      // Crear la nueva etiqueta img con base64 de reemplazo
      const newImgTag = `<img${imageMatch.beforeSrc} src="${replacementImage}"${imageMatch.afterSrc}>`;
      
      // Reemplazar en el contenido
      processedContent = processedContent.replace(imageMatch.fullMatch, newImgTag);
      
      console.log(`✅ Reemplazada con imagen educativa: ${imageMatch.url.substring(0, 60)}...`);
      convertedCount++;
      
    } catch (error) {
      console.log(`❌ Error al reemplazar ${imageMatch.url}: ${error.message}`);
      // Mantener la URL original si no se puede convertir
    }
  }
  
  console.log(`Total reemplazadas: ${convertedCount}/${matches.length}`);
  return processedContent;
};

async function fixExternalImagePosts() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Buscar posts que tengan URLs externas en su contenido
    console.log('🔍 Buscando posts con URLs externas de imágenes...');
    const [posts] = await connection.query(`
      SELECT ID_publicaciones, Titulo, Contenido, 
             LENGTH(Contenido) as contenido_length
      FROM Publicaciones 
      WHERE Contenido LIKE '%<img%src="http%'
      ORDER BY Fecha_creacion DESC
    `);
    
    if (posts.length === 0) {
      console.log('✅ No se encontraron posts con URLs externas de imágenes');
      return;
    }
    
    console.log(`📋 Encontrados ${posts.length} post(s) con URLs externas`);
    
    for (const post of posts) {
      console.log('\n' + '='.repeat(60));
      console.log(`📝 Procesando POST ID: ${post.ID_publicaciones}`);
      console.log(`📑 Título: ${post.Titulo}`);
      console.log(`📏 Contenido original: ${post.contenido_length} caracteres`);
      
      try {
        // Convertir URLs externas a base64
        const newContent = await convertExternalImagesToBase64(post.Contenido);
        
        if (newContent !== post.Contenido) {
          console.log(`💾 Actualizando contenido del post...`);
          
          // Actualizar el post en la base de datos
          await connection.query(
            'UPDATE Publicaciones SET Contenido = ? WHERE ID_publicaciones = ?',
            [newContent, post.ID_publicaciones]
          );
          
          console.log(`✅ Post ${post.ID_publicaciones} actualizado exitosamente`);
          console.log(`📏 Nuevo tamaño: ${newContent.length} caracteres`);
          
        } else {
          console.log(`ℹ️ No se realizaron cambios en el post ${post.ID_publicaciones}`);
        }
        
      } catch (error) {
        console.error(`❌ Error al procesar post ${post.ID_publicaciones}:`, error);
      }
    }
    
  } catch (error) {
    console.error('💥 Error en el script:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\n🔌 Conexión cerrada');
    }
    pool.end();
  }
}

// Ejecutar el script
fixExternalImagePosts()
  .then(() => {
    console.log('\n🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
 