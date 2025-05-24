const fetch = require('node-fetch');

async function testAdminEndpoint() {
  try {
    console.log('🔍 Probando endpoint /all para administradores...\n');
    
    // Probar sin autenticación (debería fallar)
    console.log('1. Probando sin autenticación...');
    try {
      const response1 = await fetch('https://educstation-backend-production.up.railway.app/api/publicaciones/all?limite=10');
      console.log(`   Status: ${response1.status}`);
      if (!response1.ok) {
        const error1 = await response1.json();
        console.log(`   Error esperado: ${error1.detail}`);
      }
    } catch (error) {
      console.log(`   Error de conexión: ${error.message}`);
    }
    
    console.log('\n2. Probando endpoint estándar (sin /all)...');
    try {
      const response2 = await fetch('https://educstation-backend-production.up.railway.app/api/publicaciones?limite=10');
      console.log(`   Status: ${response2.status}`);
      if (response2.ok) {
        const data2 = await response2.json();
        console.log(`   Publicaciones obtenidas: ${data2.length}`);
        if (data2.length > 0) {
          console.log(`   Primera publicación: ${data2[0].Titulo}`);
        }
      } else {
        const error2 = await response2.json();
        console.log(`   Error: ${error2.detail}`);
      }
    } catch (error) {
      console.log(`   Error de conexión: ${error.message}`);
    }
    
    console.log('\n3. Probando endpoint /latest...');
    try {
      const response3 = await fetch('https://educstation-backend-production.up.railway.app/api/publicaciones/latest?limite=10');
      console.log(`   Status: ${response3.status}`);
      if (response3.ok) {
        const data3 = await response3.json();
        console.log(`   Publicaciones obtenidas: ${data3.length}`);
        if (data3.length > 0) {
          console.log(`   Primera publicación: ${data3[0].Titulo}`);
        }
      } else {
        const error3 = await response3.json();
        console.log(`   Error: ${error3.detail}`);
      }
    } catch (error) {
      console.log(`   Error de conexión: ${error.message}`);
    }
    
    console.log('\n✅ Pruebas completadas');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar las pruebas
testAdminEndpoint(); 