const { pool } = require('./src/config/database');

// Esta función verifica el tamaño máximo de paquete permitido en MySQL
// max_allowed_packet es un límite importante que afecta al tamaño máximo
// de datos que se pueden enviar en una consulta, independientemente del tipo de columna
async function checkMaxAllowedPacket() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await pool.getConnection();
    
    console.log('Verificando configuración max_allowed_packet...');
    const [results] = await connection.query(`
      SHOW VARIABLES LIKE 'max_allowed_packet'
    `);
    
    if (results.length > 0) {
      const maxPacketBytes = parseInt(results[0].Value);
      const maxPacketMB = (maxPacketBytes / 1024 / 1024).toFixed(2);
      
      console.log(`\nConfiguración max_allowed_packet: ${maxPacketBytes} bytes (${maxPacketMB} MB)`);
      
      // Recomendaciones según el tamaño encontrado
      if (maxPacketBytes < 1024 * 1024 * 4) { // menos de 4MB
        console.log('\n⚠️ ADVERTENCIA: El valor de max_allowed_packet es menor que 4MB, lo que podría');
        console.log('limitar la capacidad de subir imágenes grandes, incluso si la columna es LONGTEXT.');
        console.log('\nConsideraciones:');
        console.log('1. Railway podría tener esta limitación en su configuración de MySQL.');
        console.log('2. Recomendamos comprimir las imágenes en el cliente antes de enviarlas.');
        console.log('3. Limitar el tamaño máximo de imágenes a 1-2MB es una buena práctica.');
      } else if (maxPacketBytes < 1024 * 1024 * 16) { // menos de 16MB
        console.log('\n✅ El valor de max_allowed_packet es adecuado para imágenes de tamaño moderado.');
        console.log('Recomendamos limitar el tamaño de imágenes en el frontend a 4MB como máximo.');
      } else {
        console.log('\n✅ El valor de max_allowed_packet es grande, lo que permite subir imágenes de buen tamaño.');
        console.log('Aún así, recomendamos comprimir imágenes grandes en el cliente para mejorar el rendimiento.');
      }
      
      // Verificar tipo de columna Imagen_portada
      console.log('\nVerificando tipo de columna Imagen_portada...');
      const [columns] = await connection.query(`
        SHOW COLUMNS FROM Publicaciones WHERE Field = 'Imagen_portada'
      `);
      
      if (columns.length > 0) {
        console.log(`Tipo actual de columna Imagen_portada: ${columns[0].Type}`);
        
        // Información sobre límites de tipos de columna
        console.log('\nInformación sobre límites de tipos de columna TEXT en MySQL:');
        console.log('- TEXT: hasta 64KB (65,535 bytes)');
        console.log('- MEDIUMTEXT: hasta 16MB (16,777,215 bytes)');
        console.log('- LONGTEXT: hasta 4GB (4,294,967,295 bytes)');
        
        // Resumen de límites efectivos
        console.log('\nLímite efectivo para subir imágenes:');
        
        const columnType = columns[0].Type.toLowerCase();
        let columnLimit = 0;
        
        if (columnType === 'text') {
          columnLimit = 65535;
        } else if (columnType === 'mediumtext') {
          columnLimit = 16777215;
        } else if (columnType === 'longtext') {
          columnLimit = 4294967295;
        }
        
        // El límite real es el menor entre max_allowed_packet y el tipo de columna
        const effectiveLimit = Math.min(maxPacketBytes, columnLimit);
        const effectiveLimitMB = (effectiveLimit / 1024 / 1024).toFixed(2);
        
        console.log(`Límite efectivo: ${effectiveLimit} bytes (${effectiveLimitMB} MB)`);
        console.log(`Este límite está determinado por: ${effectiveLimit === maxPacketBytes ? 'max_allowed_packet' : 'tipo de columna'}`);
        
        // Consideración para Base64
        const base64Overhead = 1.37; // Factor de overhead aproximado para Base64
        const maxImageSize = Math.floor(effectiveLimit / base64Overhead);
        const maxImageSizeMB = (maxImageSize / 1024 / 1024).toFixed(2);
        
        console.log(`\nTamaño máximo de imagen original (considerando codificación Base64): ~${maxImageSizeMB} MB`);
        console.log('Recomendamos limitar el tamaño de imagen en el frontend a este valor o menos.');
      } else {
        console.log('No se encontró la columna Imagen_portada en la tabla Publicaciones.');
      }
      
    } else {
      console.log('No se pudo obtener información sobre max_allowed_packet.');
    }
    
  } catch (error) {
    console.error('Error al verificar max_allowed_packet:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nConexión cerrada');
    }
    pool.end();
  }
}

checkMaxAllowedPacket()
  .then(() => console.log('\nProceso completado'))
  .catch(err => console.error('Error general:', err)); 