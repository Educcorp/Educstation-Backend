const { pool } = require('./src/config/database');

async function checkSchema() {
  try {
    // Check the schema of the Publicaciones table
    const [columns] = await pool.execute(`
      SHOW COLUMNS FROM Publicaciones
    `);
    
    console.log('Publicaciones Table Schema:');
    console.table(columns);
    
    // Specifically check the Imagen_portada column
    const [imagenPortadaCol] = await pool.execute(`
      SHOW COLUMNS FROM Publicaciones WHERE Field = 'Imagen_portada'
    `);
    
    console.log('\nImagen_portada Column Details:');
    console.table(imagenPortadaCol);
    
    // Close the connection
    await pool.end();
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

// Run the function
checkSchema(); 