const { pool } = require('../config/database');

async function fixImagenPortadaColumnToBlob() {
  try {
    console.log('Starting migration: Change Imagen_portada column from LONGTEXT to LONGBLOB...');
    
    // Check if the column exists
    const [columns] = await pool.execute(`
      SHOW COLUMNS FROM Publicaciones LIKE 'Imagen_portada'
    `);
    
    if (columns.length > 0) {
      console.log('Found Imagen_portada column, changing from LONGTEXT to LONGBLOB...');
      
      // Modify the column type to LONGBLOB for better handling of binary data
      await pool.execute(`
        ALTER TABLE Publicaciones MODIFY COLUMN Imagen_portada LONGBLOB
      `);
      
      console.log('Successfully changed Imagen_portada column to LONGBLOB');
    } else {
      console.log('Imagen_portada column does not exist, adding it...');
      
      // Add the column if it doesn't exist
      await pool.execute(`
        ALTER TABLE Publicaciones ADD COLUMN Imagen_portada LONGBLOB
      `);
      
      console.log('Successfully added Imagen_portada column as LONGBLOB');
    }
    
    // Also check and increase the max_allowed_packet setting if possible
    try {
      const [maxPacketRows] = await pool.execute(`
        SHOW VARIABLES LIKE 'max_allowed_packet'
      `);
      
      const currentMaxPacket = parseInt(maxPacketRows[0].Value);
      console.log(`Current max_allowed_packet: ${currentMaxPacket} bytes (${(currentMaxPacket / (1024 * 1024)).toFixed(2)} MB)`);
      
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Error checking max_allowed_packet:', error);
      // Continue anyway as this is not critical for the migration
      console.log('Migration completed with warnings');
    }
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

// Execute the migration if this file is run directly
if (require.main === module) {
  fixImagenPortadaColumnToBlob()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration script failed:', err);
      process.exit(1);
    });
}

module.exports = fixImagenPortadaColumnToBlob; 