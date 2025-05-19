// Lista de migraciones a ejecutar
const migrations = [
  {
    name: 'Crear tabla de publicaciones si no existe',
    file: path.join(__dirname, '../migrations/create-publicaciones-table.js')
  },
  {
    name: 'Crear tabla de categorías si no existe',
    file: path.join(__dirname, '../migrations/create-categorias-table.js')
  },
  {
    name: 'Crear tabla de comentarios si no existe',
    file: path.join(__dirname, '../migrations/create-comentarios-table.js')
  },
  {
    name: 'Añadir campo avatar a tabla de usuarios si no existe',
    file: path.join(__dirname, '../migrations/add-avatar-field.js')
  }
]; 