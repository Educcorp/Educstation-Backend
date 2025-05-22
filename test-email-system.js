const dotenv = require('dotenv');
dotenv.config();

const { sendPasswordResetEmail } = require('./src/utils/emailUtils');

console.log('=== DIAGNÓSTICO DEL SISTEMA DE CORREOS ===\n');

// Verificar variables de entorno
console.log('1. Verificando variables de entorno:');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || '❌ NO CONFIGURADA');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NO CONFIGURADA');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? `✅ CONFIGURADA (${process.env.EMAIL_PASSWORD.length} caracteres)` : '❌ NO CONFIGURADA');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NO CONFIGURADA');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NO CONFIGURADA');

// Verificar si la contraseña tiene espacios
if (process.env.EMAIL_PASSWORD) {
  const hasSpaces = process.env.EMAIL_PASSWORD.includes(' ');
  console.log('Contraseña tiene espacios:', hasSpaces ? '⚠️  SÍ (esto puede causar problemas)' : '✅ NO');
  
  if (hasSpaces) {
    console.log('💡 SUGERENCIA: Las contraseñas de aplicación de Gmail deben ser sin espacios.');
    console.log('   Actual:', process.env.EMAIL_PASSWORD);
    console.log('   Debería ser:', process.env.EMAIL_PASSWORD.replace(/\s/g, ''));
  }
}

console.log('\n2. Probando envío de correo de prueba...');

async function testEmailSystem() {
  try {
    const testEmail = 'test@example.com';
    const testName = 'Usuario de Prueba';
    const testResetUrl = 'https://www.educstation.com/reset-password/test-token';

    console.log('Enviando correo de prueba...');
    
    const result = await sendPasswordResetEmail(testEmail, testName, testResetUrl);
    
    console.log('✅ Correo enviado exitosamente!');
    console.log('Detalles del resultado:', result);
    
  } catch (error) {
    console.error('❌ Error al enviar correo:', error.message);
    console.error('Detalles del error:', error);
    
    // Diagnosticar tipos de error específicos
    if (error.code === 'EAUTH') {
      console.error('\n🔑 PROBLEMA DE AUTENTICACIÓN:');
      console.error('- Verifica que EMAIL_USER sea correcto');
      console.error('- Verifica que EMAIL_PASSWORD sea una contraseña de aplicación válida');
      console.error('- Asegúrate de que la autenticación de 2 factores esté activada en Gmail');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🌐 PROBLEMA DE CONEXIÓN:');
      console.error('- No se puede conectar al servidor de correo');
      console.error('- Verifica la conexión a internet');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n⏰ PROBLEMA DE TIEMPO DE ESPERA:');
      console.error('- El servidor de correo no responde a tiempo');
    }
  }
}

// Ejecutar la prueba
testEmailSystem().then(() => {
  console.log('\n=== FIN DEL DIAGNÓSTICO ===');
  process.exit(0);
}).catch((error) => {
  console.error('Error en el diagnóstico:', error);
  process.exit(1);
}); 