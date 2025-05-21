const { pool } = require('./src/config/database');

async function checkConnectionSettings() {
  try {
    console.log('Checking MySQL connection settings...');
    
    // Get a connection from the pool
    const connection = await pool.getConnection();
    
    try {
      // Check max_allowed_packet
      const [maxPacketRows] = await connection.query(`SHOW VARIABLES LIKE 'max_allowed_packet'`);
      console.log('max_allowed_packet:', maxPacketRows[0].Value, 'bytes',
                  '(', (parseInt(maxPacketRows[0].Value) / (1024 * 1024)).toFixed(2), 'MB )');
      
      // Check wait_timeout
      const [waitTimeoutRows] = await connection.query(`SHOW VARIABLES LIKE 'wait_timeout'`);
      console.log('wait_timeout:', waitTimeoutRows[0].Value, 'seconds');
      
      // Check net_read_timeout and net_write_timeout
      const [readTimeoutRows] = await connection.query(`SHOW VARIABLES LIKE 'net_read_timeout'`);
      console.log('net_read_timeout:', readTimeoutRows[0].Value, 'seconds');
      
      const [writeTimeoutRows] = await connection.query(`SHOW VARIABLES LIKE 'net_write_timeout'`);
      console.log('net_write_timeout:', writeTimeoutRows[0].Value, 'seconds');
      
      // Check sql_mode
      const [sqlModeRows] = await connection.query(`SHOW VARIABLES LIKE 'sql_mode'`);
      console.log('sql_mode:', sqlModeRows[0].Value);
      
      // Check long_query_time
      const [longQueryRows] = await connection.query(`SHOW VARIABLES LIKE 'long_query_time'`);
      console.log('long_query_time:', longQueryRows[0].Value, 'seconds');
      
      // Check the table status
      const [publicacionesRows] = await connection.query(`SHOW TABLE STATUS LIKE 'Publicaciones'`);
      console.log('\nPublicaciones Table Status:');
      console.log('Engine:', publicacionesRows[0].Engine);
      console.log('Row_format:', publicacionesRows[0].Row_format);
      console.log('Rows:', publicacionesRows[0].Rows);
      console.log('Avg_row_length:', publicacionesRows[0].Avg_row_length, 'bytes');
      console.log('Max_data_length:', publicacionesRows[0].Max_data_length, 'bytes',
                  '(', (parseInt(publicacionesRows[0].Max_data_length) / (1024 * 1024 * 1024)).toFixed(2), 'GB )');
      
      // Check the column information
      const [columnsRows] = await connection.query(`SHOW COLUMNS FROM Publicaciones LIKE 'Imagen_portada'`);
      console.log('\nImagen_portada Column:');
      console.log('Type:', columnsRows[0].Type);
      console.log('Null:', columnsRows[0].Null);
      console.log('Key:', columnsRows[0].Key);
      console.log('Default:', columnsRows[0].Default);
      console.log('Extra:', columnsRows[0].Extra);
      
    } finally {
      // Release the connection
      connection.release();
    }
    
    // Close the pool
    await pool.end();
    
    console.log('\nConnection settings check completed.');
  } catch (error) {
    console.error('Error checking connection settings:', error);
  }
}

// Run the function
checkConnectionSettings(); 