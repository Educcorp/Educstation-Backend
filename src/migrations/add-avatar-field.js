const { pool } = require('../config/database');

async function addAvatarFieldToUsers() {
  try {
    // Verificar si la columna ya existe
    const [columns] = await pool.execute(`
      SHOW COLUMNS FROM auth_user LIKE 'avatar'
    `);

    if (columns.length === 0) {
      // Si la columna no existe, añadirla
      await pool.execute(`
        ALTER TABLE auth_user
        ADD COLUMN avatar LONGTEXT
      `);
      console.log('Campo avatar añadido con éxito a la tabla auth_user');
    } else {
      console.log('El campo avatar ya existe en la tabla auth_user');
    }

  } catch (error) {
    console.error('Error al añadir campo avatar:', error);
    throw error;
  }
}

// Ejecutar la migración si este archivo se ejecuta directamente
if (require.main === module) {
  addAvatarFieldToUsers()
    .then(() => {
      console.log('Migración completada con éxito');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error en la migración:', err);
      process.exit(1);
    });
}

module.exports = addAvatarFieldToUsers; 