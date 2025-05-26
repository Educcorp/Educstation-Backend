const mysql = require('mysql2/promise');

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    });

    const testId = 164; // Cambia este ID por uno válido de tu tabla
    console.log('Probando UPDATE en Publicaciones para ID:', testId);
    const [updateResult] = await pool.execute(
      'UPDATE Publicaciones SET contador_likes = contador_likes + 1 WHERE ID_publicaciones = ?',
      [testId]
    );
    console.log('Resultado del UPDATE:', updateResult);

    const [rows] = await pool.execute(
      'SELECT contador_likes FROM Publicaciones WHERE ID_publicaciones = ?',
      [testId]
    );
    console.log('Nuevo valor de contador_likes:', rows.length > 0 ? rows[0].contador_likes : 'No encontrado');
    process.exit(0);
  } catch (error) {
    console.error('ERROR en la prueba de conexión/UPDATE:', error);
    process.exit(1);
  }
})();