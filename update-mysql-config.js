const { pool } = require('./src/config/database');

async function updateMySQLConfig() {
  try {
    console.log('Starting MySQL configuration update...');
    
    // Get a connection from the pool
    const connection = await pool.getConnection();
    
    try {
      // Check current max_allowed_packet size
      const [maxPacketRows] = await connection.query(`SHOW VARIABLES LIKE 'max_allowed_packet'`);
      const currentMaxPacket = parseInt(maxPacketRows[0].Value);
      console.log(`Current max_allowed_packet: ${currentMaxPacket} bytes (${(currentMaxPacket / (1024 * 1024)).toFixed(2)} MB)`);
      
      // We can't set this directly in a normal connection, but we can print the command
      console.log('\nTo increase max_allowed_packet, run these commands in MySQL:');
      console.log('SET GLOBAL max_allowed_packet=104857600;  -- For 100MB');
      console.log('SET GLOBAL max_allowed_packet=209715200;  -- For 200MB');
      
      // IMPORTANT: Check if we have permissions to set GLOBAL variables
      try {
        // Try to set a different, less risky global variable to test permissions
        await connection.query(`SET GLOBAL net_read_timeout = 600`);
        console.log('\n✓ You have permissions to set GLOBAL variables. You can run the above commands.');
      } catch (error) {
        console.log('\n✗ You do not have permissions to set GLOBAL variables. Contact your MySQL administrator.');
      }
      
      // Additional optimization settings
      console.log('\nOther recommended MySQL settings to optimize for large content:');
      console.log('SET GLOBAL net_read_timeout = 600;');
      console.log('SET GLOBAL net_write_timeout = 600;');
      console.log('SET GLOBAL wait_timeout = 600;');
      console.log('SET GLOBAL interactive_timeout = 600;');
      
      // Check the MySQL configuration file location
      console.log('\nTo make these changes permanent, add the following to your MySQL configuration file:');
      console.log('[mysqld]');
      console.log('max_allowed_packet = 100M');
      console.log('net_read_timeout = 600');
      console.log('net_write_timeout = 600');
      console.log('wait_timeout = 600');
      console.log('interactive_timeout = 600');
      
      console.log('\nThe MySQL configuration file is typically located at:');
      console.log('- Windows: C:\\ProgramData\\MySQL\\MySQL Server X.X\\my.ini');
      console.log('- Linux: /etc/mysql/my.cnf or /etc/my.cnf');
      console.log('- macOS: /usr/local/mysql/etc/my.cnf');
      
      // Check the innodb_log_file_size
      const [innodbLogFileSize] = await connection.query(`SHOW VARIABLES LIKE 'innodb_log_file_size'`);
      console.log(`\nCurrent innodb_log_file_size: ${innodbLogFileSize[0].Value} bytes (${(parseInt(innodbLogFileSize[0].Value) / (1024 * 1024)).toFixed(2)} MB)`);
      console.log('A larger innodb_log_file_size (e.g., 256M) can improve performance for large transactions.');

    } finally {
      // Release the connection
      connection.release();
    }
    
    // Close the pool
    await pool.end();
    
    console.log('\nMySQL configuration check completed.');
  } catch (error) {
    console.error('Error checking MySQL configuration:', error);
  }
}

// Run the function if executed directly
if (require.main === module) {
  updateMySQLConfig()
    .then(() => {
      console.log('Script completed successfully.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

module.exports = updateMySQLConfig; 