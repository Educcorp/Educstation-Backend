/**
 * Utilidades para envío de correos electrónicos
 * 
 * Este archivo contiene funciones para enviar correos electrónicos 
 * usando Nodemailer. Por ahora solo simula el envío, pero puede 
 * configurarse fácilmente para usar un servicio real.
 */

const nodemailer = require('nodemailer');

// Variable para almacenar el transporter de nodemailer (configurado la primera vez que se usa)
let transporter = null;

// Configurar el transporter de nodemailer
const setupTransporter = () => {
  // SOLUCIÓN TEMPORAL: Siempre usar el modo simulado hasta que se configuren correctamente las credenciales
  // Cuando estés listo para usar un servicio real, elimina esta línea y descomenta el código debajo
  const forceMockMode = false;
  
  // Verificar si tenemos credenciales configuradas
  const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
  
  // Si estamos en producción Y tenemos credenciales, usamos el servicio real
  if (!forceMockMode && hasCredentials) {
    console.log('Configurando transporter de correo real');
    // Configuración para producción (ejemplo: usando SendGrid)
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'SendGrid',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // En desarrollo o si no hay credenciales en producción, simulamos el envío
    if (process.env.NODE_ENV === 'production') {
      console.warn('ADVERTENCIA: Usando modo simulado de correo en producción.');
    } else {
      console.log('Modo de desarrollo: Los correos serán simulados');
    }
    
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('=== CORREO SIMULADO ===');
        console.log(`De: ${mailOptions.from}`);
        console.log(`Para: ${mailOptions.to}`);
        console.log(`Asunto: ${mailOptions.subject}`);
        console.log(`Contenido HTML:`);
        console.log(mailOptions.html ? mailOptions.html.substring(0, 500) + '...' : 'No hay contenido HTML');
        console.log(`Contenido Texto:`);
        console.log(mailOptions.text ? mailOptions.text.substring(0, 500) + '...' : 'No hay contenido de texto');
        console.log('=== FIN DEL CORREO SIMULADO ===');
        return { 
          messageId: `simulado-${Date.now()}`,
          response: 'Correo simulado enviado correctamente'
        };
      }
    };
  }

  return transporter;
};

/**
 * Envía un correo electrónico
 * @param {string} to - Destinatario del correo
 * @param {string} subject - Asunto del correo
 * @param {string} text - Contenido en texto plano
 * @param {string} html - Contenido en HTML
 * @returns {Promise} - Promesa con el resultado del envío
 */
const sendEmail = async (to, subject, text, html) => {
  if (!transporter) {
    transporter = setupTransporter();
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'educstation@ejemplo.com',
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error;
  }
};

/**
 * Envía un correo de restablecimiento de contraseña
 * @param {string} to - Dirección de correo del destinatario
 * @param {string} name - Nombre del usuario
 * @param {string} resetUrl - URL para restablecer la contraseña
 * @returns {Promise} - Promesa con el resultado del envío
 */
const sendPasswordResetEmail = async (to, name, resetUrl) => {
  const subject = 'Restablecimiento de contraseña - EducStation';
  
  const text = `
    Hola ${name},
    
    Has solicitado restablecer tu contraseña en EducStation.
    
    Haz clic en el siguiente enlace para crear una nueva contraseña:
    ${resetUrl}
    
    Este enlace expirará en 1 hora.
    
    Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá igual.
    
    Saludos,
    El equipo de EducStation
  `;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #e5e5e5;
          border-radius: 5px;
        }
        .header {
          background-color: #1F4E4E;
          padding: 15px;
          color: white;
          text-align: center;
          border-radius: 5px 5px 0 0;
          margin-bottom: 20px;
        }
        .content {
          padding: 20px;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #1F4E4E;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Restablecimiento de Contraseña</h2>
        </div>
        <div class="content">
          <p>Hola ${name},</p>
          <p>Has solicitado restablecer tu contraseña en EducStation.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
          </p>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p><strong>Este enlace expirará en 1 hora.</strong></p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá igual.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} EducStation. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(to, subject, text, html);
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail
}; 