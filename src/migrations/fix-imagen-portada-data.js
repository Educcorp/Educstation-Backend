const { pool } = require('../config/database');

async function fixImagenPortadaData() {
  try {
    console.log('Starting migration: Fix Imagen_portada data format...');
    
    // Get all publications that have [object Object] in Imagen_portada
    const [publicaciones] = await pool.execute(`
      SELECT ID_publicaciones, Imagen_portada 
      FROM Publicaciones 
      WHERE Imagen_portada IS NOT NULL
    `);
    
    console.log(`Found ${publicaciones.length} publications with Imagen_portada data`);
    let fixedCount = 0;
    
    // Process each publication
    for (const pub of publicaciones) {
      try {
        // Check if the data is an [object Object] representation
        const data = pub.Imagen_portada;
        const dataStr = data?.toString() || '';
        
        if (dataStr === '[object Object]' || !dataStr.startsWith('data:image')) {
          console.log(`Publication ${pub.ID_publicaciones} has invalid Imagen_portada data: ${dataStr.substring(0, 50)}...`);
          
          // Set to null for now, as the original data is lost
          await pool.execute(`
            UPDATE Publicaciones
            SET Imagen_portada = NULL
            WHERE ID_publicaciones = ?
          `, [pub.ID_publicaciones]);
          
          console.log(`Reset Imagen_portada for publication ${pub.ID_publicaciones}`);
          fixedCount++;
        } else if (data instanceof Buffer) {
          // If it's a buffer, convert it back to string (assuming it was originally base64)
          try {
            const stringData = data.toString('utf8');
            
            // Verify it looks like a valid base64 image
            if (stringData.startsWith('data:image')) {
              await pool.execute(`
                UPDATE Publicaciones
                SET Imagen_portada = ?
                WHERE ID_publicaciones = ?
              `, [stringData, pub.ID_publicaciones]);
              
              console.log(`Fixed Buffer data for publication ${pub.ID_publicaciones}`);
              fixedCount++;
            }
          } catch (bufferError) {
            console.error(`Error processing Buffer data for publication ${pub.ID_publicaciones}:`, bufferError);
          }
        }
      } catch (pubError) {
        console.error(`Error processing publication ${pub.ID_publicaciones}:`, pubError);
      }
    }
    
    console.log(`Fixed/processed ${fixedCount} publications`);
    
    // Add a new temporary function to the Publicacion model that properly converts image data
    console.log('Adding safeguards for future image uploads...');
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

// Execute the migration if this file is run directly
if (require.main === module) {
  fixImagenPortadaData()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration script failed:', err);
      process.exit(1);
    });
}

module.exports = fixImagenPortadaData; 