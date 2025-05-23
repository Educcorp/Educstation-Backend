// Database schema check utility
const { pool } = require('../config/database');

async function checkComentariosTable() {
  try {
    console.log('Checking Comentarios table structure...');
    
    // Check if the table exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'Comentarios'"
    );
    
    if (tables.length === 0) {
      console.error('ERROR: Comentarios table does not exist!');
      return;
    }
    
    console.log('Comentarios table exists.');
    
    // Check table structure
    const [columns] = await pool.execute(
      "DESCRIBE Comentarios"
    );
    
    console.log('Comentarios table structure:');
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Key} ${column.Extra}`);
    });
    
    // Check for foreign key constraints
    const [constraints] = await pool.execute(
      "SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'Comentarios' AND REFERENCED_TABLE_NAME IS NOT NULL"
    );
    
    console.log('\nForeign key constraints:');
    if (constraints.length === 0) {
      console.log('No foreign key constraints found!');
    } else {
      constraints.forEach(constraint => {
        console.log(`- ${constraint.COLUMN_NAME} references ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
      });
    }
    
    // Check if there are any records in the table
    const [count] = await pool.execute(
      "SELECT COUNT(*) as count FROM Comentarios"
    );
    
    console.log(`\nTotal records in Comentarios table: ${count[0].count}`);
    
    // Check the related tables
    console.log('\nChecking related tables:');
    
    // Check Publicaciones table
    const [publicaciones] = await pool.execute(
      "SELECT COUNT(*) as count FROM Publicaciones"
    );
    console.log(`- Publicaciones table: ${publicaciones[0].count} records`);
    
    // Check Usuarios table
    const [usuarios] = await pool.execute(
      "SELECT COUNT(*) as count FROM Usuarios"
    );
    console.log(`- Usuarios table: ${usuarios[0].count} records`);
    
    // Check auth_user table
    const [authUsers] = await pool.execute(
      "SELECT COUNT(*) as count FROM auth_user"
    );
    console.log(`- auth_user table: ${authUsers[0].count} records`);
    
    console.log('\nDatabase check completed.');
  } catch (error) {
    console.error('Error checking database schema:', error);
  }
}

// Run the check
checkComentariosTable();

module.exports = { checkComentariosTable }; 