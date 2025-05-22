const { pool } = require('./src/config/database');

async function checkAuthUserTable() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Verificar si existe la tabla auth_user
    const [tables] = await pool.query('SHOW TABLES LIKE "auth_user"');
    if (tables.length === 0) {
      console.error('❌ La tabla auth_user no existe en la base de datos');
      process.exit(1);
    }
    
    console.log('✅ La tabla auth_user existe');
    
    // Mostrar columnas de la tabla
    const [columns] = await pool.query('SHOW COLUMNS FROM auth_user');
    console.log('\nColumnas de la tabla auth_user:');
    console.log('----------------------------------');
    
    columns.forEach((col, i) => {
      console.log(`${i+1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${col.Key === 'PRI' ? ' PRIMARY KEY' : ''}`);
      
      // Si es la columna avatar, mostrar información adicional
      if (col.Field === 'avatar') {
        console.log(`   > Tipo de datos para avatar: ${col.Type}`);
        
        // Analizar si el tipo es adecuado para almacenar imágenes
        if (col.Type.includes('blob') || col.Type.includes('text')) {
          console.log('   ✅ El tipo de columna es adecuado para almacenar imágenes');
          
          // Verificar si es suficientemente grande
          if (col.Type.includes('tiny')) {
            console.log('   ⚠️ TINYBLOB/TINYTEXT solo puede almacenar hasta 255 bytes (muy pequeño para imágenes)');
          } else if (col.Type.includes('medium')) {
            console.log('   ✅ MEDIUMBLOB/MEDIUMTEXT puede almacenar hasta 16MB');
          } else if (col.Type.includes('long')) {
            console.log('   ✅ LONGBLOB/LONGTEXT puede almacenar hasta 4GB (excelente para imágenes)');
          } else {
            console.log('   ⚠️ BLOB/TEXT normal solo puede almacenar hasta 64KB (podría ser pequeño para algunas imágenes)');
          }
        } else {
          console.log('   ❌ El tipo de columna no es óptimo para almacenar imágenes. Debería ser BLOB o TEXT');
        }
      }
    });
    
    // Mostrar información adicional sobre límites
    console.log('\nInformación sobre límites de tipos de columna en MySQL:');
    console.log('- TINYBLOB/TINYTEXT: hasta 255 bytes');
    console.log('- BLOB/TEXT: hasta 64KB (65,535 bytes)');
    console.log('- MEDIUMBLOB/MEDIUMTEXT: hasta 16MB (16,777,215 bytes)');
    console.log('- LONGBLOB/LONGTEXT: hasta 4GB (4,294,967,295 bytes)');
    
    // Verificar el max_allowed_packet
    const [packetResult] = await pool.query('SHOW VARIABLES LIKE "max_allowed_packet"');
    const maxAllowedPacket = parseInt(packetResult[0].Value);
    
    console.log(`\nMax allowed packet: ${(maxAllowedPacket / (1024 * 1024)).toFixed(2)} MB`);
    
    // Verificar valores en la tabla
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM auth_user');
    console.log(`\nTotal de usuarios en la tabla: ${countResult[0].total}`);
    
    // Verificar si hay avatares almacenados
    const [avatarResult] = await pool.query('SELECT COUNT(*) as count FROM auth_user WHERE avatar IS NOT NULL');
    console.log(`Usuarios con avatar: ${avatarResult[0].count}`);
    
    // Si hay avatares, mostrar el tamaño de uno
    if (avatarResult[0].count > 0) {
      const [sizeResult] = await pool.query('SELECT LENGTH(avatar) as size FROM auth_user WHERE avatar IS NOT NULL LIMIT 1');
      if (sizeResult.length > 0) {
        console.log(`Tamaño de un avatar existente: ${(sizeResult[0].size / 1024).toFixed(2)} KB`);
      }
    }
    
    console.log('\nProceso completado');
  } catch (error) {
    console.error('Error al verificar la tabla auth_user:', error);
  } finally {
    process.exit(0);
  }
}

checkAuthUserTable(); 