const { pool } = require('./src/config/database');

async function testAdminPosts() {
  try {
    console.log('🔍 Verificando publicaciones en la base de datos...\n');
    
    // Verificar conexión a la base de datos
    const [connectionTest] = await pool.execute('SELECT 1 as test');
    console.log('✅ Conexión a la base de datos exitosa');
    
    // Contar total de publicaciones
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM Publicaciones');
    const totalPosts = countResult[0].total;
    console.log(`📊 Total de publicaciones en la base de datos: ${totalPosts}`);
    
    if (totalPosts === 0) {
      console.log('⚠️  No hay publicaciones en la base de datos');
      console.log('💡 Creando una publicación de prueba...\n');
      
      // Verificar si existe un administrador
      const [adminResult] = await pool.execute('SELECT * FROM Administrador LIMIT 1');
      let adminId;
      
      if (adminResult.length === 0) {
        console.log('👤 No hay administradores, creando uno...');
        const [insertAdmin] = await pool.execute(
          'INSERT INTO Administrador (Nombre, Correo_electronico, Contraseña) VALUES (?, ?, ?)',
          ['Admin Test', 'admin@test.com', 'password123']
        );
        adminId = insertAdmin.insertId;
        console.log(`✅ Administrador creado con ID: ${adminId}`);
      } else {
        adminId = adminResult[0].ID_administrador;
        console.log(`✅ Usando administrador existente con ID: ${adminId}`);
      }
      
      // Crear publicación de prueba
      const [insertPost] = await pool.execute(
        `INSERT INTO Publicaciones (Titulo, Contenido, Resumen, Estado, ID_administrador, Fecha_creacion, Fecha_modificacion) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          'Publicación de Prueba',
          '<p>Este es el contenido de una publicación de prueba para verificar que el panel de administrador funciona correctamente.</p>',
          'Esta es una publicación de prueba creada automáticamente.',
          'publicado',
          adminId
        ]
      );
      
      console.log(`✅ Publicación de prueba creada con ID: ${insertPost.insertId}\n`);
    }
    
    // Mostrar las últimas 5 publicaciones
    const [posts] = await pool.execute(
      `SELECT p.ID_publicaciones, p.Titulo, p.Estado, p.Fecha_creacion, a.Nombre as NombreAdmin
       FROM Publicaciones p
       LEFT JOIN Administrador a ON p.ID_administrador = a.ID_administrador
       ORDER BY p.Fecha_creacion DESC
       LIMIT 5`
    );
    
    console.log('📝 Últimas 5 publicaciones:');
    console.log('─'.repeat(80));
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ID: ${post.ID_publicaciones}`);
      console.log(`   Título: ${post.Titulo}`);
      console.log(`   Estado: ${post.Estado}`);
      console.log(`   Admin: ${post.NombreAdmin || 'Sin asignar'}`);
      console.log(`   Fecha: ${post.Fecha_creacion}`);
      console.log('');
    });
    
    // Verificar estados de publicaciones
    const [estadosResult] = await pool.execute(
      `SELECT Estado, COUNT(*) as cantidad 
       FROM Publicaciones 
       GROUP BY Estado`
    );
    
    console.log('📈 Distribución por estados:');
    console.log('─'.repeat(30));
    estadosResult.forEach(estado => {
      console.log(`${estado.Estado}: ${estado.cantidad} publicaciones`);
    });
    
    console.log('\n✅ Verificación completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar el test
testAdminPosts(); 