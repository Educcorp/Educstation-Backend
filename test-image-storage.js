const { pool } = require('./src/config/database');

async function testImageStorage() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // Buscar un administrador válido
    const [admins] = await connection.query(`
      SELECT ID_administrador FROM Administrador LIMIT 1
    `);
    
    if (admins.length === 0) {
      console.log('No se encontraron administradores. Creando uno nuevo...');
      const [newAdmin] = await connection.query(`
        INSERT INTO Administrador (Nombre, Correo, Contraseña, Rol)
        VALUES (?, ?, ?, ?)
      `, ['Admin Test', 'admin@test.com', 'password123', 'admin']);
      
      var adminId = newAdmin.insertId;
    } else {
      var adminId = admins[0].ID_administrador;
    }
    console.log(`Usando administrador con ID: ${adminId}`);
    
    // Base64 simple para una imagen de prueba pequeña
    const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    
    console.log('Creando publicación con imagen Base64 simple...');
    const [result] = await connection.query(`
      INSERT INTO Publicaciones 
      (Titulo, Contenido, Resumen, Imagen_portada, Estado, ID_administrador)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'Test de imagen Base64',
      'Este es un test para verificar el almacenamiento de imágenes en Base64',
      'Resumen del test',
      sampleBase64Image,
      'publicado',
      adminId
    ]);
    
    const postId = result.insertId;
    console.log(`Publicación creada con ID: ${postId}`);
    
    // Verificar que se guardó correctamente
    const [post] = await connection.query(`
      SELECT ID_publicaciones, Titulo, Imagen_portada
      FROM Publicaciones
      WHERE ID_publicaciones = ?
    `, [postId]);
    
    console.log('\nDetalles de la publicación creada:');
    console.log(`ID: ${post[0].ID_publicaciones}`);
    console.log(`Título: ${post[0].Titulo}`);
    console.log(`Imagen Base64: ${post[0].Imagen_portada ? 'PRESENTE (mostrando primeros 50 caracteres)' : 'NO PRESENTE'}`);
    
    if (post[0].Imagen_portada) {
      console.log(`Primeros 50 caracteres: ${post[0].Imagen_portada.substring(0, 50)}...`);
      console.log(`Longitud total: ${post[0].Imagen_portada.length} caracteres`);
      
      // Verificar si el formato Base64 está correcto
      if (post[0].Imagen_portada.startsWith('data:image')) {
        console.log('✅ El formato de la imagen Base64 parece correcto');
      } else {
        console.log('❌ Error: El formato Base64 no comienza con "data:image"');
      }
    }
    
  } catch (error) {
    console.error('Error en la prueba:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

testImageStorage()
  .then(() => console.log('Prueba completada'))
  .catch(err => console.error('Error general:', err)); 