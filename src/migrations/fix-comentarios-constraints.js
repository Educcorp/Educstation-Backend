const { pool } = require('../config/database');

async function fixComentariosConstraints() {
  try {
    console.log('Starting migration: Fix Comentarios foreign key constraints...');
    
    // First check all constraints
    const [constraints] = await pool.execute(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'Comentarios'
      AND CONSTRAINT_SCHEMA = DATABASE()
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('Found foreign key constraints:', constraints);
    
    // Drop any constraint that references Usuarios table
    for (const constraint of constraints) {
      if (constraint.REFERENCED_TABLE_NAME === 'Usuarios') {
        console.log(`Dropping constraint ${constraint.CONSTRAINT_NAME} that references Usuarios...`);
        try {
          await pool.execute(`
            ALTER TABLE Comentarios
            DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}
          `);
          console.log(`Constraint ${constraint.CONSTRAINT_NAME} dropped successfully`);
        } catch (error) {
          console.log(`Error dropping constraint ${constraint.CONSTRAINT_NAME}:`, error.message);
        }
      }
    }
    
    // Check if the auth_user constraint exists
    const [authConstraints] = await pool.execute(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'Comentarios'
      AND CONSTRAINT_SCHEMA = DATABASE()
      AND REFERENCED_TABLE_NAME = 'auth_user'
    `);
    
    if (authConstraints.length === 0) {
      console.log('Creating new foreign key constraint to reference auth_user...');
      await pool.execute(`
        ALTER TABLE Comentarios
        ADD CONSTRAINT fk_comentarios_auth_user
        FOREIGN KEY (ID_Usuario) REFERENCES auth_user(id)
        ON DELETE CASCADE
      `);
      console.log('Foreign key constraint to auth_user created successfully');
    } else {
      console.log('Foreign key constraint to auth_user already exists');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

// Execute the migration if this file is run directly
if (require.main === module) {
  fixComentariosConstraints()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration script failed:', err);
      process.exit(1);
    });
}

module.exports = fixComentariosConstraints; 