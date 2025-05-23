const { pool } = require('../config/database');

async function updateComentariosForeignKey() {
  try {
    console.log('Starting migration: Update Comentarios foreign key to reference auth_user...');
    
    // First check if the constraint exists
    const [constraints] = await pool.execute(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_NAME = 'Comentarios'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      AND CONSTRAINT_SCHEMA = DATABASE()
    `);
    
    console.log('Found constraints:', constraints.map(c => c.CONSTRAINT_NAME));
    
    // Drop the foreign key constraint that references Usuarios
    for (const constraint of constraints) {
      if (constraint.CONSTRAINT_NAME.includes('ID_Usuario')) {
        console.log(`Dropping constraint ${constraint.CONSTRAINT_NAME}...`);
        await pool.execute(`
          ALTER TABLE Comentarios
          DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}
        `);
        console.log(`Constraint ${constraint.CONSTRAINT_NAME} dropped successfully`);
      }
    }
    
    console.log('Creating new foreign key constraint to reference auth_user...');
    
    // Add new foreign key constraint to reference auth_user
    await pool.execute(`
      ALTER TABLE Comentarios
      ADD CONSTRAINT fk_comentarios_auth_user
      FOREIGN KEY (ID_Usuario) REFERENCES auth_user(id)
      ON DELETE CASCADE
    `);
    
    console.log('Foreign key constraint created successfully');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

// Execute the migration if this file is run directly
if (require.main === module) {
  updateComentariosForeignKey()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration script failed:', err);
      process.exit(1);
    });
}

module.exports = updateComentariosForeignKey; 