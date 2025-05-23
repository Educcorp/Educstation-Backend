// Utility to sync users from auth_user to Usuarios table
const { pool } = require('../config/database');

async function syncUsers() {
  try {
    console.log('Starting user synchronization...');
    
    // Get all users from auth_user
    const [authUsers] = await pool.execute(
      "SELECT * FROM auth_user"
    );
    
    console.log(`Found ${authUsers.length} users in auth_user table`);
    
    // Check if Usuarios table exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'Usuarios'"
    );
    
    if (tables.length === 0) {
      console.error('ERROR: Usuarios table does not exist!');
      return;
    }
    
    // For each auth_user, check if they exist in Usuarios and create if not
    let created = 0;
    let skipped = 0;
    
    for (const user of authUsers) {
      // Check if user already exists in Usuarios
      const [existingUsers] = await pool.execute(
        "SELECT * FROM Usuarios WHERE ID_usuarios = ?",
        [user.id]
      );
      
      if (existingUsers.length > 0) {
        console.log(`User ${user.username} (ID: ${user.id}) already exists in Usuarios table, skipping.`);
        skipped++;
        continue;
      }
      
      // Create user in Usuarios table
      try {
        await pool.execute(
          `INSERT INTO Usuarios (ID_usuarios, Nombre_Completo, Nickname, Correo_electronico, Contraseña) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            user.id,
            `${user.first_name} ${user.last_name}`.trim(),
            user.username,
            user.email,
            user.password
          ]
        );
        
        console.log(`Created user ${user.username} (ID: ${user.id}) in Usuarios table`);
        created++;
      } catch (error) {
        console.error(`Error creating user ${user.username} (ID: ${user.id}):`, error.message);
      }
    }
    
    console.log(`\nSynchronization completed: ${created} users created, ${skipped} users skipped.`);
    
    // Verify the results
    const [usersCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM Usuarios"
    );
    
    console.log(`Total users in Usuarios table now: ${usersCount[0].count}`);
    
  } catch (error) {
    console.error('Error synchronizing users:', error);
  }
}

// Run the sync
syncUsers();

module.exports = { syncUsers }; 