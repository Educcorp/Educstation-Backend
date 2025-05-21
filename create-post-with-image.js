const { pool } = require('./src/config/database');

async function createPostWithImage() {
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
      
      // Crear un administrador si no existe
      const [newAdmin] = await connection.query(`
        INSERT INTO Administrador (Nombre, Correo, Contraseña, Rol)
        VALUES (?, ?, ?, ?)
      `, ['Admin Test', 'admin@test.com', 'password123', 'admin']);
      
      var adminId = newAdmin.insertId;
      console.log(`Administrador creado con ID: ${adminId}`);
    } else {
      var adminId = admins[0].ID_administrador;
      console.log(`Utilizando administrador existente con ID: ${adminId}`);
    }
    
    // HTML de ejemplo para una imagen
    const imagenHTML = `<img src="https://via.placeholder.com/800x400" alt="Imagen de prueba" data-image-type="html-encoded" style="max-width: 100%; height: auto;" />`;
    
    // Crear el post con imagen HTML
    console.log('Creando nuevo post con imagen HTML...');
    const [result] = await connection.query(`
      INSERT INTO Publicaciones 
      (Titulo, Contenido, Resumen, Imagen_portada, Estado, ID_administrador)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'Post de prueba con imagen HTML',
      '<p>Este es un contenido de prueba para verificar la funcionalidad de Imagen_portada.</p>' + imagenHTML,
      'Este es un resumen de prueba',
      imagenHTML,
      'publicado',
      adminId
    ]);
    
    const postId = result.insertId;
    console.log(`Nuevo post creado con ID: ${postId}`);
    
    // Verificar que la creación se realizó correctamente
    const [post] = await connection.query(`
      SELECT ID_publicaciones, Titulo, Imagen_portada
      FROM Publicaciones
      WHERE ID_publicaciones = ?
    `, [postId]);
    
    console.log('\nDetalles del post creado:');
    console.log(`ID: ${post[0].ID_publicaciones}`);
    console.log(`Título: ${post[0].Titulo}`);
    console.log(`Imagen HTML: ${post[0].Imagen_portada ? 'PRESENTE' : 'NO PRESENTE'}`);
    
  } catch (error) {
    console.error('Error al crear el post:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

createPostWithImage()
  .then(() => console.log('Proceso completado'))
  .catch(err => console.error('Error general:', err)); 