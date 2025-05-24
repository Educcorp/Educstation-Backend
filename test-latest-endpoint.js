const fetch = require('node-fetch');

async function testLatestEndpoint() {
  try {
    console.log('🔍 Probando endpoint /latest específicamente...\n');
    
    const url = 'https://educstation-backend-production.up.railway.app/api/publicaciones/latest?limite=10';
    console.log(`URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Tipo de respuesta: ${typeof data}`);
      console.log(`Es array: ${Array.isArray(data)}`);
      console.log(`Longitud: ${data.length}`);
      
      if (data.length > 0) {
        console.log('\nPrimeras publicaciones:');
        data.slice(0, 3).forEach((pub, index) => {
          console.log(`${index + 1}. ${pub.Titulo} (${pub.Estado})`);
        });
      } else {
        console.log('\n⚠️  El endpoint devuelve un array vacío');
      }
    } else {
      const errorText = await response.text();
      console.log(`Error: ${errorText}`);
    }
    
    console.log('\n✅ Prueba completada');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

// Ejecutar la prueba
testLatestEndpoint(); 