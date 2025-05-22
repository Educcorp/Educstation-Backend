// Script para verificar la relación entre usuarios y administradores
const { pool } = require('./src/config/database');

async function checkUserAdmin() {
  let connection;
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    // 1. Verificar todos los usuarios
    console.log('\n=== Usuarios registrados ===');
    const [users] = await connection.query('SELECT id, username, email, is_superuser FROM auth_user');
    
    if (users.length === 0) {
      console.log('No hay usuarios registrados');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, SuperUser: ${user.is_superuser}`);
      });
    }
    
    // 2. Verificar todos los administradores
    console.log('\n=== Administradores registrados ===');
    const [admins] = await connection.query('SELECT * FROM Administrador');
    
    if (admins.length === 0) {
      console.log('No hay administradores registrados');
    } else {
      admins.forEach(admin => {
        console.log(`ID_admin: ${admin.ID_administrador}, Nombre: ${admin.Nombre}, Email: ${admin.Correo_electronico}, ID_usuario: ${admin.ID_usuario || 'NULL'}`);
      });
    }
    
    // 3. Verificar publicaciones
    console.log('\n=== Publicaciones existentes ===');
    const [posts] = await connection.query('SELECT ID_publicaciones, Titulo, ID_administrador FROM Publicaciones');
    
    if (posts.length === 0) {
      console.log('No hay publicaciones registradas');
    } else {
      posts.forEach(post => {
        console.log(`ID: ${post.ID_publicaciones}, Título: ${post.Titulo}, ID_administrador: ${post.ID_administrador}`);
      });
    }
    
    console.log('\n=== SOLUCIÓN PROPUESTA ===');
    console.log('Si tu usuario no está vinculado a un administrador, necesitas actualizar la tabla Administrador');
    console.log('o modificar la función getByUserId en publicacionesModel.js para buscar por ID_usuario directamente');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

checkUserAdmin()
  .then(() => console.log('Verificación completada'))
  .catch(err => console.error('Error general:', err)); 