const { pool } = require('./src/config/database');

async function checkMaxAllowedPacket() {
  try {
    // Check the max_allowed_packet MySQL variable
    const [result] = await pool.execute(`
      SHOW VARIABLES LIKE 'max_allowed_packet'
    `);
    
    console.log('Max Allowed Packet Size:');
    console.table(result);
    
    // Close the connection
    await pool.end();
  } catch (error) {
    console.error('Error checking max_allowed_packet:', error);
  }
}

// Run the function
checkMaxAllowedPacket(); 