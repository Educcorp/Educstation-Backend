const { testConnection } = require('./src/config/database');

async function runTest() {
  try {
    const result = await testConnection();
    console.log('Resultado de la prueba:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error en la prueba:', error);
    process.exit(1);
  }
}

runTest();