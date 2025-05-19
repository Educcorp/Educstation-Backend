// ensure-dirs.js - Script para asegurar que las carpetas necesarias existan
const fs = require('fs');
const path = require('path');

// Directorios a crear
const directories = [
  'uploads',
  'uploads/avatars',
  'uploads/images',
  'uploads/temp'
];

// Crear directorios si no existen
function ensureDirectories() {
  try {
    console.log('Verificando directorios...');
    
    directories.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      
      if (!fs.existsSync(dirPath)) {
        console.log(`Creando directorio: ${dir}`);
        fs.mkdirSync(dirPath, { recursive: true });
      } else {
        console.log(`El directorio ya existe: ${dir}`);
      }
    });
    
    console.log('Todos los directorios han sido verificados y creados según sea necesario.');
  } catch (error) {
    console.error('Error al crear directorios:', error);
  }
}

// Ejecutar la función
ensureDirectories(); 