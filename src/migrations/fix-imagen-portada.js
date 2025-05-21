const { pool } = require('../config/database');

async function fixImagenPortadaColumn() {
  try {
    console.log('Starting migration: Fix Imagen_portada column...');
    
    // Check if the column exists
    const [columns] = await pool.execute(`
      SHOW COLUMNS FROM Publicaciones LIKE 'Imagen_portada'
    `);
    
    if (columns.length > 0) {
      console.log('Found Imagen_portada column, changing from TEXT to LONGTEXT...');
      
      // Modify the column type to LONGTEXT and make sure it accepts very large data
      await pool.execute(`
        ALTER TABLE Publicaciones MODIFY COLUMN Imagen_portada LONGTEXT
      `);
      
      console.log('Successfully changed Imagen_portada column to LONGTEXT');
    } else {
      console.log('Imagen_portada column does not exist, adding it...');
      
      // Add the column if it doesn't exist
      await pool.execute(`
        ALTER TABLE Publicaciones ADD COLUMN Imagen_portada LONGTEXT
      `);
      
      console.log('Successfully added Imagen_portada column as LONGTEXT');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

// Execute the migration if this file is run directly
if (require.main === module) {
  fixImagenPortadaColumn()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration script failed:', err);
      process.exit(1);
    });
}

module.exports = fixImagenPortadaColumn; 