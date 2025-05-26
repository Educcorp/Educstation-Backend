const { pool } = require('./src/config/database');

async function testLikesSystem() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // 1. Verificar que la columna contador_likes existe
    console.log('\n1. Verificando estructura de la tabla...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM Publicaciones WHERE Field = 'contador_likes'
    `);
    
    if (columns.length === 0) {
      console.log('❌ La columna contador_likes NO existe en la tabla');
      return;
    }
    
    console.log('✅ La columna contador_likes existe:', columns[0]);
    
    // 2. Buscar publicaciones existentes
    console.log('\n2. Buscando publicaciones para probar...');
    const [publicaciones] = await connection.query(`
      SELECT ID_publicaciones, Titulo, contador_likes 
      FROM Publicaciones 
      ORDER BY ID_publicaciones DESC 
      LIMIT 5
    `);
    
    if (publicaciones.length === 0) {
      console.log('❌ No hay publicaciones en la base de datos para probar');
      return;
    }
    
    console.log(`✅ Encontradas ${publicaciones.length} publicaciones:`);
    publicaciones.forEach(pub => {
      console.log(`  - ID ${pub.ID_publicaciones}: "${pub.Titulo}" (Likes: ${pub.contador_likes || 0})`);
    });
    
    // 3. Probar incrementar likes en la primera publicación
    const testPost = publicaciones[0];
    console.log(`\n3. Probando incrementar likes en post ID ${testPost.ID_publicaciones}...`);
    
    const likesAntes = testPost.contador_likes || 0;
    console.log(`Likes antes: ${likesAntes}`);
    
    // Incrementar likes
    const [updateResult] = await connection.query(`
      UPDATE Publicaciones 
      SET contador_likes = IFNULL(contador_likes, 0) + 1 
      WHERE ID_publicaciones = ?
    `, [testPost.ID_publicaciones]);
    
    console.log('Resultado del UPDATE:', updateResult);
    
    // Verificar el nuevo valor
    const [result] = await connection.query(`
      SELECT contador_likes 
      FROM Publicaciones 
      WHERE ID_publicaciones = ?
    `, [testPost.ID_publicaciones]);
    
    const likesDespues = result[0]?.contador_likes || 0;
    console.log(`Likes después: ${likesDespues}`);
    
    if (likesDespues === likesAntes + 1) {
      console.log('✅ ¡Sistema de likes funcionando correctamente!');
    } else {
      console.log('❌ Error: El contador de likes no se incrementó correctamente');
    }
    
    // 4. Probar consulta que incluya contador_likes (simulando endpoint GET)
    console.log('\n4. Probando consulta GET típica...');
    const [getResult] = await connection.query(`
      SELECT p.*, a.Nombre as NombreAdmin 
      FROM Publicaciones p
      LEFT JOIN Administrador a ON p.ID_administrador = a.ID_administrador
      WHERE p.ID_publicaciones = ?
    `, [testPost.ID_publicaciones]);
    
    if (getResult.length > 0) {
      const post = getResult[0];
      console.log('✅ Consulta GET exitosa:');
      console.log(`  - Título: ${post.Titulo}`);
      console.log(`  - Autor: ${post.NombreAdmin || 'Sin nombre'}`);
      console.log(`  - Likes: ${post.contador_likes}`);
      console.log(`  - Estado: ${post.Estado}`);
    } else {
      console.log('❌ Error: No se pudo recuperar el post');
    }
    
    console.log('\n🎉 ¡Prueba completada!');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\n🔒 Conexión cerrada');
    }
    pool.end();
  }
}

testLikesSystem()
  .then(() => {
    console.log('\n✅ Script de prueba completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el script:', error);
    process.exit(1);
  }); 