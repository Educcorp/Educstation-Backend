const path = require('path');
const fs = require('fs').promises;

async function runMigrations() {
  try {
    // Directorio de migraciones
    const migrationsDir = path.join(__dirname, '../migrations');
    
    // Obtener todos los archivos de migración
    const files = await fs.readdir(migrationsDir);
    
    // Filtrar archivos JavaScript
    const migrationFiles = files.filter(file => file.endsWith('.js'));
    
    console.log(`Encontradas ${migrationFiles.length} migraciones para ejecutar`);
    
    // Ejecutar cada migración
    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      console.log(`Ejecutando migración: ${file}`);
      
      try {
        const migration = require(migrationPath);
        await migration();
        console.log(`Migración ${file} completada con éxito`);
      } catch (error) {
        console.error(`Error al ejecutar migración ${file}:`, error);
        // Continuar con las demás migraciones
      }
    }
    
    console.log('Todas las migraciones han sido completadas');
  } catch (error) {
    console.error('Error al ejecutar migraciones:', error);
    throw error;
  }
}

module.exports = {
  runMigrations
}; 