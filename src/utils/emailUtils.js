/**
 * Utilidades para envío de correos electrónicos con Gmail
 */

const nodemailer = require('nodemailer');

// Variable para almacenar el transporter de nodemailer
let transporter = null;

// Configurar el transporter de nodemailer para Gmail
const setupTransporter = () => {
  // Verificar si tenemos credenciales de Gmail configuradas (usando las variables existentes)
  const hasGmailCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

  if (hasGmailCredentials) {
    console.log('✅ Configurando transporter de Gmail con credenciales reales');
    console.log('📧 Usuario Gmail:', process.env.EMAIL_USER);
    console.log('🔐 Contraseña de aplicación:', process.env.EMAIL_PASSWORD ? 'Configurada ✅' : 'No configurada ❌');
    console.log('📧 Email FROM:', process.env.EMAIL_FROM);
    console.log('🔧 Servicio:', process.env.EMAIL_SERVICE || 'gmail');

    transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Contraseña de aplicación de 16 caracteres
      },
    });
  } else {
    // Modo simulado si no hay credenciales
    console.log('⚠️ ADVERTENCIA: Credenciales de Gmail no configuradas. Usando modo simulado.');
    console.log('Variables necesarias:');
    console.log('- EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configurada' : '❌ No configurada');
    console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Configurada' : '❌ No configurada');

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
    from: `"EducStation" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`, // Usar EMAIL_FROM o EMAIL_USER
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado exitosamente:', info.messageId);
    console.log('📧 Enviado a:', to);
    console.log('📝 Asunto:', subject);
    return info;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
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

/**
 * Envía un correo desde el formulario de contacto
 * @param {string} fromEmail - Email del remitente
 * @param {string} fromName - Nombre del remitente
 * @param {string} subject - Asunto del mensaje
 * @param {string} message - Contenido del mensaje
 * @returns {Promise} - Promesa con el resultado del envío
 */
const sendContactEmail = async (fromEmail, fromName, subject, message) => {
  const emailSubject = `${subject} - Contacto desde EducStation`;

  const text = `
    Nuevo mensaje de contacto desde EducStation
    
    De: ${fromName} (${fromEmail})
    Asunto: ${subject}
    
    Mensaje:
    ${message}
    
    ---
    Este mensaje fue enviado desde el formulario de contacto de EducStation.
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
        .info-box {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }
        .message-box {
          background-color: #fff;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin: 15px 0;
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
          <h2>Nuevo Mensaje de Contacto</h2>
        </div>
        <div class="content">
          <div class="info-box">
            <p><strong>De:</strong> ${fromName}</p>
            <p><strong>Email:</strong> ${fromEmail}</p>
            <p><strong>Asunto:</strong> ${subject}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          </div>
          
          <h3>Mensaje:</h3>
          <div class="message-box">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          <p><strong>Responder a:</strong> <a href="mailto:${fromEmail}">${fromEmail}</a></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} EducStation. Mensaje enviado desde formulario de contacto.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Enviar a la cuenta de Gmail configurada
  const destinationEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'educcorp3@gmail.com';
  return await sendEmail(destinationEmail, emailSubject, text, html);
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendContactEmail
};