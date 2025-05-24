const { pool } = require('./src/config/database');

async function debugDatabase() {
  try {
    console.log('🔍 Debuggeando la base de datos...\n');
    
    // 1. Verificar conexión
    console.log('1. Verificando conexión...');
    const [connectionTest] = await pool.execute('SELECT 1 as test');
    console.log('✅ Conexión exitosa\n');
    
    // 2. Verificar tabla Publicaciones
    console.log('2. Verificando tabla Publicaciones...');
    const [publicaciones] = await pool.execute('SELECT * FROM Publicaciones ORDER BY Fecha_creacion DESC LIMIT 5');
    console.log(`   Total de publicaciones: ${publicaciones.length}`);
    
    if (publicaciones.length > 0) {
      console.log('   Primeras 3 publicaciones:');
      publicaciones.slice(0, 3).forEach((pub, index) => {
        console.log(`   ${index + 1}. ID: ${pub.ID_publicaciones}, Título: ${pub.Titulo}, Estado: ${pub.Estado}, Admin ID: ${pub.ID_administrador}`);
      });
    }
    console.log('');
    
    // 3. Verificar tabla Administrador
    console.log('3. Verificando tabla Administrador...');
    const [administradores] = await pool.execute('SELECT * FROM Administrador LIMIT 3');
    console.log(`   Total de administradores: ${administradores.length}`);
    
    if (administradores.length > 0) {
      console.log('   Administradores:');
      administradores.forEach((admin, index) => {
        console.log(`   ${index + 1}. ID: ${admin.ID_administrador}, Nombre: ${admin.Nombre}, Email: ${admin.Correo_electronico}`);
      });
    }
    console.log('');
    
    // 4. Probar consulta con LEFT JOIN
    console.log('4. Probando consulta con LEFT JOIN...');
    const [joinResult] = await pool.execute(`
      SELECT p.*, a.Nombre as NombreAdmin 
      FROM Publicaciones p
      LEFT JOIN Administrador a ON p.ID_administrador = a.ID_administrador
      ORDER BY p.Fecha_creacion DESC 
      LIMIT 3
    `);
    
    console.log(`   Resultados del LEFT JOIN: ${joinResult.length}`);
    if (joinResult.length > 0) {
      joinResult.forEach((result, index) => {
        console.log(`   ${index + 1}. ID: ${result.ID_publicaciones}, Título: ${result.Titulo}, Admin: ${result.NombreAdmin || 'Sin asignar'}`);
      });
    }
    console.log('');
    
    // 5. Verificar estados de publicaciones
    console.log('5. Verificando estados de publicaciones...');
    const [estados] = await pool.execute(`
      SELECT Estado, COUNT(*) as cantidad 
      FROM Publicaciones 
      GROUP BY Estado
    `);
    
    estados.forEach(estado => {
      console.log(`   ${estado.Estado}: ${estado.cantidad} publicaciones`);
    });
    console.log('');
    
    // 6. Probar la función del modelo directamente
    console.log('6. Probando función getLatest del modelo...');
    const Publicacion = require('./src/models/publicacionesModel');
    const latestPosts = await Publicacion.getLatest(5);
    console.log(`   Publicaciones obtenidas por getLatest: ${latestPosts.length}`);
    
    if (latestPosts.length > 0) {
      latestPosts.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.Titulo} (${post.Estado})`);
      });
    }
    
    console.log('\n✅ Debug completado');
    
  } catch (error) {
    console.error('❌ Error durante el debug:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar el debug
debugDatabase(); 