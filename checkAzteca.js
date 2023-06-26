const ping = require('ping');
const cron = require('node-cron');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
require('dotenv').config()

// Obtener la fecha y hora actual en la zona horaria 'America/Bogota'
const currentDate = moment().tz('America/Bogota');
const timestamp = currentDate.format();

// Dirección IP a la que se realizará el ping
const ipAddress = process.env.IP_ADDRESS;

// Configuración del correo electrónico
const emailConfig = {
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Coloca aquí tu dirección de correo electrónico
    pass: process.env.EMAIL_PASSWORD, // Coloca aquí tu contraseña
  },
};

// Función para enviar el correo electrónico de notificación
function enviarCorreo(notificacion) {
  const transporter = nodemailer.createTransport(emailConfig);
  const recipientEmails = process.env.EMAIL_RECIPIENTS.split(',');
  //console.log(process.env.EMAIL_RECIPIENTS);
  const mensaje = {
    from: emailConfig.auth.user,
    to: recipientEmails, // Coloca aquí la dirección de correo electrónico del destinatari
    subject: 'Falla en el enlace de Azteca',
    text: notificacion,
  };

  transporter.sendMail(mensaje, function (error, info) {
    if (error) {
      console.error('Error al enviar el correo:', error);
    } else {
      //console.log('Correo enviado:', info.response);
    }
  });
}

// Función para realizar el ping a la dirección IP
function hacerPing() {
  ping.sys.probe(ipAddress, function (isAlive) {
    const notificacion = `La dirección IP ${ipAddress} ${
      isAlive ? 'está en línea' : 'no está respondiendo'
    }.`;
    //console.log(notificacion);

    if (!isAlive) {
      console.log(notificacion, timestamp);
      enviarCorreo(notificacion);
    }
  });
}

// Realizar el ping cada hora
//cron.schedule('* * * * *', () => {  
  hacerPing();
//});