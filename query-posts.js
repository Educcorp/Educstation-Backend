const { pool } = require('./src/config/database');

async function queryTables() {
  try {
    console.log('Conectando a la base de datos...');
    
    // 1. Publicaciones
    console.log('\n=== PUBLICACIONES ===');
    const [publicaciones] = await pool.query('SELECT * FROM Publicaciones');
    console.log(`Publicaciones encontradas: ${publicaciones.length}`);
    if (publicaciones.length > 0) {
      publicaciones.forEach(p => {
        console.log(`ID: ${p.ID_publicaciones}, Título: ${p.Titulo}, Estado: ${p.Estado}, Admin ID: ${p.ID_administrador}`);
      });
    }
    
    // 2. Categorías
    console.log('\n=== CATEGORÍAS ===');
    const [categorias] = await pool.query('SELECT * FROM Categorias');
    console.log(`Categorías encontradas: ${categorias.length}`);
    if (categorias.length > 0) {
      categorias.forEach(c => {
        console.log(`ID: ${c.ID_categoria}, Nombre: ${c.Nombre_categoria}, Descripción: ${c.Descripcion}`);
      });
    }
    
    // 3. Relación Publicaciones-Categorías
    console.log('\n=== PUBLICACIONES-CATEGORÍAS ===');
    const [pubCat] = await pool.query('SELECT * FROM Publicaciones_Categorias');
    console.log(`Relaciones encontradas: ${pubCat.length}`);
    
    // 4. Administradores
    console.log('\n=== ADMINISTRADORES ===');
    const [admins] = await pool.query('SELECT * FROM Administrador');
    console.log(`Administradores encontrados: ${admins.length}`);
    if (admins.length > 0) {
      admins.forEach(a => {
        console.log(`ID: ${a.ID_administrador}, Nombre: ${a.Nombre}, Email: ${a.Correo_electronico}`);
      });
    }
    
    // 5. Usuarios
    console.log('\n=== USUARIOS ===');
    const [usuarios] = await pool.query('SELECT * FROM auth_user');
    console.log(`Usuarios encontrados: ${usuarios.length}`);
    if (usuarios.length > 0) {
      usuarios.forEach(u => {
        console.log(`ID: ${u.id}, Username: ${u.username}, Email: ${u.email}, Staff: ${u.is_staff}, Superuser: ${u.is_superuser}`);
      });
    }
    
    // Cerrar la conexión
    await pool.end();
    console.log('\nConsulta completada. Conexión cerrada.');
  } catch (error) {
    console.error('Error al consultar tablas:', error.message);
    if (pool) await pool.end();
  }
}

// Ejecutar la función
queryTables(); 